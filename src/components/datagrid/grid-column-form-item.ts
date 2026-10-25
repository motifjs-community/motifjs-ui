import type { Bind } from '@motifx/core';

/** A column's field in the edit form. */
export interface GridColumnFormItem {
  /** `false` leaves the column out of the form. Default `true`. */
  visible?: Bind<boolean>;
  /** Form columns it spans; `'all'` the whole line. */
  colSpan?: number | 'all';
  /** The label. Default: the column's title. */
  label?: Bind<string>;
  /** A line under the editor. */
  helpText?: Bind<string>;
  /** Props of its editor in the form only, over the column's (`lookup.editorOptions`). */
  editorOptions?: Record<string, unknown>;
  /** Its place in the form; lower first. Default: the column's place. */
  order?: number;
}
