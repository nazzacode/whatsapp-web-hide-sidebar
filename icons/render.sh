#!/usr/bin/env bash
# icon.svg → icon-<size>.png
cd "$(dirname "$0")"
for s in 16 32 48 96 128; do nix run nixpkgs#librsvg -- -w $s -h $s icon.svg -o icon-$s.png; done
