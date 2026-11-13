import type { ComponentBase } from '@motifx/core';
import { isElement, isNode } from '../node-kind';
import { eachDocument, windowOf } from '../page-documents';
import type { View } from './view';

// The one place where a component becomes something the browser measures: its element, and the window it is in, taken
// from the component tree as the rest of the kit takes it (`windowOf`). Nothing else in the layer reads a component's
// element or a node's window.

/** The element the layer reads for `component`: its own; none for a fragment, a text or a disposed component. */
export function elementOf(component: ComponentBase | null | undefined): Element | null {
  if (!component || component.isDisposed) return null;
  const node: unknown = component.element;
  return isElement(node) ? node : null;
}

/** Whether `component` lays its children out where it stands, with no element of its own (a list, a branch, a function component). */
export function isFragment(component: ComponentBase): boolean {
  const node: unknown = component.element;
  return !component.isDisposed && isNode(node) && node.nodeType === 8;
}

/** Whether `component` is a text: it has no element and no children to walk. */
export function isText(component: ComponentBase): boolean {
  const node: unknown = component.element;
  return isNode(node) && node.nodeType === 3;
}

/** The window `component` is in, from the component tree; none once it is disposed. */
export function viewOf(component: ComponentBase): View | null {
  return component.isDisposed ? null : (windowOf(component) as View | null);
}

/** Calls `gone` with each window of the page that goes away (one the page opened, closed or loading another page). */
export function whenWindowGoes(gone: (view: View) => void): void {
  eachDocument((doc) => {
    const view = doc.defaultView as View | null;
    return () => {
      if (view) gone(view);
    };
  });
}
