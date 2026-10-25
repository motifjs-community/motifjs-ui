import type { data } from '@motifx-community/data';
import type { DataState } from './data-state';

/** What `GridData` is made of. */
export interface GridDataOptions<T> {
  source: data.DataSource<T, unknown>;
  /** The grid made the source (for its `rows`) and disposes it. */
  owned: boolean;
  paged: boolean;
  /** Rows per page when the grid pages rows it holds itself. */
  pageSize: number;
  saveMode: data.SaveMode;
  createRow?: () => Partial<T>;
  validateRow: data.ChangeTrackerOptions<T, unknown>['validateRow'];
  state: DataState;
  /** The tracker told something; the grid keeps its new-row area in step. */
  edited: (change: data.ChangeTrackerChange<T>) => void;
}
