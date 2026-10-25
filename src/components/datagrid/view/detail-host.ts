import type { ComponentBase } from '@motifx/core';
import type { DataGrid } from '../DataGrid';

/** What a row's details ask of the grid. */
export interface DetailHost<T> {
  /** Holds the details' components, so they live and go with it. */
  readonly owner: ComponentBase;
  readonly grid: DataGrid<T>;
  /** Closes a row's details by its key, as the user would. */
  collapse(key: unknown): boolean;
}
