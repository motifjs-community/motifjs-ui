import type { data } from '@motifx-community/data';
import type { DataState } from './data-state';
import type { GroupLevel } from './group-level';
import type { GroupNode } from './group-node';

/** What `GridData` is created of. */
export interface GridDataOptions<T> {
  source: data.DataSource<T, unknown>;
  /** The grid made the source (for its `rows`) and disposes it. */
  owned: boolean;
  paged: boolean;
  /** The rows show part by part, the next one as the view nears the end (a source that loads by page stays paged). */
  infinite?: boolean;
  /** Infinite: a part came, `count` rows from `skip`. */
  partLoaded?: (skip: number, count: number) => void;
  /** Rows per page when the grid pages rows it holds itself. */
  pageSize: number;
  /** Rows per page the user chose (the pager's page sizes), over the source's own; `null` for none. 0: every row on one page. */
  chosenPageSize?: number | null;
  /** The sort the rows start with (as the source names the fields). */
  sort: readonly data.SortItem[];
  /** The levels the rows start grouped by; none for plain rows. */
  group: readonly GroupLevel[];
  /** Who groups the rows (`remoteGrouping`), and rows per request while every row loads for memory. */
  remoteGrouping: 'auto' | boolean;
  groupLoadPageSize: number;
  /** Whether a group is open. */
  expanded: (node: GroupNode) => boolean;
  /** Whether each open group ends with a footer row. */
  footers: () => boolean;
  /** The group summaries a server is requested with its groups; `null` when they can only be computed in memory, which then groups the rows. */
  groupSummary: () => readonly data.SummaryItem[] | null;
  /** The locale group keys are compared in. */
  locale: () => string | undefined;
  saveMode: data.SaveMode;
  createRow?: () => Partial<T>;
  validateRow: data.ChangeTrackerOptions<T, unknown>['validateRow'];
  state: DataState;
  /** Fields of `state` were changed: the grid tells its views. */
  changed?: (...fields: (keyof DataState & string)[]) => void;
  /** The tracker told something; the grid keeps its new-row area in step. */
  edited: (change: data.ChangeTrackerChange<T>) => void;
}
