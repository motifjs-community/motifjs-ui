import type { data } from '@motifx-community/data';
import type { DataState } from './data-state';
import type { GroupLevel } from './group-level';
import type { GroupNode } from './group-node';

/** What `GridData` is made of. */
export interface GridDataOptions<T> {
  source: data.DataSource<T, unknown>;
  /** The grid made the source (for its `rows`) and disposes it. */
  owned: boolean;
  paged: boolean;
  /** Rows per page when the grid pages rows it holds itself. */
  pageSize: number;
  /** The sort the rows start with (as the source names the fields). */
  sort: readonly data.SortItem[];
  /** The levels the rows start grouped by; none for plain rows. */
  group: readonly GroupLevel[];
  /** Who groups the rows (`remoteGrouping`), and rows per request while every row loads for memory. */
  remoteGrouping: 'auto' | boolean;
  groupLoadPageSize: number;
  /** Whether a group is open. */
  expanded: (node: GroupNode) => boolean;
  /** The locale group keys are compared in. */
  locale: () => string | undefined;
  saveMode: data.SaveMode;
  createRow?: () => Partial<T>;
  validateRow: data.ChangeTrackerOptions<T, unknown>['validateRow'];
  state: DataState;
  /** The tracker told something; the grid keeps its new-row area in step. */
  edited: (change: data.ChangeTrackerChange<T>) => void;
}
