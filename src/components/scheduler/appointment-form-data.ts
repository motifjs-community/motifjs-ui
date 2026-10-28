/** What the appointment form edits; written back to the appointment's own fields when it is saved. */
export interface AppointmentFormData {
  text: string;
  start: Date | null;
  end: Date | null;
  allDay: boolean;
  description: string;
  /** Your own fields (from `formOpening`) go here too. */
  [field: string]: unknown;
}
