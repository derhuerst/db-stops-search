#!/usr/bin/env node

import {parseArgs} from 'node:util'

// todo: use import assertions once they're supported by Node.js & ESLint
// https://github.com/tc39/proposal-import-assertions
import {createRequire} from 'node:module'
const require = createRequire(import.meta.url)
const pkg = require('./package.json')

const {
	values: flags,
	// positionals: args,
} = parseArgs({
	options: {
		help: {
			type: 'boolean',
			short: 'h',
		},
		version: {
			type: 'boolean',
			short: 'v',
		},
		'meilisearch-base-url': {
			type: 'string',
			short: 'u',
		},
		'meilisearch-index': {
			type: 'string',
			short: 'i',
		},
	},
	// allowPositionals: true,
})

if (flags.help) {
	process.stdout.write(`
Usage:
    import-db-stops-into-meilisearch [options]
Options:
    --meilisearch-base-url    -u  Base URL of the Meilisearch instance.
                                    Default: $MEILISEARCH_URL, otherwise http://127.0.0.1:7700
    --meilisearch-index       -i  Name of the Meilisearch index to create.
                                    Default: $MEILISEARCH_INDEX, otherwise db-stops-search
Examples:
    import-db-stops-into-meilisearch
\n`)
	process.exit(0)
}

if (flags.version) {
	process.stdout.write(`${pkg.name} v${pkg.version}\n`)
	process.exit(0)
}

import {importDbStopsIntoMeilisearch} from './index.js'

const baseUrl = (
	flags['meilisearch-base-url']
	|| process.env.MEILISEARCH_URL
	// todo: use localhost:7000 once https://github.com/meilisearch/meilisearch/issues/2782 is fixed
	|| 'http://127.0.0.1:7700'
)

const indexName = (
	flags['meilisearch-index']
	|| process.env.MEILISEARCH_INDEX
	// todo [breaking]: change to db-stops
	|| 'db-stops-search'
)

await importDbStopsIntoMeilisearch(baseUrl, indexName)
