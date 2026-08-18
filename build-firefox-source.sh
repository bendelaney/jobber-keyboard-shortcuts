#!/usr/bin/env bash
# Builds the source-code archive that addons.mozilla.org requires alongside the
# XPI (AMO reviewers need the unminified sources plus the build steps that
# produce content.js). Output: repo-root zip.
set -euo pipefail
cd "$(dirname "$0")"

./sync-extension.sh   # ensure content.js is current before packaging

OUT="jobber-keyboard-shortcuts-firefox-source.zip"
rm -f "$OUT"
zip -rq "$OUT" \
    README.md \
    jobber-keyboard-shortcuts.js \
    sync-extension.sh \
    build-firefox-xpi.sh \
    build-firefox-source.sh \
    build-all.sh \
    firefox-extension \
    chrome-extension/content.js \
    -x '*.DS_Store'

echo "Built $OUT"
unzip -l "$OUT"
