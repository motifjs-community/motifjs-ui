import type { ColumnFeatures } from './column-features';
import type { GridColumn } from './grid-column';

/**
 * A column option that `grid.columnOption(field, name)` reads and writes: a layout option, the sort
 * order, the grouping, the header filter's values, a feature switch, or any field of the definition.
 */
export type ColumnOptionName = 'width' | 'visible' | 'hidden' | 'flex' | 'sticky' | 'visibleIndex' | 'sortOrder' | 'sortIndex' | 'groupIndex' | 'filterValues' | 'filterType' | keyof ColumnFeatures | keyof GridColumn;
