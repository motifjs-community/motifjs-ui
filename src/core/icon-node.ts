import { Component, type ComponentBase } from '@motifx/core';
import type { IconSource } from './icon-source';
import { isNode } from './node-kind';

const COMMENT_NODE = 8;

/**
 * The node that shows an icon: an `<img>` for an address, the element itself, or the built element
 * of a component. `release` disposes a component when the icon goes away. `doc`: the document
 * the `<img>` is created in, the page's by default.
 */
export function iconNode(source: IconSource, doc: Document = document): { node: Node; release: () => void } {
  if (typeof source === 'string') {
    const img = doc.createElement('img');
    img.src = source;
    img.alt = '';
    return { node: img, release: () => {} };
  }
  if (isNode(source)) return { node: source, release: () => {} };
  const component = source as ComponentBase;
  if (!component.isBuilt) component.build();
  if ((component.element as Node | undefined)?.nodeType !== COMMENT_NODE) {
    return { node: component.element as Node, release: () => void component.dispose() };
  }
  // A conditional in JSX is a fragment: a comment marker that places its nodes next to itself.
  const slot = new Component<HTMLElement>(doc.createElement('span'));
  slot.element.setAttribute('data-mx-icon-slot', '');
  slot.element.style.display = 'contents';
  slot.build();
  slot.controls.add(component);
  return { node: slot.element, release: () => void slot.dispose() };
}
