/** Rows ready to export: the fields in display order and one array of cell values per row. */
export interface ExportTable {
  fields: string[];
  rows: unknown[][];
}
