#!/usr/bin/env bash
# build xpi; --install copies into Zen profile (Zen must be closed, unsigned xpi needs xpinstall.signatures.required=false)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p dist && rm -f dist/whatsapp-web-hide-sidebar.xpi
python3 -m zipfile -c dist/whatsapp-web-hide-sidebar.xpi manifest.json sidebar.js sidebar.css
echo "dist/whatsapp-web-hide-sidebar.xpi"
if [[ "${1:-}" == "--install" ]]; then
  # profile = the one already holding our unsigned transparent-zen xpi
  ref=$(find ~/.var/app/app.zen_browser.zen ~/.zen -maxdepth 4 -name 'transparent-zen@nazzacode.xpi' 2>/dev/null | head -1)
  [[ -n "$ref" ]] || { echo "Zen profile extensions dir not found" >&2; exit 1; }
  prof=$(dirname "$ref")
  if pgrep -x zen >/dev/null || pgrep -f 'app.zen_browser.zen' >/dev/null; then echo "close Zen first" >&2; exit 1; fi
  cp dist/whatsapp-web-hide-sidebar.xpi "$prof/whatsapp-web-hide-sidebar@nazzacode.xpi.tmp" && mv "$prof/whatsapp-web-hide-sidebar@nazzacode.xpi.tmp" "$prof/whatsapp-web-hide-sidebar@nazzacode.xpi"
  echo "installed → $prof"
fi
