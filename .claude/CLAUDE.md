# Jobber Keyboard Shortcuts - Project Instructions

## Project Overview
This is a userscript that adds keyboard shortcuts to Jobber (secure.getjobber.com). The project maintains two versions of the same code:
- `jobber-keyboard-shortcuts-manual-install.js` - Full userscript with @grant metadata headers
- `jobber-keyboard-shortcuts.js` - Bookmarklet version without metadata

## Critical Rules

### Perfect Parity Between Files
**ALWAYS maintain identical functionality between both script files.**
- When updating any function or feature, apply the change to BOTH files
- The only difference should be the userscript metadata headers
- **EVERY code change MUST be applied to BOTH files in the same response**
- Never make a change to just one file

### File-Specific Differences
- `jobber-keyboard-shortcuts-manual-install.js` includes userscript metadata (lines 1-7):
  ```javascript
  // ==UserScript==
  // @name         Jobber Keyboard Shortcuts
  // @version      X.X
  // @description  A collection of super helpful keyboard shortcuts for Jobber.
  // @author       Ben Delaney
  // @match        https://secure.getjobber.com/*
  // @grant        none
  // ==/UserScript==
  ```
- `jobber-keyboard-shortcuts.js` starts directly with the IIFE (no metadata) but includes version comment:
  ```javascript
  // Jobber Actions Consolidated
  // Version X.X
  // Author: Ben Delaney
  ```

**CRITICAL**: When updating version numbers, update BOTH files (line 3 in manual-install.js AND line 2 in bookmarklet version).

### Platform Support
- Detect OS using: `const isMac = navigator.platform.includes('Mac');`
- **ALWAYS show platform-specific shortcuts** in ALL documentation locations:
  - Help modal (shortcutSections array) - use ternary: `isMac ? 'COMMAND + /' : 'CTRL + /'`
  - Console.log messages - use template literals: `` `${isMac ? 'CMD+/' : 'CTRL+/'}` ``
  - README.md - show both: `**\`CMD + /\`** (Mac) or **\`CTRL + /\`** (Windows)`
  - Header comments - show Mac shortcuts (primary documentation)
- Mac shortcuts use: CMD, CMD+CTRL, CMD+OPTION
- Windows shortcuts use: CTRL, CTRL+ALT (not CTRL+CTRL)
- Use ternary operators for all platform-specific displays

### Event Handling Priority
The `clickSaveButton()` function has a strict priority order:
1. **HIGHEST**: Email dialog (`.js-sendToClientDialog`) - for Invoice/Quote emails
2. **SECOND**: SMS dialog (`.js-sendToClientDialogSms`)
3. **THIRD**: to_do form save button
4. **FOURTH**: Note forms with modal/focus detection

Never change this priority order without explicit approval.

### Keyboard Shortcut Patterns
- Use `{ capture: true }` for event listeners to intercept before Jobber's handlers
- Check for visibility with `window.getComputedStyle()` before triggering actions
- Include both Mac and Windows key combinations
- Prevent default behavior and stop propagation for intercepted shortcuts

### Page Type Detection
Use regex patterns for URL matching:
- Job pages: `/\/work_orders\/\d+/`
- Invoice pages: `/\/invoices\/\d+/`
- Quote pages: `/\/quotes\/\d+/`
- Combined: `/\/(work_orders|invoices|quotes)\/\d+/`

### Documentation Updates
When adding or modifying shortcuts, update ALL locations with platform-specific instructions:
1. **In-app modal** (shortcutSections array) - Platform-aware with ternary operators
2. **README.md** - Show both Mac and Windows shortcuts
3. **Header comments** (top of both files) - Show Mac shortcuts as primary
4. **Console.log messages** (bottom of both files) - Platform-aware with template literals

**CRITICAL**: All documentation must show correct platform-specific shortcuts. Never show only Mac shortcuts or only Windows shortcuts in user-facing documentation. Use the `isMac` variable to dynamically display the correct shortcuts for the user's platform.

When a new shortcut is added, update all instructional comments, console.logs, and the readme so that perfect parity exists between all for instructions/hints.

Whenever a new shortcut is added or a significant change is made, update the version number in the header.

### Code Style
- Use `const normalizeText = (s) => (s || '').trim().toLowerCase();` for text comparison
- Include console.log debugging messages for shortcut actions
- Use `scrollIntoView({ behavior: 'smooth', block: 'start' })` for scroll actions
- Prefer `.closest()` for DOM traversal

### Testing Checklist
Before committing changes:
- [ ] Both script files updated with identical changes
- [ ] Modal help dialog shows platform-specific shortcuts (uses ternary operators)
- [ ] README.md shows BOTH Mac AND Windows shortcuts for all shortcuts
- [ ] Header comments at the beginning of both files show Mac shortcuts
- [ ] Console.log entries at the end of both files show platform-specific shortcuts (use template literals with `isMac`)
- [ ] All platform-specific shortcuts follow the correct mapping:
  - Mac `CMD+CTRL` → Windows `CTRL+ALT`
  - Mac `CMD+OPTION` → Windows `CTRL+ALT`
  - Mac `CMD` → Windows `CTRL`
- [ ] Tested on Mac (if OS-specific)
- [ ] Tested on Windows (if OS-specific)
- [ ] Console logs confirm shortcut execution

## Common Selectors
- Email dialog: `.js-sendToClientDialog`
- SMS dialog: `.js-sendToClientDialogSms`
- Card titles: `.card-headerTitle`
- Note containers: `.js-noteContainer`
- Note textareas: `textarea[name="note[message]"]`
- Save buttons: `button.js-saveNote`

## Deployment
Changes are automatically loaded via the loader script in `jobber-keyboard-shortcuts-userscript.user.js` which fetches from GitHub raw URL on each Jobber page load.
