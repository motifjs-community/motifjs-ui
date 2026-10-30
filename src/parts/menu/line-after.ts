import type { MenuItem } from './menu-item';

/** The kit's own menu items that a group line follows: an app's item is never marked or copied for one. */
const marked = new WeakSet<MenuItem>();

/** Marks a menu item the kit made: the next item shown starts a group. */
export function lineAfter<T extends MenuItem>(item: T): T {
  marked.add(item);
  return item;
}

export function hasLineAfter(item: MenuItem): boolean {
  return marked.has(item);
}
