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
 * The definition of one column. `editable`, `creatable`, `sortable`, `resizable`, `movable`, `hideable`,
 * `pinnable`, `menu`, `filterRow`, `headerFilter`, `filterBuilder`, `copyable`, `cellSelectable`,
 * `exportable`, `syncLookupFilterValues`, `searchable`, `groupable`, `showWhenGrouped`, `allowCollapsing`,
 * `groupCount` and `groupMenu` take precedence over the grid's `settings` for this column. Each is a value
 * or a tracked function (`editable` and `creatable` also accept a function of the row, which applies per
 * row).
 *
 * @example
 * { field: 'amount', title: 'Amount', type: 'number', width: 120, sticky: 'end', movable: false }
 */
export interface GridColumn<T = any> {
  /**
   * The key of the value in the row (a dotted path reads a nested value), and the column's identity in
   * layouts and sort items.
   */
  field: string;
  /** The header text. */
  title: Bind<string>;
  /**
   * Custom content in the header cell in place of the title text, created once. Read `ctx` in getters.
   * The title stays the cell's accessible name.
   */
  headerCell?: (ctx: HeaderCellContext<T>) => unknown;
  /** The value type, which determines the alignment, format, sorting and editor. The default is `'text'`. */
  type?: ColumnType;
  /** The width in pixels. The default is the grid's `columnWidth` setting (140). */
  width?: number;
  /** The minimum width the user can resize to. The default is the grid's `columnMinWidth` setting (48). */
  minWidth?: number;
  /** The maximum width the user can resize to. */
  maxWidth?: number;
  /** The share of the free space this column takes when the grid is wider than its columns. */
  flex?: number;
  /** Pins the column to the start or end edge during horizontal scrolling. A column in a band sticks with its band. */
  sticky?: StickySide;
  /** The band of this column in a flat list: the band's `name`, or its position in the grid's `columns`. */
  ownerBand?: string | number;
  /**
   * When the grid is narrower than its columns, columns with a priority hide, the lowest first, and
   * appear in the row's adaptive detail (`columnHidingEnabled`). Once set on any column, only columns
   * with a priority hide. Pinned and grouped columns never hide. A function is tracked.
   */
  hidingPriority?: Bind<number | undefined>;
  /** Starts hidden. The user can show it from the column menu. */
  hidden?: boolean;
  /** The horizontal alignment. By default, `end` for numbers, `center` for booleans and `start` otherwise. */
  align?: 'start' | 'center' | 'end';
  /** Reads the value in place of `row[field]`. */
  value?: (row: T) => unknown;
  /**
   * How the value is displayed: `Intl` options for a number or date column
   * (`{ style: 'currency', currency: 'EUR' }`, `{ dateStyle: 'medium' }`), which an Excel export also
   * converts to a number format, or a function that returns the text (exported as that text). By
   * default, `Intl` formatting by `type` and `locale`.
   */
  format?: ((value: unknown, row: T) => string) | Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;
  /** Compares two values for sorting in-memory rows. By default, by `type`, with text in the locale's order. */
  compare?: (a: unknown, b: unknown) => number;
  /** Custom cell content, created once per pooled cell. Read `ctx.row` inside getters. */
  cell?: (ctx: CellContext<T>) => unknown;
  editable?: boolean | ((row: T) => boolean);
  creatable?: boolean | ((row: T) => boolean);
  sortable?: Bind<boolean>;
  resizable?: Bind<boolean>;
  /** How this column's edge is dragged; overrides the grid's `resizeMode`. */
  resizeMode?: Bind<ColumnResizeMode>;
  /**
   * `'virtual'` creates the column's cells only while it is in view, and `'standard'` keeps them always
   * (for cell content with its own state). Overrides the grid's `columnRenderingMode`.
   */
  columnRenderingMode?: Bind<'standard' | 'virtual'>;
  /** Typing a character on a cell opens its editor. Overrides the grid's `editOnKeyPress`. */
  editOnKeyPress?: Bind<boolean>;
  /** A double-click, or one click, opens a cell's editor. Overrides the grid's `startEditAction`. */
  startEditAction?: Bind<'click' | 'dblClick'>;
  /** For a yes/no column, the pasted text read as yes. Overrides the grid's `trueTexts`. */
  trueTexts?: readonly string[];
  /** For a yes/no column, the pasted text read as no. Overrides the grid's `falseTexts`. */
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
  /** The conditions the filter row offers for this column, in order. By default, all those of the column type. */
  filterOperators?: readonly GridFilterOperator[];
  /** The initial condition of the filter row. The default is the first of `filterOperators`, otherwise by type. */
  filterOperator?: GridFilterOperator;
  /**
   * How the header filter groups values: a range size for a number column (`100` creates "0 – 100",
   * "100 – 200", and `[1000, 100]` creates a tree of ranges), the deepest level of the year → month →
   * day … tree for a date column (`'month'`), or `null` for one entry per value. By default, no grouping
   * for numbers, and the grid's `headerFilterDateInterval` for dates.
   */
  headerFilterInterval?: Bind<GridHeaderFilterInterval>;
  /**
   * Custom header filter entries in place of the column's values: `{ text, value }` items (a value can be
   * a filter expression), or a function that returns them.
   */
  headerFilterItems?: GridHeaderFilterItems<T>;
  /** The values selected in the header filter. A function is tracked. The grid's `filters` hold them as `values`. */
  filterValues?: Bind<readonly unknown[] | undefined>;
  /**
   * With `'exclude'`, the rows with `filterValues` are omitted instead of kept. A function is tracked. The
   * default is `'include'`.
   */
  filterType?: Bind<'include' | 'exclude'>;
  /** An empty value is not accepted, which prevents the row from being saved. */
  required?: boolean;
  /**
   * Validates a value and returns the message to display, or nothing. `row` is the row itself, and
   * `context` holds the entered, unsaved values (`values`) and `getValue(field)`, the value a field will
   * be saved with.
   */
  validate?: (value: unknown, row: T, context: data.RowCheckContext<T>) => string | null | undefined;
  /**
   * Validation rules, checked after `required` and `validate`: `required`, `numeric`, `range`,
   * `stringLength`, `pattern`, `email`, `compare`, `custom` and `async`. A value is checked when it is
   * written and when the row is validated before saving, and the row waits for an `async` rule.
   */
  validationRules?: readonly GridValidationRule<T>[];
  /** How the column appears in the edit form (`editMode` `'form'` or `'popup'`). */
  formItem?: GridColumnFormItem;
  /**
   * The choices of a `list` column: an array, or a function of the row and its entered values
   * (`context.getValue(field)`), which can return a promise.
   */
  options?: readonly ListOption[] | ((row: T, context: data.RowCheckContext<T>) => readonly ListOption[] | Promise<readonly ListOption[]>);
  /**
   * A custom editor, created when the cell is edited: a `Field` (read through its `value`), or any
   * component that calls `ctx.setValue`.
   */
  editor?: (ctx: EditorContext<T>) => unknown;
  /**
   * The cell holds a key and displays the text of its item from another source (a service, an array).
   * The column is displayed, edited, filtered, sorted, copied and exported as a lookup, and `type` still
   * determines the alignment.
   */
  lookup?: GridLookup<T>;
  /**
   * The text of a lookup cell, read from the row itself (`'customer.name'` of an expanded relation), so
   * that the lookup source is used only for editing and lists. The field form is also what a server
   * sorts by.
   */
  textFrom?: string | ((row: T) => string);
  /** The field the rows are sorted by for this column (a server sorts by it), in place of `field`. */
  sortField?: string;
  /**
   * Called when the user commits a value to a cell (editor, paste or Delete), before it is written.
   * `values` starts as `{ [field]: value }`, and you can change it to write other fields too (clear the
   * city when the state changes). `row` is the row itself, and `context` holds the values entered so far
   * (`context.values`, `context.getValue(field)`). A promise keeps the cell busy until it settles.
   */
  setCellValue?: (values: Record<string, unknown>, value: unknown, row: T, context: data.RowCheckContext<T>) => void | Promise<void>;
  /**
   * The filter row and header filter of a lookup column list only the keys of rows that match the other
   * filters. Overrides the grid's `syncLookupFilterValues`.
   */
  syncLookupFilterValues?: Bind<boolean>;
  /** Includes this column in the search panel's search. By default, enabled unless the column disables its own filters. */
  searchable?: Bind<boolean>;
  /** Allows the user to group by this column. Overrides the grid's `groupable`. */
  groupable?: Bind<boolean>;
  /**
   * The column's position among the grouped columns, 0 first, so that the rows start grouped by it. A
   * function is tracked: a new value moves the column there, and `undefined` ungroups it.
   */
  groupIndex?: Bind<number | undefined>;
  /** A grouped column still appears among the other columns. Overrides the grid's `showWhenGrouped`. */
  showWhenGrouped?: Bind<boolean>;
  /** Allows the user to expand and collapse this column's groups. Overrides the grid's `allowCollapsing`. */
  allowCollapsing?: Bind<boolean>;
  /** This column's group rows show their row count. Overrides the grid's `groupCount`. */
  groupCount?: Bind<boolean>;
  /** The grouping items of the column menu for this column. Overrides the grid's `groupMenu`. */
  groupMenu?: Bind<boolean>;
  /** This column's groups expand from their arrow or from a click on the row. Overrides the grid's `groupExpandMode`. */
  groupExpandMode?: Bind<'button' | 'rowClick'>;
  /** Orders this column's groups in memory (`dir` still reverses it). By default, by their values, like a sort. */
  groupCompare?: (a: unknown, b: unknown) => number;
  /** The groups of this column start expanded. The default is the grid's `autoExpandAll`. */
  autoExpandGroup?: Bind<boolean>;
  /**
   * The value used for grouping in place of the column's value: a function of the row (in-memory rows),
   * or the field a server groups by. Groups are also ordered by it.
   */
  calculateGroupValue?: string | ((row: T) => unknown);
  /** Custom content in the column's group rows, created once per pooled group row. Read `ctx` in getters. */
  groupCell?: (ctx: GroupCellContext<T>) => unknown;
}
