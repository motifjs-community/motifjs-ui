/** Infinite mode: a part of the rows came, `count` rows from `skip`; `ended` once every row shows. */
export interface GridMoreRowsLoadedEventArgs {
  readonly skip: number;
  readonly count: number;
  readonly ended: boolean;
}
