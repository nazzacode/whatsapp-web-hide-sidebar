Hide the WhatsApp Web sidebar (chat list + nav rail) so the open chat fills the window. Firefox/Zen extension.

- **Button** at the left of the chat header toggles it (remembered across reloads)
- `Alt+Shift+S` toggles too
- no chat open → sidebar always shown, button hidden
- right-hand drawers (contact info, search) are left alone

WhatsApp's classes are hashed, so `sidebar.js` finds `#side`/`#main` by id, tags `#side`'s column and the nav rail (narrow full-height sibling) with `data-whs-*`, and `sidebar.css` hides by tag. Grid parents that don't reflow fall back to flex. The button is a fixed overlay outside `#app`, so React re-renders can't remove it.

- Build `./build.sh` → `dist/whatsapp-web-hide-sidebar.xpi`
- Install `./build.sh --install` (Zen closed; copies next to the unsigned transparent-zen xpi)
- Test `test/run.sh` → headless Chromium over mock layouts (flex, outer rail, grid, drawer, no chat)
