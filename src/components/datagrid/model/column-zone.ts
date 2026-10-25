import type { StickySide } from '../sticky-side';

/** The part of the row a column sits in: pinned to an edge, or with the columns that scroll. */
export type ColumnZone = StickySide | 'free';
