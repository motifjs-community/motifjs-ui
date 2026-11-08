import { effect, reactive, read, untracked, type IDisposable } from '@motifx/core';
import { data } from '@motifx-community/data';
import { fillText } from '../../../core/fill-text';
import { uiLocale } from '../../../core/ui-locale';
import type { UiStrings } from '../../../core/ui-strings';
import type { DataGridProps } from '../data-grid-props';
import type { GridAction } from '../grid-action';
import type { GridActionItem } from '../grid-action-item';
import type { GridBuiltInActions } from '../grid-built-in-actions';
import type { GridColumn } from '../grid-column';
import type { GridColumnItem } from '../grid-column-item';
import type { GridFilters } from '../grid-filters';
import type { GridLayout } from '../grid-layout';
import type { GridMode } from '../grid-mode';
import type { GridRowValidatingEventArgs } from '../grid-row-validating-event-args';
import type { GridSettings } from '../grid-settings';
import type { RowState } from '../row-state';
import type { EditorValue } from '../view/editor-value';
import type { AddedRow } from './added-row';
import { ActionSets } from './ActionSets';
import { CellFormatter } from './CellFormatter';
import { CellRules } from './CellRules';
import { cellValue } from './cell-value';
import { GridNotices } from './GridNotices';
import { ColumnModel } from './ColumnModel';
import { ColumnWindow } from './ColumnWindow';
import { DEFAULT_SETTINGS } from './default-settings';
import { AdaptiveRow } from './AdaptiveRow';
import { DetailRows } from './DetailRows';
import { RowDragOptions } from './RowDragOptions';
import type { FilterValueState } from './filter-value-state';
import { FilterModel } from './FilterModel';
import { FilterValues } from './FilterValues';
import { GridData } from './GridData';
import { GridEvents } from './GridEvents';
import { GridGroups } from './GridGroups';
import type { GroupNode } from './group-node';
import type { LookupCell } from './lookup-cell';
import { groupId } from './group-nodes';
import { GridRowsAdapter } from './GridRowsAdapter';
import { GridSearch } from './GridSearch';
import { GridSummaries } from './GridSummaries';
import { LayoutStore } from './LayoutStore';
import { LookupTexts } from './LookupTexts';
import type { GridState } from './grid-state';
import type { RowRun } from './row-run';
import type { RowStatus } from './row-status';
import type { StoredLayout } from './stored-layout';
import { RowSelection } from './RowSelection';
import { CellRanges } from './CellRanges';
import { sameValue } from './same-value';
import { Switches } from './Switches';
import { givenList, givenValue } from '../../../core/given-field';
import { readField } from './read-field';

/** `activeRow` value of the header row. Rows are 0…count-1. */
export const HEADER_ROW = -1;
/** `activeRow` value of the filter row, between the header and the first row. */
export const FILTER_ROW = -2;

export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_ROW_HEIGHT = 36;

const FIELD_TYPES: Record<string, data.FieldType> = { number: 'number', date: 'datetime', boolean: 'boolean' };

const hasKeys = (o: object) => Object.keys(o).length > 0;

/** Resolves once `done` (reactive) reads true. */
function settled(done: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    let stop: (() => void) | null = null;
    let over = false;
    stop = effect(() => {
      if (over || !done()) return;
      over = true;
      queueMicrotask(() => stop?.());
      resolve();
    });
  });
}

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
  /** The columns that get cells now, while some are virtual. */
  readonly columnWindow: ColumnWindow<T>;
  readonly settings: Switches<GridSettings>;
  /** Every event of the grid. */
  readonly events = new GridEvents<T>();
  /** What changed in the grid's state, told to the views (see `GridNotices`). */
  readonly notices = new GridNotices();
  /** Tells the views that fields of `state` changed (`grid.` and the field). */
  stateChanged(...fields: (keyof GridState & string)[]): void {
    for (const field of fields) this.notices.tell(`grid.${field}`);
  }
  readonly state: GridState = reactive({
    sort: [],
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    rowHeight: DEFAULT_ROW_HEIGHT,
    viewport: 0,
    width: 0,
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
    acting: false,
  } as GridState) as GridState;
  /** The new-row area, in display order. */
  readonly addedRows: AddedRow<T>[] = [];
  /** The rows, their source and their unsaved changes; recreated when the data props change. */
  data!: GridData<T>;
  /** Raised when sort changes, so "next error" knows which last-seen positions still hold. */
  generation = 0;
  onBeforeQueryChange: (() => void) | null = null;
  onQueryChange: (() => void) | null = null;
  onLayoutChange: ((layout: GridLayout) => void) | null = null;
  /** Asked before the grouping changes; `false` keeps it. */
  onGroupingChanging: ((group: data.GroupItem[], previous: data.GroupItem[], byUser: boolean) => boolean) | null = null;
  onGroupingChanged: ((group: data.GroupItem[], previous: data.GroupItem[], byUser: boolean) => void) | null = null;
  /** Asked before a header or a chip dropped changes the grouping; `false` cancels the drop. */
  onGroupDropping: ((e: { field: string; from: 'header' | 'chip'; to: 'panel' | 'headers'; index: number }) => boolean) | null = null;
  /** Id of the element that holds the active cell's message (`aria-describedby` of an invalid cell). */
  errorId = '';
  readonly selection = new RowSelection();
  /** The cell ranges (`cellSelection`). */
  readonly cellRanges: CellRanges<T> = new CellRanges<T>(this);
  readonly filters: FilterModel<T>;
  /** The search panel's text and filter. */
  readonly search: GridSearch<T>;
  readonly values: FilterValues<T>;
  /** The texts of the lookup columns. */
  readonly lookups: LookupTexts<T>;
  /** What the rows are grouped by, and which groups are open. */
  readonly groups: GridGroups<T>;
  /** The summary items, their values and texts. */
  readonly summaries: GridSummaries<T>;
  /** Which rows have their details open (`masterDetail`), and its options. */
  readonly details: DetailRows<T>;
  /** Which row has its adaptive detail open (`adaptiveDetail`), and its options. */
  readonly adaptive: AdaptiveRow;
  /** The `rowDragging` options. */
  readonly rowDrag: RowDragOptions<T>;
  /** `aria-rowindex` of grid row `i`; the body counts the open details above it in. */
  ariaRowIndex: (i: number) => number = (i) => i + 1 + this.headRows;
  /** How many rows laid out have their details open (the body tells). */
  openDetailCount: () => number = () => 0;
  /** The grid's ready actions, by name; the grid fills them in. */
  builtIns: GridBuiltInActions<T> | null = null;
  /** The actions the bars show and the rows they act on. */
  readonly actionSets = new ActionSets<T>(this);
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
  /** The filters the rows have now, to put back when `onFilterChanging` cancels new ones. */
  private appliedFilters: GridFilters = {};
  /** The filter value, its own conditions and whether it applied, as the rows have them now. */
  private appliedValue: FilterValueState = { value: null, extra: null, enabled: true, key: '' };
  /** The rows per page the user chose (the pager, `pageSize(n)`, a kept layout), over the props and the source; `null` for none. */
  chosenPageSize: number | null = null;
  /** The layout before the user's last change, to put back when `onLayoutChanging` cancels one. */
  private lastLayout: GridLayout | null = null;
  /** What a new row starts with while it is being made (`onInitNewRow` may change it). */
  private initialRow: Partial<T> | null = null;
  /** Listeners on the data and its tracker, recreated with them. */
  private dataSubscriptions: IDisposable[] = [];
  /** The columns' `validationRules` and what they found. */
  readonly rules = new CellRules<T>((key) => this.text(key));
  /** The row being checked now, while the grid asks the tracker to check it. */
  private checking: string | null = null;
  /** What `onRowValidating` made of a row in a round, kept for the checks of the same round. */
  private readonly rowChecks = new Map<string, { round: number; errors: Record<string, string> }>();

  constructor(private readonly props: DataGridProps<T>) {
    this.settings = new Switches<GridSettings>(Object.keys(DEFAULT_SETTINGS) as (keyof GridSettings)[], DEFAULT_SETTINGS, props.settings ?? {});
    this.settings.changed = (name, value, previous) => this.events.tell(this.events.optionChanged, () => ({ name, value, previous }));
    this.store = props.layoutKey ? new LayoutStore(props.layoutKey, props.layoutStorage) : null;
    const stored = this.settings.get('saveLayout') ? this.store?.read() : null;
    const layout = stored ?? props.layout;
    this.columns = new ColumnModel(props.columns, layout, this.settings);
    this.columnWindow = new ColumnWindow(this.columns, this.settings);
    for (const field of this.columns.features.keys()) this.tellFeatures(field);
    this.groups = new GridGroups<T>(this.columns, this.settings);
    this.groups.set(layout?.group ?? this.columnGroups());
    this.columns.hiddenByGroup = (field) => this.groups.isGrouped(field) && !this.columns.can(field, 'showWhenGrouped');
    const sort = (layout?.sort ?? props.sort ?? []).filter((s) => this.columns.defs.has(s.field) && !this.groups.isGrouped(s.field));
    this.state.sort = sort.map((s) => ({ ...s }));
    this.stateChanged('sort');
    this.columns.statusWanted = () => this.stats.changed > 0 || this.stats.failed > 0 || this.state.added > 0;
    this.columns.actionsWanted = () => props.actions !== undefined;
    this.columns.actionsInRow = () => this.actionSets.inRow();
    this.details = new DetailRows<T>(props.masterDetail);
    this.columns.expandWanted = () => this.details.enabled;
    this.columns.expandWidth = () => this.details.options.get('columnWidth');
    this.adaptive = new AdaptiveRow(props.adaptiveDetail);
    this.columns.adaptiveWidth = () => this.adaptive.options.get('columnWidth');
    this.rowDrag = new RowDragOptions<T>(props.rowDragging);
    this.columns.dragWanted = () => this.rowDrag.showsIcons;
    this.columns.dragWidth = () => this.rowDrag.get('columnWidth');
    this.filters = new FilterModel<T>(this.columns);
    this.filters.sync = () => this.syncsFilter();
    const filters = stored ? this.reviveDates(stored.filters) : props.filters;
    if (filters) this.filters.replace(filters);
    // A kept layout holds the user's filters; else a column's own `filterValues` start its header filter.
    if (!stored) for (const col of this.columns.definitions()) this.startFilterValues(col);
    this.appliedFilters = this.filters.toFilters();
    this.selection.guard = {
      wanted: () => this.events.listened(this.events.selectionChanging),
      allow: (next, previous) => this.events.ask(this.events.selectionChanging, () => ({ selection: next, previous, byDrag: this.selection.byDrag, cancel: false })),
    };
    this.cellRanges.guard = {
      wanted: () => this.events.listened(this.events.cellSelectionChanging),
      allow: (ranges, previous) => this.events.ask(this.events.cellSelectionChanging, () => ({ ranges, previous, byDrag: this.cellRanges.byDrag, cancel: false })),
    };
    this.values = new FilterValues<T>(this);
    this.filters.conditionOf = (field) => this.values.conditionOf(field);
    // The filter value given (or kept) after the columns' own: with sync it is shared out to them.
    const filterValue = stored ? this.reviveExpression(stored.filterValue ?? null) : read(props.filterValue);
    if (filterValue) {
      untracked(() => this.filters.filterValue());
      this.filters.setFilterValue(filterValue);
      this.appliedFilters = this.filters.toFilters();
    }
    const filterEnabled = stored?.filterEnabled ?? read(props.filterEnabled);
    if (filterEnabled === false) this.filters.enabled = false;
    this.appliedValue = this.valueState();
    this.lookups = new LookupTexts<T>(() => this.formatter.locale, { missing: () => this.text('gridLookupMissing') });
    this.search = new GridSearch<T>(this);
    this.summaries = new GridSummaries<T>(this, props.summary);
    // Every part tells its changes here; the views hear them once a turn.
    const tell = (name: string) => this.notices.tell(name);
    for (const part of [this.columns, this.settings, this.selection, this.cellRanges, this.filters, this.search, this.groups, this.summaries, this.details, this.adaptive, this.actionSets, this.rowDrag]) part.notify = tell;
    const searchText = stored ? stored.searchText : read(props.searchText);
    if (searchText) this.search.start(searchText);
    if (stored?.pageSize !== undefined) this.chosenPageSize = stored.pageSize;
    this.connect();
    this.state.activeField = this.columns.visibleData()[0] ?? '';
    this.stateChanged('activeField');
    this.lastLayout = this.layout;
  }

  // Data.

  /** Starts again with the data the props name now: a data source, or the rows in memory. Unsaved changes are dropped. */
  connect() {
    const props = this.props;
    const given = read(props.dataSource) ?? null;
    untracked(() => {
      for (const s of this.dataSubscriptions.splice(0)) s.dispose();
      this.data?.dispose();
      clearTimeout(this.filterTimer);
      this.selection.clear();
      this.cellRanges.reset();
      const own = this.filters.expression();
      this.appliedFilter = JSON.stringify(own);
      if (given) {
        if (!BASE_FILTERS.has(given)) BASE_FILTERS.set(given, given.filter);
        this.baseFilter = BASE_FILTERS.get(given) ?? null;
        const filter = data.and(this.baseFilter, own);
        if (JSON.stringify(filter) !== JSON.stringify(given.filter)) void given.setFilter(filter);
      } else this.baseFilter = null;
      for (const a of this.addedRows.splice(0)) this.lastSeen.delete(a.rowId);
      this.adaptive.close();
      this.removing.clear();
      this.rules.forget();
      this.rowChecks.clear();
      const st = this.state;
      st.added = 0;
      st.session = null;
      st.editing = null;
      st.busy = false;
      st.page = 0;
      // A given source's sort is the grid's while the grid has none.
      if (given && !st.sort.length) st.sort = this.gridSort(given.sort);
      this.stateChanged('added', 'session', 'editing', 'busy', 'page', 'sort');
      const source = given ?? this.ownSource();
      this.data = new GridData<T>({
        source,
        owned: !given,
        paged: read(props.mode) === 'paged',
        infinite: read(props.mode) === 'infinite',
        partLoaded: (skip, count) => this.events.tell(this.events.moreRowsLoaded, () => ({ skip, count, ended: this.data.ended })),
        pageSize: read(props.pageSize) ?? DEFAULT_PAGE_SIZE,
        chosenPageSize: this.chosenPageSize,
        sort: this.sourceSort(st.sort),
        group: this.groups.levels(),
        remoteGrouping: this.settings.get('remoteGrouping'),
        groupLoadPageSize: this.settings.get('groupLoadPageSize'),
        expanded: (node) => this.groups.isExpanded(node),
        footers: () => this.summaries.hasFooters(),
        groupSummary: () => this.summaries.serverItems(this.summaries.groupItems(), source.adapter),
        locale: () => this.formatter.locale,
        saveMode: this.wantedSaveMode(),
        createRow: () => this.initialRow ?? props.newRow?.create?.() ?? {},
        validateRow: (row, context) => this.checkRow(row, context),
        state: st,
        changed: (...fields) => this.stateChanged(...fields),
        edited: (change) => this.edited(change),
      });
      st.page = this.data.sourcePage;
      st.pageSize = this.data.pageSize;
      st.connection++;
      this.stateChanged('page', 'pageSize', 'connection');
      this.listenToData();
      this.summaries.connect(this.data);
    });
  }

  /** The data's events become the grid's: errors, and each row of a save before and after it is sent. */
  private listenToData() {
    const { events } = this;
    const { source, tracker } = this.data;
    this.dataSubscriptions.push(
      source.onChanged((e) => {
        if (e.reason === 'failed' && source.error) events.tell(events.dataErrorOccurred, () => ({ error: source.error!, operation: 'load' as const }));
      }),
      tracker.onSaving((e) => {
        if (!events.ask(events.saving, () => ({ changes: e.changes, cancel: false }))) {
          e.cancel = true;
          return;
        }
        e.changes.forEach((change, i) => {
          const row = e.rows[i];
          const go =
            change.type === 'insert'
              ? events.ask(events.rowInserting, () => ({ row, data: change.data, cancel: false }))
              : change.type === 'update'
                ? events.ask(events.rowUpdating, () => ({ key: change.key, row: (change.original ?? row) as T, changes: change.data, cancel: false }))
                : events.ask(events.rowRemoving, () => ({ key: change.key, row, cancel: false }));
          if (!go) e.skip(row);
        });
      }),
      tracker.onSaved((e) => {
        let saved = 0;
        e.outcomes.forEach((outcome, i) => {
          const row = e.rows[i];
          const change = e.changes[i];
          if (!outcome.ok) {
            events.tell(events.dataErrorOccurred, () => ({ error: outcome.error, operation: 'save' as const, row }));
            return;
          }
          saved++;
          if (change.type === 'insert') events.tell(events.rowInserted, () => ({ row, key: outcome.key }));
          else if (change.type === 'update') events.tell(events.rowUpdated, () => ({ key: change.key, row, changes: change.data }));
          else events.tell(events.rowRemoved, () => ({ key: change.key, row }));
        });
        events.tell(events.saved, () => ({ changes: e.changes, saved, failed: e.outcomes.length - saved }));
      }),
    );
  }

  /** The grid holds the rows itself (`rows`), not a given data source. */
  get ownsRows(): boolean {
    return !read(this.props.dataSource);
  }

  get mode(): GridMode {
    void this.state.connection;
    return this.data.paged ? 'paged' : this.data.infinite ? 'infinite' : 'virtual';
  }

  /**
   * Infinite mode: shows the next part of the rows, after `onMoreRowsLoading`; `false` while the rows
   * load, a part is loading or failed, or every row shows.
   */
  loadMore(): boolean {
    const data = this.data;
    if (this.mode !== 'infinite' || this.state.status !== 'ready' || data.loadingMore || data.moreFailed || data.ended) return false;
    const { events } = this;
    if (!events.ask(events.moreRowsLoading, () => ({ skip: data.total, take: data.pageSize, cancel: false }))) return false;
    return data.loadMore();
  }

  /** Infinite mode: loads part after part until `rows` rows show (or every row does); whether they do. */
  async loadTo(rows: number): Promise<boolean> {
    const data = this.data;
    const connection = this.state.connection;
    const same = () => this.state.connection === connection;
    while (same() && data.total < rows && !data.ended && !data.moreFailed) {
      if (this.state.status === 'loading' || data.loadingMore) await settled(() => !same() || (this.state.status !== 'loading' && !data.loadingMore));
      else if (!this.loadMore()) break;
    }
    return same() && data.total >= Math.min(rows, data.knownCount ?? rows);
  }

  /** Infinite mode: what the indicator under the rows shows (`loadMoreIndicator`): a part loading, a part that failed, or nothing. Reactive. */
  moreState(): 'loading' | 'failed' | null {
    if (this.mode !== 'infinite' || !this.settings.get('loadMoreIndicator')) return null;
    return this.data.moreFailed && this.state.status === 'ready' ? 'failed' : this.data.loadingMore ? 'loading' : null;
  }

  get saveMode(): data.SaveMode {
    void this.state.connection;
    return this.data.tracker.saveMode;
  }

  /** The save mode the data is created with: `'batch'` for `editMode: 'batch'`, else the `saveMode` prop (default `'wait'`). */
  wantedSaveMode(): data.SaveMode {
    return this.settings.get('editMode') === 'batch' ? 'batch' : (read(this.props.saveMode) ?? 'wait');
  }

  /** How rows are edited now. Reactive. */
  get editMode(): GridSettings['editMode'] {
    return this.settings.get('editMode');
  }

  /** Rows are edited in a form (in place or in a window), not in their cells. Reactive. */
  get editsInForm(): boolean {
    const mode = this.settings.get('editMode');
    return mode === 'form' || mode === 'popup';
  }

  /** Rows per page in paged mode; 0: every row on one page. Reactive. */
  get pageSize(): number {
    return this.state.pageSize;
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
  /** The grid's own texts (`texts`), over `uiLocale.strings`. Reactive. */
  get texts(): Partial<UiStrings> {
    return read(this.props.texts) ?? {};
  }

  text(key: keyof UiStrings, values?: Record<string, unknown>): string {
    const t = read(this.props.texts)?.[key] ?? uiLocale.strings[key];
    return fillText(t, this.formatter.locale, values);
  }

  get formatter(): CellFormatter {
    const locale = read(this.props.locale) || uiLocale.locale;
    if (this.formatterCache?.locale !== locale) this.formatterCache = new CellFormatter(
        locale,
        () => [this.text('yes'), this.text('no')],
        () => ({ number: this.text('gridInvalidNumber'), date: this.text('invalidDate'), other: this.text('invalid') }),
        () => [this.settings.get('trueTexts'), this.settings.get('falseTexts')],
      );
    return this.formatterCache;
  }

  /** The tracker's id of a row: its key as text, or `+1`, `+2` … for a row added in the grid. */
  rowIdOf(row: T): string {
    return untracked(() => this.data.idOf(row));
  }

  // Row numbering.

  /** Data rows (every group's too). */
  get dataTotal(): number {
    return this.data.rowCount;
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

  /** The group whose row is grid row `i`, or `null`. */
  groupAt(i: number): GroupNode | null {
    const d = this.dataIndex(i);
    return d >= 0 ? this.data.groupAt(d) : null;
  }

  /** The group whose footer row is grid row `i`, or `null`. */
  footerAt(i: number): GroupNode | null {
    const d = this.dataIndex(i);
    return d >= 0 ? this.data.footerAt(d) : null;
  }

  /** What a drawn row follows: a group (or its footer) by its id, else the row's id; `undefined` while it is loading. */
  keyAt(i: number): string | undefined {
    const group = this.groupAt(i);
    if (group) return `group:${group.id}`;
    const footer = this.footerAt(i);
    return footer ? `footer:${footer.id}` : this.rowIdAt(i);
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

  /** Page count in paged mode (at least 1); infinite, the parts of every row once that is known, else those shown. */
  pageCount(): number {
    const size = this.pageSize;
    const rows = this.mode === 'infinite' ? (this.data.knownCount ?? this.data.total) : this.data.total;
    return size > 0 ? Math.max(1, Math.ceil(rows / size)) : 1;
  }

  /** Data rows of the current page (paged mode), or all of them. */
  dataRange(): { first: number; end: number } {
    const total = this.data.total;
    const size = this.pageSize;
    if (this.mode !== 'paged' || size <= 0) return { first: 0, end: total };
    const first = Math.min(this.state.page, this.pageCount() - 1) * size;
    return { first, end: Math.min(total, first + size) };
  }

  /** The grid rows the user can reach now, as runs in display order. */
  runs(): RowRun[] {
    const n = this.state.added;
    const total = this.data.total;
    if (this.mode !== 'paged') return n + total > 0 ? [[0, n + total]] : [];
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
    if (d >= 0) return this.pageSize > 0 ? Math.floor(d / this.pageSize) : 0;
    return this.newRowPosition === 'top' ? this.state.page : this.pageCount() - 1;
  }

  /** Goes to a page; the active row moves to its first row unless the caller places it (`moveActive` false). */
  setPage(page: number, moveActive = true): boolean {
    const p = Math.max(0, Math.min(this.pageCount() - 1, Math.floor(page)));
    const previous = this.state.page;
    if (p === previous) return false;
    const { events } = this;
    if (!events.ask(events.pageChanging, () => ({ page: p, previous, cancel: false }))) return false;
    this.state.page = p;
    this.stateChanged('page');
    this.data.setPage(p);
    // A range belongs to the rows it was drawn over, which the page takes away.
    this.cellRanges.reset();
    if (moveActive && this.state.activeRow >= 0) this.state.activeRow = this.firstRow();
    this.stateChanged('activeRow');
    events.tell(events.pageChanged, () => ({ page: p, previous }));
    return true;
  }

  /**
   * Rows per page (0: every row on one page), as the pager's page sizes and `pageSize(n)` set it:
   * `onPageSizeChanging` may keep the old one. The grid goes back to the first page, and the size is
   * kept with the layout.
   */
  setPageSize(size: number): boolean {
    const next = Math.max(0, Math.floor(size));
    const previous = this.pageSize;
    if (!Number.isFinite(next) || next === previous) return false;
    const { events } = this;
    if (!events.ask(events.pageSizeChanging, () => ({ pageSize: next, previous, cancel: false }))) return false;
    this.onBeforeQueryChange?.();
    const page = this.state.page;
    this.chosenPageSize = next;
    this.data.setPageSize(next);
    this.state.pageSize = next;
    this.state.page = 0;
    this.generation++;
    if (this.state.activeRow >= 0) this.state.activeRow = this.firstRow();
    this.stateChanged('pageSize', 'page', 'activeRow');
    this.onQueryChange?.();
    if (page !== 0) events.tell(events.pageChanged, () => ({ page: 0, previous: page }));
    events.tell(events.pageSizeChanged, () => ({ pageSize: next, previous }));
    this.keepLayout();
    return true;
  }

  /** The page sizes the pager offers (`allowedPageSizes`), 0 for every row on one page. Reactive. */
  pageSizes(): number[] {
    const given = this.settings.get('allowedPageSizes');
    const size = this.pageSize;
    const list = given === 'auto' ? (size > 0 ? [Math.floor(size / 2), size, size * 2] : []) : given.map((s) => (s === 'all' ? 0 : Math.floor(Number(s))));
    const out: number[] = [];
    for (const n of list) if (Number.isFinite(n) && (n > 0 || (n === 0 && given !== 'auto')) && !out.includes(n)) out.push(n);
    return out;
  }

  /** Whether the pager shows: paged mode with `pager` on, or with `'auto'` while there is more than one page. Reactive. */
  showsPager(): boolean {
    if (this.mode !== 'paged') return false;
    const pager = this.settings.get('pager');
    return pager === 'auto' ? this.pageCount() > 1 : !!pager;
  }

  // Details (`masterDetail`).

  /** The key text of grid row `i` when it can have details: a loaded data row with a key, outside the new-row area, that `canExpand` lets open. Reactive. */
  detailId(i: number): string | undefined {
    if (!this.details.on || i < 0 || this.addedIndex(i) >= 0) return undefined;
    const row = this.rowAt(i);
    if (row === undefined || !this.details.canExpand(row)) return undefined;
    return this.selectId(row);
  }

  /** Whether grid row `i` shows its details. */
  isDetailOpen(i: number): boolean {
    const details = this.details;
    if (!details.on || i < 0 || this.addedIndex(i) >= 0) return false;
    // Every row open and none closed: no key is needed.
    if (!details.exceptionCount) {
      if (!details.allOpen) return false;
      const row = this.rowAt(i);
      return row !== undefined && details.canExpand(row) && this.data.source.adapter.keys.hasKey(row);
    }
    const id = this.detailId(i);
    return id !== undefined && details.isOpen(id);
  }

  /** Grid index of the row whose adaptive detail is open, while it is loaded (or at `hint`); -1 for none. */
  adaptiveIndex(hint = -1): number {
    const rowId = this.adaptive.state.rowId;
    const key = this.adaptive.key;
    if (rowId === null) return -1;
    if (hint >= 0 && this.rowIdAt(hint) === rowId) return hint;
    const i = this.indexOfKey(rowId);
    return i >= 0 || key === undefined ? i : this.indexOfDetailKey(key);
  }

  /** The grid index of the loaded row with this key, or -1. */
  indexOfDetailKey(key: unknown): number {
    const row = this.data.rowByKey(key);
    return row === undefined ? -1 : this.indexOfRow(row);
  }

  // The new-row area.

  /** Opens a new row at position `k` of the new-row area; rows after it move down, the active row with them. `values` count as entered. Returns its grid index. */
  insertAdded(k: number, values?: Partial<T>): number {
    const create = this.props.newRow?.create;
    const e = { data: (create ? untracked(() => create()) : {}) as Partial<T>, values: { ...(values ?? {}) } as Partial<T>, cancel: false };
    const { events } = this;
    if (events.listened(events.initNewRow)) {
      events.initNewRow.fire(e);
      if (e.cancel) return -1;
    }
    values = e.values;
    this.initialRow = e.data;
    let row: T;
    try {
      row = this.data.tracker.add(values);
    } finally {
      this.initialRow = null;
    }
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
      this.stateChanged('added', 'activeRow');
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
      this.stateChanged('added', 'activeRow');
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
    const entered = this.enteredOf(rowId, row);
    const shown = this.value(rowId, row, col);
    const message = this.fieldMessage(col, shown, row, entered);
    if (message) {
      tracker.setError(row, field, message);
      return;
    }
    if (col.lookup && !data.isEmpty(value)) this.checkKey(rowId, row, col, value);
    if (this.rules.has(col)) this.checkRules(rowId, row, col, shown, entered);
  }

  /** The values entered in a row and not saved yet, by field: a copy of its draft (the row itself does not hold them). */
  valuesOf(rowId: string | undefined): Partial<T> {
    return { ...(this.edit(rowId)?.draft ?? {}) } as Partial<T>;
  }

  /** What the column's callbacks get besides the row itself: the values entered (`values`), `isNew`, and `getValue(field)`. */
  enteredOf(rowId: string | undefined, row: T | null | undefined): data.RowCheckContext<T> {
    const values = this.valuesOf(rowId);
    const own = values as Record<string, unknown>;
    return {
      values,
      isNew: this.isNew(rowId),
      getValue: (field) => (Object.hasOwn(own, field) ? own[field] : row === null || row === undefined ? undefined : untracked(() => data.getField(row, field))),
    };
  }

  /** A column has `validationRules`. */
  hasRules(): boolean {
    for (const col of this.columns.defs.values()) if (this.rules.has(col)) return true;
    return false;
  }

  /** A column that must be filled in: `required`, or a `required` rule. */
  isRequired(col: GridColumn<T>): boolean {
    return !!col.required || this.rules.requires(col);
  }

  /** Checks a written value against the column's rules; the message shows when they are done (the row waits for them). */
  private checkRules(rowId: string, row: T, col: GridColumn<T>, value: unknown, entered: data.RowCheckContext<T>) {
    const known = this.rules.known(rowId, col, value);
    if (known !== undefined) {
      if (known) this.data.tracker.setError(row, col.field, known);
      return;
    }
    const work = this.rules.check(rowId, col, value, row, entered).then((message) => {
      const rec = this.edit(rowId);
      if (!message || !rec || rec.removed || !sameValue(this.value(rowId, row, col), value) || rec.errors[col.field]) return;
      this.data.tracker.setError(row, col.field, message);
    });
    this.settle(rowId, work, this.rules.waits(col) ? col.field : undefined);
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
      const set = col.setCellValue;
      result = untracked(() => set(values, value, row, this.enteredOf(rowId, row)));
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

  /**
   * Checks the row before it is saved: the first field with a message (`''` for one of the whole row),
   * or `null`. `fresh` starts a new round of the rules that run on every check (`reevaluate`).
   */
  validate(rowId: string, fresh = true): string | null {
    const rec = this.edit(rowId);
    if (!rec) return null;
    if (fresh) this.rules.round++;
    this.checking = rowId;
    try {
      return this.data.tracker.validate(rec.row);
    } finally {
      this.checking = null;
    }
  }

  /** The user left the row: it is sent according to the save mode, after the work it waits for. `true` when the grid may go on at once, else whether the save worked. */
  commit(rowId: string): true | Promise<boolean> {
    const wait = this.settling.get(rowId);
    if (wait?.size) {
      return Promise.all(wait).then(() => {
        if (this.validate(rowId, false) !== null) return false;
        const result = this.commit(rowId);
        return result === true ? true : result;
      });
    }
    const rec = this.edit(rowId);
    if (!rec) return true;
    // Rules not checked yet for these values start now; the row is sent once they are done.
    if (!rec.removed && this.hasRules()) {
      this.validate(rowId, false);
      if (this.settling.get(rowId)?.size) return this.commit(rowId);
    }
    this.checking = rowId;
    let result: boolean | Promise<boolean>;
    try {
      result = this.data.tracker.commit(rec.row);
    } finally {
      this.checking = null;
    }
    return result === true ? true : result === false ? Promise.resolve(false) : result;
  }

  /** Drops the edits of a row; a new row is dropped altogether. */
  discard(rowId: string) {
    const rec = this.edit(rowId);
    if (rec) this.data.tracker.discard(rec.row);
  }

  /** Deletes rows in one save according to the save mode; `index` is where each row was (-1: not shown). */
  removeRows(rows: readonly { rowId: string; row: T; index: number }[]): Promise<boolean> {
    for (const { rowId, index } of rows) if (index >= 0) this.lastSeen.set(rowId, { index, generation: this.generation });
    return this.data.tracker.removeRows(rows.map(({ rowId, row }) => this.edit(rowId)?.row ?? row));
  }

  restore(rowId: string) {
    const rec = this.edit(rowId);
    if (rec) this.data.tracker.restore(rec.row);
  }

  async saveChanges(): Promise<{ saved: number; failed: number }> {
    // Every row to send is checked first, so that the rules not checked yet run and are waited for.
    this.rules.round++;
    for (const row of this.data.tracker.pendingRows()) {
      const rowId = this.rowIdOf(row);
      if (!this.edit(rowId)?.removed) this.validate(rowId, false);
    }
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
  setSession(rowId: string | null, given?: T) {
    this.state.session = rowId;
    const row = rowId ? (this.edit(rowId)?.row ?? this.addedRows.find((a) => a.rowId === rowId)?.row ?? given) : undefined;
    this.data.tracker.currentRow = row ?? null;
    untracked(() => this.state.edits++);
    this.stateChanged('session', 'edits');
  }

  // Actions, selection, filters.

  /** The app's `loadValues`, if any. */
  get loadValues(): DataGridProps<T>['loadValues'] {
    return this.props.loadValues;
  }

  /** Header rows: the bands' rows, the header, and the filter row while it shows. Reactive. */
  get headRows(): number {
    return this.columns.bandDepth() + (this.showsFilterRow() ? 2 : 1);
  }

  /** The filter row shows while a visible column has a cell in it. */
  showsFilterRow(): boolean {
    return this.columns.canAny('filterRow');
  }

  /** Whether a column's header filter can be used: the feature is on and its values can be had. */
  hasHeaderFilter(field: string): boolean {
    return this.columns.defs.has(field) && !this.columns.isInternal(field) && this.columns.can(field, 'headerFilter') && this.values.available(field);
  }

  /** The id the selection keeps a row under: its key as text; `undefined` for a row without a key (a new one). */
  selectId(row: T | undefined): string | undefined {
    if (row === undefined || row === null) return undefined;
    const adapter = this.data.source.adapter;
    return untracked(() => (adapter.keys.hasKey(row) ? adapter.keyString(adapter.keyOf(row)) : undefined));
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

  /** Whether the `actions` prop is given. */
  get hasActions(): boolean {
    return this.props.actions !== undefined;
  }

  /** The `actions` prop when it is a list; `null` when it is a function (or not given). */
  get actionList(): readonly GridActionItem<T>[] | null {
    void this.actionSets.version;
    const given = this.props.actions;
    return given && typeof given !== 'function' ? givenList(given) : null;
  }

  /** The actions a row shows, in order: names turned into the ready actions, the hidden ones omitted. Reactive. */
  rowActions(row: T, state: RowState): GridAction<T>[] {
    void this.actionSets.version;
    const given = this.props.actions;
    // The row and the actions are the app's: read as they are, asked again on `refreshActions()`.
    const items = givenList(typeof given === 'function' ? untracked(() => given(row, state)) : given);
    const out: GridAction<T>[] = [];
    for (const item of items) {
      const action = this.actionSets.resolve(item);
      if (!action) continue;
      const shown = givenValue<GridAction<T>['visible']>(action, 'visible');
      const visible = typeof shown === 'function' ? untracked(() => shown(row, state)) : shown;
      if (visible !== false) out.push(action);
    }
    return out;
  }

  /** Whether the filter row and the header filters are part of the filter value (`filterSyncEnabled`; `'auto'`: while the filter panel shows). */
  syncsFilter(): boolean {
    const sync = this.settings.get('filterSyncEnabled');
    return sync === 'auto' ? !!this.settings.get('filterPanel') : !!sync;
  }

  /** The filter value as it is now, to compare and to put back. */
  private valueState(): FilterValueState {
    return untracked(() => {
      const value = this.filters.filterValue();
      const enabled = this.filters.enabled;
      return { value, extra: this.filters.extra(), enabled, key: JSON.stringify([value, enabled]) };
    });
  }

  /** The filters changed: apply them at once, or after `filterDelay` when they were typed. The same filter again does nothing. */
  queueFilter() {
    const own = this.filters.expression();
    const key = JSON.stringify(own);
    clearTimeout(this.filterTimer);
    this.filterTimer = undefined;
    if (key === this.appliedFilter && this.valueState().key === this.appliedValue.key) return;
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
    if (key !== this.appliedFilter || this.valueState().key !== this.appliedValue.key) this.applyFilter(own, key);
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
    const { events } = this;
    const filters = this.filters.toFilters();
    const value = this.valueState();
    const before = this.appliedValue;
    // The search changes the filter too; it has events of its own.
    const changed = JSON.stringify(filters) !== JSON.stringify(this.appliedFilters) || value.key !== before.key;
    const asked = () => ({
      filters,
      previous: this.appliedFilters,
      filterValue: value.value,
      previousFilterValue: before.value,
      filterEnabled: value.enabled,
      previousFilterEnabled: before.enabled,
      cancel: false,
    });
    if (changed && !events.ask(events.filterChanging, asked)) {
      // Back to the filters the rows have: the cells and the panel show them again, nothing loads.
      this.filters.replace(this.appliedFilters);
      this.filters.restoreValue(before.extra, before.enabled);
      return;
    }
    this.appliedFilters = filters;
    this.appliedValue = value;
    if (key !== this.appliedFilter) {
      this.onBeforeQueryChange?.();
      this.appliedFilter = key;
      this.state.page = 0;
      this.stateChanged('page');
      this.generation++;
      this.selection.filterChanged();
      this.data.setFilter(data.and(this.baseFilter, own));
      this.onQueryChange?.();
    }
    this.keepLayout();
    if (changed) events.tell(events.filterChanged, () => ({ filters, filter: this.data.source.filter, filterValue: value.value, filterEnabled: value.enabled }));
  }

  // Sort, layout.

  /** Header click: none → ascending → descending → none. With `add` (and `multiSort` on), keeps the other columns. */
  toggleSort(field: string, add = false) {
    if (!this.columns.can(field, 'sortable')) return;
    // A grouped column's sort is the order of its groups.
    if (this.groups.isGrouped(field)) {
      this.toggleGroupOrder(field);
      return;
    }
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
    if (this.setSort(sort, true)) this.announceSort(field, nextDir);
  }

  announceSort(field: string, dir: 'asc' | 'desc' | null) {
    const title = this.columns.title(field);
    this.announce(dir ? this.text(dir === 'asc' ? 'gridSortedAscending' : 'gridSortedDescending', { title }) : this.text('gridSortCleared'));
  }

  /** Replaces the sort order. `byUser` reports a layout change. Returns whether it changed (`onSortChanging` may keep it, unless `ask` is off). */
  setSort(sort: readonly data.SortItem[], byUser = false, ask = true): boolean {
    const next = sort.filter((s) => this.columns.defs.has(s.field) && !this.groups.isGrouped(s.field)).map((s) => ({ ...s }));
    if (this.sameSort(next, this.state.sort)) return false;
    const { events } = this;
    const previous = this.state.sort.map((s) => ({ ...s }));
    if (ask && !events.ask(events.sortChanging, () => ({ sort: next, previous, byUser, cancel: false }))) return false;
    this.onBeforeQueryChange?.();
    this.state.sort = next;
    this.state.page = 0;
    this.stateChanged('sort', 'page');
    this.generation++;
    this.data.setSort(this.sourceSort(next));
    this.onQueryChange?.();
    events.tell(events.sortChanged, () => ({ sort: next, previous, byUser }));
    if (byUser) this.layoutChanged();
    else this.keepLayout();
    return true;
  }

  /** Sort position (1-based) and direction of a column, for its header. */
  sortOf(field: string): { dir: 'asc' | 'desc'; position: number } | null {
    // A grouped column shows the order of its groups, without a number.
    if (this.groups.isGrouped(field)) return { dir: this.groups.dirOf(field), position: 0 };
    const i = this.state.sort.findIndex((s) => s.field === field);
    return i < 0 ? null : { dir: this.state.sort[i].dir, position: i + 1 };
  }

  get layout(): GridLayout {
    const layout: GridLayout = { columns: this.columns.toLayout(), sort: this.state.sort.map((s) => ({ ...s })), group: this.groups.items.map((g) => ({ ...g })) };
    if (this.columns.hasBands) layout.bands = this.columns.bandLayout();
    return layout;
  }

  set layout(layout: GridLayout) {
    this.columns.applyLayout(layout);
    this.setGroup(layout.group ?? this.columnGroups());
    this.setSort(layout.sort ?? []);
    this.keepActiveFieldVisible();
    this.keepLayout();
  }

  resetLayout() {
    this.columns.reset();
    this.setGroup(this.columnGroups());
    this.setSort(this.props.sort ?? []);
    this.keepActiveFieldVisible();
    this.layoutChanged();
  }

  // Grouping.

  /** The grouping the columns give: those with a `groupIndex`, in its order. */
  columnGroups(): data.GroupItem[] {
    const out: { field: string; at: number }[] = [];
    for (const col of this.columns.definitions()) {
      const at = readField(col, 'groupIndex');
      if (typeof at === 'number' && at >= 0) out.push({ field: col.field, at });
    }
    out.sort((a, b) => a.at - b.at);
    const sort = this.props.sort ?? [];
    return out.map(({ field }) => ({ field, dir: sort.find((s) => s.field === field)?.dir ?? 'asc' }));
  }

  /**
   * Groups the rows by these levels, in order (none: not grouped). A column grouped now leaves the
   * sort, its direction the order of its groups. `byUser` reports a layout change.
   */
  setGroup(items: readonly data.GroupItem[], byUser = false, ask = true) {
    const next = this.groups.normalize(items.map((g) => ({ field: g.field, dir: g.dir ?? this.state.sort.find((s) => s.field === g.field)?.dir ?? 'asc' })));
    if (this.groups.same(next)) return;
    const previous = this.groups.items.map((g) => ({ ...g }));
    if (ask && this.onGroupingChanging && !this.onGroupingChanging(next, previous, byUser)) return;
    const before = this.groups.fields();
    this.onBeforeQueryChange?.();
    this.groups.set(next);
    const st = this.state;
    st.page = 0;
    this.generation++;
    const sort = st.sort.filter((s) => !this.groups.isGrouped(s.field));
    if (sort.length !== st.sort.length) st.sort = sort;
    this.stateChanged('page', 'sort');
    untracked(() => this.data.setGrouping(this.groups.levels(), { sort: this.sourceSort(st.sort) }));
    this.keepActiveFieldVisible();
    this.onQueryChange?.();
    this.onGroupingChanged?.(next, previous, byUser);
    if (byUser) {
      const now = this.groups.fields();
      const added = now.find((f) => !before.includes(f));
      const removed = before.find((f) => !now.includes(f));
      if (added !== undefined) this.announce(this.text('gridGroupedBy', { title: this.columns.title(added) }));
      else if (!now.length) this.announce(this.text('gridGroupingCleared'));
      else if (removed !== undefined) this.announce(this.text('gridUngroupedBy', { title: this.columns.title(removed) }));
      this.layoutChanged();
    } else this.keepLayout();
  }

  /**
   * Whether the column menu has "Group by this column", "Ungroup" and "Ungroup all": `groupMenu`, or
   * while the group panel lets headers be dragged (the menu is the keyboard's way to do the same).
   */
  groupMenuShown(field: string): boolean {
    const own = this.columns.features.get(field)?.own('groupMenu');
    if (typeof own === 'boolean') return own;
    const s = this.settings;
    const set = s.own('groupMenu');
    if (typeof set === 'boolean') return set;
    return s.get('groupPanel') && s.get('groupPanelDragging');
  }

  /** Whether the user may group by a column now: the feature is on, and a data column still shows after it leaves. */
  canGroupNow(field: string): boolean {
    if (!this.groups.canGroup(field) || this.groups.isGrouped(field)) return false;
    return this.columns.can(field, 'showWhenGrouped') || this.columns.listedData().some((f) => f !== field);
  }

  /** Whether the user may open and close a group: its column's `allowCollapsing`, else the grid's. */
  canCollapse(node: GroupNode): boolean {
    return this.columns.can(node.field, 'allowCollapsing');
  }

  /** How a group opens: its column's `groupExpandMode`, else the grid's. */
  expandModeOf(node: GroupNode): 'button' | 'rowClick' {
    return readField(this.columns.defs.get(node.field), 'groupExpandMode') ?? this.settings.get('groupExpandMode');
  }

  /** The grid's own content for group rows (`groupCell` prop), used by columns without one. */
  get groupCell(): DataGridProps<T>['groupCell'] {
    return this.props.groupCell;
  }

  /** Whether a drop may change the grouping: the app is told first and can cancel it. */
  groupDropAllowed(field: string, from: 'header' | 'chip', to: 'panel' | 'headers', index: number): boolean {
    return this.onGroupDropping?.({ field, from, to, index }) ?? true;
  }

  // Columns at run time.

  /** Adds a column (or a band with its columns) at `index` among the data columns (default: last); a `groupIndex` groups the rows by it. Returns the fields added. */
  addColumn(column: GridColumnItem<T>, index?: number): string[] {
    const before = new Set(this.columnFields());
    const bands = new Set(this.columns.bands.keys());
    this.columns.add(column, index);
    for (const id of this.columns.bands.keys()) if (!bands.has(id)) this.tellFeatures(id);
    const added = this.columnFields().filter((f) => !before.has(f));
    for (const field of added) {
      const col = this.columns.get(field);
      this.tellFeatures(field);
      this.startFilterValues(col);
      const at = readField(col, 'groupIndex');
      if (typeof at === 'number' && at >= 0) this.groupBy(field, at);
    }
    this.keepActiveFieldVisible();
    return added;
  }

  /** A column is about to go: its sort, grouping and filter go first, without asking (the column is gone). */
  forgetColumn(field: string) {
    const st = this.state;
    const sort = st.sort.filter((s) => s.field !== field);
    if (sort.length !== st.sort.length) this.setSort(sort, false, false);
    if (this.groups.isGrouped(field)) this.setGroup(this.groups.without(field), false, false);
    this.filters.drop(field);
  }

  /** Takes a column out, after `forgetColumn` and after its cells went. */
  removeColumn(field: string) {
    this.columns.remove(field);
    this.keepActiveFieldVisible();
  }

  /** A column reads its rows another way now (`type`, `value`, `lookup` …): its texts and the rows are requested again. */
  columnReadChanged(field: string) {
    const col = this.columns.get(field);
    if (col.lookup) this.lookups.refresh([col]);
    this.regroupWithSettings();
    this.data.refresh();
  }

  /** The header filter's values of a column and whether they keep or leave out rows; none takes that part of its filter away. */
  setFilterValues(field: string, values: readonly unknown[] | undefined, type: 'include' | 'exclude' = 'include') {
    const list = givenList(values);
    this.filters.update(field, { values: list.length ? list : undefined, filterType: type === 'exclude' ? 'exclude' : undefined });
  }

  /** A column's own `filterValues` and `filterType`, where the filters say nothing of its values. */
  private startFilterValues(col: GridColumn<T>) {
    const values = readField(col, 'filterValues');
    const type = readField(col, 'filterType');
    if ((values === undefined && type === undefined) || this.filters.get(col.field)?.values) return;
    this.setFilterValues(col.field, values, type);
  }

  /** The fields of the data columns, in the order they were given and added. */
  columnFields(): string[] {
    return this.columns.definitions().map((c) => c.field);
  }

  /** Column switches assigned later are told through `onOptionChanged`, with the column's field. */
  private tellFeatures(field: string) {
    const switches = this.columns.features.get(field);
    if (switches) switches.changed = (name, value, previous) => this.events.tell(this.events.optionChanged, () => ({ name, field, value, previous }));
  }

  /** Groups again with what the grouping depends on now (`remoteGrouping`, `groupLoadPageSize`). */
  regroupWithSettings() {
    if (!this.groups.any) return;
    this.onBeforeQueryChange?.();
    untracked(() => this.data.setGrouping(this.groups.levels(), { remote: this.settings.get('remoteGrouping'), loadSize: this.settings.get('groupLoadPageSize') }));
    this.onQueryChange?.();
  }

  /** Groups by a column at a place among the grouped ones (moves it there when it is grouped). */
  groupBy(field: string, index = Number.MAX_SAFE_INTEGER, byUser = false) {
    this.setGroup(this.groups.withField(field, index), byUser);
  }

  ungroup(field: string, byUser = false) {
    this.setGroup(this.groups.without(field), byUser);
  }

  /** Ascending ↔ descending order of a grouped column's groups. */
  toggleGroupOrder(field: string, byUser = true) {
    if (!this.groups.isGrouped(field)) return;
    const dir = this.groups.dirOf(field) === 'asc' ? 'desc' : 'asc';
    this.setGroup(
      this.groups.items.map((g) => (g.field === field ? { field, dir } : g)),
      byUser,
    );
    if (byUser && this.groups.dirOf(field) === dir) this.announceSort(field, dir);
  }

  /** Opens or closes one group by its keys; returns whether it changed. The active row stays on what it showed. */
  setGroupExpanded(node: GroupNode, open: boolean): boolean {
    let changed = false;
    this.keepActiveRow(() => (changed = this.groups.setExpanded(node, open)));
    // Other rows between the corners of the cell ranges: they go.
    if (changed) this.cellRanges.reset();
    return changed;
  }

  /** Opens or closes every group of a level, or of every level. */
  setAllExpanded(open: boolean, level?: number) {
    this.keepActiveRow(() => this.groups.setAll(open, level));
    this.cellRanges.reset();
  }

  /** The group with these keys from the top level down, among the groups known now. */
  findGroup(key: readonly unknown[]): GroupNode | null {
    const view = this.data.groupView();
    if (!view || !key.length) return null;
    const id = groupId(key, this.formatter.locale);
    return view.allGroups().find((g) => g.id === id) ?? null;
  }

  /**
   * A group's value as its column shows it: a lookup's text (nothing while it loads), the formatted
   * value, "(empty)"; a value of its own (`calculateGroupValue`, `textFrom`) as it is.
   */
  groupValue(node: GroupNode, ask = true): LookupCell {
    const col = this.columns.get(node.field);
    const key = node.key;
    if (data.isEmpty(key)) return { text: this.text('gridEmptyOption'), state: 'none' };
    if (!this.groupsByOwnValue(col)) {
      return { text: key instanceof Date ? key.toLocaleDateString(this.formatter.locale) : String(key), state: 'none' };
    }
    if (col.lookup) return this.lookups.keyText(col, key, ask);
    return { text: this.formatter.text(col, this.data.rowOfData(node.start) ?? ({} as T), key), state: 'none' };
  }

  /** Whether a column's groups hold its own value: no value of their own, or `calculateGroupValue` naming the column's field (a lookup's key, whose text the group row shows). */
  groupsByOwnValue(col: GridColumn<T>): boolean {
    if (col.calculateGroupValue !== undefined) return col.calculateGroupValue === col.field;
    return col.textFrom === undefined;
  }

  /** "Title: value" of a group, as its row and an export show it. */
  groupCaption(node: GroupNode): string {
    return this.text('gridGroupText', { title: this.columns.title(node.field), value: this.groupValue(node).text });
  }

  /** Runs a change of the open groups and puts the active row back on the group or row it showed (or the group that hides it now). */
  private keepActiveRow(change: () => void) {
    const st = this.state;
    const i = st.activeRow;
    const footer = i >= 0 ? this.footerAt(i) : null;
    const group = i >= 0 ? (this.groupAt(i) ?? footer) : null;
    const row = i >= 0 && !group ? this.rowAt(i) : undefined;
    const d = row !== undefined ? this.data.dataIndexOf(row) : -1;
    change();
    this.data.regroupView();
    const view = this.data.groupView();
    if (!view || i < 0 || (!group && d < 0)) return;
    // A footer that no longer shows leaves the active row on its group.
    const own = footer ? view.placeOfFooter(footer.id) : -1;
    const place = own >= 0 ? own : group ? view.placeOfGroup(group.id) : view.shownPlaceOfRow(d);
    if (place >= 0 && this.viewOfData(place) !== i) st.activeRow = this.viewOfData(place);
    this.stateChanged('activeRow');
  }

  /** The user changed the layout: told before (`onLayoutChanging` may put the one before back) and after. */
  layoutChanged() {
    const { events } = this;
    const previous = this.lastLayout;
    if (previous && events.listened(events.layoutChanging)) {
      const e = { layout: this.layout, previous, cancel: false };
      events.layoutChanging.fire(e);
      if (e.cancel) {
        this.layout = previous;
        return;
      }
    }
    this.keepLayout();
    this.onLayoutChange?.(this.layout);
  }

  /** With `layoutKey` (and `saveLayout` on): the layout and the filters go into the browser's storage. */
  keepLayout() {
    this.lastLayout = this.layout;
    const store = this.store;
    if (!store) return;
    untracked(() => {
      if (!this.settings.get('saveLayout')) return;
      const kept: StoredLayout = {
        ...this.layout,
        filters: this.filters.toFilters(),
        filterValue: this.filters.filterValue(),
        filterEnabled: this.filters.enabled,
        searchText: this.search.state.applied,
      };
      if (this.chosenPageSize !== null) kept.pageSize = this.chosenPageSize;
      store.write(kept);
    });
  }

  /** After a column was hidden, moves the active cell to a visible column. */
  keepActiveFieldVisible() {
    const cols = this.columns;
    const visible = cols.visible();
    const field = this.state.activeField;
    if (visible.includes(field) || (cols.isBand(field) && cols.bandShown(field))) return;
    // A band header omitted: its first column shown, else the first data column.
    const under = cols.isBand(field) ? cols.leavesIn(field, visible)[0] : undefined;
    this.state.activeField = under ?? cols.visibleData()[0] ?? visible[0] ?? '';
    this.stateChanged('activeField');
  }

  /** Polite screen reader announcement; the same text twice is announced twice. */
  announce(text: string) {
    this.state.announcement = '';
    this.stateChanged('announcement');
    queueMicrotask(() => {
      this.state.announcement = text;
      this.stateChanged('announcement');
    });
  }

  dispose() {
    clearTimeout(this.filterTimer);
    for (const s of this.dataSubscriptions.splice(0)) s.dispose();
    this.events.dispose();
    this.search.dispose();
    this.summaries.dispose();
    this.lookups.dispose();
    this.selection.dispose();
    this.cellRanges.dispose();
    this.data.dispose();
  }

  /** Dates of a filter value's conditions on date columns come back from storage as text. */
  reviveExpression(e: data.FilterExpression | null): data.FilterExpression | null {
    if (!e) return null;
    const revive = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) ? new Date(v) : v);
    if (data.isCondition(e)) {
      if (this.columns.defs.get(e.field)?.type !== 'date') return e;
      return { ...e, value: Array.isArray(e.value) ? e.value.map(revive) : revive(e.value) };
    }
    if ('and' in e) return { and: e.and.map((x) => this.reviveExpression(x)!) };
    if ('or' in e) return { or: e.or.map((x) => this.reviveExpression(x)!) };
    return { not: this.reviveExpression(e.not)! };
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
      if (field !== undefined && !this.columns.isInternal(field) && !this.groups.isGrouped(field)) out.push({ field, dir: s.dir });
    }
    return out;
  }

  private sameSort(a: readonly data.SortItem[], b: readonly data.SortItem[]): boolean {
    return a.length === b.length && a.every((s, i) => s.field === b[i].field && s.dir === b[i].dir);
  }

  /** The grid makes a source for rows in memory: all of them at once, sorted in memory by the columns. */
  private ownSource(): data.DataSource<T, unknown> {
    const props = this.props;
    // The types follow the columns, those added later too.
    const fields = () =>
      untracked(() => {
        const out: Record<string, data.FieldType> = {};
        for (const col of this.columns.definitions()) if (col.type && FIELD_TYPES[col.type] && !col.value) out[col.field] = FIELD_TYPES[col.type];
        return out;
      });
    const column = (field: string) => (this.columns.defs.get(field) ?? { field, title: '' }) as GridColumn<T>;
    const adapter = new GridRowsAdapter<T & object>(
      { data: () => (read(props.rows) ?? []) as (T & object)[], key: props.rowKey as data.KeyExpr<T & object>, locale: this.formatter.locale },
      column as (field: string) => GridColumn<T & object>,
      {
        sortValue: (field) => this.lookups.sortValue(column(field)) as ((row: T & object) => unknown) | undefined,
        // Sorting by a lookup's text needs the text of every key of the rows first.
        beforeSort: (sort, rows) => this.lookups.load(sort.map((s) => column(s.field)).filter((c) => this.lookups.sortsByText(c)), rows as unknown as T[]),
      },
      fields,
    );
    return new data.DataSource<T, unknown>({ adapter: adapter as unknown as data.DataAdapter<T, unknown>, loadMode: 'all', sort: this.state.sort.map((s) => ({ ...s })), filter: this.filters.expression() });
  }

  /** The grid's checks of a row, as the tracker runs them before it is saved: the row itself, the values entered in `context`. */
  private checkRow(row: T, context: data.RowCheckContext<T> & { readonly changed: readonly string[] }): Record<string, string> {
    const rowId = this.checking ?? this.rowIdOf(row);
    const fields = this.columns.listedData().filter((f) => this.columns.canFill(f, row, context.isNew));
    const found: Record<string, string> = {};
    let waiting = false;
    for (const field of fields) {
      if (!context.isNew && !context.changed.includes(field)) continue;
      const col = this.columns.get(field);
      const value = this.value(rowId, row, col);
      let message = this.fieldMessage(col, value, row, context);
      if (!message && this.rules.has(col)) {
        const known = this.rules.known(rowId, col, value);
        if (known === undefined) {
          waiting = true;
          this.settle(rowId, this.rules.check(rowId, col, value, row, context), this.rules.waits(col) ? field : undefined);
        } else message = known;
      }
      if (message) found[field] = message;
    }
    let whole = '';
    const validateRow = this.props.validateRow;
    const own = validateRow ? untracked(() => validateRow(row, context)) : undefined;
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
    if (!this.events.listened(this.events.rowValidating)) return errors;
    // `onRowValidating` comes once the cells are checked, once per round; its answer is kept for the round.
    const kept = this.rowChecks.get(rowId);
    if (kept?.round === this.rules.round) return kept.errors;
    if (waiting || this.settling.get(rowId)?.size) return errors;
    const adapter = this.data.source.adapter;
    const e: GridRowValidatingEventArgs<T> = {
      key: context.isNew || !adapter.keys.hasKey(row) ? undefined : adapter.keyOf(row),
      row,
      values: { ...context.values },
      getValue: (field) => context.getValue(field),
      isNew: context.isNew,
      changed: context.changed,
      errors: { ...errors },
      isValid: !hasKeys(errors),
      errorText: errors[''] ?? '',
      cancel: false,
    };
    this.events.rowValidating.fire(e);
    const out: Record<string, string> = {};
    const toRow = (message: string) => (out[''] = out[''] ? `${out['']} ${message}` : message);
    for (const [field, message] of Object.entries(e.errors)) {
      if (!message) continue;
      if (field !== '' && fields.includes(field)) out[field] = message;
      else toRow(message);
    }
    if (e.errorText && !out['']?.includes(e.errorText)) toRow(e.errorText);
    if ((!e.isValid || e.cancel) && !hasKeys(out)) out[''] = this.text('gridRowInvalid');
    this.rowChecks.set(rowId, { round: this.rules.round, errors: out });
    return out;
  }

  private fieldMessage(col: GridColumn<T>, value: unknown, row: T, entered: data.RowCheckContext<T>): string {
    if (col.required && data.isEmpty(value)) return this.text('required');
    if (col.lookup && this.lookups.isMissing(col, value)) return this.text('gridLookupMissing');
    const validate = col.validate;
    return (validate && untracked(() => validate(value, row, entered))) || '';
  }

  /** A lookup key not known yet is requested; one the source does not have stops the row from being saved. */
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
      this.stateChanged('edits');
    }
    const done = () => {
      set.delete(work);
      if (!set.size) this.settling.delete(rowId);
      if (field && this.busyCells.get(rowId)?.delete(field)) {
        untracked(() => this.state.edits++);
        this.stateChanged('edits');
      }
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
