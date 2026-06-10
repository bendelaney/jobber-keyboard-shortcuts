# Jobber Keyboard Shortcuts

A userscript that adds powerful keyboard shortcuts to Jobber to speed up your workflow.

## Keyboard Shortcuts

### Global Shortcuts
- **`CMD + /`** (Mac) or **`CTRL + /`** (Windows) - Show **keyboard shortcuts reference** modal
- **`CMD + \`** (Mac) or **`CTRL + \`** (Windows) - Toggle **Activity Feed** side panel
- **`CMD + OPTION + \`** (Mac) or **`CTRL + ALT + \`** (Windows) - Toggle **Messages** side panel
- **`CMD + ENTER`** (Mac) or **`CTRL + ENTER`** (Windows) - Click **Save/Send** Button (works in Visit Modals, Note inputs, email forms, text message forms, and new note forms)

### While Viewing a Visit Modal
- **`CMD + CTRL + E`** (Mac) or **`CTRL + ALT + E`** (Windows) - Open visit **Edit** dialog
- **`CMD + CTRL + T`** (Mac) or **`CTRL + ALT + T`** (Windows) - Open **Text Reminder** dialog
- **`CMD + CTRL + A`** (Mac) or **`CTRL + ALT + A`** (Windows) - **Assign** Crew
- **`SHIFT + N`** - Switch to **Notes** Tab
- **`SHIFT + I`** - Switch to **Info** Tab

### While on Job / Invoice / Quote Pages
- **`SHIFT + V`** - Scroll to **Scheduled visits** section (job page only)
- **`SHIFT + N`** - Start a new **Note** and focus the note field

## Installation

Pick the option that matches your browser:

### 🧩 Chrome / Edge / Brave — Chrome Web Store (recommended, one-click)

**[👉 Install from the Chrome Web Store 👈](https://chrome.google.com/webstore/detail/REPLACE_WITH_EXTENSION_ID)**

> ⚠️ **Maintainer note:** the link above is a placeholder until the extension is
> published. After it's approved in the
> [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole),
> replace `REPLACE_WITH_EXTENSION_ID` with the real listing URL.

That's it — click **Add to Chrome**, then open [Jobber](https://secure.getjobber.com).
The extension updates itself automatically whenever a new version ships.

### 🧩 Chrome / Edge / Brave — manual (no store, free)

Prefer not to wait for the store, or want the latest dev version? Load it unpacked:

1. Download this repo (green **Code** button → **Download ZIP**, then unzip), or `git clone` it.
2. Open **`chrome://extensions`** in your browser.
3. Turn on **Developer mode** (top-right).
4. Click **Load unpacked** and select the **`chrome-extension`** folder.
5. Open [Jobber](https://secure.getjobber.com) — the shortcuts are live.

Full details and the Safari conversion notes are in [`chrome-extension/README.md`](chrome-extension/README.md).

### 📜 Userscript (works everywhere, including Safari)

Install a userscript manager and the script — see the steps below.

---

## Userscript Installation

### 1️⃣ Step 1: Install a Userscript Extension/Add-on

#### For APPLE / MAC USERS:
Install browser extension:<br/>
- **Safari**: 
   - [Userscripts (App Store--free) (recommended)](https://apps.apple.com/us/app/userscripts/id1463298887)
   - [Tampermonkey (App Store--$2.99)](https://apps.apple.com/us/app/tampermonkey/id6738342400)
- **Chrome**: [Tampermonkey (Chrome Web Store)](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Tampermonkey (Firefox Add-ons)](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

#### For MICROSOFT / WINDOWS Users (Chrome/Firefox/Edge):
Install [Tampermonkey](https://www.tampermonkey.net/) browser extension:
- **Chrome**: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **Edge**: [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 1️⃣🅱️ ⚠️ IMPORTANT STEP For WINDOWS users:
1. Right-click the Tampermonkey icon in your browser toolbar
2. Choose "Manage Extension"<br/><img src="https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/manage-extension.png" alt="Screenshot of Tampermonkey context menu" style="max-width: 400px; width: 296px;"/>

3. Toggle ON two settings: "Developer Mode" (in the upper right) and "Allow User Scripts"
![Screenshot of Settings to turn on](https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/settings-to-turn-on.png)
4. Return to Jobber. 
[https://secure.getjobber.com](https://secure.getjobber.com). If it's working, you'll see a red number on the Tampermonkey icon. <br/><img src="https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/toolbar-icon.png" alt="Screenshot of Tampermonkey context menu" style="max-width: 200px; width: 97px;"/>


### 2️⃣ Step 2: Install the Userscript

1. Visit the install page (read #2 below first): [👉🏼CLICK HERE👈🏼](https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/jobber-keyboard-shortcuts-userscript.user.js)
2. _**While on that page**_:
   - **For Safari/Userscripts**: Click the Userscripts icon in browser (looks like **"</>"**), then click **"Click to install"**
   ![Screenshot of Userscripts auto-install](https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/userscripts-install.png)

   - **For Tampermonkey**: Tampermonkey will automatically detect the userscript and show an 'installation page' near the top. Click **Install** button.
   ![Screenshot of Tampermonkey auto-install](https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/tampermonkey-install.jpeg)




## Updates

When this userscript is updated, you don't need to do anything! The loader automatically fetches the latest version every time you load Jobber.

## Troubleshooting

**Shortcuts aren't working:**
- Check that you are "in" the Jobber window - click anywhere to make sure that window is the active one. 
- Try refreshing the page
- Check the browser console for error messages
- Make sure the userscript is enabled in the Userscripts extension

**Script not loading:**
- Check your internet connection
- Verify the userscript code was pasted correctly
- Make sure you're on `https://secure.getjobber.com/*`

## Contributing
Found a bug or want to request a feature? Open an issue on this repository!

## License
MIT License - feel free to modify and share!