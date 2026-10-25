import type { StickySide } from './sticky-side';

/** Saved state of one column in a `GridLayout`. */
export interface ColumnLayout {
  field: string;
  width: number;
  /** Free-space share; 0 once the user has resized the column. */
  flex: number;
  hidden: boolean;
  sticky: StickySide | null;
}
