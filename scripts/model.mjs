import { finder } from "@medv/finder";
import { allowedActions, customCSSClasses } from "./lib.mjs";

/**
 * Represents a hide action.
 */
export class Hidden {
  constructor() {
    // This export class represents a hidden state; no properties needed.
  }

  toJSON() {
    return [
      {
        variant: "hidden",
      },
    ];
  }
}

/**
 * Represents an annotation.
 */
export class Annotation {
  /**
   * @param {string} text - The annotation text.
   */
  constructor(text) {
    this.text = text;
  }

  toJSON() {
    return {
      variant: "annotation",
      data: undefined,
    };
  }
}

/**
 * Represents a content change.
 */
export class ContentChange {
  /**
   * @param {string} content - The new content.
   */
  constructor(content) {
    this.content = content;
  }
}

/**
 * Represents a font change.
 */
export class FontChange {
  /**
   * @param {string} font - The new font name.
   */
  constructor(font) {
    this.font = font;
  }
}

/**
 * Modifications container type
 */
export class CompositeModification {
  // static properties = ["annotation", "fontChange", "contentChange"];
  static properties = ["annotation"];

  constructor() {
    for (const p of CompositeModification.properties) {
      this[p] = undefined;
    }
    // this.annotation = null;
    // this.fontChange = null;
    // this.contentChange = null;
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
    let props = CompositeModification.properties.filter(
      (prop_name) => this[prop_name],
    );
    props.forEach((prop_name) => json.push(JSON.stringify(this[prop_name])));
  }
}

/**
 * Container for changes made to a particular element.
 */
export class NodeModification {
  /**
   * Note: Constructor should NOT be called outside of this file, everything should be done through PageModifications
   * @param {Node} node - The DOM node that has been modified.
   * @param {Hidden | CompositeModification} modifications - The modifications made to the node.
   */
  constructor(node) {
    this.node = node;
    this.modifications = new CompositeModification();
    // TODO: Remove custom export class names that allow selection of elements
    // (e.g blue border on hover)
  }

  /** @returns {boolean} */
  isHidden() {
    return this.modifications instanceof Hidden;
  }

  setHidden() {
    this.modifications = new Hidden();
    // TODO set UI modifications only within data structure and not outside
    this.node.classList.add("hidden-hover");
  }

  setCompositeModification() {
    this.node.classList.remove("hidden-hover");
    this.modifications = new CompositeModification();
  }

  toggleHidden() {
    // debugger;
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
        if (this.modifications[prop_name] !== undefined) {
          return false;
        }
      }
      return true;
    }
  }

  toJSON() {
    let activeCustomCSS = customCSSClasses.filter((cl) =>
      this.node.classList.contains(cl),
    );

    // remove the extension-added CSS
    this.node.classList.remove(...customCSSClasses);

    // serialize the modification
    let json_obj = {
      node: finder(this.node),
      // TODO: modifications: null (for unimplemented/empty mods);
      modifications: this.modifications.toJSON(),
    };

    // add back the extension-added CSS
    console.log(this.node);
    this.node.classList.add(...activeCustomCSS);

    if (json_obj.modifications !== undefined) {
      return json_obj;
    }
  }
  /* TODO add further modifications as needed */
}
/**
 * Represents all modifications to a particular page.
 */
export class PageModifications {
  /**
   * @param {string} url - The URL of the page.
   */
  constructor(url) {
    this.url = url;
    /** @type {NodeModification[]} nodeModifications - An array of node modifications. */
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
      (saved_nodeModication) => saved_nodeModication.node === node,
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
    if (
      modification === undefined ||
      modification === null ||
      !(
        modification.hasOwnProperty("action") &&
        modification.hasOwnProperty("data")
      )
    ) {
      throw new Error("PageModifications: Malformed Modification attempt.");
    }

    let nodeModification = this.getNodeModification(node);
    if (nodeModification === undefined) {
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

    // get the modification payload
    // In a way that gives the content script
    // an idea of the current state of the modification
    // To simultaneously ensure no invalid actions are ocurring.
  }

  /** Stringifies the current state of the modifications object,
  removes empty modifications
  * @returns {string}
  */
  generateJSON() {
    // get rid of empty NodeModifications
    let json = JSON.stringify(
      {
        ...this,
        nodeModifications: this.nodeModifications.filter(
          (nodeMod) => !nodeMod.isEmpty(),
        ),
      },
      null,
      2,
    );
    return json;
  }
}

/**
 *
 * @param {string} jsonString
 * @returns {PageModifications | Error}
 */
export function loadModifications(jsonString) {
  try {
    let obj = JSON.parse(jsonString);
    const page_mods = new PageModifications(obj.url);

    for (const nodeModObj of obj.nodeModifications) {
      const node = document.querySelector(nodeModObj.node);

      if (node !== null) {
        for (const modObj of nodeModObj.modifications) {
          console.log(
            `Element: ${nodeModObj.node} found on page. Applying mods.`,
          );
          let modification = {
            action: "",
            data: null,
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
      } else {
        console.log(
          `Error: Element ${nodeModObj.node} not found on page. Skipping mods.`,
        );
      }
    }
    console.log("Reconstructed PageMod obj: ", page_mods);

    return page_mods;
  } catch (err) {
    console.error(err);
    throw new Error("Malformed JSON Modifications object.");
  }
}
