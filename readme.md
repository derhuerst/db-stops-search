# db-stops-search

**Search through all [stops/stations known by Deutsche Bahn's HAFAS API](https://npmjs.com/package/db-hafas-stations).**

[![npm version](https://img.shields.io/npm/v/db-stops-search.svg)](https://www.npmjs.com/package/db-stops-search)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/db-stops-search.svg)
![minimum Node.js version](https://img.shields.io/node/v/db-stops-search.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)

Formats and imports the stops into a [Meilisearch](https://meilisearch.com) instance.


## Installation

This project assumes that you have the following tools installed and in your `$PATH`:

- `bash`
- [`curl`](https://curl.se/)
- [`node` & `npm`](https://nodejs.org/en/)
- [`jq`](https://stedolan.github.io/jq/)
- [`pv`](https://linux.die.net/man/1/pv)


## Usage

First, configure & run a [Meilisearch](https://meilisearch.com) instance.

Then use `db-stops-search` to import data into it:

```shell
git clone https://github.com/derhuerst/db-stops-search.git
cd db-stops-search
npm install

# configure how to connect to Meilisearch (optional):
export MEILISEARCH_URL="https://my-meilisearch-instance.example.org"
# configure the name of the search index to create (defaults to "db-stops-search"):
export MEILISEARCH_INDEX="db-stops-2022-08-17"

# import the data into Meilisearch
npm run build
```

The import process might look like this:

[![asciicast demo of the import process](https://asciinema.org/a/522158.svg)](https://asciinema.org/a/522158)

If it succeeded and you're not running Meilisearch in production mode, you can access its [search preview](https://docs.meilisearch.com/learn/what_is_meilisearch/search_preview.html) in the browser:

![demo video of Meilisearch's search preview with db-stops-search data](docs/demo.mov)


## Contributing

If you have a question or need support using `db-stops-search`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, use [the issues page](https://github.com/derhuerst/db-stops-search/issues).
