import type { MenuBar } from './MenuBar';
import type { MenuBarCustomization } from './menu-bar-customization';

export interface MenuBarCustomizedEventArgs {
  /** Everything the user changed so far, to save. */
  customization: MenuBarCustomization;
  source: MenuBar;
}
