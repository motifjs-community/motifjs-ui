import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { ControlProps } from '../../core/control';
import type { UiStrings } from '../../core/ui-strings';
import type { GridActionItem } from './grid-action-item';
import type { GridColumn } from './grid-column';
import type { GridEditorPreparingEventArgs } from './grid-editor-preparing-event-args';
import type { GridFilters } from './grid-filters';
import type { GridLayout } from './grid-layout';
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
  /**
   * A name to keep the layout, the filters and the search text under in the browser's `localStorage`:
   * they come back when a grid with the same name is made again, over `layout`, `sort`, `filters` and
   * `searchText`.
   */
  layoutKey?: string;
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
  onSelectionChanged?: (e: GridSelectionChangedEventArgs) => void;
  /** Before a cell editor is made: change its props (`e.options`), or `e.cancel` the edit. */
  onEditorPreparing?: (e: GridEditorPreparingEventArgs<T>) => void;
  /**
   * The search panel's text: the rows that hold it in a searchable column. A function is followed;
   * what the user types comes through `onSearchTextChanged`.
   */
  searchText?: Bind<string>;
  /** The search text changed (typed, or set from code). */
  onSearchTextChanged?: (e: GridSearchTextChangedEventArgs) => void;
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
}
