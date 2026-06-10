#!/usr/bin/env bash
# Syncs the canonical userscript into the Chrome extension's content script.
#
# The bookmarklet file (jobber-keyboard-shortcuts.js) is the SINGLE SOURCE OF
# TRUTH for the shortcut logic. Chrome's Manifest V3 forbids fetching/eval'ing
# remote code, so the extension must bundle the script locally. Rather than
# hand-maintain a third copy, we copy it here. Run this after any change to the
# shortcut logic (CI also verifies the copy is in sync — see
# .github/workflows/sync-extension.yml).
set -euo pipefail
cd "$(dirname "$0")"

SRC="jobber-keyboard-shortcuts.js"
DEST="chrome-extension/content.js"

{
  echo "// ============================================================"
  echo "// AUTO-GENERATED — DO NOT EDIT BY HAND."
  echo "// Source of truth: $SRC (run ./sync-extension.sh to regenerate)."
  echo "// ============================================================"
  cat "$SRC"
} > "$DEST"

echo "Synced $SRC -> $DEST"
