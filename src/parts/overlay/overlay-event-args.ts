import type { OverlayPanel } from './OverlayPanel';

/** An event of an overlay with nothing more to say than which one it is. */
export interface OverlayEventArgs {
  source: OverlayPanel;
}
