import type { data } from '@motifx-community/data';

/**
 * The selected rows as a state: one by one (`keys`), or every row of `filter` except `except`, which is
 * what "select all" produces over data of any size. Send it to the server for operations on the
 * selected rows. `grid.selectionFilter` converts it to a filter when the key is a single field.
 */
export interface GridSelection {
  /** Indicates that every row of `filter` is selected, except those in `except`. */
  all: boolean;
  /** The keys of the selected rows, while `all` is `false`. */
  keys: unknown[];
  /** The keys of the omitted rows, while `all` is `true`. */
  except: unknown[];
  /** The rows' filter when everything was selected (the source's filter, including the grid's filters). */
  filter: data.FilterExpression | null;
}
