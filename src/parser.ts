import { Chapter } from "./typings/chapter";

const TIMESTAMP_SCHEME = /([0-9]?[0-9]:)?([0-9]?[0-9]):([0-9]?[0-9])/;

/**
 * Extracts a timestamp from a string.
 * 
 * @param timestamp 
 * @returns {string} the timestamp found, or null if none
 */
export function extractTimestamp(timestamp: string): string | null {
	const match = timestamp.match(TIMESTAMP_SCHEME);

	if (!match) {
		return null;
	}

	return match[0];
}

/**
 * Parses a timestamp and returns its value in seconds
 * 
 * @param timestamp 
 * @returns {number} value in seconds, or null
 */
export function parseTimestamp(timestamp: string | null): number | null {
	// timestamp is null, just move on
	if (!timestamp) {
		return null;
	}

	// we'll split the string based on the colon that separates hours, minutes, and seconds
	const split: string[] = timestamp.split(':');
	
	// fail silently
	if (split.length < 2 || split.length > 3) {
		console.warn(`Unexpected timestamp format at ${timestamp}`);
		
		return null;
	}
	
	let seconds: number = 0;
	let multiplier: number = 1;
	
	while (split.length > 0) {
		const pop = split.pop();
		
		if (!pop) {
			continue;
		}
		
		seconds += multiplier * parseInt(pop, 10);
		multiplier *= 60;
	}
	
	return seconds;
}

/**
 * Parses text (video description) into Chapters.
 * 
 * @see Chapter
 * @param description the text to parse chapters from
 * @returns {Chapter[]} array of Chapter (name, timestamp, seconds)
 */
export function parseText(description: string): Chapter[] {
	// the format we're looking for is
	// 0:13 Chapter Name
	const lines: string[] = description.split('\n');
	
	const timestamps: Chapter[] = [];
	
	for (const line of lines) {
		const split = line.split(' ');
		
		// we need at least 2 space-separated items (the timestamp, and the name)
		if (split.length < 2) {
			continue;
		}
		
		const _timestamp = split[0];
		
		if (!_timestamp.includes(':')) {
			continue;
		}

		const timestamp = extractTimestamp(_timestamp);
		
		const seconds = parseTimestamp(timestamp);
		
		// seconds will be null if timestamp is null, but
		// typescript doesn't realize that
		if (seconds == null || timestamp == null) {
			continue;
		}
		
		// remove the timestamp from the space split
		split.shift();
		
		const name = split.join(' ');
		
		timestamps.push({ name, timestamp, seconds });
	}
	
	return timestamps;
}
