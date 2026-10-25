import type { FieldLabelMode } from '../../../parts/field/field-label-mode';
import type { FormItem } from '../../formlayout/form-item';

/** The edit form's options as the grid reads them: values, not functions. */
export interface FormValues {
  items: readonly (string | FormItem)[] | undefined;
  colCount: number;
  minColWidth: string | undefined;
  labelMode: FieldLabelMode;
}
