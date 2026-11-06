/** The values the appointment form edits, which are written back to the appointment's fields on save. */
export interface AppointmentFormData {
  text: string;
  start: Date | null;
  end: Date | null;
  allDay: boolean;
  description: string;
  /** Custom fields added in `formOpening` are also stored here. */
  [field: string]: unknown;
}
