// Content Script: Works only within the context of a particular webpage
// Needs to pass messages to communicate with the background script

const toggleHoveringStyle = (e) => {
  // debugger;
  e.preventDefault();
  e.target.classList.toggle("hovering");
};

const toggleHidden = (e) => {
  e.preventDefault();
  console.log(e.target);
  e.target.classList.toggle("hidden-hover");
};

const addAnnotation = (e) => {
  e.preventDefault();
  const ann = document.createElement("p");
  ann.innerHTML = "Sample Text Annotation";
  ann.className = "custom-annotation";
  e.target.insertAdjacentElement("afterend", ann);
};

const deleteAnnotation = (e) => {
  e.preventDefault();
  const elem = e.target;
  if (elem.classList.contains("custom-annotation")) {
    elem.remove();
  }
};

// --------------------------------------------------------------
// Annotation UI Backend

// UI States

let current_action = undefined;
let current_listeners = [];
// let current_action: string | undefined = undefined;
// let current_listeners: [string, EventListener][] = [];

// assume: only valid actions are received from the background script
const handle_action = (action) => {
  // debugger;
  const unsetAction = () => {
    console.log(current_listeners);
    for (const [eventName, listener] of current_listeners) {
      document.removeEventListener(eventName, listener);
    }
    current_action = undefined;
  };

  const setAction = (action) => {
    current_action = action;
    console.log(current_listeners);
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
      console.log("Event: ", eventName);
      console.log("Listener: ", listener);
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request.action);
  handle_action(request.action);
});
