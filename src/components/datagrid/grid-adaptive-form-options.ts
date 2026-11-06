import type { FieldLabelMode } from '../../parts/field/field-label-mode';
import type { FormItem } from '../formlayout/form-item';

/** How an adaptive detail lays out its form. Change it in `onAdaptiveDetailRowPreparing`. */
export interface GridAdaptiveFormOptions {
  /**
   * The hidden columns by field, in display order. You can reorder them, remove some, or add kit form
   * items (`template`, `group`) among them.
   */
  items: (string | FormItem)[];
  colCount: number;
  minColWidth: string | undefined;
  labelMode: FieldLabelMode;
}
