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
  e.target.insertAdjacentElement("afterend", ann);
};

document.addEventListener("mouseover", toggleHoveringStyle);
document.addEventListener("mouseout", toggleHoveringStyle);
document.addEventListener("click", toggleHidden);
document.addEventListener("contextmenu", addAnnotation);
