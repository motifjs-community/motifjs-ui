/** In infinite mode, occurs when a page of rows arrives: `count` rows from `skip`, and `ended` once every row is displayed. */
export interface GridMoreRowsLoadedEventArgs {
  readonly skip: number;
  readonly count: number;
  readonly ended: boolean;
}
