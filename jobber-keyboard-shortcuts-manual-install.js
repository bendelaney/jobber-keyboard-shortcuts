// ==UserScript==
// @name         Jobber Keyboard Shortcuts
// @version      1.9
// @description  A collection of super helpful keyboard shortcuts for Jobber.
// @author       Ben Delaney
// @match        https://secure.getjobber.com/*
// @grant        none
// ==/UserScript==

// Jobber Actions Consolidated
// Version 1.9
// Author: Ben Delaney

/* ************************
KEYBOARD SHORTCUTS:
**************************

Global:
- CMD + \ : Toggle 'Activity Feed' side panel
- CMD + OPTION + \ : Toggle 'Messages' side panel
- CMD + ENTER : Click Save Button (while in any Visit Modal, Note input, or email form.)
- CMD + K : Show keyboard shortcuts reference

While viewing a JOB VISIT Modal:
 - CMD + CTRL + E : Open visit Edit dialog
 - CMD + CTRL + T : Open Text Reminder dialog
 - SHIFT + N : Switch to Notes Tab
 - SHIFT + I : Switch to Info Tab

While in the 'EDIT' mode of a Job Visit Modal:
 - CMD + CTRL + A : Assign Crew

While on a Job page:
 - SHIFT + V : Scroll to Visits section

While on Job, Invoice, or Quote pages:
 - SHIFT + N : Scroll to Internal Notes section
*/

(function() {
    'use strict';

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    // Utility function to normalize text
    const normalizeText = (s) => (s || '').trim().toLowerCase();

    const isMac = navigator.platform.includes('Mac');

    // Check if user is currently typing in an input field
    const isUserTyping = () => {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT' ||
            activeElement.isContentEditable
        );
    };

    // Get visit/request dialog information
    const getVisitRequestDialog = () => {
        const title = document.querySelector('.dialog-title.js-dialogTitle');
        const titleText = normalizeText(title?.textContent || '');
        const isValid = title && (titleText === 'visit' || titleText === 'request');
        const dialog = title?.closest('[role="dialog"],.dialog-box,.modal') || document;
        return { title, titleText, isValid, dialog };
    };

    // Scroll to a card by its title
    const scrollToCardByTitle = (cardTitle, pagePathRegex) => {
        // Check if we're on a supported page
        if (pagePathRegex && !pagePathRegex.test(window.location.pathname)) {
            console.log(`Not on a supported page for scrolling to ${cardTitle}`);
            return;
        }

        // Search through all card titles
        const allTitles = document.querySelectorAll('.card-headerTitle');
        let foundTitle = null;

        for (const title of allTitles) {
            if (normalizeText(title.textContent) === normalizeText(cardTitle)) {
                foundTitle = title;
                break;
            }
        }

        if (!foundTitle) {
            console.log(`${cardTitle} card not found on this page`);
            return;
        }

        // Get the parent div.card
        const card = foundTitle.closest('div.card');

        if (card) {
            console.log(`Scrolling to ${cardTitle} card`);
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.log('Could not find parent card element');
        }
    };

    // Create fetch with Jobber headers
    const jobberFetch = (url) => {
        const token = (document.querySelector('meta[name="csrf-token"]') || {}).content || '';

        return fetch(url, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': '*/*;q=0.5, text/javascript, application/javascript, application/ecmascript, application/x-ecmascript',
                'X-Requested-With': 'XMLHttpRequest',
                ...(token ? {'X-CSRF-Token': token} : {})
            }
        });
    };

    // Check if modifier combo matches (platform-aware)
    const isModifierCombo = (event, combo) => {
        const combos = {
            'cmd+ctrl': isMac ?
                (event.metaKey && event.ctrlKey && !event.altKey && !event.shiftKey) :
                (event.ctrlKey && event.altKey && !event.metaKey && !event.shiftKey),
            'cmd+alt': isMac ?
                (event.metaKey && event.altKey && !event.ctrlKey && !event.shiftKey) :
                (event.ctrlKey && event.altKey && !event.metaKey && !event.shiftKey),
            'cmd': isMac ?
                (event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey) :
                (event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey),
            'shift': event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey
        };
        return combos[combo] || false;
    };

    const shortcutSections = [
        {
            title: 'Global',
            shortcuts: [
                { combo: isMac ? 'COMMAND + \\' : 'CTRL + \\', description: "Toggle '<strong>Activity</strong> Feed' side panel" },
                { combo: isMac ? 'COMMAND + OPTION + \\' : 'CTRL + ALT + \\', description: "Toggle '<strong>Messages</strong>' side panel" },
                { combo: isMac ? 'COMMAND + ENTER' : 'CTRL + ENTER', description: 'Click Save button in visit modals, notes, or email forms' },
                { combo: isMac ? 'COMMAND + K' : 'CTRL + K', description: 'Show this shortcuts reference' }
            ]
        },
        {
            title: 'Visit / Request Modals',
            shortcuts: [
                { combo: isMac ? 'COMMAND + CTRL + E' : 'CTRL + ALT + E', description: 'Open <strong>Edit</strong> dialog or click Edit in popover' },
                { combo: isMac ? 'COMMAND + CTRL + T' : 'CTRL + ALT + T', description: 'Open Text <strong>Reminder</strong> dialog' },
                { combo: 'SHIFT + N', description: 'Switch to <strong>Notes</strong> tab' },
                { combo: 'SHIFT + I', description: 'Switch to <strong>Info</strong> tab' }
            ]
        },
        {
            title: 'While in a Visit \'Edit\' Mode',
            shortcuts: [
                { combo: isMac ? 'COMMAND + CTRL + A' : 'CTRL + ALT + A', description: '<strong>Assign</strong> crew' }
            ]
        },
        {
            title: 'Job / Invoice / Quote Pages',
            shortcuts: [
                { combo: 'SHIFT + V', description: 'Scroll to <strong>Visits</strong> section (Job pages only)' },
                { combo: 'SHIFT + N', description: 'Scroll to Internal <strong>Notes</strong> section' }
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
                'font-size: 18px',
                'font-weight: 700',
                'text-transform: titlecase',
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
                combo.innerHTML = shortcut.combo;
                combo.style.cssText = [
                    'font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    'font-size: 13px',
                    'color: #111827'
                ].join(';');

                const description = document.createElement('span');
                description.innerHTML = shortcut.description;
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

    // ========================================
    // SHARED DIALOG OPENER
    // ========================================

    // Generic function to open action dialogs (Edit, Text Reminder, etc.)
    function openActionDialog(actionType, searchCriteria) {
        try {
            const { isValid, dialog } = getVisitRequestDialog();

            if (!isValid) {
                alert('Open the Visit or Request modal first.');
                return;
            }

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

            let actionHref = null;
            for (const html of actionsArray) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const anchor = tempDiv.querySelector('a');
                const text = normalizeText(tempDiv.textContent);
                const href = (anchor && anchor.getAttribute('href')) || '';
                const id = (anchor && anchor.id) || '';

                if (anchor && searchCriteria(text, href, id)) {
                    actionHref = href;
                    break;
                }
            }

            if (!actionHref) {
                console.log('Available actions:', actionsArray);
                alert(`${actionType} action not found.`);
                return;
            }

            jobberFetch(actionHref)
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
                        window.location.href = actionHref;
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert(`Could not open ${actionType}: ` + error.message);
                });

        } catch (error) {
            console.error(error);
            alert('Bookmarklet error: ' + error.message);
        }
    }

    // Function 1: Open Edit Dialog (CMD+CTRL+E)
    function openEditDialog() {
        openActionDialog('Edit', (text, href, id) => {
            return text.includes('edit') || /\/edit\.dialog\b/.test(href);
        });
    }

    // Function 2: Open Text Reminder Dialog (CMD+CTRL+T)
    function openTextReminderDialog() {
        openActionDialog('Text Reminder', (text, href, id) => {
            return id === 'sms' || text.includes('text reminder') || /\/comms\/sms\.dialog\b/.test(href);
        });
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
        const activityButton = document.querySelector('#js-openNotifications') ||
                               document.querySelector('button[aria-label="Open Activity Feed"]');

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
            const { isValid, dialog } = getVisitRequestDialog();

            if (!isValid) {
                alert('Open the Visit or Request modal first.');
                return;
            }

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
            const { isValid, dialog } = getVisitRequestDialog();

            if (!isValid) {
                alert('Open the Visit or Request modal first.');
                return;
            }

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
        scrollToCardByTitle('Visits', /\/work_orders\/\d+/);
    }

    // Function 10: Scroll to Internal Notes Card (SHIFT+N on Job/Invoice/Quote page)
    function scrollToInternalNotesCard() {
        scrollToCardByTitle('Internal notes', /\/(work_orders|invoices|quotes)\/\d+/);
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

    // Keyboard event listener with capture to intercept early - VERY aggressive capture
    // Ultra-aggressive event handler for ALL phases
    const captureShortcutModal = (event) => {
        // DEBUG: Log ALL keys to see what's happening
        console.log('KEY PRESS:', {
            type: event.type,
            key: event.key,
            code: event.code,
            metaKey: event.metaKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            shiftKey: event.shiftKey
        });

        const kPressed = event.code === 'KeyK' || event.key === 'k' || event.key === 'K';

        // On Mac: CMD+K
        // On Windows: CTRL+K
        const wantsShortcutsModal = kPressed && ((isMac && event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) || (!isMac && event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey));

        if (wantsShortcutsModal) {
            console.log('✅ Shortcuts modal triggered!', event.type);
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            // Only toggle on keydown to avoid multiple triggers
            if (event.type === 'keydown') {
                toggleShortcutsModal();
            }
            return false;
        }
    };

    // Add listeners on ALL event types and phases to catch before Jobber does
    document.addEventListener('keydown', captureShortcutModal, true);
    document.addEventListener('keypress', captureShortcutModal, true);
    document.addEventListener('keyup', captureShortcutModal, true);

    // Main keyboard event handler
    document.addEventListener('keydown', function(event) {
        if (isShortcutsModalVisible() && (event.key === 'Escape' || event.code === 'Escape')) {
            event.preventDefault();
            hideShortcutsModal();
            return;
        }

        const kPressed = event.code === 'KeyK' || event.key === 'k' || event.key === 'K';
        // On Mac: CMD+K
        // On Windows: CTRL+K
        const wantsShortcutsModal = kPressed && ((isMac && event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) || (!isMac && event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey));

        if (wantsShortcutsModal) {
            // Already handled above
            return;
        }

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
        if (isModifierCombo(event, 'cmd+ctrl') && event.code === 'KeyE') {
            event.preventDefault();
            openEditDialog();
        }
        // Check for CMD+CTRL+T (Mac) or CTRL+ALT+T (Windows) - Text Reminder
        else if (isModifierCombo(event, 'cmd+ctrl') && event.code === 'KeyT') {
            event.preventDefault();
            openTextReminderDialog();
        }
        // Check for CMD+CTRL+A (Mac) or CTRL+ALT+A (Windows) - Assign Crew
        else if (isModifierCombo(event, 'cmd+ctrl') && event.code === 'KeyA') {
            event.preventDefault();
            assignCrew();
        }
        // Check for CMD+OPTION+\ (Mac) or CTRL+ALT+\ (Windows) - Message Inbox
        else if (isModifierCombo(event, 'cmd+alt') && event.code === 'Backslash') {
            event.preventDefault();
            toggleMessageInbox();
        }
        // Check for CMD+\ (Mac) or CTRL+\ (Windows) - Activity Feed
        else if (isModifierCombo(event, 'cmd') && event.code === 'Backslash') {
            event.preventDefault();
            toggleActivityFeed();
        }
        // Check for SHIFT+N (Switch to Notes Tab in modal OR Scroll to Internal Notes on Job page)
        else if (isModifierCombo(event, 'shift') && event.code === 'KeyN') {
            if (isUserTyping()) {
                return;
            }

            // Check if Visit or Request modal is open first
            const { isValid } = getVisitRequestDialog();

            if (isValid) {
                // We're in a modal - switch to Notes tab
                event.preventDefault();
                switchToNotesTab();
            } else {
                // Check if we're on a job, invoice, or quote page - scroll to Internal Notes
                const isOnSupportedPage = /\/(work_orders|invoices|quotes)\/\d+/.test(window.location.pathname);

                if (isOnSupportedPage) {
                    event.preventDefault();
                    scrollToInternalNotesCard();
                }
                // If neither condition met, let default behavior happen (typing "N")
            }
        }
        // Check for SHIFT+I (Switch to Info Tab)
        else if (isModifierCombo(event, 'shift') && event.code === 'KeyI') {
            if (isUserTyping()) {
                return;
            }

            // Only intercept if Visit or Request modal is open
            const { isValid } = getVisitRequestDialog();

            if (isValid) {
                event.preventDefault();
                switchToInfoTab();
            }
            // If modal is not open, let the default behavior happen (typing "I")
        }
        // Check for SHIFT+V (Scroll to Visits Card)
        else if (isModifierCombo(event, 'shift') && event.code === 'KeyV') {
            if (isUserTyping()) {
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
        else if (event.code === 'Enter' && isModifierCombo(event, 'cmd')) {
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
    console.log(`- ${isMac ? 'CMD+CTRL+E' : 'CTRL+ALT+E'}: Open Edit Dialog`);
    console.log(`- ${isMac ? 'CMD+CTRL+T' : 'CTRL+ALT+T'}: Open Text Reminder Dialog`);
    console.log(`- ${isMac ? 'CMD+CTRL+A' : 'CTRL+ALT+A'}: Assign Crew (in Visit/Request modal)`);
    console.log(`- ${isMac ? 'CMD+K' : 'CTRL+K'}: Show shortcuts help modal`);
    console.log(`- ${isMac ? 'CMD+OPTION+\\' : 'CTRL+ALT+\\'}: Toggle Text Message Inbox`);
    console.log(`- ${isMac ? 'CMD+\\' : 'CTRL+\\'}: Toggle Activity Feed`);
    console.log('- SHIFT+N: Switch to Notes Tab (in modal) OR Scroll to Internal Notes (on Job, Invoice, Quote pages)');
    console.log('- SHIFT+I: Switch to Info Tab (in Visit/Request modal)');
    console.log('- SHIFT+V: Scroll to Visits Card (on Job page)');
    console.log(`- ${isMac ? 'CMD+ENTER' : 'CTRL+ENTER'}: Click Save Button`);
    console.log('========================================');
})();