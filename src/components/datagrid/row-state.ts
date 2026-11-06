/** The state of a row, passed to `actions` and to an action's `visible` and `disabled`. */
export interface RowState {
  /** Indicates that the row was added in the grid and never saved. */
  readonly isNew: boolean;
  /** Indicates that the user is in this row with unsent edits, or has its editor open. */
  readonly isEditing: boolean;
  /** Indicates that the row has unsaved values. */
  readonly isDirty: boolean;
  readonly isSaving: boolean;
  /** Indicates that the last save failed, or that a value has a message. */
  readonly hasError: boolean;
  /** Indicates that the row is marked for deletion (batch mode), or is being deleted. */
  readonly isRemoved: boolean;
  readonly isSelected: boolean;
  /** The index of the row in the grid, including new rows. */
  readonly index: number;
}
