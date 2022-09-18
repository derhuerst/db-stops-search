#!/usr/bin/env node

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
		_geo: {
			lat: stop.location.latitude,
			lng: stop.location.longitude,
		},
	})
}

export {
	normalizeStop,
}
