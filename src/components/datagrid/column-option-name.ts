import type { ColumnFeatures } from './column-features';

/** A column option `grid.columnOption(field, name)` reads and writes: the layout's, the sort order, the grouping, or a feature switch. */
export type ColumnOptionName = 'width' | 'visible' | 'sticky' | 'visibleIndex' | 'sortOrder' | 'sortIndex' | 'groupIndex' | keyof ColumnFeatures;
