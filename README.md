# pwnt-ui

Offline UI shell for the pwnt.net menu — the game's `index.html` with the game
taken out, so it can be edited in a browser IDE (Bolt/StackBlitz, CodeSandbox).

```bash
npm install
npm run dev
```

## What this is

`index.html` is the real client's markup and stylesheet, byte for byte, with
two changes:

- the Google Fonts `<link>` is gone; Rajdhani is vendored in `public/fonts`
- `<script src="/src/main.ts">` is replaced by `<script src="/src/ui.js">`

`src/ui.js` is a stand-in for the whole game client. It fills the menu with
canned friends, chat, leaderboard, shop and stash data so every pane renders
populated, and wires the tabs, the DEPLOY flow and the settings sliders.

## What this is NOT

- **No game.** No three.js, no wasm, no renderer. The `#app` canvas is hidden
  and the mode cards do nothing.
- **No network. At all.** No WebSocket, no CDN, no fonts fetched. If you add
  something that phones home, this stops being useful for offline editing.
- **Not a source of truth.** Changes made here must be carried back into the
  real client by hand — `web/index.html` and `web/src/` in the game repo.

Assets are limited to the 16 files the markup actually references, plus the
font. The 3D models, textures and sounds (~79 MB) are deliberately absent.

## Carrying work back

Edits to `index.html` markup and CSS port straight across — the file is the
same shape as the real one. Edits to `src/ui.js` do **not**: the real client
builds those views from live server data in `web/src/main.ts`.
