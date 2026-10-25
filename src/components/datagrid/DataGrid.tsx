import { Emitter, read, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Control } from '../../core/control';
import { nextTabbable } from '../../core/focus';
import { checkMark, chevronDown, dismissMark, downloadMark, pencilMark, plusMark, trashMark, undoMark } from '../../core/glyphs';
import { nextId } from '../../core/next-id';
import type { MenuItem } from '../../parts/menu/menu-item';
import { Button } from '../button/Button';
import { DropDown } from '../dropdown/DropDown';
import { Spinner } from '../progress/Spinner';
import { TextBox } from '../textbox/TextBox';
import type { ColumnFeatures } from './column-features';
import type { DataGridProps } from './data-grid-props';
import type { GridBuiltInActions } from './grid-built-in-actions';
import type { GridChanges } from './grid-changes';
import type { GridExportOptions } from './grid-export-options';
import type { GridFilters } from './grid-filters';
import type { GridLayout } from './grid-layout';
import type { GridSelection } from './grid-selection';
import type { GridSelectionChangedEventArgs } from './grid-selection-changed-event-args';
import type { GridSettings } from './grid-settings';
import type { ClipboardContent } from './model/clipboard-content';
import { ACTIONS_FIELD, SELECT_FIELD, STATUS_FIELD } from './model/ColumnModel';
import { GridClipboard } from './model/GridClipboard';
import { GridExport } from './model/GridExport';
import { FILTER_ROW, GridModel, HEADER_ROW } from './model/GridModel';
import { ActionWidths } from './view/ActionWidths';
import { CellEditor } from './view/CellEditor';
import { CellTip } from './view/CellTip';
import { ColumnMenu } from './view/ColumnMenu';
import { ColumnStyles } from './view/ColumnStyles';
import type { FilterCell } from './view/FilterCell';
import { FilterRow } from './view/FilterRow';
import { GridBody } from './view/GridBody';
import type { GridRow } from './view/GridRow';
import { HeaderFilter } from './view/HeaderFilter';
import { HeaderRow } from './view/HeaderRow';
import type { HeaderHost } from './view/header-host';
import { MenuPopup } from './view/MenuPopup';
import { OPERATOR_TEXTS } from './view/operator-texts';

type PagerItem = { key: string; page: number; gap: boolean; current: boolean };

/** How a move ends: on the target cell, optionally with its editor open. */
interface GoToCellOptions {
  /** Open the editor; a string is the character typed to start editing. */
  edit?: boolean | string;
  /** Scroll the target into view (default). */
  reveal?: boolean;
}

const hasKeys = (o: object) => Object.keys(o).length > 0;

/**
 * A data grid: rows in memory or from the data layer (any adapter), shown as one virtual list or in
 * pages. Columns can be sorted, resized, moved, hidden and pinned; cells are edited in place with the
 * kit's editors, rows are added (Tab on the last cell of a new row opens the next one) and deleted,
 * and changes are saved through a `ChangeTracker` row by row (waiting or in the background) or all
 * together. Rows carry their own action buttons (those that do not fit go into a "more" menu), can be
 * selected one, several or all (also over data never loaded), and are filtered from a filter row and
 * from value lists in the headers. The grid is a single tab stop navigated with the arrow keys. Every
 * feature can be turned off, for the whole grid (`settings`) or per column, also while it is shown.
 *
 * @example
 * <DataGrid rows={() => this.orders} rowKey="id" columns={columns} settings={{ editable: true }} />
 *
 * const grid = new DataGrid<Order>({ dataSource: orders, columns, saveMode: 'background', settings: { editable: true, addRows: true } });
 * this.panel.controls.add(grid);
 * grid.addRow();
 */
export class DataGrid<T = any> extends Control<HTMLDivElement, DataGridProps<T>> {
  private readonly model: GridModel<T>;
  private readonly header: HeaderRow<T>;
  private readonly filterRow: FilterRow<T>;
  private readonly body: GridBody<T>;
  private readonly menu: ColumnMenu<T>;
  private readonly headerFilter: HeaderFilter<T>;
  private readonly moreMenu: MenuPopup;
  private readonly conditionMenu: MenuPopup;
  private readonly widths: ActionWidths;
  private readonly builtIns: GridBuiltInActions<T>;
  private readonly selectionEmitter = new Emitter<GridSelectionChangedEventArgs>();
  private readonly styles: ColumnStyles<T>;
  private readonly tip: CellTip;
  private readonly clipboard: GridClipboard<T>;
  private readonly exporter: GridExport<T>;
  /** Exports running, stopped when the grid goes away. */
  private readonly exports = new Set<AbortController>();
  private readonly gridId = nextId('data-grid');
  private viewportEl: HTMLDivElement | null = null;
  private headEl: HTMLDivElement | null = null;
  private probeEl: HTMLDivElement | null = null;
  private measureEl: HTMLDivElement | null = null;
  /** Which button of the active actions cell has focus. */
  private actionIndex = 0;
  private addButton: Button | null = null;
  private tabbable: HTMLElement | null = null;
  private editor: CellEditor<T> | null = null;
  /** The row and field the open editor belongs to. */
  private editRow: { rowId: string; row: T; field: string } | null = null;
  /** Id of the active row (follows a new row when rows above it come or go). */
  private activeRowId: string | undefined;
  /** A row the user left with messages (focus went elsewhere); adding a row goes back to it first. */
  private pendingInvalid: string | null = null;

  constructor(props: IBaseProp<DataGridProps<T>>) {
    super(props);
    const own = (this.props ?? {}) as DataGridProps<T>;
    if (own.label !== undefined) this.bindProperty('text', own.label);
    const model = new GridModel<T>(own);
    this.model = model;
    model.errorId = `${this.gridId}-error`;
    const host: HeaderHost = {
      hasMenu: (field) => this.hasMenu(field),
      openMenu: (field, anchor) => this.openMenu(field, anchor),
      autoSize: (field) => this.autoSize(field),
      autoSizeAll: () => this.autoSizeColumns(),
      startAdjust: (kind, field) => this.startAdjust(kind, field),
      isRtl: () => this.isRtl(),
      openHeaderFilter: (field, anchor) => this.openHeaderFilter(field, anchor),
      toggleAll: () => this.toggleAll(),
      allState: () => this.allState(),
    };
    this.header = new HeaderRow<T>(model, host);
    this.filterRow = new FilterRow<T>(model);
    this.widths = new ActionWidths(() => this.measureEl);
    this.body = new GridBody<T>(model, () => this.viewportEl, this.widths);
    this.menu = new ColumnMenu<T>(model, host, this);
    this.headerFilter = new HeaderFilter<T>(model, this);
    this.moreMenu = new MenuPopup(this, 'mx-data-grid__menu');
    this.conditionMenu = new MenuPopup(this, 'mx-data-grid__menu', 'bottom-start');
    this.builtIns = this.createActions();
    model.builtIns = this.builtIns;
    model.selection.onChanged((selection) => this.selectionEmitter.fire({ selection }));
    if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);
    this.tip = new CellTip(this);
    this.clipboard = new GridClipboard<T>(model);
    this.exporter = new GridExport<T>(model);
    this.styles = new ColumnStyles<T>(model.columns, this.gridId);
    model.onBeforeQueryChange = () => this.leave();
    model.onQueryChange = () => this.body.toStart();
    model.onLayoutChange = (layout) => own.onLayoutChange?.(layout);
  }

  // Public API.

  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }

  /** The feature switches, live: `grid.settings.resizable = false`; a function is followed. */
  get settings(): GridSettings {
    return this.model.settings.view;
  }

  /**
   * One column's own feature switches, live. A value set here wins over `settings`; `undefined`
   * follows `settings` again.
   * @example grid.columnSettings('amount').movable = false;
   */
  columnSettings(field: string): Partial<ColumnFeatures> {
    this.model.columns.get(field);
    return this.model.columns.features.get(field)!.view;
  }

  /** The source the rows come from: the one given, or the one the grid made for `rows`. */
  get dataSource(): data.DataSource<T, unknown> {
    void this.model.state.connection;
    return this.model.data.source;
  }

  /** The unsaved changes of the rows; listen to it, or read it, as any `ChangeTracker`. */
  get changeTracker(): data.ChangeTracker<T, unknown> {
    void this.model.state.connection;
    return this.model.data.tracker;
  }

  /** Data rows (0 while the first answer is loading), saved new rows included. Reactive. */
  get total(): number {
    return this.model.dataTotal + this.savedAdded();
  }

  /** True until the first rows arrive, and again after the sort changes, until they are there. Reactive. */
  get loading(): boolean {
    return this.model.state.status === 'loading';
  }

  /** The sort order. Assigning replaces it and goes back to the first row. */
  get sort(): data.SortItem[] {
    return this.model.state.sort.map((s) => ({ ...s }));
  }
  set sort(sort: data.SortItem[]) {
    this.model.setSort(sort);
  }

  /** The page shown (paged mode), 0-based. */
  get page(): number {
    return this.model.state.page;
  }
  set page(page: number) {
    this.leave();
    this.model.setPage(page);
  }

  get pageCount(): number {
    return this.model.pageCount();
  }

  /** Column order, widths, visibility, sticky sides and sort. Store it and assign it back later, or give the grid a `layoutKey`. */
  get layout(): GridLayout {
    return this.model.layout;
  }
  set layout(layout: GridLayout) {
    this.model.layout = layout;
  }

  /** The row of the active cell; `undefined` on the header or while it loads. */
  get activeRow(): T | undefined {
    const i = this.model.state.activeRow;
    return i >= 0 ? this.model.rowAt(i) : undefined;
  }

  get activeField(): string {
    return this.model.state.activeField;
  }

  /** Whether there are unsaved changes (edited, new or deleted rows). Reactive. */
  get hasChanges(): boolean {
    return this.model.stats.changed > 0;
  }

  /** The unsaved changes, as copies: new rows, updated rows (with what changed) and deleted rows. */
  get changes(): GridChanges<T> {
    void this.model.state.edits;
    return this.model.data.changes();
  }

  /** Rows whose save failed or that have messages to fix. Reactive. */
  get errorCount(): number {
    return this.model.stats.failed;
  }

  /** Back to the columns' own settings and the initial sort; with `layoutKey`, that is what is kept from now on. Filters stay. */
  resetLayout() {
    this.model.resetLayout();
  }

  /** Loads the rows again, keeping the position; saved new rows leave the new-row area and take their place among the rows. */
  refresh() {
    this.leave();
    this.model.data.refresh();
  }

  /** Loads what failed to load again. */
  retry() {
    this.model.data.retry();
  }

  /** Scrolls row `index` into view (in paged mode, goes to its page). New rows count as rows. */
  scrollToIndex(index: number, align: 'nearest' | 'start' | 'end' = 'start') {
    const i = Math.max(0, Math.min(this.model.count - 1, Math.floor(index)));
    if (i >= 0) this.body.reveal(i, align);
  }

  /** Fits every visible, resizable column to its header and the rows shown. */
  autoSizeColumns() {
    for (const field of this.model.columns.visible()) {
      if (this.model.columns.can(field, 'resizable')) this.autoSize(field);
    }
    this.model.keepLayout();
  }

  /** Moves keyboard focus to the active cell. */
  override focus(): boolean {
    this.focusActive(true);
    return this.focusWithin;
  }

  /**
   * Opens a new row, as the "New row" button does: at the bottom (the grid goes to the end; in a
   * virtual list only the last block is loaded) or at the top, with its first cell a new row can fill
   * in edit mode. The row being edited is left first; when it cannot be left no row is added.
   * `values` fill the new row as if typed.
   */
  addRow(values?: Partial<T>): Promise<boolean> {
    const { model } = this;
    if (model.state.busy) return Promise.resolve(false);
    const pending = this.pendingInvalid;
    if (pending && pending !== model.state.session && hasKeys(model.edit(pending)?.errors ?? {})) {
      this.focusError(pending, this.firstErrorField(pending));
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      this.leaveRowThen(
        () => {
          const top = model.newRowPosition === 'top';
          this.openNewRow(model.insertAdded(top ? 0 : model.addedRows.length, values), top ? 'start' : 'end');
          resolve(true);
        },
        () => resolve(false),
      );
    });
  }

  /**
   * Deletes a row (default: the active one) as the save mode says: `batch` marks it until
   * `saveChanges()`, `wait` sends it and resolves when the answer is in, `background` sends it
   * through the queue. A new row never saved is just dropped. Resolves to `false` when it failed.
   */
  deleteRow(row?: T): Promise<boolean> {
    const target = this.locate(row);
    if (!target) return Promise.resolve(false);
    const { rowId, obj, index } = target;
    if (this.model.state.session === rowId) {
      this.closeEditor();
      this.model.setSession(null);
    }
    return this.model.remove(rowId, obj, index >= 0 ? this.model.dataIndex(index) : -1);
  }

  /** Takes back the deletion mark of a row (batch mode). */
  restoreRow(row: T) {
    const target = this.locate(row);
    if (target) this.model.restore(target.rowId);
  }

  /**
   * Sends every unsaved change: deleted rows, then updated rows, then new rows. The row being edited
   * is included when it passes its checks. Rows the backend rejects keep their marks and messages.
   */
  async saveChanges(): Promise<{ saved: number; failed: number }> {
    const { model } = this;
    if (model.state.busy) return { saved: 0, failed: 0 };
    if (!this.commitEditor()) return { saved: 0, failed: 1 };
    const rowId = model.state.session;
    if (rowId) {
      if (model.isUntouched(rowId)) {
        model.setSession(null);
        model.discard(rowId);
      } else {
        const bad = model.validate(rowId);
        if (bad !== null) {
          this.focusError(rowId, bad);
          model.announce(model.text('gridFixErrors'));
          return { saved: 0, failed: 1 };
        }
        model.setSession(null);
      }
    }
    return model.saveChanges();
  }

  /** Drops every unsaved change: edits, new rows and deletion marks. */
  discardChanges() {
    this.closeEditor();
    this.model.setSession(null);
    this.pendingInvalid = null;
    this.model.discardChanges();
    this.focusActive(false);
  }

  /** Moves to the next row whose save failed or that has messages. Returns whether there was one. */
  goToNextError(): boolean {
    const { model } = this;
    const keys = model.errorKeys();
    if (!keys.length) return false;
    const current = this.activeRowId ? keys.indexOf(this.activeRowId) : -1;
    for (let n = 1; n <= keys.length; n++) {
      const rowId = keys[(current + n) % keys.length];
      let i = model.indexOfKey(rowId);
      if (i < 0) {
        const seen = model.lastSeenIndex(rowId);
        if (seen >= 0) i = model.viewOfData(seen);
      }
      if (i < 0) continue;
      this.navigate(i, this.firstErrorField(rowId) || model.state.activeField);
      return true;
    }
    return false;
  }

  // Actions.

  /** The grid's ready actions, to put in `actions` or to call: `grid.actions.remove`. */
  get actions(): GridBuiltInActions<T> {
    return this.builtIns;
  }

  // Selection.

  /** The selection as a state: rows one by one, or every row of a filter but some. Reactive. */
  get selection(): GridSelection {
    return this.model.selection.snapshot();
  }

  /** Raised whenever the selection changes. */
  get onSelectionChanged(): MotifEvent<GridSelectionChangedEventArgs> {
    return this.selectionEmitter.event;
  }

  /** Selected rows. Reactive. With "all" selected, the total of the filter less the rows taken out. */
  get selectedCount(): number {
    return this.model.selection.count(this.model.dataTotal);
  }

  /**
   * Keys of the selected rows. With "all" selected over data that loads in parts, only the rows
   * loaded now are known: read `selection` for the whole state. Assign to select exactly these rows.
   */
  get selectedKeys(): unknown[] {
    const sel = this.model.selection;
    if (!sel.all) return sel.snapshot().keys;
    return this.loadedRows()
      .filter((row) => sel.isSelected(this.model.selectId(row)))
      .map((row) => this.model.data.source.adapter.keyOf(row));
  }
  set selectedKeys(keys: readonly unknown[]) {
    const adapter = this.model.data.source.adapter;
    this.model.selection.replace(keys.map((key) => [adapter.keyString(key), key]));
  }

  /** The selected rows that are loaded (rows in memory: all of them). */
  get selectedRows(): T[] {
    const { model } = this;
    const sel = model.selection;
    if (sel.all) return this.loadedRows().filter((row) => sel.isSelected(model.selectId(row)));
    const source = model.data.source;
    const out: T[] = [];
    for (const key of sel.snapshot().keys) {
      const row = source.rowByKey(key);
      if (row !== undefined) out.push(row);
    }
    return out;
  }

  /**
   * The selection as a filter of the data layer, for work on the server: the selected keys, or the
   * filter of "all" without the rows taken out. `undefined` when nothing is selected or the key is
   * not one field.
   */
  get selectionFilter(): data.FilterExpression | null | undefined {
    const sel = this.selection;
    const fields = this.model.data.source.adapter.keys.fields;
    if (!fields || fields.length !== 1) return undefined;
    const key = fields[0];
    if (sel.all) return data.and(sel.filter, sel.except.length ? data.not(data.where(key, 'in', sel.except)) : null);
    return sel.keys.length ? data.where(key, 'in', sel.keys) : undefined;
  }

  isSelected(row: T): boolean {
    return this.model.selection.isSelected(this.model.selectId(row));
  }

  /** Selects a row; `add` keeps the rows selected before (multiple selection). */
  selectRow(row: T, add = false) {
    const id = this.model.selectId(row);
    if (id === undefined || this.model.settings.get('selection') === 'none') return;
    const key = this.model.data.source.adapter.keyOf(row);
    if (add && this.model.settings.get('selection') === 'multiple') this.model.selection.set(id, key, true);
    else this.model.selection.only(id, key, this.model.indexOfRow(row));
  }

  deselectRow(row: T) {
    const id = this.model.selectId(row);
    if (id !== undefined) this.model.selection.set(id, this.model.data.source.adapter.keyOf(row), false);
  }

  /** Selects every row of the current filter (multiple selection), loaded or not. */
  selectAll() {
    if (this.model.settings.get('selection') === 'multiple') this.model.selection.selectAll(this.model.filter);
  }

  clearSelection() {
    this.model.selection.clear();
  }

  // Filters.

  /** The filters by field (filter row and header filter). Assign to replace them; `{}` clears them. */
  get filters(): GridFilters {
    return this.model.filters.toFilters();
  }
  set filters(filters: GridFilters) {
    this.model.filters.replace(filters);
  }

  /** The whole filter of the rows, as the data layer has it: the source's own and the grid's. Reactive. */
  get filter(): data.FilterExpression | null {
    return this.model.filter;
  }

  /** Takes every filter away (the conditions chosen in the filter row stay). */
  clearFilters() {
    this.model.filters.clearAll();
  }

  // Copy, paste, export.

  /**
   * Copies as Ctrl+C does: the selected rows of a multiple selection, else the active cell, as
   * tab-separated text and an HTML table, with the copyable visible columns. Returns the text;
   * `''` when there was nothing to copy.
   */
  copy(): string {
    const { model } = this;
    const content = this.clipboard.copy();
    if (content === 'all') model.announce(model.text('gridCopyUseExport'));
    if (!content || content === 'all') return '';
    this.writeClipboard(content);
    model.announce(content.rows ? model.text('gridCopiedRows', { count: model.formatter.count(content.rows) }) : model.text('gridCopiedCell'));
    return content.text;
  }

  /**
   * Pastes as Ctrl+V does: tab-separated text into the cells the user can fill, from the active cell
   * rightwards and downwards. Values go into the rows' drafts and are checked like typed ones; rows
   * below the active one are saved as the save mode says. Returns the number of cells written.
   */
  paste(text: string): number {
    const { model } = this;
    const st = model.state;
    if (st.busy || !model.settings.get('paste') || st.activeRow < 0 || !this.commitEditor()) return 0;
    const activeId = model.rowIdAt(st.activeRow);
    if (activeId === undefined || (st.session && st.session !== activeId)) return 0;
    const result = this.clipboard.paste(text, st.activeRow, st.activeField);
    for (const rowId of result.rowIds) {
      if (rowId === activeId) continue;
      if (model.isUntouched(rowId)) model.discard(rowId);
      else if (model.saveMode !== 'batch' && model.hasPending(rowId) && model.validate(rowId) === null) void model.commit(rowId);
    }
    if (model.hasPending(activeId) || model.edit(activeId)?.isNew) model.setSession(activeId);
    model.announce(result.cells ? model.text('gridPasted', { count: model.formatter.count(result.cells) }) : model.text('gridNothingPasted'));
    return result.cells;
  }

  /**
   * The rows of the filter in the sort order, with the visible exportable columns in display order,
   * as objects by field: the text the cells show, or their values (`values: 'raw'`). Rows in memory
   * are taken as they are; a server's are asked for in parts (`pageSize`) through the data source.
   */
  async exportRows(options: GridExportOptions = {}): Promise<Record<string, unknown>[]> {
    const table = await this.runExport(options);
    return table.rows.map((cells) => Object.fromEntries(table.fields.map((f, j) => [f, cells[j]])));
  }

  /**
   * Saves the rows as `exportRows` collects them in a CSV file a spreadsheet opens as it is: UTF-8
   * with a byte order mark, the locale's separator, column titles first. Returns the text.
   */
  async exportCsv(options: GridExportOptions = {}): Promise<string> {
    const table = await this.runExport(options);
    const text = this.exporter.csv(table, options);
    if (options.download !== false) {
      const name = (options.fileName ?? (this.text || 'export')).replace(/[\\/:*?"<>|]+/g, '-');
      this.exporter.download(text, /\.csv$/i.test(name) ? name : `${name}.csv`);
    }
    return text;
  }

  // Lifecycle.

  override onConfigured() {
    const { model } = this;
    const settings = model.settings;
    this.class.add('mx-data-grid');
    this.attr.add({
      'data-grid-id': this.gridId,
      'data-mode': () => model.mode,
      'data-striped': () => (settings.get('striped') ? '' : null),
      'data-header-buttons': () => settings.get('headerButtons'),
      'data-selection': () => (settings.get('selection') === 'none' ? null : settings.get('selection')),
    });

    // Filters: applied at once, or after a typing pause; a feature switched off takes its filter out.
    this.bindings.watch(() => {
      void model.filters.expression();
      untracked(() => model.queueFilter());
    });

    // Keys of the selected rows given by the app.
    this.bindings.watch(() => {
      const keys = read(this.props.selectedKeys);
      if (keys === undefined) return;
      const list = [...keys];
      untracked(() => (this.selectedKeys = list));
    });

    // The data props: other data, another mode or save mode starts again.
    let first = true;
    this.bindings.watch(() => {
      const props = this.props;
      void read(props.dataSource);
      void read(props.mode);
      void read(props.pageSize);
      void read(props.saveMode);
      if (first) {
        first = false;
        return;
      }
      untracked(() => {
        this.closeEditor();
        this.pendingInvalid = null;
        model.connect();
        this.body.toStart();
      });
    });

    // Rows in memory: follow push/splice (length) and a new array.
    let firstRows = true;
    this.bindings.watch(() => {
      void read(this.props.rows)?.length;
      if (firstRows) {
        firstRows = false;
        return;
      }
      untracked(() => {
        if (!read(this.props.dataSource)) void model.data.source.reload();
      });
    });

    // Order or visibility changed: reorder cells, renumber, keep the active column visible.
    this.bindings.watch(() => {
      const visible = model.columns.visible();
      const filterRow = model.showsFilterRow();
      untracked(() => {
        this.header.arrange(visible);
        if (filterRow) this.filterRow.arrange(visible);
        this.body.arrange(visible);
        model.keepActiveFieldVisible();
        this.syncTabStop();
      });
    });

    // Sizes and sticky offsets: CSS only, no row is touched.
    this.bindings.watch(() => {
      const visible = model.columns.visible();
      const template = model.columns.template(visible);
      const offsets = model.columns.stickyOffsets(visible);
      const align = new Map<string, string>();
      for (const f of visible) align.set(f, model.columns.align(f));
      untracked(() => {
        this.viewportEl?.style.setProperty('--_columns', template);
        this.styles.update(visible, offsets, align);
      });
    });

    // Rows arrived, the total changed, rows were added, sizes or the page changed: lay the body out again.
    this.bindings.watch(() => {
      const st = model.state;
      void st.version;
      void st.status;
      void st.connection;
      void st.added;
      void st.rowHeight;
      void st.viewport;
      void st.page;
      untracked(() => {
        this.followData();
        this.body.relayout(true);
        this.syncTabStop();
      });
    });
  }

  override onBuilt() {
    // Header cells and rows are built in definition order; put them in display order.
    const visible = this.model.columns.visible();
    this.header.arrange(visible);
    if (this.model.showsFilterRow()) this.filterRow.arrange(visible);
    this.body.arrange(visible);
  }

  override onMounted() {
    const vp = this.viewportEl;
    if (!vp) return;
    this.styles.attach(this.element);
    this.motif.setDisposable(() => this.styles.detach());
    const wheel = (e: WheelEvent) => this.body.onWheel(e);
    const keys = (e: KeyboardEvent) => this.onEditorCapture(e);
    vp.addEventListener('wheel', wheel, { passive: false });
    vp.addEventListener('keydown', keys, true);
    this.motif.setDisposable(() => {
      vp.removeEventListener('wheel', wheel);
      vp.removeEventListener('keydown', keys, true);
    });
    this.measure();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => this.measure());
      ro.observe(vp);
      if (this.headEl) ro.observe(this.headEl);
      if (this.probeEl) ro.observe(this.probeEl);
      this.motif.setDisposable(() => ro.disconnect());
    }
    vp.style.setProperty('--_columns', this.model.columns.template(this.model.columns.visible()));
    this.body.relayout(true);
    this.syncTabStop();
  }

  override onDisposing() {
    for (const controller of this.exports) controller.abort();
    this.editor = null;
    this.selectionEmitter.dispose();
    this.tip.hide();
    this.model.dispose();
  }

  override view() {
    const { model } = this;
    const st = model.state;
    const settings = model.settings;
    const t = (key: Parameters<typeof model.text>[0], values?: Record<string, unknown>) => model.text(key, values);
    const count = (n: number) => model.formatter.count(n);
    const overlay = (): 'loading' | 'error' | 'empty' | null =>
      st.status === 'loading' ? 'loading' : st.status === 'error' ? 'error' : model.count === 0 ? 'empty' : null;
    const showAdd = () => settings.get('addRows') && settings.get('newRowButton');
    const showErrors = () => settings.get('errorSummary') && model.stats.failed > 0;
    const showSave = () => model.saveMode === 'batch' && settings.get('saveButtons') && model.stats.changed > 0;
    const showSelected = () => settings.get('selection') !== 'none' && settings.get('selectedCount') && this.selectedCount > 0;
    const showExport = () => settings.get('exportButton') && this.exporter.fields().length > 0;
    const keepFocus = (e: Event) => e.preventDefault();
    return (
      <>
        <div class="mx-data-grid__main">
          <div
            class="mx-data-grid__viewport"
            role="grid"
            ref={(c) => (this.viewportEl = c.element as HTMLDivElement)}
            aria-label={() => this.text || t('gridLabel')}
            aria-rowcount={() => (st.status === 'loading' ? -1 : model.count + model.headRows)}
            aria-multiselectable={() => (settings.get('selection') === 'multiple' ? 'true' : null)}
            aria-colcount={() => model.columns.visible().length}
            aria-busy={() => (st.status === 'loading' || st.busy ? 'true' : null)}
            onscroll={() => {
              this.body.onScroll();
              this.tip.hide();
              this.syncTabStop();
            }}
            onkeydown={(e: KeyboardEvent) => this.onKey(e)}
            onfocusin={(e: FocusEvent) => this.onFocusIn(e)}
            onfocusout={(e: FocusEvent) => this.onFocusOut(e)}
            onpaste={(e: ClipboardEvent) => this.onPaste(e)}
            onpointerdown={(e: PointerEvent) => this.onPointerDown(e)}
            onclick={(e: MouseEvent) => this.onClick(e)}
            ondblclick={(e: MouseEvent) => this.onDoubleClick(e)}
            onpointermove={(e: PointerEvent) => {
              if (settings.get('tooltips')) this.tip.hover(e);
            }}
            onpointerleave={() => this.tip.hide()}
          >
            <div class="mx-data-grid__head" role="rowgroup" ref={(c) => (this.headEl = c.element as HTMLDivElement)}>
              {this.header}
              {this.filterRow}
            </div>
            {this.body}
          </div>
          <div class="mx-data-grid__overlay" x-display={() => overlay() !== null}>
            <div class="mx-data-grid__state" x-display={() => overlay() === 'loading'}>
              <Spinner size="sm" label={() => t('loading')} />
            </div>
            <div class="mx-data-grid__state" x-display={() => overlay() === 'empty'}>
              <span>{() => (model.filters.any() ? t('gridNoMatches') : t('gridNoRows'))}</span>
              <Button class="mx-data-grid__clear-filters" text={() => t('gridClearFilters')} size="sm" variant="outline" visible={() => model.filters.any()} onclick={() => this.clearFilters()} />
            </div>
            <div class="mx-data-grid__state" data-tone="danger" role="alert" x-display={() => overlay() === 'error'}>
              <span>{() => t('loadFailed')}</span>
              <Button text={() => t('retry')} size="sm" variant="outline" onclick={() => this.retry()} />
            </div>
          </div>
          <div class="mx-data-grid__probe" aria-hidden="true" ref={(c) => (this.probeEl = c.element as HTMLDivElement)} />
          <div class="mx-data-grid__measure" aria-hidden="true" ref={(c) => (this.measureEl = c.element as HTMLDivElement)} />
        </div>
        <div class="mx-data-grid__bar" x-display={() => settings.get('rowCount') || st.failedBlocks > 0 || this.showsPager() || showAdd() || showErrors() || showSave() || showSelected() || showExport()}>
          <Button
            class="mx-data-grid__add"
            ref={(b: Button) => (this.addButton = b)}
            text={() => t('gridNewRow')}
            icon={() => plusMark()}
            size="sm"
            variant="outline"
            visible={showAdd}
            enabled={() => !st.busy}
            on:pointerdown={keepFocus}
            onclick={() => void this.addRow()}
          />
          <Button
            class="mx-data-grid__export"
            text={() => (st.exporting ? t('gridExporting') : t('gridExport'))}
            icon={() => downloadMark()}
            size="sm"
            variant="outline"
            visible={showExport}
            enabled={() => !st.exporting && st.status === 'ready'}
            aria-busy={() => (st.exporting ? 'true' : null)}
            onclick={() => void this.exportCsv().catch(() => undefined)}
          />
          <span class="mx-data-grid__count" x-display={() => settings.get('rowCount')}>
            {() => (st.status === 'ready' ? t('gridRecords', { count: count(this.total) }) : '')}
          </span>
          <span class="mx-data-grid__selected" x-display={showSelected}>
            {() => t('gridSelectedCount', { count: count(this.selectedCount) })}
          </span>
          <span class="mx-data-grid__note" data-tone="danger" role="status" x-display={() => st.failedBlocks > 0}>
            {() => t('gridSomeRowsFailed')}
            <Button text={() => t('retry')} size="sm" variant="ghost" onclick={() => this.retry()} />
          </span>
          <span class="mx-data-grid__note mx-data-grid__errors" data-tone="danger" role="status" x-display={showErrors}>
            {() => t('gridSaveErrors', { count: count(model.stats.failed) })}
            <Button text={() => t('gridNextError')} size="sm" variant="ghost" on:pointerdown={keepFocus} onclick={() => this.goToNextError()} />
          </span>
          <span class="mx-data-grid__note mx-data-grid__changes" x-display={showSave}>
            {() => t('gridPendingChanges', { count: count(model.stats.changed) })}
            <Button text={() => t('gridSaveChanges')} size="sm" tone="accent" on:pointerdown={keepFocus} onclick={() => void this.saveChanges()} />
            <Button text={() => t('gridDiscardChanges')} size="sm" variant="outline" on:pointerdown={keepFocus} onclick={() => this.discardChanges()} />
          </span>
          {/* Named after the grid too: two paged grids on a page are two landmarks. */}
          <nav class="mx-data-grid__pager" aria-label={() => `${t('gridPager')}: ${this.text || t('gridLabel')}`} x-wait={() => !this.showsPager()}>
            <Button
              class="mx-data-grid__page-step"
              data-step="first"
              icon={() => this.stepIcon(true)}
              hint={() => t('gridFirstPage')}
              size="sm"
              variant="ghost"
              enabled={() => st.page > 0}
              onclick={() => (this.page = 0)}
            />
            <Button
              class="mx-data-grid__page-step"
              data-step="previous"
              icon={() => this.stepIcon(false)}
              hint={() => t('gridPreviousPage')}
              size="sm"
              variant="ghost"
              enabled={() => st.page > 0}
              onclick={() => (this.page = st.page - 1)}
            />
            {this.pagerItems().map((p) =>
              p.gap ? (
                <span key={p.key} class="mx-data-grid__page-gap" aria-hidden="true">
                  …
                </span>
              ) : (
                <Button
                  key={p.key}
                  class="mx-data-grid__page"
                  text={count(p.page + 1)}
                  size="sm"
                  variant={p.current ? 'solid' : 'ghost'}
                  tone={p.current ? 'accent' : 'standard'}
                  aria-current={p.current ? 'page' : null}
                  onclick={() => (this.page = p.page)}
                />
              ),
            )}
            <Button
              class="mx-data-grid__page-step"
              data-step="next"
              icon={() => this.stepIcon(false)}
              hint={() => t('gridNextPage')}
              size="sm"
              variant="ghost"
              enabled={() => st.page < model.pageCount() - 1}
              onclick={() => (this.page = st.page + 1)}
            />
            <Button
              class="mx-data-grid__page-step"
              data-step="last"
              icon={() => this.stepIcon(true)}
              hint={() => t('gridLastPage')}
              size="sm"
              variant="ghost"
              enabled={() => st.page < model.pageCount() - 1}
              onclick={() => (this.page = model.pageCount() - 1)}
            />
            <span class="mx-data-grid__page-info">{() => t('gridPageOf', { page: count(st.page + 1), count: count(model.pageCount()) })}</span>
          </nav>
        </div>
        <div class="mx-data-grid__live" aria-live="polite">
          {() => st.announcement}
        </div>
        <div class="mx-data-grid__live" id={model.errorId}>
          {() => (st.activeRow >= 0 ? model.error(model.rowIdAt(st.activeRow), st.activeField) : '')}
        </div>
      </>
    );
  }

  // Elements, measuring.

  private showsPager(): boolean {
    return this.model.mode === 'paged' && this.model.settings.get('pager');
  }

  private isRtl(): boolean {
    return typeof getComputedStyle === 'function' && getComputedStyle(this.element).direction === 'rtl';
  }

  /** The arrow of a pager step; CSS turns it to point the way it goes. */
  private stepIcon(twice: boolean): Node {
    const icon = document.createElement('span');
    icon.className = 'mx-data-grid__step-icon';
    icon.append(chevronDown());
    if (twice) icon.append(chevronDown());
    return icon;
  }

  /** New rows that are saved (they count as data rows). */
  private savedAdded(): number {
    void this.model.state.edits;
    let n = 0;
    for (const a of this.model.addedRows) if (!this.model.isNew(a.rowId)) n++;
    return n;
  }

  /** Reads the viewport, header and row heights. */
  private measure() {
    const vp = this.viewportEl;
    if (!vp) return;
    const state = this.model.state;
    const head = this.headEl?.offsetHeight ?? 0;
    this.element.style.setProperty('--_head-height', `${head}px`);
    const viewport = Math.max(0, vp.clientHeight - head);
    if (viewport !== state.viewport) state.viewport = viewport;
    const fixed = this.model.fixedRowHeight;
    const h = fixed ?? this.probeEl?.offsetHeight ?? 0;
    if (h > 0 && h !== state.rowHeight) {
      // Another density: the action buttons are measured again.
      this.widths.clear();
      state.rowHeight = h;
    }
  }

  /** Page buttons: first, last, current ±1, with gaps. */
  private pagerItems(): PagerItem[] {
    const count = this.model.pageCount();
    const current = Math.min(this.model.state.page, count - 1);
    const pages = new Set<number>([0, count - 1, current - 1, current, current + 1]);
    if (current <= 2) [1, 2, 3].forEach((p) => pages.add(p));
    if (current >= count - 3) [count - 2, count - 3, count - 4].forEach((p) => pages.add(p));
    const sorted = [...pages].filter((p) => p >= 0 && p < count).sort((a, b) => a - b);
    const items: PagerItem[] = [];
    let prev = -1;
    for (const p of sorted) {
      if (p - prev > 1) items.push({ key: `gap${p}`, page: -1, gap: true, current: false });
      items.push({ key: `p${p}`, page: p, gap: false, current: p === current });
      prev = p;
    }
    return items;
  }

  /**
   * After the data changed: saved new rows the source now has leave the new-row area, the active row
   * follows a new row that moved, and until the user moves, the active cell follows the data (first
   * row when there is one, else the header).
   */
  private followData() {
    const { model } = this;
    const st = model.state;
    model.releaseSavedNewRows();
    if (this.activeRowId?.startsWith('+')) {
      const i = model.indexOfKey(this.activeRowId);
      if (i >= 0 && i !== st.activeRow) st.activeRow = i;
    }
    if (!st.touched) {
      const next = st.status === 'ready' && model.reachable() > 0 ? model.firstRow() : HEADER_ROW;
      if (st.activeRow !== next) st.activeRow = next;
      return;
    }
    if (st.status !== 'ready') return;
    if (st.activeRow >= 0 && !model.hasRow(st.activeRow)) {
      const last = model.lastRow();
      st.activeRow = last < 0 ? HEADER_ROW : model.mode === 'virtual' ? Math.min(st.activeRow, last) : model.firstRow();
    }
    // The editor belongs to its row; if that row is no longer where the editor is, finish it.
    if (this.editor && this.editRow) {
      const at = this.body.rowOf(this.editor.element);
      if (!at || at.rowId !== this.editRow.rowId) this.commitEditor() || this.closeEditor();
    }
  }

  // The active cell, focus.

  private activeElement(): HTMLElement | undefined {
    const { activeRow, activeField } = this.model.state;
    if (activeRow >= 0) {
      const cell = this.body.cellElement(activeRow, activeField);
      if (cell && activeField === ACTIONS_FIELD) {
        const buttons = this.body.rowAt(activeRow)?.actions?.focusables() ?? [];
        if (buttons.length) return buttons[Math.max(0, Math.min(buttons.length - 1, this.actionIndex))];
      }
      if (cell) return cell;
    }
    if (activeRow === FILTER_ROW) {
      const cell = this.filterRow.cellElement(activeField);
      if (cell) return cell;
    }
    return this.header.cellElement(activeField);
  }

  /** Exactly one cell is in the tab order: the active one. */
  private syncTabStop() {
    const el = this.activeElement();
    if (!el) return;
    const index = this.tabStop ? '0' : '-1';
    if (el === this.tabbable && el.getAttribute('tabindex') === index) return;
    this.tabbable?.setAttribute('tabindex', '-1');
    el.setAttribute('tabindex', index);
    this.tabbable = el;
  }

  private setActive(row: number, field: string) {
    const st = this.model.state;
    st.touched = true;
    const moved = st.activeRow !== row;
    if (moved) st.activeRow = row;
    if (st.activeField !== field) st.activeField = field;
    this.activeRowId = row >= 0 ? this.model.rowIdAt(row) : undefined;
    // In single selection the selection follows the active row.
    if (moved && row >= 0 && this.model.settings.get('selection') === 'single') this.selectOnly(row);
  }

  private focusActive(reveal: boolean) {
    const { activeRow, activeField } = this.model.state;
    if (reveal && activeRow >= 0) this.body.reveal(activeRow);
    if (reveal) this.revealColumn(activeField);
    this.syncTabStop();
    const el = this.activeElement();
    if (!el) return;
    el.focus({ preventScroll: true });
    if (this.model.settings.get('tooltips')) this.tip.focus(el);
  }

  /** Scrolls sideways so the column is not under the sticky columns. */
  private revealColumn(field: string) {
    const vp = this.viewportEl;
    const cell = this.header.cellElement(field);
    if (!vp || !cell || this.model.columns.sideOf(field)) return;
    if (this.isRtl()) {
      cell.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      return;
    }
    const visible = this.model.columns.visible();
    const pinned = this.model.columns.stickyWidths(visible);
    const left = cell.offsetLeft;
    const right = left + cell.offsetWidth;
    const from = vp.scrollLeft + pinned.start;
    const to = vp.scrollLeft + vp.clientWidth - pinned.end;
    if (left < from) vp.scrollLeft = left - pinned.start;
    else if (right > to) vp.scrollLeft = right - (vp.clientWidth - pinned.end);
  }

  /** Focus leaves the grid: to the next (or previous) element in the Tab order outside the rows. */
  private moveFocusOut(forward: boolean) {
    const vp = this.viewportEl;
    if (!vp) return;
    const target = nextTabbable(vp, document.body, forward);
    if (target) target.focus();
    else (document.activeElement as HTMLElement | null)?.blur?.();
  }

  // Editing.

  /** Visible data fields the user can fill in grid row `i` (a new row: `creatable`, else `editable`), in display order. */
  private editableFields(i: number): string[] {
    const { model } = this;
    const row = i >= 0 ? model.rowAt(i) : undefined;
    if (row === undefined) return [];
    const isNew = model.isNew(model.rowIdAt(i));
    return model.columns.visibleData().filter((f) => model.columns.canFill(f, row, isNew));
  }

  /** Opens the editor of the active cell. `initialText` is the character typed to start editing. */
  private startEdit(initialText?: string): boolean {
    const { model } = this;
    const st = model.state;
    const i = st.activeRow;
    const field = st.activeField;
    if (i < 0 || st.busy || model.columns.isInternal(field)) return false;
    const row = model.rowAt(i);
    const rowId = model.rowIdAt(i);
    if (row === undefined || rowId === undefined) return false;
    const rec = model.edit(rowId);
    if (rec?.saving || rec?.removed || !model.columns.canFill(field, row, !!rec?.isNew)) return false;
    const cell = this.body.cellElement(i, field);
    if (!cell) return false;
    this.closeEditor();
    const col = model.columns.get(field);
    const value = model.value(rowId, row, col);
    const typed = col.type === 'date' || col.type === 'boolean' ? undefined : initialText;
    const merged = { ...(row as object), ...(rec?.draft ?? {}) } as T;
    const editor = new CellEditor<T>(model, col, merged, value, typed, { commit: () => this.finishEdit('none'), cancel: () => this.cancelEdit() }, this.body);
    cell.append(editor.element);
    this.editor = editor;
    this.editRow = { rowId, row, field };
    st.editing = { rowId, field };
    model.setSession(rowId);
    if (this.pendingInvalid === rowId) this.pendingInvalid = null;
    this.tip.hide();
    editor.focus();
    return true;
  }

  /** Writes the editor's value into the row's draft and closes it; `false` (the editor stays) when it cannot be read. */
  private commitEditor(): boolean {
    const ed = this.editor;
    const at = this.editRow;
    if (!ed || !at) return true;
    const r = ed.read();
    if (!r.ok) {
      this.model.setError(at.row, at.field, r.message);
      this.model.announce(r.message);
      ed.focus();
      return false;
    }
    const i = this.model.indexOfKey(at.rowId, this.model.state.activeRow);
    this.model.setValue(at.rowId, at.row, at.field, r.value, i >= 0 ? this.model.dataIndex(i) : -1);
    this.closeEditor();
    return true;
  }

  /** Closes the editor without keeping its value. Focus goes back to its cell when it was inside. */
  private closeEditor() {
    const ed = this.editor;
    if (!ed) return;
    const cell = ed.element.parentElement;
    const hadFocus = ed.element.contains(document.activeElement);
    this.editor = null;
    this.editRow = null;
    this.model.state.editing = null;
    if (hadFocus) cell?.focus({ preventScroll: true });
    ed.dispose();
  }

  /** Enter in an editor: keep the value, then stay, go down or go on like Tab. */
  private finishEdit(moves: GridSettings['enterMoves']) {
    const st = this.model.state;
    if (moves === 'next') {
      this.moveWithTab(1);
      return;
    }
    if (moves === 'down') {
      const next = this.model.stepRow(st.activeRow, 1);
      if (next !== st.activeRow) {
        this.navigate(next, st.activeField);
        return;
      }
    }
    this.commitEditor();
  }

  /** Escape in an editor: a new row goes away; elsewhere the editor closes without keeping the value. */
  private cancelEdit() {
    const at = this.editRow;
    if (at && this.model.isNew(at.rowId)) {
      this.removeNewRow(at.rowId);
      return;
    }
    this.closeEditor();
  }

  /** Escape on a cell: a new row goes away; an edited row gets its old values back. */
  private cancelRowEdits(): boolean {
    const { model } = this;
    const rowId = model.rowIdAt(model.state.activeRow);
    const rec = model.edit(rowId);
    if (!rowId || !rec || rec.saving) return false;
    if (rec.isNew) {
      this.removeNewRow(rowId);
      return true;
    }
    if (rec.removed) return false;
    model.discard(rowId);
    if (model.state.session === rowId) model.setSession(null);
    if (this.pendingInvalid === rowId) this.pendingInvalid = null;
    return true;
  }

  /** Drops a new row; focus goes to the row above (same column), else the "New row" button, else the row below. */
  private removeNewRow(rowId: string) {
    const { model } = this;
    const field = model.state.activeField;
    this.closeEditor();
    const at = model.indexOfKey(rowId);
    if (model.state.session === rowId) model.setSession(null);
    model.discard(rowId);
    const above = at - 1;
    if (above >= 0 && model.hasRow(above)) {
      this.setActive(above, field);
      this.focusActive(true);
      return;
    }
    const button = this.addButton;
    if (button?.canFocus) {
      button.focus();
      return;
    }
    const next = model.hasRow(at) ? at : model.firstRow();
    this.setActive(next, field);
    this.focusActive(true);
  }

  /** Writes a value into the active cell without an editor (Space on a check box column, Delete). */
  private writeActiveCell(value: (current: unknown) => unknown): boolean {
    const { model } = this;
    const st = model.state;
    const i = st.activeRow;
    const row = i >= 0 ? model.rowAt(i) : undefined;
    const rowId = i >= 0 ? model.rowIdAt(i) : undefined;
    if (row === undefined || rowId === undefined || model.columns.isInternal(st.activeField)) return false;
    const rec = model.edit(rowId);
    if (rec?.saving || rec?.removed || !model.columns.canFill(st.activeField, row, !!rec?.isNew)) return false;
    if (st.session && st.session !== rowId) return false;
    const col = model.columns.get(st.activeField);
    model.setValue(rowId, row, st.activeField, value(model.value(rowId, row, col)), model.dataIndex(i));
    model.setSession(rowId);
    return true;
  }

  /**
   * Tab (or Shift+Tab) in edit mode: to the next editable cell of the row; at the end of a new row the
   * chain opens the next new row; at the end of another row, to the next row; at the edge of the
   * grid, out of the grid. Leaving a row saves it as the mode says.
   */
  private moveWithTab(dir: 1 | -1) {
    const { model } = this;
    const st = model.state;
    const i = st.activeRow;
    const fields = this.editableFields(i);
    const at = fields.indexOf(st.activeField);
    const nextField = at < 0 ? fields[dir > 0 ? 0 : fields.length - 1] : fields[at + dir];
    if (nextField !== undefined) {
      this.navigate(i, nextField, { edit: true });
      return;
    }
    const rowId = model.rowIdAt(i);
    if (dir > 0 && rowId && model.isNew(rowId) && model.settings.get('addRows') && model.settings.get('tabChain')) {
      this.openNextNewRow(rowId);
      return;
    }
    const next = model.stepRow(i, dir);
    if (next !== i && next >= 0) {
      const nextFields = this.editableFields(next);
      const f = nextFields[dir > 0 ? 0 : nextFields.length - 1];
      const visible = model.columns.visibleData();
      this.navigate(next, f ?? visible[dir > 0 ? 0 : visible.length - 1] ?? st.activeField, { edit: f !== undefined });
      return;
    }
    this.leaveRowThen(() => this.moveFocusOut(dir > 0));
  }

  /** The Tab chain: finish the new row `rowId` and open the next one right below it. */
  private openNextNewRow(rowId: string) {
    const { model } = this;
    if (!this.commitEditor() || model.isUntouched(rowId)) return;
    this.leaveRowThen(() => {
      const k = model.addedRows.findIndex((a) => a.rowId === rowId);
      this.openNewRow(model.insertAdded(k >= 0 ? k + 1 : model.addedRows.length));
    });
  }

  /** Brings a new row into view (to the very end or start for "New row", nearest for the chain) and opens the editor of its first cell a new row can fill. */
  private openNewRow(i: number, align: 'nearest' | 'start' | 'end' = 'nearest') {
    const { model } = this;
    const field = this.editableFields(i)[0] ?? model.columns.visibleData()[0] ?? model.state.activeField;
    model.setSession(model.rowIdAt(i) ?? null);
    this.setActive(i, field);
    this.body.reveal(i, align);
    this.goToCell(i, field, { edit: true });
    model.announce(model.text('gridRowAdded'));
  }

  /**
   * Leaves the row being edited so that `then` can run: the editor is read, the row is checked and
   * sent as the mode says. Blocked (focus on the first message) when it does not pass; in `wait` mode
   * `then` runs once the save worked. A new row nobody typed into is dropped; `then` gets its former
   * grid index (rows after it moved up by one), else -1.
   */
  private leaveRowThen(then: (removedAt: number) => void, otherwise?: () => void): boolean {
    const { model } = this;
    const st = model.state;
    const fail = () => {
      otherwise?.();
      return false;
    };
    if (st.busy) return fail();
    if (!this.commitEditor()) return fail();
    const rowId = st.session;
    if (!rowId) {
      then(-1);
      return true;
    }
    if (model.isUntouched(rowId)) {
      const at = model.indexOfKey(rowId);
      model.setSession(null);
      model.discard(rowId);
      then(at);
      return true;
    }
    if (!model.hasPending(rowId)) {
      model.setSession(null);
      if (!hasKeys(model.edit(rowId)?.errors ?? {})) {
        then(-1);
        return true;
      }
    }
    const bad = model.validate(rowId);
    if (bad !== null) {
      model.setSession(rowId);
      this.focusError(rowId, bad);
      model.announce(model.text('gridFixErrors'));
      return fail();
    }
    model.setSession(null);
    if (this.pendingInvalid === rowId) this.pendingInvalid = null;
    const result = model.commit(rowId);
    if (result === true) {
      then(-1);
      return true;
    }
    st.busy = true;
    void result.then((ok) => {
      st.busy = false;
      if (this.isDisposed) return;
      if (ok) {
        then(-1);
        return;
      }
      model.setSession(rowId);
      this.focusError(rowId, this.firstErrorField(rowId));
      otherwise?.();
    });
    return true;
  }

  /**
   * Focus left the rows, or the data is about to change: finish the editor and the row without
   * blocking. A row with messages stays as it is (its edits kept, marked) and is remembered.
   */
  private leave() {
    const { model } = this;
    if (this.editor && !this.commitEditor()) this.closeEditor();
    const rowId = model.state.session;
    if (!rowId || model.state.busy) return;
    model.setSession(null);
    if (model.isUntouched(rowId)) {
      model.discard(rowId);
      return;
    }
    if (!model.hasPending(rowId)) return;
    if (model.validate(rowId) !== null) {
      this.pendingInvalid = rowId;
      return;
    }
    void model.commit(rowId);
  }

  /** The first visible field of a row with a message, or `''` (a message of the whole row). */
  private firstErrorField(rowId: string): string {
    const errors = this.model.edit(rowId)?.errors;
    if (!errors) return '';
    return this.model.columns.visibleData().find((f) => errors[f]) ?? '';
  }

  /** Moves to the cell of a message (`field` `''`: the row's status cell, else the active column). */
  private focusError(rowId: string, field: string) {
    const { model } = this;
    const i = model.indexOfKey(rowId, model.state.activeRow);
    if (i < 0) return;
    const status = model.columns.visible().includes(STATUS_FIELD) ? STATUS_FIELD : '';
    this.setActive(i, field || status || model.state.activeField);
    this.focusActive(true);
  }

  /**
   * Goes to a cell. Leaving the current row first saves it as the mode says and may block (messages)
   * or wait (`wait` mode); the move happens once the row could be left.
   */
  private navigate(row: number, field: string, opts: GoToCellOptions = {}): boolean {
    const { model } = this;
    const st = model.state;
    if (st.busy) return false;
    const target = row >= 0 ? model.rowIdAt(row) : undefined;
    if (st.session && target === st.session) {
      if (!this.commitEditor()) return false;
      this.goToCell(row, field, opts);
      return true;
    }
    return this.leaveRowThen((removedAt) => {
      if (removedAt >= 0 && row > removedAt) row--;
      if (row >= 0 && !model.hasRow(row)) row = model.lastRow();
      this.goToCell(row, field, opts);
    });
  }

  private goToCell(row: number, field: string, opts: GoToCellOptions) {
    this.setActive(row, field);
    this.focusActive(opts.reveal !== false);
    if (opts.edit) this.startEdit(typeof opts.edit === 'string' ? opts.edit : undefined);
  }

  // Events.

  private onFocusIn(e: FocusEvent) {
    const target = e.target as HTMLElement;
    if (this.editor?.element.contains(target)) return;
    const filterCell = target.closest?.('.mx-data-grid__filter-cell') as HTMLElement | null;
    if (filterCell) {
      if (this.model.state.session) this.leave();
      this.setActive(FILTER_ROW, filterCell.dataset.field ?? '');
      this.syncTabStop();
      return;
    }
    const cell = target.closest?.('.mx-data-grid__cell, .mx-data-grid__header-cell') as HTMLElement | null;
    if (!cell) return;
    const field = cell.dataset.field ?? '';
    if (target !== cell && target.classList.contains('mx-data-grid__action')) {
      const buttons = this.body.rowOf(cell)?.actions?.focusables() ?? [];
      this.actionIndex = Math.max(0, buttons.indexOf(target as HTMLButtonElement));
    }
    if (cell.classList.contains('mx-data-grid__header-cell')) {
      if (target !== cell) return;
      this.leave();
      this.setActive(HEADER_ROW, field);
    } else {
      const row = this.body.rowOf(cell);
      if (!row || row.index < 0) return;
      if (this.editor) {
        const same = this.editRow?.rowId === row.rowId && this.editRow?.field === field;
        if (!same && !this.commitEditor()) return;
      }
      if (this.model.state.session && row.rowId !== this.model.state.session) this.leave();
      this.setActive(row.index, field);
    }
    this.syncTabStop();
  }

  private onFocusOut(e: FocusEvent) {
    const vp = this.viewportEl;
    const next = e.relatedTarget as Node | null;
    if (next && vp?.contains(next)) return;
    this.tip.hide();
    if (this.model.state.adjust) this.endAdjust(true);
    // Leaving the rows ends the edit; focus that only moved inside the grid's own work comes back at
    // once, and switching windows keeps everything as it is.
    if (!next && typeof document.hasFocus === 'function' && !document.hasFocus()) return;
    queueMicrotask(() => {
      if (!this.isDisposed && !vp?.contains(document.activeElement)) this.leave();
    });
  }

  /** A press on a cell of another row: leave the current row first (it may block or wait). */
  private onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (this.editor?.element.contains(target)) return;
    const cell = target.closest?.('.mx-data-grid__cell') as HTMLElement | null;
    if (!cell) return;
    const row = this.body.rowOf(cell);
    if (!row || row.index < 0) return;
    const st = this.model.state;
    if (st.busy) {
      e.preventDefault();
      return;
    }
    if (!st.session || row.rowId === st.session) return;
    e.preventDefault();
    this.navigate(row.index, cell.dataset.field ?? st.activeField, { reveal: false });
  }

  private onDoubleClick(e: MouseEvent) {
    const cell = (e.target as HTMLElement).closest?.('.mx-data-grid__cell') as HTMLElement | null;
    if (!cell || this.editor?.element.contains(e.target as Node)) return;
    const row = this.body.rowOf(cell);
    if (!row || row.index !== this.model.state.activeRow) return;
    this.startEdit();
  }

  private onClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (this.editor?.element.contains(target)) return;
    const action = target.closest?.('.mx-data-grid__action') as HTMLElement | null;
    if (action) {
      this.runAction(action);
      return;
    }
    const condition = target.closest?.('.mx-data-grid__condition') as HTMLElement | null;
    if (condition) {
      const field = (condition.closest('.mx-data-grid__filter-cell') as HTMLElement | null)?.dataset.field;
      if (field) this.openConditions(field);
      return;
    }
    const cell = target.closest?.('.mx-data-grid__cell') as HTMLElement | null;
    const view = cell ? this.body.rowOf(cell) : undefined;
    if (!cell || !view || view.index < 0) return;
    this.clickSelect(e, view, cell.dataset.field ?? '');
  }

  private hasMenu(field: string): boolean {
    return this.model.columns.can(field, 'menu') && this.menu.hasEntries(field);
  }

  private openMenu(field: string, anchor: HTMLElement) {
    this.setActive(HEADER_ROW, field);
    this.syncTabStop();
    this.menu.open(field, anchor, this.header.cellElement(field)!);
  }

  /** Fits a column to its header and the rows shown now. */
  private autoSize(field: string) {
    const headerCell = this.header.cellElement(field);
    if (!headerCell) return;
    const title = headerCell.querySelector<HTMLElement>('.mx-data-grid__title');
    let width = title ? headerCell.offsetWidth - title.offsetWidth + textWidth(title) : headerCell.offsetWidth;
    for (const cell of this.body.renderedCells(field)) {
      const style = getComputedStyle(cell);
      const pad = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) || 0;
      width = Math.max(width, textWidth(cell) + pad);
    }
    this.model.columns.resize(field, Math.ceil(width) + 2);
  }

  /** Keyboard move or resize, from the column menu. */
  private startAdjust(kind: 'move' | 'resize', field: string) {
    const { model } = this;
    const cols = model.columns;
    model.state.adjust = { kind, field, original: kind === 'move' ? [...cols.state.order] : cols.width(field) };
    this.setActive(HEADER_ROW, field);
    this.focusActive(true);
    model.announce(model.text(kind === 'move' ? 'gridMovingHint' : 'gridResizingHint', { title: cols.title(field) }));
  }

  private endAdjust(keep: boolean) {
    const adjust = this.model.state.adjust;
    if (!adjust) return;
    this.model.state.adjust = null;
    const cols = this.model.columns;
    if (!keep) {
      if (adjust.kind === 'move') cols.state.order = adjust.original as string[];
      else cols.state.width[adjust.field] = adjust.original as number;
      return;
    }
    this.model.layoutChanged();
  }

  private onAdjustKey(e: KeyboardEvent): boolean {
    const { model } = this;
    const adjust = model.state.adjust!;
    const cols = model.columns;
    const title = cols.title(adjust.field);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const forward = (e.key === 'ArrowRight') !== this.isRtl();
      if (adjust.kind === 'move') {
        cols.moveBy(adjust.field, forward ? 1 : -1);
        const zone = cols.zone(cols.zoneOf(adjust.field));
        model.announce(model.text('gridMovedTo', { title, position: zone.indexOf(adjust.field) + 1, count: zone.length }));
      } else {
        const step = e.shiftKey ? 1 : 10;
        const w = cols.resize(adjust.field, cols.width(adjust.field) + (forward ? step : -step));
        model.announce(model.text('gridWidthIs', { title, width: w }));
      }
      this.focusActive(true);
      return true;
    }
    if (e.key === 'Enter') {
      this.endAdjust(true);
      return true;
    }
    if (e.key === 'Escape') {
      this.endAdjust(false);
      return true;
    }
    if (e.key === 'Tab') this.endAdjust(true);
    return false;
  }

  /**
   * Up and Down in a text, number, date or check box editor keep the value and move to the row
   * above or below; taken before the editor sees them (a number box would step its value).
   */
  private onEditorCapture(e: KeyboardEvent) {
    const ed = this.editor;
    if (!ed || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (ed.kind === 'list' || ed.kind === 'custom' || e.target !== ed.input) return;
    e.preventDefault();
    e.stopPropagation();
    if (this.model.state.busy) return;
    const st = this.model.state;
    const next = this.model.stepRow(st.activeRow, e.key === 'ArrowUp' ? -1 : 1);
    if (next !== st.activeRow) this.navigate(next, st.activeField);
    else this.commitEditor();
  }

  /** Keys inside an open editor; the editor has had them first. */
  private onEditorKey(e: KeyboardEvent) {
    const ed = this.editor!;
    if (e.key === 'Tab') {
      e.preventDefault();
      this.moveWithTab(e.shiftKey ? -1 : 1);
      return;
    }
    // Keys the editor used, and keys in its own popup, are its own.
    if (e.defaultPrevented || ed.ownsKey(e) || (ed.input && e.target !== ed.input && ed.kind !== 'custom')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.cancelEdit();
    } else if (e.key === 'Enter' && !e.altKey) {
      e.preventDefault();
      this.finishEdit(this.model.settings.get('enterMoves'));
    }
  }

  private onKey(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const { model } = this;
    const st = model.state;
    if (st.busy) {
      if (e.key !== 'Tab') e.preventDefault();
      return;
    }
    if (this.editor?.element.contains(target)) {
      this.onEditorKey(e);
      return;
    }
    const filterCell = target.closest?.('.mx-data-grid__filter-cell');
    if (filterCell && target !== filterCell && this.onFilterEditorKey(e, target)) return;
    if (target.classList.contains('mx-data-grid__action') && this.onActionKey(e, target)) return;
    if (!target.matches?.('.mx-data-grid__cell, .mx-data-grid__header-cell, .mx-data-grid__filter-cell, .mx-data-grid__action, .mx-data-grid__condition')) return;
    if (st.adjust) {
      if (this.onAdjustKey(e)) e.preventDefault();
      return;
    }
    const visible = model.columns.visible();
    if (!visible.length) return;
    const first = model.firstRow();
    const last = model.lastRow();
    const hasRows = first >= 0;
    let row = st.activeRow;
    let col = Math.max(0, visible.indexOf(st.activeField));
    const rtl = this.isRtl();
    const ctrl = e.ctrlKey || e.metaKey;
    const onRow = row >= 0;
    const filters = model.showsFilterRow();
    const mode = model.settings.get('selection');
    const field = st.activeField;

    if (ctrl && !e.altKey && e.key.toLowerCase() === 'a' && mode === 'multiple' && model.settings.get('selectAll')) {
      e.preventDefault();
      this.selectAll();
      return;
    }
    if (ctrl && !e.altKey && !e.shiftKey && (e.key.toLowerCase() === 'c' || e.code === 'KeyC')) {
      if (this.copy()) e.preventDefault();
      return;
    }
    if (ctrl && !e.altKey && !e.shiftKey && (e.key.toLowerCase() === 'v' || e.code === 'KeyV')) {
      if (onRow && model.settings.get('paste')) this.armPaste();
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
        col = rtl ? col - 1 : col + 1;
        break;
      case 'ArrowLeft':
        col = rtl ? col + 1 : col - 1;
        break;
      case 'ArrowDown':
        if (e.altKey && row === HEADER_ROW) {
          e.preventDefault();
          if (this.hasMenu(field)) this.openMenu(field, this.header.cellElement(field)!);
          else if (model.hasHeaderFilter(field)) this.openHeaderFilter(field, this.header.cellElement(field)!);
          return;
        }
        if (e.altKey && row === FILTER_ROW) {
          e.preventDefault();
          this.openConditions(field);
          return;
        }
        if (row === HEADER_ROW && filters) {
          row = FILTER_ROW;
          break;
        }
        if (!hasRows) break;
        row = row < 0 ? first : model.stepRow(row, 1);
        break;
      case 'ArrowUp':
        if (row === FILTER_ROW || row === HEADER_ROW) row = HEADER_ROW;
        else if (row === first) row = filters ? FILTER_ROW : HEADER_ROW;
        else row = model.stepRow(row, -1);
        break;
      case 'Home':
        // The first data column; the row status cell is one ArrowLeft further.
        col = Math.max(0, visible.findIndex((f) => !model.columns.isInternal(f)));
        if (ctrl && hasRows) row = first;
        break;
      case 'End':
        col = visible.length - 1;
        if (ctrl && hasRows) row = last;
        break;
      case 'PageDown':
        if (!hasRows) break;
        row = row < 0 ? first : model.stepRow(row, this.body.pageRows());
        break;
      case 'PageUp':
        if (row < 0) break;
        row = model.stepRow(row, -this.body.pageRows());
        break;
      case 'Enter':
      case 'F2':
        e.preventDefault();
        if (row === HEADER_ROW) {
          if (e.key === 'Enter' && field === SELECT_FIELD) this.toggleAll();
          else if (e.key === 'Enter') model.toggleSort(field, e.shiftKey);
        } else if (row === FILTER_ROW) this.filterCell(field)?.focus();
        else this.startEdit();
        return;
      case 'Escape':
        if (onRow && this.cancelRowEdits()) e.preventDefault();
        return;
      case 'Delete':
        if (row === FILTER_ROW) {
          e.preventDefault();
          model.filters.clear(field, 'row');
        } else if (onRow && this.writeActiveCell(() => null)) e.preventDefault();
        return;
      case 'Backspace':
        e.preventDefault();
        if (row === FILTER_ROW) model.filters.clear(field, 'row');
        else if (onRow && !this.startEdit('')) this.writeActiveCell(() => null);
        return;
      case 'ContextMenu':
      case 'F10':
        if (e.key === 'F10' && !e.shiftKey) return;
        if (row === HEADER_ROW && this.hasMenu(st.activeField)) {
          this.openMenu(st.activeField, this.header.cellElement(st.activeField)!);
          e.preventDefault();
        }
        return;
      case ' ':
        e.preventDefault();
        if (row === HEADER_ROW && field === SELECT_FIELD && model.settings.get('selectAll')) this.toggleAll();
        if (row === FILTER_ROW) this.filterCell(field)?.focus();
        if (!onRow) return;
        if (mode !== 'none' && (e.shiftKey || field === SELECT_FIELD || !this.canFillActive())) this.toggleSelected(row);
        else if (model.columns.get(field).type === 'boolean') this.writeActiveCell((v) => !v);
        else this.startEdit(' ');
        return;
      default:
        if (row === FILTER_ROW && e.key.length === 1 && !ctrl && !e.altKey) {
          if (this.filterCell(field)?.focus(e.key)) e.preventDefault();
          return;
        }
        if (onRow && e.key.length === 1 && !ctrl && !e.altKey && this.startEdit(e.key)) e.preventDefault();
        return;
    }
    e.preventDefault();
    col = Math.max(0, Math.min(visible.length - 1, col));
    const to = visible[col];
    if (to === ACTIONS_FIELD && to !== field) this.actionIndex = e.key === 'ArrowLeft' !== rtl ? Number.MAX_SAFE_INTEGER : 0;
    const extend = e.shiftKey && mode === 'multiple' && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'PageDown' || e.key === 'PageUp');
    if (extend && row >= 0 && st.activeRow >= 0) this.extendSelection(st.activeRow, row);
    this.navigate(row, to);
  }

  // Selection.

  /** The selection id and key of grid row `i`; `null` for a new row or one still loading. */
  private selectionEntry(i: number): [string, unknown] | null {
    const { model } = this;
    const row = model.rowAt(i);
    const id = model.selectId(row);
    if (row === undefined || id === undefined || model.isNew(model.rowIdAt(i))) return null;
    return [id, model.data.source.adapter.keyOf(row)];
  }

  private selectOnly(i: number) {
    const entry = this.selectionEntry(i);
    if (entry) this.model.selection.only(entry[0], entry[1], i);
  }

  private toggleSelected(i: number) {
    const sel = this.model.selection;
    if (this.model.settings.get('selection') === 'single') {
      const entry = this.selectionEntry(i);
      if (entry && sel.isSelected(entry[0])) sel.clear();
      else this.selectOnly(i);
      return;
    }
    const entry = this.selectionEntry(i);
    if (!entry) return;
    sel.toggle(entry[0], entry[1]);
    sel.setAnchor(i);
  }

  /** Shift with the arrows or a click: the rows from the anchor to `to` join the selection made before the anchor. */
  private extendSelection(from: number, to: number) {
    const sel = this.model.selection;
    if (sel.anchor < 0) sel.setAnchor(from);
    const a = Math.min(sel.anchor, to);
    const b = Math.max(sel.anchor, to);
    const rows: [string, unknown][] = [];
    for (let i = a; i <= b; i++) {
      const entry = this.model.hasRow(i) ? this.selectionEntry(i) : null;
      if (entry) rows.push(entry);
    }
    sel.extend(rows);
  }

  /** The header check box: every row of the filter, or none. */
  private toggleAll() {
    if (this.model.settings.get('selection') !== 'multiple') return;
    if (this.allState() === true) this.clearSelection();
    else this.selectAll();
  }

  /** The header check box state: all, none or some. Rows in memory are counted; elsewhere rows picked one by one are "some". */
  private allState(): boolean | 'mixed' {
    const { model } = this;
    const sel = model.selection;
    const total = model.dataTotal;
    if (sel.all) return sel.size ? 'mixed' : total > 0;
    if (sel.empty) return false;
    if (model.data.source.loadMode !== 'all') return 'mixed';
    let n = 0;
    for (const row of model.data.source.rows) if (sel.isSelected(model.selectId(row))) n++;
    return n > 0 && n === model.data.source.rows.length ? true : 'mixed';
  }

  /** Rows loaded now: every row in memory, the page, or the blocks loaded. */
  private loadedRows(): T[] {
    const rows: T[] = [];
    this.model.data.source.forEachLoaded((row) => rows.push(row));
    return rows;
  }

  /** Whether the active cell can take a value (so Space edits it rather than selecting). */
  private canFillActive(): boolean {
    const { model } = this;
    const st = model.state;
    const row = model.rowAt(st.activeRow);
    if (row === undefined || model.columns.isInternal(st.activeField)) return false;
    return model.columns.canFill(st.activeField, row, model.isNew(model.rowIdAt(st.activeRow)));
  }

  /** A click on a row: a check box toggles it; Ctrl adds or takes out, Shift selects the range from the anchor, else only that row. */
  private clickSelect(e: MouseEvent, view: GridRow<T>, field: string) {
    const mode = this.model.settings.get('selection');
    if (mode === 'none') return;
    const i = view.index;
    if (field === SELECT_FIELD) this.toggleSelected(i);
    else if (mode === 'multiple' && e.shiftKey && this.model.selection.anchor >= 0) this.extendSelection(this.model.selection.anchor, i);
    else if (mode === 'multiple' && (e.ctrlKey || e.metaKey)) this.toggleSelected(i);
    else this.selectOnly(i);
  }

  // Actions.

  /** The ready actions: edit, delete, take a deletion back, save and drop a row's edits. */
  private createActions(): GridBuiltInActions<T> {
    const t = (key: Parameters<GridModel<T>['text']>[0]) => () => this.model.text(key);
    const open = (s: { isEditing: boolean; isDirty: boolean; isNew: boolean; isRemoved: boolean; isSaving: boolean }) =>
      (s.isEditing || s.isDirty || s.isNew) && !s.isRemoved && !s.isSaving;
    return {
      edit: {
        id: 'edit',
        text: t('gridEdit'),
        icon: () => pencilMark(),
        visible: (row, s) => !s.isRemoved && !s.isEditing && this.model.columns.visibleData().some((f) => this.model.columns.canFill(f, row, s.isNew)),
        disabled: (_row, s) => s.isSaving,
        onclick: (row) => this.beginEdit(row),
      },
      remove: {
        id: 'remove',
        text: t('gridDelete'),
        icon: () => trashMark(),
        tone: 'danger',
        visible: (_row, s) => !s.isRemoved,
        disabled: (_row, s) => s.isSaving,
        onclick: (row) => void this.deleteRow(row),
      },
      restore: {
        id: 'restore',
        text: t('gridRestore'),
        icon: () => undoMark(),
        visible: (_row, s) => s.isRemoved && this.model.saveMode === 'batch',
        disabled: (_row, s) => s.isSaving,
        onclick: (row) => this.restoreRow(row),
      },
      save: {
        id: 'save',
        text: t('gridSave'),
        icon: () => checkMark(),
        tone: 'accent',
        visible: (_row, s) => open(s),
        onclick: (row) => this.saveRow(row),
      },
      cancel: {
        id: 'cancel',
        text: t('gridCancelEdit'),
        icon: () => dismissMark(),
        visible: (_row, s) => open(s),
        onclick: (row) => this.cancelRow(row),
      },
    };
  }

  /** Opens the editor of a row's first cell the user can fill. */
  private beginEdit(row: T) {
    const target = this.locate(row);
    if (!target || target.index < 0) return;
    const field = this.editableFields(target.index)[0];
    if (field) this.navigate(target.index, field, { edit: true });
  }

  /** Sends a row's edits now: the row being edited is left (checked, then saved as the mode says). */
  private saveRow(row: T) {
    const { model } = this;
    const target = this.locate(row);
    if (!target) return;
    if (model.state.session === target.rowId) {
      this.leaveRowThen(() => this.focusActive(false));
      return;
    }
    if (!model.hasPending(target.rowId)) return;
    const bad = model.validate(target.rowId);
    if (bad !== null) {
      this.focusError(target.rowId, bad);
      return;
    }
    void model.commit(target.rowId);
  }

  /** Drops a row's edits; a new row goes away. */
  private cancelRow(row: T) {
    const { model } = this;
    const target = this.locate(row);
    if (!target) return;
    if (this.editRow?.rowId === target.rowId) this.closeEditor();
    if (model.isNew(target.rowId)) {
      this.removeNewRow(target.rowId);
      return;
    }
    model.discard(target.rowId);
    if (model.state.session === target.rowId) model.setSession(null);
    if (this.pendingInvalid === target.rowId) this.pendingInvalid = null;
    this.focusActive(false);
  }

  /** A press on an action button: the action runs, the "more" button opens its menu. */
  private runAction(button: HTMLElement) {
    const view = this.body.rowOf(button);
    const hit = view?.actions?.actionOf(button);
    const st = this.model.state;
    if (!view || !hit || st.busy) return;
    if (hit === 'more') {
      this.openMore(view, button);
      return;
    }
    // A row with messages could not be left for this one.
    if (hit.disabled || (st.session && st.session !== view.rowId)) return;
    hit.action.onclick(hit.row, hit.state);
  }

  private openMore(view: GridRow<T>, button: HTMLElement) {
    const items: MenuItem[] = (view.actions?.overflow ?? []).map((a) => ({
      text: a.text,
      icon: a.hasIcon ? a.action.icon : undefined,
      enabled: !a.disabled,
      click: () => a.action.onclick(a.row, a.state),
    }));
    this.moreMenu.open(items, button, this.model.text('gridMoreActions'));
  }

  /** Keys on an action button: Left and Right move between the buttons of the cell; Enter and Space press it. */
  private onActionKey(e: KeyboardEvent, button: HTMLElement): boolean {
    const view = this.body.rowOf(button);
    const buttons = view?.actions?.focusables() ?? [];
    const at = buttons.indexOf(button as HTMLButtonElement);
    if (e.key === 'Enter' || e.key === ' ') return true;
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.shiftKey && !e.altKey) {
      const next = at + ((e.key === 'ArrowRight') !== this.isRtl() ? 1 : -1);
      if (next < 0 || next >= buttons.length) return false;
      e.preventDefault();
      this.actionIndex = next;
      this.syncTabStop();
      buttons[next].focus({ preventScroll: true });
      return true;
    }
    if (e.key === 'ArrowDown' && e.altKey && button.classList.contains('mx-data-grid__more')) {
      e.preventDefault();
      if (view) this.openMore(view, button);
      return true;
    }
    return false;
  }

  // Copy, paste, export.

  /** Puts copied cells on the clipboard: through the copy event the command raises (both forms), else as plain text. */
  private writeClipboard(content: ClipboardContent) {
    let written = false;
    const fill = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      e.clipboardData.setData('text/plain', content.text);
      e.clipboardData.setData('text/html', content.html);
      e.preventDefault();
      written = true;
    };
    document.addEventListener('copy', fill, true);
    try {
      if (typeof document.execCommand === 'function') document.execCommand('copy');
    } catch {
      // Not allowed here: the clipboard API below.
    } finally {
      document.removeEventListener('copy', fill, true);
    }
    if (!written) void navigator.clipboard?.writeText?.(content.text).catch(() => undefined);
  }

  /** Ctrl+V on a cell: the browser raises `paste` next, at the page when no field has focus; take that one event. */
  private armPaste() {
    const take = (e: ClipboardEvent) => {
      document.removeEventListener('paste', take, true);
      this.onPaste(e);
    };
    document.addEventListener('paste', take, true);
    setTimeout(() => document.removeEventListener('paste', take, true), 0);
  }

  /** A paste while a cell (not a field) has focus. */
  private onPaste(e: ClipboardEvent) {
    const focus = document.activeElement as HTMLElement | null;
    if (e.defaultPrevented || !this.model.settings.get('paste') || !focus || !this.viewportEl?.contains(focus) || !focus.classList.contains('mx-data-grid__cell')) return;
    const text = e.clipboardData?.getData('text/plain');
    if (!text) return;
    e.preventDefault();
    this.paste(text);
  }

  private async runExport(options: GridExportOptions) {
    const { model } = this;
    const controller = new AbortController();
    const stop = () => controller.abort();
    options.signal?.addEventListener('abort', stop, { once: true });
    this.exports.add(controller);
    model.state.exporting = true;
    model.announce(model.text('gridExporting'));
    try {
      const table = await this.exporter.table(options, controller.signal);
      model.announce(model.text('gridExported', { count: model.formatter.count(table.rows.length) }));
      return table;
    } catch (error) {
      if (!controller.signal.aborted) model.announce(model.text('gridExportFailed'));
      throw error;
    } finally {
      options.signal?.removeEventListener('abort', stop);
      this.exports.delete(controller);
      if (!this.isDisposed) model.state.exporting = false;
    }
  }

  // Filters.

  private filterCell(field: string): FilterCell<T> | undefined {
    return this.filterRow.filterCells.get(field);
  }

  private openHeaderFilter(field: string, anchor: HTMLElement) {
    if (!this.model.hasHeaderFilter(field)) return;
    this.setActive(HEADER_ROW, field);
    this.syncTabStop();
    this.headerFilter.open(field, anchor, this.header.cellElement(field)!);
  }

  /** The condition menu of a filter cell; a yes/no column opens its list instead. */
  private openConditions(field: string) {
    const { model } = this;
    const cell = this.filterCell(field);
    if (!cell) return;
    if (!cell.condition) {
      const list = cell.editors[0];
      if (list instanceof DropDown) list.open();
      return;
    }
    const items: MenuItem[] = model.filters.operators(field).map((op) => ({
      text: () => model.text(OPERATOR_TEXTS[op]),
      group: 'op',
      checked: () => model.filters.operator(field) === op,
      click: () => {
        model.filters.update(field, { op });
        cell.focus();
      },
    }));
    this.conditionMenu.open(items, cell.condition, model.text('gridFilterCondition', { operator: model.text(OPERATOR_TEXTS[model.filters.operator(field)]), title: model.columns.title(field) }));
    this.conditionMenu.focusChecked();
  }

  /**
   * Keys in a filter cell's condition button or editor. Escape and Enter go back to the cell (Enter
   * applies at once), Tab goes to the next editor of the row, Up and Down in a text box leave the
   * row, Alt+Down opens the conditions. Keys the editor uses are its own.
   */
  private onFilterEditorKey(e: KeyboardEvent, target: HTMLElement): boolean {
    const cell = this.filterRow.cellOf(target);
    if (!cell) return true;
    if (target === cell.condition) {
      if (e.key === 'Enter' || e.key === ' ') return true;
      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        this.openConditions(cell.field);
        return true;
      }
      if (e.key === 'Escape') {
        cell.cell.focus({ preventScroll: true });
        return true;
      }
      return false;
    }
    if (e.defaultPrevented) return true;
    const editor = cell.editors.find((ed) => ed.element.contains(target));
    if (!editor || target !== cell.inputOf(editor)) return true;
    const plain = !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        cell.cell.focus({ preventScroll: true });
        return true;
      case 'Enter':
        this.model.flushFilter();
        if (editor instanceof DropDown) return true;
        e.preventDefault();
        cell.cell.focus({ preventScroll: true });
        return true;
      case 'Tab':
        e.preventDefault();
        this.model.flushFilter();
        this.filterTab(cell, editor, e.shiftKey ? -1 : 1);
        return true;
      case 'ArrowDown':
        if (e.altKey && editor instanceof TextBox) {
          e.preventDefault();
          this.openConditions(cell.field);
          return true;
        }
      // falls through
      case 'ArrowUp':
        if (!plain || !(editor instanceof TextBox)) return true;
        e.preventDefault();
        this.model.flushFilter();
        if (e.key === 'ArrowUp') this.navigate(HEADER_ROW, cell.field);
        else if (this.model.firstRow() >= 0) this.navigate(this.model.firstRow(), cell.field);
        return true;
      default:
        return true;
    }
  }

  /** Tab between the editors of the filter row; past its ends focus leaves the grid. */
  private filterTab(cell: FilterCell<T>, editor: FilterCell<T>['editors'][number], dir: 1 | -1) {
    const all: { cell: FilterCell<T>; editor: FilterCell<T>['editors'][number] }[] = [];
    for (const field of this.model.columns.visible()) {
      const c = this.filterCell(field);
      if (c && this.model.columns.can(field, 'filterRow')) for (const ed of c.shownEditors()) all.push({ cell: c, editor: ed });
    }
    const at = all.findIndex((x) => x.editor === editor);
    const next = all[at + dir];
    if (next) {
      this.revealColumn(next.cell.field);
      next.editor.focus();
    } else {
      cell.cell.focus({ preventScroll: true });
      this.moveFocusOut(dir > 0);
    }
  }

  /** The id, row object and grid index of a row the app gives (default: the active row). */
  private locate(row?: T): { rowId: string; obj: T; index: number } | undefined {
    const { model } = this;
    if (row === undefined) {
      const i = model.state.activeRow;
      const obj = i >= 0 ? model.rowAt(i) : undefined;
      const rowId = i >= 0 ? model.rowIdAt(i) : undefined;
      return obj !== undefined && rowId !== undefined ? { rowId, obj, index: i } : undefined;
    }
    const added = model.addedRows.find((a) => a.row === row);
    if (added) return { rowId: added.rowId, obj: added.row, index: model.indexOfKey(added.rowId) };
    const rowId = model.rowIdOf(row);
    const obj = model.edit(rowId)?.row ?? row;
    const index = model.indexOfKey(rowId, model.state.activeRow);
    return { rowId, obj, index: index >= 0 ? index : model.indexOfRow(row) };
  }
}

/** Natural width of an element's content (text and inline children), not its clipped width. */
function textWidth(el: HTMLElement): number {
  if (typeof document.createRange !== 'function') return el.scrollWidth;
  const range = document.createRange();
  range.selectNodeContents(el);
  const w = range.getBoundingClientRect?.().width ?? 0;
  return w || el.scrollWidth;
}
