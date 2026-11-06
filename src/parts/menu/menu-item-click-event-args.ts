import type { ComponentBase } from '@motifx/core';
import type { MenuItem } from './menu-item';

/** What a selected menu item reports. */
export interface MenuItemClickEventArgs {
  item: MenuItem;
  /** The component that owns the menu, such as the button. */
  source: ComponentBase;
  /** The click or key press that selected it. */
  event: Event;
}
