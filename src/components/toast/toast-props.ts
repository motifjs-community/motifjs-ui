import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { IconSource } from '../../core/icon-source';
import type { ToastAction } from './toast-action';
import type { ToastCloseReason } from './toast-close-reason';
import type { ToastPosition } from './toast-position';
import type { ToastTone } from './toast-tone';

/**
 * Props of `Toast`, and the options of `toast.show()`: the shared `ControlProps` (`text` is the
 * message) in addition to its own. Each prop is also a settable, reactive property.
 */
export interface ToastProps extends ControlProps {
  /** A bold line above the message. */
  title?: Bind<string>;
  /** The default is `'info'`. */
  tone?: Bind<ToastTone>;
  /** The default is the tone's glyph. `null` shows none. */
  icon?: Bind<IconSource | null | undefined>;
  /** The time it stays, in milliseconds. `0` keeps it open until it is closed. The default is 5000. */
  duration?: Bind<number>;
  /** A button in the toast, such as Undo. */
  action?: Bind<ToastAction | null | undefined>;
  /** The default is `true`. */
  closeButton?: Bind<boolean>;
  /** The stacking position. The default is the `position` of its toaster. It is read when the toast is shown. */
  position?: Bind<ToastPosition | undefined>;
  onClosed?: (reason: ToastCloseReason) => void;
}
