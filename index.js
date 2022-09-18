import {createRequire} from 'node:module'
const require = createRequire(import.meta.url)

import {fetch} from 'cross-fetch'
import {pipeline} from 'node:stream/promises'
import {Transform} from 'node:stream'
import {createReadStream} from 'node:fs'
import {parse as parseNdjson, stringify as formatNdjson} from 'ndjson'
import {normalizeStop} from './lib/normalize-for-search.js'
// todo: use import assertions once they're supported by Node.js & ESLint
// https://github.com/tc39/proposal-import-assertions
const pkg = require('./package.json')
const dbHafasStationsPath = require.resolve('db-hafas-stations/full.ndjson')

const fetchJson = async (baseUrl, path, curlOpts = {}) => {
	const url = new URL(baseUrl)
	url.pathname = path

	const res = await fetch(url, {
		...curlOpts,
		headers: {
			...(curlOpts.headers || {}),
			'accept': 'application/json',
			'user-agent': pkg.homepage || pkg.name,
		},
	})
	if (!res.ok) {
		const err = new Error(`${url.href}: ${res.status} ${res.statusText}`)
		err.res = res
		throw err
	}
	const body = await res.json()
	return body
}

const waitForTask = async (baseUrl, id, checkEvery = 1000) => {
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const task = await fetchJson(baseUrl, `/tasks/${id}`)
		if (task.status === 'succeeded') {
			return task
		}
		if (task.status === 'failed') {
			const err = new Error(`task ${task.taskUid} failed`)
			err.task = task
			throw err
		}
		// wait
		await new Promise(resolve => setTimeout(resolve, checkEvery))
	}
}

const importDbStopsIntoMeilisearch = async (baseUrl, indexName, todo) => {
	const {
		taskUid: reconfigureTaskId,
	} = await fetchJson(baseUrl, `/indexes/${indexName}/settings`, {
		method: 'PATCH',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			// todo
		}),
	})
	await waitForTask(baseUrl, reconfigureTaskId, 500)
	console.info(`index ${indexName} (re-)configured ✓`)

	let body = []
	await pipeline(
		createReadStream(dbHafasStationsPath),
		parseNdjson(),
		new Transform({
			objectMode: true,
			transform: normalizeStop,
		}),
		formatNdjson(),
		// for some reason, streaming the body doesn't work :( so we collect it here
		// todo: stream the body
		new require('stream').Writable({
			write: (chunk, _, cb) => {
				body.push(chunk)
				cb()
			},
		}),
	)
	body = Buffer.concat(body)

	const {
		taskUid: importTaskId,
	} = await fetchJson(baseUrl, `/indexes/${indexName}/documents`, {
		method: 'POST',
		headers: {
			'content-type': 'application/x-ndjson',
		},
		body: body,
	})

	await waitForTask(baseUrl, importTaskId, 1000)
	console.info(`stops imported into ${indexName} ✓`)
}

export {
	importDbStopsIntoMeilisearch,
}
