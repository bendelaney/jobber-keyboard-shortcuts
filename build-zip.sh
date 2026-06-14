#!/usr/bin/env bash
# Builds the Chrome Web Store upload package from the extension's runtime files
# (excludes docs, store art, and dev files). Output: repo-root zip.
set -euo pipefail
cd "$(dirname "$0")"

./sync-extension.sh   # ensure content.js is current before packaging

OUT="jobber-keyboard-shortcuts-extension.zip"
rm -f "$OUT"
( cd chrome-extension && zip -rq "../$OUT" \
    manifest.json content.js popup.html popup.js icons \
    -x '*.DS_Store' )

echo "Built $OUT"
unzip -l "$OUT"
