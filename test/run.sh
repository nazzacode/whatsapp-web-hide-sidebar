#!/usr/bin/env bash
# headless chromium over mock layouts → JSON line per layout
cd "$(dirname "$0")"
nix-shell -p chromium --run "node cdp.mjs \$(which chromium) flex outer-rail grid drawer nochat"
