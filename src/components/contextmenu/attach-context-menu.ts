import { isElement } from '../../core/node-kind';
import type { MenuItem } from '../../parts/menu/menu-item';
import { ContextMenu } from './ContextMenu';
import type { ContextMenuOpeningEventArgs } from './context-menu-opening-event-args';
import type { ContextMenuTarget } from './context-menu-target';

/**
 * Attaches a context menu to `target`: fixed items, or a function that builds them each time the menu
 * opens (from `e.target`, the element clicked). Returns a function that removes the menu. For a
 * component, the menu is also removed with the component.
 *
 * @example
 * attachContextMenu(this.list, (e) => this.itemsFor(e.target.closest('li')));
 */
export function attachContextMenu(
  target: ContextMenuTarget,
  items: readonly MenuItem[] | ((e: ContextMenuOpeningEventArgs) => readonly MenuItem[] | null | undefined),
): () => void {
  const menu = new ContextMenu({ target, items: typeof items === 'function' ? [] : items });
  if (typeof items === 'function') menu.onOpening((e) => (e.items = items(e) ?? []));
  const remove = () => {
    if (menu.isDisposed) return;
    menu.target = null;
    void menu.dispose();
  };
  if (!isElement(target)) target.motif.setDisposable(remove);
  return remove;
}
