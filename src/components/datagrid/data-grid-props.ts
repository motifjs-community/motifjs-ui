import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { ControlProps } from '../../core/control';
import type { UiStrings } from '../../core/ui-strings';
import type { GridActionItem } from './grid-action-item';
import type { GridActionRanEventArgs } from './grid-action-ran-event-args';
import type { GridActionRunningEventArgs } from './grid-action-running-event-args';
import type { GridCellClickEventArgs } from './grid-cell-click-event-args';
import type { GridCellPreparedEventArgs } from './grid-cell-prepared-event-args';
import type { GridContentReadyEventArgs } from './grid-content-ready-event-args';
import type { GridContextMenuPreparingEventArgs } from './grid-context-menu-preparing-event-args';
import type { GridCopyingEventArgs } from './grid-copying-event-args';
import type { GridDataErrorEventArgs } from './grid-data-error-event-args';
import type { GridEditCanceledEventArgs } from './grid-edit-canceled-event-args';
import type { GridEditCancelingEventArgs } from './grid-edit-canceling-event-args';
import type { GridEditingStartEventArgs } from './grid-editing-start-event-args';
import type { GridExportedEventArgs } from './grid-exported-event-args';
import type { GridExportSettings } from './grid-export-settings';
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
import type { GridToolbarPreparingEventArgs } from './grid-toolbar-preparing-event-args';
import type { LayoutStorage } from './layout-storage';
import type { GridEditForm } from './grid-edit-form';
import type { GridEditPopup } from './grid-edit-popup';
import type { GridMasterDetail } from './grid-master-detail';
import type { GridEditorPreparedEventArgs } from './grid-editor-prepared-event-args';
import type { GridEditorPreparingEventArgs } from './grid-editor-preparing-event-args';
import type { GridRowValidatingEventArgs } from './grid-row-validating-event-args';
import type { GridFilters } from './grid-filters';
import type { GridFilterBuilderClosedEventArgs } from './grid-filter-builder-closed-event-args';
import type { GridFilterBuilderClosingEventArgs } from './grid-filter-builder-closing-event-args';
import type { GridFilterBuilderOpenedEventArgs } from './grid-filter-builder-opened-event-args';
import type { GridFilterBuilderOpeningEventArgs } from './grid-filter-builder-opening-event-args';
import type { GridFilterBuilderOptions } from './grid-filter-builder-options';
import type { GridFilterBuilderPopup } from './grid-filter-builder-popup';
import type { GridFilterPanelTextInfo } from './grid-filter-panel-text-info';
import type { GridGroupDroppingEventArgs } from './grid-group-dropping-event-args';
import type { GridGroupingChangedEventArgs } from './grid-grouping-changed-event-args';
import type { GridGroupingChangingEventArgs } from './grid-grouping-changing-event-args';
import type { GridLayout } from './grid-layout';
import type { GridAdaptiveDetail } from './grid-adaptive-detail';
import type { GridAdaptiveDetailRowPreparingEventArgs } from './grid-adaptive-detail-row-preparing-event-args';
import type { GridAdaptiveRowExpandedEventArgs } from './grid-adaptive-row-expanded-event-args';
import type { GridAdaptiveRowExpandingEventArgs } from './grid-adaptive-row-expanding-event-args';
import type { GridColumnItem } from './grid-column-item';
import type { GroupCellContext } from './group-cell-context';
import type { GridRowDragging } from './grid-row-dragging';
import type { GridRowExpandedEventArgs } from './grid-row-expanded-event-args';
import type { GridRowExpandingEventArgs } from './grid-row-expanding-event-args';
import type { GridMode } from './grid-mode';
import type { GridMoreRowsLoadedEventArgs } from './grid-more-rows-loaded-event-args';
import type { GridMoreRowsLoadingEventArgs } from './grid-more-rows-loading-event-args';
import type { GridSettingsProps } from './grid-settings-props';
import type { GridSearchTextChangedEventArgs } from './grid-search-text-changed-event-args';
import type { GridSelectionChangedEventArgs } from './grid-selection-changed-event-args';
import type { GridCellRange } from './grid-cell-range';
import type { GridCellSelectionChangedEventArgs } from './grid-cell-selection-changed-event-args';
import type { GridCellSelectionChangingEventArgs } from './grid-cell-selection-changing-event-args';
import type { GridToolbar } from './grid-toolbar';
import type { GridValuesRequest } from './grid-values-request';
import type { GridValuesResult } from './grid-values-result';
import type { NewRowOptions } from './new-row-options';
import type { RowState } from './row-state';

/**
 * The props of `DataGrid`. Every prop is a value or a tracked function, except the callbacks and
 * `columns`, `rowKey`, `sort`, `layout`, `layoutKey`, `filters`, `toolbar`, `export`, `form`, `popup`,
 * `filterBuilder`, `filterBuilderPopup`, `masterDetail`, `adaptiveDetail` and `rowDragging` (whose
 * fields are).
 */
export interface DataGridProps<T> extends ControlProps {
  /**
   * The column definitions, in their initial order, and bands over them (`{ title, columns: [...] }`).
   * Add and remove columns later with `addColumn` and `deleteColumn`.
   */
  columns: GridColumnItem<T>[];
  /**
   * In-memory rows, plain or reactive. The grid reads them as they are and returns the same objects. It
   * places them in a `DataSource` over an `ArrayAdapter`. A new array (or a function that returns one)
   * reloads, and after a change in place (`push`, `splice`, a field), call `grid.refresh()` or
   * `grid.repaintRows(keys)`. Saved edits, new rows and deletions go into the array.
   */
  rows?: Bind<T[]>;
  /**
   * Data layer rows, from any adapter. Loading by `'blocks'` creates a virtual list that requests only
   * the visible rows, and loading by `'page'` creates a paged grid. Takes precedence over `rows`.
   */
  dataSource?: Bind<data.DataSource<T, any> | null>;
  /** The key of `rows`: a field name or a function. A `dataSource` uses its adapter's key. */
  rowKey?: string | ((row: T) => unknown);
  /**
   * `'virtual'` (the default) is one long list, loaded and rendered where the view is. `'paged'` shows
   * pages with a pager. `'infinite'` displays rows page by page (`pageSize` each), loading the next page
   * as the view nears the end. No total is needed (a source with `count: false` detects the end from a
   * short page). A `dataSource` that loads by `'page'` is always paged.
   */
  mode?: Bind<GridMode>;
  /**
   * The rows per page for in-memory rows, in paged mode (0 places every row on one page) and in
   * infinite mode. A `dataSource` that loads pages or blocks uses its own `pageSize`. The user can change
   * it from the pager's page sizes (`settings.pageSizeSelector`). The default is 100.
   */
  pageSize?: Bind<number>;
  /** A fixed row height in pixels. By default, it is read from the grid's CSS, which follows the density. */
  rowHeight?: Bind<number>;
  /** The initial sort order. */
  sort?: data.SortItem[];
  /** The initial layout (overrides the columns' own width, order, hidden and sticky settings). */
  layout?: GridLayout;
  /** Occurs after the user changes the layout (resize, move, hide, sticky, sort). */
  onLayoutChange?: (layout: GridLayout) => void;
  /** Occurs when the user changes the layout. Set `e.cancel = true` to restore the previous layout. */
  onLayoutChanging?: (e: GridLayoutChangingEventArgs) => void;
  /**
   * Saves the layout, the filters and the search text in the browser's `localStorage` under this name.
   * A grid recreated with the same name restores them, over `layout`, `sort`, `filters` and `searchText`.
   */
  layoutKey?: string;
  /**
   * Where `layoutKey` saves the layout: `sessionStorage`, or any object with `getItem`, `setItem` and
   * `removeItem`. The default is `localStorage`.
   */
  layoutStorage?: LayoutStorage;
  /** The accessible name of the grid. This is the same as `text`. */
  label?: Bind<string>;
  /** Strings for this grid only, over `uiLocale.strings`. */
  texts?: Bind<Partial<UiStrings>>;
  /** The locale of number and date formatting and of text sorting. The default is the page's language. */
  locale?: Bind<string>;
  /** The feature switches (see `GridSettings`). Read and change them later through `grid.settings`. */
  settings?: GridSettingsProps;
  /** When changes are sent: on leaving each row and waiting for it, without waiting, or all at once. The default is `'wait'`. */
  saveMode?: Bind<data.SaveMode>;
  /** Where new rows open and their initial values. */
  newRow?: NewRowOptions<T>;
  /** The edit form of `settings.editMode` `'form'` and `'popup'`: its items, columns and labels. Read and change it later through `grid.form`. */
  form?: GridEditForm;
  /** The window of `settings.editMode: 'popup'`: title, size, buttons. Read and change it later through `grid.popup`. */
  popup?: GridEditPopup;
  /**
   * Details below the rows: an expand column, and what `template` creates for each row, in a row across
   * the grid. Read and change it later through `grid.masterDetail`.
   */
  masterDetail?: GridMasterDetail<T>;
  /**
   * The adaptive detail of a row, while columns hide to fit the width (`settings.columnHidingEnabled`, a
   * column's `hidingPriority`). Read and change it later through `grid.adaptiveDetail`.
   */
  adaptiveDetail?: GridAdaptiveDetail;
  /**
   * Moves rows by dragging (a column of drag icons, or the whole row) and with the keyboard: within the
   * grid, onto a row, or to another grid of the same `group`. The handlers move the data. Read and
   * change it later through `grid.rowDragging`.
   */
  rowDragging?: GridRowDragging<T>;
  /**
   * Validates a whole row before saving, returning a message per field or one for the row. `row` is
   * the row itself, `context.values` holds the entered, unsaved values, `context.getValue(field)` returns
   * the value a field will be saved with (the entered value, otherwise the row's), and `changed` holds
   * the entered fields.
   */
  validateRow?: (
    row: T,
    context: data.RowCheckContext<T> & { readonly changed: readonly string[] },
  ) => Readonly<Record<string, string | null | undefined>> | string | null | undefined | void;
  /**
   * The buttons of each row, in order of importance. Those that do not fit go into the row's "more"
   * menu. A function of the row and its state is called again when the row's state changes (edited,
   * saved, selected or deleted) and on `refreshActions()`. Strings name built-in actions (`'edit'`, `'remove'`,
   * `'restore'`, `'save'`, `'cancel'`).
   */
  actions?: readonly GridActionItem<T>[] | ((row: T, state: RowState) => readonly GridActionItem<T>[]);
  /**
   * Occurs before an action runs (in a row, a bar, a row's menu or programmatically). Set
   * `e.cancel = true` to prevent it.
   */
  onActionRunning?: (e: GridActionRunningEventArgs<T>) => void;
  /** Occurs after an action runs, and reports how many rows succeeded or failed and whether it was stopped. */
  onActionRan?: (e: GridActionRanEventArgs<T>) => void;
  /** The keys of the selected rows. A function is tracked, and user changes arrive in `onSelectionChanged`. */
  selectedKeys?: Bind<readonly unknown[]>;
  /** Occurs before the selection changes. Set `e.cancel = true` to keep it. */
  onSelectionChanging?: (e: GridSelectionChangingEventArgs) => void;
  onSelectionChanged?: (e: GridSelectionChangedEventArgs) => void;
  /**
   * The cell ranges (`settings.cellSelection`). A function is tracked, and user changes arrive in
   * `onCellSelectionChanged`.
   */
  cellRanges?: Bind<readonly GridCellRange[]>;
  /** Occurs before the cell ranges change. Set `e.cancel = true` to keep them. */
  onCellSelectionChanging?: (e: GridCellSelectionChangingEventArgs) => void;
  onCellSelectionChanged?: (e: GridCellSelectionChangedEventArgs) => void;
  /** Occurs before the editor of a cell or edit form field is created. Change `e.options`, or set `e.cancel = true`. */
  onEditorPreparing?: (e: GridEditorPreparingEventArgs<T>) => void;
  /** Occurs when an editor is created, in a cell or in the edit form. */
  onEditorPrepared?: (e: GridEditorPreparedEventArgs<T>) => void;
  /** Occurs when a row is validated before saving, after its cells. Add or remove messages, or set `e.isValid = false`. */
  onRowValidating?: (e: GridRowValidatingEventArgs<T>) => void;
  /**
   * The search panel's text, which limits the rows to those that contain it in a searchable column. A
   * function is tracked, and what the user types arrives in `onSearchTextChanged`.
   */
  searchText?: Bind<string>;
  /** Occurs before the search text changes. Set `e.cancel = true` to keep the previous text. */
  onSearchTextChanging?: (e: GridSearchTextChangingEventArgs) => void;
  /** Occurs when the search text changes, typed or set programmatically. */
  onSearchTextChanged?: (e: GridSearchTextChangedEventArgs) => void;
  /**
   * Values calculated from the rows under the filter and the search: a totals row below the rows
   * (`totalItems`) and values of each group in its row or footer (`groupItems`), including custom ones.
   * Read and change it later through `grid.summary`.
   */
  summary?: Bind<GridSummary<T>>;
  /** Occurs when summary values are recalculated (new data, or unsaved changes with `recalculateWhileEditing`). */
  onSummaryChanged?: (e: GridSummaryChangedEventArgs) => void;
  /** Custom content in every group row whose column has no `groupCell`, created once per pooled group row. */
  groupCell?: (ctx: GroupCellContext<T>) => unknown;
  /**
   * Occurs before the grouping changes, by the user or programmatically: `e.group`, `e.previous`,
   * `e.byUser`. Set `e.cancel = true` to keep it.
   */
  onGroupingChanging?: (e: GridGroupingChangingEventArgs) => void;
  /** Occurs after the grouping changes. */
  onGroupingChanged?: (e: GridGroupingChangedEventArgs) => void;
  /**
   * Occurs when a header or chip is dropped: `e.field`, `e.from`, `e.to`, `e.index`. Set
   * `e.cancel = true` to cancel the drop.
   */
  onGroupDropping?: (e: GridGroupDroppingEventArgs) => void;
  /**
   * Occurs before a group or a row's details open. `e.kind` indicates which (`'group'`, `'detail'`), and
   * `e.key` is the group's key (the values from the top level down) or the row's. Set `e.cancel = true`
   * to keep it closed.
   */
  onRowExpanding?: (e: GridRowExpandingEventArgs) => void;
  /** Occurs after a group or a row's details open. */
  onRowExpanded?: (e: GridRowExpandedEventArgs) => void;
  /** Occurs before a group or a row's details close. Set `e.cancel = true` to keep it open. */
  onRowCollapsing?: (e: GridRowExpandingEventArgs) => void;
  /** Occurs after a group or a row's details close. */
  onRowCollapsed?: (e: GridRowExpandedEventArgs) => void;
  /** Occurs when a row's adaptive detail lays out its form. Change `e.formOptions`. */
  onAdaptiveDetailRowPreparing?: (e: GridAdaptiveDetailRowPreparingEventArgs<T>) => void;
  /** Occurs before a row's adaptive detail opens. Set `e.cancel = true` to keep it closed. */
  onAdaptiveDetailRowExpanding?: (e: GridAdaptiveRowExpandingEventArgs<T>) => void;
  onAdaptiveDetailRowExpanded?: (e: GridAdaptiveRowExpandedEventArgs<T>) => void;
  /** Occurs before a row's adaptive detail closes. Set `e.cancel = true` to keep it open. */
  onAdaptiveDetailRowCollapsing?: (e: GridAdaptiveRowExpandingEventArgs<T>) => void;
  onAdaptiveDetailRowCollapsed?: (e: GridAdaptiveRowExpandedEventArgs<T>) => void;
  /** The bar above the rows: which items it holds, and whether it appears. */
  toolbar?: GridToolbar;
  /** What the toolbar's export button (`settings.exportButton`) offers: the formats, "Export selected rows", the texts. */
  export?: GridExportSettings;
  /** The initial filters, by field. Read and change them later through `grid.filters`. */
  filters?: GridFilters;
  /**
   * The filter value, in data layer form: the filter builder's conditions and, with
   * `settings.filterSyncEnabled`, those of the filter row and header filters, which display the ones they
   * can. A function is tracked, and user changes arrive in `onFilterChanged` (`e.filterValue`).
   */
  filterValue?: Bind<data.FilterExpression | null>;
  /**
   * Indicates whether the filter value applies (the filter panel's check box). A function is tracked.
   * The default is `true`.
   */
  filterEnabled?: Bind<boolean>;
  /** Returns the filter panel's text, given the text it would display. */
  filterPanelText?: (e: GridFilterPanelTextInfo) => string;
  /**
   * The filter builder the filter panel opens (any prop of `FilterBuilder` except `value` and `fields`).
   * Read and change it later through `grid.filterBuilder`.
   */
  filterBuilder?: GridFilterBuilderOptions;
  /** The window the filter builder opens in. Read and change it later through `grid.filterBuilderPopup`. */
  filterBuilderPopup?: GridFilterBuilderPopup;
  /** Occurs before the filter builder opens. Set `e.cancel = true` to keep it closed. */
  onFilterBuilderOpening?: (e: GridFilterBuilderOpeningEventArgs) => void;
  onFilterBuilderOpened?: (e: GridFilterBuilderOpenedEventArgs) => void;
  /** Occurs before the filter builder closes, with OK (`e.apply`) or not. Set `e.cancel = true` to keep it open. */
  onFilterBuilderClosing?: (e: GridFilterBuilderClosingEventArgs) => void;
  onFilterBuilderClosed?: (e: GridFilterBuilderClosedEventArgs) => void;
  /**
   * Loads the values of a column's header filter when the data comes from a server that cannot group:
   * a part of the distinct values that match the other filters. Without it, in-memory rows and adapters
   * that group provide the values themselves.
   */
  loadValues?: (request: GridValuesRequest<T>) => GridValuesResult | Promise<GridValuesResult>;
  /**
   * Occurs when a cell is clicked. Set `e.cancel = true` to prevent the grid's handling (selection, the
   * group toggle and the editor).
   */
  onCellClick?: (e: GridCellClickEventArgs<T>) => void;
  /** Occurs when a cell is double-clicked. Set `e.cancel = true` to keep its editor closed. */
  onCellDblClick?: (e: GridCellClickEventArgs<T>) => void;
  /** Occurs when a row is clicked, after its cell's event. Set `e.cancel = true` to prevent the grid's handling. */
  onRowClick?: (e: GridRowClickEventArgs<T>) => void;
  /** Occurs when a row is double-clicked. Set `e.cancel = true` to keep the editor closed. */
  onRowDblClick?: (e: GridRowClickEventArgs<T>) => void;
  /**
   * Occurs when a cell is rendered for a row, so that you can style it. The element is reused, so set
   * and clear what you change.
   */
  onCellPrepared?: (e: GridCellPreparedEventArgs<T>) => void;
  /**
   * Occurs when a row is rendered, so that you can style it. The element is reused, so set and clear
   * what you change.
   */
  onRowPrepared?: (e: GridRowPreparedEventArgs<T>) => void;
  /** Occurs when rows have arrived and been laid out. */
  onContentReady?: (e: GridContentReadyEventArgs) => void;
  /** Occurs when loading or saving fails. */
  onDataErrorOccurred?: (e: GridDataErrorEventArgs<T>) => void;
  /** Occurs before a cell editor or a row's edit form opens. Set `e.cancel = true` to keep it closed. */
  onEditingStart?: (e: GridEditingStartEventArgs<T>) => void;
  /**
   * Occurs before a new row opens. Change `e.data` (its initial content) or `e.values` (what counts as
   * entered), or set `e.cancel = true`.
   */
  onInitNewRow?: (e: GridInitNewRowEventArgs<T>) => void;
  /** Occurs before changes are sent. Set `e.cancel = true` to keep them all unsent. */
  onSaving?: (e: GridSavingEventArgs<T>) => void;
  /** Occurs when the response to a save arrives. */
  onSaved?: (e: GridSavedEventArgs<T>) => void;
  /** Occurs before a new row is sent. Change `e.data`, or set `e.cancel = true`. */
  onRowInserting?: (e: GridRowInsertingEventArgs<T>) => void;
  onRowInserted?: (e: GridRowInsertedEventArgs<T>) => void;
  /** Occurs before a row's changes are sent. Change `e.changes`, or set `e.cancel = true`. */
  onRowUpdating?: (e: GridRowUpdatingEventArgs<T>) => void;
  onRowUpdated?: (e: GridRowUpdatedEventArgs<T>) => void;
  /** Occurs before a row's deletion is sent. Set `e.cancel = true` to keep the row. */
  onRowRemoving?: (e: GridRowRemovingEventArgs<T>) => void;
  onRowRemoved?: (e: GridRowRemovedEventArgs<T>) => void;
  /**
   * Occurs before unsaved changes are discarded (Escape, "Cancel", `discardChanges()`). Set
   * `e.cancel = true` to keep them.
   */
  onEditCanceling?: (e: GridEditCancelingEventArgs<T>) => void;
  onEditCanceled?: (e: GridEditCanceledEventArgs<T>) => void;
  /** Occurs before the active cell moves. Set `e.cancel = true` to keep it in place. */
  onFocusedCellChanging?: (e: GridFocusedCellChangingEventArgs<T>) => void;
  onFocusedCellChanged?: (e: GridFocusedCellChangedEventArgs<T>) => void;
  /** Occurs before the active row changes. Set `e.cancel = true` to keep the current row. */
  onFocusedRowChanging?: (e: GridFocusedRowChangingEventArgs<T>) => void;
  onFocusedRowChanged?: (e: GridFocusedRowChangedEventArgs<T>) => void;
  /** Occurs before the grid handles a key. Set `e.cancel = true` to prevent the grid's handling. */
  onKeyHandling?: (e: GridKeyHandlingEventArgs) => void;
  /**
   * Occurs when a setting of the grid, a column or the toolbar is assigned, or when a column is added or
   * removed (`name: 'columns'`).
   */
  onOptionChanged?: (e: GridOptionChangedEventArgs) => void;
  /** Occurs before an export starts. Change `e.options`, or set `e.cancel = true`. */
  onExporting?: (e: GridExportingEventArgs) => void;
  onExported?: (e: GridExportedEventArgs) => void;
  /** Occurs before a column menu or a row's menu opens. Change `e.items`, or set `e.cancel = true`. */
  onContextMenuPreparing?: (e: GridContextMenuPreparingEventArgs<T>) => void;
  /** Occurs when the toolbar is laid out. Change `e.items`. */
  onToolbarPreparing?: (e: GridToolbarPreparingEventArgs) => void;
  /** Occurs before the sort changes. Set `e.cancel = true` to keep the current sort. */
  onSortChanging?: (e: GridSortChangingEventArgs) => void;
  onSortChanged?: (e: GridSortChangedEventArgs) => void;
  /** Occurs before the filters apply. Set `e.cancel = true` to restore the previous ones. */
  onFilterChanging?: (e: GridFilterChangingEventArgs) => void;
  onFilterChanged?: (e: GridFilterChangedEventArgs) => void;
  /** Occurs before another page appears. Set `e.cancel = true` to stay on the current page. */
  onPageChanging?: (e: GridPageChangingEventArgs) => void;
  onPageChanged?: (e: GridPageChangedEventArgs) => void;
  /**
   * Occurs before the rows per page change (the pager's page sizes, `pageSize(n)`). Set
   * `e.cancel = true` to keep the current value.
   */
  onPageSizeChanging?: (e: GridPageSizeChangingEventArgs) => void;
  onPageSizeChanged?: (e: GridPageSizeChangedEventArgs) => void;
  /** In infinite mode, occurs before the next page of rows loads. Set `e.cancel = true` to keep the rows as they are. */
  onMoreRowsLoading?: (e: GridMoreRowsLoadingEventArgs) => void;
  /** In infinite mode, occurs when a page of rows arrives. */
  onMoreRowsLoaded?: (e: GridMoreRowsLoadedEventArgs) => void;
  /** Occurs before cells are copied. Change `e.text` or `e.html`, or set `e.cancel = true`. */
  onCopying?: (e: GridCopyingEventArgs) => void;
  /** Occurs before text is pasted. Change `e.text`, or set `e.cancel = true`. */
  onPasting?: (e: GridPastingEventArgs) => void;
}
