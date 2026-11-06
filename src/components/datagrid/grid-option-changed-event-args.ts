/**
 * Occurs when a setting is assigned: one of `grid.settings`, of a column (`grid.columnSettings(field)`,
 * `grid.columnOption(field, …)`, with `field` set) or of the toolbar (`name` `'toolbar.visible'`,
 * `'toolbar.items'`). With `name` `'columns'`, a column was added or removed, and `value` and `previous`
 * are the fields of the data columns.
 */
export interface GridOptionChangedEventArgs {
  readonly name: string;
  /** The column, for a column's setting. */
  readonly field?: string;
  /** The current value (a function's current result). */
  readonly value: unknown;
  readonly previous: unknown;
}
