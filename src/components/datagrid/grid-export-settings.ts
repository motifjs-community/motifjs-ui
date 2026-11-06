import type { Bind } from '@motifx/core';
import type { GridExportTexts } from './grid-export-texts';

/**
 * The `export` prop: what the toolbar's export button (`settings.exportButton`) offers. With one
 * command, the button runs it, and with more, it opens a menu. The grid writes `'csv'`, and any other
 * format raises `onExporting` with that `format`, where you write the file (`exportDataGrid` of
 * `@motifx-community/ui/excel` for `'xlsx'`, of `/pdf` for `'pdf'`). Every field is a value or a
 * tracked function. Read and change it later through `grid.export`.
 *
 * @example
 * export={{ formats: ['xlsx', 'csv'], allowExportSelectedData: true }}
 */
export interface GridExportSettings {
  /** The formats offered, in order. The default is `['csv']`. */
  formats?: Bind<readonly string[] | undefined>;
  /** Adds an "Export selected rows" command for each format, while selection is enabled. The default is `false`. */
  allowExportSelectedData?: Bind<boolean | undefined>;
  texts?: Bind<GridExportTexts | undefined>;
}
