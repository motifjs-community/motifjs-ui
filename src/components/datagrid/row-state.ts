/** What a row is going through, given to `actions` and to an action's `visible` and `disabled`. */
export interface RowState {
  /** Added in the grid and never saved. */
  readonly isNew: boolean;
  /** The user is in this row with edits not sent yet, or has its editor open. */
  readonly isEditing: boolean;
  /** Has unsaved values. */
  readonly isDirty: boolean;
  readonly isSaving: boolean;
  /** The last save failed, or a value has a message. */
  readonly hasError: boolean;
  /** Marked for deletion (batch mode), or being deleted. */
  readonly isRemoved: boolean;
  readonly isSelected: boolean;
  /** Index of the row in the grid (new rows included). */
  readonly index: number;
}
