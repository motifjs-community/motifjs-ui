import type { AppointmentFormData } from './appointment-form-data';
import type { Scheduler } from './Scheduler';

/** The context of form settings specified as functions: the form's appointment and its current data. */
export interface AppointmentFormContext<T = unknown> {
  /** The appointment, or `null` for a new one. */
  appointment: T | null;
  /** The values in the form, including resource fields. A function that reads them reruns when a field changes. */
  data: AppointmentFormData;
  isNew: boolean;
  source: Scheduler<T>;
}
