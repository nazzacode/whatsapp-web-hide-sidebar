#!/usr/bin/env bash
# build xpi; --install copies into Zen profile (Zen must be closed, unsigned xpi needs xpinstall.signatures.required=false)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p dist && rm -f dist/wa-focus.xpi
python3 -m zipfile -c dist/wa-focus.xpi manifest.json wa.js wa.css
echo "dist/wa-focus.xpi"
if [[ "${1:-}" == "--install" ]]; then
  prof=$(dirname "$(find ~/.var/app/app.zen_browser.zen ~/.zen -maxdepth 4 -name 'transparent-zen@nazzacode.xpi' 2>/dev/null | head -1)")
  [[ -d "$prof" ]] || { echo "Zen profile extensions dir not found" >&2; exit 1; }
  pgrep -x zen || pgrep -f 'app.zen_browser.zen' >/dev/null && { echo "close Zen first" >&2; exit 1; }
  cp dist/wa-focus.xpi "$prof/wa-focus@nazzacode.xpi.tmp" && mv "$prof/wa-focus@nazzacode.xpi.tmp" "$prof/wa-focus@nazzacode.xpi"
  echo "installed → $prof"
fi
