import { untracked, type IDisposable } from '@motifx/core';
import { data } from '@motifx-community/data';
import type { GridChanges } from '../grid-changes';
import type { DataState } from './data-state';
import type { GridDataOptions } from './grid-data-options';
import type { GroupLevel } from './group-level';
import type { GroupNode } from './group-node';
import { groupNodes } from './group-nodes';
import { GroupView } from './GroupView';

type Status = DataState['status'];

/**
 * The rows the grid shows and their unsaved changes: a `DataSource` (all rows, a page, or blocks
 * where the view is) and a `ChangeTracker` over it, read the way the grid numbers its rows.
 *
 * - `'all'`: the rows in order; saved new rows the grid still shows where they were entered (the
 *   tracker keeps them until a reload) are left out of them, matched by key, so no row shows twice.
 * - `'page'`: the loaded page; while another page loads its rows are not known yet.
 * - `'blocks'`: what is loaded where the view is.
 *
 * Grouped, the places are those of the grouped list (`GroupView`): group rows and, in open groups,
 * data rows. An adapter that groups, under blocks, gives the groups (keys and counts) and the blocks
 * come in group order, so only what the view shows is loaded; otherwise every matching row is here
 * and grouped in memory, as with rows in memory.
 *
 * Infinite, the places shown end where the parts loaded so far end: blocks load part by part from
 * the start (the end is known when a part comes back short), anything else (rows in memory, groups)
 * shows `pageSize` more places at a time.
 */
export class GridData<T> {
  readonly source: data.DataSource<T, unknown>;
  readonly tracker: data.ChangeTracker<T, unknown>;
  readonly paged: boolean;
  readonly infinite: boolean;
  private readonly state: DataState;
  private readonly owned: boolean;
  private readonly expanded: (node: GroupNode) => boolean;
  private readonly footers: () => boolean;
  private readonly groupSummary: () => readonly data.SummaryItem[] | null;
  private readonly locale: () => string | undefined;
  private readonly subscriptions: IDisposable[] = [];
  /** Rows of a page; 0: every row on one page. */
  private size: number;
  /** `'all'`: the rows without the saved new rows, and those rows' keys; dropped when either side changes. */
  private shownRows: readonly T[] | null = null;
  private savedKeys: Set<string> | null = null;
  /** The sort the grid gives; grouped on a server, the source sorts by the groups first. */
  private userSort: readonly data.SortItem[];
  private sourceStatus: Status = 'loading';
  private levels: GroupLevel[] = [];
  /** Who groups (`remoteGrouping`), and rows per request while every row loads for memory. */
  private remote: 'auto' | boolean = 'auto';
  private loadSize = 0;
  /** How the rows are grouped: by the source's adapter (`'server'`), in memory, or not at all. */
  private groupMode: 'server' | 'memory' | null = null;
  private groupState: Status = 'ready';
  private groupGeneration = 0;
  private groupController: AbortController | undefined;
  private tree: GroupNode[] = [];
  private view: GroupView | null = null;
  /** Memory: the rows in group order, and whether they must be grouped again. */
  private grouped: T[] = [];
  private groupedIndex: Map<string, number> | null = null;
  private regroup = true;
  /** Memory over pages or blocks: every matching row, loaded apart. */
  private allRows: T[] | null = null;
  private allIndex: Map<string, T> | null = null;
  /** Every matching row of pages or blocks, loading or loaded, for grouping and summaries alike; dropped with the row set. */
  private everyLoad: Promise<T[]> | undefined;
  private everyController: AbortController | undefined;
  /** Infinite: places shown; the first place of the part loading (-1: none), and whether it failed. */
  private reach = 0;
  private part = -1;
  private failed = false;
  /** Infinite over blocks: the places the view asked for last. */
  private shown: [number, number] = [0, 0];
  private readonly partLoaded: (skip: number, count: number) => void;

  constructor(options: GridDataOptions<T>) {
    const source = options.source;
    this.source = source;
    this.owned = options.owned;
    this.state = options.state;
    this.expanded = options.expanded;
    this.footers = options.footers;
    this.groupSummary = options.groupSummary;
    this.locale = options.locale;
    this.loadSize = Math.max(0, Math.floor(options.groupLoadPageSize));
    this.paged = source.loadMode === 'page' || options.paged;
    this.infinite = !this.paged && !!options.infinite;
    this.partLoaded = options.partLoaded ?? (() => {});
    const chosen = options.chosenPageSize ?? null;
    this.size = source.loadMode === 'all' || (chosen !== null && source.loadMode === 'page') ? Math.max(0, Math.floor(chosen ?? options.pageSize)) : chosen ?? source.pageSize;
    // Before the first load a source that loads pages only keeps the size.
    if (source.loadMode === 'page' && source.pageSize !== this.size) void source.setPageSize(this.size);
    this.userSort = [...options.sort];
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
          if (e.reason === 'saved' || e.reason === 'released') {
            this.regroup = true;
            this.rowsChanged();
          }
          this.state.edits++;
        });
        options.edited(e);
      }),
    );
    this.sourceStatus = source.status === 'ready' ? 'ready' : source.status === 'error' ? 'error' : 'loading';
    untracked(() => {
      this.state.failedBlocks = source.failedBlocks;
      this.updateStatus();
    });
    this.startOver();
    if (options.group.length) this.setGrouping(options.group, { remote: options.remoteGrouping, loadSize: options.groupLoadPageSize });
    else if (!sameSort(source.sort, this.userSort)) void source.setSort(this.userSort);
    if (source.status === 'idle') void source.load();
    else untracked(() => this.takePart());
  }

  /** Rows of a page in paged mode; 0: every row on one page. */
  get pageSize(): number {
    return this.size;
  }

  /** Another page size; a source that loads pages drops its rows and loads its first page in it. */
  setPageSize(size: number) {
    this.size = Math.max(0, Math.floor(size));
    if (this.source.loadMode === 'page') void this.source.setPageSize(this.size);
    if (this.infinite && !this.byParts) {
      this.startOver();
      untracked(() => this.rowsChanged());
    }
  }

  /** The page the source is on (`'page'`). */
  get sourcePage(): number {
    return this.source.loadMode === 'page' && !this.groupMode ? this.source.pageIndex : 0;
  }

  /** The sort the grid gave (without the groups). */
  get sort(): readonly data.SortItem[] {
    return this.userSort;
  }

  /** Places in the list: data rows, and group rows while grouped; 0 while the first answer is loading. Infinite: the places shown so far. Reactive. */
  get total(): number {
    void this.state.version;
    if (!this.infinite) return this.allPlaces();
    if (this.byParts) return Math.min(this.reach, this.source.total ?? this.reach);
    return Math.min(this.reach, this.allPlaces());
  }

  /** Infinite: whether every place shows (the end is known and reached); always `true` otherwise. Reactive. */
  get ended(): boolean {
    void this.state.version;
    if (!this.infinite) return true;
    if (this.byParts) return this.source.total !== undefined && this.reach >= this.source.total;
    return this.reach >= this.allPlaces();
  }

  /** Infinite: a part after the first is loading. Reactive. */
  get loadingMore(): boolean {
    void this.state.version;
    return this.part > 0 && !this.failed;
  }

  /** Infinite: the part loading failed; `retry()` loads it again. Reactive. */
  get moreFailed(): boolean {
    void this.state.version;
    return this.part >= 0 && this.failed;
  }

  /** Data rows matching the query when they are known: rows in memory and groups always, blocks once counted or their end is reached. Reactive. */
  get knownCount(): number | undefined {
    void this.state.version;
    if (this.groupMode) return this.groupView()?.rowCount;
    if (this.source.loadMode === 'all') return this.rows().length;
    return this.source.total;
  }

  /** Infinite: shows the next part, `pageSize` more places; blocks load it first. `false` while a part loads or every place shows. */
  loadMore(): boolean {
    if (!this.infinite || this.part >= 0 || untracked(() => this.ended)) return false;
    if (!this.byParts) {
      const from = untracked(() => this.total);
      this.reach += this.size > 0 ? this.size : Number.POSITIVE_INFINITY;
      untracked(() => this.rowsChanged());
      this.partLoaded(from, untracked(() => this.total) - from);
      return true;
    }
    this.part = this.reach;
    this.failed = false;
    this.ensureParts(true);
    untracked(() => this.state.version++);
    return true;
  }

  /** Places of every row (and group row), loaded or not. */
  private allPlaces(): number {
    if (this.groupMode) return this.groupView()?.size ?? 0;
    if (this.source.loadMode === 'all') return this.rows().length;
    return this.source.total ?? 0;
  }

  /** Infinite over blocks, not grouped: each part waits for its block. */
  private get byParts(): boolean {
    return this.infinite && this.source.loadMode === 'blocks' && !this.groupMode;
  }

  /** Infinite: back to the first part (a new query, other groups). */
  private startOver() {
    if (!this.infinite) return;
    this.failed = false;
    this.shown = [0, 0];
    const byParts = this.byParts;
    this.reach = byParts ? 0 : this.size > 0 ? this.size : Number.POSITIVE_INFINITY;
    this.part = byParts ? 0 : -1;
  }

  /** Infinite over blocks: the part loading came (or failed), and the places shown grow. */
  private takePart() {
    const from = this.part;
    if (from < 0 || !this.byParts) return;
    const s = this.source;
    if (s.isFailed(from)) {
      this.failed = true;
      return;
    }
    const size = Math.max(1, this.size);
    let n = 0;
    while (n < size && s.rowAt(from + n) !== undefined) n++;
    const end = s.total;
    if (n === 0 && (end === undefined || end > from)) return;
    this.reach = from + n;
    this.part = -1;
    this.failed = false;
    if (from > 0) this.partLoaded(from, n);
  }

  /** Infinite over blocks: asks for the places in view and the part loading. */
  private ensureParts(immediate: boolean) {
    const ranges: [number, number][] = [];
    const [first, end] = this.shown;
    if (end > first) ranges.push([first, end]);
    if (this.part >= 0) ranges.push([this.part, this.part + Math.max(1, this.size)]);
    if (ranges.length) this.source.ensureRanges(ranges, immediate);
  }

  /** Data rows, in every group too. Reactive. */
  get rowCount(): number {
    void this.state.version;
    if (this.groupMode) return this.groupView()?.rowCount ?? 0;
    return this.total;
  }

  /** Whether the rows are grouped now. */
  get isGrouped(): boolean {
    return this.groupMode !== null;
  }

  /** The data row at place `index`, or `undefined` while it is not loaded (or a group row or footer is there). */
  rowAt(index: number): T | undefined {
    if (this.groupMode) {
      const entry = this.groupView()?.itemAt(index);
      if (!entry || entry.node) return undefined;
      return this.groupMode === 'memory' ? this.grouped[entry.data] : this.source.rowAt(entry.data);
    }
    const s = this.source;
    if (s.loadMode === 'blocks') return s.rowAt(index);
    if (s.loadMode === 'page') {
      const page = s.loadedPageIndex;
      const size = s.pageSize;
      if (page < 0 || (size > 0 && Math.floor(index / size) !== page)) return undefined;
      return s.rows[index - page * size];
    }
    return this.rows()[index];
  }

  /** A data row by its index among the rows in group order (grouped); `undefined` while it is not loaded. */
  rowOfData(d: number): T | undefined {
    if (this.groupMode === 'memory') return this.grouped[d];
    return this.groupMode === 'server' ? this.source.rowAt(d) : this.rowAt(d);
  }

  /** The group whose row is at place `index`, or `null`. */
  groupAt(index: number): GroupNode | null {
    const entry = this.groupMode ? this.groupView()?.itemAt(index) : null;
    return entry && entry.footer === false ? entry.node : null;
  }

  /** The group whose footer row is at place `index`, or `null`. */
  footerAt(index: number): GroupNode | null {
    const entry = this.groupMode ? this.groupView()?.itemAt(index) : null;
    return entry?.footer ? entry.node : null;
  }

  /** The grouped list, while grouped and known. */
  groupView(): GroupView | null {
    if (!this.groupMode) return null;
    if (this.groupMode === 'memory' && this.regroup) untracked(() => this.groupInMemory());
    if (!this.view && this.groupState === 'ready') this.view = new GroupView(this.tree, this.expanded, untracked(() => this.footers()));
    return this.view;
  }

  /** Memory: the rows in group order; `null` when a server groups them. */
  groupedRows(): readonly T[] | null {
    if (this.groupMode !== 'memory') return null;
    this.groupView();
    return this.grouped;
  }

  /** Memory: the rows of a group, levels below included; `null` when a server groups them. */
  rowsOfGroup(node: GroupNode): T[] | null {
    const rows = this.groupedRows();
    return rows ? rows.slice(node.start, node.start + node.count) : null;
  }

  /** Whether a server groups the rows (its groups carry the summaries it was asked for). */
  get groupedOnServer(): boolean {
    return this.groupMode === 'server';
  }

  /**
   * Every matching row of a source that loads pages or blocks, asked for once per row set (`size`
   * rows a request, 0 all at once) and kept until the filter, the search or the rows change. Grouping
   * and summaries in memory share it.
   */
  everyRow(size: number): Promise<T[]> {
    if (this.everyLoad) return this.everyLoad;
    const controller = new AbortController();
    this.everyController = controller;
    const signal = controller.signal;
    const step = Math.max(0, Math.floor(size));
    const load = (async () => {
      if (step <= 0) return (await this.source.loadRange({ signal })).rows;
      const rows: T[] = [];
      let total = Number.POSITIVE_INFINITY;
      for (let skip = 0; skip < total; skip += step) {
        const part = await this.source.loadRange({ skip, take: step, count: skip === 0, signal });
        if (skip === 0 && part.total !== undefined) total = part.total;
        for (const row of part.rows) rows.push(row);
        if (part.rows.length < step) break;
      }
      return rows;
    })();
    this.everyLoad = load;
    load.catch(() => {
      if (this.everyLoad === load) this.everyLoad = undefined;
    });
    return load;
  }

  /** The view shows places `first` to `end - 1`: blocks load what is missing; `immediate` skips the wait after a jump. */
  ensure(first: number, end: number, immediate: boolean) {
    if (this.source.loadMode !== 'blocks' || this.groupMode === 'memory') return;
    if (this.byParts) {
      const stop = Math.min(end, this.reach);
      this.shown = stop > first ? [first, stop] : [0, 0];
      this.ensureParts(immediate);
      return;
    }
    if (!this.groupMode) {
      this.source.ensure(first, end, immediate);
      return;
    }
    const runs = this.groupView()?.rowsBetween(first, end) ?? [];
    if (runs.length) this.source.ensureRanges(runs, immediate);
  }

  /** Keeps the block of the row at place `index` loaded; -1 lets it go. */
  pin(index: number) {
    if (this.groupMode === 'memory') return;
    if (!this.groupMode || index < 0) {
      this.source.pin(index);
      return;
    }
    const entry = this.groupView()?.itemAt(index);
    this.source.pin(entry && !entry.node ? entry.data : -1);
  }

  setPage(page: number) {
    if (this.source.loadMode === 'page' && !this.groupMode) void this.source.setPage(page);
  }

  setSort(sort: readonly data.SortItem[]) {
    this.userSort = [...sort];
    void this.source.setSort(this.sourceSort());
  }

  setFilter(filter: data.FilterExpression | null) {
    void this.source.setFilter(filter);
  }

  /**
   * Groups the rows by these levels (none: not grouped), with `sort` inside the groups. Under blocks,
   * the source's adapter groups when every level has a field it can group by and `remote` says so
   * (`'auto'`: when the adapter groups); anything else is grouped in memory, from every matching row
   * (`loadSize` a request, 0 all at once).
   */
  setGrouping(levels: readonly GroupLevel[], options: { sort?: readonly data.SortItem[]; remote?: 'auto' | boolean; loadSize?: number } = {}) {
    const source = this.source;
    this.levels = [...levels];
    if (options.sort) this.userSort = [...options.sort];
    if (options.remote !== undefined) this.remote = options.remote;
    if (options.loadSize !== undefined) this.loadSize = Math.max(0, Math.floor(options.loadSize));
    // Group summaries only memory can compute keep the grouping in memory too.
    const possible = levels.length > 0 && source.loadMode === 'blocks' && levels.every((l) => l.serverField !== null) && untracked(() => this.groupSummary()) !== null;
    const server = possible && (this.remote === true || (this.remote === 'auto' && source.adapter.capabilities.group));
    this.groupMode = !levels.length ? null : server ? 'server' : 'memory';
    this.stopGroupLoad();
    this.tree = [];
    this.view = null;
    this.grouped = [];
    this.groupedIndex = null;
    this.regroup = true;
    this.allRows = null;
    this.allIndex = null;
    this.groupState = 'ready';
    this.startOver();
    const order = this.sourceSort();
    // A new sort is a new query: the groups load when it fires.
    if (!sameSort(source.sort, order)) void source.setSort(order);
    else if (this.groupMode === 'server') this.loadGroups();
    if (this.groupMode === 'memory' && source.loadMode !== 'all') this.loadEveryRow();
    untracked(() => {
      this.updateStatus();
      this.rowsChanged();
    });
  }

  /** The open groups changed: the list is made again. */
  regroupView() {
    this.view = null;
    untracked(() => this.state.version++);
  }

  /** Loads again, keeping the position; saved new rows leave where they were entered and take their place among the rows. */
  refresh() {
    this.tracker.releaseSaved();
    void this.source.reload();
  }

  retry() {
    if (this.failed) {
      this.failed = false;
      untracked(() => this.state.version++);
    }
    if (this.groupMode && this.groupState === 'error') this.reloadGroups();
    else void this.source.retry();
  }

  /** Place of a data row, found by its key; -1 when it is not loaded or a collapsed group hides it. */
  indexOfRow(row: T): number {
    if (!this.source.adapter.keys.hasKey(row)) return -1;
    const at = this.placeOf(row);
    // Infinite: a row past the places shown is not there yet.
    return this.infinite && at >= untracked(() => this.total) ? -1 : at;
  }

  private placeOf(row: T): number {
    const s = this.source;
    if (this.groupMode) {
      const view = this.groupView();
      const d = this.dataIndexOf(row);
      return view && d >= 0 ? view.placeOfRow(d) : -1;
    }
    if (s.loadMode !== 'all' || !this.saved().size) return s.indexOfKey(s.adapter.keyOf(row));
    const id = this.keyIdOf(row);
    return this.rows().findIndex((r) => this.keyIdOf(r) === id);
  }

  /** Index of a data row among the rows in group order (grouped), found by its key; -1 when it is not loaded. */
  dataIndexOf(row: T): number {
    const s = this.source;
    if (!s.adapter.keys.hasKey(row)) return -1;
    if (this.groupMode === 'server') return s.indexOfKey(s.adapter.keyOf(row));
    this.groupView();
    if (!this.groupedIndex) {
      const index = new Map<string, number>();
      this.grouped.forEach((r, i) => index.set(this.keyIdOf(r), i));
      this.groupedIndex = index;
    }
    return this.groupedIndex.get(this.keyIdOf(row)) ?? -1;
  }

  /** Whether the rows the grid holds have this row (by key). */
  hasLoaded(row: T): boolean {
    const keys = this.source.adapter.keys;
    if (!keys.hasKey(row)) return false;
    if (this.allRows) return this.allByKey().has(this.keyIdOf(row));
    return this.source.indexOfKey(keys.keyOf(row)) >= 0;
  }

  /** The row with this key among the rows the grid holds and the source's. */
  rowByKey(key: unknown): T | undefined {
    if (this.allRows) {
      const row = this.allByKey().get(this.source.adapter.keyString(key));
      if (row !== undefined) return row;
    }
    return this.source.rowByKey(key);
  }

  /** Every row the grid holds now: all of them in memory, the page, or the blocks loaded. */
  forEachLoaded(fn: (row: T) => void) {
    if (this.allRows) for (const row of this.allRows) fn(row);
    else this.source.forEachLoaded((row) => fn(row));
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
    this.stopGroupLoad();
    this.dropEveryRow();
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

  /** The sort the source gets: grouped on a server, the groups' fields come first. */
  private sourceSort(): data.SortItem[] {
    if (this.groupMode !== 'server') return [...this.userSort];
    return data.groupOrder(
      this.levels.map((l) => ({ field: l.serverField!, dir: l.dir })),
      this.userSort,
    );
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

  private allByKey(): Map<string, T> {
    if (!this.allIndex) {
      const index = new Map<string, T>();
      for (const row of this.allRows ?? []) index.set(this.keyIdOf(row), row);
      this.allIndex = index;
    }
    return this.allIndex;
  }

  private rowsChanged() {
    this.shownRows = null;
    this.savedKeys = null;
    this.state.version++;
  }

  private updateStatus() {
    const st = this.state;
    let status = this.sourceStatus;
    if (this.groupMode === 'memory' && this.source.loadMode !== 'all') status = this.groupState;
    else if (this.groupMode && this.groupState !== 'ready') status = this.groupState;
    if (st.status !== status) st.status = status;
  }

  private sourceChanged(reason: data.DataSourceChange<T>['reason']) {
    untracked(() => {
      const st = this.state;
      const s = this.source;
      // Rows in memory stay while a new query loads; pages and blocks start again.
      if (reason === 'cleared' || (reason === 'query' && s.loadMode !== 'all')) this.sourceStatus = 'loading';
      else if (reason === 'loading' && this.sourceStatus === 'error') this.sourceStatus = 'loading';
      else if (reason === 'loaded') this.sourceStatus = 'ready';
      else if (reason === 'failed' && s.status === 'error') this.sourceStatus = 'error';
      st.failedBlocks = s.failedBlocks;
      // Infinite: a new query starts from the first part; a part that came (or failed) shows.
      if (reason === 'query' || reason === 'cleared') this.startOver();
      else if (reason === 'loaded' || reason === 'failed' || reason === 'rows') this.takePart();
      if (reason === 'loaded' || reason === 'rows' || reason === 'cleared') this.regroup = true;
      if (reason === 'query' || reason === 'reload' || reason === 'rows') this.dropEveryRow();
      if (this.groupMode === 'server' && (reason === 'query' || reason === 'reload' || reason === 'rows')) this.loadGroups();
      if (this.groupMode === 'memory' && s.loadMode !== 'all' && (reason === 'query' || reason === 'reload' || reason === 'rows')) this.loadEveryRow();
      this.updateStatus();
      this.rowsChanged();
    });
  }

  private reloadGroups() {
    if (this.groupMode === 'server') this.loadGroups();
    else if (this.groupMode === 'memory' && this.source.loadMode !== 'all') this.loadEveryRow();
  }

  /** A server's groups: keys and counts of every level, and their summaries, no rows. */
  private loadGroups() {
    const items = this.levels.map((l) => ({ field: l.serverField!, dir: l.dir }));
    const summary = untracked(() => this.groupSummary());
    const groupSummary = summary?.length ? summary : undefined;
    this.startGroupLoad((signal) =>
      this.source.loadGroups(items, { signal, groupSummary }).then((groups) => {
        this.tree = groupNodes(groups as data.RowGroup<unknown>[], this.levels, this.locale());
      }),
    );
  }

  /** Every matching row, to group in memory (an adapter that cannot group, or a value only memory reads). */
  private loadEveryRow() {
    this.startGroupLoad(async () => {
      const rows = await this.everyRow(this.loadSize);
      this.allRows = rows;
      this.allIndex = null;
      this.regroup = true;
    });
  }

  private startGroupLoad(load: (signal: AbortSignal) => Promise<void>) {
    this.stopGroupLoad();
    const controller = new AbortController();
    this.groupController = controller;
    const generation = ++this.groupGeneration;
    this.groupState = 'loading';
    this.view = null;
    untracked(() => this.updateStatus());
    load(controller.signal).then(
      () => {
        if (generation !== this.groupGeneration) return;
        this.groupController = undefined;
        this.groupState = 'ready';
        this.view = null;
        untracked(() => {
          this.updateStatus();
          this.rowsChanged();
        });
      },
      (error: unknown) => {
        if (generation !== this.groupGeneration || data.isAbortError(error)) return;
        this.groupController = undefined;
        this.groupState = 'error';
        this.tree = [];
        this.view = null;
        untracked(() => {
          this.updateStatus();
          this.rowsChanged();
        });
      },
    );
  }

  private stopGroupLoad() {
    this.groupGeneration++;
    this.groupController?.abort();
    this.groupController = undefined;
  }

  private dropEveryRow() {
    this.everyController?.abort();
    this.everyController = undefined;
    this.everyLoad = undefined;
  }

  /** Groups the rows in memory: the source's rows, or every matching row loaded apart. */
  private groupInMemory() {
    this.regroup = false;
    this.view = null;
    this.groupedIndex = null;
    const rows = this.source.loadMode === 'all' ? this.rows() : (this.allRows ?? []);
    const readers = new Map(this.levels.map((l) => [l.field, l.read]));
    const orders = new Map(this.levels.map((l) => [l.field, l.compare]));
    const ctx: data.EvaluateContext = { ...this.source.adapter.evaluateContext, groupValue: (field) => readers.get(field), groupCompare: (field) => orders.get(field) };
    const result = data.queryArray(rows, { group: this.levels.map((l) => ({ field: l.field, dir: l.dir })) }, ctx);
    this.grouped = result.rows;
    this.tree = groupNodes((result.groups ?? []) as data.RowGroup<unknown>[], this.levels, this.locale());
  }
}

function sameSort(a: readonly data.SortItem[], b: readonly data.SortItem[]): boolean {
  return a.length === b.length && a.every((s, i) => s.field === b[i].field && s.dir === b[i].dir);
}
