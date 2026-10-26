import { effect, Emitter, reactive, read, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Control } from '../../core/control';
import { focusableIn, nextTabbable, tabbableIn } from '../../core/focus';
import { checkMark, dismissMark, pencilMark, trashMark, undoMark } from '../../core/glyphs';
import { fillTemplate } from '../../core/fill-template';
import { nextId } from '../../core/next-id';
import { ResizeWatch } from '../../core/resize-watch';
import type { MenuItem } from '../../parts/menu/menu-item';
import { Button } from '../button/Button';
import { confirm } from '../form/confirm';
import { MxForm } from '../form/MxForm';
import { DropDown } from '../dropdown/DropDown';
import { ProgressBar } from '../progress/ProgressBar';
import { Spinner } from '../progress/Spinner';
import { TextBox } from '../textbox/TextBox';
import { Toolbar } from '../toolbar/Toolbar';
import type { ColumnFeatures } from './column-features';
import type { ColumnOptionName } from './column-option-name';
import type { GridCellClickEventArgs } from './grid-cell-click-event-args';
import type { GridColumn } from './grid-column';
import type { GridCellPreparedEventArgs } from './grid-cell-prepared-event-args';
import type { GridContentReadyEventArgs } from './grid-content-ready-event-args';
import type { GridContextMenuPreparingEventArgs } from './grid-context-menu-preparing-event-args';
import type { GridCopyingEventArgs } from './grid-copying-event-args';
import type { GridDataErrorEventArgs } from './grid-data-error-event-args';
import type { GridEditCanceledEventArgs } from './grid-edit-canceled-event-args';
import type { GridEditCancelingEventArgs } from './grid-edit-canceling-event-args';
import type { GridEditingCell } from './grid-editing-cell';
import type { GridEditingStartEventArgs } from './grid-editing-start-event-args';
import type { GridExportedEventArgs } from './grid-exported-event-args';
import type { GridExportingEventArgs } from './grid-exporting-event-args';
import type { GridFilterChangedEventArgs } from './grid-filter-changed-event-args';
import type { GridFilterChangingEventArgs } from './grid-filter-changing-event-args';
import type { GridFocusedCellChangedEventArgs } from './grid-focused-cell-changed-event-args';
import type { GridFocusedCellChangingEventArgs } from './grid-focused-cell-changing-event-args';
import type { GridFocusedRowChangedEventArgs } from './grid-focused-row-changed-event-args';
import type { GridFocusedRowChangingEventArgs } from './grid-focused-row-changing-event-args';
import type { GridInitNewRowEventArgs } from './grid-init-new-row-event-args';
import type { GridKeyHandlingEventArgs } from './grid-key-handling-event-args';
import type { GridLayoutChangingEventArgs } from './grid-layout-changing-event-args';
import type { GridOptionChangedEventArgs } from './grid-option-changed-event-args';
import type { GridMoreRowsLoadedEventArgs } from './grid-more-rows-loaded-event-args';
import type { GridMoreRowsLoadingEventArgs } from './grid-more-rows-loading-event-args';
import type { GridPageChangedEventArgs } from './grid-page-changed-event-args';
import type { GridPageChangingEventArgs } from './grid-page-changing-event-args';
import type { GridPageSizeChangedEventArgs } from './grid-page-size-changed-event-args';
import type { GridPageSizeChangingEventArgs } from './grid-page-size-changing-event-args';
import type { GridPastingEventArgs } from './grid-pasting-event-args';
import type { GridRowClickEventArgs } from './grid-row-click-event-args';
import type { GridRowInsertedEventArgs } from './grid-row-inserted-event-args';
import type { GridRowInsertingEventArgs } from './grid-row-inserting-event-args';
import type { GridRowPreparedEventArgs } from './grid-row-prepared-event-args';
import type { GridRowRemovedEventArgs } from './grid-row-removed-event-args';
import type { GridRowRemovingEventArgs } from './grid-row-removing-event-args';
import type { GridRowType } from './grid-row-type';
import type { GridRowUpdatedEventArgs } from './grid-row-updated-event-args';
import type { GridRowUpdatingEventArgs } from './grid-row-updating-event-args';
import type { GridSavedEventArgs } from './grid-saved-event-args';
import type { GridSavingEventArgs } from './grid-saving-event-args';
import type { GridSearchTextChangingEventArgs } from './grid-search-text-changing-event-args';
import type { GridSelectionChangingEventArgs } from './grid-selection-changing-event-args';
import type { GridSortChangedEventArgs } from './grid-sort-changed-event-args';
import type { GridSortChangingEventArgs } from './grid-sort-changing-event-args';
import type { GridSummary } from './grid-summary';
import type { GridSummaryChangedEventArgs } from './grid-summary-changed-event-args';
import type { GridStateValue } from './grid-state-value';
import type { GridToolbarPreparingEventArgs } from './grid-toolbar-preparing-event-args';
import type { GridVisibleRow } from './grid-visible-row';
import type { DataGridProps } from './data-grid-props';
import type { GridActionRanEventArgs } from './grid-action-ran-event-args';
import type { GridActionRun } from './grid-action-run';
import type { GridActionRunningEventArgs } from './grid-action-running-event-args';
import type { GridBarAction } from './grid-bar-action';
import type { GridBuiltInActions } from './grid-built-in-actions';
import type { GridChanges } from './grid-changes';
import type { GridEditForm } from './grid-edit-form';
import type { GridEditPopup } from './grid-edit-popup';
import type { GridMasterDetail } from './grid-master-detail';
import type { GridAdaptiveDetail } from './grid-adaptive-detail';
import type { GridAdaptiveDetailRowPreparingEventArgs } from './grid-adaptive-detail-row-preparing-event-args';
import type { GridAdaptiveRowExpandedEventArgs } from './grid-adaptive-row-expanded-event-args';
import type { GridAdaptiveRowExpandingEventArgs } from './grid-adaptive-row-expanding-event-args';
import type { GridColumnItem } from './grid-column-item';
import type { DetailRow } from './view/DetailRow';
import { AdaptiveForm } from './view/AdaptiveForm';
import { BandRows } from './view/BandRows';
import type { GridEditorPreparedEventArgs } from './grid-editor-prepared-event-args';
import type { GridEditorPreparingEventArgs } from './grid-editor-preparing-event-args';
import type { GridRowValidatingEventArgs } from './grid-row-validating-event-args';
import type { GridExportOptions } from './grid-export-options';
import type { GridExportSettings } from './grid-export-settings';
import type { GridLoadPanel } from './grid-load-panel';
import type { GridSheet } from './grid-sheet';
import type { GridSheetOptions } from './grid-sheet-options';
import type { GridFilters } from './grid-filters';
import type { GridGroupDroppingEventArgs } from './grid-group-dropping-event-args';
import type { GridGroupingChangedEventArgs } from './grid-grouping-changed-event-args';
import type { GridGroupingChangingEventArgs } from './grid-grouping-changing-event-args';
import type { GridLayout } from './grid-layout';
import type { GridRowExpandedEventArgs } from './grid-row-expanded-event-args';
import type { GridRowExpandingEventArgs } from './grid-row-expanding-event-args';
import type { GridSearchTextChangedEventArgs } from './grid-search-text-changed-event-args';
import type { GridSelection } from './grid-selection';
import type { GridSelectionChangedEventArgs } from './grid-selection-changed-event-args';
import type { GridSettings } from './grid-settings';
import type { GridToolbar as GridToolbarOptions } from './grid-toolbar';
import type { ActionEntry } from './model/action-entry';
import type { ActionTarget } from './model/action-target';
import { ActionRunner } from './model/ActionRunner';
import type { ClipboardContent } from './model/clipboard-content';
import type { ExportTable } from './model/export-table';
import { ACTIONS_FIELD, ADAPTIVE_FIELD, EXPAND_FIELD, SELECT_FIELD, STATUS_FIELD } from './model/ColumnModel';
import { RowDrag } from './view/RowDrag';
import type { GridRowDragging } from './grid-row-dragging';
import { GridClipboard } from './model/GridClipboard';
import { GridExport } from './model/GridExport';
import { FILTER_ROW, GridModel, HEADER_ROW } from './model/GridModel';
import type { GroupNode } from './model/group-node';
import { Switches } from './model/Switches';
import { ActionWidths } from './view/ActionWidths';
import { BarButtons } from './view/BarButtons';
import type { ResolvedAction } from './view/resolved-action';
import { CellEditor } from './view/CellEditor';
import { CellTip } from './view/CellTip';
import { ColumnMenu } from './view/ColumnMenu';
import { ColumnStyles } from './view/ColumnStyles';
import type { FilterCell } from './view/FilterCell';
import { FilterRow } from './view/FilterRow';
import { GridBody } from './view/GridBody';
import { GridToolbar } from './view/GridToolbar';
import { DragGhost } from '../../parts/drag/DragGhost';
import { EditForm } from './view/EditForm';
import type { FormValues } from './view/form-values';
import type { PopupValues } from './view/popup-values';
import { GroupPanel } from './view/GroupPanel';
import { GridPager } from './view/GridPager';
import type { GridRow } from './view/GridRow';
import { HeaderFilter } from './view/HeaderFilter';
import type { FilterBuilder } from '../filterbuilder/FilterBuilder';
import { FilterBuilderWindow } from './view/FilterBuilderWindow';
import { FilterPanel } from './view/FilterPanel';
import { builderFields } from './model/builder-fields';
import { filterText } from '../filterbuilder/filter-text';
import type { GridFilterBuilderClosedEventArgs } from './grid-filter-builder-closed-event-args';
import type { GridFilterBuilderClosingEventArgs } from './grid-filter-builder-closing-event-args';
import type { GridFilterBuilderOpenedEventArgs } from './grid-filter-builder-opened-event-args';
import type { GridFilterBuilderOpeningEventArgs } from './grid-filter-builder-opening-event-args';
import type { GridFilterBuilderOptions } from './grid-filter-builder-options';
import type { GridFilterBuilderPopup } from './grid-filter-builder-popup';
import { HeaderRow } from './view/HeaderRow';
import type { HeaderHost } from './view/header-host';
import type { ExportCommand } from './view/export-command';
import type { ExportValues } from './view/export-values';
import type { ToolbarValues } from './view/toolbar-values';
import { MenuPopup } from './view/MenuPopup';
import { TotalRow } from './view/TotalRow';
import { OPERATOR_TEXTS } from './view/operator-texts';
import { COLUMN_FEATURES } from './model/column-feature-names';

/** How a move ends: on the target cell, optionally with its editor open. */
interface GoToCellOptions {
  /** Open the editor; a string is the character typed to start editing. */
  edit?: boolean | string;
  /** Scroll the target into view (default). */
  reveal?: boolean;
}

const hasKeys = (o: object) => Object.keys(o).length > 0;

/** Column options that are the grid's state, not fields of the column's definition. */
const COLUMN_STATE = new Set<string>(['width', 'visible', 'hidden', 'flex', 'sticky', 'visibleIndex', 'sortOrder', 'sortIndex', 'groupIndex', 'filterValues', 'filterType']);
/** Fields of a definition the rows are read, sorted, filtered or grouped by. */
const COLUMN_DATA = new Set<string>(['type', 'value', 'compare', 'sortField', 'textFrom', 'lookup', 'calculateGroupValue', 'groupCompare']);

/**
 * A data grid: rows in memory or from the data layer (any adapter), shown as one virtual list or in
 * pages. Columns can be sorted, resized, moved, hidden and pinned; cells are edited in place with the
 * kit's editors, rows are added (Tab on the last cell of a new row opens the next one) and deleted,
 * and changes are saved through a `ChangeTracker` row by row (waiting or in the background) or all
 * together. Rows carry their own action buttons (those that do not fit go into a "more" menu), can be
 * selected one, several or all (also over data never loaded), and are filtered from a filter row, from
 * value lists in the headers and from a search box that looks in every column at once (the text found
 * is marked). Rows can be grouped, with summaries in the group rows and footers, and totals in a
 * row under the rows. A toolbar above the rows holds the grid's own commands and the app's. The grid is a
 * single tab stop navigated with the arrow keys. Every feature can be turned off, for the whole grid
 * (`settings`) or per column, also while it is shown.
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
  /** The rows of band headers above the header. */
  private readonly bands: BandRows<T>;
  private readonly filterRow: FilterRow<T>;
  private readonly body: GridBody<T>;
  /** Rows dragged to another place, or to another grid (`rowDragging`), and moved with the keys. */
  private readonly rowDrag: RowDrag<T>;
  private readonly totalRow: TotalRow<T>;
  private readonly pager: GridPager<T>;
  private readonly menu: ColumnMenu<T>;
  private readonly headerFilter: HeaderFilter<T>;
  private readonly moreMenu: MenuPopup;
  private readonly conditionMenu: MenuPopup;
  private readonly widths: ActionWidths;
  private readonly builtIns: GridBuiltInActions<T>;
  private readonly toolbarSwitches: Switches<ToolbarValues>;
  private readonly topBar: GridToolbar<T>;
  private readonly groupPanel: GroupPanel<T>;
  private readonly styles: ColumnStyles<T>;
  private readonly tip: CellTip;
  private readonly clipboard: GridClipboard<T>;
  private readonly exporter: GridExport<T>;
  /** Exports running, stopped when the grid goes away. */
  private readonly exports = new Set<AbortController>();
  private readonly exportSwitches: Switches<ExportValues>;
  /** The panel over the rows while an export with `loadPanel` runs, or an action works on several rows. */
  private readonly exportPanel = reactive({ shown: false, kind: 'export' as 'export' | 'action', text: '', progress: true, cancel: true, loaded: 0, total: 0 });
  private stopPanelExport: (() => void) | null = null;
  private readonly runner: ActionRunner<T>;
  /** The actions of the target rows in the bottom bar, on a kit toolbar of their own. */
  private readonly bottomBar: Toolbar;
  private readonly bottomActions: BarButtons<T>;
  /** "Export selected rows" was chosen for a format the app writes: its next `exportSheet()` takes the selection. */
  private selectedNext = false;
  private readonly gridId = nextId('data-grid');
  private viewportEl: HTMLDivElement | null = null;
  private headEl: HTMLDivElement | null = null;
  private footEl: HTMLDivElement | null = null;
  private probeEl: HTMLDivElement | null = null;
  private measureEl: HTMLDivElement | null = null;
  /** Which button of the active actions cell has focus. */
  private actionIndex = 0;
  private tabbable: HTMLElement | null = null;
  private editor: CellEditor<T> | null = null;
  /** The row and field the open editor belongs to. */
  private editTarget: { rowId: string; row: T; field: string } | null = null;
  /** Id of the active row (follows a new row when rows above it come or go). */
  private activeRowId: string | undefined;
  /** A row the user left with messages (focus went elsewhere); adding a row goes back to it first. */
  private pendingInvalid: string | null = null;
  /** Stops following a `searchText` function. */
  private stopSearchBinding: (() => void) | null = null;
  /** A key `onKeyHandling` cancelled: the grid leaves it alone. */
  private skippedKey: KeyboardEvent | null = null;
  /** The row being edited in the edit form (`editMode` `'form'`, `'popup'`), and the window it is in. */
  private formEdit: { mode: 'form' | 'popup'; rowId: string; row: T; form: EditForm<T>; window: MxForm | null } | null = null;
  private readonly formSwitches: Switches<FormValues>;
  private readonly popupSwitches: Switches<PopupValues>;
  /** The filter panel under the rows, the filter builder's window and its options. */
  private readonly filterPanel: FilterPanel<T>;
  private readonly builderWindow: FilterBuilderWindow<T>;
  private readonly builderOptions: GridFilterBuilderOptions;
  private readonly builderPopupSwitches: Switches<PopupValues>;
  /** Bumped when texts of lookup keys arrive: the panel's text reads them. */
  private readonly lookupTexts = reactive({ n: 0 });
  /** Stops following a `filterValue` or a `filterEnabled` function. */
  private stopFilterValueBinding: (() => void) | null = null;
  private stopFilterEnabledBinding: (() => void) | null = null;
  /** The ready `remove` was confirmed for the rows it runs on: `deleteRow` does not ask again. */
  private deleteConfirmed = false;
  /** What follows the functions of a column (`groupIndex`, `filterValues`, `filterType`), by field. */
  private readonly columnWatches = new Map<string, (() => void)[]>();
  /** `beginUpdate()` calls not ended yet, and whether the body waits to be laid out. */
  private updates = 0;
  private relayoutWaiting = false;
  /** While columns are virtual: how long drawing the columns that came into view took last (ms), and the wait for the sideways scrolling to stop. */
  private columnsTook = 0;
  private columnsTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(props: IBaseProp<DataGridProps<T>>) {
    super(props);
    const own = (this.props ?? {}) as DataGridProps<T>;
    if (own.label !== undefined) this.bindProperty('text', own.label);
    const model = new GridModel<T>(own);
    this.model = model;
    model.errorId = `${this.gridId}-error`;
    const ghost = new DragGhost(
      () => this.element as HTMLElement,
      () => model.settings.get('dragGhost'),
      'mx-data-grid__ghost',
    );
    this.motif.setDisposable(() => ghost.hide());
    const host: HeaderHost = {
      ghost,
      hasMenu: (field) => this.hasMenu(field),
      openMenu: (field, anchor) => this.openMenu(field, anchor),
      autoSize: (field) => this.autoSize(field),
      autoSizeAll: () => this.autoSizeColumns(),
      startAdjust: (kind, field) => this.startAdjust(kind, field),
      isRtl: () => this.isRtl(),
      openHeaderFilter: (field, anchor) => this.openHeaderFilter(field, anchor),
      toggleAll: () => this.toggleAll(),
      allState: () => this.allState(),
      groupTarget: () => (this.groupPanel.accepts ? this.groupPanel : null),
      focusActive: () => this.focusActive(false),
    };
    this.header = new HeaderRow<T>(model, host);
    this.bands = new BandRows<T>(model, host, this.header, this);
    this.motif.setDisposable(() => this.bands.dispose());
    this.filterRow = new FilterRow<T>(model);
    this.widths = new ActionWidths(() => this.measureEl);
    this.body = new GridBody<T>(model, () => this.viewportEl, this.widths, {
      grid: this,
      collapse: (key) => this.collapseRow(key),
      adaptiveContent: (rowId, row) => this.adaptiveForm(rowId, row),
    });
    this.rowDrag = new RowDrag<T>(model, this.body, {
      grid: this,
      ghost,
      root: () => this.element as HTMLElement,
      viewport: () => this.viewportEl,
      focusRow: (i) => {
        const field = model.state.activeField;
        if (this.focusWithin) this.navigate(i, field);
        else if (this.canMoveTo(i, field)) {
          this.setActive(i, field);
          this.body.reveal(i);
          this.syncTabStop();
        }
      },
      label: () => this.text || model.text('gridLabel'),
    });
    this.motif.setDisposable(() => this.rowDrag.dispose());
    model.rowDrag.changed = (name, value, previous) => model.events.tell(model.events.optionChanged, () => ({ name: `rowDragging.${name}`, value, previous }));
    this.totalRow = new TotalRow<T>(model);
    this.pager = new GridPager<T>(model, {
      goTo: (page) => (this.page = page),
      setPageSize: (size) => this.pageSize(size),
      gridLabel: () => this.text || model.text('gridLabel'),
      total: () => this.total,
    });
    model.summaries.component = this;
    this.menu = new ColumnMenu<T>(model, host, this);
    this.headerFilter = new HeaderFilter<T>(model, this);
    this.moreMenu = new MenuPopup(this, 'mx-data-grid__menu');
    this.conditionMenu = new MenuPopup(this, 'mx-data-grid__menu', 'bottom-start');
    this.builtIns = this.createActions();
    model.builtIns = this.builtIns;
    // In the 'menu' display the column is as wide as the "more" button, unless an action stays a button.
    model.columns.actionsMenuWidth = () => {
      void model.state.rowHeight;
      if (model.settings.get('actionsDisplay') !== 'menu' || model.actionSets.anyNever()) return null;
      const frame = untracked(() => this.widths.frame());
      return frame.more > 0 ? Math.ceil(frame.padding + frame.more) : 40;
    };
    this.runner = new ActionRunner<T>(model, {
      open: (text, stop) => {
        const p = this.exportPanel;
        if (p.shown) return false;
        p.kind = 'action';
        p.text = text;
        p.progress = true;
        p.cancel = model.settings.get('actionsStopButton');
        p.loaded = 0;
        p.total = 0;
        p.shown = true;
        this.stopPanelExport = stop;
        return true;
      },
      progress: (done, total) => this.showProgress(done, total),
      close: () => {
        if (this.exportPanel.kind !== 'action') return;
        this.exportPanel.shown = false;
        this.stopPanelExport = null;
      },
    });
    this.bottomBar = new Toolbar({ label: () => model.actionSets.targetLabel() || model.text('gridActions'), size: 'sm' });
    this.bottomBar.element.classList.add('mx-data-grid__bar-actions');
    const bottomActions: BarButtons<T> = new BarButtons<T>(model, 'bottom', {
      run: (entry) => void this.startEntry(entry, 'bottom'),
      added: (button) => {
        this.bottomBar.controls.add(button);
        const menu = this.bottomBar.element.querySelector(':scope > .mx-data-grid__bar-menu');
        if (menu) this.bottomBar.element.insertBefore(button.element, menu);
      },
    });
    this.bottomActions = bottomActions;
    this.bottomBar.controls.add(bottomActions.menuButton);
    this.bottomBar.visible = () => this.bottomShown();
    this.motif.setDisposable(() => bottomActions.dispose());
    const ev = model.events;
    model.selection.onChanged((selection) => ev.selectionChanged.fire({ selection }));
    this.tip = new CellTip(this, () => model.settings.get('tooltipDelay'));
    this.clipboard = new GridClipboard<T>(model);
    this.exporter = new GridExport<T>(model);
    this.styles = new ColumnStyles<T>(model.columns, this.gridId);
    model.onBeforeQueryChange = () => {
      this.dropForm();
      this.leave();
    };
    model.onQueryChange = () => this.body.toStart();
    model.onLayoutChange = (layout) => ev.layoutChanged.fire(layout);
    model.search.onTextChanged = (text) => ev.searchTextChanged.fire({ text });
    // The `onX` props listen to the events of the same name (`onLayoutChange` to `layoutChanged`).
    for (const [prop, listener] of Object.entries(own)) {
      if (!/^on[A-Z]/.test(prop) || typeof listener !== 'function') continue;
      const name = prop === 'onLayoutChange' ? 'layoutChanged' : prop[2].toLowerCase() + prop.slice(3);
      const emitter = (ev as unknown as Record<string, unknown>)[name];
      if (emitter instanceof Emitter) ev.event(emitter)(listener as (e: unknown) => void);
    }
    model.onGroupingChanging = (group, previous, byUser) => {
      const e: GridGroupingChangingEventArgs = { group, previous, byUser, cancel: false };
      ev.groupingChanging.fire(e);
      return !e.cancel;
    };
    model.onGroupingChanged = (group, previous, byUser) => ev.groupingChanged.fire({ group, previous, byUser });
    model.onGroupDropping = (args) => {
      const e: GridGroupDroppingEventArgs = { ...args, cancel: false };
      ev.groupDropping.fire(e);
      return !e.cancel;
    };
    this.groupPanel = new GroupPanel<T>(model, {
      ghost,
      isRtl: () => this.isRtl(),
      showHeaderDrop: (field, x, y) => this.header.showChipDrop(field, x, y),
      dropOnHeaders: (field, x) => this.dropOnHeaders(field, x),
      focusRows: () => this.focusActive(true),
      keyHandling: (e) => this.askKey(e),
    });
    this.toolbarSwitches = new Switches<ToolbarValues>(['visible', 'items'], {}, own.toolbar ?? {});
    this.toolbarSwitches.changed = (name, value, previous) => ev.tell(ev.optionChanged, () => ({ name: `toolbar.${name}`, value, previous }));
    this.formSwitches = new Switches<FormValues>(['items', 'colCount', 'minColWidth', 'labelMode'], { colCount: 2, labelMode: 'top' }, own.form ?? {});
    this.formSwitches.changed = (name, value, previous) => ev.tell(ev.optionChanged, () => ({ name: `form.${name}`, value, previous }));
    this.popupSwitches = new Switches<PopupValues>(
      ['title', 'showTitle', 'width', 'height', 'resizable', 'movable', 'showCloseButton', 'showMaximize', 'fullScreen'],
      { showTitle: true, resizable: true, movable: true, showCloseButton: true, showMaximize: false, fullScreen: false },
      own.popup ?? {},
    );
    this.popupSwitches.changed = (name, value, previous) => ev.tell(ev.optionChanged, () => ({ name: `popup.${name}`, value, previous }));
    this.builderPopupSwitches = new Switches<PopupValues>(
      ['title', 'showTitle', 'width', 'height', 'resizable', 'movable', 'showCloseButton', 'showMaximize', 'fullScreen'],
      { showTitle: true, resizable: true, movable: true, showCloseButton: true, showMaximize: false, fullScreen: false },
      own.filterBuilderPopup ?? {},
    );
    this.builderPopupSwitches.changed = (name, value, previous) => ev.tell(ev.optionChanged, () => ({ name: `filterBuilderPopup.${name}`, value, previous }));
    this.builderOptions = reactive({ ...(own.filterBuilder ?? {}) }) as GridFilterBuilderOptions;
    this.builderWindow = new FilterBuilderWindow<T>(model, {
      owner: this,
      options: this.builderOptions,
      popup: this.builderPopupSwitches,
      returnFocus: () => this.filterPanel.textButton?.focus(),
    });
    this.filterPanel = new FilterPanel<T>(model, {
      text: () => this.filterText,
      openBuilder: () => this.openFilterBuilder(),
      clear: () => this.clearFilterValue(),
      setEnabled: (on) => (this.filterEnabled = on),
    });
    const lookupTexts = model.lookups.onChanged(() => this.lookupTexts.n++);
    this.motif.setDisposable(() => lookupTexts.dispose());
    this.exportSwitches = new Switches<ExportValues>(['formats', 'allowExportSelectedData', 'texts'], {}, own.export ?? {});
    this.exportSwitches.changed = (name, value, previous) => ev.tell(ev.optionChanged, () => ({ name: `export.${name}`, value, previous }));
    model.details.options.changed = (name, value, previous) => ev.tell(ev.optionChanged, () => ({ name: `masterDetail.${name}`, value, previous }));
    model.adaptive.options.changed = (name, value, previous) => ev.tell(ev.optionChanged, () => ({ name: `adaptiveDetail.${name}`, value, previous }));
    this.topBar = new GridToolbar<T>(
      model,
      this.toolbarSwitches,
      {
        grid: this,
        canExport: () => this.exporter.fields().length > 0,
        exportCommands: () => this.exportCommands(),
        exportName: () => this.exportSwitches.get('texts')?.exportTo ?? model.text('gridExport'),
        openColumns: (anchor) => this.menu.openColumns(anchor),
        hasColumns: () => this.menu.hasColumns(),
        groupPanel: () => this.groupPanel,
        gridId: this.gridId,
        hasBarActions: () => model.actionSets.canShowIn('toolbar'),
        barEntries: () => model.actionSets.barEntries('toolbar'),
        runBarAction: (entry, location) => void this.startEntry(entry, location),
        prepare: (items) => {
          if (!ev.listened(ev.toolbarPreparing)) return items;
          const e = { items: [...items] };
          untracked(() => ev.toolbarPreparing.fire(e));
          return e.items;
        },
      },
      this,
    );
    untracked(() => model.columnWindow.update(model.columns.visible(), 0, 0, [model.state.activeField]));
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
   * The bar above the rows, live: `grid.toolbar.items = ['searchPanel', { text: 'Refresh', click }]`;
   * a function is followed. `visible` left out shows the bar while it has an item.
   */
  get toolbar(): GridToolbarOptions {
    return this.toolbarSwitches.view as GridToolbarOptions;
  }

  /**
   * What the toolbar's export button offers, live: `grid.export.formats = ['xlsx', 'csv']`; a
   * function is followed.
   */
  get export(): GridExportSettings {
    return this.exportSwitches.view as GridExportSettings;
  }

  /** The edit form of `editMode` `'form'` and `'popup'`, live: `grid.form.colCount = 3`; a function is followed. */
  get form(): GridEditForm {
    return this.formSwitches.view as GridEditForm;
  }

  /** The window of `editMode: 'popup'`, live: `grid.popup.width = '40rem'`; a function is followed. */
  get popup(): GridEditPopup {
    return this.popupSwitches.view as GridEditPopup;
  }

  /**
   * One column's own feature switches, live. A value set here wins over `settings`; `undefined`
   * follows `settings` again.
   * @example grid.columnSettings('amount').movable = false;
   */
  columnSettings(field: string): Partial<ColumnFeatures> {
    if (!this.model.columns.isBand(field)) this.model.columns.get(field);
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

  /** The page shown (paged mode), 0-based. Infinite mode: the last part shown; assigning loads the parts up to that one and scrolls to its first row. */
  get page(): number {
    const { model } = this;
    if (model.mode !== 'infinite') return model.state.page;
    const size = model.pageSize;
    return size > 0 ? Math.max(0, Math.ceil(model.data.total / size) - 1) : 0;
  }
  set page(page: number) {
    const { model } = this;
    if (model.mode === 'infinite') {
      const size = model.pageSize;
      const first = Math.max(0, Math.floor(page)) * size;
      void model.loadTo(first + Math.max(1, size)).then(() => {
        if (!this.isDisposed && first < model.data.total) this.scrollToIndex(model.viewOfData(first), 'start');
      });
      return;
    }
    this.dropForm();
    this.leave();
    model.setPage(page);
  }

  /** Pages in paged mode (at least 1); in infinite mode the parts of every row once their count is known, else the parts shown. Reactive. */
  get pageCount(): number {
    return this.model.pageCount();
  }

  /**
   * Infinite mode: shows the next part of the rows (`pageSize` more), after `onMoreRowsLoading`;
   * `false` while the rows load, a part is loading or failed (`retry()`), or every row shows.
   */
  loadMore(): boolean {
    return this.model.loadMore();
  }

  /** Infinite mode: a part of the rows is loading. Reactive. */
  get loadingMore(): boolean {
    void this.model.state.connection;
    return this.model.data.loadingMore;
  }

  /** Every row shows: always outside infinite mode, there once the last part came. Reactive. */
  get endReached(): boolean {
    void this.model.state.connection;
    return this.model.data.ended;
  }

  /** The page shown, 0-based; with a number, goes there (as `page` does). */
  pageIndex(): number;
  pageIndex(page: number): void;
  pageIndex(page?: number): number | void {
    if (page === undefined) return this.page;
    this.page = page;
  }

  /**
   * Rows per page in paged mode, 0 for every row on one page; with a number, shows that many, as the
   * pager's page sizes do (`onPageSizeChanging` may keep the old size): back to the first page, and
   * the size is kept with the layout (`layoutKey`).
   */
  pageSize(): number;
  pageSize(size: number): void;
  pageSize(size?: number): number | void {
    if (size === undefined) return this.model.pageSize;
    if (Math.max(0, Math.floor(size)) === this.model.pageSize) return;
    this.model.setPageSize(size);
  }

  /** Data rows of every page, saved new rows included: the same as `total`. Infinite mode: every matching row once known (counted, or the end reached), -1 until then. Reactive. */
  totalCount(): number {
    const { model } = this;
    if (model.mode !== 'infinite') return this.total;
    const known = model.data.knownCount;
    return known === undefined ? -1 : known + this.savedAdded();
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

  /** Loads the rows again, keeping the position, and the texts of the lookup columns; saved new rows leave the new-row area and take their place among the rows. */
  refresh() {
    this.dropForm();
    this.leave();
    this.model.refreshLookups();
    this.model.data.refresh();
  }

  /** Forgets the texts of the lookup columns and asks for the ones on the screen again. */
  refreshLookups() {
    this.model.refreshLookups();
  }

  /** Raised before a cell editor is made: change its props (`e.options`), or `e.cancel` the edit. */
  get onEditorPreparing(): MotifEvent<GridEditorPreparingEventArgs<T>> {
    return this.on(this.model.events.editorPreparing);
  }

  /** Loads what failed to load again; in infinite mode a part that failed, after `onMoreRowsLoading`. */
  retry() {
    const { model } = this;
    const data = model.data;
    const ev = model.events;
    if (data.moreFailed && !ev.ask(ev.moreRowsLoading, () => ({ skip: data.total, take: data.pageSize, cancel: false }))) return;
    data.retry();
  }

  /** Scrolls row `index` into view (in paged mode, goes to its page). New rows count as rows. */
  scrollToIndex(index: number, align: 'nearest' | 'start' | 'end' = 'start') {
    const i = Math.max(0, Math.min(this.model.count - 1, Math.floor(index)));
    if (i >= 0) this.body.reveal(i, align);
  }

  /** Fits every visible, resizable column to its header and the rows shown. */
  autoSizeColumns() {
    // Virtual columns: every column gets its cells while they are measured.
    const drawn = this.model.columnWindow;
    drawn.everything = true;
    this.updateColumns();
    for (const field of this.model.columns.visible()) {
      if (this.model.columns.can(field, 'resizable')) this.autoSize(field, true);
    }
    drawn.everything = false;
    this.updateColumns();
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
    if (this.formEdit && !this.cancelForm(false)) return Promise.resolve(false);
    const pending = this.pendingInvalid;
    if (pending && pending !== model.state.session && hasKeys(model.edit(pending)?.errors ?? {})) {
      this.focusError(pending, this.firstErrorField(pending));
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      this.leaveRowThen(
        () => {
          const top = model.newRowPosition === 'top';
          const i = model.insertAdded(top ? 0 : model.addedRows.length, values);
          if (i >= 0) this.openNewRow(i, top ? 'start' : 'end');
          resolve(i >= 0);
        },
        () => resolve(false),
      );
    });
  }

  /**
   * Deletes a row (default: the active one) as the save mode says: `batch` marks it until
   * `saveChanges()`, `wait` sends it and resolves when the answer is in, `background` sends it
   * through the queue. A new row never saved is just dropped. With `confirmDelete` (and not in batch
   * mode) the user is asked first. Resolves to `false` when it failed or was not confirmed.
   */
  deleteRow(row?: T): Promise<boolean> {
    const target = this.locate(row);
    return target ? this.deleteRows([target.obj]) : Promise.resolve(false);
  }

  /**
   * Deletes several rows in one save, as `deleteRow` does one: in `wait` and `background` they are
   * sent together, in one request when the adapter saves in batches. The user is asked once.
   * Resolves to `false` when a row failed or the deletion was not confirmed.
   */
  async deleteRows(rows: readonly T[]): Promise<boolean> {
    const { model } = this;
    const saved = rows.filter((row) => !model.isNew(this.locate(row)!.rowId)).length;
    if (saved && !(await this.askDelete(saved))) return false;
    const targets = rows.map((row) => this.locate(row)!);
    for (const { rowId } of targets) {
      if (this.formEdit?.rowId === rowId) this.closeForm(false);
      if (model.state.session === rowId) {
        this.closeEditor();
        model.setSession(null);
      }
    }
    return model.removeRows(targets.map(({ rowId, obj, index }) => ({ rowId, row: obj, index: index >= 0 ? model.dataIndex(index) : -1 })));
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
    if (this.formEdit && !(await this.saveForm())) return { saved: 0, failed: 1 };
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
    const rows = this.model.data.tracker.pendingRows();
    if (!this.canDrop(rows)) return;
    this.closeForm(false);
    this.closeEditor();
    this.model.setSession(null);
    this.pendingInvalid = null;
    this.model.discardChanges();
    this.focusActive(false);
    this.dropped(rows);
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

  // Events (names; `onKeyHandling` is its `onKeyDown`, a DOM event name in JSX).

  private on<A>(emitter: Emitter<A>): MotifEvent<A> {
    return this.model.events.event(emitter);
  }

  /** Raised after an editor was made, in a cell or in the edit form. */
  get onEditorPrepared(): MotifEvent<GridEditorPreparedEventArgs<T>> {
    return this.on(this.model.events.editorPrepared);
  }

  /** Raised when a row is checked before it is saved: add messages to `e.errors`, or `e.isValid = false`. */
  get onRowValidating(): MotifEvent<GridRowValidatingEventArgs<T>> {
    return this.on(this.model.events.rowValidating);
  }

  /** Raised when a cell is clicked: `e.cancel` stops what the grid does with it (select, open or close a group, edit). */
  get onCellClick(): MotifEvent<GridCellClickEventArgs<T>> {
    return this.on(this.model.events.cellClick);
  }

  /** Raised when a cell is double-clicked: `e.cancel` keeps its editor closed. */
  get onCellDblClick(): MotifEvent<GridCellClickEventArgs<T>> {
    return this.on(this.model.events.cellDblClick);
  }

  /** Raised when a row is clicked, after its cell's event: `e.cancel` stops what the grid does with it. */
  get onRowClick(): MotifEvent<GridRowClickEventArgs<T>> {
    return this.on(this.model.events.rowClick);
  }

  /** Raised when a row is double-clicked: `e.cancel` keeps the editor closed. */
  get onRowDblClick(): MotifEvent<GridRowClickEventArgs<T>> {
    return this.on(this.model.events.rowDblClick);
  }

  /** Raised when a cell is drawn for a row: style it. The element is reused; set and clear what you change. */
  get onCellPrepared(): MotifEvent<GridCellPreparedEventArgs<T>> {
    return this.on(this.model.events.cellPrepared);
  }

  /** Raised when a row is drawn: style it. The element is reused; set and clear what you change. */
  get onRowPrepared(): MotifEvent<GridRowPreparedEventArgs<T>> {
    return this.on(this.model.events.rowPrepared);
  }

  /** Raised when rows arrived and are laid out. */
  get onContentReady(): MotifEvent<GridContentReadyEventArgs> {
    return this.on(this.model.events.contentReady);
  }

  /** Raised when loading or saving fails. */
  get onDataErrorOccurred(): MotifEvent<GridDataErrorEventArgs<T>> {
    return this.on(this.model.events.dataErrorOccurred);
  }

  /** Raised before a cell editor opens: `e.cancel` keeps it closed. */
  get onEditingStart(): MotifEvent<GridEditingStartEventArgs<T>> {
    return this.on(this.model.events.editingStart);
  }

  /** Raised before a new row opens: change `e.data` or `e.values`, or `e.cancel`. */
  get onInitNewRow(): MotifEvent<GridInitNewRowEventArgs<T>> {
    return this.on(this.model.events.initNewRow);
  }

  /** Raised before changes are sent: `e.cancel` keeps them unsent. */
  get onSaving(): MotifEvent<GridSavingEventArgs<T>> {
    return this.on(this.model.events.saving);
  }

  /** Raised when the answer to a save came. */
  get onSaved(): MotifEvent<GridSavedEventArgs<T>> {
    return this.on(this.model.events.saved);
  }

  /** Raised before a new row is sent: change `e.data`, or `e.cancel`. */
  get onRowInserting(): MotifEvent<GridRowInsertingEventArgs<T>> {
    return this.on(this.model.events.rowInserting);
  }

  /** Raised when a new row was saved. */
  get onRowInserted(): MotifEvent<GridRowInsertedEventArgs<T>> {
    return this.on(this.model.events.rowInserted);
  }

  /** Raised before a row's changes are sent: change `e.changes`, or `e.cancel`. */
  get onRowUpdating(): MotifEvent<GridRowUpdatingEventArgs<T>> {
    return this.on(this.model.events.rowUpdating);
  }

  /** Raised when a row's changes were saved. */
  get onRowUpdated(): MotifEvent<GridRowUpdatedEventArgs<T>> {
    return this.on(this.model.events.rowUpdated);
  }

  /** Raised before a row's deletion is sent: `e.cancel` keeps the row. */
  get onRowRemoving(): MotifEvent<GridRowRemovingEventArgs<T>> {
    return this.on(this.model.events.rowRemoving);
  }

  /** Raised when a row was deleted on the backend. */
  get onRowRemoved(): MotifEvent<GridRowRemovedEventArgs<T>> {
    return this.on(this.model.events.rowRemoved);
  }

  /** Raised before unsaved changes are dropped: `e.cancel` keeps them. */
  get onEditCanceling(): MotifEvent<GridEditCancelingEventArgs<T>> {
    return this.on(this.model.events.editCanceling);
  }

  /** Raised when unsaved changes were dropped. */
  get onEditCanceled(): MotifEvent<GridEditCanceledEventArgs<T>> {
    return this.on(this.model.events.editCanceled);
  }

  /** Raised before the active cell moves: `e.cancel` keeps it. */
  get onFocusedCellChanging(): MotifEvent<GridFocusedCellChangingEventArgs<T>> {
    return this.on(this.model.events.focusedCellChanging);
  }

  /** Raised when the active cell moved. */
  get onFocusedCellChanged(): MotifEvent<GridFocusedCellChangedEventArgs<T>> {
    return this.on(this.model.events.focusedCellChanged);
  }

  /** Raised before the active row changes: `e.cancel` keeps it. */
  get onFocusedRowChanging(): MotifEvent<GridFocusedRowChangingEventArgs<T>> {
    return this.on(this.model.events.focusedRowChanging);
  }

  /** Raised when the active row changed. */
  get onFocusedRowChanged(): MotifEvent<GridFocusedRowChangedEventArgs<T>> {
    return this.on(this.model.events.focusedRowChanged);
  }

  /** Raised when a key goes down in the grid, before the grid handles it: `e.cancel` stops the grid's handling. */
  get onKeyHandling(): MotifEvent<GridKeyHandlingEventArgs> {
    return this.on(this.model.events.keyHandling);
  }

  /** Raised when a setting of the grid, a column or the toolbar is assigned. */
  get onOptionChanged(): MotifEvent<GridOptionChangedEventArgs> {
    return this.on(this.model.events.optionChanged);
  }

  /** Raised before an export starts: change `e.options`, or `e.cancel`. */
  get onExporting(): MotifEvent<GridExportingEventArgs> {
    return this.on(this.model.events.exporting);
  }

  /** Raised when an export finished. */
  get onExported(): MotifEvent<GridExportedEventArgs> {
    return this.on(this.model.events.exported);
  }

  /** Raised before a column menu or a row menu opens: change `e.items`, or `e.cancel`. */
  get onContextMenuPreparing(): MotifEvent<GridContextMenuPreparingEventArgs<T>> {
    return this.on(this.model.events.contextMenuPreparing);
  }

  /** Raised when the toolbar is laid out: change `e.items`. */
  get onToolbarPreparing(): MotifEvent<GridToolbarPreparingEventArgs> {
    return this.on(this.model.events.toolbarPreparing);
  }

  /** Raised before the sort changes: `e.cancel` keeps it. */
  get onSortChanging(): MotifEvent<GridSortChangingEventArgs> {
    return this.on(this.model.events.sortChanging);
  }

  /** Raised when the sort changed. */
  get onSortChanged(): MotifEvent<GridSortChangedEventArgs> {
    return this.on(this.model.events.sortChanged);
  }

  /** Raised before the filters apply: `e.cancel` puts the ones before back. */
  get onFilterChanging(): MotifEvent<GridFilterChangingEventArgs> {
    return this.on(this.model.events.filterChanging);
  }

  /** Raised when the filters applied. */
  get onFilterChanged(): MotifEvent<GridFilterChangedEventArgs> {
    return this.on(this.model.events.filterChanged);
  }

  /** Raised before another page shows: `e.cancel` stays. */
  get onPageChanging(): MotifEvent<GridPageChangingEventArgs> {
    return this.on(this.model.events.pageChanging);
  }

  /** Raised when another page shows. */
  get onPageChanged(): MotifEvent<GridPageChangedEventArgs> {
    return this.on(this.model.events.pageChanged);
  }

  /** Raised before the rows per page change (the pager's page sizes, `pageSize(n)`): `e.cancel` keeps them. */
  get onPageSizeChanging(): MotifEvent<GridPageSizeChangingEventArgs> {
    return this.on(this.model.events.pageSizeChanging);
  }

  get onPageSizeChanged(): MotifEvent<GridPageSizeChangedEventArgs> {
    return this.on(this.model.events.pageSizeChanged);
  }

  /** Infinite mode: raised before the next part of the rows loads (the view nears the end, `loadMore()`, Ctrl+End): `e.cancel` keeps the rows as they are. */
  get onMoreRowsLoading(): MotifEvent<GridMoreRowsLoadingEventArgs> {
    return this.on(this.model.events.moreRowsLoading);
  }

  /** Infinite mode: raised when a part of the rows came. */
  get onMoreRowsLoaded(): MotifEvent<GridMoreRowsLoadedEventArgs> {
    return this.on(this.model.events.moreRowsLoaded);
  }

  /** Raised before a layout change by the user is kept: `e.cancel` puts the one before back. */
  get onLayoutChanging(): MotifEvent<GridLayoutChangingEventArgs> {
    return this.on(this.model.events.layoutChanging);
  }

  /** Raised after the user changed the layout. */
  get onLayoutChange(): MotifEvent<GridLayout> {
    return this.on(this.model.events.layoutChanged);
  }

  /** Raised before cells go to the clipboard: change `e.text` / `e.html`, or `e.cancel`. */
  get onCopying(): MotifEvent<GridCopyingEventArgs> {
    return this.on(this.model.events.copying);
  }

  /** Raised before text is pasted: change `e.text`, or `e.cancel`. */
  get onPasting(): MotifEvent<GridPastingEventArgs> {
    return this.on(this.model.events.pasting);
  }

  // State and rows from code.

  /** `'loading'` until the rows arrive (again after a new query), `'error'` when the load failed, else `'ready'`. Reactive. */
  get status(): 'loading' | 'ready' | 'error' {
    return this.model.state.status;
  }

  /** The error of the last load, or `null`. Reactive. */
  get loadError(): data.DataError | null {
    void this.model.state.status;
    void this.model.state.failedBlocks;
    return this.model.data.source.error;
  }

  /** Blocks of rows that failed to load after the first answer; `retry()` loads them again. Reactive. */
  get failedBlocks(): number {
    return this.model.state.failedBlocks;
  }

  /** The cell whose editor is open, or `null`. Reactive. */
  get editingCell(): GridEditingCell<T> | null {
    const editing = this.model.state.editing;
    const at = this.editTarget;
    if (!editing || !at) return null;
    return { rowIndex: this.model.indexOfKey(at.rowId, this.model.state.activeRow), field: editing.field, row: at.row };
  }

  /** A row is being saved and the grid waits for it (`wait` mode); keys and clicks wait too. Reactive. */
  get saving(): boolean {
    return this.model.state.busy;
  }

  /** An export is running. Reactive. */
  get exporting(): boolean {
    return this.model.state.exporting;
  }

  /** The active row's index (new rows count; -1 the header, -2 the filter row). Assigning moves there. */
  get focusedRowIndex(): number {
    return this.model.state.activeRow;
  }
  set focusedRowIndex(index: number) {
    this.focusCell(index);
  }

  /** The active row's key; `undefined` on the header, a group row or a new row. Assigning goes to the row with that key, when it is loaded. */
  get focusedRowKey(): unknown {
    return this.getKeyByRowIndex(this.model.state.activeRow);
  }
  set focusedRowKey(key: unknown) {
    void this.navigateToRow(key);
  }

  /** The rows drawn now (the ones in view, and the active one wherever it is), in order. */
  getVisibleRows(): GridVisibleRow<T>[] {
    const { model } = this;
    const rows: GridVisibleRow<T>[] = this.body.drawn().map(({ index, element, group }) => ({
      rowIndex: index,
      rowType: this.rowTypeOf(index),
      row: group ? undefined : model.rowAt(index),
      key: this.getKeyByRowIndex(index),
      groupKey: group ? [...group.path] : undefined,
      element,
    }));
    // A row's details come right after it, with its index and key.
    for (const d of this.body.drawnDetails()) rows.push({ rowIndex: d.index, rowType: d.kind === 'adaptive' ? 'detailAdaptive' : 'detail', row: d.row, key: d.key, element: d.element });
    const order = (type: GridRowType) => (type === 'detailAdaptive' ? 1 : type === 'detail' ? 2 : 0);
    return rows.sort((a, b) => a.rowIndex - b.rowIndex || order(a.rowType) - order(b.rowType));
  }

  /** The element of grid row `rowIndex` while it is drawn. */
  getRowElement(rowIndex: number): HTMLElement | undefined {
    return this.body.rowAt(rowIndex)?.element ?? this.body.groupRowAt(rowIndex)?.element ?? this.body.footerRowAt(rowIndex)?.element;
  }

  /** The element of a cell while its row is drawn; a group row's one cell for any field. */
  getCellElement(rowIndex: number, field: string): HTMLElement | undefined {
    return this.body.cellElement(rowIndex, field);
  }

  /** The key of grid row `rowIndex`; `undefined` for a new row, a group row, the header or a row still loading. */
  getKeyByRowIndex(rowIndex: number): unknown {
    const { model } = this;
    if (rowIndex < 0 || model.groupAt(rowIndex)) return undefined;
    const row = model.rowAt(rowIndex);
    if (row === undefined || model.isNew(model.rowIdAt(rowIndex))) return undefined;
    const adapter = model.data.source.adapter;
    return adapter.keys.hasKey(row) ? adapter.keyOf(row) : undefined;
  }

  /** The grid index of the row with this key while it is loaded (rows in memory: always), else -1. */
  getRowIndexByKey(key: unknown): number {
    const row = this.model.data.rowByKey(key);
    return row === undefined ? -1 : this.model.indexOfRow(row);
  }

  /** The row with this key: a loaded one, one found before, or asked of the data source. */
  byKey(key: unknown): Promise<T | undefined> {
    return this.model.data.source.byKey(key);
  }

  /**
   * The value a cell shows (its unsaved edit when there is one). With `value`, writes it as the user
   * would: into the row's draft, checked, and sent as the save mode says (batch: on `saveChanges()`).
   */
  cellValue(rowIndex: number, field: string, value?: unknown): unknown {
    const { model } = this;
    const row = rowIndex >= 0 ? model.rowAt(rowIndex) : undefined;
    const rowId = rowIndex >= 0 ? model.rowIdAt(rowIndex) : undefined;
    const col = model.columns.get(field);
    if (row === undefined || rowId === undefined || model.groupAt(rowIndex)) return undefined;
    if (arguments.length < 3) return model.value(rowId, row, col);
    model.writeCell(rowId, row, field, value, model.dataIndex(rowIndex));
    if (model.state.session !== rowId && model.saveMode !== 'batch' && model.hasPending(rowId) && model.validate(rowId) === null) void model.commit(rowId);
    return value;
  }

  /**
   * Goes to the row with this key (its page in paged mode) and makes it the active row; focus moves
   * along only while the grid has it. Resolves to whether the row was found among the loaded rows.
   */
  navigateToRow(key: unknown): Promise<boolean> {
    const i = this.getRowIndexByKey(key);
    if (i < 0) return Promise.resolve(false);
    const field = this.model.state.activeField;
    if (this.focusWithin) return Promise.resolve(this.navigate(i, field));
    if (!this.canMoveTo(i, field)) return Promise.resolve(false);
    this.setActive(i, field);
    this.body.reveal(i);
    this.syncTabStop();
    return Promise.resolve(true);
  }

  /** Moves the active cell and focus to a cell, as the arrow keys do (leaving an edited row saves it first). Returns whether it moved. */
  focusCell(rowIndex: number, field: string = this.model.state.activeField): boolean {
    return this.navigate(rowIndex, field);
  }

  /** Opens a cell's editor, as Enter does. Returns whether the move to it could start. */
  editCell(rowIndex: number, field: string): boolean {
    return this.navigate(rowIndex, field, { edit: true });
  }

  /** Opens the editor of a row's first cell the user can fill; with `editMode` `'form'` or `'popup'`, the row's edit form. */
  editRow(rowIndex: number): boolean {
    const field = this.editableFields(rowIndex)[0];
    return field !== undefined && this.navigate(rowIndex, field, { edit: true });
  }

  /** `editRow` for the row with this key, while it is loaded. */
  editRowByKey(key: unknown): boolean {
    const i = this.getRowIndexByKey(key);
    return i >= 0 && this.editRow(i);
  }

  /**
   * Saves what is being edited, as Save does: the edit form, else the row being edited (as the save
   * mode says); in batch mode every unsaved change (`saveChanges()`). Resolves to whether it worked.
   */
  async saveEditData(): Promise<boolean> {
    const { model } = this;
    if (this.formEdit && !(await this.saveForm())) return false;
    if (model.saveMode === 'batch') return (await this.saveChanges()).failed === 0;
    if (!model.state.session && !this.editor) return true;
    return new Promise((resolve) => {
      this.leaveRowThen(
        () => resolve(true),
        () => resolve(false),
      );
    });
  }

  /** Gives up what is being edited, as Cancel does: the edit form or the row being edited; in batch mode every unsaved change (`discardChanges()`). */
  cancelEditData() {
    const { model } = this;
    if (this.formEdit) {
      this.cancelForm(true);
      return;
    }
    if (model.saveMode === 'batch') {
      this.discardChanges();
      return;
    }
    const rec = model.edit(model.state.session ?? undefined);
    if (rec) this.cancelRow(rec.row);
    else this.closeEditor();
  }

  /**
   * Keeps the open editor's value and closes it (the row stays the edited one until it is left; in
   * `'cell'` mode it is saved). In the edit form, keeps every field's value. `false` when a value cannot be read.
   */
  closeEditCell(): boolean {
    if (this.formEdit) return this.formEdit.form.keepAll() === null;
    if (!this.editor) return true;
    const ok = this.commitEditor();
    if (ok) {
      this.focusActive(false);
      this.saveCell();
    }
    return ok;
  }

  /** Starts changes made from code together: the rows are laid out once, at the last `endUpdate()`. */
  beginUpdate() {
    this.updates++;
  }

  endUpdate() {
    if (this.updates === 0 || --this.updates > 0 || !this.relayoutWaiting) return;
    this.relayoutWaiting = false;
    this.layOut();
  }

  /** Draws the rows on the screen again (after the app changed what a template or `onRowPrepared` reads), without loading. */
  repaint() {
    this.body.repaint();
  }

  /** The whole filter of the rows: the source's own, the filter row, the header filters and the search. Reactive. */
  getCombinedFilter(): data.FilterExpression | null {
    return this.model.filter;
  }

  // Columns at run time.

  /**
   * Adds a column, at `index` among the data columns (default: last), as the user would see it after
   * the ones given: its width, visibility and sticky side, or what the kept layout says of it; its
   * `groupIndex` groups the rows by it. A band comes with its columns; a column with `ownerBand`
   * goes into that band. The layout and the kept layout follow.
   */
  addColumn(column: GridColumnItem<T>, index?: number) {
    const { model } = this;
    const previous = model.columnFields();
    this.dropForm();
    for (const field of model.addColumn(column, index)) {
      this.placeColumn(field);
      this.watchColumn(model.columns.get(field));
    }
    model.keepLayout();
    model.events.tell(model.events.optionChanged, () => ({ name: 'columns', value: model.columnFields(), previous }));
  }

  /** Takes a column out: its sort, grouping and filter go with it (without `…Changing` events), and the layout follows. */
  deleteColumn(field: string) {
    const { model } = this;
    const cols = model.columns;
    if (!cols.defs.has(field) || cols.isInternal(field)) return;
    const previous = model.columnFields();
    this.dropForm();
    if (this.editTarget?.field === field) this.closeEditor();
    if (this.headerFilter.opened) this.headerFilter.close();
    if (this.menu.opened) this.menu.close();
    this.stopWatching(field);
    model.forgetColumn(field);
    this.removeCells(field);
    model.removeColumn(field);
    model.keepLayout();
    model.events.tell(model.events.optionChanged, () => ({ name: 'columns', value: model.columnFields(), previous }));
  }

  /** The data columns, the hidden ones too. */
  columnCount(): number {
    return this.model.columnFields().length;
  }

  /** The definitions of the data columns shown now, in display order, those the width hides too (`adaptiveHiddenColumns`). Reactive. */
  getVisibleColumns(): GridColumn<T>[] {
    const cols = this.model.columns;
    return cols.listedData().map((field) => cols.get(field));
  }

  /**
   * An option of a column, read or written: its layout (`width`, `visible` or `hidden`, `flex`,
   * `sticky`, `visibleIndex` among the visible columns), sort (`sortOrder`, `sortIndex`),
   * `groupIndex`, its header filter (`filterValues`, `filterType`), a feature switch (`sortable`,
   * `resizable` …, as `columnSettings` has them) or any other field of its definition (`title`,
   * `format`, `lookup`, `cell` …; the column is drawn again with it). Without a name: all of them.
   * An object sets several at once.
   */
  columnOption(field: string): Record<string, unknown>;
  columnOption(field: string, name: ColumnOptionName): unknown;
  columnOption(field: string, name: ColumnOptionName, value: unknown): void;
  columnOption(field: string, options: Partial<Record<ColumnOptionName, unknown>>): void;
  columnOption(field: string, name?: ColumnOptionName | Partial<Record<ColumnOptionName, unknown>>, value?: unknown): unknown {
    const { model } = this;
    const cols = model.columns;
    if (cols.isBand(field)) return this.bandOption(field, name, value, arguments.length);
    const def = cols.get(field);
    if (cols.isInternal(field)) throw new Error(`[motifx-ui] DataGrid: "${field}" is the grid's own column`);
    const features = COLUMN_FEATURES as readonly string[];
    const read = (n: ColumnOptionName): unknown => {
      switch (n) {
        case 'width':
          return cols.width(field);
        case 'visible':
          return !cols.state.hidden[field];
        case 'hidden':
          return !!cols.state.hidden[field];
        case 'flex':
          return cols.state.flex[field] ?? 0;
        case 'sticky':
          return cols.state.sticky[field] ?? null;
        case 'visibleIndex':
          return cols.shownBeside(field).indexOf(field);
        case 'sortOrder':
          return model.state.sort.find((s) => s.field === field)?.dir ?? null;
        case 'sortIndex':
          return model.state.sort.findIndex((s) => s.field === field);
        case 'groupIndex':
          return model.groups.fields().indexOf(field);
        case 'filterValues':
          return model.filters.get(field)?.values;
        case 'filterType':
          return model.filters.get(field)?.filterType ?? 'include';
        case 'title':
          return cols.title(field);
        default:
          if (features.includes(n)) return cols.features.get(field)!.own(n as keyof ColumnFeatures) ?? model.settings.get(n as keyof ColumnFeatures);
          return (cols.get(field) as unknown as Record<string, unknown>)[n];
      }
    };
    if (name === undefined) {
      const names: ColumnOptionName[] = ['width', 'visible', 'flex', 'sticky', 'visibleIndex', 'sortOrder', 'sortIndex', 'groupIndex', 'filterValues', 'filterType', 'title', ...COLUMN_FEATURES];
      return { ...(def as unknown as Record<string, unknown>), ...Object.fromEntries(names.map((n) => [n, read(n)])) };
    }
    if (typeof name === 'object') {
      // The definition first, in one go; then the rest in the order given.
      const own = Object.entries(name).filter(([n]) => !COLUMN_STATE.has(n) && !features.includes(n));
      if (own.length) this.changeDefinition(field, Object.fromEntries(own));
      for (const [n, v] of Object.entries(name)) if (COLUMN_STATE.has(n) || features.includes(n)) this.columnOption(field, n as ColumnOptionName, v);
      return;
    }
    if (arguments.length < 3) return read(name);
    if (!COLUMN_STATE.has(name) && !features.includes(name)) {
      this.changeDefinition(field, { [name]: value });
      return;
    }
    const previous = read(name);
    switch (name) {
      case 'width':
        cols.resize(field, Number(value));
        break;
      case 'visible':
      case 'hidden':
        cols.setHidden(field, name === 'visible' ? !value : !!value);
        model.keepActiveFieldVisible();
        break;
      case 'flex':
        cols.state.flex[field] = Math.max(0, Number(value) || 0);
        break;
      case 'sticky':
        cols.setSticky(field, (value as 'start' | 'end' | null) ?? null);
        break;
      case 'visibleIndex': {
        const target = cols.shownBeside(field)[Number(value)];
        if (target !== undefined && cols.zoneOf(target) === cols.zoneOf(field)) cols.move(field, cols.siblings(field).indexOf(target));
        break;
      }
      case 'sortOrder':
      case 'sortIndex': {
        const sort = model.state.sort.map((s) => ({ ...s }));
        const at = sort.findIndex((s) => s.field === field);
        const dir = name === 'sortOrder' ? (value as 'asc' | 'desc' | null) : (sort[at]?.dir ?? 'asc');
        if (at >= 0) sort.splice(at, 1);
        const to = name === 'sortIndex' ? Number(value) : at;
        if (dir && !(name === 'sortIndex' && to < 0)) sort.splice(to < 0 ? sort.length : Math.min(to, sort.length), 0, { field, dir });
        model.setSort(sort);
        break;
      }
      case 'groupIndex':
        if (typeof value === 'number' && value >= 0) model.groupBy(field, value);
        else model.ungroup(field);
        break;
      case 'filterValues':
        model.setFilterValues(field, (value as readonly unknown[] | null | undefined) ?? undefined, model.filters.get(field)?.filterType);
        break;
      case 'filterType':
        model.setFilterValues(field, model.filters.get(field)?.values, value === 'exclude' ? 'exclude' : 'include');
        break;
      default:
        (this.columnSettings(field) as Record<string, unknown>)[name] = value;
        return;
    }
    model.keepLayout();
    model.events.tell(model.events.optionChanged, () => ({ name, field, value: read(name), previous }));
  }

  /** `columnOption` of a band: `visible` / `hidden`, `sticky`, `visibleIndex` among the columns and bands beside it, `title`, its feature switches. */
  private bandOption(id: string, name: ColumnOptionName | Partial<Record<ColumnOptionName, unknown>> | undefined, value: unknown, given: number): unknown {
    const { model } = this;
    const cols = model.columns;
    const features = COLUMN_FEATURES as readonly string[];
    const def = cols.bands.get(id)!.def as unknown as Record<string, unknown>;
    const read = (n: string): unknown => {
      switch (n) {
        case 'visible':
          return !cols.state.hidden[id];
        case 'hidden':
          return !!cols.state.hidden[id];
        case 'sticky':
          return cols.sideOf(id);
        case 'visibleIndex':
          return cols.shownBeside(id).indexOf(id);
        case 'title':
          return cols.title(id);
        default:
          return features.includes(n) ? (cols.features.get(id)!.own(n as keyof ColumnFeatures) ?? model.settings.get(n as keyof ColumnFeatures)) : def[n];
      }
    };
    if (name === undefined) return { ...def, ...Object.fromEntries(['visible', 'sticky', 'visibleIndex', 'title', 'movable', 'hideable', 'pinnable', 'menu'].map((n) => [n, read(n)])) };
    if (typeof name === 'object') {
      for (const [n, v] of Object.entries(name)) this.bandOption(id, n as ColumnOptionName, v, 3);
      return;
    }
    if (given < 3) return read(name);
    const previous = read(name);
    switch (name) {
      case 'visible':
      case 'hidden':
        cols.setHidden(id, name === 'visible' ? !value : !!value);
        model.keepActiveFieldVisible();
        break;
      case 'sticky':
        cols.setSticky(id, (value as 'start' | 'end' | null) ?? null);
        break;
      case 'visibleIndex': {
        const target = cols.shownBeside(id)[Number(value)];
        if (target !== undefined && cols.zoneOf(target) === cols.zoneOf(id)) cols.move(id, cols.siblings(id).indexOf(target));
        break;
      }
      default:
        if (!features.includes(name)) throw new Error(`[motifx-ui] DataGrid: a band has no option "${name}"`);
        (this.columnSettings(id) as Record<string, unknown>)[name] = value;
        return;
    }
    model.keepLayout();
    model.events.tell(model.events.optionChanged, () => ({ name, field: id, value: read(name), previous }));
  }

  /** Other fields of a column's definition: the column is made again with them, its layout, sort and filter kept. */
  private changeDefinition(field: string, change: Record<string, unknown>) {
    const { model } = this;
    const cols = model.columns;
    if ('field' in change && change.field !== field) throw new Error(`[motifx-ui] DataGrid: the field of column "${field}" cannot change`);
    const before = cols.get(field) as unknown as Record<string, unknown>;
    const previous = Object.fromEntries(Object.keys(change).map((n) => [n, n === 'title' ? cols.title(field) : before[n]]));
    this.dropForm();
    if (this.editTarget?.field === field) this.closeEditor();
    const next = { ...before, ...change } as unknown as GridColumn<T>;
    cols.replace(next);
    // Only the title is followed where it shows; anything else makes the column's cells again.
    if (Object.keys(change).some((n) => n !== 'title')) {
      this.removeCells(field);
      this.placeColumn(field);
      if (cols.state.width[field] !== undefined) cols.state.width[field] = cols.clampWidth(field, cols.state.width[field]);
      if (Object.keys(change).some((n) => COLUMN_DATA.has(n))) model.columnReadChanged(field);
      this.body.repaint();
    }
    this.stopWatching(field);
    this.watchColumn(next);
    for (const n of Object.keys(change)) model.events.tell(model.events.optionChanged, () => ({ name: n, field, value: n === 'title' ? cols.title(field) : change[n], previous: previous[n] }));
  }

  /** A column's cells in every row, header and bar. */
  private placeColumn(field: string) {
    this.header.addColumn(field);
    this.filterRow.addColumn(field);
    this.body.addColumn(field);
    this.totalRow.addColumn(field);
  }

  private removeCells(field: string) {
    this.header.removeColumn(field);
    this.filterRow.removeColumn(field);
    this.body.removeColumn(field);
    this.totalRow.removeColumn(field);
  }

  /**
   * Follows a column's own functions: a new `groupIndex` moves the column in the grouping, none
   * ungroups it; new `filterValues` or `filterType` filter it again.
   */
  private watchColumn(col: GridColumn<T>) {
    const { model } = this;
    const stops: (() => void)[] = [];
    const follow = <V,>(get: () => V, apply: (value: V) => void) => {
      let first = true;
      stops.push(
        effect(() => {
          const value = get();
          if (first) {
            first = false;
            return;
          }
          untracked(() => apply(value));
        }),
      );
    };
    const index = col.groupIndex;
    if (typeof index === 'function') {
      follow(index, (at) => {
        if (typeof at === 'number' && at >= 0) model.groupBy(col.field, at);
        else model.ungroup(col.field);
      });
    }
    if (typeof col.filterValues === 'function' || typeof col.filterType === 'function') {
      follow(
        () => {
          const values = read(col.filterValues);
          return { values: values ? [...values] : undefined, type: read(col.filterType) };
        },
        ({ values, type }) => model.setFilterValues(col.field, values, type),
      );
    }
    if (stops.length) this.columnWatches.set(col.field, stops);
  }

  private stopWatching(field: string) {
    for (const stop of this.columnWatches.get(field) ?? []) stop();
    this.columnWatches.delete(field);
  }

  /** What the user set up: the layout (columns, sort, grouping), filters, search text, page and page size, selection and active row. */
  state(): GridStateValue;
  /** Puts a state back (parts left out stay as they are). */
  state(value: Partial<GridStateValue>): void;
  state(value?: Partial<GridStateValue>): GridStateValue | void {
    if (value === undefined) {
      return {
        ...this.layout,
        filters: this.filters,
        filterValue: this.filterValue,
        filterEnabled: this.filterEnabled,
        searchText: this.searchText,
        page: this.page,
        pageSize: this.pageSize(),
        selectedKeys: this.selectedKeys,
        focusedRowKey: this.focusedRowKey,
      };
    }
    if (value.columns) this.layout = { columns: value.columns, sort: value.sort ?? this.sort, group: value.group };
    else {
      if (value.sort) this.sort = value.sort;
      if (value.group) this.group = value.group;
    }
    if (value.filters) this.filters = value.filters;
    if (value.filterValue !== undefined) this.filterValue = value.filterValue;
    if (value.filterEnabled !== undefined) this.filterEnabled = value.filterEnabled;
    if (value.searchText !== undefined) this.searchByText(value.searchText);
    if (value.selectedKeys) this.selectedKeys = value.selectedKeys;
    if (value.pageSize !== undefined) this.pageSize(value.pageSize);
    if (value.page !== undefined) this.page = value.page;
    if (value.focusedRowKey !== undefined) void this.navigateToRow(value.focusedRowKey);
  }

  // Actions.

  /** The grid's ready actions, to put in `actions` or to call: `grid.actions.remove`. */
  get actions(): GridBuiltInActions<T> {
    return this.builtIns;
  }

  /**
   * The rows the toolbar's and the bottom bar's actions act on now (`actionsTarget`): the selected
   * rows or the active one. Empty for nothing, and for a selection whose rows are not loaded (read
   * `selection` then). Reactive.
   */
  get actionTargets(): T[] {
    const target = this.model.actionSets.target();
    return target.kind === 'rows' ? [...target.rows] : [];
  }

  /** The actions the toolbar and the bottom bar show now, for those rows. Reactive. */
  get barActions(): GridBarAction<T>[] {
    const sets = this.model.actionSets;
    return (['toolbar', 'bottom'] as const).flatMap((location) =>
      sets.barEntries(location).map((e) => ({ action: e.action, location, text: e.text, count: e.count, disabled: e.disabled, rows: e.items.map((it) => it.row) })),
    );
  }

  /**
   * Runs an action from code, as a press does: on `rows`, or on the rows the bars act on now. Rows
   * share an action by its `id`; it runs only where it is visible and enabled for them. Resolves to
   * the outcome, or `null` when the action is not there or `onActionRunning` cancelled it.
   */
  runAction(id: string, rows?: readonly T[]): Promise<GridActionRanEventArgs<T> | null> {
    const sets = this.model.actionSets;
    const target: ActionTarget<T> = rows ? (rows.length ? { kind: 'rows', rows: [...rows], from: 'focused' } : { kind: 'none' }) : sets.target();
    const entry = untracked(() => sets.entries(target, () => true).find((e) => e.action.id === id));
    return entry ? this.startEntry(entry, 'code') : Promise.resolve(null);
  }

  /** Stops the action working on several rows (the rows not started are left). */
  stopAction() {
    this.runner.stop();
  }

  /** Raised before an action runs (in a row, a bar, a row's menu or from code): `e.cancel` keeps it from running. */
  get onActionRunning(): MotifEvent<GridActionRunningEventArgs<T>> {
    return this.on(this.model.events.actionRunning);
  }

  /** Raised when an action ran: on how many rows it worked or failed, and whether it was stopped. */
  get onActionRan(): MotifEvent<GridActionRanEventArgs<T>> {
    return this.on(this.model.events.actionRan);
  }

  // Selection.

  /** The selection as a state: rows one by one, or every row of a filter but some. Reactive. */
  get selection(): GridSelection {
    return this.model.selection.snapshot();
  }

  /** Raised whenever the selection changes. */
  get onSelectionChanged(): MotifEvent<GridSelectionChangedEventArgs> {
    return this.on(this.model.events.selectionChanged);
  }

  /** Raised before the selection changes (by the user or by code): `e.cancel` keeps it. */
  get onSelectionChanging(): MotifEvent<GridSelectionChangingEventArgs> {
    return this.on(this.model.events.selectionChanging);
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
    const out: T[] = [];
    for (const key of sel.snapshot().keys) {
      const row = model.data.rowByKey(key);
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

  /** Takes every filter away: the filter row's and header filters', the filter value, the search text (the conditions chosen in the filter row stay). */
  clearFilters() {
    this.model.filters.clearAll();
    if (this.model.search.state.text) this.model.search.setText('');
  }

  /**
   * The filter value, as the data layer has it: the filter builder's conditions, and with
   * `settings.filterSyncEnabled` the filter row's and header filters' too. Reactive. Assigning
   * gives the conditions the filter row and header filters can show to them (with sync); a
   * function is followed.
   */
  get filterValue(): data.FilterExpression | null {
    return this.model.filters.filterValue();
  }
  set filterValue(value: Bind<data.FilterExpression | null>) {
    this.stopFilterValueBinding?.();
    this.stopFilterValueBinding = null;
    if (typeof value !== 'function') {
      untracked(() => this.takeFilterValue(value));
      return;
    }
    const stop = effect(() => {
      const next = value();
      untracked(() => this.takeFilterValue(next));
    });
    this.stopFilterValueBinding = stop;
    this.motif.setDisposable(stop);
  }

  /** Whether the filter value applies (the filter panel's check box). Reactive; a function is followed. */
  get filterEnabled(): boolean {
    return this.model.filters.enabled;
  }
  set filterEnabled(value: Bind<boolean>) {
    this.stopFilterEnabledBinding?.();
    this.stopFilterEnabledBinding = null;
    if (typeof value !== 'function') {
      this.model.filters.enabled = value !== false;
      return;
    }
    const stop = effect(() => {
      const on = value() !== false;
      untracked(() => on !== this.model.filters.enabled && (this.model.filters.enabled = on));
    });
    this.stopFilterEnabledBinding = stop;
    this.motif.setDisposable(stop);
  }

  /** The filter value as the filter panel writes it: `[City] Equals 'Ankara' And …` with the columns' titles and texts. Reactive. */
  get filterText(): string {
    const { model } = this;
    void this.lookupTexts.n;
    const value = model.filters.filterValue();
    if (!value) return '';
    const customOperations = this.builderWindow.customOperations();
    const text = filterText(value, { fields: builderFields(model, customOperations), customOperations, texts: model.texts, locale: model.formatter.locale });
    return this.props.filterPanelText ? this.props.filterPanelText({ text, filterValue: value }) : text;
  }

  /** The filter builder the filter panel opens, live: `grid.filterBuilder.maxGroupLevel = 1`; a function is followed. */
  get filterBuilder(): GridFilterBuilderOptions {
    return this.builderOptions;
  }

  /** The window the filter builder opens in, live: `grid.filterBuilderPopup.width = '50rem'`; a function is followed. */
  get filterBuilderPopup(): GridFilterBuilderPopup {
    return this.builderPopupSwitches.view as GridFilterBuilderPopup;
  }

  /** Opens the filter builder on the filter value, in its window; `false` when `onFilterBuilderOpening` kept it closed. */
  openFilterBuilder(): boolean {
    return untracked(() => this.builderWindow.open());
  }

  /** Closes the filter builder's window: with `apply`, as OK. `false` when it is not open or `onFilterBuilderClosing` kept it. */
  closeFilterBuilder(apply = false): boolean {
    return untracked(() => this.builderWindow.close(apply));
  }

  /** The filter builder while its window is open. */
  get filterBuilderInstance(): FilterBuilder | null {
    return this.builderWindow.builder;
  }

  /** Takes the filter value away (the panel's Clear); with sync, the filter row's and header filters' filters too. The search stays. */
  clearFilterValue() {
    untracked(() => this.model.filters.clearValue());
  }

  /** Raised before the filter builder opens: `e.cancel` keeps it closed. */
  get onFilterBuilderOpening(): MotifEvent<GridFilterBuilderOpeningEventArgs> {
    return this.on(this.model.events.filterBuilderOpening);
  }
  get onFilterBuilderOpened(): MotifEvent<GridFilterBuilderOpenedEventArgs> {
    return this.on(this.model.events.filterBuilderOpened);
  }
  /** Raised before the filter builder closes, with OK (`e.apply`) or not: `e.cancel` keeps it open. */
  get onFilterBuilderClosing(): MotifEvent<GridFilterBuilderClosingEventArgs> {
    return this.on(this.model.events.filterBuilderClosing);
  }
  get onFilterBuilderClosed(): MotifEvent<GridFilterBuilderClosedEventArgs> {
    return this.on(this.model.events.filterBuilderClosed);
  }

  private takeFilterValue(value: data.FilterExpression | null | undefined) {
    const filters = this.model.filters;
    if (JSON.stringify(value ?? null) === JSON.stringify(filters.filterValue())) return;
    filters.setFilterValue(value ?? null);
  }

  // Search.

  /**
   * The search panel's text: the rows shown hold it in a searchable column. Reactive. Assigning
   * searches at once; a function is followed.
   */
  get searchText(): string {
    return this.model.search.state.text;
  }
  set searchText(text: Bind<string>) {
    this.stopSearchBinding?.();
    this.stopSearchBinding = null;
    if (typeof text !== 'function') {
      this.searchByText(text);
      return;
    }
    const stop = effect(() => {
      const value = text() ?? '';
      untracked(() => value !== this.model.search.state.text && this.searchByText(value));
    });
    this.stopSearchBinding = stop;
    this.motif.setDisposable(stop);
  }

  /** Searches for a text at once, as the search panel does after a typing pause; `''` stops searching. */
  searchByText(text: string) {
    this.model.search.setText(text ?? '');
  }

  /** Raised when the search text changes: typed in the search box, or set from code. */
  get onSearchTextChanged(): MotifEvent<GridSearchTextChangedEventArgs> {
    return this.on(this.model.events.searchTextChanged);
  }

  /** Raised before the search text changes: `e.cancel` keeps the one before. */
  get onSearchTextChanging(): MotifEvent<GridSearchTextChangingEventArgs> {
    return this.on(this.model.events.searchTextChanging);
  }

  /** Opens the list of columns (show and hide), under the toolbar's column button when it shows. */
  showColumnChooser() {
    const button = this.topBar.elementOf('columnChooserButton');
    const shown = button && button.isConnected && !button.hidden && !button.hasAttribute('data-overflowed') && this.topBar.bar.element.offsetParent !== null;
    this.menu.openColumns(shown ? button : (this.headEl ?? this.element));
  }

  // Grouping.

  /**
   * The grouped columns, in order, with the order of their groups: `[{ field: 'city', dir: 'asc' }]`.
   * Assigning groups the rows by them (`[]` ungroups); a column grouped now leaves the sort.
   */
  get group(): data.GroupItem[] {
    return this.model.groups.items.map((g) => ({ ...g }));
  }
  set group(items: data.GroupItem[]) {
    this.model.setGroup(items ?? []);
  }

  /** Takes every grouping away. */
  clearGrouping() {
    this.model.setGroup([]);
  }

  /** Groups by a column, at a place among the grouped ones (default: last); a grouped column moves there. */
  groupBy(field: string, index?: number, dir?: 'asc' | 'desc') {
    this.model.columns.get(field);
    this.model.setGroup(this.model.groups.withField(field, index ?? Number.MAX_SAFE_INTEGER, dir));
  }

  /** Takes one column out of the grouping. */
  ungroup(field: string) {
    this.model.ungroup(field);
  }

  /** Sets the order of a grouped column's groups. */
  setGroupOrder(field: string, dir: 'asc' | 'desc') {
    if (this.model.groups.isGrouped(field) && this.model.groups.dirOf(field) !== dir) this.model.toggleGroupOrder(field, false);
  }

  /** Raised before the grouping changes, by the user or from code: `e.cancel` keeps it. */
  get onGroupingChanging(): MotifEvent<GridGroupingChangingEventArgs> {
    return this.on(this.model.events.groupingChanging);
  }

  /** Raised after the grouping changed. */
  get onGroupingChanged(): MotifEvent<GridGroupingChangedEventArgs> {
    return this.on(this.model.events.groupingChanged);
  }

  /** Raised before a dropped header or chip changes the grouping: `e.cancel` cancels the drop. */
  get onGroupDropping(): MotifEvent<GridGroupDroppingEventArgs> {
    return this.on(this.model.events.groupDropping);
  }

  /** Opens every group of a level (0 is the top level), or of every level. */
  expandAll(level?: number) {
    this.model.setAllExpanded(true, level);
  }

  /** Closes every group of a level (0 is the top level), or of every level. */
  collapseAll(level?: number) {
    this.model.setAllExpanded(false, level);
  }

  /**
   * Opens a group by its key: the values of the groups from the top level down (`['Ankara']`,
   * `['Ankara', 'Draft']`). Returns whether it opened; a group not known yet (still loading) is not.
   */
  expandGroup(key: readonly unknown[]): boolean {
    const node = this.model.findGroup(key);
    return !!node && this.toggleGroup(node, true);
  }

  /** Closes a group by its key (see `expandGroup`). Returns whether it closed. */
  collapseGroup(key: readonly unknown[]): boolean {
    const node = this.model.findGroup(key);
    return !!node && this.toggleGroup(node, false);
  }

  /** Whether a group is open, by its key (see `expandGroup`). */
  isGroupExpanded(key: readonly unknown[]): boolean {
    const node = this.model.findGroup(key);
    void this.model.groups.state.version;
    return !!node && this.model.groups.isExpanded(node);
  }

  /** Raised before a group or a row's details open: `e.kind` says which, `e.key` is its key; `e.cancel` keeps it closed. */
  get onRowExpanding(): MotifEvent<GridRowExpandingEventArgs> {
    return this.on(this.model.events.rowExpanding);
  }

  /** Raised after a group or a row's details opened. */
  get onRowExpanded(): MotifEvent<GridRowExpandedEventArgs> {
    return this.on(this.model.events.rowExpanded);
  }

  /** Raised before a group or a row's details close: `e.cancel` keeps it open. */
  get onRowCollapsing(): MotifEvent<GridRowExpandingEventArgs> {
    return this.on(this.model.events.rowCollapsing);
  }

  /** Raised after a group or a row's details closed. */
  get onRowCollapsed(): MotifEvent<GridRowExpandedEventArgs> {
    return this.on(this.model.events.rowCollapsed);
  }

  // Details (master-detail).

  /** The `masterDetail` options, live: `grid.masterDetail.enabled = true`; a function is followed, `onOptionChanged` tells `masterDetail.enabled` …. */
  get masterDetail(): GridMasterDetail<T> {
    return this.model.details.options.view as GridMasterDetail<T>;
  }

  /**
   * Opens a row's details by its key, as its arrow does (`onRowExpanding` can keep them closed).
   * Returns whether they opened; a row not loaded, or one without details, does not.
   */
  expandRow(key: unknown): boolean {
    return this.toggleDetail(this.model.indexOfDetailKey(key), true);
  }

  /** Closes a row's details by its key (see `expandRow`). Returns whether they closed. */
  collapseRow(key: unknown): boolean {
    return this.toggleDetail(this.model.indexOfDetailKey(key), false);
  }

  /** Whether a row's details are open, by its key. Reactive. */
  isRowExpanded(key: unknown): boolean {
    const { model } = this;
    if (!model.details.on) return false;
    const row = model.data.rowByKey(key);
    if (row !== undefined && !model.details.canExpand(row)) return false;
    return model.details.isOpen(model.data.source.adapter.keyString(key));
  }

  /** Opens the details of every row (`expandAll(-1)`); like `expandAll()` for groups it raises no row events. */
  expandAllRows() {
    this.model.details.setAll(true);
    this.body.refreshDetails();
  }

  /** Closes the details of every row. */
  collapseAllRows() {
    this.leaveDetails();
    this.model.details.setAll(false);
    this.body.refreshDetails();
  }

  // Row drag and drop.

  /**
   * The `rowDragging` options, live: `grid.rowDragging.allowReordering = true`; a function is
   * followed, handlers can be set too, `onOptionChanged` tells `rowDragging.allowReordering` ….
   */
  get rowDragging(): GridRowDragging<T> {
    return this.model.rowDrag.view;
  }

  /**
   * Moves grid row `fromIndex` to `toIndex` as dropping it there would (the keys that move a row do
   * this): `onDragStart`, `onDragChange` and `onDragEnd` of `rowDragging`, any of which can cancel it,
   * then `onReorder`, whose handler moves the data. Resolves to whether `onReorder` was raised.
   */
  moveRow(fromIndex: number, toIndex: number): Promise<boolean> {
    return this.rowDrag.move(fromIndex, toIndex);
  }

  // Adaptive columns.

  /** The `adaptiveDetail` options, live: `grid.adaptiveDetail.colCount = 1`; a function is followed, `onOptionChanged` tells `adaptiveDetail.colCount` …. */
  get adaptiveDetail(): GridAdaptiveDetail {
    return this.model.adaptive.options.view as GridAdaptiveDetail;
  }

  /** The columns the width hides now (`settings.columnHidingEnabled`, a column's `hidingPriority`), by field, in display order. Reactive. */
  get adaptiveHiddenColumns(): string[] {
    return [...this.model.columns.state.adaptive];
  }

  /**
   * Opens the adaptive detail of the row with this key, as its "…" does (the one open before
   * closes; `onAdaptiveDetailRowExpanding` can keep it closed). Returns whether it opened: a row not
   * loaded, or a grid with no column hidden, does not.
   */
  expandAdaptiveDetailRow(key: unknown): boolean {
    const i = this.getRowIndexByKey(key);
    return i >= 0 && this.toggleAdaptive(i, true);
  }

  /** Closes the adaptive detail that is open. Returns whether it closed. */
  collapseAdaptiveDetailRow(): boolean {
    return this.closeAdaptive();
  }

  /** Whether the row with this key has its adaptive detail open. Reactive. */
  isAdaptiveDetailRowExpanded(key: unknown): boolean {
    const { model } = this;
    const id = model.adaptive.state.rowId;
    if (id === null || !model.columns.state.adaptive.length) return false;
    const row = model.data.rowByKey(key);
    return row !== undefined && model.rowIdOf(row) === id;
  }

  /** Raised when a row's adaptive detail lays out its form: change `e.formOptions`. */
  get onAdaptiveDetailRowPreparing(): MotifEvent<GridAdaptiveDetailRowPreparingEventArgs<T>> {
    return this.on(this.model.events.adaptiveDetailRowPreparing);
  }

  /** Raised before a row's adaptive detail opens: `e.cancel` keeps it closed. */
  get onAdaptiveDetailRowExpanding(): MotifEvent<GridAdaptiveRowExpandingEventArgs<T>> {
    return this.on(this.model.events.adaptiveDetailRowExpanding);
  }

  get onAdaptiveDetailRowExpanded(): MotifEvent<GridAdaptiveRowExpandedEventArgs<T>> {
    return this.on(this.model.events.adaptiveDetailRowExpanded);
  }

  /** Raised before a row's adaptive detail closes: `e.cancel` keeps it open. */
  get onAdaptiveDetailRowCollapsing(): MotifEvent<GridAdaptiveRowExpandingEventArgs<T>> {
    return this.on(this.model.events.adaptiveDetailRowCollapsing);
  }

  get onAdaptiveDetailRowCollapsed(): MotifEvent<GridAdaptiveRowExpandedEventArgs<T>> {
    return this.on(this.model.events.adaptiveDetailRowCollapsed);
  }

  // Summaries.

  /**
   * The summaries: `totalItems` in the row under the rows, `groupItems` in group rows and footers. A
   * function is followed; so is every field of the items.
   */
  get summary(): GridSummary<T> {
    return this.model.summaries.config();
  }
  set summary(summary: Bind<GridSummary<T>>) {
    this.model.summaries.value = summary;
  }

  /**
   * A value of the total summary: by the item's `name`, its place in `totalItems`, its type, its
   * column or `type_column` (`'sum_amount'`); `undefined` while it is not known. Reactive.
   */
  getTotalSummaryValue(name: string | number): unknown {
    return this.model.summaries.totalValue(name);
  }

  /** A value of the group summary of the group with this key (see `expandGroup`), by the item as `getTotalSummaryValue` finds it. Reactive. */
  getGroupSummaryValue(key: readonly unknown[], name: string | number): unknown {
    void this.model.state.version;
    const node = this.model.findGroup(key);
    return node ? this.model.summaries.groupValue(node, name) : undefined;
  }

  /** `'loading'` while a server works out the totals (or every row loads for them), `'error'` when that failed. */
  get summaryStatus(): 'loading' | 'ready' | 'error' {
    return this.model.summaries.state.status;
  }

  /** Raised when the summary values were worked out again. */
  get onSummaryChanged(): MotifEvent<GridSummaryChangedEventArgs> {
    return this.on(this.model.events.summaryChanged);
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
    const ev = model.events;
    if (ev.listened(ev.copying)) {
      const e = { text: content.text, html: content.html, rows: content.rows, cancel: false };
      ev.copying.fire(e);
      if (e.cancel) return '';
      content.text = e.text;
      content.html = e.html;
    }
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
    const ev = model.events;
    if (ev.listened(ev.pasting)) {
      const e = { text, rowIndex: st.activeRow, field: st.activeField, cancel: false };
      ev.pasting.fire(e);
      if (e.cancel) return 0;
      text = e.text;
    }
    const result = this.clipboard.paste(text, st.activeRow, st.activeField);
    const save = (rowId: string) => {
      if (model.isUntouched(rowId)) model.discard(rowId);
      else if (model.saveMode !== 'batch' && model.hasPending(rowId) && model.validate(rowId) === null) void model.commit(rowId);
    };
    for (const rowId of result.rowIds) {
      if (rowId === activeId) continue;
      // A pasted lookup text the source is asked about is written once it is a key.
      const wait = model.whenSettled(rowId);
      if (wait) void wait.then(() => !this.isDisposed && model.state.session !== rowId && save(rowId));
      else save(rowId);
    }
    if (model.hasPending(activeId) || model.edit(activeId)?.isNew) model.setSession(activeId);
    model.announce(result.cells ? model.text('gridPasted', { count: model.formatter.count(result.cells) }) : model.text('gridNothingPasted'));
    return result.cells;
  }

  /**
   * The rows of the filter in the sort order, with the visible exportable columns in display order,
   * as objects by field: the text the cells show, or their values (`values: 'raw'`). Rows in memory
   * are taken as they are; a server's are asked for in parts (`pageSize`) through the data source.
   * Group footers follow their rows and the row of totals comes last, as objects of the same fields
   * with the texts they show (`summaries: false` leaves them out).
   */
  async exportRows(options: GridExportOptions = {}): Promise<Record<string, unknown>[]> {
    const run = await this.runExport('rows', options, (o, signal) => this.exporter.table(o, signal));
    if (!run) return [];
    const table = run.result;
    const rows: Record<string, unknown>[] = [];
    const summaries = this.exporter.summaryObjects(table);
    let next = 0;
    table.rows.forEach((cells, i) => {
      for (; next < summaries.length && summaries[next].after <= i; next++) rows.push(summaries[next].values);
      rows.push(Object.fromEntries(table.fields.map((f, j) => [f, cells[j]])));
    });
    for (; next < summaries.length; next++) rows.push(summaries[next].values);
    this.model.events.tell(this.model.events.exported, () => ({ format: 'rows' as const, rows: rows.length }));
    return rows;
  }

  /**
   * Saves the rows as `exportRows` collects them in a CSV file a spreadsheet opens as it is: UTF-8
   * with a byte order mark, the locale's separator, column titles first. Returns the text.
   */
  async exportCsv(options: GridExportOptions = {}): Promise<string> {
    const run = await this.runExport('csv', options, (o, signal) => this.exporter.table(o, signal));
    if (!run) return '';
    const table = run.result;
    options = run.options;
    const text = this.exporter.csv(table, options);
    if (options.download !== false) {
      const name = (options.fileName ?? (this.text || 'export')).replace(/[\\/:*?"<>|]+/g, '-');
      this.exporter.download(text, /\.csv$/i.test(name) ? name : `${name}.csv`);
    }
    this.model.events.tell(this.model.events.exported, () => ({ format: 'csv' as const, rows: table.rows.length, text }));
    return text;
  }

  /**
   * What a command of the toolbar's export button does: `'csv'` runs `exportCsv`; any other format
   * raises `onExporting` with that `format` and `selectedRowsOnly`, and the app writes the file
   * there (`exportDataGrid` of the `excel` entry for `'xlsx'`, of the `pdf` entry for `'pdf'`).
   */
  async exportTo(format: string, options: GridExportOptions = {}): Promise<void> {
    if (format === 'csv') {
      await this.exportCsv(options);
      return;
    }
    const ev = this.model.events;
    this.selectedNext = !!options.selected;
    if (!ev.listened(ev.exporting)) {
      console.warn(`DataGrid: nothing writes '${format}' files. Write them in onExporting (exportDataGrid from @motifx-community/ui/excel for 'xlsx', from @motifx-community/ui/pdf for 'pdf').`);
      return;
    }
    const e: GridExportingEventArgs = { format, component: this, selectedRowsOnly: !!options.selected, options: { ...options }, cancel: false };
    ev.exporting.fire(e);
    if (e.cancel) this.selectedNext = false;
  }

  /**
   * The rows of an export as a sheet of typed cells (header, group rows, data rows, group footers,
   * totals), handed to `write`, a file writer: `exportDataGrid` writes it to an ExcelJS worksheet.
   * The rows load as `exportRows` loads them (in parts from a server, with progress, stopped by
   * `signal` or the load panel's button). `onExported` follows with `format` once `write` is done.
   * Raises no `onExporting`: this is what an `onExporting` handler calls.
   */
  async exportSheet<R>(options: GridSheetOptions, write: (sheet: GridSheet<T>) => R | Promise<R>): Promise<R> {
    const selected = options.selectedRowsOnly ?? this.selectedNext;
    this.selectedNext = false;
    const format = options.format ?? 'xlsx';
    const given: GridExportOptions = { selected, pageSize: options.pageSize, onProgress: options.onProgress, signal: options.signal, loadPanel: options.loadPanel ?? true };
    const collect = (o: GridExportOptions, signal: AbortSignal) =>
      this.exporter.sheet({ ...options, onProgress: o.onProgress, selected, rtl: this.isRtl(), widthOf: (field) => this.shownWidth(field) }, signal);
    const run = await this.runExport(format, given, collect, false);
    const sheet = run!.result;
    const result = await write(sheet);
    const rows = sheet.rows.filter((r) => r.rowType === 'data').length;
    this.model.events.tell(this.model.events.exported, () => ({ format, rows }));
    return result;
  }

  /** Stops the export the load panel shows (its promise rejects with an `AbortError`). */
  cancelExport() {
    if (this.exportPanel.kind === 'export') this.stopPanelExport?.();
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
      // While there are no rows to show, the body keeps room for the message (`emptyRows`).
      'data-state': () => (model.state.status === 'loading' ? 'loading' : model.state.status === 'error' ? 'error' : model.count === 0 ? 'empty' : null),
    });
    this.bindings.watch(() => this.element.style.setProperty('--_empty-rows', String(Math.max(0, settings.get('emptyRows')))));

    // Filters: applied at once, or after a typing pause; a feature switched off takes its filter out.
    this.bindings.watch(() => {
      void model.filters.expression();
      void model.filters.filterValue();
      void model.filters.enabled;
      untracked(() => model.queueFilter());
    });

    // The search text and the filter value the app follows; the columns searched changed: search again.
    const searchProp = this.props.searchText;
    if (typeof searchProp === 'function') this.searchText = searchProp;
    const filterValueProp = this.props.filterValue;
    if (typeof filterValueProp === 'function') this.filterValue = filterValueProp;
    const filterEnabledProp = this.props.filterEnabled;
    if (typeof filterEnabledProp === 'function') this.filterEnabled = filterEnabledProp;
    let firstFields = true;
    this.bindings.watch(() => {
      void model.search.fields().join('\n');
      if (firstFields) {
        firstFields = false;
        return;
      }
      untracked(() => model.search.refresh());
    });

    // What the bars' actions act on is said politely when it changes (not when the grid starts).
    let barTarget: string | null = null;
    this.bindings.watch(() => {
      const text = this.barShown() ? model.actionSets.targetLabel() : '';
      untracked(() => {
        if (barTarget !== null && text && text !== barTarget) model.announce(text);
        barTarget = text;
      });
    });

    // Keys of the selected rows given by the app.
    this.bindings.watch(() => {
      const keys = read(this.props.selectedKeys);
      if (keys === undefined) return;
      const list = [...keys];
      untracked(() => (this.selectedKeys = list));
    });

    // The data props: other data, another mode or save mode starts again; another `pageSize` wins
    // over the size the user chose.
    let first = true;
    let lastPageSize = read(this.props.pageSize);
    this.bindings.watch(() => {
      const props = this.props;
      void read(props.dataSource);
      void read(props.mode);
      const pageSize = read(props.pageSize);
      void read(props.saveMode);
      if (first) {
        first = false;
        return;
      }
      untracked(() => {
        if (pageSize !== lastPageSize) model.chosenPageSize = null;
        lastPageSize = pageSize;
        this.closeForm(false);
        this.closeEditor();
        this.pendingInvalid = null;
        model.connect();
        this.body.toStart();
      });
    });

    // Another edit mode: an open form closes, and to or from 'batch' the data starts again with that save mode.
    let firstEditMode = true;
    this.bindings.watch(() => {
      const mode = settings.get('editMode');
      if (firstEditMode) {
        firstEditMode = false;
        return;
      }
      untracked(() => {
        if (this.formEdit && (mode === 'form' || mode === 'popup' ? mode !== this.formEdit.mode : true)) this.dropForm();
        if (model.wantedSaveMode() === model.data.tracker.saveMode) return;
        this.closeForm(false);
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

    // Open groups: the list follows the switches (autoExpandAll, a column's autoExpandGroup).
    let firstOpen = true;
    this.bindings.watch(() => {
      void model.groups.track();
      if (firstOpen) {
        firstOpen = false;
        return;
      }
      untracked(() => model.data.regroupView());
    });

    // Who groups and how every row loads for it: grouped again when they change.
    let firstRemote = true;
    this.bindings.watch(() => {
      void settings.get('remoteGrouping');
      void settings.get('groupLoadPageSize');
      if (firstRemote) {
        firstRemote = false;
        return;
      }
      untracked(() => model.regroupWithSettings());
    });

    // The functions of the columns the app follows (`groupIndex`, `filterValues`, `filterType`).
    for (const col of model.columns.definitions()) this.watchColumn(col);
    this.motif.setDisposable(() => {
      for (const field of [...this.columnWatches.keys()]) this.stopWatching(field);
    });

    // Summaries: other items or other ways to work them out start again; group items a server
    // cannot compute group the rows in memory; footer rows come and go with their items.
    let firstSummary = true;
    let lastServer = '';
    let lastFooters = false;
    this.bindings.watch(() => {
      const s = model.summaries;
      void s.signature();
      const server = JSON.stringify(s.serverItems(s.groupItems(), model.data.source.adapter));
      const footers = s.hasFooters();
      if (firstSummary) {
        firstSummary = false;
        lastServer = server;
        lastFooters = footers;
        return;
      }
      untracked(() => {
        s.refresh();
        if (server !== lastServer) model.regroupWithSettings();
        else if (footers !== lastFooters) model.data.regroupView();
        lastServer = server;
        lastFooters = footers;
      });
    });

    // Master-detail: turning it on or off, `autoExpandAll` or another template open or close every
    // row again; another template makes the details again.
    let firstDetails = true;
    let lastTemplate: unknown;
    this.bindings.watch(() => {
      const options = model.details.options;
      void options.get('enabled');
      void options.get('autoExpandAll');
      const template = options.get('template');
      if (firstDetails) {
        firstDetails = false;
        lastTemplate = template;
        return;
      }
      untracked(() => {
        this.leaveDetails();
        if (template !== lastTemplate) this.body.dropDetails();
        lastTemplate = template;
        model.details.reset();
        this.body.refreshDetails();
      });
    });

    // What the details' rows and heights depend on: they are found and laid out again.
    let firstDetailOptions = true;
    this.bindings.watch(() => {
      const options = model.details.options;
      void options.get('canExpand');
      void options.get('height');
      void options.get('estimatedHeight');
      void options.get('keepDetails');
      void options.get('keepLimit');
      if (firstDetailOptions) {
        firstDetailOptions = false;
        return;
      }
      untracked(() => this.body.refreshDetails());
    });

    // Order or visibility changed: reorder cells, renumber, keep the active column visible.
    this.bindings.watch(() => {
      const visible = model.columns.visible();
      const filterRow = model.showsFilterRow();
      untracked(() => {
        this.findColumns(visible);
        this.arrangeColumns(visible, filterRow);
        model.keepActiveFieldVisible();
        this.syncTabStop();
      });
    });

    // Virtual columns: other widths, another width of the viewport or other settings draw other columns.
    this.bindings.watch(() => {
      const visible = model.columns.visible();
      void model.columns.template(visible);
      void model.columns.anyVirtual(visible);
      void settings.get('extraColumns');
      void model.state.width;
      untracked(() => this.updateColumns());
    });

    // Sizes and sticky offsets: CSS only, no row is touched.
    this.bindings.watch(() => {
      const visible = model.columns.visible();
      const template = model.columns.template(visible);
      const offsets = model.columns.stickyOffsets(visible);
      const align = new Map<string, string>();
      for (const f of visible) align.set(f, model.columns.align(f));
      const bands = model.columns.hasBands ? model.columns.shownBands(visible) : [];
      const placed = model.columns.anyVirtual(visible);
      untracked(() => {
        this.viewportEl?.style.setProperty('--_columns', template);
        this.styles.update(visible, offsets, align, bands, placed);
      });
    });

    // The columns the width hides: worked out from the widths kept and the viewport's width only, so
    // hiding them cannot feed back into it.
    this.bindings.watch(() => {
      const hidden = model.columns.fitWidth(model.state.width);
      untracked(() => {
        const cols = model.columns;
        if (hidden.join('\n') !== cols.state.adaptive.join('\n')) cols.state.adaptive = hidden;
      });
    });

    // No column hidden any more: the adaptive detail closes.
    this.bindings.watch(() => {
      const none = model.columns.state.adaptive.length === 0;
      if (!none || model.adaptive.state.rowId === null) return;
      untracked(() => {
        this.leaveAdaptive();
        model.adaptive.close();
        this.body.relayout(true);
      });
    });

    // An adaptive detail editing opened closes when the row is left.
    this.bindings.watch(() => {
      const session = model.state.session;
      const a = model.adaptive.state;
      if (!a.auto || a.rowId === null || session === a.rowId) return;
      untracked(() => {
        const i = model.adaptiveIndex();
        if (i < 0 || !this.toggleAdaptive(i, false)) {
          model.adaptive.close();
          this.body.relayout(true);
        }
      });
    });

    // Rows arrived, the total changed, rows were added, sizes, the page or the page size changed: lay the body out again.
    this.bindings.watch(() => {
      const st = model.state;
      void st.version;
      void st.status;
      void st.connection;
      void st.added;
      void st.rowHeight;
      void st.viewport;
      void st.page;
      void st.pageSize;
      untracked(() => {
        if (this.updates > 0) this.relayoutWaiting = true;
        else this.layOut();
      });
    });
  }

  /** Follows the data, lays the body out, and tells that the rows are there. */
  private layOut() {
    const { model } = this;
    this.followData();
    this.body.relayout(true);
    this.syncTabStop();
    if (model.state.status === 'ready') model.events.tell(model.events.contentReady, () => ({ total: this.total }));
  }

  override onBuilt() {
    this.topBar.arrange();
    // Header cells and rows are built in definition order; put them in display order.
    const visible = this.model.columns.visible();
    this.header.arrange(visible);
    if (this.headEl) this.bands.arrange(visible, this.headEl, this.header.element);
    if (this.model.showsFilterRow()) this.filterRow.arrange(visible);
    this.body.arrange(visible);
    this.totalRow.arrange(visible);
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
      const ro = new ResizeWatch(() => this.measure());
      ro.observe(vp);
      if (this.headEl) ro.observe(this.headEl);
      if (this.footEl) ro.observe(this.footEl);
      if (this.probeEl) ro.observe(this.probeEl);
      this.motif.setDisposable(() => ro.disconnect());
    }
    vp.style.setProperty('--_columns', this.model.columns.template(this.model.columns.visible()));
    this.body.relayout(true);
    this.syncTabStop();
  }

  override onDisposing() {
    clearTimeout(this.columnsTimer);
    for (const controller of this.exports) controller.abort();
    this.runner.dispose();
    this.editor = null;
    this.tip.hide();
    this.groupPanel.dispose();
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
    const showErrors = () => settings.get('errorSummary') && model.stats.failed > 0;
    const showSelected = () => settings.get('selection') !== 'none' && settings.get('selectedCount') && this.selectedCount > 0;
    const panel = this.exportPanel;
    const acting = () => panel.kind === 'action';
    const keepFocus = (e: Event) => e.preventDefault();
    return (
      <>
        {this.topBar.bar}
        <div class="mx-data-grid__main">
          <div
            class="mx-data-grid__viewport"
            role={() => (model.groups.any ? 'treegrid' : 'grid')}
            ref={(c) => (this.viewportEl = c.element as HTMLDivElement)}
            aria-label={() => this.text || t('gridLabel')}
            aria-rowcount={() => {
              void model.details.state.version;
              void model.adaptive.state.rowId;
              void model.columns.state.adaptive;
              // Infinite: unknown until the last part came.
              return st.status === 'loading' || !model.data.ended ? -1 : model.count + model.headRows + (model.summaries.showsTotal() ? 1 : 0) + model.openDetailCount();
            }}
            aria-multiselectable={() => (settings.get('selection') === 'multiple' ? 'true' : null)}
            aria-colcount={() => model.columns.visible().length}
            aria-busy={() => (st.status === 'loading' || st.busy ? 'true' : null)}
            onscroll={() => {
              this.columnsScrolled();
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
            oncontextmenu={(e: MouseEvent) => this.onContextMenu(e)}
            onpointermove={(e: PointerEvent) => {
              if (this.body.detailOf(e.target as Element)) this.tip.hide();
              else if (settings.get('tooltips')) this.tip.hover(e);
            }}
            onpointerleave={() => this.tip.hide()}
          >
            <div class="mx-data-grid__head" role="rowgroup" ref={(c) => (this.headEl = c.element as HTMLDivElement)}>
              {this.header}
              {this.filterRow}
            </div>
            {this.body}
            <div
              class="mx-data-grid__foot"
              role="rowgroup"
              aria-label={() => t('gridTotalSummary')}
              hidden={() => !model.summaries.showsTotal()}
              ref={(c) => (this.footEl = c.element as HTMLDivElement)}
            >
              {this.totalRow}
            </div>
          </div>
          <div class="mx-data-grid__overlay" x-display={() => overlay() !== null}>
            <div class="mx-data-grid__state" x-display={() => overlay() === 'loading'}>
              <Spinner size="sm" label={() => t('loading')} />
            </div>
            <div class="mx-data-grid__state" x-display={() => overlay() === 'empty'}>
              <span>{() => (model.isFiltered() ? t('gridNoMatches') : t('gridNoRows'))}</span>
              <Button class="mx-data-grid__clear-filters" text={() => t('gridClearFilters')} size="sm" variant="outline" visible={() => model.isFiltered()} onclick={() => this.clearFilters()} />
            </div>
            <div class="mx-data-grid__state" data-tone="danger" role="alert" x-display={() => overlay() === 'error'}>
              <span>{() => t('loadFailed')}</span>
              <Button text={() => t('retry')} size="sm" variant="outline" onclick={() => this.retry()} />
            </div>
          </div>
          <div class="mx-data-grid__load-more" role="status" data-state={() => model.moreState()} x-display={() => model.moreState() !== null}>
            <Spinner size="sm" label={() => t('gridLoadingMore')} visible={() => model.moreState() === 'loading'} />
            <span x-display={() => model.moreState() === 'failed'}>{() => t('gridLoadMoreFailed')}</span>
            <Button text={() => t('retry')} size="sm" variant="outline" visible={() => model.moreState() === 'failed'} onclick={() => this.retry()} />
          </div>
          <div class="mx-data-grid__export-panel" x-display={() => this.exportPanel.shown}>
            <ProgressBar
              class="mx-data-grid__export-progress"
              label={() => panel.text || t('gridExporting')}
              value={() => (panel.progress && panel.total > 0 ? panel.loaded : null)}
              max={() => Math.max(1, panel.total)}
              showValue={() => panel.progress && panel.total > 0}
              valueText={() =>
                acting() ? t('gridActionProgress', { done: count(panel.loaded), total: count(panel.total) }) : t('gridExportProgress', { loaded: count(panel.loaded), total: count(panel.total) })
              }
              size="sm"
              stretch
            />
            <Button
              class="mx-data-grid__export-cancel"
              text={() => (acting() ? t('gridActionStop') : t('gridExportCancel'))}
              size="sm"
              variant="outline"
              visible={() => panel.cancel}
              onclick={() => this.stopPanelExport?.()}
            />
          </div>
          <div class="mx-data-grid__probe" aria-hidden="true" ref={(c) => (this.probeEl = c.element as HTMLDivElement)} />
          <div class="mx-data-grid__measure" aria-hidden="true" ref={(c) => (this.measureEl = c.element as HTMLDivElement)} />
        </div>
        {this.filterPanel}
        <div class="mx-data-grid__bar" x-display={() => settings.get('rowCount') || st.failedBlocks > 0 || model.showsPager() || showErrors() || showSelected() || this.bottomShown()}>
          {this.bottomBar}
          <span class="mx-data-grid__count" x-display={() => settings.get('rowCount')}>
            {() => (st.status !== 'ready' ? '' : model.mode === 'infinite' && model.data.knownCount === undefined ? t('gridRecordsLoaded', { count: count(this.total) }) : t('gridRecords', { count: count(this.totalCount()) }))}
          </span>
          <span class="mx-data-grid__selected" x-display={showSelected}>
            {() => t('gridSelectedCount', { count: count(this.selectedCount) })}
          </span>
          <span class="mx-data-grid__note" data-tone="danger" role="status" x-display={() => st.failedBlocks > (model.moreState() === 'failed' ? 1 : 0)}>
            {() => t('gridSomeRowsFailed')}
            <Button text={() => t('retry')} size="sm" variant="ghost" onclick={() => this.retry()} />
          </span>
          <span class="mx-data-grid__note mx-data-grid__errors" data-tone="danger" role="status" x-display={showErrors}>
            {() => t('gridSaveErrors', { count: count(model.stats.failed) })}
            <Button text={() => t('gridNextError')} size="sm" variant="ghost" on:pointerdown={keepFocus} onclick={() => this.goToNextError()} />
          </span>
          {this.pager}
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

  /** Whether the bottom bar holds actions now. Reactive. */
  private bottomShown(): boolean {
    const shown = this.bottomActions.shown();
    return shown.buttons.length + shown.menu.length > 0;
  }

  /** Whether the toolbar or the bottom bar holds actions now. Reactive. */
  private barShown(): boolean {
    if (this.bottomShown()) return true;
    const sets = this.model.actionSets;
    return sets.canShowIn('toolbar') && this.topBar.shown() && sets.barEntries('toolbar').length > 0;
  }

  private isRtl(): boolean {
    return typeof getComputedStyle === 'function' && getComputedStyle(this.element).direction === 'rtl';
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
    const foot = this.footEl?.offsetHeight ?? 0;
    this.element.style.setProperty('--_head-height', `${head}px`);
    // The mark of infinite mode sits over the last rows, above the totals and the scroll bar.
    this.element.style.setProperty('--_more-bottom', `${vp.offsetHeight - vp.clientHeight + foot}px`);
    const viewport = Math.max(0, vp.clientHeight - head - foot);
    if (viewport !== state.viewport) state.viewport = viewport;
    const width = vp.clientWidth;
    if (width !== state.width) state.width = width;
    if (viewport > 0 && !state.measured) state.measured = true;
    const fixed = this.model.fixedRowHeight;
    const h = fixed ?? this.probeEl?.offsetHeight ?? 0;
    if (h > 0 && h !== state.rowHeight) {
      // Another density: the action buttons are measured again.
      this.widths.clear();
      state.rowHeight = h;
    }
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
      st.activeRow = last < 0 ? HEADER_ROW : model.mode !== 'paged' ? Math.min(st.activeRow, last) : model.firstRow();
    }
    if (this.formEdit?.mode === 'form' && this.body.formIndex() < 0) this.closeForm(false);
    // The editor belongs to its row; if that row is no longer where the editor is, finish it.
    if (this.editor && this.editTarget) {
      const at = this.body.rowOf(this.editor.element);
      if (!at || at.rowId !== this.editTarget.rowId) this.commitEditor() || this.closeEditor();
    }
  }

  // The active cell, focus.

  private activeElement(): HTMLElement | undefined {
    const { activeRow, activeField } = this.model.state;
    if (activeRow >= 0 && this.formEdit?.mode === 'form' && activeRow === this.body.formIndex()) {
      const cell = this.body.formCell();
      if (cell) return cell;
    }
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
    return this.headerCellOf(activeField);
  }

  /** The header of a column, or of a band. */
  private headerCellOf(field: string): HTMLElement | undefined {
    return this.model.columns.isBand(field) ? this.bands.cellElement(field) : this.header.cellElement(field);
  }

  /** Exactly one cell is in the tab order: the active one. */
  private syncTabStop() {
    // A virtual column the active cell moved to gets its cells first.
    const active = this.keptColumn();
    if (active && !this.model.columnWindow.has(active)) this.updateColumns();
    const el = this.activeElement();
    if (!el) return;
    const index = this.tabStop ? '0' : '-1';
    if (el === this.tabbable && el.getAttribute('tabindex') === index) return;
    this.tabbable?.setAttribute('tabindex', '-1');
    el.setAttribute('tabindex', index);
    this.tabbable = el;
  }

  private setActive(row: number, field: string) {
    const { model } = this;
    const st = model.state;
    st.touched = true;
    const moved = st.activeRow !== row;
    const shifted = moved || st.activeField !== field;
    if (moved) st.activeRow = row;
    if (st.activeField !== field) st.activeField = field;
    this.activeRowId = row >= 0 ? model.rowIdAt(row) : undefined;
    // In single selection the selection follows the active row.
    if (moved && row >= 0 && model.settings.get('selection') === 'single') this.selectOnly(row);
    if (!shifted) return;
    const ev = model.events;
    const target = row >= 0 ? model.rowAt(row) : undefined;
    ev.tell(ev.focusedCellChanged, () => ({ rowIndex: row, field, row: target }));
    if (moved) ev.tell(ev.focusedRowChanged, () => ({ rowIndex: row, row: target, key: this.getKeyByRowIndex(row) }));
  }

  /** Asks `onFocusedRowChanging` and `onFocusedCellChanging` before the active cell moves; whether it may. */
  private canMoveTo(row: number, field: string): boolean {
    const { model } = this;
    const ev = model.events;
    const st = model.state;
    const from = st.activeRow;
    const fromField = st.activeField;
    if (row === from && field === fromField) return true;
    const target = row >= 0 ? model.rowAt(row) : undefined;
    if (row !== from && !ev.ask(ev.focusedRowChanging, () => ({ rowIndex: row, previousRowIndex: from, row: target, cancel: false }))) return false;
    return ev.ask(ev.focusedCellChanging, () => ({ rowIndex: row, field, previousRowIndex: from, previousField: fromField, row: target, cancel: false }));
  }

  /** A setting a column may give for itself: its own value, else the grid's. */
  private columnSetting<K extends 'editOnKeyPress' | 'startEditAction'>(field: string, name: K): GridSettings[K] {
    const def = this.model.columns.defs.get(field);
    return (def && !this.model.columns.isInternal(field) ? read(def[name] as Bind<GridSettings[K]> | undefined) : undefined) ?? this.model.settings.get(name);
  }

  /** The kind of grid row `i`. */
  private rowTypeOf(i: number): GridRowType {
    const { model } = this;
    if (model.groupAt(i)) return 'group';
    if (model.footerAt(i)) return 'groupFooter';
    return model.isNew(model.rowIdAt(i)) ? 'new' : 'data';
  }

  private focusActive(reveal: boolean) {
    this.updateColumns();
    const { activeRow, activeField } = this.model.state;
    if (reveal && activeRow >= 0) this.body.reveal(activeRow);
    const cols = this.model.columns;
    if (reveal) this.revealColumn(cols.isBand(activeField) ? (cols.leavesIn(activeField, cols.visible())[0] ?? activeField) : activeField);
    this.syncTabStop();
    const el = this.activeElement();
    if (!el) return;
    el.focus({ preventScroll: true });
    if (this.model.settings.get('tooltips')) this.tip.focus(el);
  }

  /** The column the active cell is in (a band's first one), drawn even while it is out of view. */
  private keptColumn(): string {
    const cols = this.model.columns;
    const field = this.model.state.activeField;
    return cols.isBand(field) ? (cols.leavesIn(field, cols.visible())[0] ?? '') : field;
  }

  /** Works out the columns that get cells (virtual columns); whether that changed. */
  private findColumns(visible: readonly string[]): boolean {
    const vp = this.viewportEl;
    const { model } = this;
    const keep = [this.keptColumn()];
    if (this.editTarget) keep.push(this.editTarget.field);
    return model.columnWindow.update(visible, vp ? Math.abs(vp.scrollLeft) : 0, vp?.clientWidth || model.state.width, keep);
  }

  /** Puts the cells of the header, the filter row, the rows and the totals in display order, with the columns drawn. */
  private arrangeColumns(visible: string[], filterRow = this.model.showsFilterRow()) {
    this.header.arrange(visible);
    if (this.headEl) this.bands.arrange(visible, this.headEl, this.header.element);
    if (filterRow) this.filterRow.arrange(visible);
    this.body.arrange(visible);
    this.totalRow.arrange(visible);
  }

  /** While columns are virtual, the columns that came into view get their cells. */
  private updateColumns() {
    const visible = untracked(() => this.model.columns.visible());
    if (!untracked(() => this.findColumns(visible))) return;
    const started = performance.now();
    untracked(() => this.arrangeColumns(visible));
    this.columnsTook = performance.now() - started;
  }

  /** The rows scrolled: virtual columns follow at once, or once the scrolling stops (`renderAsync`). */
  private columnsScrolled() {
    const { model } = this;
    const settings = model.settings;
    if (model.columnWindow.all) return;
    const async = settings.get('renderAsync');
    clearTimeout(this.columnsTimer);
    if (async === true || (async === 'auto' && this.columnsTook > settings.get('columnRenderingThreshold'))) {
      this.columnsTimer = setTimeout(() => {
        if (!this.isDisposed) this.updateColumns();
      }, Math.max(0, settings.get('columnRenderingDelay')));
    } else this.updateColumns();
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
    // Virtual columns: from the widths given (the cells may have just been made).
    const placed = !this.model.columnWindow.all;
    const left = placed ? this.model.columnWindow.offsetOf(field, visible) : cell.offsetLeft;
    const right = left + (placed ? this.model.columns.width(field) : cell.offsetWidth);
    const from = vp.scrollLeft + pinned.start;
    const to = vp.scrollLeft + vp.clientWidth - pinned.end;
    if (left < from) vp.scrollLeft = left - pinned.start;
    else if (right > to) vp.scrollLeft = right - (vp.clientWidth - pinned.end);
  }

  /** Focus leaves the grid: to the next (or previous) element in the Tab order outside the rows. */
  private moveFocusOut(forward: boolean) {
    const vp = this.viewportEl;
    if (!vp) return;
    const target = nextTabbable(vp, vp.ownerDocument.body, forward);
    if (target) target.focus();
    else (this.element.ownerDocument.activeElement as HTMLElement | null)?.blur?.();
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
    // In the form modes a row is edited in its form; typing on a cell does not open it.
    if (model.editsInForm) return initialText === undefined && i >= 0 && this.openForm(i, field);
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
    if (!model.events.ask(model.events.editingStart, () => ({ field, row: merged, rowIndex: i, isNew: !!rec?.isNew, cancel: false }))) return false;
    const prepare = (options: Record<string, unknown>) => {
      const e: GridEditorPreparingEventArgs<T> = { field, row: { ...merged }, isNew: !!rec?.isNew, options, cancel: false };
      model.events.editorPreparing.fire(e);
      return !e.cancel;
    };
    const editor = new CellEditor<T>(model, col, merged, value, typed, { commit: () => this.finishEdit('none'), cancel: () => this.cancelEdit() }, this.body, prepare);
    if (editor.cancelled) {
      editor.dispose();
      return false;
    }
    cell.append(editor.element);
    this.editor = editor;
    this.editTarget = { rowId, row, field };
    this.editorPrepared(field, merged, !!rec?.isNew, editor, 'cell');
    st.editing = { rowId, field };
    model.setSession(rowId);
    if (this.pendingInvalid === rowId) this.pendingInvalid = null;
    this.tip.hide();
    editor.focus();
    this.openAdaptiveForEdit(i);
    return true;
  }

  /** `onEditorPrepared` for an editor just made. */
  private editorPrepared(field: string, row: T, isNew: boolean, editor: CellEditor<T>, place: 'cell' | 'form' | 'adaptive') {
    const ev = this.model.events;
    ev.tell(ev.editorPrepared, () => ({ field, row: { ...row }, isNew, editor: editor.editor, element: editor.element, place }));
  }

  /** Whether an element is inside the edit form shown in place of a row. */
  private inForm(target: Element | null): boolean {
    return !!target && !!this.formEdit && this.formEdit.form.element.contains(target);
  }

  /**
   * Opens the edit form of grid row `i` (`editMode` `'form'`: in place of the row; `'popup'`: in a
   * modal window), with focus on `field` when it can be filled in. A form open on another row is
   * given up first, as Cancel does.
   */
  private openForm(i: number, field: string): boolean {
    const { model } = this;
    const st = model.state;
    const row = model.rowAt(i);
    const rowId = model.rowIdAt(i);
    if (st.busy || row === undefined || rowId === undefined || model.groupAt(i) || model.footerAt(i)) return false;
    const rec = model.edit(rowId);
    const isNew = !!rec?.isNew;
    if (rec?.saving || rec?.removed) return false;
    if (this.formEdit?.rowId === rowId) return this.formEdit.form.focus(field);
    if (!model.columns.listedData().some((f) => model.columns.canFill(f, row, isNew))) return false;
    if (this.formEdit && !this.cancelForm(false)) return false;
    const merged = { ...(row as object), ...(rec?.draft ?? {}) } as T;
    if (!model.events.ask(model.events.editingStart, () => ({ field: '', row: merged, rowIndex: i, isNew, cancel: false }))) return false;
    this.closeEditor();
    model.setSession(rowId, row);
    if (this.pendingInvalid === rowId) this.pendingInvalid = null;
    this.tip.hide();
    const mode = model.editMode === 'popup' ? 'popup' : 'form';
    const form = new EditForm<T>(
      model,
      rowId,
      row,
      this.formSwitches,
      {
        save: () => void this.saveForm(),
        cancel: () => this.cancelForm(true),
        prepare: (f, r, n, options) => {
          const e: GridEditorPreparingEventArgs<T> = { field: f, row: { ...r }, isNew: n, options, cancel: false };
          model.events.editorPreparing.fire(e);
          return !e.cancel;
        },
        prepared: (f, r, n, editor) => this.editorPrepared(f, r, n, editor, 'form'),
      },
      mode === 'form',
    );
    this.formEdit = { mode, rowId, row, form, window: null };
    if (mode === 'form') {
      this.body.controls.add(form);
      this.body.showForm(rowId, row, i, form.element);
      this.body.reveal(i);
      this.syncTabStop();
      form.focus(field);
    } else this.openWindow(form, isNew);
    return true;
  }

  /** The edit form in a modal window (`editMode: 'popup'`): Save and Cancel in its footer, Enter and Escape press them. */
  private openWindow(form: EditForm<T>, isNew: boolean) {
    const { model } = this;
    const p = this.popupSwitches;
    const title = () => p.get('title') ?? model.text(isNew ? 'gridNewRowTitle' : 'gridEditRowTitle');
    const win = new MxForm({
      title: () => (p.get('showTitle') ? title() : ''),
      content: form,
      footer: form.buttons,
      width: () => p.get('width') ?? '',
      height: () => p.get('height') ?? '',
      resizable: () => p.get('resizable'),
      movable: () => p.get('movable'),
      showClose: () => p.get('showCloseButton'),
      showMaximize: () => p.get('showMaximize'),
      windowState: () => (p.get('fullScreen') ? 'maximized' : 'normal'),
      acceptButton: form.saveButton,
      cancelButton: form.cancelButton,
    });
    win.element.classList.add('mx-data-grid__popup');
    // Without the title shown, the window still has its name.
    win.motif.setDisposable(
      effect(() => {
        if (p.get('showTitle')) win.element.removeAttribute('aria-label');
        else win.element.setAttribute('aria-label', title());
      }),
    );
    win.onShown(() => form.focus(this.model.state.activeField));
    // Closed by the user some other way (the close button): as Cancel, which may keep it open.
    win.onClosing((e) => {
      if (this.formEdit?.window !== win) return;
      if (e.reason === 'owner' || this.isDisposed) this.formEdit = null;
      else if (!this.cancelForm(true, true)) e.cancel = true;
    });
    this.formEdit!.window = win;
    void win.showDialog(this);
  }

  /** Save in the edit form: every field is kept, the row checked and saved as the save mode says; the form closes once it is. */
  private async saveForm(): Promise<boolean> {
    const fe = this.formEdit;
    const { model } = this;
    const st = model.state;
    if (!fe) return true;
    if (st.busy) return false;
    const unread = fe.form.keepAll();
    if (unread !== null) {
      fe.form.focus(unread);
      return false;
    }
    const { rowId } = fe;
    const bad = model.validate(rowId);
    if (bad !== null) {
      this.formError(bad);
      return false;
    }
    model.setSession(null);
    if (this.pendingInvalid === rowId) this.pendingInvalid = null;
    const result = model.commit(rowId);
    let ok = true;
    if (result !== true) {
      st.busy = true;
      ok = await result;
      st.busy = false;
      if (this.isDisposed) return ok;
    }
    if (this.formEdit !== fe) return ok;
    if (!ok) {
      model.setSession(rowId, fe.row);
      this.formError(this.firstErrorField(rowId));
      return false;
    }
    this.closeForm(true);
    return true;
  }

  /** A message stops the form from being saved: focus goes to its field. */
  private formError(field: string) {
    const fe = this.formEdit;
    if (!fe) return;
    fe.form.focus(field || undefined);
    this.model.announce(this.model.text('gridFixErrors'));
  }

  /**
   * Cancel in the edit form: the row's unsaved edits are dropped (a new row goes away) and the form
   * closes; `onEditCanceling` may keep it open. `closing`: its window is closing already.
   */
  private cancelForm(focusRow: boolean, closing = false): boolean {
    const fe = this.formEdit;
    if (!fe) return true;
    const { model } = this;
    const rows = [model.edit(fe.rowId)?.row ?? fe.row];
    if (!this.canDrop(rows)) return false;
    this.closeForm(false, closing);
    if (model.state.session === fe.rowId) model.setSession(null);
    if (this.pendingInvalid === fe.rowId) this.pendingInvalid = null;
    if (model.isNew(fe.rowId) && focusRow) this.removeNewRow(fe.rowId);
    else {
      model.discard(fe.rowId);
      if (focusRow) this.focusActive(true);
    }
    this.dropped(rows);
    return true;
  }

  /** The data is about to change (sort, filter, page, refresh) or the edit mode changed: the form is given up. */
  private dropForm() {
    if (this.formEdit && !this.cancelForm(false)) this.closeForm(false);
  }

  /** Takes the edit form away (and its window); with `focusRow`, focus goes back to the row. */
  private closeForm(focusRow: boolean, closing = false) {
    const fe = this.formEdit;
    if (!fe) return;
    this.formEdit = null;
    const hadFocus = fe.form.element.contains(this.element.ownerDocument.activeElement);
    if (fe.window) {
      if (!closing && fe.window.isOpen) fe.window.close();
    } else this.body.hideForm();
    if (!fe.form.isDisposed && !fe.window) void fe.form.dispose();
    this.syncTabStop();
    if (focusRow || (hadFocus && !fe.window)) this.focusActive(true);
  }

  /** Writes the editor's value into the row's draft and closes it; `false` (the editor stays) when it cannot be read. */
  private commitEditor(): boolean {
    const ed = this.editor;
    const at = this.editTarget;
    if (!ed || !at) return true;
    const r = ed.read();
    if (!r.ok) {
      this.model.setError(at.row, at.field, r.message);
      this.model.announce(r.message);
      ed.focus();
      return false;
    }
    const i = this.model.indexOfKey(at.rowId, this.model.state.activeRow);
    const col = this.model.columns.get(at.field);
    if (col.lookup) this.model.lookups.remember(col, r.value, ed.chosen());
    this.model.writeCell(at.rowId, at.row, at.field, r.value, i >= 0 ? this.model.dataIndex(i) : -1);
    this.closeEditor();
    return true;
  }

  /** Closes the editor without keeping its value. Focus goes back to its cell when it was inside. */
  private closeEditor() {
    const ed = this.editor;
    if (!ed) return;
    const cell = ed.element.parentElement;
    const hadFocus = ed.element.contains(this.element.ownerDocument.activeElement);
    this.editor = null;
    this.editTarget = null;
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
    if (this.commitEditor()) this.saveCell();
  }

  /** `editMode: 'cell'`: a row that is not new is handed to saving as each of its cells is left. */
  private savesEachCell(rowId: string | null | undefined): boolean {
    return this.model.editMode === 'cell' && !!rowId && !this.model.isNew(rowId);
  }

  /** In `'cell'` mode the cell just kept is saved now: the row is left (checked, then sent as the save mode says). */
  private saveCell() {
    if (this.savesEachCell(this.model.state.session)) this.leaveRowThen(() => this.focusActive(false));
  }

  /** Escape in an editor: a new row goes away; elsewhere the editor closes without keeping the value. */
  private cancelEdit() {
    const at = this.editTarget;
    if (at && this.model.isNew(at.rowId)) {
      const rows = [at.row];
      if (!this.canDrop(rows)) return;
      this.removeNewRow(at.rowId);
      this.dropped(rows);
      return;
    }
    this.closeEditor();
  }

  /** Asks `onEditCanceling` before the unsaved changes of `rows` are dropped. */
  private canDrop(rows: T[]): boolean {
    const ev = this.model.events;
    return ev.ask(ev.editCanceling, () => ({ rows, cancel: false }));
  }

  private dropped(rows: T[]) {
    const ev = this.model.events;
    ev.tell(ev.editCanceled, () => ({ rows }));
  }

  /** Escape on a cell: a new row goes away; an edited row gets its old values back. */
  private cancelRowEdits(): boolean {
    const { model } = this;
    const rowId = model.rowIdAt(model.state.activeRow);
    const rec = model.edit(rowId);
    if (!rowId || !rec || rec.saving) return false;
    if (rec.removed && !rec.isNew) return false;
    const rows = [rec.row];
    if (!this.canDrop(rows)) return true;
    if (rec.isNew) {
      this.removeNewRow(rowId);
      this.dropped(rows);
      return true;
    }
    model.discard(rowId);
    if (model.state.session === rowId) model.setSession(null);
    if (this.pendingInvalid === rowId) this.pendingInvalid = null;
    this.dropped(rows);
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
    const button = this.topBar.controlOf('addRowButton') as Button | null;
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
    if (model.editsInForm || rec?.saving || rec?.removed || !model.columns.canFill(st.activeField, row, !!rec?.isNew)) return false;
    if (st.session && st.session !== rowId) return false;
    const col = model.columns.get(st.activeField);
    model.writeCell(rowId, row, st.activeField, value(model.value(rowId, row, col)), model.dataIndex(i));
    model.setSession(rowId);
    this.saveCell();
    return true;
  }

  /**
   * Tab (or Shift+Tab) in edit mode: to the next editable cell of the row; at the end of a new row the
   * chain opens the next new row; at the end of another row, to the next row; at the edge of the
   * grid, out of the grid. Leaving a row saves it as the mode says.
   */
  private moveWithTab(dir: 1 | -1, fromAdaptive = false) {
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
    // The row's adaptive detail holds more of its cells: Tab goes on into it.
    const form = dir > 0 && !fromAdaptive ? this.adaptiveFormAt(i) : null;
    if (form && this.commitEditor() && form.focusFirst()) return;
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
      const i = model.insertAdded(k >= 0 ? k + 1 : model.addedRows.length);
      if (i >= 0) this.openNewRow(i);
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
    if (this.formEdit) return;
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
    // A band has a header only: in the rows, its first column.
    const cols = model.columns;
    if (row !== HEADER_ROW && cols.isBand(field)) field = cols.leavesIn(field, cols.visible())[0] ?? cols.visibleData()[0] ?? field;
    if (st.busy || !this.canMoveTo(row, field)) return false;
    const target = row >= 0 ? model.rowIdAt(row) : undefined;
    if (this.formEdit) {
      if (!opts.edit || target === this.formEdit.rowId) {
        this.goToCell(row, field, opts);
        return true;
      }
      // Editing another row gives up the form, as Cancel does.
      if (!this.cancelForm(false)) return false;
    }
    if (st.session && target === st.session && !this.savesEachCell(st.session)) {
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
    const detail = this.body.detailOf(target);
    if (detail) {
      this.enterDetail(detail);
      return;
    }
    if (this.inForm(target)) {
      const i = this.body.formIndex();
      if (i >= 0 && i !== this.model.state.activeRow) this.setActive(i, this.model.state.activeField);
      this.syncTabStop();
      return;
    }
    const filterCell = target.closest?.('.mx-data-grid__filter-cell') as HTMLElement | null;
    if (filterCell) {
      if (!this.canMoveTo(FILTER_ROW, filterCell.dataset.field ?? '')) {
        this.focusActive(false);
        return;
      }
      if (this.model.state.session) this.leave();
      this.setActive(FILTER_ROW, filterCell.dataset.field ?? '');
      this.syncTabStop();
      return;
    }
    // The row of totals: the rows are left, as for any place outside them.
    if (target.classList.contains('mx-data-grid__total-row')) {
      if (this.editor && !this.commitEditor()) return;
      if (this.model.state.session) this.leave();
      return;
    }
    const groupCell = target.closest?.('.mx-data-grid__group-cell') ?? (target.classList.contains('mx-data-grid__group-footer') ? target : null);
    if (groupCell) {
      const group = this.body.groupRowOf(groupCell) ?? this.body.footerRowOf(groupCell);
      if (!group || group.index < 0) return;
      if (!this.canMoveTo(group.index, this.model.state.activeField)) {
        this.focusActive(false);
        return;
      }
      if (this.editor && !this.commitEditor()) return;
      if (this.model.state.session) this.leave();
      this.setActive(group.index, this.model.state.activeField);
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
      const band = cell.dataset.band;
      if (band) {
        if (!this.canMoveTo(HEADER_ROW, band)) {
          this.focusActive(false);
          return;
        }
        this.leave();
        this.setActive(HEADER_ROW, band);
        this.syncTabStop();
        return;
      }
      if (!this.canMoveTo(HEADER_ROW, field)) {
        this.focusActive(false);
        return;
      }
      this.leave();
      this.setActive(HEADER_ROW, field);
    } else {
      const row = this.body.rowOf(cell);
      if (!row || row.index < 0) return;
      if (!this.canMoveTo(row.index, field)) {
        this.focusActive(false);
        return;
      }
      if (this.editor) {
        const same = this.editTarget?.rowId === row.rowId && this.editTarget?.field === field;
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
    if (this.formEdit) return;
    // Leaving the rows ends the edit; focus that only moved inside the grid's own work comes back at
    // once, and switching windows keeps everything as it is.
    if (!next && typeof this.element.ownerDocument.hasFocus === 'function' && !this.element.ownerDocument.hasFocus()) return;
    queueMicrotask(() => {
      if (!this.isDisposed && !vp?.contains(this.element.ownerDocument.activeElement)) this.leave();
    });
  }

  /** A press on a cell of another row: leave the current row first (it may block or wait). */
  private onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    this.rowDrag.press(e);
    const target = e.target as HTMLElement;
    if (this.editor?.element.contains(target) || this.inForm(target) || this.body.detailOf(target)) return;
    const group = this.body.groupRowOf(target) ?? this.body.footerRowOf(target);
    if (group && group.index >= 0) {
      // Leaving the row being edited for a group row or footer may block or wait, as for any row.
      const st = this.model.state;
      if (st.busy || st.session) e.preventDefault();
      if (!st.busy && st.session) this.navigate(group.index, st.activeField, { reveal: false });
      return;
    }
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
    const target = e.target as HTMLElement;
    if (this.editor?.element.contains(target) || this.inForm(target) || this.body.detailOf(target)) return;
    const group = this.body.groupRowOf(target);
    if (group?.node && group.index >= 0) {
      this.askClick(e, true, group.cell, group.element, group.index, group.node.field, group.node);
      return;
    }
    const footer = this.body.footerRowOf(target);
    if (footer?.node && footer.index >= 0) {
      const cell = (target.closest?.('.mx-data-grid__cell') as HTMLElement | null) ?? footer.element;
      this.askClick(e, true, cell, footer.element, footer.index, cell.dataset.field ?? '', footer.node);
      return;
    }
    if (this.clickedTotals(e, true)) return;
    const cell = target.closest?.('.mx-data-grid__cell') as HTMLElement | null;
    const row = cell ? this.body.rowOf(cell) : undefined;
    if (!cell || !row || row.index < 0) return;
    if (!this.askClick(e, true, cell, row.element, row.index, cell.dataset.field ?? '', null)) return;
    if (row.index !== this.model.state.activeRow || this.columnSetting(cell.dataset.field ?? '', 'startEditAction') !== 'dblClick') return;
    this.startEdit();
  }

  /** The click events of a cell and of its row; whether the grid may go on with its own handling. */
  private askClick(e: MouseEvent, double: boolean, cell: HTMLElement, rowEl: HTMLElement, index: number, field: string, group: GroupNode | null, rowType = this.rowTypeOf(index)): boolean {
    const { model } = this;
    const ev = model.events;
    const row = group || rowType === 'totalFooter' ? undefined : model.rowAt(index);
    const groupKey = group ? [...group.path] : undefined;
    const cellOk = ev.ask(double ? ev.cellDblClick : ev.cellClick, () => ({ field, row, rowIndex: index, rowType, groupKey, element: cell, event: e, cancel: false }));
    const rowOk = ev.ask(double ? ev.rowDblClick : ev.rowClick, () => ({ row, rowIndex: index, rowType, groupKey, element: rowEl, event: e, cancel: false }));
    return cellOk && rowOk;
  }

  /** A click on the row of totals: its cell's and its row's events (`rowType: 'totalFooter'`). */
  private clickedTotals(e: MouseEvent, double: boolean): boolean {
    const target = e.target as HTMLElement;
    const row = target.closest?.('.mx-data-grid__total-row') as HTMLElement | null;
    if (!row) return false;
    const cell = (target.closest('.mx-data-grid__cell') as HTMLElement | null) ?? row;
    this.askClick(e, double, cell, row, this.model.count, cell.dataset.field ?? '', null, 'totalFooter');
    return true;
  }

  /** A right click on a row: its menu, when `onContextMenuPreparing` gives it items. */
  private onContextMenu(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (this.editor?.element.contains(target) || this.inForm(target) || this.body.detailOf(target)) return;
    const group = this.body.groupRowOf(target);
    const footer = group ? undefined : this.body.footerRowOf(target);
    const cell = group ? group.cell : footer ? footer.element : (target.closest?.('.mx-data-grid__cell') as HTMLElement | null);
    const index = group ? group.index : footer ? footer.index : cell ? (this.body.rowOf(cell)?.index ?? -1) : -1;
    if (!cell || index < 0) return;
    const field = group?.node?.field ?? cell.dataset.field ?? '';
    // A data row's menu belongs to that row: it becomes the active one (the selection stays).
    if (!group && !footer && index !== this.model.state.activeRow) this.navigate(index, field, { reveal: false });
    if (this.openRowMenu(index, field, cell)) e.preventDefault();
  }

  /** A row's menu: the row's actions, and what `onContextMenuPreparing` makes of them. Returns whether it opened. */
  private openRowMenu(index: number, field: string, anchor: HTMLElement): boolean {
    const { model } = this;
    const row = model.groupAt(index) || model.footerAt(index) ? undefined : model.rowAt(index);
    const own = row !== undefined && !model.state.busy ? untracked(() => this.actionMenuItems(row)) : [];
    const items = this.prepareMenu('row', field, index, row, own);
    if (!items?.length) return false;
    this.moreMenu.open(items, anchor, model.text('gridRowMenu'));
    return true;
  }

  /** The items of a menu about to open, as `onContextMenuPreparing` leaves them; `null` when it cancels. */
  private prepareMenu(target: 'header' | 'row', field: string, rowIndex: number, row: T | undefined, items: MenuItem[]): MenuItem[] | null {
    const ev = this.model.events;
    if (!ev.listened(ev.contextMenuPreparing)) return items;
    const e = { target, field, row, rowIndex, items: [...items], cancel: false };
    ev.contextMenuPreparing.fire(e);
    return e.cancel ? null : e.items;
  }

  /** `onKeyHandling`: whether the grid may handle the key. */
  private askKey(e: KeyboardEvent): boolean {
    const { model } = this;
    const st = model.state;
    return model.events.ask(model.events.keyHandling, () => ({ event: e, rowIndex: st.activeRow, field: st.activeField, cancel: false }));
  }

  private onClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (this.editor?.element.contains(target) || this.inForm(target) || this.body.detailOf(target)) return;
    const action = target.closest?.('.mx-data-grid__action') as HTMLElement | null;
    if (action) {
      this.pressAction(action);
      return;
    }
    const condition = target.closest?.('.mx-data-grid__condition') as HTMLElement | null;
    if (condition) {
      const field = (condition.closest('.mx-data-grid__filter-cell') as HTMLElement | null)?.dataset.field;
      if (field) this.openConditions(field);
      return;
    }
    const group = this.body.groupRowOf(target);
    if (group?.node && group.index >= 0) {
      if (!this.askClick(e, false, group.cell, group.element, group.index, group.node.field, group.node)) return;
      // The arrow opens and closes; with `groupExpandMode: 'rowClick'` the whole row does.
      const { model } = this;
      const onArrow = !!target.closest('.mx-data-grid__group-toggle');
      if (model.canCollapse(group.node) && (onArrow || model.expandModeOf(group.node) === 'rowClick')) {
        this.toggleGroup(group.node, !model.groups.isExpanded(group.node));
      }
      return;
    }
    const footer = this.body.footerRowOf(target);
    if (footer?.node && footer.index >= 0) {
      const cell = (target.closest?.('.mx-data-grid__cell') as HTMLElement | null) ?? footer.element;
      this.askClick(e, false, cell, footer.element, footer.index, cell.dataset.field ?? '', footer.node);
      return;
    }
    if (this.clickedTotals(e, false)) return;
    const cell = target.closest?.('.mx-data-grid__cell') as HTMLElement | null;
    const view = cell ? this.body.rowOf(cell) : undefined;
    if (!cell || !view || view.index < 0) return;
    const field = cell.dataset.field ?? '';
    if (!this.askClick(e, false, cell, view.element, view.index, field, null)) return;
    // The expand cell opens and closes the row's details, and leaves the selection as it is; so does the "…" cell with the adaptive detail.
    if (field === EXPAND_FIELD) {
      if (this.model.details.enabled) this.toggleDetail(view.index, !this.model.isDetailOpen(view.index));
      return;
    }
    if (field === ADAPTIVE_FIELD) {
      this.toggleAdaptive(view.index, !this.model.adaptive.isOpen(view.rowId));
      return;
    }
    this.clickSelect(e, view, field);
    const { model } = this;
    if (!model.columns.isInternal(field) && this.columnSetting(field, 'startEditAction') === 'click' && view.index === model.state.activeRow && field === model.state.activeField) this.startEdit();
  }

  /** Opens or closes a group, telling it before (it can be cancelled) and after. */
  private toggleGroup(node: GroupNode, open: boolean): boolean {
    const { model } = this;
    if (model.groups.isExpanded(node) === open) return false;
    const ev = model.events;
    const e: GridRowExpandingEventArgs = { kind: 'group', key: [...node.path], cancel: false };
    (open ? ev.rowExpanding : ev.rowCollapsing).fire(e);
    if (e.cancel || !model.setGroupExpanded(node, open)) return false;
    (open ? ev.rowExpanded : ev.rowCollapsed).fire({ kind: 'group', key: [...node.path] });
    return true;
  }

  /** Opens or closes the details of grid row `i`, telling it before (it can be cancelled) and after. */
  private toggleDetail(i: number, open: boolean): boolean {
    const { model } = this;
    const id = model.detailId(i);
    const row = model.rowAt(i);
    if (id === undefined || row === undefined || model.isDetailOpen(i) === open) return false;
    const key = model.data.source.adapter.keyOf(row);
    const ev = model.events;
    const e: GridRowExpandingEventArgs = { kind: 'detail', key, row, cancel: false };
    (open ? ev.rowExpanding : ev.rowCollapsing).fire(e);
    if (e.cancel) return false;
    // Focus in the details goes back to their row before they close.
    if (!open && this.body.detailAt(i)?.element.contains(this.element.ownerDocument.activeElement)) this.backToRow(i);
    model.details.setOpen(id, key, open);
    this.body.relayout(true);
    (open ? ev.rowExpanded : ev.rowCollapsed).fire({ kind: 'detail', key, row });
    return true;
  }

  /**
   * Keys on the expand cell: `toggleKeys` open and close the details; with `arrowKeys` Right opens
   * closed ones and Left closes open ones (otherwise they move, as on any cell).
   */
  private onExpandKey(e: KeyboardEvent, row: number): boolean {
    const { model } = this;
    if (e.ctrlKey || e.metaKey || e.altKey || !model.details.enabled || model.detailId(row) === undefined) return false;
    const options = model.details.options;
    const open = model.isDetailOpen(row);
    if (options.get('toggleKeys').includes(e.key)) {
      e.preventDefault();
      this.toggleDetail(row, !open);
      return true;
    }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.shiftKey && options.get('arrowKeys')) {
      const forward = (e.key === 'ArrowRight') !== this.isRtl();
      if (forward === open) return false;
      e.preventDefault();
      this.toggleDetail(row, forward);
      return true;
    }
    return false;
  }

  /** Focus went into a row's details: that row becomes the active one, as if focus were on it. */
  private enterDetail(detail: DetailRow<T>) {
    const { model } = this;
    const i = detail.index;
    this.tip.hide();
    if (i < 0) return;
    if (this.editor && !this.commitEditor()) this.closeEditor();
    if (model.state.session && model.state.session !== model.rowIdAt(i)) this.leave();
    if (i !== model.state.activeRow && this.canMoveTo(i, model.state.activeField)) this.setActive(i, model.state.activeField);
    this.syncTabStop();
  }

  /**
   * Keys in a row's details belong to their content. What it leaves: Escape, and Shift+Tab on its
   * first stop, go back to the row; Tab on its last stop leaves the grid; on the details' own cell
   * Tab and Enter go into the content.
   */
  private onDetailKey(e: KeyboardEvent, detail: DetailRow<T>) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target as HTMLElement;
    const onCell = target === detail.cell;
    const stops = e.key === 'Tab' || e.key === 'Enter' ? tabbableIn(detail.cell) : [];
    if (e.key === 'Escape' || (e.key === 'Tab' && e.shiftKey && (onCell || stops[0] === target))) {
      e.preventDefault();
      this.backToRow(detail.index);
    } else if (e.key === 'Tab' && !e.shiftKey && onCell && stops.length) {
      e.preventDefault();
      stops[0].focus();
    } else if (e.key === 'Tab' && !e.shiftKey && (onCell || stops[stops.length - 1] === target)) {
      e.preventDefault();
      this.tabOnFrom(detail);
    } else if (e.key === 'Enter' && onCell) {
      const first = stops[0] ?? focusableIn(detail.cell)[0];
      if (first) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /**
   * Tab on the last stop of a row's adaptive detail or details: into the row's details after it;
   * from an adaptive detail whose row is being edited, on to the next row's cells, as Tab goes in
   * edit mode; else out of the grid.
   */
  private tabOnFrom(detail: DetailRow<T>) {
    const { model } = this;
    const under = this.body.detailsUnder(detail.index);
    const next = under[under.indexOf(detail) + 1];
    if (next) {
      (tabbableIn(next.cell)[0] ?? next.cell).focus();
      return;
    }
    const i = detail.index;
    if (detail.kind === 'adaptive' && i >= 0 && model.state.session === model.rowIdAt(i)) {
      const fields = this.editableFields(i);
      this.setActive(i, fields[fields.length - 1] ?? model.state.activeField);
      this.moveWithTab(1, true);
      return;
    }
    this.moveFocusOut(true);
  }

  /** Focus back on grid row `i` (the active cell's column), from its details. */
  private backToRow(i: number) {
    const st = this.model.state;
    if (i >= 0 && i !== st.activeRow) {
      if (!this.canMoveTo(i, st.activeField)) return;
      this.setActive(i, st.activeField);
    }
    this.focusActive(true);
  }

  /** Tab with details in the body: into the details of the row it is on, else out of the grid (never into another row's details). */
  private tabFromRow(e: KeyboardEvent, row: number) {
    e.preventDefault();
    const detail = row >= 0 && !e.shiftKey ? this.body.detailsUnder(row)[0] : undefined;
    if (detail) (tabbableIn(detail.cell)[0] ?? detail.cell).focus();
    else this.moveFocusOut(!e.shiftKey);
  }

  /** Focus in a row's details goes back to the row (before every detail closes). */
  private leaveDetails() {
    const detail = this.body.detailOf(this.element.ownerDocument.activeElement);
    if (detail?.kind === 'detail') this.backToRow(detail.index);
  }

  /** Focus in the adaptive detail goes back to its row (before it closes). */
  private leaveAdaptive() {
    const detail = this.body.detailOf(this.element.ownerDocument.activeElement);
    if (detail?.kind === 'adaptive') this.backToRow(detail.index >= 0 ? detail.index : this.model.adaptiveIndex());
  }

  /**
   * Opens or closes the adaptive detail of grid row `i` (a data or new row, while columns are
   * hidden), telling it before (it can be cancelled) and after. Another row's open one closes first.
   */
  private toggleAdaptive(i: number, open: boolean): boolean {
    const { model } = this;
    const a = model.adaptive;
    const rowId = model.rowIdAt(i);
    const row = model.rowAt(i);
    if (rowId === undefined || row === undefined || model.groupAt(i) || model.footerAt(i) || a.isOpen(rowId) === open) return false;
    if (open && (!model.columns.state.adaptive.length || !this.closeAdaptive())) return false;
    const key = this.getKeyByRowIndex(i);
    const ev = model.events;
    if (!ev.ask(open ? ev.adaptiveDetailRowExpanding : ev.adaptiveDetailRowCollapsing, () => ({ row, key, rowIndex: i, cancel: false }))) return false;
    if (!open && this.body.adaptiveAt(i)?.element.contains(this.element.ownerDocument.activeElement)) this.backToRow(i);
    if (open) a.open(rowId, key);
    else a.close();
    this.body.relayout(true);
    ev.tell(open ? ev.adaptiveDetailRowExpanded : ev.adaptiveDetailRowCollapsed, () => ({ row, key, rowIndex: i }));
    return true;
  }

  /** Closes the adaptive detail that is open (as the user would, when its row is there). */
  private closeAdaptive(): boolean {
    const { model } = this;
    const id = model.adaptive.state.rowId;
    if (id === null) return true;
    const i = model.adaptiveIndex();
    if (i >= 0) return this.toggleAdaptive(i, false);
    model.adaptive.close();
    this.body.relayout(true);
    return true;
  }

  /** Keys on the "…" cell: `toggleKeys` open and close the adaptive detail. */
  private onAdaptiveKey(e: KeyboardEvent, row: number): boolean {
    const { model } = this;
    if (e.ctrlKey || e.metaKey || e.altKey || !model.adaptive.options.get('toggleKeys').includes(e.key)) return false;
    e.preventDefault();
    this.toggleAdaptive(row, !model.adaptive.isOpen(model.rowIdAt(row)));
    return true;
  }

  /** Editing a row whose hidden columns it can fill opens its adaptive detail (`expandOnEdit`, the `'row'` edit mode); leaving the row closes it. */
  private openAdaptiveForEdit(i: number) {
    const { model } = this;
    const a = model.adaptive;
    const rowId = model.rowIdAt(i);
    const row = model.rowAt(i);
    if (!rowId || row === undefined || a.isOpen(rowId) || model.editMode !== 'row' || !a.options.get('expandOnEdit') || !a.options.get('editors')) return;
    const isNew = model.isNew(rowId);
    if (!model.columns.state.adaptive.some((f) => model.columns.canFill(f, row, isNew))) return;
    if (this.toggleAdaptive(i, true)) a.state.auto = true;
  }

  /** The adaptive detail's form under grid row `i`, while it is drawn. */
  private adaptiveFormAt(i: number): AdaptiveForm<T> | null {
    const content = this.body.adaptiveAt(i)?.component;
    return content instanceof AdaptiveForm ? content : null;
  }

  /** What a row's adaptive detail holds: the hidden columns' values, editors where the row can be edited in its cells. */
  private adaptiveForm(rowId: string, row: T): AdaptiveForm<T> {
    const { model } = this;
    return new AdaptiveForm<T>(model, rowId, row, {
      save: () => undefined,
      cancel: () => {
        const i = model.adaptiveIndex();
        if (i >= 0) this.backToRow(i);
      },
      prepare: (field, r, isNew, options) => {
        const e: GridEditorPreparingEventArgs<T> = { field, row: { ...r }, isNew, options, cancel: false };
        model.events.editorPreparing.fire(e);
        return !e.cancel;
      },
      prepared: (field, r, isNew, editor) => this.editorPrepared(field, r, isNew, editor, 'adaptive'),
      // Its editors edit the row as its cells do: the row becomes the one being edited.
      begin: () => {
        const st = model.state;
        if (st.session === rowId || st.busy) return;
        if (this.editor && !this.commitEditor()) this.closeEditor();
        if (st.session) this.leave();
        model.setSession(rowId, row);
      },
      kept: () => {
        if (this.savesEachCell(rowId) && model.state.session === rowId) this.leaveRowThen(() => undefined);
      },
    });
  }

  /**
   * Keys on a group row: `groupToggleKeys` (Enter and Space) open or close it; with `groupArrowKeys`
   * Right opens it, or goes to its first row when it is open, and Left closes it, or goes to the
   * group it is in. Keys that edit do nothing there.
   */
  private onGroupKey(e: KeyboardEvent, row: number, node: GroupNode): boolean {
    const { model } = this;
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    const open = model.groups.isExpanded(node);
    const can = model.canCollapse(node);
    if (model.settings.get('groupToggleKeys').includes(e.key)) {
      e.preventDefault();
      if (can) this.toggleGroup(node, !open);
      return true;
    }
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        if (e.shiftKey || !model.settings.get('groupArrowKeys')) return false;
        e.preventDefault();
        const forward = (e.key === 'ArrowRight') !== this.isRtl();
        if (forward && !open && can) this.toggleGroup(node, true);
        else if (forward && open) this.navigate(model.stepRow(row, 1), model.state.activeField);
        else if (!forward && open && can) this.toggleGroup(node, false);
        else if (!forward && node.level > 0) {
          for (let i = row - 1; i >= 0; i--) {
            const above = model.groupAt(i);
            if (above && above.level === node.level - 1) {
              this.navigate(i, model.state.activeField);
              break;
            }
          }
        }
        return true;
      }
      case 'F2':
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        return true;
      default:
        return e.key.length === 1;
    }
  }

  private hasMenu(field: string): boolean {
    const cols = this.model.columns;
    return (cols.defs.has(field) || cols.isBand(field)) && cols.can(field, 'menu') && this.menu.hasEntries(field);
  }

  private openMenu(field: string, anchor: HTMLElement) {
    this.setActive(HEADER_ROW, field);
    this.syncTabStop();
    this.menu.open(field, anchor, this.headerCellOf(field)!, (items) => this.prepareMenu('header', field, HEADER_ROW, undefined, items));
  }

  /**
   * Keys on a band's header: Left and Right (Home, End) go along the bands of its row, Up to the band
   * it is in, Down to the first column or band under it; Alt+Down and the context menu key open its
   * menu.
   */
  private onBandKey(e: KeyboardEvent, id: string) {
    const cols = this.model.columns;
    const visible = cols.visible();
    const row = cols
      .shownBands(visible)
      .filter((b) => b.depth === cols.depthOf(id))
      .sort((a, b) => a.first - b.first)
      .map((b) => b.id);
    const at = row.indexOf(id);
    let to: string | null | undefined;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft':
        to = row[at + ((e.key === 'ArrowRight') !== this.isRtl() ? 1 : -1)];
        break;
      case 'Home':
        to = row[0];
        break;
      case 'End':
        to = row[row.length - 1];
        break;
      case 'ArrowUp':
        to = cols.bandOf(id);
        break;
      case 'ArrowDown': {
        if (e.altKey) {
          e.preventDefault();
          if (this.hasMenu(id)) this.openMenu(id, this.headerCellOf(id)!);
          return;
        }
        const first = cols.leavesIn(id, visible)[0];
        to = first === undefined ? undefined : cols.childOf(first, id);
        break;
      }
      case 'ContextMenu':
      case 'F10':
        if (e.key === 'F10' && !e.shiftKey) return;
        e.preventDefault();
        if (this.hasMenu(id)) this.openMenu(id, this.headerCellOf(id)!);
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        return;
      default:
        return;
    }
    e.preventDefault();
    if (to) this.navigate(HEADER_ROW, to);
  }

  /** Fits a column to its header and the rows shown now; in `'nextColumn'` mode the next column gives or takes the difference, unless `alone`. */
  private autoSize(field: string, alone = false) {
    const headerCell = this.header.cellElement(field);
    if (!headerCell) return;
    const title = headerCell.querySelector<HTMLElement>('.mx-data-grid__title');
    let width = title ? headerCell.offsetWidth - title.offsetWidth + textWidth(title) : headerCell.offsetWidth;
    for (const cell of this.body.renderedCells(field)) {
      const style = getComputedStyle(cell);
      const pad = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) || 0;
      width = Math.max(width, textWidth(cell) + pad);
    }
    const cols = this.model.columns;
    const next = alone ? undefined : cols.partnerOf(field);
    if (next) cols.resizeWithNext(field, next, this.header.shownWidth(field) + this.header.shownWidth(next), Math.ceil(width) + 2);
    else cols.resize(field, Math.ceil(width) + 2);
  }

  /** A chip dropped on the headers: the column is ungrouped and, when it can move, put where it was dropped. */
  private dropOnHeaders(field: string, x: number) {
    const { model } = this;
    const cols = model.columns;
    const index = this.header.chipDropIndex(field, x);
    if (!model.groupDropAllowed(field, 'chip', 'headers', index)) return;
    model.ungroup(field, true);
    if (index >= 0 && cols.can(field, 'movable') && cols.move(field, index)) model.layoutChanged();
  }

  /** Keyboard move or resize, from the column menu. */
  private startAdjust(kind: 'move' | 'resize', field: string) {
    const { model } = this;
    const cols = model.columns;
    model.state.adjust = { kind, field, original: kind === 'move' ? [...cols.state.order] : { width: { ...cols.state.width }, flex: { ...cols.state.flex } } };
    if (kind === 'resize') {
      // Steps start from the widths on screen: a flexing column is wider than its setting.
      const shown = this.header.shownWidth(field);
      const next = cols.partnerOf(field);
      if (next) cols.resizeWithNext(field, next, shown + this.header.shownWidth(next), shown);
      else cols.resize(field, shown);
    }
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
      else {
        const { width, flex } = adjust.original as { width: Record<string, number>; flex: Record<string, number> };
        cols.state.width = width;
        cols.state.flex = flex;
      }
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
        const beside = cols.siblings(adjust.field);
        model.announce(model.text('gridMovedTo', { title, position: beside.indexOf(adjust.field) + 1, count: beside.length }));
      } else {
        const step = model.settings.get(e.shiftKey ? 'resizeFineStep' : 'resizeStep');
        const px = cols.width(adjust.field) + (forward ? step : -step);
        const next = cols.partnerOf(adjust.field);
        const w = next ? cols.resizeWithNext(adjust.field, next, cols.width(adjust.field) + cols.width(next), px) : cols.resize(adjust.field, px);
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
    // Keys in a row's details are their content's.
    if (this.body.detailOf(e.target as Element)) return;
    // Every key in the rows comes here first: the app may take it.
    if (!this.askKey(e)) {
      this.skippedKey = e;
      return;
    }
    const ed = this.editor;
    // Escape on a lookup's closed list ends the edit (the list would empty a field that has a clear button).
    if (ed?.kind === 'lookup' && e.key === 'Escape' && e.target === ed.input && !ed.listOpen) {
      e.preventDefault();
      e.stopPropagation();
      this.cancelEdit();
      return;
    }
    if (!ed || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (ed.kind === 'list' || ed.kind === 'lookup' || ed.kind === 'custom' || e.target !== ed.input) return;
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
    if (this.skippedKey === e) {
      this.skippedKey = null;
      return;
    }
    const target = e.target as HTMLElement;
    const detail = this.body.detailOf(target);
    if (detail) {
      this.onDetailKey(e, detail);
      return;
    }
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
    if (!target.matches?.('.mx-data-grid__cell, .mx-data-grid__form-cell, .mx-data-grid__group-cell, .mx-data-grid__group-footer, .mx-data-grid__header-cell, .mx-data-grid__filter-cell, .mx-data-grid__action, .mx-data-grid__condition')) return;
    if (st.adjust) {
      if (this.onAdjustKey(e)) e.preventDefault();
      return;
    }
    if (st.activeRow === HEADER_ROW && model.columns.isBand(st.activeField)) {
      this.onBandKey(e, st.activeField);
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

    const group = onRow ? model.groupAt(row) : null;
    if (group && this.onGroupKey(e, row, group)) return;
    if (onRow && !group && this.rowDrag.onKey(e, row)) return;
    if (onRow && !group && field === EXPAND_FIELD && this.onExpandKey(e, row)) return;
    if (onRow && !group && field === ADAPTIVE_FIELD && this.onAdaptiveKey(e, row)) return;
    // With details in the body, Tab goes into the row's own details or out of the grid, not into another row's.
    if (e.key === 'Tab' && !ctrl && !e.altKey && this.body.drawnDetails().length) {
      this.tabFromRow(e, row);
      return;
    }
    // A group footer is read, not edited: keys that edit or select do nothing there.
    if (onRow && !group && model.footerAt(row) && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key.length === 1 || model.settings.get('editKeys').includes(e.key) || model.settings.get('clearKeys').includes(e.key) || e.key === 'Backspace')) {
      e.preventDefault();
      return;
    }

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
    if ((onRow || row === FILTER_ROW) && model.settings.get('clearKeys').includes(e.key)) {
      if (row === FILTER_ROW) {
        e.preventDefault();
        model.filters.clear(field, 'row');
      } else if (this.writeActiveCell(() => null)) e.preventDefault();
      return;
    }
    if (onRow && model.settings.get('editKeys').includes(e.key)) {
      e.preventDefault();
      this.startEdit();
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
        // From a column's header up to its band's.
        if (row === HEADER_ROW && model.columns.bandOf(field) && model.columns.bandShown(model.columns.bandOf(field)!)) {
          e.preventDefault();
          this.navigate(HEADER_ROW, model.columns.bandOf(field)!);
          return;
        }
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
        // Infinite: the last row shown, and the next part.
        if (ctrl && hasRows) model.loadMore();
        break;
      case 'PageDown':
      case 'PageUp': {
        const down = e.key === 'PageDown';
        // Paged, the keys turn the page (`pageKeys`); on the last or first page they move a screen of rows.
        const turn = model.mode === 'paged' && model.settings.get('pageKeys') === 'page' && (down ? st.page < model.pageCount() - 1 : st.page > 0);
        if (turn && row >= 0) {
          e.preventDefault();
          this.page = st.page + (down ? 1 : -1);
          this.focusActive(true);
          return;
        }
        if (down ? !hasRows : row < 0) break;
        row = down ? (row < 0 ? first : model.stepRow(row, this.body.pageRows())) : model.stepRow(row, -this.body.pageRows());
        break;
      }
      case 'Enter':
      case 'F2':
        if (row === HEADER_ROW) {
          e.preventDefault();
          if (e.key === 'Enter' && field === SELECT_FIELD) this.toggleAll();
          else if (e.key === 'Enter') model.toggleSort(field, e.shiftKey);
        } else if (row === FILTER_ROW) {
          e.preventDefault();
          this.filterCell(field)?.focus();
        }
        return;
      case 'Escape':
        // An editor that could not take focus (disabled by onEditorPreparing) closes first.
        if (this.editor) {
          e.preventDefault();
          this.cancelEdit();
        } else if (onRow && this.cancelRowEdits()) e.preventDefault();
        return;
      case 'Backspace':
        e.preventDefault();
        if (row === FILTER_ROW) model.filters.clear(field, 'row');
        else if (onRow && !(this.columnSetting(field, 'editOnKeyPress') && this.startEdit(''))) this.writeActiveCell(() => null);
        return;
      case 'ContextMenu':
      case 'F10':
        if (e.key === 'F10' && !e.shiftKey) return;
        if (row === HEADER_ROW && this.hasMenu(st.activeField)) {
          this.openMenu(st.activeField, this.header.cellElement(st.activeField)!);
          e.preventDefault();
        } else if (onRow) {
          const cell = this.body.cellElement(row, field);
          if (cell && this.openRowMenu(row, field, cell)) e.preventDefault();
        }
        return;
      case ' ':
        e.preventDefault();
        if (row === HEADER_ROW && field === SELECT_FIELD && model.settings.get('selectAll')) this.toggleAll();
        if (row === FILTER_ROW) this.filterCell(field)?.focus();
        if (!onRow) return;
        if (mode !== 'none' && (e.shiftKey || field === SELECT_FIELD || !this.canFillActive())) this.toggleSelected(row);
        else if (model.columns.get(field).type === 'boolean') this.writeActiveCell((v) => !v);
        else if (this.columnSetting(field, 'editOnKeyPress')) this.startEdit(' ');
        return;
      default:
        if (row === FILTER_ROW && e.key.length === 1 && !ctrl && !e.altKey) {
          if (this.filterCell(field)?.focus(e.key)) e.preventDefault();
          return;
        }
        if (onRow && e.key.length === 1 && !ctrl && !e.altKey && this.columnSetting(field, 'editOnKeyPress') && this.startEdit(e.key)) e.preventDefault();
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
    this.model.data.forEachLoaded((row) => rows.push(row));
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
        multiple: false,
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
        onclickMany: (rows) => this.deleteRows(rows),
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
    if (this.formEdit?.rowId === target.rowId) {
      void this.saveForm();
      return;
    }
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
    if (this.formEdit?.rowId === target.rowId) {
      this.cancelForm(true);
      return;
    }
    const rows = [target.obj];
    if (!this.canDrop(rows)) return;
    if (this.editTarget?.rowId === target.rowId) this.closeEditor();
    if (model.isNew(target.rowId)) {
      this.removeNewRow(target.rowId);
      this.dropped(rows);
      return;
    }
    model.discard(target.rowId);
    if (model.state.session === target.rowId) model.setSession(null);
    if (this.pendingInvalid === target.rowId) this.pendingInvalid = null;
    this.focusActive(false);
    this.dropped(rows);
  }

  /** A press on an action button: the action runs, the "more" button opens its menu. */
  private pressAction(button: HTMLElement) {
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
    void this.run(this.entryOf(hit), 'row');
  }

  private openMore(view: GridRow<T>, button: HTMLElement) {
    const st = this.model.state;
    const items: MenuItem[] = (view.actions?.overflow ?? []).map((a) => ({
      text: a.text,
      icon: a.hasIcon ? a.action.icon : undefined,
      hint: a.action.hint,
      tone: a.action.tone,
      enabled: !a.disabled,
      beginGroup: a.action.beginGroup,
      data: a.action.id,
      click: () => {
        if (!st.busy && !(st.session && st.session !== view.rowId)) void this.run(this.entryOf(a), 'row');
      },
    }));
    this.moreMenu.open(items, button, this.model.text('gridMoreActions'));
  }

  /** Runs an action; the ready `remove` asks once for all its rows first (`confirmDelete`). */
  private async run(entry: ActionEntry<T>, location: GridActionRun['location']): Promise<GridActionRanEventArgs<T> | null> {
    if (entry.action.onclick !== this.builtIns.remove.onclick) return this.runner.run(entry, location);
    const saved = entry.items.filter((it) => !this.model.isNew(this.model.rowIdOf(it.row)));
    if (saved.length && !(await this.askDelete(saved.length))) return null;
    this.deleteConfirmed = true;
    try {
      return await this.runner.run(entry, location);
    } finally {
      this.deleteConfirmed = false;
    }
  }

  /** Asks before rows are deleted, unless `confirmDelete` is off or the deletion is only marked (batch). */
  private askDelete(count: number): Promise<boolean> {
    const { model } = this;
    if (this.deleteConfirmed || !model.settings.get('confirmDelete') || model.saveMode === 'batch') return Promise.resolve(true);
    const text = count > 1 ? model.text('gridConfirmDeleteRows', { count: model.formatter.count(count) }) : model.text('gridConfirmDelete');
    return confirm(text, { title: model.text('gridConfirmDeleteTitle'), buttons: ['yes', 'no'], host: this });
  }

  /** One row's action as an entry to run. */
  private entryOf(a: ResolvedAction<T>): ActionEntry<T> {
    return { action: a.action, text: a.text, count: 1, disabled: a.disabled, items: [{ row: a.row, state: a.state, action: a.action }], selection: null, fromSelection: false };
  }

  /**
   * Runs an action of a bar, a row's menu or code. The row being edited is left first (saved as the
   * mode says) unless the action is for that row alone.
   */
  private startEntry(entry: ActionEntry<T>, location: GridActionRun['location']): Promise<GridActionRanEventArgs<T> | null> {
    const { model } = this;
    const st = model.state;
    if (st.busy) return Promise.resolve(null);
    const own = entry.items.length === 1 && model.rowIdOf(entry.items[0].row) === st.session;
    if (!st.session || own) return this.run(entry, location);
    return new Promise((resolve) => {
      this.leaveRowThen(
        () => resolve(this.run(entry, location)),
        () => resolve(null),
      );
    });
  }

  /**
   * A row's actions for its context menu: the common ones of the selection when the row is one of
   * several selected rows, else the row's own; wherever they show.
   */
  private actionMenuItems(row: T): MenuItem[] {
    const { model } = this;
    const sets = model.actionSets;
    const sel = model.selection;
    const inSelection = model.settings.get('selection') === 'multiple' && sel.isSelected(model.selectId(row)) && sel.count(model.dataTotal) > 1;
    const target: ActionTarget<T> = inSelection ? sets.selectionTarget() : { kind: 'rows', rows: [row], from: 'focused' };
    return sets.entries(target, (a) => sets.inContextMenu(a)).map((e) => ({
      text: sets.label(e),
      icon: e.action.icon,
      hint: e.action.hint,
      tone: e.action.tone,
      enabled: !e.disabled,
      beginGroup: e.action.beginGroup,
      data: e.action.id,
      click: () => void this.startEntry(e, 'contextMenu'),
    }));
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
    const doc = this.element.ownerDocument;
    doc.addEventListener('copy', fill, true);
    try {
      if (typeof doc.execCommand === 'function') doc.execCommand('copy');
    } catch {
      // Not allowed here: the clipboard API below.
    } finally {
      doc.removeEventListener('copy', fill, true);
    }
    if (!written) void navigator.clipboard?.writeText?.(content.text).catch(() => undefined);
  }

  /** Ctrl+V on a cell: the browser raises `paste` next, at the page when no field has focus; take that one event. */
  private armPaste() {
    const doc = this.element.ownerDocument;
    const take = (e: ClipboardEvent) => {
      doc.removeEventListener('paste', take, true);
      this.onPaste(e);
    };
    doc.addEventListener('paste', take, true);
    setTimeout(() => doc.removeEventListener('paste', take, true), 0);
  }

  /** A paste while a cell (not a field) has focus. */
  private onPaste(e: ClipboardEvent) {
    const focus = this.element.ownerDocument.activeElement as HTMLElement | null;
    if (e.defaultPrevented || !this.model.settings.get('paste') || !focus || !this.viewportEl?.contains(focus) || !focus.classList.contains('mx-data-grid__cell') || this.body.detailOf(focus)) return;
    const text = e.clipboardData?.getData('text/plain');
    if (!text) return;
    e.preventDefault();
    this.paste(text);
  }

  /**
   * Collects the rows of an export, after `onExporting` when `ask` (which may change the options or
   * cancel: `null`). The load panel, when asked for, shows the progress and stops the export.
   */
  private async runExport<R extends ExportTable | GridSheet<T>>(
    format: string,
    options: GridExportOptions,
    collect: (options: GridExportOptions, signal: AbortSignal) => Promise<R>,
    ask = true,
  ): Promise<{ result: R; options: GridExportOptions } | null> {
    const { model } = this;
    const ev = model.events;
    if (ask && ev.listened(ev.exporting)) {
      const e: GridExportingEventArgs = { format, component: this, selectedRowsOnly: !!options.selected, options: { ...options }, cancel: false };
      ev.exporting.fire(e);
      if (e.cancel) return null;
      options = e.options;
    }
    const controller = new AbortController();
    const stop = () => controller.abort();
    options.signal?.addEventListener('abort', stop, { once: true });
    if (options.signal?.aborted) stop();
    this.exports.add(controller);
    model.state.exporting = true;
    model.announce(model.text('gridExporting'));
    const panel = this.openExportPanel(options.loadPanel, stop);
    const told = options.onProgress;
    const tracked: GridExportOptions = panel ? { ...options, onProgress: (loaded, total) => (this.showProgress(loaded, total), told?.(loaded, total)) } : options;
    try {
      const result = await collect(tracked, controller.signal);
      // Rows in memory come at once: a stop asked for meanwhile still stops it.
      controller.signal.throwIfAborted();
      const count = 'fields' in result ? result.rows.length : result.rows.filter((r) => r.rowType === 'data').length;
      model.announce(model.text('gridExported', { count: model.formatter.count(count) }));
      return { result, options };
    } catch (error) {
      const aborted = controller.signal.aborted;
      model.announce(model.text(aborted ? 'gridExportCanceled' : 'gridExportFailed'));
      // Stopped: the abort's reason (an `AbortError`), whatever the request failed with.
      throw aborted ? controller.signal.reason : error;
    } finally {
      options.signal?.removeEventListener('abort', stop);
      this.exports.delete(controller);
      if (panel && this.stopPanelExport === stop) {
        this.stopPanelExport = null;
        this.exportPanel.shown = false;
      }
      if (!this.isDisposed) model.state.exporting = this.exports.size > 0;
    }
  }

  /** Shows the load panel for an export that asks for it; whether it shows. */
  private openExportPanel(given: boolean | GridLoadPanel | undefined, stop: () => void): boolean {
    const panel: GridLoadPanel = typeof given === 'object' ? given : { enabled: !!given };
    if (panel.enabled === false) return false;
    const p = this.exportPanel;
    p.text = panel.text ?? '';
    p.progress = panel.showProgress !== false;
    p.cancel = panel.cancelButton !== false;
    p.loaded = 0;
    p.total = 0;
    p.shown = true;
    this.stopPanelExport = stop;
    return true;
  }

  private showProgress(loaded: number, total: number) {
    this.exportPanel.loaded = loaded;
    this.exportPanel.total = total;
  }

  /** A column's width on screen: its header cell's, else the width the grid keeps for it. */
  private shownWidth(field: string): number {
    const cell = this.headEl?.querySelector<HTMLElement>(`[data-field="${CSS.escape(field)}"]`);
    return cell && cell.offsetWidth > 0 ? cell.offsetWidth : this.model.columns.width(field);
  }

  /** The commands of the toolbar's export button, from `export`. Reactive. */
  private exportCommands(): ExportCommand[] {
    const sw = this.exportSwitches;
    const model = this.model;
    const texts = sw.get('texts') ?? {};
    const withSelected = !!sw.get('allowExportSelectedData') && model.settings.get('selection') !== 'none';
    const out: ExportCommand[] = [];
    for (const format of sw.get('formats') ?? ['csv']) {
      const name = { format: texts.formats?.[format] ?? this.formatName(format) };
      const run = (selected: boolean) => () => void this.exportTo(format, { selected }).catch(() => undefined);
      out.push({ format, selected: false, enabled: true, text: texts.exportAll ? fillTemplate(texts.exportAll, name) : model.text('gridExportAll', name), run: run(false) });
      if (withSelected) {
        const text = texts.exportSelectedRows ? fillTemplate(texts.exportSelectedRows, name) : model.text('gridExportSelectedRows', name);
        out.push({ format, selected: true, enabled: this.selectedCount > 0, text, run: run(true) });
      }
    }
    return out;
  }

  private formatName(format: string): string {
    const model = this.model;
    if (format === 'xlsx') return model.text('gridFormatXlsx');
    if (format === 'csv') return model.text('gridFormatCsv');
    if (format === 'pdf') return model.text('gridFormatPdf');
    return format.toUpperCase();
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
  const doc = el.ownerDocument;
  if (typeof doc.createRange !== 'function') return el.scrollWidth;
  const range = doc.createRange();
  range.selectNodeContents(el);
  const w = range.getBoundingClientRect?.().width ?? 0;
  return w || el.scrollWidth;
}
