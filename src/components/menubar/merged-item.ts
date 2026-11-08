import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuBar } from './MenuBar';
import type { MenuNode } from './menu-node';

/** An item as the main bar draws it while other bars are merged into it. */
export interface MergedItem {
  /** Its key in its own bar. */
  name: string;
  /** Unique among the items of the main bar: an item of a merged bar is named after that bar too. */
  key: string;
  /** As its bar was given it. */
  item: MenuItem;
  drawn: MenuItem;
  /** The bar it comes from: its clicks and the user's changes go there. */
  owner: MenuBar;
  node: MenuNode;
  holds: boolean;
  children(): MergedItem[];
}
