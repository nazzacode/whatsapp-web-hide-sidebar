#!/usr/bin/env bash
# build dist/*-firefox.xpi (MV2, manifest.json as is) + dist/*-chrome.zip (MV3, derived)
# --install copies the xpi into the Zen profile (Zen must be closed, unsigned xpi needs xpinstall.signatures.required=false)
set -euo pipefail
cd "$(dirname "$0")"
name=whatsapp-web-hide-sidebar
files=(sidebar.js sidebar.css icons/icon-{16,32,48,96,128}.png)
[[ -f icons/icon-128.png ]] || ./icons/render.sh
rm -rf dist && mkdir -p dist/{firefox,chrome}/icons
for b in firefox chrome; do cp sidebar.js sidebar.css dist/$b/ && cp icons/icon-*.png dist/$b/icons/; done
cp manifest.json dist/firefox/
(cd dist/firefox && python3 -m zipfile -c "../$name-firefox.xpi" manifest.json "${files[@]}")
# Chrome: MV3, no gecko block
python3 -c '
import json, sys
m = json.load(open("manifest.json"))
m["manifest_version"] = 3
m.pop("browser_specific_settings")
json.dump(m, open("dist/chrome/manifest.json", "w"), indent=2)'
(cd dist/chrome && python3 -m zipfile -c "../$name-chrome.zip" manifest.json "${files[@]}")
ls dist/*.xpi dist/*.zip
if [[ "${1:-}" == "--install" ]]; then
  # default profile = profiles.ini [Install*] Default= (not glasslab/test profiles)
  base=~/.var/app/app.zen_browser.zen/.zen
  [[ -d $base ]] || base=~/.zen
  def=$(awk -F= '/^\[Install/{i=1;next} /^\[/{i=0} i&&$1=="Default"{print $2;exit}' "$base/profiles.ini")
  [[ -n "$def" && -d "$base/$def" ]] || { echo "Zen default profile not found in $base" >&2; exit 1; }
  prof="$base/$def/extensions"
  mkdir -p "$prof"
  if pgrep -x zen >/dev/null; then echo "close Zen first" >&2; exit 1; fi
  cp "dist/$name-firefox.xpi" "$prof/$name@nazzacode.xpi.tmp" && mv "$prof/$name@nazzacode.xpi.tmp" "$prof/$name@nazzacode.xpi"
  echo "installed → $prof"
fi
