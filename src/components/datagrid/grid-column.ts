import type { Bind } from '@motifx/core';
import type { CellContext } from './cell-context';
import type { ColumnResizeMode } from './column-resize-mode';
import type { ColumnType } from './column-type';
import type { EditorContext } from './editor-context';
import type { GridFilterOperator } from './grid-filter-operator';
import type { GridLookup } from './grid-lookup';
import type { ListOption } from './list-option';
import type { StickySide } from './sticky-side';

/**
 * Definition of one column. `editable`, `creatable`, `sortable`, `resizable`, `movable`, `hideable`,
 * `pinnable`, `menu`, `filterRow`, `headerFilter`, `copyable`, `exportable` and `syncLookupFilterValues` override the grid's `settings` for this column; each is a value or a function
 * that is followed (`editable` and `creatable` also take a function of the row, which decides per row).
 *
 * @example
 * { field: 'amount', title: 'Amount', type: 'number', width: 120, sticky: 'end', movable: false }
 */
export interface GridColumn<T = any> {
  /** Key of the value in the row (a dotted path reads a nested one); also the column's identity in layouts and sort items. */
  field: string;
  /** Header text. */
  title: Bind<string>;
  /** Value type; decides alignment, formatting, comparison and the editor. Default `'text'`. */
  type?: ColumnType;
  /** Width in pixels. Default 140. */
  width?: number;
  /** Smallest width the user can resize to. Default 48. */
  minWidth?: number;
  /** Largest width the user can resize to. */
  maxWidth?: number;
  /** Share of the free space this column takes when the grid is wider than its columns. */
  flex?: number;
  /** Keep the column at the start or end edge while scrolling sideways. */
  sticky?: StickySide;
  /** Start hidden; the user can show it from the column menu. */
  hidden?: boolean;
  /** Horizontal alignment. Default: `end` for numbers, `center` for booleans, `start` otherwise. */
  align?: 'start' | 'center' | 'end';
  /** Reads the value instead of `row[field]`. */
  value?: (row: T) => unknown;
  /** Turns the value into display text. Default: `Intl` formatting by `type` and `locale`. */
  format?: (value: unknown, row: T) => string;
  /** Compares two values for sorting rows in memory. Default: by `type`, text in the locale. */
  compare?: (a: unknown, b: unknown) => number;
  /** Custom cell content, built once per pooled cell. Read `ctx.row` inside getters. */
  cell?: (ctx: CellContext<T>) => unknown;
  editable?: boolean | ((row: T) => boolean);
  creatable?: boolean | ((row: T) => boolean);
  sortable?: Bind<boolean>;
  resizable?: Bind<boolean>;
  /** How this column's edge is dragged; overrides the grid's `resizeMode`. */
  resizeMode?: Bind<ColumnResizeMode>;
  movable?: Bind<boolean>;
  hideable?: Bind<boolean>;
  pinnable?: Bind<boolean>;
  menu?: Bind<boolean>;
  filterRow?: Bind<boolean>;
  headerFilter?: Bind<boolean>;
  copyable?: Bind<boolean>;
  exportable?: Bind<boolean>;
  /** The conditions the filter row offers for this column, in order. Default: all of the column type's. */
  filterOperators?: readonly GridFilterOperator[];
  /** The condition the filter row starts with. Default: the first of `filterOperators`, else by type. */
  filterOperator?: GridFilterOperator;
  /** An empty value stops the row from being saved. */
  required?: boolean;
  /** Checks a value; return the message to show, or nothing. `row` has the unsaved edits applied. */
  validate?: (value: unknown, row: T) => string | null | undefined;
  /** Choices of a `list` column: an array, or a function of the row (may return a promise). */
  options?: readonly ListOption[] | ((row: T) => readonly ListOption[] | Promise<readonly ListOption[]>);
  /**
   * A custom editor, made when the cell is edited: a `Field` (its `value` is read), or any component
   * that calls `ctx.setValue`.
   */
  editor?: (ctx: EditorContext<T>) => unknown;
  /**
   * The cell keeps a key and shows the text of its item from another source (a service, an array).
   * The column is shown, edited, filtered, sorted, copied and exported as a lookup; `type` still
   * decides the alignment.
   */
  lookup?: GridLookup<T>;
  /**
   * The text of a lookup cell read from the row itself (`'customer.name'` of an expanded relation);
   * the lookup source is then asked only to edit and to list. The field form is also what a server
   * sorts by.
   */
  textFrom?: string | ((row: T) => string);
  /** The field the rows are sorted by for this column (a server sorts by it), instead of `field`. */
  sortField?: string;
  /**
   * Called when the user commits a value into a cell (editor, paste, Delete), before it is written.
   * `values` starts as `{ [field]: value }`; change it to write other fields too (clear the city when
   * the state changes). May return a promise: the cell shows that it is busy until it settles.
   */
  setCellValue?: (values: Record<string, unknown>, value: unknown, row: T) => void | Promise<void>;
  /** The filter row and header filter of a lookup column list only the keys of rows the other filters leave. Overrides the grid's `syncLookupFilterValues`. */
  syncLookupFilterValues?: Bind<boolean>;
}
