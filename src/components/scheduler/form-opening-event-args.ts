import type { EventArgs } from '@motifx/core';
import type { FormItem } from '../formlayout/form-item';
import type { MxForm } from '../form/MxForm';
import type { BottomSheet } from '../sheet/BottomSheet';
import type { AppointmentFormData } from './appointment-form-data';
import type { Scheduler } from './Scheduler';

/**
 * Occurs before the appointment form opens. `items` can be changed. Custom fields read and write
 * `data`, whose extra keys are written to the appointment fields of those names. Set `cancel = true`
 * to keep the form closed and show a custom form.
 */
export interface FormOpeningEventArgs<T = unknown> extends EventArgs {
  /** The appointment being edited, or `null` for a new one. */
  appointment: T | null;
  data: AppointmentFormData;
  items: FormItem[];
  /** The form's window or, on a phone, the sheet that contains the form. */
  form: MxForm | BottomSheet;
  source: Scheduler<T>;
}
