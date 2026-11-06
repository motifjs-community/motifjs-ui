import type { OverlayPanel } from './OverlayPanel';

/** The arguments of `onOpening`. Set `cancel = true` to keep the overlay closed. */
export interface OverlayOpeningEventArgs {
  cancel: boolean;
  source: OverlayPanel;
}
