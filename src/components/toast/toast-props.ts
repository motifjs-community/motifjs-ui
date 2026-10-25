import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { IconSource } from '../../core/icon-source';
import type { ToastAction } from './toast-action';
import type { ToastCloseReason } from './toast-close-reason';
import type { ToastPosition } from './toast-position';
import type { ToastTone } from './toast-tone';

/**
 * Props of `Toast`, and what `toast.show()` takes: the shared `ControlProps` (`text` is the
 * message) plus its own. Each one is also a settable, reactive property.
 */
export interface ToastProps extends ControlProps {
  /** A bold line above the text. */
  title?: Bind<string>;
  /** Default `'info'`. */
  tone?: Bind<ToastTone>;
  /** Default: the tone's glyph; `null` shows none. */
  icon?: Bind<IconSource | null | undefined>;
  /** Milliseconds it stays; `0` keeps it until it is closed. Default 5000. */
  duration?: Bind<number>;
  /** A button in the toast, such as Undo. */
  action?: Bind<ToastAction | null | undefined>;
  /** Default `true`. */
  closeButton?: Bind<boolean>;
  /** Where it stacks; its toaster's `position` by default. Read when it is shown. */
  position?: Bind<ToastPosition | undefined>;
  onClosed?: (reason: ToastCloseReason) => void;
}
