import { finder } from "@medv/finder";

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
        data: null,
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
 * Modifications container type
 */
export class CompositeModification {
  static properties = ["annotation", "fontChange", "contentChange"];

  constructor() {
    for (const p of CompositeModification.properties) {
      this[p] = null;
    }
    // this.annotation = null;
    // this.fontChange = null;
    // this.contentChange = null;
  }

  updateAnnotation(annotation) {
    this.annotation = annotation;
  }

  updateFontChange(fontChange) {}
  updateContentChange(contentChange) {}

  stringify_property(prop_name) {
    return {
      variant: prop_name,
      data: "TODO",
    };
    // TODO data: this[prop_name]
  }

  toJSON() {
    return CompositeModification.properties.map(
      this.stringify_property(prop_name),
    );
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
  }

  setCompositeModification() {
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

  toJSON() {
    let activeCustomCSS = customCSSClasses.filter((cl) =>
      this.node.classList.contains(cl),
    );

    // remove the extension-added CSS
    this.node.classList.remove(...customCSSClasses);

    // serialize the modification
    let json_obj = {
      node: finder(this.node),
      modifications: this.modifications.toJSON(),
    };

    // add back the extension-added CSS
    console.log(this.node);
    this.node.classList.add(...activeCustomCSS);

    return json_obj;
  }
  /* TODO add further modifications as needed */
}

export const allowedActions = {
  toggleVisibility: "toggleVisibility",
  toggleAnnotate: "toggleAnnotate",
  toggleDeannotate: "toggleDeannotate",
};

export const customCSSClasses = ["hovering", "hidden-hover"];

/**
 * Represents all modifications to a particular page.
 */
export class PageModifications {
  /**
   * @param {URL} url - The URL of the page.
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

    // TODO
    // Figure out a way to get the modification payload
    // In a way that gives the content script
    // an idea of the current state of the modification
    // To simultaneously ensure no invalid actions are ocurring.
  }
}
