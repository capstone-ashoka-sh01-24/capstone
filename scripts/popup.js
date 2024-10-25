const toggleVisiblity = (e) => {};

const visbility_btn = document.getElementById("btn-toggleVisiblity");
const annotation_btn = document.getElementById("btn-toggleAnimation");

const buttons = [visbility_btn, annotation_btn];
const listeners = [toggleVisiblity, toggleAnnotation];

for (let i = 0; i < buttons.length; i++) {
  const button = buttons[i];
  const listener = listeners[i];

  button.addEventListener("click", listener);
  console.log(button.listeners);
}
