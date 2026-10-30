import type { Bind } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { CellContext } from './cell-context';
import type { ColumnResizeMode } from './column-resize-mode';
import type { ColumnType } from './column-type';
import type { EditorContext } from './editor-context';
import type { GroupCellContext } from './group-cell-context';
import type { HeaderCellContext } from './header-cell-context';
import type { GridFilterOperator } from './grid-filter-operator';
import type { GridHeaderFilterInterval } from './grid-header-filter-interval';
import type { GridHeaderFilterItems } from './grid-header-filter-items';
import type { GridColumnFormItem } from './grid-column-form-item';
import type { GridLookup } from './grid-lookup';
import type { GridValidationRule } from './grid-validation-rule';
import type { ListOption } from './list-option';
import type { StickySide } from './sticky-side';

/**
 * Definition of one column. `editable`, `creatable`, `sortable`, `resizable`, `movable`, `hideable`,
 * `pinnable`, `menu`, `filterRow`, `headerFilter`, `filterBuilder`, `copyable`, `cellSelectable`, `exportable`, `syncLookupFilterValues`, `searchable`, `groupable`, `showWhenGrouped`, `allowCollapsing`, `groupCount` and `groupMenu` override the grid's `settings` for this column; each is a value or a function
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
  /** Content of your own in the header cell instead of the title text, made once; read `ctx` in getters. The title stays the cell's accessible name. */
  headerCell?: (ctx: HeaderCellContext<T>) => unknown;
  /** Value type; decides alignment, formatting, comparison and the editor. Default `'text'`. */
  type?: ColumnType;
  /** Width in pixels. Default: the grid's `columnWidth` setting (140). */
  width?: number;
  /** Smallest width the user can resize to. Default: the grid's `columnMinWidth` setting (48). */
  minWidth?: number;
  /** Largest width the user can resize to. */
  maxWidth?: number;
  /** Share of the free space this column takes when the grid is wider than its columns. */
  flex?: number;
  /** Keep the column at the start or end edge while scrolling sideways. A column in a band sticks with its band. */
  sticky?: StickySide;
  /** The band this column sits in when the columns are given flat: the band's `name`, or its place in the grid's `columns` (`ownerBand`). */
  ownerBand?: string | number;
  /**
   * When the grid is narrower than its columns, columns with a priority hide, the lowest first, and
   * show in the row's adaptive detail (`columnHidingEnabled`). Given on any column, only columns
   * with one hide. Pinned and grouped columns never hide. Followed when a function.
   */
  hidingPriority?: Bind<number | undefined>;
  /** Start hidden; the user can show it from the column menu. */
  hidden?: boolean;
  /** Horizontal alignment. Default: `end` for numbers, `center` for booleans, `start` otherwise. */
  align?: 'start' | 'center' | 'end';
  /** Reads the value instead of `row[field]`. */
  value?: (row: T) => unknown;
  /**
   * How the value shows: `Intl` options for a number or a date column (`{ style: 'currency', currency: 'EUR' }`,
   * `{ dateStyle: 'medium' }`), which an Excel export turns into the cell's number format too, or a
   * function that writes the text (exported as that text). Default: `Intl` formatting by `type` and `locale`.
   */
  format?: ((value: unknown, row: T) => string) | Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;
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
  /**
   * `'virtual'`: the column gets cells only while it is in view; `'standard'`: always (a cell content
   * with a state of its own). Overrides the grid's `columnRenderingMode`.
   */
  columnRenderingMode?: Bind<'standard' | 'virtual'>;
  /** Typing a character on a cell opens its editor. Overrides the grid's `editOnKeyPress`. */
  editOnKeyPress?: Bind<boolean>;
  /** A double-click or one click opens a cell's editor. Overrides the grid's `startEditAction`. */
  startEditAction?: Bind<'click' | 'dblClick'>;
  /** A yes/no column: pasted texts read as yes. Overrides the grid's `trueTexts`. */
  trueTexts?: readonly string[];
  /** A yes/no column: pasted texts read as no. Overrides the grid's `falseTexts`. */
  falseTexts?: readonly string[];
  movable?: Bind<boolean>;
  hideable?: Bind<boolean>;
  pinnable?: Bind<boolean>;
  menu?: Bind<boolean>;
  filterRow?: Bind<boolean>;
  headerFilter?: Bind<boolean>;
  filterBuilder?: Bind<boolean>;
  copyable?: Bind<boolean>;
  cellSelectable?: Bind<boolean>;
  exportable?: Bind<boolean>;
  /** The conditions the filter row offers for this column, in order. Default: all of the column type's. */
  filterOperators?: readonly GridFilterOperator[];
  /** The condition the filter row starts with. Default: the first of `filterOperators`, else by type. */
  filterOperator?: GridFilterOperator;
  /**
   * How the header filter groups the values: a range size for a number column (`100`: "0 – 100",
   * "100 – 200"; `[1000, 100]` a tree of ranges), the deepest part of the year → month → day … tree
   * for a date column (`'month'`), `null` for one entry per value. Default: none for numbers, the
   * grid's `headerFilterDateInterval` for dates.
   */
  headerFilterInterval?: Bind<GridHeaderFilterInterval>;
  /** The header filter's entries instead of the column's values: `{ text, value }` items (a value may be a filter expression), or a function that gives them. */
  headerFilterItems?: GridHeaderFilterItems<T>;
  /** The values chosen in the header filter, followed when a function. The grid's `filters` hold them as the column's `values`. */
  filterValues?: Bind<readonly unknown[] | undefined>;
  /** `'exclude'`: the rows with `filterValues` are left out instead of kept. Followed when a function. Default `'include'`. */
  filterType?: Bind<'include' | 'exclude'>;
  /** An empty value stops the row from being saved. */
  required?: boolean;
  /**
   * Checks a value; return the message to show, or nothing. `row` is the row itself; `context` has
   * the values entered and not saved yet (`values`) and `getValue(field)`, the value a field is saved with.
   */
  validate?: (value: unknown, row: T, context: data.RowCheckContext<T>) => string | null | undefined;
  /**
   * the standard rule set, checked after `required` and `validate`: `required`, `numeric`, `range`,
   * `stringLength`, `pattern`, `email`, `compare`, `custom` and `async`. A value is checked when it is
   * written and when the row is checked before it is saved; the row waits for an `async` rule.
   */
  validationRules?: readonly GridValidationRule<T>[];
  /** How the column shows in the edit form (`editMode` `'form'` or `'popup'`). */
  formItem?: GridColumnFormItem;
  /** Choices of a `list` column: an array, or a function of the row and its entered values (`context.getValue(field)`; may return a promise). */
  options?: readonly ListOption[] | ((row: T, context: data.RowCheckContext<T>) => readonly ListOption[] | Promise<readonly ListOption[]>);
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
   * the state changes). `row` is the row itself; `context` has the values entered so far
   * (`context.values`, `context.getValue(field)`). May return a promise: the cell shows that it is
   * busy until it settles.
   */
  setCellValue?: (values: Record<string, unknown>, value: unknown, row: T, context: data.RowCheckContext<T>) => void | Promise<void>;
  /** The filter row and header filter of a lookup column list only the keys of rows the other filters leave. Overrides the grid's `syncLookupFilterValues`. */
  syncLookupFilterValues?: Bind<boolean>;
  /** The search panel looks in this column. Default: on, unless the column turns its own filters off. */
  searchable?: Bind<boolean>;
  /** The user can group by this column. Overrides the grid's `groupable`. */
  groupable?: Bind<boolean>;
  /**
   * The column's place among the grouped columns, 0 first; the rows start grouped by it. A function is
   * followed: a new value moves the column there, `undefined` takes it out.
   */
  groupIndex?: Bind<number | undefined>;
  /** A grouped column still shows among the other columns. Overrides the grid's `showWhenGrouped`. */
  showWhenGrouped?: Bind<boolean>;
  /** The user can open and close this column's groups. Overrides the grid's `allowCollapsing`. */
  allowCollapsing?: Bind<boolean>;
  /** This column's group rows show their row count. Overrides the grid's `groupCount`. */
  groupCount?: Bind<boolean>;
  /** The grouping items of the column menu for this column. Overrides the grid's `groupMenu`. */
  groupMenu?: Bind<boolean>;
  /** This column's groups open from their arrow or from a click on the row. Overrides the grid's `groupExpandMode`. */
  groupExpandMode?: Bind<'button' | 'rowClick'>;
  /** Orders this column's groups, in memory (`dir` still turns the order). Default: by their values, like a sort. */
  groupCompare?: (a: unknown, b: unknown) => number;
  /** The groups of this column start open. Default: the grid's `autoExpandAll`. */
  autoExpandGroup?: Bind<boolean>;
  /**
   * What the rows are grouped by instead of the value: a function of the row (rows in memory), or the
   * field a server groups by. Groups are ordered by it too.
   */
  calculateGroupValue?: string | ((row: T) => unknown);
  /** Content of your own in the column's group rows, made once per pooled group row; read `ctx` in getters. */
  groupCell?: (ctx: GroupCellContext<T>) => unknown;
}
