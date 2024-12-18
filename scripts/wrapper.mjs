/**
 * @param {HTMLElement | Node} element
 */
export function wrapOverlay(element) {
  const wrapper = document.createElement("div");
  wrapper.className = "hover-overlay";
  element.parentNode?.insertBefore(element, wrapper);
  wrapper.appendChild(element);
  return;
}

/**
 * @param {HTMLElement | Node} element
 */
export function unwrapOverlay(element) {
  let wrapper = undefined;
  let parent = undefined;
  if (element.parentElement?.className === "hover-overlay") {
    wrapper = element.parentNode;
    parent = wrapper?.parentNode;
    parent?.insertBefore(wrapper, element);
    wrapper.remove();
  }
  return;
}
