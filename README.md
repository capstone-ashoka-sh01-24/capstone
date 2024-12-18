# Chrome Extension for Improving UI/UX on Poorly Designed Websites

Capstone Project

---


# Usage

To try out the Chrome extension:

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" by toggling the switch in the top right corner (or some other corner).
3. Click on "Load unpacked" and navigate to this directory, select it.
4. The extension should now be loaded and ready for testing.

---


## Features (In Progress)

The following options are available to create, save and share edits to webpages.

Note:

Doesn't work for single pages applications with too many dynamic elements.

The extension only remembers the state of the webpage at the time of saving.


## Hide Elements

+ Click on "hide".
+ Now, if you hover on elements, blue borders should appear.
+ Click on an element to hide it.
+ Click again close to where you clicked to unhide an element.
+ Click on "hide" on the extension popup again to toggle hide mode.

Notes:
- This feature is a little buggy for links and buttons.


## Save / Load

+ Save your edits to a webpage by clicking the "save" button. A confirmation alert should appear.
+ Edits to webpages are automatically (quietly) loaded upon page navigation. Check the console logs.
+ They can also manually be fetched using the "load" button.

## Other Features (`unimplemented!`)

+ Delete: Hide Elements so that they don't take up space on the page.
+ Annotate: Add tooltips to features.
+ Rewrite: Change Text Content of Elements


---

# Design Overview

## Extension

All the relevant JS is located in the `scripts` directory. The other folders are self-explanatory.

Since content scripts cannot be ES Modules, you must build the project _only_ if you change any of the content script files.
Otherwise, `content_script.js` included here should suffice.

## How Edits are Persisted

- Edits are contained in a live variable in the content script's execution context.
- Upon saving, the following happens:
    + A JSON string containing the modifications is created. Refer to `report/` for details.
    + The JSON is saved to the extension's storage as well as a cloud key-value store.
    + If an edit to a webpage already exists on the cloud store, it is fetched automatically on page load. Such edits are overwritten across saves.


---

# Build

To build the content script for the project, you can use one of the following commands:

```
node build.js
```

OR

```
deno -A build.js
```

This should generate a `content_script.js` and a `content_script.js.map` in `scripts/`

---

Please feel free to drop a message / raise an issue here in case of queries.

Author: Shivam Kedia
