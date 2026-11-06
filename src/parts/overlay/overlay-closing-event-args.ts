import type { OverlayCloseReason } from './overlay-close-reason';
import type { OverlayPanel } from './OverlayPanel';

/** The arguments of `onClosing`. Set `cancel = true` to keep the overlay open, unless its owner is being disposed. */
export interface OverlayClosingEventArgs {
  cancel: boolean;
  reason: OverlayCloseReason;
  source: OverlayPanel;
}
