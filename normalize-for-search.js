#!/usr/bin/env node

import {parse, stringify} from 'ndjson'
import {Transform} from 'node:stream'
import {pipeline} from 'node:stream/promises'
import cleanStationName from 'db-clean-station-name/lib/with-location.js'

const normalizeStop = (stop, _, cb) => {
	// todo: validate stop?

	const {
		short: cleanedShortenedName,
		full: cleanedName,
	} = cleanStationName(stop.name, stop.location)
	const context = (
		cleanedShortenedName && cleanedName.length > cleanedShortenedName.length
		&& cleanedName.replace(cleanedShortenedName, '').replace(/^[-,\s]+/, '').replace(/[-,\s]+$/, '')
	)

	cb(null, {
		id: stop.id,
		name: stop.name,
		weight: stop.weight,
		normalizedName: cleanedShortenedName || cleanedName,
		normalizedContext: context,
	})
}

try {
	await pipeline(
		process.stdin,
		parse(),
		new Transform({
			objectMode: true,
			transform: normalizeStop,
		}),
		stringify(),
		process.stdout,
	)
} catch (err) {
	if (err.code === 'EPIPE') process.exit()
	throw err
}
