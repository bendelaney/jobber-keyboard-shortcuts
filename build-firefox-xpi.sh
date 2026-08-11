#!/usr/bin/env bash
# Builds a Firefox add-on package from the extension's runtime files.
# Output: repo-root XPI, suitable for submission to addons.mozilla.org.
set -euo pipefail
cd "$(dirname "$0")"

./sync-extension.sh   # ensure content.js is current before packaging

OUT="jobber-keyboard-shortcuts-firefox.xpi"
rm -f "$OUT"
( cd firefox-extension && zip -rq "../$OUT" \
    manifest.json content.js popup.html popup.js icon.svg \
    -x '*.DS_Store' )

echo "Built $OUT"
unzip -l "$OUT"
