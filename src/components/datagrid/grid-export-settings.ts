import type { Bind } from '@motifx/core';
import type { GridExportTexts } from './grid-export-texts';

/**
 * The `export` prop: what the toolbar's export button (`settings.exportButton`) offers. With one
 * command the button runs it; with more it opens a menu of them. `'csv'` is written by the grid;
 * any other format raises `onExporting` with that `format`, where you write the file
 * (`exportDataGrid` of `@motifx-community/ui/excel` for `'xlsx'`, of `/pdf` for `'pdf'`). Every field is a value or a tracked function; read and
 * change it later through `grid.export`.
 *
 * @example
 * export={{ formats: ['xlsx', 'csv'], allowExportSelectedData: true }}
 */
export interface GridExportSettings {
  /** The formats offered, in order. Default `['csv']`. */
  formats?: Bind<readonly string[] | undefined>;
  /** An "Export selected rows" command for each format (with a selection mode on). Default `false`. */
  allowExportSelectedData?: Bind<boolean | undefined>;
  texts?: Bind<GridExportTexts | undefined>;
}
