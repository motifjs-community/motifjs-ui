import type { EventArgs } from '@motifx/core';
import type { FormItem } from '../formlayout/form-item';
import type { MxForm } from '../form/MxForm';
import type { AppointmentFormData } from './appointment-form-data';
import type { Scheduler } from './Scheduler';

/**
 * The appointment form is about to open. `items` may be changed (fields of your own read and write
 * `data`, whose extra keys are written to the appointment's fields of those names); `cancel = true`
 * keeps it closed (to show a form of your own).
 */
export interface FormOpeningEventArgs<T = unknown> extends EventArgs {
  /** The appointment edited; `null` for a new one. */
  appointment: T | null;
  data: AppointmentFormData;
  items: FormItem[];
  form: MxForm;
  source: Scheduler<T>;
}
