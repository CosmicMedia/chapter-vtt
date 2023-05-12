import { TimestampResult } from "./typings/result";

export function parseTimestamp(timestamp: string): number | null {
	let split: string[] = timestamp.split(':');
	
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

function handleVttTimestamp(timestamp: string): string {
	const split: string[] = timestamp.split(':');
	
	let reconstructed = '';
	
	let index: number = 0;
	
	for (let part of split) {
		index++;
		
		part = part.length == 1 ? `0${part}` : part;
		
		reconstructed += `${part}${index == split.length ? '' : ':'}`;
	}
	
	if (split.length == 3) {
		return reconstructed;
	}
	
	return `00:${reconstructed}`;
}

function writeCues(timestamps: TimestampResult[], duration: number): string {
	const endTimestamp = new Date(duration * 1000).toISOString().slice(11, 22);
	
	let vtt: string = '';
	
	let index: number = 0;
	
	for (const timestamp of timestamps) {
		index++;
		
		let end: string;
		
		if (index == timestamps.length) {
			end = endTimestamp;
		} else end = handleVttTimestamp(timestamps[index].timestamp);
		
		vtt += `${handleVttTimestamp(timestamp.timestamp)} --> ${end}\n${timestamp.name}\n\n`;
	}
	
	return vtt;
}

function parseText(description: string): TimestampResult[] {
	const lines: string[] = description.split('\n');
	
	const timestamps: TimestampResult[] = [];
	
	// the format we're looking for is
	// 0:13 Chapter Name
	
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

export default function generateVtt(description: string, duration: number): string {
	let result: TimestampResult[] = parseText(description)
		.filter(t => t.seconds <= duration)
		.sort((a: TimestampResult, b: TimestampResult) => a.seconds - b.seconds);
	
	let vtt = `WEBVTT - from chapter-vtt\n\n${writeCues(result, duration)}`;
	
	return vtt;
}
