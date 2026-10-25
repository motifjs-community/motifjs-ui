import { untracked, type IDisposable } from '@motifx/core';
import { data } from '@motifx-community/data';
import type { GridChanges } from '../grid-changes';
import type { DataState } from './data-state';
import type { GridDataOptions } from './grid-data-options';

/**
 * The rows the grid shows and their unsaved changes: a `DataSource` (all rows, a page, or blocks
 * where the view is) and a `ChangeTracker` over it, read the way the grid numbers its rows.
 *
 * - `'all'`: the rows in order; saved new rows the grid still shows where they were entered (the
 *   tracker keeps them until a reload) are left out of them, matched by key, so no row shows twice.
 * - `'page'`: the loaded page; while another page loads its rows are not known yet.
 * - `'blocks'`: what is loaded where the view is.
 */
export class GridData<T> {
  readonly source: data.DataSource<T, unknown>;
  readonly tracker: data.ChangeTracker<T, unknown>;
  readonly paged: boolean;
  readonly pageSize: number;
  private readonly state: DataState;
  private readonly owned: boolean;
  private readonly subscriptions: IDisposable[] = [];
  /** `'all'`: the rows without the saved new rows, and those rows' keys; dropped when either side changes. */
  private shownRows: readonly T[] | null = null;
  private savedKeys: Set<string> | null = null;

  constructor(options: GridDataOptions<T>) {
    const source = options.source;
    this.source = source;
    this.owned = options.owned;
    this.state = options.state;
    this.paged = source.loadMode === 'page' || options.paged;
    this.pageSize = source.loadMode === 'all' ? Math.max(1, Math.floor(options.pageSize)) : source.pageSize;
    this.tracker = new data.ChangeTracker<T, unknown>({
      source,
      saveMode: options.saveMode,
      createRow: options.createRow,
      validateRow: options.validateRow,
      keepSavedNewRows: true,
    });
    this.subscriptions.push(
      source.onChanged((e) => this.sourceChanged(e.reason)),
      this.tracker.onChanged((e) => {
        untracked(() => {
          if (e.reason === 'saved' || e.reason === 'released') this.rowsChanged();
          this.state.edits++;
        });
        options.edited(e);
      }),
    );
    untracked(() => {
      const st = this.state;
      st.status = source.status === 'ready' ? 'ready' : source.status === 'error' ? 'error' : 'loading';
      st.failedBlocks = source.failedBlocks;
      st.version++;
    });
    if (source.status === 'idle') void source.load();
  }

  /** The page the source is on (`'page'`). */
  get sourcePage(): number {
    return this.source.loadMode === 'page' ? this.source.pageIndex : 0;
  }

  /** Data rows; 0 while the first answer is loading. Reactive. */
  get total(): number {
    void this.state.version;
    if (this.source.loadMode === 'all') return this.rows().length;
    return this.source.total ?? 0;
  }

  /** The data row at `index`, or `undefined` while it is not loaded. */
  rowAt(index: number): T | undefined {
    const s = this.source;
    if (s.loadMode === 'blocks') return s.rowAt(index);
    if (s.loadMode === 'page') {
      const page = s.loadedPageIndex;
      if (page < 0 || Math.floor(index / s.pageSize) !== page) return undefined;
      return s.rows[index - page * s.pageSize];
    }
    return this.rows()[index];
  }

  /** The view shows data rows `first` to `end - 1`: blocks load what is missing; `immediate` skips the wait after a jump. */
  ensure(first: number, end: number, immediate: boolean) {
    if (this.source.loadMode === 'blocks') this.source.ensure(first, end, immediate);
  }

  /** Keeps the block of the active row loaded; -1 lets it go. */
  pin(index: number) {
    this.source.pin(index);
  }

  setPage(page: number) {
    if (this.source.loadMode === 'page') void this.source.setPage(page);
  }

  setSort(sort: readonly data.SortItem[]) {
    void this.source.setSort(sort);
  }

  setFilter(filter: data.FilterExpression | null) {
    void this.source.setFilter(filter);
  }

  /** Loads again, keeping the position; saved new rows leave where they were entered and take their place among the rows. */
  refresh() {
    this.tracker.releaseSaved();
    void this.source.reload();
  }

  retry() {
    void this.source.retry();
  }

  /** Index of a data row among the data rows, found by its key; -1 when it is not loaded. */
  indexOfRow(row: T): number {
    const s = this.source;
    if (!s.adapter.keys.hasKey(row)) return -1;
    if (s.loadMode !== 'all' || !this.saved().size) return s.indexOfKey(s.adapter.keyOf(row));
    const id = this.keyIdOf(row);
    return this.rows().findIndex((r) => this.keyIdOf(r) === id);
  }

  /** Whether the source has this row (by key) among its loaded rows. */
  hasLoaded(row: T): boolean {
    const keys = this.source.adapter.keys;
    return keys.hasKey(row) && this.source.indexOfKey(keys.keyOf(row)) >= 0;
  }

  /** The id the tracker keeps a row under: its key as text, or `+1`, `+2` … for a new row. */
  idOf(row: T): string {
    return this.tracker.rowIdOf(row);
  }

  /** What the tracker keeps of a row, by id. */
  edit(rowId: string | undefined): data.RowEditState<T> | undefined {
    return rowId === undefined ? undefined : this.tracker.editById(rowId);
  }

  /** The unsaved changes, as copies. */
  changes(): GridChanges<T> {
    const out: GridChanges<T> = { added: [], updated: [], removed: [], count: 0 };
    for (const change of this.tracker.changes()) {
      if (change.type === 'insert') out.added.push(change.data as T);
      else if (change.type === 'update') out.updated.push({ row: { ...(change.original as object), ...change.data } as T, changed: change.data, original: change.original as T });
      else out.removed.push(change.original as T);
      out.count++;
    }
    return out;
  }

  dispose() {
    for (const s of this.subscriptions) s.dispose();
    this.tracker.dispose();
    if (!this.owned) return;
    const adapter = this.source.adapter;
    this.source.dispose();
    adapter.dispose();
  }

  private keyIdOf(row: T): string {
    const adapter = this.source.adapter;
    return adapter.keyString(adapter.keyOf(row));
  }

  /** Keys of the saved new rows the tracker still keeps where they were entered. */
  private saved(): Set<string> {
    if (this.savedKeys) return this.savedKeys;
    const keys = new Set<string>();
    if (this.source.loadMode === 'all') {
      const has = this.source.adapter.keys;
      for (const row of this.tracker.newRows) if (!this.tracker.editOf(row) && has.hasKey(row)) keys.add(this.keyIdOf(row));
    }
    return (this.savedKeys = keys);
  }

  private rows(): readonly T[] {
    const saved = this.saved();
    if (!saved.size) return this.source.rows;
    return (this.shownRows ??= this.source.rows.filter((row) => !saved.has(this.keyIdOf(row))));
  }

  private rowsChanged() {
    this.shownRows = null;
    this.savedKeys = null;
    this.state.version++;
  }

  private sourceChanged(reason: data.DataSourceChange<T>['reason']) {
    untracked(() => {
      const st = this.state;
      const s = this.source;
      // Rows in memory stay while a new query loads; pages and blocks start again.
      if (reason === 'cleared' || (reason === 'query' && s.loadMode !== 'all')) st.status = 'loading';
      else if (reason === 'loading' && st.status === 'error') st.status = 'loading';
      else if (reason === 'loaded') st.status = 'ready';
      else if (reason === 'failed' && s.status === 'error') st.status = 'error';
      st.failedBlocks = s.failedBlocks;
      this.rowsChanged();
    });
  }
}
