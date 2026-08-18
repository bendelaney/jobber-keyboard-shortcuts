// Jobber Actions Consolidated
// Version 3.4
// Author: Ben Delaney

/* ************************
KEYBOARD SHORTCUTS:
**************************

Global:
- CMD + \ : Toggle 'Activity Feed' side panel
- CMD + OPTION + \ : Toggle 'Messages' side panel
- CMD + ENTER : Click Save/Send Button (while in any Visit Modal, Note input, email form, text message form, or new note form.)
- CMD + / : Show keyboard shortcuts reference

While viewing a JOB VISIT Modal or Scheduler Popover:
 - CMD + CTRL + E : Open visit Edit dialog (or click Edit in popover)
 - CMD + CTRL + T : Open Text Reminder dialog
 - SHIFT + N : Switch to Notes Tab
 - SHIFT + I : Switch to Info Tab

While in the 'EDIT' mode of a Job Visit Modal:
 - CMD + CTRL + A : Assign Crew

While on a Job page:
 - SHIFT + V : Scroll to Scheduled visits section

While on Job, Invoice, or Quote pages:
 - SHIFT + N : Start a new note
*/

(function() {
    'use strict';

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    // Utility function to normalize text
    const normalizeText = (s) => (s || '').trim().toLowerCase();
    const visitRequestViewDialogTitles = new Set(['visit', 'request', 'visit details', 'request details']);
    const visitRequestAnyDialogTitles = new Set(['visit', 'request', 'visit details', 'request details', 'edit visit', 'edit request']);

    const isElementVisible = (element) => {
        if (!element) {
            return false;
        }

        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0;
    };

    const isVisitRequestViewDialogTitle = (titleText) => visitRequestViewDialogTitles.has(titleText);

    const isVisitRequestDialogTitle = (titleText) => visitRequestAnyDialogTitles.has(titleText);

    const getDialogTitleText = (dialog) => normalizeText(
        dialog?.querySelector('.dialog-title.js-dialogTitle, #ATL-Modal-Header, [data-testid="modal-header"] h1, [data-testid="modal-header"] h2, [data-testid="modal-header"] [role="heading"]')?.textContent || ''
    );

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

    const getElementActionText = (element) => normalizeText(
        element?.textContent ||
        element?.value ||
        element?.getAttribute('aria-label') ||
        element?.getAttribute('title') ||
        ''
    );

    const pressElement = (element) => {
        if (!element) {
            return;
        }

        element.focus?.({ preventScroll: true });

        ['pointerdown', 'mousedown', 'pointerup', 'mouseup'].forEach((eventType) => {
            const EventConstructor = eventType.startsWith('pointer') && window.PointerEvent ? window.PointerEvent : window.MouseEvent;
            const eventOptions = {
                bubbles: true,
                cancelable: true,
                view: window,
                button: 0,
                buttons: eventType.endsWith('down') ? 1 : 0,
                pointerId: 1,
                pointerType: 'mouse',
                isPrimary: true
            };

            try {
                element.dispatchEvent(new EventConstructor(eventType, eventOptions));
            } catch (error) {
                element.dispatchEvent(new MouseEvent(eventType, eventOptions));
            }
        });

        try {
            element.click?.();
        } catch (error) {
            console.warn('Element click activation failed:', error);
        }
    };

    const pressKeyOnElement = (element, key = 'Enter') => {
        if (!element) {
            return;
        }

        element.focus?.({ preventScroll: true });
        const code = key === ' ' ? 'Space' : key;
        ['keydown', 'keyup'].forEach((eventType) => {
            element.dispatchEvent(new KeyboardEvent(eventType, {
                bubbles: true,
                cancelable: true,
                key,
                code
            }));
        });
    };

    const getVisibleSendSubmitButton = (form) => Array.from(form.querySelectorAll('button[type="submit"], input[type="submit"]')).find((button) => {
        const actionText = getElementActionText(button);
        return isElementVisible(button) &&
            !button.disabled &&
            button.getAttribute('aria-disabled') !== 'true' &&
            (actionText === 'send' || actionText.includes('send message') || actionText.includes('send text'));
    }) || null;

    const getActiveSendTextForm = () => {
        const sendTextForms = Array.from(document.querySelectorAll('form')).map((form) => {
            const textarea = form.querySelector('textarea[name="message"]');
            const sendButton = getVisibleSendSubmitButton(form);

            if (!textarea || !sendButton || !isElementVisible(form) || !isElementVisible(textarea)) {
                return null;
            }

            const hasRecipientField = Boolean(
                form.querySelector('input[aria-label="recipient" i], input#To, input[placeholder*="mobile" i], input[placeholder*="phone" i]')
            );
            const hasMessageLabel = Array.from(form.querySelectorAll('label')).some((label) => {
                const labelFor = label.getAttribute('for');
                return normalizeText(label.textContent) === 'message' || (textarea.id && labelFor === textarea.id);
            });
            const hasMessageCounter = Boolean(form.querySelector('[aria-label^="Message length" i], [aria-label*="characters" i]'));
            const hasClientHubPreview = normalizeText(form.textContent).includes('your client can view') || normalizeText(form.textContent).includes('tap https://');
            const isLegacySmsDialog = Boolean(form.closest('.js-sendToClientDialogSms'));

            if (!hasRecipientField && !hasMessageLabel && !hasMessageCounter && !hasClientHubPreview && !isLegacySmsDialog) {
                return null;
            }

            return { container: form, textarea, sendButton };
        }).filter(Boolean);

        const activeForm = sendTextForms.find(({ container, textarea, sendButton }) =>
            textarea === document.activeElement || sendButton === document.activeElement || container.contains(document.activeElement)
        );
        if (activeForm) {
            return activeForm;
        }

        const populatedForm = sendTextForms.find(({ textarea }) => textarea.value.trim());
        if (populatedForm) {
            return populatedForm;
        }

        if (sendTextForms.length) {
            return sendTextForms[0];
        }

        return null;
    };

    const submitSendTextForm = ({ textarea, sendButton }) => {
        if (textarea) {
            ['input', 'change'].forEach((eventType) => {
                textarea.dispatchEvent(new Event(eventType, { bubbles: true }));
            });
        }

        console.log('Send text form detected, clicking Send button');
        sendButton.click();
    };

    // Check if we're in the Messages interface - robust detection
    const isInMessagesInterface = () => {
        // Check for various possible selectors for the send button
        const sendButton =
            getActiveSendTextForm() ||
            document.querySelector('button[aria-label="send"]') ||
            document.querySelector('button[aria-label="Send"]') ||
            document.querySelector('button[aria-label="Send message"]') ||
            document.querySelector('button[aria-label="Send Message"]') ||
            // Check for send button by icon or class patterns
            document.querySelector('button[type="submit"][aria-label*="end" i]') ||
            // Check for Messages panel visibility
            (document.querySelector('[data-testid="message-center"]') &&
             document.querySelector('[data-testid="message-center"] button[type="submit"]')) ||
            // Check for text message inbox panel
            (document.querySelector('[aria-label*="Message" i]') &&
             document.querySelector('form button[type="submit"]'));

        return Boolean(sendButton);
    };

    const findMoreActionsButton = (container = document) => {
        const candidates = Array.from(container.querySelectorAll(
            '[aria-label="More Actions"], [aria-label^="More Actions" i], [data-custom-action-name*="More Actions" i], [role="button"][aria-haspopup="true"], button[aria-haspopup="true"]'
        ));

        return candidates.find((candidate) => {
            if (!isElementVisible(candidate)) {
                return false;
            }

            const actionText = getElementActionText(candidate);
            return actionText.includes('more actions') || Boolean(candidate.querySelector('button, svg[data-testid="more"]'));
        }) || null;
    };

    // Get visit/request dialog information
    const getVisitRequestDialog = ({ includeEdit = false } = {}) => {
        const titleMatcher = includeEdit ? isVisitRequestDialogTitle : isVisitRequestViewDialogTitle;
        const visibleDialogs = Array.from(document.querySelectorAll('[role="dialog"],.dialog-box,.modal')).reverse().filter(isElementVisible);
        const titledDialog = visibleDialogs.find((candidate) => {
            const titleText = getDialogTitleText(candidate);
            return titleMatcher(titleText);
        }) || null;
        const fallbackDialog = titledDialog || visibleDialogs.find((candidate) => findMoreActionsButton(candidate)) || null;
        const dialog = fallbackDialog;
        const title = dialog?.querySelector('.dialog-title.js-dialogTitle') || null;
        const titleText = normalizeText(title?.textContent || '');
        const isValid = Boolean(titledDialog || (dialog && findMoreActionsButton(dialog)));
        return { title, titleText, isValid, dialog: dialog || document };
    };

    const getActiveVisitRequestNoteForm = () => {
        const { isValid, dialog } = getVisitRequestDialog();
        if (!isValid || !isElementVisible(dialog)) {
            return null;
        }

        const noteForms = Array.from(dialog.querySelectorAll('form')).map((form) => {
            const textarea = form.querySelector('textarea[name="message"], textarea[name="note[message]"]');
            const saveButton = Array.from(form.querySelectorAll('button[type="submit"], input[type="submit"]')).find((button) => isElementVisible(button));

            if (!textarea || !saveButton || !isElementVisible(form) || !isElementVisible(textarea)) {
                return null;
            }

            return { container: form, textarea, saveButton };
        }).filter(Boolean);

        const activeForm = noteForms.find(({ container, textarea, saveButton }) => textarea === document.activeElement || saveButton === document.activeElement || container.contains(document.activeElement));
        if (activeForm) {
            return activeForm;
        }

        const populatedForm = noteForms.find(({ textarea }) => textarea.value.trim());
        if (populatedForm) {
            return populatedForm;
        }

        if (noteForms.length) {
            return noteForms[0];
        }

        return null;
    };

    const getLeaveNoteTextareaInForm = (form) => {
        if (!form || !isElementVisible(form)) {
            return null;
        }

        const labels = Array.from(form.querySelectorAll('label')).filter((label) =>
            isElementVisible(label) && normalizeText(label.textContent) === 'leave a note'
        );

        for (const label of labels) {
            const fieldId = label.getAttribute('for');
            const textarea = fieldId ? document.getElementById(fieldId) : label.parentElement?.querySelector('textarea');
            if (textarea && form.contains(textarea) && textarea.tagName === 'TEXTAREA' && isElementVisible(textarea)) {
                return textarea;
            }
        }

        return null;
    };

    const getVisibleSaveSubmitButton = (form) => Array.from(form.querySelectorAll('button[type="submit"], input[type="submit"]')).find((button) => {
        const actionText = getElementActionText(button);
        return isElementVisible(button) &&
            !button.disabled &&
            button.getAttribute('aria-disabled') !== 'true' &&
            (actionText === 'save' || actionText.includes('save note'));
    }) || null;

    const getActiveNewNoteForm = () => {
        const noteForms = Array.from(document.querySelectorAll('form')).map((form) => {
            const textarea = getLeaveNoteTextareaInForm(form);
            const saveButton = getVisibleSaveSubmitButton(form);

            if (!textarea || !saveButton) {
                return null;
            }

            return { container: form, textarea, saveButton };
        }).filter(Boolean);

        const activeForm = noteForms.find(({ container, textarea, saveButton }) =>
            textarea === document.activeElement || saveButton === document.activeElement || container.contains(document.activeElement)
        );
        if (activeForm) {
            return activeForm;
        }

        const populatedForm = noteForms.find(({ textarea }) => textarea.value.trim());
        if (populatedForm) {
            return populatedForm;
        }

        if (noteForms.length) {
            return noteForms[0];
        }

        return null;
    };

    const submitNewNoteForm = ({ textarea, saveButton }) => {
        if (textarea) {
            ['input', 'change', 'keyup'].forEach((eventType) => {
                textarea.dispatchEvent(new Event(eventType, { bubbles: true }));
            });
        }

        setTimeout(() => {
            console.log('New note form detected, clicking Save button');
            saveButton.click();
        }, 150);
    };

    const getScrollableAncestor = (element) => {
        let current = element?.parentElement || null;

        while (current && current !== document.body && current !== document.documentElement) {
            const style = window.getComputedStyle(current);
            const canScrollY = /(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight + 1;
            if (canScrollY) {
                return current;
            }
            current = current.parentElement;
        }

        return document.scrollingElement || document.documentElement;
    };

    const scrollElementIntoContainerView = (element, offset = 16) => {
        const scrollContainer = getScrollableAncestor(element);

        if (!scrollContainer || scrollContainer === document.documentElement || scrollContainer === document.body) {
            const targetTop = element.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
            return scrollContainer;
        }

        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const targetTop = scrollContainer.scrollTop + elementRect.top - containerRect.top - offset;
        scrollContainer.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
        return scrollContainer;
    };

    // Scroll to a card/section by its heading text
    const scrollToCardByTitle = (cardTitle, pagePathRegex, aliases = []) => {
        // Check if we're on a supported page
        if (pagePathRegex && !pagePathRegex.test(window.location.pathname)) {
            console.log(`Not on a supported page for scrolling to ${cardTitle}`);
            return;
        }

        const titleMatches = new Set([cardTitle, ...aliases].map(normalizeText));
        const allTitles = document.querySelectorAll('.card-headerTitle, h1, h2, h3, h4, [role="heading"]');
        let foundTitle = null;

        for (const title of allTitles) {
            if (isElementVisible(title) && titleMatches.has(normalizeText(title.textContent))) {
                foundTitle = title;
                break;
            }
        }

        if (!foundTitle) {
            console.log(`${cardTitle} section not found on this page`);
            return;
        }

        const scrollTarget =
            foundTitle.closest('div.card') ||
            foundTitle.closest('section, article, [data-testid="ATL-Card"]') ||
            foundTitle.parentElement;

        if (scrollTarget) {
            console.log(`Scrolling to ${foundTitle.textContent.trim() || cardTitle} section`);
            scrollElementIntoContainerView(scrollTarget);
        } else {
            console.log('Could not find section element to scroll to');
        }
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
                { combo: isMac ? 'COMMAND + /' : 'CTRL + /', description: ['Show this shortcuts reference'] },
                { combo: isMac ? 'COMMAND + \\' : 'CTRL + \\', description: ['Toggle ', { strong: 'Activity Feed' }, ' side panel'] },
                { combo: isMac ? 'COMMAND + OPTION + \\' : 'CTRL + ALT + \\', description: ['Toggle ', { strong: 'Messages' }, ' side panel'] },
                { combo: isMac ? 'COMMAND + ENTER' : 'CTRL + ENTER', description: ['Click ', { strong: 'Save/Send' }, ' button in visit modals, notes, email forms, text message forms, or new note forms'] },
            ]
        },
        {
            title: 'Visit / Request Modals',
            shortcuts: [
                { combo: isMac ? 'COMMAND + CTRL + E' : 'CTRL + ALT + E', description: ['Open ', { strong: 'Edit' }, ' dialog or click Edit in popover'] },
                { combo: isMac ? 'COMMAND + CTRL + T' : 'CTRL + ALT + T', description: ['Open ', { strong: 'Text' }, ' Reminder dialog'] },
                { combo: isMac ? 'COMMAND + CTRL + A' : 'CTRL + ALT + A', description: [{ strong: 'Assign' }, ' crew'] },
                { combo: 'SHIFT + N', description: ['Switch to ', { strong: 'Notes' }, ' tab'] },
                { combo: 'SHIFT + I', description: ['Switch to ', { strong: 'Info' }, ' tab'] },
            ]
        },
        {
            title: 'Job / Invoice / Quote Pages',
            shortcuts: [
                { combo: 'SHIFT + V', description: ['Scroll to ', { strong: 'Scheduled visits' }, ' section (Job pages only)'] },
                { combo: 'SHIFT + N', description: ['Start a new ', { strong: 'Note' }] }
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
        const moreInfoLink = document.createElement('a');
        moreInfoLink.href = 'https://github.com/bendelaney/jobber-keyboard-shortcuts';
        moreInfoLink.target = '_blank';
        moreInfoLink.rel = 'noopener';
        moreInfoLink.textContent = 'more info';
        subtitle.appendChild(moreInfoLink);
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
                combo.textContent = shortcut.combo;
                combo.style.cssText = [
                    'font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    'font-size: 13px',
                    'color: #111827'
                ].join(';');

                const description = document.createElement('span');
                shortcut.description.forEach((part) => {
                    if (typeof part === 'string') {
                        description.appendChild(document.createTextNode(part));
                        return;
                    }

                    const strong = document.createElement('strong');
                    strong.textContent = part.strong;
                    description.appendChild(strong);
                });
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
                          dialog.querySelector('button.js-dropdownButton') ||
                          findMoreActionsButton(dialog);

            if (!button) {
                alert('More Actions button not found.');
                return;
            }

            // Use Jobber's rendered menu rather than executing response scripts or
            // parsing action HTML. This works with both the legacy and current UI.
            const innerButton = button.matches('button') ? null : button.querySelector('button');
            pressElement(button);
            const findAndClickItem = (attemptsLeft) => {
                const menuItems = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"], a[href]')).filter(isElementVisible);
                for (const item of menuItems) {
                    const text = normalizeText(item.textContent);
                    const href = item.getAttribute('href') || '';
                    const id = item.id || '';
                    const iconName = item.querySelector('svg[data-testid]')?.getAttribute('data-testid') || '';
                    if (searchCriteria(text, href, id, iconName)) {
                        console.log(`Clicking ${actionType} in dropdown menu...`);
                        pressElement(item);
                        if (item.tagName !== 'A') {
                            pressKeyOnElement(item, 'Enter');
                        }
                        return;
                    }
                }

                if (attemptsLeft === 9 && innerButton) {
                    pressElement(innerButton);
                } else if (attemptsLeft === 7) {
                    pressKeyOnElement(button, 'Enter');
                } else if (attemptsLeft === 5 && innerButton) {
                    pressElement(innerButton);
                }

                if (attemptsLeft > 0) {
                    setTimeout(() => findAndClickItem(attemptsLeft - 1), 100);
                } else {
                    pressElement(button); // close the menu
                    alert(`${actionType} action not found in dropdown menu.`);
                }
            };
            setTimeout(() => findAndClickItem(12), 150);

        } catch (error) {
            console.error(error);
            alert('Bookmarklet error: ' + error.message);
        }
    }

    // Function 1: Open Edit Dialog (CMD+CTRL+E)
    function openEditDialog() {
        openActionDialog('Edit', (text, href, id, iconName) => {
            return text === 'edit' || text.includes('edit') || iconName === 'edit' || /\/edit\.dialog\b/.test(href);
        });
    }

    // Function 1b: Click Edit button in Popover Modal (scheduler view)
    function clickEditInPopover() {
        // Look for an open popover with data-mode="view"
        const popover = document.querySelector('div[data-testid="popover"][data-open="true"][data-mode="view"]');

        if (!popover) {
            return false; // No popover found
        }

        // Find the Edit button inside the popover
        // Structure: ._buttonContainer_*_1 > ._button_*_1 > button > span (text: "Edit")
        const buttonContainer = popover.querySelector('[class*="_buttonContainer_"]');

        if (!buttonContainer) {
            return false;
        }

        // Find all buttons in the container and look for one with "Edit" text
        const buttons = buttonContainer.querySelectorAll('button');
        for (const button of buttons) {
            const span = button.querySelector('span');
            if (span && normalizeText(span.textContent) === 'edit') {
                console.log('Edit button found in popover, clicking...');
                button.click();
                return true; // Successfully clicked
            }
        }

        return false; // Edit button not found in popover
    }

    // Function 2: Open Text Reminder Dialog (CMD+CTRL+T)
    function openTextReminderDialog() {
        openActionDialog('Text Reminder', (text, href, id, iconName) => {
            return id === 'sms' || iconName === 'sms' || text.includes('text reminder') || /\/comms\/sms\.dialog\b/.test(href);
        });
    }

    // Find a "Save" submit button in a modern (React) Jobber form — e.g. the Task form.
    // Scoped to the focused form first, then any open dialog, then a single unambiguous
    // page-level form, so it can't hijack legacy note/to-do saves.
    const findGenericSaveSubmitButton = () => {
        const isLegacyNoteScope = (scope) => Boolean(
            scope.querySelector('.js-noteContainer, button.js-saveNote, textarea[name="note[message]"]')
        );

        const pickSaveButton = (scope) => {
            if (!scope || isLegacyNoteScope(scope)) {
                return null;
            }

            const submitButtons = Array.from(scope.querySelectorAll('button[type="submit"], input[type="submit"]'))
                .filter((button) => isElementVisible(button) && !button.disabled && button.getAttribute('aria-busy') !== 'true');

            return submitButtons.find((button) => normalizeText(button.textContent || button.value || '') === 'save')
                || submitButtons.find((button) => normalizeText(button.textContent || button.value || '').includes('save'))
                || null;
        };

        // 1. The form that currently has focus (typing in Title/Instructions/etc.)
        const focusedForm = document.activeElement && document.activeElement !== document.body
            ? document.activeElement.closest('form')
            : null;
        const focusedFormSave = pickSaveButton(focusedForm);
        if (focusedFormSave) {
            return focusedFormSave;
        }

        // 2. The topmost open dialog/modal
        const visibleDialogs = Array.from(document.querySelectorAll('[role="dialog"], .dialog-box, .modal'))
            .reverse()
            .filter(isElementVisible);
        for (const dialog of visibleDialogs) {
            const dialogSave = pickSaveButton(dialog);
            if (dialogSave) {
                return dialogSave;
            }
        }

        // 3. A single unambiguous form on the page with a visible Save submit button
        const pageFormSaves = Array.from(document.querySelectorAll('form'))
            .filter(isElementVisible)
            .map(pickSaveButton)
            .filter(Boolean);
        return pageFormSaves.length === 1 ? pageFormSaves[0] : null;
    };

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

        // SECOND PRIORITY: Check for SMS/send text dialog send button
        const smsDialog = document.querySelector('.js-sendToClientDialogSms');
        if (smsDialog) {
            const smsSendButton = smsDialog.querySelector('button.js-formSubmit[data-form="form.sendToClientDialogSms"]');
            if (smsSendButton) {
                console.log('SMS dialog detected, clicking send button');
                smsSendButton.click();
                return;
            }
        }

        const activeSendTextForm = getActiveSendTextForm();
        if (activeSendTextForm) {
            submitSendTextForm(activeSendTextForm);
            return;
        }

        // Visit/Request edit modal (new Jobber UI): find a visible "Save" submit button inside the dialog
        const { isValid: visitEditValid, dialog: visitEditDialog } = getVisitRequestDialog({ includeEdit: true });
        if (visitEditValid && visitEditDialog && visitEditDialog !== document) {
            const submitButtons = Array.from(visitEditDialog.querySelectorAll('button[type="submit"], input[type="submit"]')).filter(isElementVisible);
            const saveSubmit = submitButtons.find((button) => normalizeText(button.textContent || button.value || '') === 'save')
                || submitButtons.find((button) => normalizeText(button.textContent || button.value || '').includes('save'));
            if (saveSubmit) {
                console.log('Visit/Request edit modal detected, clicking Save submit button');
                saveSubmit.click();
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

        const activeNewNoteForm = getActiveNewNoteForm();
        if (activeNewNoteForm) {
            submitNewNoteForm(activeNewNoteForm);
            return;
        }

        // Modern Jobber forms (Task form, etc.): click the form's own Save submit button
        const genericSaveButton = findGenericSaveSubmitButton();
        if (genericSaveButton) {
            console.log('Modern form detected, clicking Save submit button');
            genericSaveButton.click();
            return;
        }

        // FOURTH PRIORITY: Note forms, prioritize modal context over main page
        console.log('Looking for note save functionality...');

        let activeContainer = null;
        let activeTextarea = null;
        let activeSaveButton = null;

        const activeVisitRequestNoteForm = getActiveVisitRequestNoteForm();
        if (activeVisitRequestNoteForm) {
            activeContainer = activeVisitRequestNoteForm.container;
            activeTextarea = activeVisitRequestNoteForm.textarea;
            activeSaveButton = activeVisitRequestNoteForm.saveButton;
            console.log('Found active note form in visit/request modal');
        }

        // Strategy 1: Check if there's a dialog/modal open first
        const modal = document.querySelector('.dialog-box, [role="dialog"], .modal');
        if (!activeContainer && modal) {
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
        const messageButton = document.querySelector('button[aria-label="Open Text Message Inbox"]') ||
                              document.querySelector('button[aria-label="Open Message Center"]');

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
                               document.querySelector('button[aria-label="Open Activity Feed"]') ||
                               document.querySelector('button[aria-label^="Open Activity Feed" i]') ||
                               document.querySelector('button[data-custom-action-name*="Open Activity Feed" i]') ||
                               Array.from(document.querySelectorAll('button')).find((button) =>
                                   normalizeText(button.getAttribute('aria-label')).includes('activity feed') &&
                                   button.querySelector('svg[data-testid="reminder"]')
                               );

        if (activityButton) {
            console.log('Activity feed button found, clicking...');
            activityButton.click();
        } else {
            alert('Activity feed button not found');
        }
    }

    // Helper: focus the note field inside a container (contenteditable Lexical
    // editor first, legacy textarea as fallback) and place the caret at the end.
    function focusNoteField(container) {
        const scope = container || document;

        // Newer Jobber note editor is a contenteditable Lexical field.
        const noteEditor = Array.from(
            scope.querySelectorAll('[contenteditable="true"][role="textbox"]')
        ).find((el) =>
            isElementVisible(el) &&
            normalizeText(el.getAttribute('aria-label') || '') === 'leave a note'
        ) || scope.querySelector('[contenteditable="true"][aria-label="Leave a note"]');

        if (noteEditor) {
            console.log('Focusing Notes editor');
            noteEditor.focus();
            // Place the caret at the end of any existing content.
            try {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(noteEditor);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (e) {
                console.warn('Could not set caret in Notes editor', e);
            }
            return true;
        }

        // Legacy textarea fallback.
        const notesTextarea = scope.querySelector('textarea[name="message"], textarea[name="note[message]"]');
        if (notesTextarea) {
            console.log('Focusing Notes textarea');
            notesTextarea.focus();
            return true;
        }

        console.warn('Notes field not found after tab switch');
        return false;
    }

    // Function 6: Switch to Notes Tab (SHIFT+N)
    function switchToNotesTab() {
        try {
            const { isValid, dialog } = getVisitRequestDialog();

            if (!isValid) {
                alert('Open the Visit or Request modal first.');
                return;
            }

            const notesTab = Array.from(dialog.querySelectorAll('button[role="tab"]')).find(
                tab => normalizeText(tab.textContent).includes('notes')
            );

            if (!notesTab) {
                alert('Notes tab not found.');
                return;
            }

            console.log('Clicking Notes tab');
            notesTab.click();

            // Wait for the tab to switch, then focus the note field
            setTimeout(() => {
                focusNoteField(dialog);
            }, 100);

        } catch (error) {
            console.error(error);
            alert('Error switching to Notes tab: ' + error.message);
        }
    }

    // Function 7: Assign Crew (CMD+CTRL+A)
    function assignCrew() {
        // Look for an open popover with data-mode="view"
        const popover = document.querySelector('div[data-testid="popover"][data-open="true"][data-mode="view"]');
        if (popover) {
            // Find the H5 containing "Team"
            const teamHeadings = popover.querySelectorAll('h5');
            let teamButton = null;

            for (const heading of teamHeadings) {
                if (normalizeText(heading.textContent) === 'team') {
                    // Find the next button after this heading (traverse siblings)
                    let nextElement = heading.nextElementSibling;
                    while (nextElement) {
                        const button = nextElement.querySelector('button[role="combobox"]');
                        if (button) {
                            teamButton = button;
                            break;
                        }
                        nextElement = nextElement.nextElementSibling;
                    }
                    break;
                }
            }

            if (teamButton) {
                console.log('Assign Crew button found in popover, clicking...');
                teamButton.click();
                return;
            } else {
                console.log('Assign Crew button not found in popover');
                // Continue to try the regular modal approach below
            }
        }
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

            const infoTab = Array.from(dialog.querySelectorAll('button[role="tab"]')).find(
                tab => normalizeText(tab.textContent).trim() === 'info'
            );

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

    const isJobPagePath = () => /\/(work_orders|jobs)\/\d+/.test(window.location.pathname);
    const isNotesShortcutPagePath = () => /\/(work_orders|jobs|invoices|quotes)\/\d+/.test(window.location.pathname);

    // Function 9: Scroll to Scheduled Visits section (SHIFT+V)
    function scrollToVisitsCard() {
        scrollToCardByTitle('Visits', /\/(work_orders|jobs)\/\d+/, ['Scheduled visits']);
    }

    const getNewNoteTextarea = () => {
        const leaveNoteLabels = Array.from(document.querySelectorAll('label')).filter((label) =>
            isElementVisible(label) && normalizeText(label.textContent) === 'leave a note'
        );

        for (const label of leaveNoteLabels) {
            const fieldId = label.getAttribute('for');
            const textarea = fieldId ? document.getElementById(fieldId) : label.parentElement?.querySelector('textarea');
            if (textarea && textarea.tagName === 'TEXTAREA' && isElementVisible(textarea)) {
                return textarea;
            }
        }

        return Array.from(document.querySelectorAll('textarea[name="message"]')).find((textarea) => {
            if (!isElementVisible(textarea)) {
                return false;
            }

            let container = textarea.parentElement;
            while (container && container !== document.body) {
                const hasLeaveNoteLabel = Array.from(container.querySelectorAll('label')).some((label) =>
                    normalizeText(label.textContent) === 'leave a note'
                );
                if (hasLeaveNoteLabel) {
                    return true;
                }
                container = container.parentElement;
            }

            return false;
        }) || null;
    };

    // The note field is either the newer contenteditable Lexical editor or the
    // legacy textarea, depending on the page.
    const getNewNoteField = () => {
        const noteEditor = Array.from(document.querySelectorAll('[contenteditable="true"]')).find((element) =>
            isElementVisible(element) && normalizeText(element.getAttribute('aria-label') || '') === 'leave a note'
        );

        return noteEditor || getNewNoteTextarea();
    };

    const focusNewNoteField = (attemptsLeft = 20) => {
        const field = getNewNoteField();
        if (field) {
            if (field.isContentEditable) {
                focusNoteField(document);
            } else {
                console.log('Focusing new note textarea');
                field.focus();
            }
            return;
        }

        if (attemptsLeft > 0) {
            setTimeout(() => focusNewNoteField(attemptsLeft - 1), 100);
        } else {
            console.warn('New note field not found after clicking Add note');
        }
    };

    // Matchers ordered strongest-signal first, so a specific "Add note" control
    // wins over a generic button that merely contains the word "add".
    const addNoteButtonMatchers = [
        (button) => ['add', 'add note'].includes(normalizeText(button.getAttribute('aria-label'))),
        (button) => {
            const text = normalizeText(button.textContent);
            return text.includes('leave an internal note') || text.includes('leave a note') || text.includes('add note');
        },
        (button) => !!button.querySelector('svg[data-testid="add"]'),
        // Empty-state well: the add/addNote icons live in a sibling of the button,
        // so the button itself carries no "add" text or icon.
        (button) => {
            const well = button.closest('[data-slot="well"]');
            return !!well && !!well.querySelector('svg[data-testid="addNote"], svg[data-testid="add"]');
        },
        (button) => normalizeText(button.textContent).includes('add')
    ];

    const findAddNoteButtonIn = (container) => {
        const buttons = Array.from(container.querySelectorAll('button')).filter(isElementVisible);

        for (const matches of addNoteButtonMatchers) {
            const button = buttons.find(matches);
            if (button) {
                return button;
            }
        }

        return null;
    };

    // Function 10: Start a new note (SHIFT+N on Job/Invoice/Quote page)
    function startNewNote() {
        const notesHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, [role="heading"]')).filter((heading) =>
            isElementVisible(heading) && normalizeText(heading.textContent) === 'notes'
        );

        let addNoteButton = null;

        // Widen the search from each Notes heading outward: the empty-state well
        // is not always a sibling of the heading.
        for (const heading of notesHeadings) {
            let container = heading.parentElement;

            for (let depth = 0; container && container !== document.body && depth < 6; depth += 1) {
                addNoteButton = findAddNoteButtonIn(container);
                if (addNoteButton) {
                    break;
                }
                container = container.parentElement;
            }

            if (addNoteButton) {
                break;
            }
        }

        // Fallback: an empty-state note well anywhere on the page.
        if (!addNoteButton) {
            addNoteButton = Array.from(document.querySelectorAll('[data-slot="well"]')).reduce((found, well) => {
                if (found || !well.querySelector('svg[data-testid="addNote"]')) {
                    return found;
                }
                return Array.from(well.querySelectorAll('button')).find(isElementVisible) || found;
            }, null);
        }

        if (!addNoteButton) {
            alert('Add note button not found on this page.');
            return;
        }

        console.log('Notes Add button found, clicking...');
        addNoteButton.click();
        focusNewNoteField();
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
        // DEBUG: Uncomment to log all keys while investigating shortcut capture issues.
        // console.log('KEY PRESS:', {
        //     type: event.type,
        //     key: event.key,
        //     code: event.code,
        //     metaKey: event.metaKey,
        //     ctrlKey: event.ctrlKey,
        //     altKey: event.altKey,
        //     shiftKey: event.shiftKey
        // });

        const slashPressed = event.code === 'Slash' || event.key === '/' || event.key === '?';

        // On Mac: CMD+/
        // On Windows: CTRL+/
        const wantsShortcutsModal = slashPressed && ((isMac && event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) || (!isMac && event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey));
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

        const slashPressed = event.code === 'Slash' || event.key === '/' || event.key === '?';
        // On Mac: CMD+/
        // On Windows: CTRL+/
        const wantsShortcutsModal = slashPressed && ((isMac && event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) || (!isMac && event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey));

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

            // Check if we're in a Messages textarea
            const target = event.target;
            if (target && target.tagName === 'TEXTAREA' && isInMessagesInterface()) {
                // We're in the Messages interface, prevent default ENTER behavior
                console.log('BLOCKING ENTER/Option+ENTER in Messages interface');
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                return false;
            }
        }

        // Check for CMD+CTRL+E (Mac) or CTRL+ALT+E (Windows) - Edit
        if (isModifierCombo(event, 'cmd+ctrl') && event.code === 'KeyE') {
            event.preventDefault();

            // First try clicking Edit button in popover (scheduler view)
            const popoverHandled = clickEditInPopover();

            // If no popover was found/handled, try the regular edit dialog
            if (!popoverHandled) {
                openEditDialog();
            }
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
        // Check for SHIFT+N (Switch to Notes Tab in modal OR start a new note on Job/Invoice/Quote page)
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
                // Check if we're on a job, invoice, or quote page - start a new note
                const isOnSupportedPage = isNotesShortcutPagePath();

                if (isOnSupportedPage) {
                    event.preventDefault();
                    startNewNote();
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
        // Check for SHIFT+V (Scroll to Scheduled Visits section)
        else if (isModifierCombo(event, 'shift') && event.code === 'KeyV') {
            if (isUserTyping()) {
                return;
            }

            // Only intercept if we're on a job page
            const isJobPage = isJobPagePath();

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

            // Check if we're in the Messages interface
            const target = event.target;

            const activeSendTextForm = getActiveSendTextForm();

            // A modern form with its own Save button (e.g. the Task form) wins over the
            // loose Messages-interface heuristic, which matches any page with a submit button
            const targetForm = target && target.closest ? target.closest('form') : null;
            const targetFormSaveButton = findGenericSaveSubmitButton();
            const isInSaveableForm = Boolean(targetForm && targetFormSaveButton && targetForm.contains(targetFormSaveButton));

            if (target && target.tagName === 'TEXTAREA' && activeSendTextForm && activeSendTextForm.container.contains(target)) {
                // We're in the modern Send Text form, send the message
                event.stopPropagation();
                event.stopImmediatePropagation();
                console.log('CMD+ENTER in Send Text form: sending message');
                submitSendTextForm(activeSendTextForm);
            } else if (target && target.tagName === 'TEXTAREA' && !isInSaveableForm && isInMessagesInterface()) {
                // We're in Messages interface, send the message
                // Find the send button using multiple strategies
                const sendButton =
                    document.querySelector('button[aria-label="send"]') ||
                    document.querySelector('button[aria-label="Send"]') ||
                    document.querySelector('button[aria-label="Send message"]') ||
                    document.querySelector('button[aria-label="Send Message"]') ||
                    document.querySelector('button[type="submit"][aria-label*="end" i]');

                if (sendButton) {
                    // Stop propagation to prevent Jobber's own handler from also sending
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    console.log('CMD+ENTER in Messages: sending message');
                    sendButton.click();
                } else {
                    console.log('Messages interface detected but send button not found');
                    clickSaveButton();
                }
            } else {
                // Not in Messages, use regular save functionality
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
            if (target && target.tagName === 'TEXTAREA' && isInMessagesInterface()) {
                console.log('BLOCKING ENTER/Option+ENTER via keypress event');
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                return false;
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
    console.log(`- ${isMac ? 'CMD+/' : 'CTRL+/'}: Show shortcuts help modal`);
    console.log(`- ${isMac ? 'CMD+OPTION+\\' : 'CTRL+ALT+\\'}: Toggle Text Message Inbox`);
    console.log(`- ${isMac ? 'CMD+\\' : 'CTRL+\\'}: Toggle Activity Feed`);
    console.log('- SHIFT+N: Switch to Notes Tab (in modal) OR start a new note (on Job, Invoice, Quote pages)');
    console.log('- SHIFT+I: Switch to Info Tab (in Visit/Request modal)');
    console.log('- SHIFT+V: Scroll to Scheduled visits section (on Job page)');
    console.log(`- ${isMac ? 'CMD+ENTER' : 'CTRL+ENTER'}: Click Save/Send Button`);
    console.log('========================================');
})();
