import type { MenuItem } from '../../parts/menu/menu-item';
import { ContextMenu } from './ContextMenu';
import type { ContextMenuOpeningEventArgs } from './context-menu-opening-event-args';
import type { ContextMenuTarget } from './context-menu-target';

/**
 * Attaches a context menu to `target`: fixed items, or a function that builds them each time the menu
 * opens (each of your parts tells whether the menu opened on it: `part.motif.isEventFrom(e.event)`).
 * Returns a function that removes the menu. The menu is also removed with the component.
 *
 * @example
 * attachContextMenu(this.list, (e) => this.itemsFor(this.rows.find((row) => row.motif.isEventFrom(e.event))));
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
  target.motif.setDisposable(remove);
  return remove;
}
