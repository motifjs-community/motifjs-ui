import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ToastPosition } from './toast-position';

/**
 * Props of `Toaster`: the shared `ControlProps` (`text` names the region, by default `uiLocale`'s
 * `notifications`) in addition to its own. Each prop is also a settable, reactive property.
 */
export interface ToasterProps extends ControlProps {
  /** The stacking position, unless a toast specifies its own. The default is `'bottom-end'`. */
  position?: Bind<ToastPosition>;
  /** The number of toasts shown at once in one position. The rest wait their turn. The default is 3. */
  max?: Bind<number>;
  /** The key that moves focus to the newest toast and back again. Use `''` for none. The default is `'F8'`. */
  hotkey?: Bind<string>;
  /**
   * Pauses timers while the pointer is over the toasts. The default is `true`. Timers always stop while focus is inside
   * them or the page is hidden.
   */
  pauseOnHover?: Bind<boolean>;
}
