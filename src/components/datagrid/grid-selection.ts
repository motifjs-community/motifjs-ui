import type { data } from '@motifx-community/data';

/**
 * The selected rows as a state, not a list: one by one (`keys`), or every row of `filter` but
 * `except`, which is what "select all" gives over data of any size. Send it to the server for work on
 * the selected rows; `grid.selectionFilter` turns it into a filter when the key is one field.
 */
export interface GridSelection {
  /** Every row of `filter` is selected but the ones in `except`. */
  all: boolean;
  /** Keys of the selected rows, while `all` is `false`. */
  keys: unknown[];
  /** Keys of the rows left out, while `all` is `true`. */
  except: unknown[];
  /** The rows' filter when everything was selected (the source's filter, the grid's filters in it). */
  filter: data.FilterExpression | null;
}
