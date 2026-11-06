/** Strings of the toolbar's export button, over the `gridExport…` strings of `uiLocale`. `{format}` is the format's name. */
export interface GridExportTexts {
  /** The button's name when it opens a menu. The default is "Export". */
  exportTo?: string;
  /** The command that exports all rows. The default is "Export all data to {format}". */
  exportAll?: string;
  /** The command that exports the selected rows. The default is "Export selected rows to {format}". */
  exportSelectedRows?: string;
  /** The names of the formats by code, over "Excel", "CSV" and "PDF". */
  formats?: Readonly<Record<string, string>>;
}
