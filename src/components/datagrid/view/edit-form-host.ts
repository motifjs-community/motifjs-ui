import type { CellEditor } from './CellEditor';

/** What the edit form asks of the grid. */
export interface EditFormHost<T> {
  save(): void;
  cancel(): void;
  /** `onEditorPreparing`: whether the editor may be made, with these props. */
  prepare(field: string, row: T, isNew: boolean, options: Record<string, unknown>): boolean;
  /** `onEditorPrepared`. */
  prepared(field: string, row: T, isNew: boolean, editor: CellEditor<T>): void;
}
