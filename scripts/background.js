// Background script - Runs when the browser starts (and the extension is enabled)
// This is basically a service worker
//
// -------------------------------------------------------

import { isValidAction } from "./lib.mjs";
import { OnlineModificationStorage } from "./sync.mjs";

const passRequestToContext = async (request) => {
  try {
    const [tab] = await chrome.tabs.query({
      currentWindow: true,
      active: true,
    });

    console.log(tab);

    if (tab && tab.id !== undefined) {
      chrome.tabs.sendMessage(tab.id, request);
    } else {
      throw new Error("Tab not found");
    }
  } catch (error) {
    console.error("Error when messaging context: ", error);
  }
};

/**
 * Handles messages from the content script.
 * @param {({type: string, key: string, value: string | undefined})} request
 */
const handleMessageFromContentScript = async (request) => {
  console.assert(request.type !== undefined);
  console.assert(request.key !== undefined);

  if (request.type === "get") {
    return await OnlineModificationStorage.get(request.key);
  } else if (request.type === "set") {
    console.assert(request.value !== undefined);
    return await OnlineModificationStorage.set(request.key, request.value);
  } else {
    throw new Error("Invalid request type");
  }
};

// Listen to Messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!sender.tab) {
    console.assert(isValidAction(request.action));
    passRequestToContext(request).then((response) => {
      if (!response) {
        sendResponse("done.");
      }
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.tab) {
    // Ensure the message is from a content script
    handleMessageFromContentScript(request)
      .then((response) => sendResponse(response))
      .catch((error) => {
        console.error("Error handling message:", error);
      });
    return true; // Keep the message channel open for sendResponse
  }
});
