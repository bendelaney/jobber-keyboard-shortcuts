# Jobber Keyboard Shortcuts

## Project Overview
A userscript that adds keyboard shortcuts to Jobber (secure.getjobber.com). Two versions of the same code are maintained:
- `jobber-keyboard-shortcuts-manual-install.js` - Full userscript with `@grant` metadata headers (1216 lines)
- `jobber-keyboard-shortcuts.js` - Bookmarklet version without metadata (1208 lines)

The loader (`jobber-keyboard-shortcuts-userscript.user.js`) fetches the bookmarklet version from GitHub raw URL on each page load, so users always get the latest code automatically.

## Critical Rules

### 1. Perfect Parity Between Script Files
**EVERY code change MUST be applied to BOTH `.js` files in the same response.** The only differences between them are the headers:

**`jobber-keyboard-shortcuts-manual-install.js`** starts with userscript metadata (8 lines) THEN the version/shortcut comment block:
```javascript
// ==UserScript==
// @name         Jobber Keyboard Shortcuts
// @version      X.X
// ...
// ==/UserScript==
// Jobber Actions Consolidated
// Version X.X
// Author: Ben Delaney
```

**`jobber-keyboard-shortcuts.js`** starts directly with the version/shortcut comment block:
```javascript
// Jobber Actions Consolidated
// Version X.X
// Author: Ben Delaney
```

After the header comments, the code is **identical** in both files. Never change one without the other.

### 2. Version Numbers
When updating version numbers, update ALL three locations:
- `@version` in manual-install.js metadata (line 3)
- `// Version X.X` comment in manual-install.js (line 10)
- `// Version X.X` comment in bookmarklet.js (line 2)

Bump the version for any new shortcut or significant change.

### 3. Platform-Specific Shortcuts
Detect OS: `const isMac = navigator.platform.includes('Mac');`

Modifier key mapping:
| Mac | Windows |
|-----|---------|
| `CMD` | `CTRL` |
| `CMD+CTRL` | `CTRL+ALT` |
| `CMD+OPTION` | `CTRL+ALT` |

**All user-facing text must show the correct platform shortcut:**
- **Help modal** (`shortcutSections` array): use ternary `isMac ? 'COMMAND + /' : 'CTRL + /'`
- **Console.log messages** (bottom of both files): use template literals `` `${isMac ? 'CMD+/' : 'CTRL+/'}` ``
- **README.md**: show both: `**\`CMD + /\`** (Mac) or **\`CTRL + /\`** (Windows)`
- **Header comments** (top of both files): show Mac shortcuts only (primary documentation)

### 4. Four Documentation Locations for Shortcuts
When adding or modifying a shortcut, update ALL of these:
1. **In-app help modal** (`shortcutSections` array) - platform-aware ternaries
2. **Header comment block** (top of both files) - Mac shortcuts only
3. **Console.log section** (bottom of both files, ~line 1202+) - platform-aware template literals
4. **`README.md`** - both Mac and Windows

### 5. `clickSaveButton()` Priority Order — DO NOT CHANGE
1. Email dialog (`.js-sendToClientDialog`) — Invoice/Quote emails
2. SMS dialog (`.js-sendToClientDialogSms`)
3. To-do form save button
4. Note forms with modal/focus detection

## Code Architecture

Single IIFE wrapping all code. Structure:

1. **Utility functions** — `normalizeText()`, `isElementVisible()`, `isUserTyping()`, `isInMessagesInterface()`, dialog title helpers
2. **Action functions** — `clickSaveButton()`, `clickEditButton()`, `toggleSidePanel()`, tab/scroll actions, help modal builder
3. **Event listeners** — `keydown` (capture phase) for all shortcuts, `keypress` backup for Messages Enter-blocking. Both use `{ capture: true }`

### Key Patterns
- `{ capture: true }` on event listeners to intercept before Jobber's handlers
- Visibility checks via `window.getComputedStyle()` before triggering actions
- `e.preventDefault()` + `e.stopPropagation()` + `e.stopImmediatePropagation()` for intercepted shortcuts
- `scrollIntoView({ behavior: 'smooth', block: 'start' })` for scroll actions
- `.closest()` for DOM traversal
- `normalizeText()` for all text comparisons
- Console.log debugging messages for shortcut actions

### Page Detection Regex
```javascript
/\/work_orders\/\d+/    // Job pages
/\/invoices\/\d+/       // Invoice pages
/\/quotes\/\d+/         // Quote pages
/\/(work_orders|invoices|quotes)\/\d+/  // Combined
```

### Common DOM Selectors
| Selector | Purpose |
|----------|---------|
| `.js-sendToClientDialog` | Email dialog |
| `.js-sendToClientDialogSms` | SMS dialog |
| `.card-headerTitle` | Card section titles |
| `.js-noteContainer` | Note containers |
| `textarea[name="note[message]"]` | Note textareas |
| `button.js-saveNote` | Save buttons |
| `.dialog-title.js-dialogTitle` | Dialog title text |

## Current Shortcuts (v2.2)

**Global:** `CMD+/` help, `CMD+\` activity feed, `CMD+OPTION+\` messages, `CMD+ENTER` save

**Visit Modal:** `CMD+CTRL+E` edit, `CMD+CTRL+T` text reminder, `CMD+CTRL+A` assign crew, `SHIFT+N` notes tab, `SHIFT+I` info tab

**Job/Invoice/Quote pages:** `SHIFT+V` scroll to visits (job only), `SHIFT+N` scroll to notes

## Pre-Commit Checklist
- [ ] Both script files updated with identical code changes
- [ ] Help modal shows platform-specific shortcuts (ternary operators)
- [ ] README.md shows both Mac AND Windows shortcuts
- [ ] Header comments show Mac shortcuts
- [ ] Console.log entries use platform-aware template literals with `isMac`
- [ ] Version bumped in all three locations if new shortcut or significant change

## Deployment
Changes to `jobber-keyboard-shortcuts.js` are automatically picked up by the loader userscript. No build step required — just push to `main`.
