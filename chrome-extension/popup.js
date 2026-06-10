// Popup: renders a platform-aware reference of the available shortcuts.
// This mirrors the in-page help modal (open with CMD+/ or CTRL+/ on Jobber).

const isMac = navigator.platform.includes('Mac');

// Platform-aware key tokens.
const K = {
  cmd: isMac ? '⌘' : 'Ctrl',          // CMD  -> Ctrl
  ctrl: isMac ? '⌃' : 'Alt',          // CMD+CTRL combos -> Ctrl+Alt
  opt: isMac ? '⌥' : 'Alt',           // CMD+OPTION combos -> Ctrl+Alt
  shift: isMac ? '⇧' : 'Shift',
  enter: isMac ? '↩' : 'Enter',
};

const sections = [
  {
    title: 'Global',
    items: [
      { label: 'Show shortcuts reference', keys: [K.cmd, '/'] },
      { label: 'Toggle Activity Feed', keys: [K.cmd, '\\'] },
      { label: 'Toggle Messages', keys: [K.cmd, K.opt, '\\'] },
      { label: 'Click Save / Send', keys: [K.cmd, K.enter] },
    ],
  },
  {
    title: 'Visit Modal / Scheduler Popover',
    items: [
      { label: 'Open Edit dialog', keys: [K.cmd, K.ctrl, 'E'] },
      { label: 'Open Text Reminder', keys: [K.cmd, K.ctrl, 'T'] },
      { label: 'Assign Crew (in Edit mode)', keys: [K.cmd, K.ctrl, 'A'] },
      { label: 'Switch to Notes tab', keys: [K.shift, 'N'] },
      { label: 'Switch to Info tab', keys: [K.shift, 'I'] },
    ],
  },
  {
    title: 'Job / Invoice / Quote pages',
    items: [
      { label: 'Scroll to Scheduled Visits (Job page)', keys: [K.shift, 'V'] },
      { label: 'Start a new Note', keys: [K.shift, 'N'] },
    ],
  },
];

function render() {
  const container = document.getElementById('shortcuts');
  for (const section of sections) {
    const group = document.createElement('div');
    group.className = 'group';

    const h2 = document.createElement('h2');
    h2.textContent = section.title;
    group.appendChild(h2);

    for (const item of section.items) {
      const row = document.createElement('div');
      row.className = 'row';

      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = item.label;
      row.appendChild(label);

      const keys = document.createElement('span');
      keys.className = 'keys';
      for (const k of item.keys) {
        const kbd = document.createElement('kbd');
        kbd.textContent = k;
        keys.appendChild(kbd);
      }
      row.appendChild(keys);
      group.appendChild(row);
    }
    container.appendChild(group);
  }

  document.getElementById('platform').textContent = isMac ? 'Mac shortcuts' : 'Windows shortcuts';

  // Pull the version straight from the manifest so it never drifts.
  try {
    const v = chrome.runtime.getManifest().version;
    document.getElementById('version').textContent = 'v' + v;
  } catch (e) { /* not running as an extension */ }
}

render();
