Hide the WhatsApp Web sidebar (chat list + nav rail). Firefox/Zen extension.

- `Alt+Shift+S` toggle (remembered)
- mouse at left edge → sidebar peeks back; leave it → hides
- no chat open → sidebar always shown

WhatsApp classes are hashed, so `wa.js` finds `#side`/`#main` by id, tags their common-ancestor columns with `data-waf-*`, and `wa.css` hides by tag.

Build `./build.sh` → `dist/wa-focus.xpi`. Install `./build.sh --install` (Zen closed).
