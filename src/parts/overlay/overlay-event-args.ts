import type { OverlayPanel } from './OverlayPanel';

/** The arguments of an overlay event that reports only which overlay raised it. */
export interface OverlayEventArgs {
  source: OverlayPanel;
}
