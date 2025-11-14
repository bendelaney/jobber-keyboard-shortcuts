# Jobber Keyboard Shortcuts - Copilot Instructions

## Project Overview
This is a userscript that adds keyboard shortcuts to Jobber (secure.getjobber.com). The project maintains two versions of the same code:
- `jobber-keyboard-shortcuts-manual-install.js` - Full userscript with @grant metadata headers
- `jobber-keyboard-shortcuts.js` - Bookmarklet version without metadata

## Critical Rules

### Perfect Parity Between Files
**ALWAYS maintain identical functionality between both script files.**
- When updating any function or feature, apply the change to BOTH files
- The only difference should be the userscript metadata headers
- Use `multi_replace_string_in_file` to update both files simultaneously when possible

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
- Show OS-specific shortcuts in modal (Mac: CMD/OPTION, Windows: CTRL/ALT)
- Use ternary operators for platform-specific display

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
When adding or modifying shortcuts, update BOTH:
1. The in-app modal (shortcutSections array)
2. README.md

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
- [ ] Modal help dialog reflects new/changed shortcuts
- [ ] README.md updated
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
