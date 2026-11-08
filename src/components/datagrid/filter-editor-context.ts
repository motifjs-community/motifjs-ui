import type { GridColumn } from './grid-column';
import type { GridFilterOperator } from './grid-filter-operator';

/**
 * The context a custom filter row editor receives. An editor that is a `Field` is bound to the column's filter both
 * ways by the grid. Any other component writes the value with `setValue` and hears the filter change elsewhere (the
 * filters cleared, a saved layout given back) through `onChanged`.
 */
export interface FilterEditorContext<T> {
    readonly column: GridColumn<T>;
    /** The condition of the filter row now, such as `'='` or `'contains'`. */
    readonly operator: GridFilterOperator;
    /** The value of the filter now (`undefined` when there is none). */
    readonly value: unknown;
    /** The upper end of `'between'`. */
    readonly value2: unknown;
    /** Filters by `value` (and `value2` for `'between'`); `undefined` or an empty value removes the condition. */
    setValue(value: unknown, value2?: unknown): void;
    /** Removes the column's filter row condition. */
    clear(): void;
    /** Calls `listener` with the value whenever the column's filter changes; returns what stops it. */
    onChanged(listener: (value: unknown, value2: unknown) => void): () => void;
}
