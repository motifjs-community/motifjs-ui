import type { GridExportTexts } from '../grid-export-texts';

/** The `export` prop as the grid reads it: values, not functions. */
export interface ExportValues {
  formats: readonly string[] | undefined;
  allowExportSelectedData: boolean | undefined;
  texts: GridExportTexts | undefined;
}
