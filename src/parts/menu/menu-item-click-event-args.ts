import type { ComponentBase } from '@motifx/core';
import type { MenuItem } from './menu-item';

/** What a chosen menu item reports. */
export interface MenuItemClickEventArgs {
  item: MenuItem;
  /** The component whose menu it is, e.g. the button. */
  source: ComponentBase;
  /** The click or key press that chose it. */
  event: Event;
}
