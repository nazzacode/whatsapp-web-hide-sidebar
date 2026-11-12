#!/usr/bin/env bash
# demo.html → 1280x800 store screenshots (sidebar shown / hidden)
cd "$(dirname "$0")"
shot() { chromium --headless --no-sandbox --hide-scrollbars --window-size=1280,800 --virtual-time-budget=2000 --screenshot="$PWD/$1" "file://$PWD/demo.html$2" 2>/dev/null; }
export -f shot
nix-shell -p chromium --run 'shot screenshot-1-shown.png ""; shot screenshot-2-hidden.png "?hidden=1"'
