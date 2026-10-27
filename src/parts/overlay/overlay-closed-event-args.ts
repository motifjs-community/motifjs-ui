import type { OverlayCloseReason } from './overlay-close-reason';
import type { OverlayPanel } from './OverlayPanel';

export interface OverlayClosedEventArgs {
  reason: OverlayCloseReason;
  source: OverlayPanel;
}
