// Jobber Actions Consolidated
// Version 1.8
// Author: Ben Delaney

/* ************************
KEYBOARD SHORTCUTS:
**************************

Global:
- CMD + \ (Mac) or CTRL + \ (Windows) : Toggle 'Activity Feed' side panel
- CMD + OPTION + \ (Mac) or CTRL + ALT + \ (Windows) : Toggle 'Messages' side panel
- CMD + ENTER (Mac) or CTRL + ENTER (Windows) : Click Save Button (while in any Visit Modal, Note input, or email form.)
- CMD + ? (Mac) or CTRL + ? (Windows) : Show keyboard shortcuts reference

While viewing a JOB VISIT Modal:
 - CMD + CTRL + E (Mac) or CTRL + E (Windows) : Open visit Edit dialog
 - CMD + CTRL + T (Mac) or CTRL + T (Windows) : Open Text Reminder dialog
 - SHIFT + N : Switch to Notes Tab
 - SHIFT + I : Switch to Info Tab

While in the 'EDIT' mode of a Job Visit Modal:
 - CMD + CTRL + A (Mac) or CTRL + A (Windows) : Assign Crew

While on a Job page:
 - SHIFT + V : Scroll to Visits section

While on Job, Invoice, or Quote pages:
 - SHIFT + N : Scroll to Internal Notes section
*/

(function() {
    'use strict';

    // Utility function to normalize text
    const normalizeText = (s) => (s || '').trim().toLowerCase();

    const isMac = navigator.platform.includes('Mac');

    const shortcutSections = [
        {
            title: 'Global',
            shortcuts: [
                { combo: isMac ? 'COMMAND + \\' : 'CTRL + \\', description: "Toggle 'Activity Feed' side panel" },
                { combo: isMac ? 'COMMAND + OPTION + \\' : 'CTRL + ALT + \\', description: "Toggle 'Messages' side panel" },
                { combo: isMac ? 'COMMAND + ENTER' : 'CTRL + ENTER', description: 'Click Save button in visit modals, notes, or email forms' },
                { combo: isMac ? 'COMMAND + ?' : 'CTRL + ?', description: 'Show this shortcuts reference' }
            ]
        },
        {
            title: 'Visit / Request Modals',
            shortcuts: [
                { combo: isMac ? 'COMMAND + CTRL + E' : 'CTRL + E', description: 'Open visit Edit dialog' },
                { combo: isMac ? 'COMMAND + CTRL + T' : 'CTRL + T', description: 'Open Text Reminder dialog' },
                { combo: 'SHIFT + N', description: 'Switch to Notes tab' },
                { combo: 'SHIFT + I', description: 'Switch to Info tab' }
            ]
        },
        {
            title: 'Visit Edit Mode',
            shortcuts: [
                { combo: isMac ? 'COMMAND + CTRL + A' : 'CTRL + A', description: 'Assign crew' }
            ]
        },
        {
            title: 'Job / Invoice / Quote Pages',
            shortcuts: [
                { combo: 'SHIFT + V', description: 'Scroll to Visits section (Job pages only)' },
                { combo: 'SHIFT + N', description: 'Scroll to Internal Notes section' }
            ]
        }
    ];

    let shortcutsModal;
    let shortcutsOverlay;
    let previousBodyOverflow;

    const createShortcutsModal = () => {
        if (shortcutsOverlay) {
            return;
        }

        shortcutsOverlay = document.createElement('div');
        shortcutsOverlay.id = 'jobber-shortcuts-overlay';
        shortcutsOverlay.setAttribute('role', 'presentation');
        shortcutsOverlay.style.cssText = [
            'position: fixed',
            'top: 0',
            'left: 0',
            'width: 100%',
            'height: 100%',
            'display: none',
            'align-items: center',
            'justify-content: center',
            'background: rgba(17, 24, 39, 0.65)',
            'z-index: 2147483000',
            'padding: 24px',
            'box-sizing: border-box'
        ].join(';');

        shortcutsModal = document.createElement('div');
        shortcutsModal.id = 'jobber-shortcuts-modal';
        shortcutsModal.setAttribute('role', 'dialog');
        shortcutsModal.setAttribute('aria-modal', 'true');
        shortcutsModal.setAttribute('aria-labelledby', 'jobber-shortcuts-title');
        shortcutsModal.setAttribute('tabindex', '-1');
        shortcutsModal.style.cssText = [
            'background: #ffffff',
            'color: #1f2933',
            'max-width: 640px',
            'width: 100%',
            'max-height: 80vh',
            'overflow-y: auto',
            'border-radius: 12px',
            'box-shadow: 0 25px 80px rgba(15, 23, 42, 0.35)',
            'padding: 28px 32px',
            'box-sizing: border-box',
            'font-family: "Helvetica Neue", Arial, sans-serif',
            'position: relative'
        ].join(';');

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.setAttribute('aria-label', 'Close shortcuts reference');
        closeButton.textContent = '×';
        closeButton.style.cssText = [
            'position: absolute',
            'top: 12px',
            'right: 16px',
            'border: none',
            'background: none',
            'font-size: 26px',
            'cursor: pointer',
            'line-height: 1',
            'color: #6b7280'
        ].join(';');

        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.color = '#111827';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.color = '#6b7280';
        });
        closeButton.addEventListener('click', () => {
            hideShortcutsModal();
        });

        const title = document.createElement('h2');
        title.id = 'jobber-shortcuts-title';
        title.textContent = 'Keyboard Shortcuts';
        title.style.cssText = [
            'margin: 0 0 12px',
            'font-size: 24px',
            'font-weight: 600'
        ].join(';');

        const subtitle = document.createElement('p');
        subtitle.innerHTML = '<a href="https://github.com/bendelaney/jobber-keyboard-shortcuts" target="_blank" rel="noopener">more info</a>';
        subtitle.style.cssText = [
            'margin: 0 0 20px',
            'color: #4b5563',
            'font-size: 15px'
        ].join(';');

        const listContainer = document.createElement('div');
        listContainer.style.cssText = [
            'display: grid',
            'gap: 18px'
        ].join(';');

        shortcutSections.forEach((section) => {
            const sectionWrapper = document.createElement('section');
            sectionWrapper.style.cssText = [
                'border-top: 1px solid #e5e7eb',
                'padding-top: 16px'
            ].join(';');

            if (listContainer.childElementCount === 0) {
                sectionWrapper.style.borderTop = 'none';
                sectionWrapper.style.paddingTop = '0';
            }

            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = section.title;
            sectionTitle.style.cssText = [
                'margin: 0 0 10px',
                'font-size: 16px',
                'font-weight: 600',
                'text-transform: uppercase',
                'letter-spacing: 0.04em',
                'color: #111827'
            ].join(';');

            const list = document.createElement('ul');
            list.style.cssText = [
                'list-style: none',
                'margin: 0',
                'padding: 0',
                'display: grid',
                'gap: 8px'
            ].join(';');

            section.shortcuts.forEach((shortcut) => {
                const item = document.createElement('li');
                item.style.cssText = [
                    'display: flex',
                    'justify-content: space-between',
                    'align-items: center',
                    'background: #f9fafb',
                    'border: 1px solid #e5e7eb',
                    'border-radius: 8px',
                    'padding: 10px 14px',
                    'gap: 16px'
                ].join(';');

                const combo = document.createElement('span');
                combo.textContent = shortcut.combo;
                combo.style.cssText = [
                    'font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    'font-size: 13px',
                    'color: #111827'
                ].join(';');

                const description = document.createElement('span');
                description.textContent = shortcut.description;
                description.style.cssText = [
                    'font-size: 14px',
                    'color: #374151',
                    'text-align: right'
                ].join(';');

                item.appendChild(combo);
                item.appendChild(description);
                list.appendChild(item);
            });

            sectionWrapper.appendChild(sectionTitle);
            sectionWrapper.appendChild(list);
            listContainer.appendChild(sectionWrapper);
        });

        shortcutsModal.appendChild(closeButton);
        shortcutsModal.appendChild(title);
        shortcutsModal.appendChild(subtitle);
        shortcutsModal.appendChild(listContainer);

        shortcutsOverlay.appendChild(shortcutsModal);

        shortcutsOverlay.addEventListener('click', () => {
            hideShortcutsModal();
        });

        shortcutsModal.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        document.body.appendChild(shortcutsOverlay);
    };

    const hideShortcutsModal = () => {
        if (!shortcutsOverlay) {
            return;
        }
        shortcutsOverlay.style.display = 'none';
        if (previousBodyOverflow !== undefined) {
            document.body.style.overflow = previousBodyOverflow;
            previousBodyOverflow = undefined;
        }
    };

    const showShortcutsModal = () => {
        createShortcutsModal();
        if (!shortcutsOverlay) {
            return;
        }
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        shortcutsOverlay.style.display = 'flex';
        shortcutsModal.focus({ preventScroll: true });
    };

    const toggleShortcutsModal = () => {
        createShortcutsModal();
        if (!shortcutsOverlay) {
            return;
        }
        if (shortcutsOverlay.style.display === 'flex') {
            hideShortcutsModal();
        } else {
            showShortcutsModal();
        }
    };

    const isShortcutsModalVisible = () => shortcutsOverlay && shortcutsOverlay.style.display === 'flex';

    // Function 1: Open Edit Dialog (CMD+CTRL+E)
    function openEditDialog() {
        try {
            const title = document.querySelector('.dialog-title.js-dialogTitle');
            const titleText = normalizeText(title?.textContent || '');
            
            if (!title || (titleText !== 'visit' && titleText !== 'request')) {
                alert('Open the Visit or Request modal first.');
                return;
            }

            const dialog = title.closest('[role="dialog"],.dialog-box,.modal') || document;
            const button = dialog.querySelector('button[data-action-button="true"].js-dropdownButton,button.js-dropdownButton[data-action-button="true"]') ||
                          dialog.querySelector('button.js-dropdownButton,button[aria-haspopup="true"]');

            if (!button) {
                alert('More Actions button not found.');
                return;
            }

            let rawActions = button.getAttribute('data-action-button-actions');
            if (!rawActions) {
                alert('No actions found on button.');
                return;
            }

            rawActions = rawActions.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            
            let actionsArray;
            try {
                actionsArray = JSON.parse(rawActions);
            } catch (e) {
                alert('Could not parse actions JSON.');
                return;
            }

            let editHref = null;
            for (const html of actionsArray) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const anchor = tempDiv.querySelector('a');
                const text = normalizeText(tempDiv.textContent);
                
                if (anchor && (text.includes('edit') || /\/edit\.dialog\b/.test(anchor.getAttribute('href') || ''))) {
                    editHref = anchor.getAttribute('href');
                    break;
                }
            }

            if (!editHref) {
                alert('Edit action not found in actions.');
                return;
            }

            const token = (document.querySelector('meta[name="csrf-token"]') || {}).content || '';
            
            fetch(editHref, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': '*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(token ? {'X-CSRF-Token': token} : {})
                }
            })
            .then(response => response.ok ? response.text() : response.text().then(text => {
                throw new Error(`HTTP ${response.status} ${response.statusText} :: ${text.slice(0, 200)}`);
            }))
            .then(js => {
                try {
                    // Check if dialogBox is available before executing
                    const parentWindow = parent.window || window;
                    if (typeof parentWindow.dialogBox === 'undefined') {
                        throw new Error('dialogBox constructor not available. Page may not be fully loaded.');
                    }
                    new Function(js)();
                } catch (execError) {
                    // Fallback: try direct navigation if script execution fails
                    console.warn('Script execution failed, attempting direct navigation:', execError);
                    window.location.href = editHref;
                }
            })
            .catch(error => {
                console.error(error);
                alert('Could not open Edit: ' + error.message);
            });

        } catch (error) {
            console.error(error);
            alert('Bookmarklet error: ' + error.message);
        }
    }

    // Function 2: Open Text Reminder Dialog (CMD+CTRL+T)
    function openTextReminderDialog() {
        try {
            const title = document.querySelector('.dialog-title.js-dialogTitle');
            const titleText = normalizeText(title?.textContent || '');
            
            if (!title || (titleText !== 'visit' && titleText !== 'request')) {
                alert('Open the Visit or Request modal first.');
                return;
            }

            const dialog = title.closest('[role="dialog"],.dialog-box,.modal') || document;
            const button = dialog.querySelector('button[data-action-button="true"].js-dropdownButton,button.js-dropdownButton[data-action-button="true"]') ||
                          dialog.querySelector('button.js-dropdownButton,button[aria-haspopup="true"]');

            if (!button) {
                alert('More Actions button not found.');
                return;
            }

            let rawActions = button.getAttribute('data-action-button-actions');
            if (!rawActions) {
                alert('No actions found on button.');
                return;
            }

            rawActions = rawActions.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            
            let actionsArray;
            try {
                actionsArray = JSON.parse(rawActions);
            } catch (e) {
                alert('Could not parse actions JSON.');
                return;
            }

            let smsHref = null;
            for (const html of actionsArray) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const anchor = tempDiv.querySelector('a');
                const text = normalizeText(tempDiv.textContent);
                const href = (anchor && anchor.getAttribute('href')) || '';
                const id = (anchor && anchor.id) || '';
                
                // Note: The original bookmarklet searches for 'text%20reminder' (URL encoded)
                // but we need to check for 'text reminder' in the decoded text
                if (anchor && (id === 'sms' || text.includes('text reminder') || /\/comms\/sms\.dialog\b/.test(href))) {
                    smsHref = href;
                    break;
                }
            }

            if (!smsHref) {
                // Debug: Let's see what actions are actually available
                console.log('Available actions:', actionsArray);
                actionsArray.forEach((html, index) => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    const anchor = tempDiv.querySelector('a');
                });
                alert('Text Reminder action not found.');
                return;
            }

            const token = (document.querySelector('meta[name="csrf-token"]') || {}).content || '';
            
            fetch(smsHref, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': '*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(token ? {'X-CSRF-Token': token} : {})
                }
            })
            .then(response => response.ok ? response.text() : response.text().then(text => {
                throw new Error(`HTTP ${response.status} ${response.statusText} :: ${text.slice(0, 200)}`);
            }))
            .then(js => {
                try {
                    // Check if dialogBox is available before executing
                    const parentWindow = parent.window || window;
                    if (typeof parentWindow.dialogBox === 'undefined') {
                        throw new Error('dialogBox constructor not available. Page may not be fully loaded.');
                    }
                    new Function(js)();
                } catch (execError) {
                    // Fallback: try direct navigation if script execution fails
                    console.warn('Script execution failed, attempting direct navigation:', execError);
                    window.location.href = smsHref;
                }
            })
            .catch(error => {
                console.error(error);
                alert('Could not open Text Reminder: ' + error.message);
            });

        } catch (error) {
            console.error(error);
            alert('Bookmarklet error: ' + error.message);
        }
    }

    // Function 3: Click Save Button (CMD+ENTER)
    function clickSaveButton() {
        // HIGHEST PRIORITY: Check for email dialog send button (Invoice/Quote emails)
        const emailDialog = document.querySelector('.js-sendToClientDialog');
        if (emailDialog && window.getComputedStyle(emailDialog.closest('.dialog-overlay, .dialog-box') || emailDialog).display !== 'none') {
            const emailSendButton = emailDialog.querySelector('button.js-formSubmit[data-form="form.sendToClientDialog"], div.js-formSubmit[data-form="form.sendToClientDialog"]');
            if (emailSendButton) {
                console.log('Email dialog detected, clicking send button');
                emailSendButton.click();
                return;
            }
        }
        
        // SECOND PRIORITY: Check for SMS dialog send button
        const smsDialog = document.querySelector('.js-sendToClientDialogSms');
        if (smsDialog) {
            const smsSendButton = smsDialog.querySelector('button.js-formSubmit[data-form="form.sendToClientDialogSms"]');
            if (smsSendButton) {
                console.log('SMS dialog detected, clicking send button');
                smsSendButton.click();
                return;
            }
        }
        
        // THIRD PRIORITY: Original to_do form save button
        let saveButton = document.querySelector(
            'a.button.button--green.js-spinOnClick.js-formSubmit[data-form="form.to_do"], ' +
            'button.button.button--green.js-spinOnClick.js-formSubmit[data-form="form.to_do"]'
        );
        
        if (saveButton) {
            saveButton.click();
            return;
        }
        
        // FOURTH PRIORITY: Note forms, prioritize modal context over main page
        console.log('Looking for note save functionality...');
        
        let activeContainer = null;
        let activeTextarea = null;
        let activeSaveButton = null;
        
        // Strategy 1: Check if there's a dialog/modal open first
        const modal = document.querySelector('.dialog-box, [role="dialog"], .modal');
        if (modal) {
            console.log('Modal detected, looking for note form in modal...');
            const modalNoteContainer = modal.querySelector('.js-noteContainer');
            if (modalNoteContainer) {
                const modalTextarea = modalNoteContainer.querySelector('textarea[name="note[message]"]');
                const modalSaveButton = modalNoteContainer.querySelector('button.js-saveNote');
                
                // Check if this modal note form is visible (not display:none)
                const containerStyle = window.getComputedStyle(modalNoteContainer);
                if (modalTextarea && modalSaveButton && containerStyle.display !== 'none') {
                    activeContainer = modalNoteContainer;
                    activeTextarea = modalTextarea;
                    activeSaveButton = modalSaveButton;
                    console.log('Found active note form in modal:', modalTextarea.id);
                }
            }
        }
        
        // Strategy 2: If no modal note found, look for focused textarea or one with content
        if (!activeContainer) {
            console.log('No modal note found, checking for focused/active textarea...');
            const allTextareas = document.querySelectorAll('textarea[name="note[message]"]');
            
            // Check for focused textarea first
            for (const textarea of allTextareas) {
                if (document.activeElement === textarea) {
                    const container = textarea.closest('.js-noteContainer');
                    const saveButton = container?.querySelector('button.js-saveNote');
                    if (container && saveButton && window.getComputedStyle(container).display !== 'none') {
                        activeContainer = container;
                        activeTextarea = textarea;
                        activeSaveButton = saveButton;
                        console.log('Found focused textarea:', textarea.id);
                        break;
                    }
                }
            }
            
            // If still no active found, look for one with content
            if (!activeContainer) {
                for (const textarea of allTextareas) {
                    if (textarea.value.trim()) {
                        const container = textarea.closest('.js-noteContainer');
                        const saveButton = container?.querySelector('button.js-saveNote');
                        if (container && saveButton && window.getComputedStyle(container).display !== 'none') {
                            activeContainer = container;
                            activeTextarea = textarea;
                            activeSaveButton = saveButton;
                            console.log('Found textarea with content:', textarea.id);
                            break;
                        }
                    }
                }
            }
            
            // Last resort - first visible textarea
            if (!activeContainer) {
                for (const textarea of allTextareas) {
                    const container = textarea.closest('.js-noteContainer');
                    const saveButton = container?.querySelector('button.js-saveNote');
                    if (container && saveButton && window.getComputedStyle(container).display !== 'none') {
                        activeContainer = container;
                        activeTextarea = textarea;
                        activeSaveButton = saveButton;
                        console.log('Using first visible textarea as fallback:', textarea.id);
                        break;
                    }
                }
            }
        }
        
        if (activeContainer && activeTextarea && activeSaveButton) {
            console.log('Processing active note textarea with content:', activeTextarea.value);
            
            // Focus the textarea to ensure it's active
            activeTextarea.focus();
            
            // Trigger all the events that might be needed
            const events = ['input', 'change', 'keyup', 'blur'];
            events.forEach(eventType => {
                const event = new Event(eventType, { bubbles: true });
                activeTextarea.dispatchEvent(event);
            });
            
            // Wait for events to process, then click save
            setTimeout(() => {
                console.log('Clicking save button after processing note events');
                activeSaveButton.click();
            }, 150);
            
        } else {
            alert('Save button not found on this page');
        }
    }

    // Function 4: Toggle Text Message Inbox (CMD+OPTION+\)
    function toggleMessageInbox() {
        const messageButton = document.querySelector('button[aria-label="Open Text Message Inbox"]');
        
        if (messageButton) {
            console.log('Text message inbox button found, clicking...');
            messageButton.click();
        } else {
            alert('Text message inbox button not found');
        }
    }

    // Function 5: Toggle Activity Feed (CMD+\)
    function toggleActivityFeed() {
        const activityButton = document.querySelector('#js-openNotifications');
        
        if (activityButton) {
            console.log('Activity feed button found, clicking...');
            activityButton.click();
        } else {
            alert('Activity feed button not found');
        }
    }

    // Function 6: Switch to Notes Tab (SHIFT+N)
    function switchToNotesTab() {
        try {
            const title = document.querySelector('.dialog-title.js-dialogTitle');
            const titleText = normalizeText(title?.textContent || '');
            
            if (!title || (titleText !== 'visit' && titleText !== 'request')) {
                alert('Open the Visit or Request modal first.');
                return;
            }

            const dialog = title.closest('[role="dialog"],.dialog-box,.modal') || document;
            const notesTab = dialog.querySelector('tab-bar-tab[data-target=".js-notesSection"]');
            
            if (!notesTab) {
                alert('Notes tab not found.');
                return;
            }

            console.log('Clicking Notes tab');
            notesTab.click();

            // Wait for the tab to switch, then focus the textarea
            setTimeout(() => {
                const notesTextarea = dialog.querySelector('textarea[name="note[message]"]');
                if (notesTextarea) {
                    console.log('Focusing Notes textarea');
                    notesTextarea.focus();
                } else {
                    console.warn('Notes textarea not found after tab switch');
                }
            }, 100);

        } catch (error) {
            console.error(error);
            alert('Error switching to Notes tab: ' + error.message);
        }
    }

    // Function 7: Assign Crew (CMD+CTRL+A)
    function assignCrew() {
        // Check if we're in a Visit/Request modal OR in an Edit Visit/Request form
        const title = document.querySelector('.dialog-title.js-dialogTitle');
        const titleText = normalizeText(title?.textContent || '');
        
        // Also check if we're in an edit form
        const editForm = document.querySelector('form.to_do[id^="edit_to_do_"]');
        
        const isInVisitModal = title && (titleText === 'visit' || titleText === 'request' || titleText === 'edit visit' || titleText === 'edit request');
        const isInEditForm = editForm !== null;
        
        if (!isInVisitModal && !isInEditForm) {
            console.log('Not in Visit/Request modal or Edit form, ignoring CMD+CTRL+A');
            return;
        }

        // Find the Assign Crew button - it's a div element
        const dialog = title?.closest('[role="dialog"],.dialog-box,.modal') || document;
        
        // Try multiple selector strategies
        let assignButton = dialog.querySelector('div.js-crewButton.js-spotlightCrew[aria-label="Assign Crew Button"]');
        
        if (!assignButton) {
            assignButton = dialog.querySelector('div.js-crewButton.js-spotlightCrew');
        }
        
        if (!assignButton) {
            assignButton = dialog.querySelector('.js-crewButton');
        }
        
        if (!assignButton) {
            assignButton = dialog.querySelector('[class*="js-crewButton"]');
        }
        
        if (assignButton) {
            console.log('Assign Crew button found, clicking...');
            assignButton.click();
        } else {
            alert('Assign Crew button not found in this modal.');
        }
    }

    // Function 8: Switch to Info Tab (SHIFT+I)
    function switchToInfoTab() {
        try {
            const title = document.querySelector('.dialog-title.js-dialogTitle');
            const titleText = normalizeText(title?.textContent || '');
            
            if (!title || (titleText !== 'visit' && titleText !== 'request')) {
                alert('Open the Visit or Request modal first.');
                return;
            }

            const dialog = title.closest('[role="dialog"],.dialog-box,.modal') || document;
            const infoTab = dialog.querySelector('tab-bar-tab[data-target=".js-infoSection"]');
            
            if (!infoTab) {
                alert('Info tab not found.');
                return;
            }

            console.log('Clicking Info tab');
            infoTab.click();

        } catch (error) {
            console.error(error);
            alert('Error switching to Info tab: ' + error.message);
        }
    }

    // Function 9: Scroll to Visits Card (SHIFT+V)
    function scrollToVisitsCard() {
        // Check if we're on a job page
        const isJobPage = /\/work_orders\/\d+/.test(window.location.pathname);
        
        if (!isJobPage) {
            console.log('Not on a job page, ignoring SHIFT+V');
            return;
        }

        // Find the "Visits" card header title
        const visitsTitle = document.querySelector('.card-headerTitle');
        
        // Check if it's actually the Visits title
        if (!visitsTitle || normalizeText(visitsTitle.textContent) !== 'visits') {
            // If first one isn't Visits, search through all card titles
            const allTitles = document.querySelectorAll('.card-headerTitle');
            let foundVisitsTitle = null;
            
            for (const title of allTitles) {
                if (normalizeText(title.textContent) === 'visits') {
                    foundVisitsTitle = title;
                    break;
                }
            }
            
            if (!foundVisitsTitle) {
                console.log('Visits card not found on this page');
                return;
            }
            
            // Get the grandparent div.card
            const visitsCard = foundVisitsTitle.closest('div.card');
            
            if (visitsCard) {
                console.log('Scrolling to Visits card');
                visitsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                console.log('Could not find parent card element');
            }
        } else {
            // Get the grandparent div.card
            const visitsCard = visitsTitle.closest('div.card');
            
            if (visitsCard) {
                console.log('Scrolling to Visits card');
                visitsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                console.log('Could not find parent card element');
            }
        }
    }

    // Function 10: Scroll to Internal Notes Card (SHIFT+N on Job/Invoice/Quote page)
    function scrollToInternalNotesCard() {
        // Check if we're on a job, invoice, or quote page
        const isOnSupportedPage = /\/(work_orders|invoices|quotes)\/\d+/.test(window.location.pathname);
        
        if (!isOnSupportedPage) {
            console.log('Not on a job, invoice, or quote page, ignoring SHIFT+N');
            return;
        }

        // Search through all card titles for "Internal notes"
        const allTitles = document.querySelectorAll('.card-headerTitle');
        let foundNotesTitle = null;
        
        for (const title of allTitles) {
            if (normalizeText(title.textContent) === 'internal notes') {
                foundNotesTitle = title;
                break;
            }
        }
        
        if (!foundNotesTitle) {
            console.log('Internal notes card not found on this page');
            return;
        }
        
        // Get the grandparent div.card
        const notesCard = foundNotesTitle.closest('div.card');
        
        if (notesCard) {
            console.log('Scrolling to Internal notes card');
            notesCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.log('Could not find parent card element');
        }
    }

    // Block Escape key in Edit dialogs - using multiple event listeners for maximum coverage
    const blockEscapeInEditDialog = function(event) {
        if (isShortcutsModalVisible && isShortcutsModalVisible()) {
            return;
        }
        if (event.code === 'Escape' || event.key === 'Escape' || event.keyCode === 27) {
            // Check if we're in an Edit dialog by looking for the edit form
            const editForm = document.querySelector('form.to_do[id^="edit_to_do_"]');

            if (editForm) {
                console.log('Escape key blocked in Edit Dialog (event type: ' + event.type + ')');
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                return false;
            }
        }
    };
    
    // Add multiple listeners to catch Escape at different phases
    document.addEventListener('keydown', blockEscapeInEditDialog, true);
    document.addEventListener('keyup', blockEscapeInEditDialog, true);
    document.addEventListener('keypress', blockEscapeInEditDialog, true);

    // Keyboard event listener with capture to intercept early
    let suppressSlashSearch = false;

    const swallowSlashEvent = (event) => {
        if (!suppressSlashSearch) {
            return;
        }

        const slashKey = event.code === 'Slash' || event.key === '/' || event.key === '?';
        if (!slashKey) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (event.type === 'keyup') {
            suppressSlashSearch = false;
        }
    };

    document.addEventListener('keypress', swallowSlashEvent, true);
    document.addEventListener('keyup', swallowSlashEvent, true);

    document.addEventListener('keydown', function(event) {
        if (isShortcutsModalVisible() && (event.key === 'Escape' || event.code === 'Escape')) {
            event.preventDefault();
            hideShortcutsModal();
            return;
        }

        const slashPressed = event.code === 'Slash' || event.key === '/' || event.key === '?';
        const wantsShortcutsModal = slashPressed && ((isMac && event.metaKey && !event.ctrlKey && !event.altKey) || (!isMac && event.ctrlKey && !event.altKey && !event.metaKey));

        if (wantsShortcutsModal) {
            suppressSlashSearch = true;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            toggleShortcutsModal();
            return;
        }

        suppressSlashSearch = false;

        // Debug all ENTER key presses
        if (event.code === 'Enter') {
            // console.log('ENTER detected:', {
            //     target: event.target.tagName,
            //     targetId: event.target.id,
            //     targetClass: event.target.className,
            //     metaKey: event.metaKey,
            //     ctrlKey: event.ctrlKey,
            //     altKey: event.altKey,
            //     shiftKey: event.shiftKey
            // });
        }
        
        // Prevent ENTER-only AND Option+Enter from sending messages in chat
        if (event.code === 'Enter' && 
            ((!event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) || // Plain Enter
             (event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey))) { // Option+Enter
            
            // console.log('Plain ENTER or Option+ENTER detected');
            // Check if we're in a chat textarea
            const target = event.target;
            if (target && target.tagName === 'TEXTAREA') {
                // console.log('ENTER/Option+ENTER in textarea detected');
                // Look for the chat send button to confirm this is a chat interface
                const chatSendButton = document.querySelector('button[aria-label="send"]');
                if (chatSendButton) {
                    // We're in the chat interface, prevent default ENTER behavior
                    // console.log('BLOCKING ENTER/Option+ENTER in chat interface');
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                }
            }
        }
        
        // Check for CMD+CTRL+E (Mac) or CTRL+ALT+E (Windows) - Edit
        if (((navigator.platform.includes('Mac') && event.metaKey && event.ctrlKey && !event.altKey && !event.shiftKey) ||
             (!navigator.platform.includes('Mac') && event.ctrlKey && event.altKey && !event.metaKey && !event.shiftKey)) &&
            event.code === 'KeyE') {
            event.preventDefault();
            openEditDialog();
        }
        // Check for CMD+CTRL+T (Mac) or CTRL+ALT+T (Windows) - Text Reminder
        else if (((navigator.platform.includes('Mac') && event.metaKey && event.ctrlKey && !event.altKey && !event.shiftKey) ||
                  (!navigator.platform.includes('Mac') && event.ctrlKey && event.altKey && !event.metaKey && !event.shiftKey)) &&
                 event.code === 'KeyT') {
            event.preventDefault();
            openTextReminderDialog();
        }
        // Check for CMD+CTRL+A (Mac) or CTRL+ALT+A (Windows) - Assign Crew
        else if (((navigator.platform.includes('Mac') && event.metaKey && event.ctrlKey && !event.altKey && !event.shiftKey) ||
                  (!navigator.platform.includes('Mac') && event.ctrlKey && event.altKey && !event.metaKey && !event.shiftKey)) &&
                 event.code === 'KeyA') {
            event.preventDefault();
            assignCrew();
        }
        // Check for CMD+OPTION+\ (Mac) or CTRL+ALT+\ (Windows) - Message Inbox
        else if (((navigator.platform.includes('Mac') && event.metaKey && event.altKey && !event.ctrlKey && !event.shiftKey) ||
                  (!navigator.platform.includes('Mac') && event.ctrlKey && event.altKey && !event.metaKey && !event.shiftKey)) &&
                 event.code === 'Backslash') {
            event.preventDefault();
            toggleMessageInbox();
        }
        // Check for CMD+\ (Mac) or CTRL+\ (Windows) - Activity Feed
        else if (((navigator.platform.includes('Mac') && event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey) ||
                  (!navigator.platform.includes('Mac') && event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey)) &&
                 event.code === 'Backslash') {
            event.preventDefault();
            toggleActivityFeed();
        }
        // Check for SHIFT+N (Switch to Notes Tab in modal OR Scroll to Internal Notes on Job page)
        else if (event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey && event.code === 'KeyN') {
            // Don't trigger shortcut if user is typing in an input field
            const activeElement = document.activeElement;
            const isTypingInField = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.tagName === 'SELECT' ||
                activeElement.isContentEditable
            );

            if (isTypingInField) {
                // User is typing in an input field, let the normal "N" character be typed
                return;
            }

            // Check if Visit or Request modal is open first
            const title = document.querySelector('.dialog-title.js-dialogTitle');
            const titleText = normalizeText(title?.textContent || '');

            if (title && (titleText === 'visit' || titleText === 'request')) {
                // We're in a modal - switch to Notes tab
                event.preventDefault();
                switchToNotesTab();
            } else {
                // Check if we're on a job page - scroll to Internal Notes
                const isJobPage = /\/work_orders\/\d+/.test(window.location.pathname);

                if (isJobPage) {
                    event.preventDefault();
                    scrollToInternalNotesCard();
                }
                // If neither condition met, let default behavior happen (typing "N")
            }
        }
        // Check for SHIFT+I (Switch to Info Tab)
        else if (event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey && event.code === 'KeyI') {
            // Don't trigger shortcut if user is typing in an input field
            const activeElement = document.activeElement;
            const isTypingInField = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.tagName === 'SELECT' ||
                activeElement.isContentEditable
            );

            if (isTypingInField) {
                // User is typing in an input field, let the normal "I" character be typed
                return;
            }

            // Only intercept if Visit or Request modal is open
            const title = document.querySelector('.dialog-title.js-dialogTitle');
            const titleText = normalizeText(title?.textContent || '');

            if (title && (titleText === 'visit' || titleText === 'request')) {
                event.preventDefault();
                switchToInfoTab();
            }
            // If modal is not open, let the default behavior happen (typing "I")
        }
        // Check for SHIFT+V (Scroll to Visits Card)
        else if (event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey && event.code === 'KeyV') {
            // Don't trigger shortcut if user is typing in an input field
            const activeElement = document.activeElement;
            const isTypingInField = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.tagName === 'SELECT' ||
                activeElement.isContentEditable
            );

            if (isTypingInField) {
                // User is typing in an input field, let the normal "V" character be typed
                return;
            }

            // Only intercept if we're on a job page
            const isJobPage = /\/work_orders\/\d+/.test(window.location.pathname);

            if (isJobPage) {
                event.preventDefault();
                scrollToVisitsCard();
            }
            // If not on job page, let the default behavior happen (typing "V")
        }
        // Check for CMD+ENTER (Save/Send) - Mac: CMD+Enter, Windows: CTRL+Enter
        else if (event.code === 'Enter' && 
         ((navigator.platform.includes('Mac') && event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey) ||
          (!navigator.platform.includes('Mac') && event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey))) {
            event.preventDefault();
            
            // HIGHEST PRIORITY: Check for delete note confirmation dialog
            const deleteNoteDialog = document.querySelector('.dialog-title.js-dialogTitle');
            if (deleteNoteDialog && deleteNoteDialog.textContent.trim().toLowerCase() === 'delete note?') {
                const deleteButton = document.querySelector('.button.button--red.js-deleteNote');
                if (deleteButton) {
                    console.log('CMD+ENTER in delete note dialog: clicking delete');
                    deleteButton.click();
                    return;
                }
            }
            
            // Check if we're in the chat interface
            const target = event.target;
            const chatSendButton = document.querySelector('button[aria-label="send"]');

            if (target && target.tagName === 'TEXTAREA' && chatSendButton) {
                // We're in chat interface, send the message
                // Stop propagation to prevent Jobber's own handler from also sending
                event.stopPropagation();
                event.stopImmediatePropagation();
                console.log('CMD+ENTER in chat: sending message');
                chatSendButton.click();
            } else {
                // Not in chat, use regular save functionality
                console.log('CMD+ENTER: using save functionality');
                clickSaveButton();
            }
        }
    }, { capture: true }); // Use capture phase to intercept earlier
    
    // Additional event listener for keypress as backup
    document.addEventListener('keypress', function(event) {
        if ((event.code === 'Enter' && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) ||
            (event.code === 'Enter' && event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey)) {
            const target = event.target;
            if (target && target.tagName === 'TEXTAREA') {
                const chatSendButton = document.querySelector('button[aria-label="send"]');
                if (chatSendButton) {
                    console.log('BLOCKING ENTER/Option+ENTER via keypress event');
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                }
            }
        }
    }, { capture: true });

    console.log('========================================');
    console.log('✅ JOBBER SHORTCUTS LOADED SUCCESSFULLY!');
    console.log('========================================');
    console.log('Available shortcuts:');
    console.log('- CMD+CTRL+E: Open Edit Dialog');
    console.log('- CMD+CTRL+T: Open Text Reminder Dialog');
    console.log('- CMD+CTRL+A: Assign Crew (in Visit/Request modal)');
    console.log('- CMD+?: Show shortcuts help modal');
    console.log('- CMD+OPTION+\\: Toggle Text Message Inbox');
    console.log('- CMD+\\: Toggle Activity Feed');
    console.log('- SHIFT+N: Switch to Notes Tab (in modal) OR Scroll to Internal Notes (on Job, Invoice, Quote pages)');
    console.log('- SHIFT+I: Switch to Info Tab (in Visit/Request modal)');
    console.log('- SHIFT+V: Scroll to Visits Card (on Job page)');
    console.log('- CMD+ENTER: Click Save Button');
    console.log('========================================');
})();