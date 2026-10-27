import type { OverlayCloseReason } from './overlay-close-reason';
import type { OverlayPanel } from './OverlayPanel';

/** An overlay is about to close; `cancel = true` keeps it open (not when its owner goes away). */
export interface OverlayClosingEventArgs {
  cancel: boolean;
  reason: OverlayCloseReason;
  source: OverlayPanel;
}
