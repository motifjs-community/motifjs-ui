import type { GridBand } from './grid-band';
import type { GridColumn } from './grid-column';

/** An entry of the grid's `columns`: a column, or a band over columns. */
export type GridColumnItem<T = any> = GridColumn<T> | GridBand<T>;
