// Content Script: Works only within the context of a particular webpage

// Annotation UI Backend
// ---------------------------------------------------------------------
// Needs to pass messages to communicate with the background script
// ---------------------------------------------------------------------

import {
  allowedActions,
  stateActions,
  isValidAction,
  isAllowedAction,
  isStateAction,
} from "./lib.mjs";
import { generateHash } from "./digest.mjs";
import { PageModifications, loadModifications } from "./model.mjs";
import {
  OnlineModificationStorage,
  OfflineModificationStorage,
} from "./sync.mjs";

// ---------------------------------------------------------------------
const getURL = () =>
  window.location.protocol +
  "//" +
  window.location.hostname +
  (window.location.port ? ":" + window.location.port : "") +
  window.location.pathname;

/**
 * Toggle overlay display when modifying webpage
 * @param {Event} e
 */
const toggleHoveringStyle = (e) => {
  console.assert(e.target);
  e.preventDefault();
  e.target.classList.toggle("hovering");
};

function curry(f, a) {
  return function (e) {
    return f(a, e);
  };
}
// ---------------------------------------------------------------------

// --------------------------------------------------------------

/**
 * Keep track of the current state of the extension
 */
class ExtensionState {
  constructor() {
    this.url = getURL();

    /** @type {string | undefined} */
    this.url_hash = undefined;
    this.page_modifications = new PageModifications(this.url);

    /** @type {string | undefined} */
    this.current_action = undefined;

    /** @type {[string, EventListener][]} */
    this.current_listeners = [];

    /** @type {boolean | null} */
    this.is_online = true;
  }

  async getURLHash() {
    if (this.url_hash === undefined) {
      this.url_hash = await generateHash(this.url);
    }
    return this.url_hash;
  }

  unsetAction() {
    for (const [eventName, listener] of this.current_listeners) {
      document.removeEventListener(eventName, listener);
    }
    this.current_action = undefined;
  }

  /** @param {string} action */
  setAction(action) {
    this.current_action = action;
    this.current_listeners = [
      ["mouseover", toggleHoveringStyle],
      ["mouseout", toggleHoveringStyle],
    ];

    this.current_listeners.push([
      "click",
      (e) => {
        e.preventDefault();
        const node = e.target;

        const modification = {
          action: action,
          data: null, // TODO for different types of mods
        };
        console.log("Node:", node);
        console.log("Modification:", modification);
        console.log(this);
        this.page_modifications.setNodeModification(node, modification);
      },
    ]);

    for (const [eventName, listener] of this.current_listeners) {
      document.addEventListener(eventName, listener);
    }
  }

  /** @param {string} action */
  handleAction(action) {
    // when some action was active (not including the current one),
    // deactivate the other action and activate the current one
    if (this.current_action !== undefined && this.current_action !== action) {
      this.unsetAction();
      this.setAction(action);
    } else if (this.current_action === action) {
      this.unsetAction();
    } else {
      this.setAction(action);
    }
  }

  /** @param {string} mods */
  logModifications(mods) {
    console.log("Current Modifications State:", this.page_modifications);
    console.log(mods);
  }

  // Figure out how to cache the hash so that
  // const hash = generateHash(page_modifications.url);

  async saveModifications() {
    const hash = await this.getURLHash();
    const mods = this.page_modifications.generateJSON();
    this.logModifications(mods);
    // Always save to extension storage
    await OfflineModificationStorage.set(hash, mods);
    // Optionally save to server if online
    if (this.is_online) {
      const success = await chrome.runtime.sendMessage({
        type: "set",
        key: hash,
        value: mods,
      });
      if (!success) {
        console.log("Could not save modifications to server.");
      }
    }
    console.log("URL Hash:", hash);
  }

  async fetchModifications() {
    const hash = await this.getURLHash();
    let mods = undefined;

    try {
      const online_mods = await chrome.runtime.sendMessage({
        type: "get",
        key: hash,
      });
      if (online_mods !== null) {
        mods = online_mods;
        console.log("Found Online");
      }
    } catch (error) {
      console.error(
        "While trying to retrieve modifications from the server: ",
        error,
      );
    }

    if (mods === undefined) {
      console.log(this.is_online);
      try {
        const offline_mods = await OfflineModificationStorage.get(hash);
        if (offline_mods !== null) {
          mods = offline_mods;
          console.log("Found Offline");
        }
      } catch (error) {
        console.error(
          "While trying to retrieve modifications from extension storage: ",
          error,
        );
      }
    }

    if (mods !== undefined) {
      console.log("Retrieved Mods:", mods);
      try {
        this.page_modifications = loadModifications(mods);
        console.log("Modifications Applied.");
      } catch (error) {
        console.error("Error applying modifications:", error);
        this.page_modifications = new PageModifications(getURL());
        console.error("Failed to apply modifications.");
      }
    }
  }
}

const state = new ExtensionState();

chrome.runtime.onMessage.addListener(async (request) => {
  console.assert(isValidAction(request.action));
  if (request.action == stateActions.save) {
    await state.saveModifications();
  } else if (request.action == stateActions.load) {
    await state.fetchModifications();
  } else {
    state.handleAction(request.action);
  }
});

window.addEventListener("offline", () => (state.is_online = false));
window.addEventListener("online", () => (state.is_online = true));

// Load modifications when the extension first gets loaded into the webpage
document.onreadystatechange = async () => {
  if (document.readyState === "complete") {
    await state.fetchModifications();
  }
};

//
// 1. TODO Ensure PageModifications correctly reflects all modifications in real-time
// Then save it to a stringified JSON object
//
// 2. TODO Save the JSON object to chrome.storage
// so that all extension contexts can access it
//
// 3. TODO Load from chrome.storage => JSON => PageModifications
// This should never be in an invalid state.

// const generateModifications = () => {
//   return JSON.stringify(page_modifications, null, 2);
// };
