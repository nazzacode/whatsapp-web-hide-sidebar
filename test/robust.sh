#!/usr/bin/env bash
# robustness layouts (robust.html) in headless chromium → PASS/FAIL per check; FIREFOX=1 → also headless firefox (bidi.mjs)
cd "$(dirname "$0")"
L="rtl rtl@517 minwidth@517 narrow@400 placeholder placeholder-shown anim overlay closechat"
nix-shell -p chromium --run "PAGE=robust.html node cdp.mjs \$(which chromium) $L"; rc=$?
if [[ -n "${FIREFOX:-}" ]]; then node bidi.mjs "$(command -v firefox)" $L || rc=1; fi
exit $rc
