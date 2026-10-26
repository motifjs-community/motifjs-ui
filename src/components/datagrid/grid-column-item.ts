import type { GridBand } from './grid-band';
import type { GridColumn } from './grid-column';

/** What the grid's `columns` hold: columns, and bands over columns. */
export type GridColumnItem<T = any> = GridColumn<T> | GridBand<T>;
