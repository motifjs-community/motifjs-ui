import type { ColumnFeatures } from './column-features';
import type { GridColumn } from './grid-column';

/**
 * A column option `grid.columnOption(field, name)` reads and writes: the layout's, the sort order,
 * the grouping, the header filter's values, a feature switch, or any field of the definition.
 */
export type ColumnOptionName = 'width' | 'visible' | 'hidden' | 'flex' | 'sticky' | 'visibleIndex' | 'sortOrder' | 'sortIndex' | 'groupIndex' | 'filterValues' | 'filterType' | keyof ColumnFeatures | keyof GridColumn;
