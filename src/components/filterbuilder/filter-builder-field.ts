import type { Bind, ComponentBase } from '@motifx/core';
import type { FilterBuilderDataType } from './filter-builder-data-type';
import type { FilterBuilderEditorContext } from './filter-builder-editor-context';
import type { FilterBuilderLookup } from './filter-builder-lookup';
import type { FilterBuilderOperation } from './filter-builder-operation';
import type { FilterBuilderValueInfo } from './filter-builder-value-info';

/**
 * A field the user can build conditions on. `caption`, `dataType`, `filterOperations`,
 * `defaultOperation`, `trueText`, `falseText` and `editorOptions` are values or functions that are followed.
 *
 * @example
 * { dataField: 'amount', caption: 'Amount', dataType: 'number', format: { style: 'currency', currency: 'EUR' } }
 */
export interface FilterBuilderField {
  /** The field of the data the condition filters (a dotted path for a nested one). */
  dataField: string;
  /** Default: the data field in words (`orderDate` → "Order Date"). */
  caption?: Bind<string>;
  /** Default `'string'`. */
  dataType?: Bind<FilterBuilderDataType>;
  /** `Intl` options for a number or a date value (the editor takes them too), or a function that writes the text. */
  format?: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | ((value: unknown) => string);
  /** The values come from a list. */
  lookup?: FilterBuilderLookup;
  /** The operations offered, in order (custom operations by name). Default: by `dataType`, and the custom operations for that type. */
  filterOperations?: Bind<readonly FilterBuilderOperation[]>;
  /** The operation a new condition starts with. Default: the first of `filterOperations`. */
  defaultOperation?: Bind<FilterBuilderOperation>;
  /** An editor of your own for the value: a `Field` (its `value` is read) or any component that calls `ctx.setValue`. */
  editor?: (ctx: FilterBuilderEditorContext) => ComponentBase;
  /** Props given to the kit editor the builder makes. */
  editorOptions?: Bind<Record<string, unknown>>;
  /** The text of a value, in the builder and in a filter's text. */
  customizeText?: (info: FilterBuilderValueInfo) => string;
  /** A yes/no field: the text of `true`. Default: the `filterBuilderTrue` text. */
  trueText?: Bind<string>;
  /** A yes/no field: the text of `false`. Default: the `filterBuilderFalse` text. */
  falseText?: Bind<string>;
}
