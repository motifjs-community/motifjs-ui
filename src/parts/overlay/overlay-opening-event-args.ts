import type { OverlayPanel } from './OverlayPanel';

/** An overlay is about to open; `cancel = true` keeps it closed. */
export interface OverlayOpeningEventArgs {
  cancel: boolean;
  source: OverlayPanel;
}
