import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuBar } from './MenuBar';

export interface MenuBarItemsChangedEventArgs {
  /** The new list of items, to keep: the items along the changed path are new objects, the others the ones given. */
  items: readonly MenuItem[];
  source: MenuBar;
}
