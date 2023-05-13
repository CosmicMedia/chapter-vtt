import { Chapter } from "./typings/chapter";


/**
 * Parses a timestamp and returns its value in seconds
 * 
 * @param timestamp 
 * @returns {number} value in seconds, or null
 */
export function parseTimestamp(timestamp: string): number | null {
	// we'll split the string based on the colon that separates hours, minutes, and seconds
	let split: string[] = timestamp.split(':');
	
	// fail silently
	if (split.length < 2 || split.length > 3) {
		console.warn(`Unexpected timestamp format at ${timestamp}`);
		
		return null;
	}
	
	let seconds: number = 0;	
	let m: number = 1;
	
	while (split.length > 0) {
		const pop = split.pop();
		
		if (!pop) {
			continue;
		}
		
		seconds += m * parseInt(pop, 10);
		m *= 60;
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
		
		const timestamp = split[0];
		
		if (!timestamp.includes(':')) {
			continue;
		}
		
		const seconds = parseTimestamp(timestamp);
		
		if (seconds == null) {
			continue;
		}
		
		// remove the timestamp from the space split
		split.shift();
		
		const name = split.join(' ');
		
		timestamps.push({ name, timestamp, seconds });
	}
	
	return timestamps;
}
