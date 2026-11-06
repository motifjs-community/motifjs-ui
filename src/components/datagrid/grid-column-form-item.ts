import type { Bind } from '@motifx/core';

/** A column's field in the edit form. */
export interface GridColumnFormItem {
  /** `false` omits the column from the form. The default is `true`. */
  visible?: Bind<boolean>;
  /** The form columns it spans, or `'all'` for the whole line. */
  colSpan?: number | 'all';
  /** The label. The default is the column's title. */
  label?: Bind<string>;
  /** A line of help text below the editor. */
  helpText?: Bind<string>;
  /** The props of its editor in the form only, over the column's (`lookup.editorOptions`). */
  editorOptions?: Record<string, unknown>;
  /** Its position in the form, lowest first. The default is the column's position. */
  order?: number;
}
