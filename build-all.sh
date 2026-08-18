#!/usr/bin/env bash
# Regenerates every shipped artifact from the canonical userscript.
# Run this after ANY change to the shortcut logic, then commit the results.
#
#   chrome-extension/content.js   +  firefox-extension/content.js   (sync)
#   jobber-keyboard-shortcuts-extension.zip                         (Chrome Web Store)
#   jobber-keyboard-shortcuts-firefox.xpi                           (AMO package)
#   jobber-keyboard-shortcuts-firefox-source.zip                    (AMO source review)
set -euo pipefail
cd "$(dirname "$0")"

./build-zip.sh            > /dev/null
./build-firefox-xpi.sh    > /dev/null
./build-firefox-source.sh > /dev/null

VERSION=$(sed -n 's/.*"version": "\(.*\)",/\1/p' chrome-extension/manifest.json | head -1)
FF_VERSION=$(sed -n 's/.*"version": "\(.*\)",/\1/p' firefox-extension/manifest.json | head -1)

if [[ "$VERSION" != "$FF_VERSION" ]]; then
  echo "WARNING: chrome manifest is $VERSION but firefox manifest is $FF_VERSION" >&2
fi

echo "Built all artifacts at v$VERSION:"
ls -1 jobber-keyboard-shortcuts-extension.zip \
      jobber-keyboard-shortcuts-firefox.xpi \
      jobber-keyboard-shortcuts-firefox-source.zip
