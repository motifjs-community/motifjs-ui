/** A range found in the rows shown now: its first and last grid rows (data rows), its columns, its anchor. */
export interface RangeBox {
  top: number;
  bottom: number;
  fields: Set<string>;
  anchorRow: number;
  anchorField: string;
}
