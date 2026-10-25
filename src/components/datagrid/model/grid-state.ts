import type { data } from '@motifx-community/data';
import type { Adjustment } from './adjustment';
import type { DataState } from './data-state';

/** The grid's shared reactive state. */
export interface GridState extends DataState {
  sort: data.SortItem[];
  /** The page shown (paged mode), 0-based. */
  page: number;
  rowHeight: number;
  /** Visible height of the body (viewport minus header). */
  viewport: number;
  /** The body has been measured: the rows drawn are the ones on the screen (lookup cells ask for their keys from then on). */
  measured: boolean;
  activeRow: number;
  activeField: string;
  /** The user has moved the active cell; until then it follows the data (header ↔ first row). */
  touched: boolean;
  adjust: Adjustment | null;
  announcement: string;
  /** Rows in the new-row area (the rows themselves stay out of reactive state: the tracker knows them by identity). */
  added: number;
  /** The row the user is in with edits not sent yet (its id), or `null`. */
  session: string | null;
  /** The cell in edit mode, or `null`. */
  editing: { rowId: string; field: string } | null;
  /** A row is being saved and the grid waits for it (`wait` mode): no navigation. */
  busy: boolean;
  /** Grows when the grid starts again with other data. */
  connection: number;
  /** An export is collecting rows. */
  exporting: boolean;
}
