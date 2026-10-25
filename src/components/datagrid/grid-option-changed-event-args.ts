/**
 * A setting was assigned: one of `grid.settings`, one of a column's (`grid.columnSettings(field)`,
 * `field` set) or of the toolbar (`name` `'toolbar.visible'`, `'toolbar.items'`).
 */
export interface GridOptionChangedEventArgs {
  readonly name: string;
  /** The column, for a column's setting. */
  readonly field?: string;
  /** The value now (a function's current result). */
  readonly value: unknown;
  readonly previous: unknown;
}
