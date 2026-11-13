import type { ComponentBase } from '@motifx/core';
import type { FocusMark } from '../../core/focus-mark';

/** The options of `Popup.open`, besides the anchor. */
export interface PopupOpenOptions {
  /** What opens and closes the popup (a press on it is not "outside"). The default is the anchor. */
  toggle?: ComponentBase;
  /**
   * Where focus goes when the popup closes with focus inside: a component (a control takes it on its focus part), or a
   * place remembered with `rememberFocus`. The default is the toggle.
   */
  returnFocus?: ComponentBase | FocusMark;
}
