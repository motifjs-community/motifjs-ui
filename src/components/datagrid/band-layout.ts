import type { StickySide } from './sticky-side';

/** Saved state of one band in a `GridLayout`; its place comes from its columns'. */
export interface BandLayout {
  name: string;
  hidden: boolean;
  sticky: StickySide | null;
}
