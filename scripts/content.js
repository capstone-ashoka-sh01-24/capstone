// Content Script: Works only within the context of a particular webpage

// Annotation UI Backend
// ---------------------------------------------------------------------
// Needs to pass messages to communicate with the background script
// ---------------------------------------------------------------------

import * as model from "./model.mjs";

/**
 *
 * @param {Node} node
 * @returns {string}
 */
function getNodeLocator(node) {
  const uniqueDOMElements = ["body"];
  // check node is valid
  // if node has id then great
  // else
  //  relative position from element with id
  //  relative position from unique dom element
  //  CSS locator
  //  Xpath Locator
  return "";
}

// ---------------------------------------------------------------------
const getURL = () =>
  window.location.protocol +
  "//" +
  window.location.hostname +
  (window.location.port ? ":" + window.location.port : "") +
  window.location.pathname;

// Event Listeners for Setting / Changing Modifications
const page_modifications = new model.PageModifications(getURL());

const toggleHoveringStyle = (e) => {
  // debugger;
  e.preventDefault();
  e.target.classList.toggle("hovering");
};

const toggleHidden = (e) => {
  e.preventDefault();
  const node = e.target;
  node.classList.toggle("hidden-hover");

  const modification = {
    action: model.allowedActions.toggleVisibility,
    data: null,
  };
  console.log("Node:", node);
  console.log("Modification:", modification);
  // console.log("Current Page Modifications:", page_modifications);
  page_modifications.setNodeModification(node, modification);
};

const addAnnotation = (e) => {
  e.preventDefault();
  const ann = document.createElement("p");
  ann.innerHTML = "Sample Text Annotation";
  ann.className = "custom-annotation";
  e.target.insertAdjacentElement("afterend", ann);
};

// TODO
// 1. ownership of the annotation should belong to one the webpage's original node
//  as saved in the data structure
//  Currently, it is just a floating div
// 2. Each element should be limited to having one annotation.
//
// Confirm if this is a good idea
const deleteAnnotation = (e) => {
  e.preventDefault();
  const elem = e.target;
  if (elem.classList.contains("custom-annotation")) {
    elem.remove();
  }
};

// --------------------------------------------------------------

// UI States

/** @type {string | undefined} */
let current_action = undefined;

/** @type {[string, EventListener][]} */
let current_listeners = [];

// assume: only valid actions are received from the background script
const handle_action = (action) => {
  // debugger;
  const unsetAction = () => {
    // console.log(current_listeners);
    for (const [eventName, listener] of current_listeners) {
      document.removeEventListener(eventName, listener);
    }
    current_action = undefined;
  };

  const setAction = (action) => {
    current_action = action;
    // console.log(current_listeners);
    current_listeners = [
      ["mouseover", toggleHoveringStyle],
      ["mouseout", toggleHoveringStyle],
    ];

    switch (action) {
      case "toggleAnnotate":
        current_listeners.push(["click", addAnnotation]);
        break;

      case "toggleDeannotate":
        current_listeners.push(["click", deleteAnnotation]);
        break;

      case "toggleVisiblity":
        current_listeners.push(["click", toggleHidden]);
        break;

      default:
        break;
    }

    for (const [eventName, listener] of current_listeners) {
      // console.log("Event: ", eventName);
      // console.log("Listener: ", listener);
      document.addEventListener(eventName, listener);
    }
  };

  // when some action was active (not including the current one),
  // deactivate the other action and activate the current one
  if (current_action !== undefined && current_action !== action) {
    unsetAction();
    setAction(action);
  } else if (current_action === action) {
    unsetAction();
  } else {
    setAction(action);
  }
};

// 1. TODO Ensure PageModifications correctly reflects all modifications in real-time
// Then save it to a stringified JSON object
//
// 2. TODO Save the JSON object to chrome.storage
// so that all extension contexts can access it
//
// 3. TODO Load from chrome.storage => JSON => PageModifications
// This should never be in an invalid state.

const saveModifications = () => {
  // TODO
  console.log("Current Modifications State:", page_modifications);
  console.log(JSON.stringify(page_modifications, null, 2));
  alert("Trying to save state.");
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request.action);
  if (request.action == "saveModifications") {
    saveModifications();
  } else {
    handle_action(request.action);
  }
});
