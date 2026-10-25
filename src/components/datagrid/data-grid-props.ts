import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { ControlProps } from '../../core/control';
import type { UiStrings } from '../../core/ui-strings';
import type { GridActionItem } from './grid-action-item';
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
import type { GridColumn } from './grid-column';
import type { GridEditorPreparingEventArgs } from './grid-editor-preparing-event-args';
import type { GridFilters } from './grid-filters';
import type { GridGroupDroppingEventArgs } from './grid-group-dropping-event-args';
import type { GridGroupingChangedEventArgs } from './grid-grouping-changed-event-args';
import type { GridGroupingChangingEventArgs } from './grid-grouping-changing-event-args';
import type { GridLayout } from './grid-layout';
import type { GroupCellContext } from './group-cell-context';
import type { GridRowExpandedEventArgs } from './grid-row-expanded-event-args';
import type { GridRowExpandingEventArgs } from './grid-row-expanding-event-args';
import type { GridMode } from './grid-mode';
import type { GridSettingsProps } from './grid-settings-props';
import type { GridSearchTextChangedEventArgs } from './grid-search-text-changed-event-args';
import type { GridSelectionChangedEventArgs } from './grid-selection-changed-event-args';
import type { GridToolbar } from './grid-toolbar';
import type { GridValuesRequest } from './grid-values-request';
import type { GridValuesResult } from './grid-values-result';
import type { NewRowOptions } from './new-row-options';
import type { RowState } from './row-state';

/** Props of `DataGrid`. Every one but `columns`, `rowKey`, `sort`, `layout`, `layoutKey`, `filters`, `toolbar` (whose fields are) and the callbacks is a value or a function that is followed. */
export interface DataGridProps<T> extends ControlProps {
  /** Column definitions, in their initial order. */
  columns: GridColumn<T>[];
  /**
   * Rows in memory. The grid puts them in a `DataSource` over an `ArrayAdapter` itself: `push`,
   * `splice` and a new array are followed, and saved edits, new rows and deletions go into the array.
   */
  rows?: Bind<T[]>;
  /** Rows from the data layer, any adapter. `'blocks'` loads where the virtual list looks, `'page'` shows pages. Wins over `rows`. */
  dataSource?: Bind<data.DataSource<T, any> | null>;
  /** The row's identity for `rows`: a field name or a function. A `dataSource` uses its adapter's key. */
  rowKey?: string | ((row: T) => unknown);
  /** `'virtual'` (default) or `'paged'`. A `dataSource` that loads by `'page'` is always paged. */
  mode?: Bind<GridMode>;
  /** Rows per page in paged mode, for rows in memory. A `dataSource` that loads pages or blocks uses its own `pageSize`. Default 100. */
  pageSize?: Bind<number>;
  /** Row height in pixels. Default: read from the grid's CSS, which follows the density. */
  rowHeight?: Bind<number>;
  /** Initial sort order. */
  sort?: data.SortItem[];
  /** Initial layout (overrides the columns' own width, order, hidden and sticky settings). */
  layout?: GridLayout;
  /** Called after the user changes the layout (resize, move, hide, sticky, sort). */
  onLayoutChange?: (layout: GridLayout) => void;
  /** The user is about to change the layout; `e.cancel` puts the one before back. */
  onLayoutChanging?: (e: GridLayoutChangingEventArgs) => void;
  /**
   * A name to keep the layout, the filters and the search text under in the browser's `localStorage`:
   * they come back when a grid with the same name is made again, over `layout`, `sort`, `filters` and
   * `searchText`.
   */
  layoutKey?: string;
  /** Where `layoutKey` keeps the layout: `sessionStorage`, or any object with `getItem`, `setItem` and `removeItem`. Default `localStorage`. */
  layoutStorage?: LayoutStorage;
  /** Accessible name of the grid. The same as `text`. */
  label?: Bind<string>;
  /** Texts for this grid only, over `uiLocale.strings`. */
  texts?: Bind<Partial<UiStrings>>;
  /** Locale of number and date formatting and of text sorting. Default: the page's language. */
  locale?: Bind<string>;
  /** Features turned on or off; see `GridSettings`. Read and change them later through `grid.settings`. */
  settings?: GridSettingsProps;
  /** When changes are sent: on leaving each row and waiting for it, without waiting, or all at once. Default `'wait'`. */
  saveMode?: Bind<data.SaveMode>;
  /** Where new rows open and their initial values. */
  newRow?: NewRowOptions<T>;
  /** Checks a whole row before it is saved: a message per field, or one message for the row. */
  validateRow?: (
    row: T,
    context: { isNew: boolean; changed: readonly string[] },
  ) => Readonly<Record<string, string | null | undefined>> | string | null | undefined | void;
  /**
   * The buttons of each row, in order of importance: those that do not fit go into the row's
   * "more" menu. A function of the row and its state is followed: when what it reads changes, the
   * row's buttons change. Strings name the grid's own actions (`'edit'`, `'remove'`, `'restore'`,
   * `'save'`, `'cancel'`).
   */
  actions?: readonly GridActionItem<T>[] | ((row: T, state: RowState) => readonly GridActionItem<T>[]);
  /** Keys of the selected rows; a function is followed. The user's changes come through `onSelectionChanged`. */
  selectedKeys?: Bind<readonly unknown[]>;
  /** The selection is about to change; `e.cancel` keeps it. */
  onSelectionChanging?: (e: GridSelectionChangingEventArgs) => void;
  onSelectionChanged?: (e: GridSelectionChangedEventArgs) => void;
  /** Before a cell editor is made: change its props (`e.options`), or `e.cancel` the edit. */
  onEditorPreparing?: (e: GridEditorPreparingEventArgs<T>) => void;
  /**
   * The search panel's text: the rows that hold it in a searchable column. A function is followed;
   * what the user types comes through `onSearchTextChanged`.
   */
  searchText?: Bind<string>;
  /** The search text is about to change; `e.cancel` keeps the one before. */
  onSearchTextChanging?: (e: GridSearchTextChangingEventArgs) => void;
  /** The search text changed (typed, or set from code). */
  onSearchTextChanged?: (e: GridSearchTextChangedEventArgs) => void;
  /**
   * Values of the rows under the filter and the search: a row of totals under the rows
   * (`totalItems`) and values of each group in its row or footer (`groupItems`), also custom ones.
   * Read and change it later through `grid.summary`.
   */
  summary?: Bind<GridSummary<T>>;
  /** The summary values were worked out again (new data, or unsaved changes with `recalculateWhileEditing`). */
  onSummaryChanged?: (e: GridSummaryChangedEventArgs) => void;
  /** Content of your own in every group row whose column has no `groupCell`, made once per pooled group row. */
  groupCell?: (ctx: GroupCellContext<T>) => unknown;
  /** The grouping is about to change (user or code): `e.group`, `e.previous`, `e.byUser`; `e.cancel` keeps it. */
  onGroupingChanging?: (e: GridGroupingChangingEventArgs) => void;
  /** The grouping changed. */
  onGroupingChanged?: (e: GridGroupingChangedEventArgs) => void;
  /** A header or a chip is dropped: `e.field`, `e.from`, `e.to`, `e.index`; `e.cancel` cancels the drop. */
  onGroupDropping?: (e: GridGroupDroppingEventArgs) => void;
  /** A group is about to open: `e.key` is its key (the values from the top level down), `e.cancel` keeps it closed. */
  onRowExpanding?: (e: GridRowExpandingEventArgs) => void;
  /** A group opened. */
  onRowExpanded?: (e: GridRowExpandedEventArgs) => void;
  /** A group is about to close; `e.cancel` keeps it open. */
  onRowCollapsing?: (e: GridRowExpandingEventArgs) => void;
  /** A group closed. */
  onRowCollapsed?: (e: GridRowExpandedEventArgs) => void;
  /** The bar above the rows: which items, and whether it shows. */
  toolbar?: GridToolbar;
  /** Initial filters, by field. Read and change them later through `grid.filters`. */
  filters?: GridFilters;
  /**
   * The values of a column's header filter, when the data comes from a server that cannot group:
   * a part of the distinct values that honor the other filters. Without it, rows in memory and
   * adapters that group give the values themselves.
   */
  loadValues?: (request: GridValuesRequest<T>) => GridValuesResult | Promise<GridValuesResult>;
  /** A cell was clicked; `e.cancel` stops the grid's own handling (select, group, edit). */
  onCellClick?: (e: GridCellClickEventArgs<T>) => void;
  /** A cell was double-clicked; `e.cancel` keeps its editor closed. */
  onCellDblClick?: (e: GridCellClickEventArgs<T>) => void;
  /** A row was clicked (after its cell's event); `e.cancel` stops the grid's own handling. */
  onRowClick?: (e: GridRowClickEventArgs<T>) => void;
  /** A row was double-clicked; `e.cancel` keeps the editor closed. */
  onRowDblClick?: (e: GridRowClickEventArgs<T>) => void;
  /** A cell was drawn for a row: style it (the element is reused; set and clear what you change). */
  onCellPrepared?: (e: GridCellPreparedEventArgs<T>) => void;
  /** A row was drawn: style it (the element is reused; set and clear what you change). */
  onRowPrepared?: (e: GridRowPreparedEventArgs<T>) => void;
  /** Rows arrived and are laid out. */
  onContentReady?: (e: GridContentReadyEventArgs) => void;
  /** Loading or saving failed. */
  onDataErrorOccurred?: (e: GridDataErrorEventArgs<T>) => void;
  /** A cell editor is about to open; `e.cancel` keeps it closed. */
  onEditingStart?: (e: GridEditingStartEventArgs<T>) => void;
  /** A new row is about to open: change `e.data` (what it starts with) or `e.values` (entered), or `e.cancel`. */
  onInitNewRow?: (e: GridInitNewRowEventArgs<T>) => void;
  /** Changes are about to be sent; `e.cancel` keeps them all unsent. */
  onSaving?: (e: GridSavingEventArgs<T>) => void;
  /** The answer to a save came. */
  onSaved?: (e: GridSavedEventArgs<T>) => void;
  /** A new row is about to be sent; change `e.data`, or `e.cancel`. */
  onRowInserting?: (e: GridRowInsertingEventArgs<T>) => void;
  onRowInserted?: (e: GridRowInsertedEventArgs<T>) => void;
  /** A row's changes are about to be sent; change `e.changes`, or `e.cancel`. */
  onRowUpdating?: (e: GridRowUpdatingEventArgs<T>) => void;
  onRowUpdated?: (e: GridRowUpdatedEventArgs<T>) => void;
  /** A row's deletion is about to be sent; `e.cancel` keeps the row. */
  onRowRemoving?: (e: GridRowRemovingEventArgs<T>) => void;
  onRowRemoved?: (e: GridRowRemovedEventArgs<T>) => void;
  /** Unsaved changes are about to be dropped (Escape, "Cancel", `discardChanges()`); `e.cancel` keeps them. */
  onEditCanceling?: (e: GridEditCancelingEventArgs<T>) => void;
  onEditCanceled?: (e: GridEditCanceledEventArgs<T>) => void;
  /** The active cell is about to move; `e.cancel` keeps it. */
  onFocusedCellChanging?: (e: GridFocusedCellChangingEventArgs<T>) => void;
  onFocusedCellChanged?: (e: GridFocusedCellChangedEventArgs<T>) => void;
  /** The active row is about to change; `e.cancel` keeps it. */
  onFocusedRowChanging?: (e: GridFocusedRowChangingEventArgs<T>) => void;
  onFocusedRowChanged?: (e: GridFocusedRowChangedEventArgs<T>) => void;
  /** A key is about to be handled by the grid (`onKeyDown`); `e.cancel` stops the grid's handling. */
  onKeyHandling?: (e: GridKeyHandlingEventArgs) => void;
  /** A setting of the grid, a column or the toolbar was assigned. */
  onOptionChanged?: (e: GridOptionChangedEventArgs) => void;
  /** An export is about to start; change `e.options`, or `e.cancel`. */
  onExporting?: (e: GridExportingEventArgs) => void;
  onExported?: (e: GridExportedEventArgs) => void;
  /** A column menu or a row's menu is about to open: change `e.items`, or `e.cancel`. */
  onContextMenuPreparing?: (e: GridContextMenuPreparingEventArgs<T>) => void;
  /** The toolbar is laid out: change `e.items`. */
  onToolbarPreparing?: (e: GridToolbarPreparingEventArgs) => void;
  /** The sort is about to change; `e.cancel` keeps it. */
  onSortChanging?: (e: GridSortChangingEventArgs) => void;
  onSortChanged?: (e: GridSortChangedEventArgs) => void;
  /** The filters are about to apply; `e.cancel` puts the ones before back. */
  onFilterChanging?: (e: GridFilterChangingEventArgs) => void;
  onFilterChanged?: (e: GridFilterChangedEventArgs) => void;
  /** Another page is about to show; `e.cancel` stays. */
  onPageChanging?: (e: GridPageChangingEventArgs) => void;
  onPageChanged?: (e: GridPageChangedEventArgs) => void;
  /** Cells are about to be copied; change `e.text` / `e.html`, or `e.cancel`. */
  onCopying?: (e: GridCopyingEventArgs) => void;
  /** Text is about to be pasted; change `e.text`, or `e.cancel`. */
  onPasting?: (e: GridPastingEventArgs) => void;
}
