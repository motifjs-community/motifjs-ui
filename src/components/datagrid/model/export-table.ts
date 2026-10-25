/** Rows ready to export: the fields in display order and one array of cell values per row. */
export interface ExportTable {
  fields: string[];
  rows: unknown[][];
  /** Grouped: a line per group, before the row it starts at, with its "Column: value" text. */
  groups?: { at: number; text: string; level: number }[];
}
