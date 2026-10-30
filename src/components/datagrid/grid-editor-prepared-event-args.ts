import type { ComponentBase } from '@motifx/core';

/** An editor was made, in a cell or in the edit form: set it up further (it is disposed when the edit ends). */
export interface GridEditorPreparedEventArgs<T> {
  readonly field: string;
  /** The row itself. */
  readonly row: T;
  /** The values entered and not saved yet, by field (`{}` while there are none); the row itself does not hold them. */
  readonly values: Readonly<Partial<T>>;
  /** The value a field is saved with: the entered one when there is one, else the row's. */
  getValue(field: string): unknown;
  readonly isNew: boolean;
  /** The kit's editor, or the column's own `editor` content when it is a component. */
  readonly editor: ComponentBase | null;
  /** The element that holds it. */
  readonly element: HTMLElement;
  /** `'cell'`, `'form'` for the edit form (`editMode` `'form'` and `'popup'`), or `'adaptive'` for a row's adaptive detail. */
  readonly place: 'cell' | 'form' | 'adaptive';
}
