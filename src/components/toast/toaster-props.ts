import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ToastPosition } from './toast-position';

/**
 * Props of `Toaster`: the shared `ControlProps` (`text` names the region; `uiLocale`'s
 * `notifications` by default) plus its own. Each prop is also a settable, reactive property.
 */
export interface ToasterProps extends ControlProps {
  /** Where its toasts stack unless a toast says otherwise. Default `'bottom-end'`. */
  position?: Bind<ToastPosition>;
  /** How many toasts show at once at one position; the rest wait. Default 3. */
  max?: Bind<number>;
  /** The key that moves focus to the newest toast and back; `''` for none. Default `'F8'`. */
  hotkey?: Bind<string>;
  /** Timers stop while the pointer is over the toasts. Default `true`. (They always stop while focus is in them or the page is hidden.) */
  pauseOnHover?: Bind<boolean>;
}
