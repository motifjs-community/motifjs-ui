import type { StickySide } from './sticky-side';

/** The saved state of one band in a `GridLayout`. Its position comes from its columns. */
export interface BandLayout {
  name: string;
  hidden: boolean;
  sticky: StickySide | null;
}
