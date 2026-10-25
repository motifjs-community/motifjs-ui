import type { ComponentBase } from '@motifx/core';

/** An editor was made, in a cell or in the edit form: set it up further (it is disposed when the edit ends). */
export interface GridEditorPreparedEventArgs<T> {
  readonly field: string;
  /** The row with its unsaved edits applied (a copy). */
  readonly row: T;
  readonly isNew: boolean;
  /** The kit's editor, or the column's own `editor` content when it is a component. */
  readonly editor: ComponentBase | null;
  /** The element that holds it. */
  readonly element: HTMLElement;
  /** `'cell'`, or `'form'` for the edit form (`editMode` `'form'` and `'popup'`). */
  readonly place: 'cell' | 'form';
}
