# Chrome Web Store — Submission Pack (everything is pre-filled)

This is your turnkey checklist. After you've paid the $5 developer fee, you
**only need to copy/paste the boxes below and upload the files in
`store-assets/`**. Nothing here requires a decision — defaults are chosen for you.

> Dashboard: https://chrome.google.com/webstore/devconsole

---

## ✅ Do this, in order

1. **Upload the package.** Click **Add new item** and upload
   **`jobber-keyboard-shortcuts-extension.zip`** (in the repo root). If it's
   missing or you changed the code, regenerate it with
   [`./build-zip.sh`](build-zip.sh).
2. **Store listing tab** — paste the fields in section A. Upload the icon +
   screenshots from `store-assets/`.
3. **Privacy practices tab** — paste section B. Tick the "no data collected"
   boxes exactly as listed.
4. **Distribution tab** — section C (Free, Public, All regions).
5. Click **Submit for review.** Done. Google emails you when it's approved
   (usually a few days).
6. When approved, copy the published URL and tell me — I'll drop it into both
   READMEs so the "Install from the Chrome Web Store" buttons go live.

---

## A. Store listing

**Item name**
```
Jobber Keyboard Shortcuts
```

**Summary** (max 132 characters)
```
Keyboard shortcuts for Jobber — edit visits, jump to notes, toggle messages, and save forms without leaving the keyboard.
```

**Category**
```
Workflow & Planning
```

**Language**
```
English (United States)
```

**Description**
```
Jobber Keyboard Shortcuts makes the Jobber web app (secure.getjobber.com) faster to use by letting you trigger common actions straight from the keyboard — no hunting for buttons with the mouse.

GLOBAL
• Cmd/Ctrl + /  — Show the keyboard shortcuts reference
• Cmd/Ctrl + \  — Toggle the Activity Feed panel
• Cmd/Ctrl + Option/Alt + \  — Toggle the Messages panel
• Cmd/Ctrl + Enter  — Click the Save / Send button

IN A VISIT MODAL OR SCHEDULER POPOVER
• Cmd/Ctrl + Ctrl/Alt + E  — Open the Edit dialog
• Cmd/Ctrl + Ctrl/Alt + T  — Open the Text Reminder dialog
• Cmd/Ctrl + Ctrl/Alt + A  — Assign Crew (in Edit mode)
• Shift + N  — Switch to the Notes tab
• Shift + I  — Switch to the Info tab

ON JOB / INVOICE / QUOTE PAGES
• Shift + V  — Scroll to the Scheduled Visits section (Job pages)
• Shift + N  — Start a new note

The shortcuts adapt automatically to your operating system (⌘ on Mac, Ctrl on Windows). Click the toolbar icon any time for a full, platform-aware reference.

PRIVACY
This extension collects no data whatsoever. It runs only on secure.getjobber.com, makes no network requests, and sends nothing anywhere. It simply listens for shortcuts and clicks the buttons already on the page.

Open source: https://github.com/bendelaney/jobber-keyboard-shortcuts
```

**Graphics to upload** (all in `chrome-extension/store-assets/`)
| Field | File |
|-------|------|
| Store icon (128×128) | `store-assets/store-icon-128.png` |
| Screenshot 1 (1280×800) | `store-assets/screenshot-1.png` |
| Screenshot 2 (1280×800) | `store-assets/screenshot-2.png` |
| Small promo tile (440×280) — optional | `store-assets/promo-tile-440x280.png` |
| Marquee promo tile (1400×560) — optional | `store-assets/marquee-1400x560.png` |

**Official URL / Homepage** (optional)
```
https://github.com/bendelaney/jobber-keyboard-shortcuts
```

---

## B. Privacy practices

**Single purpose description**
```
This extension adds keyboard shortcuts to the Jobber web app (secure.getjobber.com) so users can perform common actions — editing visits, navigating tabs, toggling panels, and saving forms — without using the mouse.
```

**Permission justification — host permission (`secure.getjobber.com`)**
```
The extension runs only on secure.getjobber.com. It needs access to this site so it can listen for keyboard shortcuts and click the corresponding buttons and links that already exist in the Jobber interface. It is not used on any other site.
```
> Note: the extension declares **no** entries in a `permissions` array — it uses
> only a content script scoped to `secure.getjobber.com`. If the dashboard lists
> no permissions to justify, that's expected; just fill in any host-permission
> field shown.

**Data collection** — tick that you do **NOT** collect any of the listed data
types (personally identifiable info, health, financial, authentication, personal
communications, location, web history, user activity, website content, etc.).

**Three certification checkboxes** — tick all three:
- ☑ I do not sell or transfer user data to third parties, outside of approved use cases
- ☑ I do not use or transfer user data for purposes unrelated to my item's single purpose
- ☑ I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL** — not required (no data collected). If a URL is requested,
use this raw link to the bundled policy:
```
https://raw.githubusercontent.com/bendelaney/jobber-keyboard-shortcuts/main/chrome-extension/PRIVACY.md
```

---

## C. Distribution

| Field | Value |
|-------|-------|
| Visibility | **Public** |
| Pricing | **Free** |
| Regions | **All regions** |
| Ads | **No** (contains no ads) |

---

## Notes
- The version number comes from `manifest.json` (currently mirrors the script
  version). To ship an update later: bump the version, run `./sync-extension.sh`
  and `./build-zip.sh`, then upload the new zip and submit again.
- Account-level one-time setup the dashboard may ask for the first time:
  verify a contact email and (for a free, no-data extension) that's it.
