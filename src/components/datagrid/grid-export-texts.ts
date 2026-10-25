/** Texts of the toolbar's export button, over the `gridExport…` texts of `uiLocale`; `{format}` is the format's name. */
export interface GridExportTexts {
  /** The button's name when it opens a menu. Default "Export". */
  exportTo?: string;
  /** Default "Export all data to {format}". */
  exportAll?: string;
  /** Default "Export selected rows to {format}". */
  exportSelectedRows?: string;
  /** Names of the formats by their code, over "Excel", "CSV" and "PDF". */
  formats?: Readonly<Record<string, string>>;
}
