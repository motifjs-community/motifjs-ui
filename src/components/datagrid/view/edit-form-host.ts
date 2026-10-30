import type { data } from '@motifx-community/data';
import type { CellEditor } from './CellEditor';

/** What the edit form asks of the grid. */
export interface EditFormHost<T> {
  save(): void;
  cancel(): void;
  /** `onEditorPreparing`: whether the editor may be made, with these props. `row` is the row itself, `entered` the values entered and not saved yet. */
  prepare(field: string, row: T, entered: data.RowCheckContext<T>, isNew: boolean, options: Record<string, unknown>): boolean;
  /** `onEditorPrepared`. */
  prepared(field: string, row: T, entered: data.RowCheckContext<T>, isNew: boolean, editor: CellEditor<T>): void;
}
