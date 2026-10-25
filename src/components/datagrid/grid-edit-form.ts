import type { Bind } from '@motifx/core';
import type { FieldLabelMode } from '../../parts/field/field-label-mode';
import type { FormItem } from '../formlayout/form-item';

/**
 * The edit form of `editMode` `'form'` and `'popup'`, laid out by the kit's `FormLayout`. Read and
 * change it later through `grid.form`.
 */
export interface GridEditForm {
  /**
   * What the form holds, in order: a column by its field name, or a kit form item. An item whose
   * `field` is a column's gets that column's editor, with the item's `label`, `colSpan`, `helpText`,
   * `visible` and `editorProps`; groups (`group`, `items`, `columns`), buttons and `template`s are
   * the form's own. Default: every column, in the columns' order (`formItem.order` first).
   */
  items?: Bind<readonly (string | FormItem)[] | undefined>;
  /** Columns of the form. Default `2`. */
  colCount?: Bind<number>;
  /** With it, as many columns as fit, each at least this wide (a CSS length); `colCount` is the most. */
  minColWidth?: Bind<string>;
  /** Where the labels go. Default `'top'`. */
  labelMode?: Bind<FieldLabelMode>;
}
