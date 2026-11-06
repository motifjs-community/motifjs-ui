import type { ComponentBase } from '@motifx/core';

/** Occurs when an editor is created, in a cell or in the edit form. It is disposed when the edit ends. */
export interface GridEditorPreparedEventArgs<T> {
  readonly field: string;
  /** The row itself. */
  readonly row: T;
  /** The entered, unsaved values by field (`{}` while there are none). The row itself does not hold them. */
  readonly values: Readonly<Partial<T>>;
  /** Returns the value a field will be saved with: the entered value, otherwise the row's. */
  getValue(field: string): unknown;
  readonly isNew: boolean;
  /** The kit's editor, or the column's custom `editor` content when it is a component. */
  readonly editor: ComponentBase | null;
  /** The element that holds it. */
  readonly element: HTMLElement;
  /** `'cell'`, `'form'` for the edit form (`editMode` `'form'` and `'popup'`), or `'adaptive'` for a row's adaptive detail. */
  readonly place: 'cell' | 'form' | 'adaptive';
}
