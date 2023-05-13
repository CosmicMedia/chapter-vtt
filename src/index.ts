import type { Chapter } from "./typings/chapter";

import { writeCues } from "./writer.js";
import { parseText } from "./parser.js";

export * from './parser.js';
export * from './writer.js';

/**
 * Generates a WebVTT file from a video description.
 * 
 * @param description the text to parse chapters from
 * @param duration total duration of the video in seconds
 * @returns {string} WebVTT file of chapters
 */
export default function generateVtt(description: string, duration: number): string {
	const result: Chapter[] = parseText(description)
		.filter(t => t.seconds <= duration) // remove chapters defined after the video's over
		.sort((a, b) => a.seconds - b.seconds); // sort chapters lowest to highest
	
	const cues = writeCues(result, duration);

	// define the WebVTT header and add the chapter cues
	const vtt = `WEBVTT - from chapter-vtt\n\n${cues}`;
	
	return vtt;
}
