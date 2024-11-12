// Background script - Runs when the browser starts (and the extension is enabled)
// This is basically a service worker
//
// -------------------------------------------------------

let actions = ["toggleAnnotate", "toggleDeannotate", "toggleVisiblity"];

const passRequestToContext = async (request) => {
  try {
    const [tab] = await chrome.tabs.query({
      currentWindow: true,
      active: true,
    });

    console.log(tab);

    if (tab) {
      chrome.tabs.sendMessage(tab.id, request);
    } else {
      throw new Error("Tab not found");
    }
  } catch (error) {
    console.error("Error when messaging context: ", error);
  }
};

// Listen to Messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (actions.includes(request.action)) {
    passRequestToContext(request).then(sendResponse("done."));
    return true;
  } else {
    sendResponse({ status: "invalid action." });
  }
});
