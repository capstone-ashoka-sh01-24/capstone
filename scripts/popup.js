// send generic messages to background script

import { allowedActions, stateActions } from "./lib.mjs";

const btn_hide = document.getElementById(`btn-${allowedActions.hide}`);
const btn_delete = document.getElementById(`btn-${allowedActions.delete}`);
const btn_annotate = document.getElementById(`btn-${allowedActions.annotate}`);
const btn_rewrite = document.getElementById(`btn-${allowedActions.rewrite}`);
const btn_save = document.getElementById(`btn-${stateActions.save}`);
const btn_load = document.getElementById(`btn-${stateActions.load}`);

/**
 * @type {Array<[HTMLButtonElement, string]>}
 */
const buttons = [
  [btn_hide, allowedActions.hide],
  [btn_delete, allowedActions.delete],
  [btn_annotate, allowedActions.annotate],
  [btn_rewrite, allowedActions.rewrite],
  [btn_save, stateActions.save],
  [btn_load, stateActions.load],
];

debugger;
buttons.forEach(([button, message]) => {
  button.addEventListener("click", () => send_message(message));
});

/**
 *
 * @param {string} body
 */
const send_message = async (body) => {
  console.log("Message to bg: ", body);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const response = await chrome.tabs.sendMessage(tab.id, { action: body });
  // if (response) {
  //   console.log("Tab Object", response.status);
  // } else {
  //   console.error("Communication abruptly ended from content.");
  // }
};

const msg_container = document.getElementById("container-messages");

/** @param {string} action */
const activate = (action) => {
  let div = document.createElement("div");
  div.id = "active";
  div.innerHTML = `Active: <span>${action}</span>`;
};

const deactivate = () => {
  let div = document.getElementById("active");
  div && document.removeChild(div);
};
