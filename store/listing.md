Copy for the Chrome Web Store form (AMO reads `amo.json`).

- **Name**: Hide Sidebar for WhatsApp Web
- **Summary** (manifest description, 131/132 chars): Adds a button to the chat header that hides the chat list and nav rail, so the open chat fills the window. Alt+Shift+S toggles too.
- **Category**: Communication (fallback: Workflow & Planning)
- **Language**: English
- **Package**: `dist/whatsapp-web-hide-sidebar-chrome.zip`
- **Store icon**: `icons/icon-128.png`
- **Screenshots** (1280x800): `screenshot-1-shown.png`, `screenshot-2-hidden.png`
- **Homepage / support URL**: https://github.com/nazzacode/whatsapp-web-hide-sidebar (issues: `/issues`)

## Description

Facebook, in its infinite wisdom, gives WhatsApp Web no way to collapse the chat list. This extension adds one button that does.

It matters most in split screen, where WhatsApp gets a narrow window and the chat list takes all of it. Click the button in the chat header and the chat list and nav rail disappear, so the open chat fills the window. Click again to bring them back.

• Button in the chat header, or Alt+Shift+S
• Remembers your choice across reloads
• With no chat open the sidebar always shows, so you never get a blank screen
• Contact info and search panels on the right are left alone

Useful in narrow or tiled windows, on small screens, and when you share your screen and would rather not show your chat list.

No data is collected and no network requests are made. It only runs on web.whatsapp.com. Open source (MIT): https://github.com/nazzacode/whatsapp-web-hide-sidebar

Not affiliated with WhatsApp or Meta.

## Privacy tab

- **Single purpose**: Hide and show the chat list sidebar on WhatsApp Web.
- **Host permission justification** (`https://web.whatsapp.com/*`): the content script runs only on WhatsApp Web, where it adds the toggle button and hides the sidebar with CSS. It does not read messages or contacts.
- **Remote code**: No.
- **Data usage**: collects nothing. Tick none of the data types; certify all three disclosures.
- **Privacy policy URL**: not required (no user data). If the form insists: https://github.com/nazzacode/whatsapp-web-hide-sidebar/blob/main/DEVELOP.md
