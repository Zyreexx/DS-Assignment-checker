# How the LeetCode Assignment Checker works

This document explains the Chrome/Edge extension in `leetcode-assignment-extension.zip` and its source folder, `leetcode-assignment-extension/`.

## What it does

The extension compares the assignment's LeetCode problems with the problems LeetCode reports as solved for the account currently signed in in that browser. It then displays only the remaining problems, grouped in this order:

1. Array
2. Stack
3. Linked List
4. Tree
5. Graph

Each remaining problem has a LeetCode link. A YouTube solution link is shown when one was available in the assignment PDF.

## How a student uses it

1. Install the extension in Chrome or Edge. For local installation, unzip the package, open `chrome://extensions` in Chrome or `edge://extensions` in Edge, enable **Developer mode**, choose **Load unpacked**, and select the extracted extension folder.
2. Sign in to LeetCode in the same browser.
3. Open or refresh a page on `leetcode.com`.
4. Click the extension icon and choose **Check progress**.
5. The popup shows the account name, the number solved out of the assignment total, and the **Remaining problems** list.
6. Click **LeetCode problem** to open a question, or **YouTube solution** to open the explanation video.

The extension checks progress when the user clicks the button. It does not run continuously in the background.

## What happens during a progress check

1. The popup checks that the active tab is on `leetcode.com`.
2. The popup sends a message to the extension's content script in that tab.
3. The content script checks LeetCode's sign-in status. If the person is signed out, it asks them to sign in and refresh the page.
4. It requests the account's solved-problem list from LeetCode's GraphQL endpoint, requesting more pages if needed.
5. It compares the returned problem slugs (the final part of each LeetCode problem URL) to the slugs in `assignment.json`.
6. The popup filters out solved questions and draws the remaining list in the required topic order.

The list is built from `assignment.json`, which stores each problem's topic, display name, LeetCode slug, and video URL. The LeetCode URL is formed from the slug, so every assignment item has a problem link.

## Files in the extension

- `manifest.json` declares the extension name, popup, permissions, and the LeetCode content script.
- `popup.html`, `popup.css`, and `popup.js` provide the small progress window, styling, buttons, topic headings, and links.
- `content.js` communicates with the signed-in LeetCode page and asks LeetCode for the solved list.
- `assignment.json` contains the assignment questions and solution links.
- `README.txt` has the short local-install instructions.

## Sign-in and privacy

The extension does not ask the student to copy or paste a cookie, and it does not save a session cookie. It does read the LeetCode `csrftoken` cookie from the page because the request needs that value. For the signed-in request, the browser automatically sends the account's LeetCode session cookie to `leetcode.com`; the extension does not read or store that session cookie itself.

The extension sends requests directly to LeetCode. It has no separate server and does not send the username or progress data to the assignment author. LeetCode receives the request and processes it under its own service. The progress list and username are held in memory long enough to show the popup; the extension does not save progress between checks.

## Limitations

- The progress check uses LeetCode's undocumented GraphQL endpoint. LeetCode may change it, restrict it, or require Premium access for the full progress list.
- If LeetCode rejects the request, the extension should show an error. Refresh LeetCode, confirm the account is signed in, and try again. If the endpoint has changed or access is restricted, the checker will need an update or another supported data source.
- Some rows in the source PDF had repeated or mismatched links. The problem list uses the assignment titles to keep them distinct. Video links that could not be paired confidently were left blank.
- The extension package has not yet been verified against a live LeetCode account. Before distributing it broadly or submitting it to a browser store, test it with a signed-in account and confirm the result against the LeetCode problem statuses.

## To publish it for others

Local installation requires Developer mode and **Load unpacked** on each computer. For regular store installation, submit the package separately to the Chrome Web Store and Microsoft Edge Add-ons, complete their store listing and privacy disclosures, and pass their reviews. The extension's privacy explanation should match its real behavior described above.
