# Fret Sprout

A friendly guitar fretboard game with all six strings and twelve frets, random note challenges, four timer settings, and personal bests saved per difficulty in browser storage. Wrong answers and timeouts end the round and reveal the answer. Standard tuning, high E at the top; enharmonic sharp/flat names share answer buttons. Hold the “Hold to see natural notes” button with a mouse, touch, or keyboard to reveal all C, D, E, F, G, A, and B positions while pressed.

## Development

Node.js 20.19+ or 22.12+ is required.

```sh
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173
```

## Validation

```sh
npm test
npm run build
```

No credentials or backend are needed. High scores are local to the browser; storage restrictions can prevent persistence. Fonts use Google Fonts with system fallbacks. On phones, all twelve frets fit on screen, note answers have touch-friendly targets, and the timer remains visible while playing.

## Play online with GitHub Pages

The `docs/` directory contains the production website. In GitHub, open Settings → Pages, choose **Deploy from a branch**, choose **main** and **/docs**, then Save. The game will be available at https://Lakindu199854.github.io/guitar-app/ after GitHub finishes deploying.

After changing the app, run `npm run build`, copy the contents of `dist/` into `docs/`, and commit the updated website. Vite uses relative asset paths so it works under the repository URL.
