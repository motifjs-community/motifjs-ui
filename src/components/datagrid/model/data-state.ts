/** The part of the grid's reactive state the data writes. */
export interface DataState {
  /** `loading` until the first rows of a query arrive; `error` when they could not be loaded. */
  status: 'loading' | 'ready' | 'error';
  /** Grows whenever rows arrive, change or change place. */
  version: number;
  /** Grows whenever an unsaved value, a mark or a message changes. */
  edits: number;
  /** Blocks that failed after the first answer. */
  failedBlocks: number;
}
