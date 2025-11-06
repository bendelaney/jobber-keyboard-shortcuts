# Jobber Keyboard Shortcuts

A userscript that adds powerful keyboard shortcuts to Jobber to speed up your workflow.

## Keyboard Shortcuts

### Global Shortcuts
- **`CMD + \`** (Mac) or **`CTRL + \`** (Windows) - Toggle **Activity Feed** side panel
- **`CMD + OPTION + \`** (Mac) or **`CTRL + ALT + \`** (Windows) - Toggle **Messages** side panel
- **`CMD + ENTER`** (Mac) or **`CTRL + ENTER`** (Windows) - Click **Save** Button (works in Visit Modals, Note inputs, and email forms)

### While Viewing a Job Visit Modal
- **`CMD + CTRL + E`** (Mac) or **`CTRL + E`** (Windows) - Open visit **Edit** dialog
- **`CMD + CTRL + T`** (Mac) or **`CTRL + T`** (Windows) - Open **Text Reminder** dialog
- **`SHIFT + N`** - Switch to **Notes** Tab
- **`SHIFT + I`** - Switch to **Info** Tab

### While Editing a Job Visit
- **`CMD + CTRL + A`** (Mac) or **`CTRL + A`** (Windows) - **Assign** Crew

### While on a Job Page
- **`SHIFT + V`** - Scroll to **Visits** section
- **`SHIFT + N`** - Scroll to **Internal Notes** section

## Installation

### Step 1: Install Userscript Extension

#### For Mac Users (Safari):
Install the [Userscripts extension](https://apps.apple.com/us/app/userscripts/id1463298887) (App Store link) for Safari.

More info here: [https://github.com/quoid/userscripts](https://github.com/quoid/userscripts)

#### For Windows Users (Chrome/Firefox/Edge):
Install [Tampermonkey](https://www.tampermonkey.net/) browser extension:
- **Chrome**: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **Edge**: [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### Step 2: Create New Userscript

#### Auto-install option (recommended):
1. Make sure your extension from Step 1 is turned ON.
2. Visit this: [install link](https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/jobber-keyboard-shortcuts-userscript.user.js)
3. _While on that page_:
   - **For Safari/Userscripts**: Click the Userscripts icon in browser (looks like **"</>"**), then click **"Click to install"**
   - **For Tampermonkey**: Tampermonkey should automatically detect the userscript and show an installation page. Click **Install** button.

![Screenshot of Userscripts auto-install](https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/userscripts-install.png)

#### Manual install option:
##### For Safari/Userscripts:
1. Open the script in a new tab and COPY full contents <a href="https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/jobber-keyboard-shortcuts-userscript.user.js" target="_blank">Click here to open</a>
2. Click the Userscripts extension icon in Safari toolbar
3. Click the "Open Extension Page" link
4. Click the **+** button, then "New JS" to create a new userscript
5. Give it a name like "Jobber Keyboard Shortcuts"
6. PASTE the contents of the script

![Screenshot of manual Userscripts install](https://github.com/bendelaney/jobber-userscripts/blob/main/userscripts-manual-install.jpg?raw=true)

##### For Tampermonkey:
1. Click the Tampermonkey icon in your browser toolbar
2. Click **"Create a new script..."**
3. Delete the default template
4. Open the script and COPY full contents <a href="https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/jobber-keyboard-shortcuts-userscript.user.js" target="_blank">Click here to open</a>
5. PASTE the contents into the Tampermonkey editor
6. Click **File → Save** (or press CTRL+S)

### Step 4: Save and Enable
1. Save the userscript
2. Make sure it's enabled (toggle should be on)
3. Refresh your Jobber page

### Step 5: Verify Installation
1. Open your browser's JavaScript console:
   - **Mac (Safari)**: Option + CMD + C
   - **Windows (Chrome/Firefox/Edge)**: F12 or CTRL + SHIFT + I, then click "Console" tab
2. You should see console messages listing all available keyboard shortcuts
3. Try a keyboard shortcut to confirm it's working!

## Updates

When this userscript is updated, you don't need to do anything! The loader automatically fetches the latest version every time you load Jobber.

## Troubleshooting

**Shortcuts aren't working:**
- Check the browser console for error messages
- Make sure the userscript is enabled in the Userscripts extension
- Try refreshing the page

**Script not loading:**
- Check your internet connection
- Verify the userscript code was pasted correctly
- Make sure you're on `https://secure.getjobber.com/*`

## Contributing
Found a bug or want to request a feature? Open an issue on this repository!

## License
MIT License - feel free to modify and share!