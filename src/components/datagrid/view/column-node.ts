/** A column or band in the column chooser's tree. */
export interface ColumnNode {
  id: string;
  text: string;
  enabled: boolean;
  children?: ColumnNode[];
}
