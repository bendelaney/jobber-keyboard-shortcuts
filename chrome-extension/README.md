# Jobber Keyboard Shortcuts — Chrome Extension

This is the Chrome (and Edge / Brave / any Chromium browser) extension version of
the [Jobber Keyboard Shortcuts](../README.md) userscript. It adds the same
keyboard shortcuts to [secure.getjobber.com](https://secure.getjobber.com) — no
userscript manager required.

**Most people should just [install it from the Chrome Web Store](https://chrome.google.com/webstore/detail/REPLACE_WITH_EXTENSION_ID)**
(one click, auto-updates). _(That link is a placeholder until the extension is
published — see "Install it (the polished way)" below.)_ The rest of this file
covers manual install and how the extension is built.

> The shortcut logic lives in the project's canonical file,
> [`../jobber-keyboard-shortcuts.js`](../jobber-keyboard-shortcuts.js).
> `content.js` here is **auto-generated** from it by
> [`../sync-extension.sh`](../sync-extension.sh) — don't edit `content.js` by hand.

## What's in here

| File | Purpose |
|------|---------|
| `manifest.json` | Manifest V3 config (matches `secure.getjobber.com`, injects the content script) |
| `content.js` | The shortcut logic, injected into Jobber pages (auto-generated) |
| `popup.html` / `popup.js` | Toolbar popup showing a platform-aware shortcut reference |
| `icons/` | Toolbar / store icons (16, 32, 48, 128 px) |

## Install it (the quick, free way — unpacked)

This works today, costs nothing, and is great for personal use or trying it out.

1. Download/clone this repository (or just the `chrome-extension/` folder).
2. Open **`chrome://extensions`** in Chrome.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select this **`chrome-extension`** folder.
5. Go to [secure.getjobber.com](https://secure.getjobber.com). The shortcuts are
   live. Click the puzzle-piece toolbar icon → pin **Jobber Keyboard Shortcuts**
   to see the shortcut reference popup, or press **`⌘ /`** (Mac) / **`Ctrl /`**
   (Windows) on any Jobber page.

**Note:** unpacked extensions don't auto-update — to get a new version, pull the
latest code and click the refresh icon on the extension card. Chrome may also
show a "Disable developer-mode extensions" nudge on startup; that's expected for
unpacked extensions.

## Install it (the polished way — Chrome Web Store)

Publishing to the Chrome Web Store gives everyone a one-click install and
automatic updates. It requires:

- A one-time **$5** Chrome Web Store developer registration fee.
- Zipping this folder and uploading it at the
  [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
- A store listing (description, screenshots, a privacy note — this extension
  collects **no** data and uses no special permissions, which keeps review easy).
- A review by Google, typically a few days.

**Everything you need is already prepared** — see
**[`STORE_LISTING.md`](STORE_LISTING.md)** for copy-paste-ready listing text,
privacy answers, and a step-by-step submission checklist. The store images live
in [`store-assets/`](store-assets/), and the upload package is built by
[`../build-zip.sh`](../build-zip.sh):

```bash
./build-zip.sh   # from the repo root → jobber-keyboard-shortcuts-extension.zip
```

## Safari?

Safari can run this via Apple's converter, but it's more involved: it requires a
Mac with Xcode (`xcrun safari-web-extension-converter chrome-extension/`), and
**distributing** it to others requires a paid Apple Developer account ($99/year).
For a single Mac you can run the converted app locally without publishing. See
the root [README](../README.md) for the userscript route, which remains the
easiest option on Safari.

## How it relates to the userscript

Same shortcuts, same behavior — just delivered as a native extension instead of
through a userscript manager. The content script runs in the page's main world
(`"world": "MAIN"`), faithfully matching how the userscript ran under
`@grant none`.
