#!/bin/bash

set -e
set -o pipefail
cd "$(dirname $0)"

MEILISEARCH_URL="${MEILISEARCH_URL:=http://localhost:7700}"
MEILISEARCH_INDEX="${MEILISEARCH_INDEX:=db-stops-search}"

wait_for_task () {
	local task_uid="$1"
	local task_name="$2"
	local sleep_secs="$3"
	local task_desc="$task_name (task $task_uid)"

	while true; do
		task="$(curl -fs "$MEILISEARCH_URL/tasks/$task_uid")"
		status="$(echo "$task" | jq -rc '.status')"
		if [ "$status" = 'failed' ]; then
			1>&2 echo "$task_desc failed:"
			echo "$task" | 1>&2 jq -r --tab
			exit 1
		fi
		if [ "$status" = 'succeeded' ]; then
			echo "$task_desc succeeded"
			break
		fi

		echo "waiting for $task_desc: $status"
		sleep 3
	done
}

task_id="$( \
	curl -fs -X PATCH "$MEILISEARCH_URL/indexes/$MEILISEARCH_INDEX/settings" -H 'Content-Type: application/json' --data-binary @meilisearch-index-config.json \
	| jq -rc '.taskUid' \
)"
wait_for_task "$task_id" "re-configuration" 1
# curl -fs "$MEILISEARCH_URL/indexes/$MEILISEARCH_INDEX/settings" | jq -r

import_src="$(node -p 'require.resolve("db-hafas-stations/full.ndjson")')"
task_id="$( \
	./normalize-for-search.js <"$import_src" \
	| pv -l \
	| curl -fs -X POST "$MEILISEARCH_URL/indexes/${MEILISEARCH_INDEX}/documents" -H 'Content-Type: application/x-ndjson' --data-binary '@-' | jq -rc '.taskUid' \
)"
wait_for_task "$task_id" "import" 3
