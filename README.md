# chapter-vtt
`chapter-vtt` turns a wall of text with timestamps into a WebVTT file for use in video chapters.

```
This is an example video description one might have

0:00 Chapter 1
0:03 Chapter 2
0:07 Chapter 3

Some more different text
```

turns into

```
WEBVTT - from chapter-vtt

00:00:00 --> 00:00:03
Chapter 1

00:00:03 --> 00:00:07
Chapter 2

00:00:07 --> 00:01:00
Chapter 3
```

***the 1 minute timestamp for the final chapter is the video's duration***

## Installation
```
npm i chapter-vtt
```

## Usage
```ts
import chaptervtt from 'chapter-vtt';

const vtt: string = chaptervtt(video.description, video.duration);
```

## Vidstack
If you're using [Vidstack](https://github.com/vidstack/player), it's very easy to integrate `chapter-vtt` and get slider chapters working.

```ts
// 'can-play' event on media-player
function onCanPlay(event) {
	const vtt: string = chaptervtt(video.description, video.duration);

	if (vtt.includes('-->')) { // check for a cue
		mediaPlayer.textTracks.add({
			type: 'vtt',
			kind: 'chapters',
			default: true,
			content: vtt
		});
	}
}
```

## License
chapter-vtt is licensed under the [MIT License](https://github.com/CosmicMedia/chapter-vtt/blob/master/LICENSE)
