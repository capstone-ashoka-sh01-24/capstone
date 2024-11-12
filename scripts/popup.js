// send generic messages to background script
const send_message = async (body) => {
  console.log("Message to bg: ", body);
  const response = await chrome.runtime.sendMessage({ action: body });
  if (response) {
    console.log("Tab Object", response.status);
  } else {
    console.error("Communication abruptly ended from bg script");
  }
};

// when button is clicked send message accordingly
const toggleVisiblity = () => {
  send_message("toggleVisiblity");
};

const toggleAnnotate = () => {
  send_message("toggleAnnotate");
};

const toggleDeannotate = () => {
  send_message("toggleDeannotate");
};

const visbility_btn = document.getElementById("btn-toggleVisibility");
const annotation_btn = document.getElementById("btn-toggleAnnotate");
const deannotation_btn = document.getElementById("btn-toggleDeannotate");

const buttons = [visbility_btn, annotation_btn, deannotation_btn];
const listeners = [toggleVisiblity, toggleAnnotate, toggleDeannotate];

for (let i = 0; i < buttons.length; i++) {
  const button = buttons[i];
  const listener = listeners[i];

  button.addEventListener("click", listener);
  // console.log(button.listeners);
}
