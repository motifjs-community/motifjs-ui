// Checks that hold for nodes of any window. A node made in another window (a window the app
// opened, a frame) is not an `instanceof Element` of this one, nor is an event fired there an
// `instanceof KeyboardEvent`: each window has its own classes.

/** Whether `value` is a DOM node, of this window or another. */
export function isNode(value: unknown): value is Node {
  return !!value && typeof value === 'object' && typeof (value as Node).nodeType === 'number' && typeof (value as Node).nodeName === 'string';
}

/** Whether `value` is an element, of this window or another. */
export function isElement(value: unknown): value is Element {
  return isNode(value) && value.nodeType === 1;
}

/** Whether `value` is an HTML element (not an SVG one), of this window or another. */
export function isHtmlElement(value: unknown): value is HTMLElement {
  return isElement(value) && value.namespaceURI === 'http://www.w3.org/1999/xhtml';
}

/** Whether `value` is a document, of this window or another. */
export function isDocument(value: unknown): value is Document {
  return isNode(value) && value.nodeType === 9;
}

/** The document a node is in (a document is its own). */
export function documentOf(node: Node): Document {
  return isDocument(node) ? node : node.ownerDocument!;
}
