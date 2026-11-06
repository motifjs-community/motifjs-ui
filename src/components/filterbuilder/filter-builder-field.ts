import type { Bind, ComponentBase } from '@motifx/core';
import type { FilterBuilderDataType } from './filter-builder-data-type';
import type { FilterBuilderEditorContext } from './filter-builder-editor-context';
import type { FilterBuilderLookup } from './filter-builder-lookup';
import type { FilterBuilderOperation } from './filter-builder-operation';
import type { FilterBuilderValueInfo } from './filter-builder-value-info';

/**
 * A field that conditions can be built on. `caption`, `dataType`, `filterOperations`,
 * `defaultOperation`, `trueText`, `falseText` and `editorOptions` accept a value or a function, which is tracked.
 *
 * @example
 * { dataField: 'amount', caption: 'Amount', dataType: 'number', format: { style: 'currency', currency: 'EUR' } }
 */
export interface FilterBuilderField {
  /** The data field the condition filters. Use a dotted path for a nested field. */
  dataField: string;
  /** The default is the data field in words (`orderDate` → "Order Date"). */
  caption?: Bind<string>;
  /** The default is `'string'`. */
  dataType?: Bind<FilterBuilderDataType>;
  /** `Intl` options for a number or date value (the editor also accepts them), or a function that returns the text. */
  format?: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | ((value: unknown) => string);
  /** The values come from a list. */
  lookup?: FilterBuilderLookup;
  /**
   * The available operations in order, with custom operations by name. The default depends on `dataType` and includes
   * the custom operations for that type.
   */
  filterOperations?: Bind<readonly FilterBuilderOperation[]>;
  /** The operation for a new condition. The default is the first of `filterOperations`. */
  defaultOperation?: Bind<FilterBuilderOperation>;
  /** A custom value editor: a `Field` (its `value` is read) or any component that calls `ctx.setValue`. */
  editor?: (ctx: FilterBuilderEditorContext) => ComponentBase;
  /** Props passed to the kit editor the builder creates. */
  editorOptions?: Bind<Record<string, unknown>>;
  /** The display text of a value, in the builder and in a filter's text. */
  customizeText?: (info: FilterBuilderValueInfo) => string;
  /** For a yes/no field, the text of `true`. The default is the `filterBuilderTrue` string. */
  trueText?: Bind<string>;
  /** For a yes/no field, the text of `false`. The default is the `filterBuilderFalse` string. */
  falseText?: Bind<string>;
}
