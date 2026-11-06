import type { StickySide } from './sticky-side';

/** The saved state of one column in a `GridLayout`. */
export interface ColumnLayout {
  field: string;
  width: number;
  /** The share of the free space, or 0 once the user has resized the column. */
  flex: number;
  hidden: boolean;
  sticky: StickySide | null;
}
