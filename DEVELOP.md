Notes for working on the extension. User-facing docs: `README.md`.

## How it works

WhatsApp's classes are hashed, so `sidebar.js` finds `#side`/`#main` by id, tags `#side`'s column and the nav rail (narrow full-height sibling) with `data-whs-*`, and `sidebar.css` hides by tag. Grid parents that don't reflow fall back to flex. While hidden, the row's `min-width` (~750px) is lifted so the chat fits a narrow window, and empty placeholder columns are hidden (their borders showed as stray lines). The button is a fixed overlay outside `#app`, so React re-renders can't remove it.

## Develop

- Build `./build.sh` → `dist/whatsapp-web-hide-sidebar-firefox.xpi` (MV2) + `-chrome.zip` (MV3, manifest derived)
- Install into Zen `./build.sh --install` (Zen closed, unsigned)
- Robustness `test/robust.sh` (RTL, min-width, narrow, drawer slot filled while hidden, viewer overlay, close chat); `FIREFOX=1` also runs headless Firefox
- Test `test/run.sh` → headless Chromium over mock layouts (flex, outer rail, grid, drawer, no chat)
- Store assets `store/` (listing text, AMO metadata, `shots.sh` → screenshots from `demo.html`)
- Sign + submit to AMO: `web-ext sign --source-dir dist/firefox --channel listed --amo-metadata store/amo.json`
- Desktop screenshots (`store/hero.png`, `before.png`, `after.png`): real WhatsApp Web with every name, message and photo replaced, composited into stock Firefox windows on a headless sway desktop
- Privacy: runs only on `web.whatsapp.com`, reads no messages or contacts, makes no network requests, stores one value (hidden or shown) in the page's local storage
- Manual Chromium install: `-chrome.zip` from Releases → unzip → `chrome://extensions` → Developer mode → Load unpacked
