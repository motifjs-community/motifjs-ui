import type { Bind, ComponentBase } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { FilterBuilderDataType } from './filter-builder-data-type';
import type { FilterBuilderEditorContext } from './filter-builder-editor-context';
import type { FilterBuilderField } from './filter-builder-field';
import type { FilterBuilderValueInfo } from './filter-builder-value-info';

/**
 * A custom operation. The builder's value holds the result of `calculateFilterExpression`, so any adapter can
 * run it. The builder recognizes this operation while it holds that value, and in any expression when
 * `readFilterExpression` is provided.
 *
 * @example
 * { name: 'lastDays', caption: 'Is in the last days', dataTypes: ['date'],
 *   calculateFilterExpression: (days, field) => data.where(field.dataField, '>=', daysAgo(days as number)) }
 */
export interface FilterBuilderCustomOperation {
  /** The name used in `filterOperations`. */
  name: string;
  caption: Bind<string>;
  /** The data types whose fields offer it automatically, for fields without their own `filterOperations`. */
  dataTypes?: readonly FilterBuilderDataType[];
  /** Indicates whether the operation takes a value. The default is `true`. */
  hasValue?: boolean;
  /** The value editor. The default is the field's editor. */
  editor?: (ctx: FilterBuilderEditorContext) => ComponentBase;
  /** The display text of the value. */
  customizeText?: (info: FilterBuilderValueInfo) => string;
  /** Defines the data layer filter for a value. `null` applies no filter. */
  calculateFilterExpression: (value: unknown, field: FilterBuilderField) => data.FilterExpression | null;
  /** Recognizes an expression as this operation, and returns its field and value, or `null`. */
  readFilterExpression?: (expression: data.FilterExpression) => { field: string; value: unknown } | null;
}
