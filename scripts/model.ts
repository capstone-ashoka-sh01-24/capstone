class PageModification {
  url: URL;
  modifications: Modifications[];
}

class Modifications {
  element: Node;
  changes: Hide | Annotation[];
}

// class Change {
//   kind: Hide | Annotate;
// }

// Possible changes
class Hide {}

class Annotation {
  text: string;
}

// TODO
//
// Convert to JSON object?
// Demonstrate use of data structure
//
//
