"use strict";
(() => {
  // node_modules/.pnpm/@medv+finder@3.2.0/node_modules/@medv/finder/finder.js
  var config;
  var rootDocument;
  var start;
  function finder(input, options) {
    start = /* @__PURE__ */ new Date();
    if (input.nodeType !== Node.ELEMENT_NODE) {
      throw new Error(`Can't generate CSS selector for non-element node type.`);
    }
    if ("html" === input.tagName.toLowerCase()) {
      return "html";
    }
    const defaults = {
      root: document.body,
      idName: (name) => true,
      className: (name) => true,
      tagName: (name) => true,
      attr: (name, value) => false,
      seedMinLength: 1,
      optimizedMinLength: 2,
      threshold: 1e3,
      maxNumberOfTries: 1e4,
      timeoutMs: void 0
    };
    config = { ...defaults, ...options };
    rootDocument = findRootDocument(config.root, defaults);
    let path = bottomUpSearch(input, "all", () => bottomUpSearch(input, "two", () => bottomUpSearch(input, "one", () => bottomUpSearch(input, "none"))));
    if (path) {
      const optimized = sort(optimize(path, input));
      if (optimized.length > 0) {
        path = optimized[0];
      }
      return selector(path);
    } else {
      throw new Error(`Selector was not found.`);
    }
  }
  function findRootDocument(rootNode, defaults) {
    if (rootNode.nodeType === Node.DOCUMENT_NODE) {
      return rootNode;
    }
    if (rootNode === defaults.root) {
      return rootNode.ownerDocument;
    }
    return rootNode;
  }
  function bottomUpSearch(input, limit, fallback) {
    let path = null;
    let stack = [];
    let current = input;
    let i = 0;
    while (current) {
      const elapsedTime = (/* @__PURE__ */ new Date()).getTime() - start.getTime();
      if (config.timeoutMs !== void 0 && elapsedTime > config.timeoutMs) {
        throw new Error(`Timeout: Can't find a unique selector after ${elapsedTime}ms`);
      }
      let level = maybe(id(current)) || maybe(...attr(current)) || maybe(...classNames(current)) || maybe(tagName(current)) || [any()];
      const nth = index(current);
      if (limit == "all") {
        if (nth) {
          level = level.concat(level.filter(dispensableNth).map((node) => nthChild(node, nth)));
        }
      } else if (limit == "two") {
        level = level.slice(0, 1);
        if (nth) {
          level = level.concat(level.filter(dispensableNth).map((node) => nthChild(node, nth)));
        }
      } else if (limit == "one") {
        const [node] = level = level.slice(0, 1);
        if (nth && dispensableNth(node)) {
          level = [nthChild(node, nth)];
        }
      } else if (limit == "none") {
        level = [any()];
        if (nth) {
          level = [nthChild(level[0], nth)];
        }
      }
      for (let node of level) {
        node.level = i;
      }
      stack.push(level);
      if (stack.length >= config.seedMinLength) {
        path = findUniquePath(stack, fallback);
        if (path) {
          break;
        }
      }
      current = current.parentElement;
      i++;
    }
    if (!path) {
      path = findUniquePath(stack, fallback);
    }
    if (!path && fallback) {
      return fallback();
    }
    return path;
  }
  function findUniquePath(stack, fallback) {
    const paths = sort(combinations(stack));
    if (paths.length > config.threshold) {
      return fallback ? fallback() : null;
    }
    for (let candidate of paths) {
      if (unique(candidate)) {
        return candidate;
      }
    }
    return null;
  }
  function selector(path) {
    let node = path[0];
    let query = node.name;
    for (let i = 1; i < path.length; i++) {
      const level = path[i].level || 0;
      if (node.level === level - 1) {
        query = `${path[i].name} > ${query}`;
      } else {
        query = `${path[i].name} ${query}`;
      }
      node = path[i];
    }
    return query;
  }
  function penalty(path) {
    return path.map((node) => node.penalty).reduce((acc, i) => acc + i, 0);
  }
  function unique(path) {
    const css = selector(path);
    switch (rootDocument.querySelectorAll(css).length) {
      case 0:
        throw new Error(`Can't select any node with this selector: ${css}`);
      case 1:
        return true;
      default:
        return false;
    }
  }
  function id(input) {
    const elementId = input.getAttribute("id");
    if (elementId && config.idName(elementId)) {
      return {
        name: "#" + CSS.escape(elementId),
        penalty: 0
      };
    }
    return null;
  }
  function attr(input) {
    const attrs = Array.from(input.attributes).filter((attr2) => config.attr(attr2.name, attr2.value));
    return attrs.map((attr2) => ({
      name: `[${CSS.escape(attr2.name)}="${CSS.escape(attr2.value)}"]`,
      penalty: 0.5
    }));
  }
  function classNames(input) {
    const names = Array.from(input.classList).filter(config.className);
    return names.map((name) => ({
      name: "." + CSS.escape(name),
      penalty: 1
    }));
  }
  function tagName(input) {
    const name = input.tagName.toLowerCase();
    if (config.tagName(name)) {
      return {
        name,
        penalty: 2
      };
    }
    return null;
  }
  function any() {
    return {
      name: "*",
      penalty: 3
    };
  }
  function index(input) {
    const parent = input.parentNode;
    if (!parent) {
      return null;
    }
    let child = parent.firstChild;
    if (!child) {
      return null;
    }
    let i = 0;
    while (child) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        i++;
      }
      if (child === input) {
        break;
      }
      child = child.nextSibling;
    }
    return i;
  }
  function nthChild(node, i) {
    return {
      name: node.name + `:nth-child(${i})`,
      penalty: node.penalty + 1
    };
  }
  function dispensableNth(node) {
    return node.name !== "html" && !node.name.startsWith("#");
  }
  function maybe(...level) {
    const list = level.filter(notEmpty);
    if (list.length > 0) {
      return list;
    }
    return null;
  }
  function notEmpty(value) {
    return value !== null && value !== void 0;
  }
  function* combinations(stack, path = []) {
    if (stack.length > 0) {
      for (let node of stack[0]) {
        yield* combinations(stack.slice(1, stack.length), path.concat(node));
      }
    } else {
      yield path;
    }
  }
  function sort(paths) {
    return [...paths].sort((a, b) => penalty(a) - penalty(b));
  }
  function* optimize(path, input, scope = {
    counter: 0,
    visited: /* @__PURE__ */ new Map()
  }) {
    if (path.length > 2 && path.length > config.optimizedMinLength) {
      for (let i = 1; i < path.length - 1; i++) {
        if (scope.counter > config.maxNumberOfTries) {
          return;
        }
        scope.counter += 1;
        const newPath = [...path];
        newPath.splice(i, 1);
        const newPathKey = selector(newPath);
        if (scope.visited.has(newPathKey)) {
          return;
        }
        if (unique(newPath) && same(newPath, input)) {
          yield newPath;
          scope.visited.set(newPathKey, true);
          yield* optimize(newPath, input, scope);
        }
      }
    }
  }
  function same(path, input) {
    return rootDocument.querySelector(selector(path)) === input;
  }

  // scripts/lib.mjs
  var allowedActions = {
    toggleVisibility: "toggleVisibility",
    toggleAnnotate: "toggleAnnotate",
    toggleDeannotate: "toggleDeannotate"
  };
  var customCSSClasses = ["hovering", "hidden-hover"];

  // scripts/model.mjs
  var Hidden = class {
    constructor() {
    }
    toJSON() {
      return [
        {
          variant: "hidden"
        }
      ];
    }
  };
  var CompositeModification = class _CompositeModification {
    // static properties = ["annotation", "fontChange", "contentChange"];
    static properties = ["annotation"];
    constructor() {
      for (const p of _CompositeModification.properties) {
        this[p] = void 0;
      }
    }
    updateAnnotation(annotation) {
      this.annotation = annotation;
    }
    /* TODO
    updateFontChange(fontChange) {
      this.fontChange = fontChange;
    }
    updateContentChange(contentChange) {
      this.contentChange = contentChange;
    }
    */
    /**
    
       * @param {string} prop_name
       * @returns {({variant: string, data: undefined | Object})}
       */
    /*
     stringify_property(prop_name) {
      return {
        variant: prop_name,
        data: undefined,
      };
      // TODO data: this[prop_name]
    } */
    toJSON() {
      let json = [];
      let props = _CompositeModification.properties.filter(
        (prop_name) => this[prop_name]
      );
      props.forEach((prop_name) => json.push(JSON.stringify(this[prop_name])));
    }
  };
  var NodeModification = class {
    /**
     * Note: Constructor should NOT be called outside of this file, everything should be done through PageModifications
     * @param {Node} node - The DOM node that has been modified.
     * @param {Hidden | CompositeModification} modifications - The modifications made to the node.
     */
    constructor(node) {
      this.node = node;
      this.modifications = new CompositeModification();
    }
    /** @returns {boolean} */
    isHidden() {
      return this.modifications instanceof Hidden;
    }
    setHidden() {
      this.modifications = new Hidden();
      this.node.classList.add("hidden-hover");
    }
    setCompositeModification() {
      this.node.classList.remove("hidden-hover");
      this.modifications = new CompositeModification();
    }
    toggleHidden() {
      console.log("Before Toggle:", this, this.isHidden());
      this.isHidden() ? this.setCompositeModification() : this.setHidden();
      console.log("After Toggle:", this, this.isHidden());
    }
    /**
     * Add / Remove Annotation
     * @param {Annotation | null} annotation
     */
    updateAnnotation(annotation) {
      if (this.isHidden()) {
        throw new Error("Trying to annotate a hidden element.");
      }
      this.modifications.updateAnnotation(annotation);
    }
    isEmpty() {
      if (this.modifications.constructor.name == CompositeModification.name) {
        for (const prop_name of CompositeModification.properties) {
          if (this.modifications[prop_name] !== void 0) {
            return false;
          }
        }
        return true;
      }
    }
    toJSON() {
      let activeCustomCSS = customCSSClasses.filter(
        (cl) => this.node.classList.contains(cl)
      );
      this.node.classList.remove(...customCSSClasses);
      let json_obj = {
        node: finder(this.node),
        // TODO: modifications: null (for unimplemented/empty mods);
        modifications: this.modifications.toJSON()
      };
      console.log(this.node);
      this.node.classList.add(...activeCustomCSS);
      if (json_obj.modifications !== void 0) {
        return json_obj;
      }
    }
    /* TODO add further modifications as needed */
  };
  var PageModifications = class {
    /**
     * @param {string} url - The URL of the page.
     */
    constructor(url) {
      this.url = url;
      this.nodeModifications = [];
    }
    /**
     * Add a new element modification to the page
     * @param {Node} node
     */
    addNodeModification(node) {
      const nodeModification = new NodeModification(node);
      this.nodeModifications.push(nodeModification);
      return nodeModification;
    }
    /**
     * Return modifications to a given node
     * @param {Node} node
     * @returns {NodeModification | undefined}
     */
    getNodeModification(node) {
      return this.nodeModifications.find(
        (saved_nodeModication) => saved_nodeModication.node === node
      );
    }
    /* TODO handle further modifications as introduced */
    /**
     * Check if modifications to a given node already exists,
     * update it if yes, otherwise add it to nodeModifcations
     * @param {Node} node
     * @param {({action: string, data: null | Annotation})} modification
     */
    setNodeModification(node, modification) {
      if (modification === void 0 || modification === null || !(modification.hasOwnProperty("action") && modification.hasOwnProperty("data"))) {
        throw new Error("PageModifications: Malformed Modification attempt.");
      }
      let nodeModification = this.getNodeModification(node);
      if (nodeModification === void 0) {
        nodeModification = this.addNodeModification(node);
      }
      switch (modification.action) {
        case allowedActions.toggleVisibility:
          nodeModification.toggleHidden();
          break;
        case allowedActions.toggleDeannotate:
          nodeModification.updateAnnotation(null);
          break;
        case allowedActions.toggleAnnotate:
          nodeModification.updateAnnotation(modification.data);
      }
    }
    // toJSON() {
    //   let mods = this.nodeModifications
    //     .map((mod) => JSON.stringify(mod, null, 2))
    //     .filter((json) => json !== "null");
    //   return {
    //     url: JSON.stringify(this.url),
    //     nodeModifications: mods,
    //   };
    // }
    /** Stringifies the current state of the modifications object,
    removes empty modifications
    * @returns {string}
    */
    generateJSON() {
      let json = JSON.stringify(
        {
          ...this,
          nodeModifications: this.nodeModifications.filter(
            (nodeMod) => !nodeMod.isEmpty()
          )
        },
        null,
        2
      );
      return json;
    }
  };
  function loadModifications(jsonString) {
    try {
      let obj = JSON.parse(jsonString);
      const page_mods = new PageModifications(obj.url);
      for (const nodeModObj of obj.nodeModifications) {
        const node = document.querySelector(nodeModObj.node);
        for (const modObj of nodeModObj.modifications) {
          let modification = {
            action: "",
            data: null
          };
          switch (modObj.variant) {
            case "hidden":
              modification.action = allowedActions.toggleVisibility;
              page_mods.setNodeModification(node, modification);
              break;
            default:
              throw new Error("unrecognised modification variant");
          }
        }
      }
      console.log("Reconstructed PageMod obj: ", page_mods);
      return page_mods;
    } catch (err) {
      console.error(err);
      throw new Error("Malformed JSON Modifications object.");
    }
  }

  // scripts/digest.mjs
  async function generateHash(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  // scripts/content.js
  var getURL = () => window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "") + window.location.pathname;
  var page_modifications = new PageModifications(getURL());
  var toggleHoveringStyle = (e) => {
    e.preventDefault();
    e.target.classList.toggle("hovering");
  };
  var toggleHidden = (e) => {
    e.preventDefault();
    const node = e.target;
    const modification = {
      action: allowedActions.toggleVisibility,
      data: null
    };
    console.log("Node:", node);
    console.log("Modification:", modification);
    page_modifications.setNodeModification(node, modification);
  };
  var addAnnotation = (e) => {
    e.preventDefault();
    const ann = document.createElement("p");
    ann.innerHTML = "Sample Text Annotation";
    ann.className = "custom-annotation";
    e.target.insertAdjacentElement("afterend", ann);
  };
  var deleteAnnotation = (e) => {
    e.preventDefault();
    const elem = e.target;
    if (elem.classList.contains("custom-annotation")) {
      elem.remove();
    }
  };
  var current_action = void 0;
  var current_listeners = [];
  var handle_action = (action) => {
    const unsetAction = () => {
      for (const [eventName, listener] of current_listeners) {
        document.removeEventListener(eventName, listener);
      }
      current_action = void 0;
    };
    const setAction = (action2) => {
      current_action = action2;
      current_listeners = [
        ["mouseover", toggleHoveringStyle],
        ["mouseout", toggleHoveringStyle]
      ];
      switch (action2) {
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
        document.addEventListener(eventName, listener);
      }
    };
    if (current_action !== void 0 && current_action !== action) {
      unsetAction();
      setAction(action);
    } else if (current_action === action) {
      unsetAction();
    } else {
      setAction(action);
    }
  };
  var logCurrentModifications = (mods) => {
    console.log("Current Modifications State:", page_modifications);
    console.log(mods);
  };
  var setSavedModifications = async (key, value) => {
    try {
      await chrome.storage.local.set({
        [key]: value
      });
    } catch (e) {
      console.error(e);
      alert("Unsuccessful save");
    }
    alert("Saved successfully");
  };
  var getSavedModifications = async (key) => {
    try {
      const storedModification = await chrome.storage.local.get([key]);
      if (storedModification[key]) {
        alert("Found modification!");
        return storedModification[key];
      } else {
        alert("Modification not found :/");
      }
    } catch {
      alert("Error while retrieving modification from Extension Storage");
    }
  };
  var saveModifications = async () => {
    const hash = await generateHash(page_modifications.url);
    const mods = page_modifications.generateJSON();
    logCurrentModifications(mods);
    await setSavedModifications(hash, mods);
    console.log("URL Hash:", hash);
  };
  var fetchModifications = async () => {
    const hash = await generateHash(page_modifications.url);
    const mods = await getSavedModifications(hash);
    if (mods) {
      console.log("Retrieved Mods:", mods);
      try {
        page_modifications = loadModifications(mods);
        alert("Modifications Loaded.");
      } catch (error) {
        console.error("Error loading modifications:", error);
        page_modifications = new PageModifications(getURL());
        alert("Failed to load modifications.");
      }
    }
  };
  chrome.runtime.onMessage.addListener(async (request) => {
    console.log(request.action);
    if (request.action == "saveModifications") {
      await saveModifications();
    } else if (request.action == "loadModifications") {
      await fetchModifications();
    } else {
      handle_action(request.action);
    }
  });
  fetchModifications();
})();
//# sourceMappingURL=content_script.js.map
