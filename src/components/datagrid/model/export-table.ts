/** Rows ready to export: the fields in display order and one array of cell values per row. */
export interface ExportTable {
  fields: string[];
  rows: unknown[][];
  /** Grouped: a line per group, before the row it starts at: its "Column: value" text with its summary items, and items under their columns. */
  groups?: { at: number; text: string; level: number; cells: string[] }[];
  /** Grouped: a footer line per group, after the row its rows end at (inner groups first), by field. */
  footers?: { at: number; level: number; cells: string[] }[];
  /** The row of totals, by field. */
  total?: string[];
}
