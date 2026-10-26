import type { FieldLabelMode } from '../../parts/field/field-label-mode';
import type { FormItem } from '../formlayout/form-item';

/** How an adaptive detail lays its form out: change it in `onAdaptiveDetailRowPreparing`. */
export interface GridAdaptiveFormOptions {
  /** The hidden columns by field, in display order; reorder them, take some out, or put kit form items (`template`, `group`) among them. */
  items: (string | FormItem)[];
  colCount: number;
  minColWidth: string | undefined;
  labelMode: FieldLabelMode;
}
