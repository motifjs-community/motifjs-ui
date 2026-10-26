import type { ControlProps } from '../../core/control';
import type { FilterBuilderProps } from '../filterbuilder/filter-builder-props';

/**
 * The filter builder the filter panel opens: any prop of `FilterBuilder` but its `value` and
 * `fields`, which the grid gives (the value, and a field per column with `filterBuilder` on).
 */
export type GridFilterBuilderOptions = Omit<FilterBuilderProps, 'value' | 'fields' | keyof ControlProps>;
