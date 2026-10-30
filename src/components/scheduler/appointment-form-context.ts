import type { AppointmentFormData } from './appointment-form-data';
import type { Scheduler } from './Scheduler';

/** What the form's items given as functions get: the appointment the form is for and the form's data, as it is now. */
export interface AppointmentFormContext<T = unknown> {
  /** `null` for a new one. */
  appointment: T | null;
  /** The values in the form (its resource fields too): a function reading them is read again when a field changes. */
  data: AppointmentFormData;
  isNew: boolean;
  source: Scheduler<T>;
}
