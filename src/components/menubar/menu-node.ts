import type { MenuItem } from '../../parts/menu/menu-item';

/** An item of the bar as the user arranged it. */
export interface MenuNode {
  /** Its name in `MenuBarCustomization`: its place in the items given, or the id the bar gave an item the user added. */
  id: string;
  key: string;
  /** Where it stands now: the keys along the way, joined with `/`. */
  path: string;
  /** The id of its menu, `''` for the bar. */
  parent: string;
  /** As the app gave it: an item, a command of `commands`, or a menu of the user's own. */
  item: MenuItem;
  /** As it is drawn: `item`, or a copy with the user's name and the user's items. */
  drawn: MenuItem;
  hidden: boolean;
  /** `customizable: false`: it stays shown and in its place. */
  fixed: boolean;
  /** Added by the user. */
  added: boolean;
  /** Has a menu that items can be put in. */
  holds: boolean;
  children(): MenuNode[];
}
