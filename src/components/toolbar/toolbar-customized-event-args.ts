import type { Toolbar } from './Toolbar';
import type { ToolbarCustomization } from './toolbar-customization';

export interface ToolbarCustomizedEventArgs {
  /** Everything the user changed so far, to save. */
  customization: ToolbarCustomization;
  source: Toolbar;
}
