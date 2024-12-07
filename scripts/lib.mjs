export const allowedActions = {
  hide: "toggleHide",
  annotate: "toggleAnnotate",
  delete: "toggleDelete",
  rewrite: "toggleRewrite",
};

export const stateActions = {
  save: "save",
  load: "load",
};

export const customCSSClasses = ["hovering", "hidden-hover"];

/** @param {string} action
  @returns {boolean} */
export const isValidAction = (action) => {
  return (
    Object.values(allowedActions).includes(action) ||
    Object.values(stateActions).includes(action)
  );
};

/** @param {string} action
  @returns {boolean} */
export const isAllowedAction = (action) => {
  return Object.values(allowedActions).includes(action);
};

/** @param {string} action
  @returns {boolean} */
export const isStateAction = (action) => {
  return Object.values(stateActions).includes(action);
};
