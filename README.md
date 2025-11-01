# Jobber Keyboard Shortcuts

A userscript that adds powerful keyboard shortcuts to Jobber to speed up your workflow.

## Keyboard Shortcuts

### Global Shortcuts
- **CMD + \\** - Toggle Activity Feed side panel
- **CMD + OPTION + \\** - Toggle Messages side panel
- **CMD + ENTER** - Click Save Button (works in Visit Modals, Note inputs, and email forms)

### While Viewing a Job Visit Modal
- **CMD + CTRL + E** - Open visit Edit dialog
- **CMD + CTRL + T** - Open Text Reminder dialog
- **SHIFT + N** - Switch to Notes Tab
- **SHIFT + I** - Switch to Info Tab

### While Editing a Job Visit
- **CMD + CTRL + A** - Assign Crew

## Installation

### Step 1: Install Userscripts Extension for Safari
Install the [Userscripts extension](https://github.com/quoid/userscripts) for Safari.

### Step 2: Create New Userscript
#### Auto-install option:
1. Make sure your Userscripts Extension from Step 1 is turned ON.
2. Visit the [install link](https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/jobber-keyboard-shortcuts-userscript.user.js)
3. Click the Userscripts icon in browser - looks like **"</>"**
4. Click the **"Click to install"** link.

![Screenshot of Userscripts auto-install](https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/userscripts-install.png)

#### Manual install option: 
1. Open the script in a new tab and COPY full contents <a href="https://raw.githubusercontent.com/bendelaney/jobber-userscripts/refs/heads/main/jobber-keyboard-shortcuts-userscript.user.js" target="_rel">Click here to open</a>
2. Click the Userscripts extension icon in Safari toolbar
3. Click the "Open Extension Page" link.
4. Click the **+** button, then "New JS" to create a new userscript
5. Give it a name like "Jobber Keyboard Shortcuts"
6. PASTE the contents of the script

### Step 4: Save and Enable
1. Save the userscript
2. Make sure it's enabled (toggle should be on)
3. Refresh your Jobber page

### Step 5: Verify Installation
1. Open your browser's JavaScript console (Option + CMD + C on Mac)
2. You should see: "Jobber keyboard shortcuts loaded successfully"
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
