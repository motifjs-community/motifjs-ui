import type { Bind, ComponentBase } from '@motifx/core';
import type { data } from '@motifx-community/data';
import type { FilterBuilderDataType } from './filter-builder-data-type';
import type { FilterBuilderEditorContext } from './filter-builder-editor-context';
import type { FilterBuilderField } from './filter-builder-field';
import type { FilterBuilderValueInfo } from './filter-builder-value-info';

/**
 * An operation of your own. The builder's value holds what `calculateFilterExpression` makes of it,
 * so it goes to any adapter as it is; the builder knows it again as this operation while it holds
 * that value, and from any expression when `readFilterExpression` is given.
 *
 * @example
 * { name: 'lastDays', caption: 'Is in the last days', dataTypes: ['date'],
 *   calculateFilterExpression: (days, field) => data.where(field.dataField, '>=', daysAgo(days as number)) }
 */
export interface FilterBuilderCustomOperation {
  /** Used in `filterOperations`. */
  name: string;
  caption: Bind<string>;
  /** The data types whose fields offer it without naming it in `filterOperations`. */
  dataTypes?: readonly FilterBuilderDataType[];
  /** Whether the operation takes a value. Default `true`. */
  hasValue?: boolean;
  /** The editor of the value. Default: the field's editor. */
  editor?: (ctx: FilterBuilderEditorContext) => ComponentBase;
  /** The text of the value. */
  customizeText?: (info: FilterBuilderValueInfo) => string;
  /** The data layer's filter for a value; `null` filters nothing. */
  calculateFilterExpression: (value: unknown, field: FilterBuilderField) => data.FilterExpression | null;
  /** Knows an expression as this operation: its field and value, or `null`. */
  readFilterExpression?: (expression: data.FilterExpression) => { field: string; value: unknown } | null;
}
