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
		console.warn(`Unexpected timestamp format at ${timestamp}`)
		
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
 * Returns a WebVTT friendly timestamp.
 * 
 * @param timestamp
 * @returns {string} WebVTT friendly timestamp
 */
function handleVttTimestamp(timestamp: string): string {
	const split: string[] = timestamp.split(':');
	
	let reconstructed = '';
	
	let index: number = 0;
	
	for (let part of split) {
		index++;
		
		// add a 0 before the number
		part = part.length == 1 ? `0${part}` : part;
		
		reconstructed += `${part}${index == split.length ? '' : ':'}`;
	}
	
	if (split.length == 3) {
		return reconstructed;
	}
	
	return `00:${reconstructed}`;
}

/**
 * Writes the WebVTT cues.
 * 
 * @param timestamps array of Chapters @see parseText
 * @param duration total duration of the video in seconds
 * @returns {string} chaptuer cues in WebVTT
 */
function writeCues(timestamps: Chapter[], duration: number): string {
	// converts the duration into a timestamp with milliseconds
	// i.e. 00:01:42.41
	const endTimestamp = new Date(duration * 1000).toISOString().slice(11, 22);
	
	let vtt: string = '';
	
	let index: number = 0;
	
	for (const timestamp of timestamps) {
		index++;
		
		if (index == 1 && timestamp.seconds !== 0) {
			console.warn('First chapter definition began before 0. Resetting');

			timestamp.timestamp = '0:00';
			timestamp.seconds = 0;
		}
		
		const end: string = index == timestamps.length ? endTimestamp : handleVttTimestamp(timestamps[index].timestamp);

		vtt += `${handleVttTimestamp(timestamp.timestamp)} --> ${end}\n${timestamp.name}\n\n`;
	}
	
	return vtt;
}

/**
 * Parses text (video description) into Chapters.
 * 
 * @see Chapter
 * @param description the text to parse chapters from
 * @returns {Chapter[]} array of Chapter (name, timestamp, seconds)
 */
function parseText(description: string): Chapter[] {
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

/**
 * Generates a WebVTT file from a video description.
 * 
 * @param description the text to parse chapters from
 * @param duration total duration of the video in seconds
 * @returns {string} WebVTT file of chapters
 */
export default function generateVtt(description: string, duration: number): string {
	let result: Chapter[] = parseText(description)
		.filter(t => t.seconds <= duration) // remove chapters defined after the video's over
		.sort((a: Chapter, b: Chapter) => a.seconds - b.seconds); // sort chapters lowest to highest
	
	// define the WebVTT header and add the chapter cues
	let vtt = `WEBVTT - from chapter-vtt\n\n${writeCues(result, duration)}`;
	
	return vtt;
}
