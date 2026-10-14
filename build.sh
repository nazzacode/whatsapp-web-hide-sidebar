#!/usr/bin/env bash
# build xpi; --install copies into Zen profile (Zen must be closed, unsigned xpi needs xpinstall.signatures.required=false)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p dist && rm -f dist/whatsapp-web-hide-sidebar.xpi
python3 -m zipfile -c dist/whatsapp-web-hide-sidebar.xpi manifest.json sidebar.js sidebar.css
echo "dist/whatsapp-web-hide-sidebar.xpi"
if [[ "${1:-}" == "--install" ]]; then
  # default profile = profiles.ini [Install*] Default= (not glasslab/test profiles)
  base=~/.var/app/app.zen_browser.zen/.zen
  [[ -d $base ]] || base=~/.zen
  def=$(awk -F= '/^\[Install/{i=1;next} /^\[/{i=0} i&&$1=="Default"{print $2;exit}' "$base/profiles.ini")
  [[ -n "$def" && -d "$base/$def" ]] || { echo "Zen default profile not found in $base" >&2; exit 1; }
  prof="$base/$def/extensions"
  mkdir -p "$prof"
  if pgrep -x zen >/dev/null || pgrep -f 'app.zen_browser.zen' >/dev/null; then echo "close Zen first" >&2; exit 1; fi
  cp dist/whatsapp-web-hide-sidebar.xpi "$prof/whatsapp-web-hide-sidebar@nazzacode.xpi.tmp" && mv "$prof/whatsapp-web-hide-sidebar@nazzacode.xpi.tmp" "$prof/whatsapp-web-hide-sidebar@nazzacode.xpi"
  echo "installed → $prof"
fi
