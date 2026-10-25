import type { ComponentBase } from '@motifx/core';
import type { IconSource } from './icon-source';

/**
 * The node that shows an icon: an `<img>` for an address, the element itself, or the built element
 * of a component. `release` disposes a component when the icon goes away.
 */
export function iconNode(source: IconSource): { node: Node; release: () => void } {
  if (typeof source === 'string') {
    const img = document.createElement('img');
    img.src = source;
    img.alt = '';
    return { node: img, release: () => {} };
  }
  if (source instanceof Node) return { node: source, release: () => {} };
  const component = source as ComponentBase;
  if (!component.isBuilt) component.build();
  return { node: component.element as Node, release: () => void component.dispose() };
}
