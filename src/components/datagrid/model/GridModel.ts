import { reactive, read, untracked } from '@motifx/core';
import { data } from '@motifx-community/data';
import { fillTemplate } from '../../../core/fill-template';
import { pageLocale } from '../../../core/page-locale';
import { uiLocale } from '../../../core/ui-locale';
import type { UiStrings } from '../../../core/ui-strings';
import type { BuiltInAction } from '../built-in-action';
import type { DataGridProps } from '../data-grid-props';
import type { GridAction } from '../grid-action';
import type { GridBuiltInActions } from '../grid-built-in-actions';
import type { GridColumn } from '../grid-column';
import type { GridFilters } from '../grid-filters';
import type { GridLayout } from '../grid-layout';
import type { GridMode } from '../grid-mode';
import type { GridSettings } from '../grid-settings';
import type { RowState } from '../row-state';
import type { EditorValue } from '../view/editor-value';
import type { AddedRow } from './added-row';
import { CellFormatter } from './CellFormatter';
import { cellValue } from './cell-value';
import { ColumnModel } from './ColumnModel';
import { DEFAULT_SETTINGS } from './default-settings';
import { FilterModel } from './FilterModel';
import { FilterValues } from './FilterValues';
import { GridData } from './GridData';
import { GridRowsAdapter } from './GridRowsAdapter';
import { GridSearch } from './GridSearch';
import { LayoutStore } from './LayoutStore';
import { LookupTexts } from './LookupTexts';
import type { GridState } from './grid-state';
import type { RowRun } from './row-run';
import type { RowStatus } from './row-status';
import { RowSelection } from './RowSelection';
import { sameValue } from './same-value';
import { Switches } from './Switches';

/** `activeRow` value of the header row. Rows are 0…count-1. */
export const HEADER_ROW = -1;
/** `activeRow` value of the filter row, between the header and the first row. */
export const FILTER_ROW = -2;

export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_ROW_HEIGHT = 36;

const FIELD_TYPES: Record<string, data.FieldType> = { number: 'number', date: 'datetime', boolean: 'boolean' };

const hasKeys = (o: object) => Object.keys(o).length > 0;

/** The filter a given source had before the grid added its own, by source. */
const BASE_FILTERS = new WeakMap<object, data.FilterExpression | null>();

/**
 * Everything the grid's views share: columns, the data (a `DataSource` and a `ChangeTracker` over it),
 * the new-row area, sort, paging, the active cell and the measured sizes. Views read `state` inside
 * getters; operations are methods here, not in the views.
 *
 * Rows are numbered in one sequence, the "grid index": the data rows and the rows of the new-row area,
 * which sits before the data rows (`newRow.position: 'top'`) or after them (`'bottom'`). In paged
 * mode a page shows its data rows plus the new-row area (top: on every page; bottom: on the last page).
 */
export class GridModel<T> {
  readonly columns: ColumnModel<T>;
  readonly settings: Switches<GridSettings>;
  readonly state: GridState = reactive({
    sort: [],
    page: 0,
    rowHeight: DEFAULT_ROW_HEIGHT,
    viewport: 0,
    measured: false,
    activeRow: HEADER_ROW,
    activeField: '',
    touched: false,
    adjust: null,
    announcement: '',
    added: 0,
    session: null,
    editing: null,
    busy: false,
    connection: 0,
    status: 'loading',
    version: 0,
    edits: 0,
    failedBlocks: 0,
    exporting: false,
  } as GridState) as GridState;
  /** The new-row area, in display order. */
  readonly addedRows: AddedRow<T>[] = [];
  /** The rows, their source and their unsaved changes; made again when the data props change. */
  data!: GridData<T>;
  /** Raised when sort changes, so "next error" knows which last-seen positions still hold. */
  generation = 0;
  onBeforeQueryChange: (() => void) | null = null;
  onQueryChange: (() => void) | null = null;
  onLayoutChange: ((layout: GridLayout) => void) | null = null;
  /** Id of the element that holds the active cell's message (`aria-describedby` of an invalid cell). */
  errorId = '';
  readonly selection = new RowSelection();
  readonly filters: FilterModel<T>;
  /** The search panel's text and filter. */
  readonly search: GridSearch<T>;
  readonly values: FilterValues<T>;
  /** The texts of the lookup columns. */
  readonly lookups: LookupTexts<T>;
  /** The grid's ready actions, by name; the grid fills them in. */
  builtIns: GridBuiltInActions<T> | null = null;
  /** The filter the source had before the grid added its own. */
  baseFilter: data.FilterExpression | null = null;
  /** The grid's filter the source has now, as text. */
  private appliedFilter = 'null';
  private filterTimer: ReturnType<typeof setTimeout> | undefined;
  private formatterCache: CellFormatter | null = null;
  /** Where rows with changes were last seen (data index, generation), for "next error" on rows not loaded. */
  private readonly lastSeen = new Map<string, { index: number; generation: number }>();
  /** Area rows whose deletion is being sent. */
  private readonly removing = new Set<string>();
  /** Where the layout and the filters are kept (`layoutKey`). */
  private readonly store: LayoutStore | null;
  /** Work a row waits for before it is sent: an async `setCellValue`, a lookup key being checked. */
  private readonly settling = new Map<string, Set<Promise<unknown>>>();
  /** Cells waiting for their `setCellValue`, by row id. */
  private readonly busyCells = new Map<string, Set<string>>();

  constructor(private readonly props: DataGridProps<T>) {
    this.settings = new Switches<GridSettings>(Object.keys(DEFAULT_SETTINGS) as (keyof GridSettings)[], DEFAULT_SETTINGS, props.settings ?? {});
    this.store = props.layoutKey ? new LayoutStore(props.layoutKey) : null;
    const stored = this.settings.get('saveLayout') ? this.store?.read() : null;
    const layout = stored ?? props.layout;
    this.columns = new ColumnModel(props.columns, layout, this.settings);
    const sort = (layout?.sort ?? props.sort ?? []).filter((s) => this.columns.defs.has(s.field));
    this.state.sort = sort.map((s) => ({ ...s }));
    this.columns.statusWanted = () => this.stats.changed > 0 || this.stats.failed > 0 || this.state.added > 0;
    this.columns.actionsWanted = () => props.actions !== undefined;
    this.filters = new FilterModel<T>(this.columns);
    const filters = stored ? this.reviveDates(stored.filters) : props.filters;
    if (filters) this.filters.replace(filters);
    this.values = new FilterValues<T>(this);
    this.lookups = new LookupTexts<T>(() => this.formatter.locale, { missing: () => this.text('gridLookupMissing') });
    this.search = new GridSearch<T>(this);
    const searchText = stored ? stored.searchText : read(props.searchText);
    if (searchText) this.search.start(searchText);
    this.connect();
    this.state.activeField = this.columns.visibleData()[0] ?? '';
  }

  // Data.

  /** Starts again with the data the props name now: a data source, or the rows in memory. Unsaved changes are dropped. */
  connect() {
    const props = this.props;
    const given = read(props.dataSource) ?? null;
    untracked(() => {
      this.data?.dispose();
      clearTimeout(this.filterTimer);
      this.selection.clear();
      const own = this.filters.expression();
      this.appliedFilter = JSON.stringify(own);
      if (given) {
        if (!BASE_FILTERS.has(given)) BASE_FILTERS.set(given, given.filter);
        this.baseFilter = BASE_FILTERS.get(given) ?? null;
        const filter = data.and(this.baseFilter, own);
        if (JSON.stringify(filter) !== JSON.stringify(given.filter)) void given.setFilter(filter);
      } else this.baseFilter = null;
      for (const a of this.addedRows.splice(0)) this.lastSeen.delete(a.rowId);
      this.removing.clear();
      const st = this.state;
      st.added = 0;
      st.session = null;
      st.editing = null;
      st.busy = false;
      st.page = 0;
      this.data = new GridData<T>({
        source: given ?? this.ownSource(),
        owned: !given,
        paged: read(props.mode) === 'paged',
        pageSize: read(props.pageSize) ?? DEFAULT_PAGE_SIZE,
        saveMode: read(props.saveMode) ?? 'wait',
        createRow: props.newRow?.create,
        validateRow: (row, context) => this.checkRow(row, context),
        state: st,
        edited: (change) => this.edited(change),
      });
      st.page = this.data.sourcePage;
      if (given) {
        if (st.sort.length && !this.sameSort(this.sourceSort(st.sort), given.sort)) this.data.setSort(this.sourceSort(st.sort));
        else st.sort = this.gridSort(given.sort);
      }
      st.connection++;
    });
  }

  /** The grid holds the rows itself (`rows`), not a given data source. */
  get ownsRows(): boolean {
    return !read(this.props.dataSource);
  }

  get mode(): GridMode {
    void this.state.connection;
    return this.data.paged ? 'paged' : 'virtual';
  }

  get saveMode(): data.SaveMode {
    void this.state.connection;
    return this.data.tracker.saveMode;
  }

  get pageSize(): number {
    void this.state.connection;
    return this.data.pageSize;
  }

  get newRowPosition(): 'top' | 'bottom' {
    return read(this.props.newRow?.position) === 'top' ? 'top' : 'bottom';
  }

  /** A row height given in the props, or `null` to measure it from the CSS. */
  get fixedRowHeight(): number | null {
    const h = read(this.props.rowHeight);
    return h && h > 0 ? h : null;
  }

  /** A text of `uiLocale`, or of the grid's own `texts`; `{name}` parts filled from `values`. */
  text(key: keyof UiStrings, values?: Record<string, unknown>): string {
    const t = read(this.props.texts)?.[key] ?? uiLocale.strings[key];
    return values ? fillTemplate(t, values) : t;
  }

  get formatter(): CellFormatter {
    const locale = read(this.props.locale) || pageLocale();
    if (this.formatterCache?.locale !== locale) this.formatterCache = new CellFormatter(
        locale,
        () => [this.text('yes'), this.text('no')],
        () => ({ number: this.text('gridInvalidNumber'), date: this.text('invalidDate'), other: this.text('invalid') }),
      );
    return this.formatterCache;
  }

  /** The tracker's id of a row: its key as text, or `+1`, `+2` … for a row added in the grid. */
  rowIdOf(row: T): string {
    return this.data.idOf(row);
  }

  // Row numbering.

  /** Rows of the data. */
  get dataTotal(): number {
    return this.data.total;
  }

  /** Rows of the grid: data rows and the new-row area. */
  get count(): number {
    return this.data.total + this.state.added;
  }

  /** Position in the new-row area of grid row `i`, or -1 for a data row. */
  addedIndex(i: number): number {
    const n = this.state.added;
    const k = this.newRowPosition === 'top' ? i : i - this.data.total;
    return k >= 0 && k < n ? k : -1;
  }

  /** Data index of grid row `i`, or -1 for a new row. */
  dataIndex(i: number): number {
    const d = this.newRowPosition === 'top' ? i - this.state.added : i;
    return d >= 0 && d < this.data.total ? d : -1;
  }

  /** Grid index of the data row `d`. */
  viewOfData(d: number): number {
    return this.newRowPosition === 'top' ? d + this.state.added : d;
  }

  /** Grid index of position `k` in the new-row area. */
  viewOfAdded(k: number): number {
    return this.newRowPosition === 'top' ? k : this.data.total + k;
  }

  /** The row of grid row `i`; `undefined` while it is loading. */
  rowAt(i: number): T | undefined {
    const k = this.addedIndex(i);
    if (k >= 0) return this.addedRows[k]?.row;
    const d = this.dataIndex(i);
    return d >= 0 ? this.data.rowAt(d) : undefined;
  }

  /** The id of grid row `i`; `undefined` while it is loading. */
  rowIdAt(i: number): string | undefined {
    const k = this.addedIndex(i);
    if (k >= 0) return this.addedRows[k]?.rowId;
    const row = this.rowAt(i);
    return row === undefined ? undefined : this.rowIdOf(row);
  }

  /** Grid index of a row by its id: new rows always, data rows when they are loaded (or at `hint`). */
  indexOfKey(rowId: string, hint = -1): number {
    const k = this.addedRows.findIndex((a) => a.rowId === rowId);
    if (k >= 0) return this.viewOfAdded(k);
    if (hint >= 0 && this.rowIdAt(hint) === rowId) return hint;
    const row = this.data.edit(rowId)?.row;
    return row === undefined ? -1 : this.indexOfRow(row);
  }

  /** Grid index of a data row by its key, when it is loaded; -1 otherwise. */
  indexOfRow(row: T): number {
    const d = this.data.indexOfRow(row);
    return d >= 0 ? this.viewOfData(d) : -1;
  }

  /** Page count in paged mode (at least 1). */
  pageCount(): number {
    return Math.max(1, Math.ceil(this.data.total / this.pageSize));
  }

  /** Data rows of the current page (paged mode), or all of them. */
  dataRange(): { first: number; end: number } {
    const total = this.data.total;
    if (this.mode === 'virtual') return { first: 0, end: total };
    const first = Math.min(this.state.page, this.pageCount() - 1) * this.pageSize;
    return { first, end: Math.min(total, first + this.pageSize) };
  }

  /** The grid rows the user can reach now, as runs in display order. */
  runs(): RowRun[] {
    const n = this.state.added;
    const total = this.data.total;
    if (this.mode === 'virtual') return n + total > 0 ? [[0, n + total]] : [];
    const { first, end } = this.dataRange();
    if (this.newRowPosition === 'top') {
      const out: RowRun[] = [];
      if (n) out.push([0, n]);
      if (end > first) out.push([n + first, n + end]);
      return out;
    }
    const last = Math.min(this.state.page, this.pageCount() - 1) === this.pageCount() - 1;
    const stop = end + (last ? n : 0);
    return stop > first ? [[first, stop]] : [];
  }

  /** Number of rows the user can reach now (one page, or all). */
  reachable(): number {
    let n = 0;
    for (const [a, b] of this.runs()) n += b - a;
    return n;
  }

  /** Position of grid row `i` among the reachable rows, or -1. */
  localOf(i: number): number {
    let offset = 0;
    for (const [a, b] of this.runs()) {
      if (i >= a && i < b) return offset + i - a;
      offset += b - a;
    }
    return -1;
  }

  /** Grid row at a position among the reachable rows, or -1. */
  viewAt(local: number): number {
    if (local < 0) return -1;
    let offset = 0;
    for (const [a, b] of this.runs()) {
      if (local < offset + b - a) return a + local - offset;
      offset += b - a;
    }
    return -1;
  }

  firstRow(): number {
    return this.reachable() > 0 ? this.viewAt(0) : HEADER_ROW;
  }

  lastRow(): number {
    const n = this.reachable();
    return n > 0 ? this.viewAt(n - 1) : HEADER_ROW;
  }

  /** The row `delta` rows away from `i` among the reachable rows, kept inside them. */
  stepRow(i: number, delta: number): number {
    const n = this.reachable();
    if (!n) return HEADER_ROW;
    const at = this.localOf(i);
    return this.viewAt(Math.max(0, Math.min(n - 1, (at < 0 ? 0 : at) + delta)));
  }

  hasRow(i: number): boolean {
    return i >= 0 && this.localOf(i) >= 0;
  }

  /** The page grid row `i` is on (paged mode). */
  pageOf(i: number): number {
    const d = this.dataIndex(i);
    if (d >= 0) return Math.floor(d / this.pageSize);
    return this.newRowPosition === 'top' ? this.state.page : this.pageCount() - 1;
  }

  /** Goes to a page; the active row moves to its first row unless the caller places it (`moveActive` false). */
  setPage(page: number, moveActive = true) {
    const p = Math.max(0, Math.min(this.pageCount() - 1, Math.floor(page)));
    if (p === this.state.page) return;
    this.state.page = p;
    this.data.setPage(p);
    if (moveActive && this.state.activeRow >= 0) this.state.activeRow = this.firstRow();
  }

  // The new-row area.

  /** Opens a new row at position `k` of the new-row area; rows after it move down, the active row with them. `values` count as entered. Returns its grid index. */
  insertAdded(k: number, values?: Partial<T>): number {
    const row = this.data.tracker.add(values);
    const rowId = this.rowIdOf(row);
    for (const [field, value] of Object.entries(values ?? {})) {
      const col = this.columns.defs.get(field);
      if (col?.lookup && !data.isEmpty(value)) this.checkKey(rowId, row, col, value);
    }
    const at = Math.max(0, Math.min(this.addedRows.length, k));
    const i = this.viewOfAdded(at);
    untracked(() => {
      this.addedRows.splice(at, 0, { rowId, row });
      this.state.added = this.addedRows.length;
      if (this.state.activeRow >= i) this.state.activeRow++;
    });
    return i;
  }

  /** Takes a row out of the new-row area; rows after it move up. Returns its former grid index, or -1. */
  removeAdded(rowId: string): number {
    const k = this.addedRows.findIndex((a) => a.rowId === rowId);
    if (k < 0) return -1;
    const i = this.viewOfAdded(k);
    untracked(() => {
      this.addedRows.splice(k, 1);
      this.state.added = this.addedRows.length;
      if (this.state.activeRow > i) this.state.activeRow--;
    });
    return i;
  }

  /**
   * Saved new rows stay in the new-row area until a refresh (the tracker keeps them there, and rows in
   * memory leave them out). With data that loads pages or blocks they leave the area as soon as the
   * source has them among its rows, so a row never shows twice.
   */
  releaseSavedNewRows() {
    if (this.data.source.loadMode === 'all') return;
    const drop = this.addedRows.filter((a) => !this.data.edit(a.rowId) && this.data.hasLoaded(a.row));
    for (const a of drop) this.removeAdded(a.rowId);
  }

  // Unsaved changes, by row id.

  /** Counts for the bar. Reactive. */
  get stats(): { changed: number; failed: number } {
    void this.state.edits;
    void this.state.connection;
    return { changed: this.data.tracker.pendingCount, failed: this.data.tracker.failedCount };
  }

  edit(rowId: string | undefined): data.RowEditState<T> | undefined {
    return this.data.edit(rowId);
  }

  /** Added in the grid and never saved. */
  isNew(rowId: string | undefined): boolean {
    return !!this.edit(rowId)?.isNew;
  }

  /** The value a cell shows: the unsaved edit when there is one, else the row's value. */
  value(rowId: string | undefined, row: T | undefined, col: GridColumn<T>): unknown {
    const draft = this.edit(rowId)?.draft;
    return draft && Object.hasOwn(draft, col.field) ? draft[col.field] : cellValue(col, row);
  }

  /** The message of a cell, or `''`. */
  error(rowId: string | undefined, field: string): string {
    return this.edit(rowId)?.errors[field] ?? '';
  }

  isChanged(rowId: string | undefined, field: string): boolean {
    const draft = this.edit(rowId)?.draft;
    return !!draft && Object.hasOwn(draft, field);
  }

  status(rowId: string | undefined): RowStatus {
    const rec = this.edit(rowId);
    if (!rec) return '';
    if (rec.saving) return 'saving';
    if (rec.failed) return 'failed';
    if (rec.removed) return 'removed';
    if (hasKeys(rec.errors)) return 'invalid';
    if (rec.isNew) return 'new';
    return hasKeys(rec.draft) ? 'changed' : '';
  }

  /** The row's own message, or the first field message. */
  rowMessage(rowId: string | undefined): string {
    const errors = this.edit(rowId)?.errors;
    if (!errors) return '';
    return errors[''] || Object.values(errors).find(Boolean) || '';
  }

  /** A new row nobody typed into: leaving it drops it. */
  isUntouched(rowId: string): boolean {
    const rec = this.edit(rowId);
    return !!rec && rec.isNew && !rec.saving && !rec.removed && !hasKeys(rec.draft);
  }

  /** Whether the row has something to send. */
  hasPending(rowId: string): boolean {
    const rec = this.edit(rowId);
    if (!rec) return false;
    if (rec.removed) return !rec.isNew;
    return rec.isNew || hasKeys(rec.draft);
  }

  /** Writes an edited value into the row's draft (the row's own value is no edit) and checks the field at once. */
  setValue(rowId: string, row: T, field: string, value: unknown, index = -1) {
    const tracker = this.data.tracker;
    tracker.setValue(row, field, value ?? null);
    if (index >= 0) this.lastSeen.set(rowId, { index, generation: this.generation });
    const col = this.columns.defs.get(field);
    if (!col || this.columns.isInternal(field)) return;
    const rec = this.edit(rowId);
    const full = { ...(row as object), ...(rec?.draft ?? {}) } as T;
    const message = this.fieldMessage(col, this.value(rowId, row, col), full);
    if (message) tracker.setError(row, field, message);
    else if (col.lookup && !data.isEmpty(value)) this.checkKey(rowId, row, col, value);
  }

  /**
   * The user commits a value into a cell: the column's `setCellValue` says which fields are written
   * (it may wait; the cell is busy meanwhile), then each is written and checked.
   */
  writeCell(rowId: string, row: T, field: string, value: unknown, index = -1) {
    const col = this.columns.get(field);
    if (!col.setCellValue) {
      this.setValue(rowId, row, field, value, index);
      return;
    }
    const values: Record<string, unknown> = { [field]: value };
    const write = () => {
      for (const [f, v] of Object.entries(values)) this.setValue(rowId, row, f, v, index);
    };
    const fail = (error: unknown) => this.setError(row, field, (error as Error | undefined)?.message || this.text('invalid'));
    let result: void | Promise<void>;
    try {
      result = col.setCellValue(values, value, { ...(row as object), ...(this.edit(rowId)?.draft ?? {}) } as T);
    } catch (error) {
      fail(error);
      return;
    }
    if (!result || typeof (result as Promise<void>).then !== 'function') {
      write();
      return;
    }
    this.settle(rowId, (result as Promise<void>).then(write, fail), field);
  }

  /** The work a row waits for before it is sent (an async `setCellValue`, a lookup key being checked), or `null`. */
  whenSettled(rowId: string): Promise<void> | null {
    const wait = this.settling.get(rowId);
    return wait?.size ? Promise.all(wait).then(() => undefined) : null;
  }

  /** A value that comes later (a pasted text the lookup source is asked about): the cell is busy until then, then it is written or shows the message. */
  writeLater(rowId: string, row: T, field: string, value: Promise<EditorValue>, index = -1) {
    const work = value.then((r) => (r.ok ? this.writeCell(rowId, row, field, r.value, index) : this.setError(row, field, r.message)));
    this.settle(rowId, work, field);
  }

  /** Whether a cell waits for its value (`setCellValue`, a pasted lookup text). Reactive. */
  isBusy(rowId: string | undefined, field: string): boolean {
    void this.state.edits;
    return !!rowId && !!this.busyCells.get(rowId)?.has(field);
  }

  /** The text a cell shows (copy, export): a lookup's text (its key while that is not known), else the formatted value. */
  shownText(rowId: string | undefined, row: T, col: GridColumn<T>, value: unknown = this.value(rowId, row, col)): string {
    if (!col.lookup) return this.formatter.text(col, row, value);
    const look = this.lookups.cell(col, row, value, this.isChanged(rowId, col.field));
    return look.state === 'loading' ? String(value) : look.text;
  }

  /** Forgets the texts of the lookup columns and asks for them again. */
  refreshLookups() {
    this.lookups.refresh([...this.columns.defs.values()].filter((c) => c.lookup));
  }

  setError(row: T, field: string, message: string) {
    this.data.tracker.setError(row, field, message);
  }

  /** Checks the row before it is saved: the first field with a message (`''` for one of the whole row), or `null`. */
  validate(rowId: string): string | null {
    const rec = this.edit(rowId);
    return rec ? this.data.tracker.validate(rec.row) : null;
  }

  /** The user left the row: it is sent as the save mode says, after the work it waits for. `true` when the grid may go on at once, else whether the save worked. */
  commit(rowId: string): true | Promise<boolean> {
    const wait = this.settling.get(rowId);
    if (wait?.size) {
      return Promise.all(wait).then(() => {
        if (this.validate(rowId) !== null) return false;
        const result = this.commit(rowId);
        return result === true ? true : result;
      });
    }
    const rec = this.edit(rowId);
    if (!rec) return true;
    const result = this.data.tracker.commit(rec.row);
    return result === true ? true : result === false ? Promise.resolve(false) : result;
  }

  /** Drops the edits of a row; a new row is dropped altogether. */
  discard(rowId: string) {
    const rec = this.edit(rowId);
    if (rec) this.data.tracker.discard(rec.row);
  }

  /** Deletes a row as the save mode says. */
  remove(rowId: string, row: T, index = -1): Promise<boolean> {
    if (index >= 0) this.lastSeen.set(rowId, { index, generation: this.generation });
    return this.data.tracker.remove(this.edit(rowId)?.row ?? row);
  }

  restore(rowId: string) {
    const rec = this.edit(rowId);
    if (rec) this.data.tracker.restore(rec.row);
  }

  async saveChanges(): Promise<{ saved: number; failed: number }> {
    const waits = [...this.settling.values()].flatMap((set) => [...set]);
    if (waits.length) await Promise.all(waits);
    const result = await this.data.tracker.saveChanges();
    if (result.saved) this.announce(this.text('gridChangesSaved', { count: this.formatter.count(result.saved) }));
    return result;
  }

  discardChanges() {
    this.data.tracker.discardChanges();
  }

  /** Ids of the rows with a failed save or a message. */
  errorKeys(): string[] {
    return this.data.tracker.failedRows().map((row) => this.rowIdOf(row));
  }

  /** Where a row with changes was last seen, while the sort is the same. */
  lastSeenIndex(rowId: string): number {
    const seen = this.lastSeen.get(rowId);
    return seen && seen.generation === this.generation ? seen.index : -1;
  }

  /** The row the user is in: its message does not count as failed yet, and `background` does not send it. */
  setSession(rowId: string | null) {
    this.state.session = rowId;
    const row = rowId ? (this.edit(rowId)?.row ?? this.addedRows.find((a) => a.rowId === rowId)?.row) : undefined;
    this.data.tracker.currentRow = row ?? null;
    untracked(() => this.state.edits++);
  }

  // Actions, selection, filters.

  /** The app's `loadValues`, if any. */
  get loadValues(): DataGridProps<T>['loadValues'] {
    return this.props.loadValues;
  }

  /** Header rows: the header, and the filter row while it shows. Reactive. */
  get headRows(): number {
    return this.showsFilterRow() ? 2 : 1;
  }

  /** The filter row shows while a visible column has a cell in it. */
  showsFilterRow(): boolean {
    return this.columns.canAny('filterRow');
  }

  /** Whether a column's header filter can be used: the feature is on and its values can be had. */
  hasHeaderFilter(field: string): boolean {
    return !this.columns.isInternal(field) && this.columns.can(field, 'headerFilter') && this.values.available(field);
  }

  /** The id the selection keeps a row under: its key as text; `undefined` for a row without a key (a new one). */
  selectId(row: T | undefined): string | undefined {
    if (row === undefined || row === null) return undefined;
    const adapter = this.data.source.adapter;
    return adapter.keys.hasKey(row) ? adapter.keyString(adapter.keyOf(row)) : undefined;
  }

  /** What a row is going through, for its actions. Reactive. */
  rowState(row: T, rowId: string | undefined, index: number): RowState {
    void this.state.edits;
    const rec = this.edit(rowId);
    const st = this.state;
    return {
      isNew: !!rec?.isNew,
      isEditing: !!rowId && (st.session === rowId || st.editing?.rowId === rowId),
      isDirty: !!rec && hasKeys(rec.draft),
      isSaving: !!rec?.saving,
      hasError: !!rec && (rec.failed || hasKeys(rec.errors)),
      isRemoved: !!rec?.removed,
      isSelected: !rec?.isNew && this.selection.isSelected(this.selectId(row)),
      index,
    };
  }

  /** The actions a row shows, in order: names turned into the ready actions, the hidden ones left out. Reactive. */
  rowActions(row: T, state: RowState): GridAction<T>[] {
    const given = this.props.actions;
    const items = (typeof given === 'function' ? given(row, state) : given) ?? [];
    const out: GridAction<T>[] = [];
    for (const item of items) {
      const action = typeof item === 'string' ? this.builtIns?.[item as BuiltInAction] : item;
      if (!action) continue;
      const visible = typeof action.visible === 'function' ? action.visible(row, state) : action.visible;
      if (visible !== false) out.push(action);
    }
    return out;
  }

  /** The filters changed: apply them at once, or after `filterDelay` when they were typed. The same filter again does nothing. */
  queueFilter() {
    const own = this.filters.expression();
    const key = JSON.stringify(own);
    clearTimeout(this.filterTimer);
    this.filterTimer = undefined;
    if (key === this.appliedFilter) return;
    const delay = this.filters.typed ? Math.max(0, this.settings.get('filterDelay')) : 0;
    if (delay === 0) this.applyFilter(own, key);
    else this.filterTimer = setTimeout(() => this.applyFilter(own, key), delay);
  }

  /** Applies at once a filter that waits for the typing pause. */
  flushFilter() {
    if (this.filterTimer === undefined) return;
    clearTimeout(this.filterTimer);
    this.filterTimer = undefined;
    const own = this.filters.expression();
    const key = JSON.stringify(own);
    if (key !== this.appliedFilter) this.applyFilter(own, key);
  }

  /** Whether a filter or the search leaves rows out. Reactive. */
  isFiltered(): boolean {
    return this.filters.any() || !!this.search.state.applied;
  }

  /** The whole filter of the rows: the source's own and the grid's. */
  get filter(): data.FilterExpression | null {
    void this.state.version;
    return this.data.source.filter;
  }

  private applyFilter(own: data.FilterExpression | null, key: string) {
    this.filterTimer = undefined;
    this.onBeforeQueryChange?.();
    this.appliedFilter = key;
    this.state.page = 0;
    this.generation++;
    this.selection.filterChanged();
    this.data.setFilter(data.and(this.baseFilter, own));
    this.onQueryChange?.();
    this.keepLayout();
  }

  // Sort, layout.

  /** Header click: none → ascending → descending → none. With `add` (and `multiSort` on), keeps the other columns. */
  toggleSort(field: string, add = false) {
    if (!this.columns.can(field, 'sortable')) return;
    add = add && this.settings.get('multiSort');
    const current = this.state.sort.find((s) => s.field === field);
    const nextDir = !current ? 'asc' : current.dir === 'asc' ? 'desc' : null;
    let sort: data.SortItem[];
    if (add) {
      sort = this.state.sort.filter((s) => s.field !== field).map((s) => ({ ...s }));
      if (nextDir) {
        const at = this.state.sort.findIndex((s) => s.field === field);
        const item: data.SortItem = { field, dir: nextDir };
        if (at >= 0) sort.splice(at, 0, item);
        else sort.push(item);
      }
    } else {
      sort = nextDir ? [{ field, dir: nextDir }] : [];
    }
    this.setSort(sort, true);
    this.announceSort(field, nextDir);
  }

  announceSort(field: string, dir: 'asc' | 'desc' | null) {
    const title = this.columns.title(field);
    this.announce(dir ? this.text(dir === 'asc' ? 'gridSortedAscending' : 'gridSortedDescending', { title }) : this.text('gridSortCleared'));
  }

  /** Replaces the sort order. `byUser` reports a layout change. */
  setSort(sort: readonly data.SortItem[], byUser = false) {
    const next = sort.filter((s) => this.columns.defs.has(s.field)).map((s) => ({ ...s }));
    if (this.sameSort(next, this.state.sort)) return;
    this.onBeforeQueryChange?.();
    this.state.sort = next;
    this.state.page = 0;
    this.generation++;
    this.data.setSort(this.sourceSort(next));
    this.onQueryChange?.();
    if (byUser) this.layoutChanged();
    else this.keepLayout();
  }

  /** Sort position (1-based) and direction of a column, for its header. */
  sortOf(field: string): { dir: 'asc' | 'desc'; position: number } | null {
    const i = this.state.sort.findIndex((s) => s.field === field);
    return i < 0 ? null : { dir: this.state.sort[i].dir, position: i + 1 };
  }

  get layout(): GridLayout {
    return { columns: this.columns.toLayout(), sort: this.state.sort.map((s) => ({ ...s })) };
  }

  set layout(layout: GridLayout) {
    this.columns.applyLayout(layout);
    this.setSort(layout.sort ?? []);
    this.keepActiveFieldVisible();
    this.keepLayout();
  }

  resetLayout() {
    this.columns.reset();
    this.setSort(this.props.sort ?? []);
    this.keepActiveFieldVisible();
    this.layoutChanged();
  }

  layoutChanged() {
    this.keepLayout();
    this.onLayoutChange?.(this.layout);
  }

  /** With `layoutKey` (and `saveLayout` on): the layout and the filters go into the browser's storage. */
  keepLayout() {
    const store = this.store;
    if (store) untracked(() => this.settings.get('saveLayout') && store.write({ ...this.layout, filters: this.filters.toFilters(), searchText: this.search.state.applied }));
  }

  /** After a column was hidden, moves the active cell to a visible column. */
  keepActiveFieldVisible() {
    const visible = this.columns.visible();
    if (!visible.includes(this.state.activeField)) this.state.activeField = this.columns.visibleData()[0] ?? visible[0] ?? '';
  }

  /** Polite screen reader announcement; the same text twice is announced twice. */
  announce(text: string) {
    this.state.announcement = '';
    queueMicrotask(() => (this.state.announcement = text));
  }

  dispose() {
    clearTimeout(this.filterTimer);
    this.search.dispose();
    this.lookups.dispose();
    this.selection.dispose();
    this.data.dispose();
  }

  /** Dates of a date column's filter come back from storage as text. */
  private reviveDates(filters: GridFilters): GridFilters {
    const out: GridFilters = {};
    const revive = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) ? new Date(v) : v);
    for (const [field, f] of Object.entries(filters)) {
      const date = this.columns.defs.get(field)?.type === 'date';
      out[field] = date ? { ...f, value: revive(f.value), value2: revive(f.value2), values: f.values?.map(revive) } : f;
      if (date) for (const key of ['value', 'value2', 'values'] as const) if (out[field][key] === undefined) delete out[field][key];
    }
    return out;
  }

  /**
   * The sort a given source gets: a column's `sortField` (or the field of its `textFrom`) instead of
   * its own. The grid's own source of rows in memory reads the columns itself.
   */
  private sourceSort(sort: readonly data.SortItem[]): data.SortItem[] {
    if (!read(this.props.dataSource)) return sort.map((s) => ({ ...s }));
    return sort.map((s) => ({ field: this.lookups.sortFieldOf(this.columns.get(s.field)), dir: s.dir }));
  }

  /** A source's sort as the grid's columns name it. */
  private gridSort(sort: readonly data.SortItem[]): data.SortItem[] {
    const out: data.SortItem[] = [];
    for (const s of sort) {
      let field: string | undefined = s.field;
      if (!this.columns.defs.has(field)) field = [...this.columns.defs.values()].find((c) => !this.columns.isInternal(c.field) && this.lookups.sortFieldOf(c) === s.field)?.field;
      if (field !== undefined && !this.columns.isInternal(field)) out.push({ field, dir: s.dir });
    }
    return out;
  }

  private sameSort(a: readonly data.SortItem[], b: readonly data.SortItem[]): boolean {
    return a.length === b.length && a.every((s, i) => s.field === b[i].field && s.dir === b[i].dir);
  }

  /** The grid makes a source for rows in memory: all of them at once, sorted in memory by the columns. */
  private ownSource(): data.DataSource<T, unknown> {
    const props = this.props;
    const fields: Record<string, data.FieldType> = {};
    for (const col of props.columns) if (col.type && FIELD_TYPES[col.type] && !col.value) fields[col.field] = FIELD_TYPES[col.type];
    const column = (field: string) => (this.columns.defs.get(field) ?? { field, title: '' }) as GridColumn<T>;
    const adapter = new GridRowsAdapter<T & object>(
      { data: () => (read(props.rows) ?? []) as (T & object)[], key: props.rowKey as data.KeyExpr<T & object>, fields, locale: this.formatter.locale },
      column as (field: string) => GridColumn<T & object>,
      {
        sortValue: (field) => this.lookups.sortValue(column(field)) as ((row: T & object) => unknown) | undefined,
        // Sorting by a lookup's text needs the text of every key of the rows first.
        beforeSort: (sort, rows) => this.lookups.load(sort.map((s) => column(s.field)).filter((c) => this.lookups.sortsByText(c)), rows as unknown as T[]),
      },
    );
    return new data.DataSource<T, unknown>({ adapter: adapter as unknown as data.DataAdapter<T, unknown>, loadMode: 'all', sort: this.state.sort, filter: this.filters.expression() });
  }

  /** The grid's checks of a row, as the tracker runs them before it is saved. */
  private checkRow(row: T, context: { isNew: boolean; changed: readonly string[] }): Record<string, string> {
    const fields = this.columns.visibleData().filter((f) => this.columns.canFill(f, row, context.isNew));
    const found: Record<string, string> = {};
    for (const field of fields) {
      if (!context.isNew && !context.changed.includes(field)) continue;
      const col = this.columns.get(field);
      const message = this.fieldMessage(col, cellValue(col, row), row);
      if (message) found[field] = message;
    }
    let whole = '';
    const own = this.props.validateRow?.(row, context);
    if (typeof own === 'string' && own) whole = own;
    else if (own && typeof own === 'object') {
      for (const [field, message] of Object.entries(own)) {
        if (!message) continue;
        // A message for a cell the user cannot fill goes to the row.
        if (fields.includes(field)) found[field] ??= message;
        else whole = whole ? `${whole} ${message}` : message;
      }
    }
    const errors: Record<string, string> = {};
    for (const field of fields) if (found[field]) errors[field] = found[field];
    if (whole) errors[''] = whole;
    return errors;
  }

  private fieldMessage(col: GridColumn<T>, value: unknown, row: T): string {
    if (col.required && data.isEmpty(value)) return this.text('required');
    if (col.lookup && this.lookups.isMissing(col, value)) return this.text('gridLookupMissing');
    return col.validate?.(value, row) || '';
  }

  /** A lookup key not known yet is asked for; one the source does not have stops the row from being saved. */
  private checkKey(rowId: string, row: T, col: GridColumn<T>, value: unknown) {
    const items = this.lookups.items(col);
    const known = items?.get(value);
    if (!items || (known && known.state !== 'loading')) return;
    const check = items.request([value]).then(() => {
      if (!this.isChanged(rowId, col.field) || !sameValue(this.value(rowId, row, col), value) || !this.lookups.isMissing(col, value)) return;
      this.data.tracker.setError(row, col.field, this.text('gridLookupMissing'));
    });
    this.settle(rowId, check);
  }

  /** A row waits for `work` before it is sent; with a field, that cell shows it is busy meanwhile. */
  private settle(rowId: string, work: Promise<unknown>, field?: string) {
    let set = this.settling.get(rowId);
    if (!set) this.settling.set(rowId, (set = new Set()));
    set.add(work);
    if (field) {
      let busy = this.busyCells.get(rowId);
      if (!busy) this.busyCells.set(rowId, (busy = new Set()));
      busy.add(field);
      untracked(() => this.state.edits++);
    }
    const done = () => {
      set.delete(work);
      if (!set.size) this.settling.delete(rowId);
      if (field && this.busyCells.get(rowId)?.delete(field)) untracked(() => this.state.edits++);
    };
    work.then(done, done);
  }

  /** The tracker told something: keep the new-row area in step. */
  private edited(change: data.ChangeTrackerChange<T>) {
    const area = (row: T) => this.addedRows.find((a) => a.row === row);
    if (change.reason === 'dropped') {
      for (const row of change.rows) {
        const a = area(row);
        if (a) this.removeAdded(a.rowId);
      }
    } else if (change.reason === 'saving') {
      for (const row of change.rows) {
        const a = area(row);
        if (a && this.edit(a.rowId)?.removed) this.removing.add(a.rowId);
      }
    } else if (change.reason === 'saved') {
      for (const row of change.rows) {
        const a = area(row);
        if (a && this.removing.delete(a.rowId)) this.removeAdded(a.rowId);
      }
    } else if (change.reason === 'released') {
      // A refresh: saved new rows take their place among the rows.
      for (const row of change.rows) {
        const a = area(row);
        if (a) this.removeAdded(a.rowId);
      }
    } else if (change.reason === 'failed') {
      for (const row of change.rows) {
        const a = area(row);
        if (a) this.removing.delete(a.rowId);
      }
    }
  }
}
