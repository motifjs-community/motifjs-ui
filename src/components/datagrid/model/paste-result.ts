/** What a paste wrote. */
export interface PasteResult {
  /** Ids of the rows written into, in order (new rows opened for the paste included). */
  rowIds: string[];
  /** Cells that took a value. */
  cells: number;
  /** Cells whose text could not be read; they show the message. */
  failed: number;
}
