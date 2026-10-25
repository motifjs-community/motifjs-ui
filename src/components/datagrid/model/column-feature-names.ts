import type { ColumnFeatures } from '../column-features';

/** The features a column definition can turn on or off for itself. */
export const COLUMN_FEATURES = ['editable', 'creatable', 'sortable', 'resizable', 'movable', 'hideable', 'pinnable', 'menu', 'filterRow', 'headerFilter', 'copyable', 'exportable', 'syncLookupFilterValues', 'searchable'] as const satisfies readonly (keyof ColumnFeatures)[];
