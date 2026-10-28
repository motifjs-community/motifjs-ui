import type { SchedulerForm } from './scheduler-form';

/** What the user may change, and the form. Each is a switch of its own; an appointment's own field (`fields.allowDrag`…) wins over it. */
export interface SchedulerEditing<T = unknown> {
  /** A double click (or Enter) on cells opens the form for a new appointment. Default `true`. */
  allowAdding: boolean;
  /** The form edits an appointment. Default `true`. */
  allowUpdating: boolean;
  /** Delete, and the form's and the tooltip's Delete. Default `true`. */
  allowDeleting: boolean;
  /** Moving by dragging and by the keys. Default `true`. */
  allowDragging: boolean;
  /** Changing the start or the end by its edges and by the keys. Default `true`. */
  allowResizing: boolean;
  /** Ctrl while dragging drops a copy. Default `true`. */
  allowCopying: boolean;
  /** Asks before deleting. Default `true`. */
  confirmDelete: boolean;
  /** The form edits how an appointment repeats. Default `true`. */
  allowRecurrence: boolean;
  /** The form edits the time zones of the start and the end. Default `false`. */
  allowTimeZones: boolean;
  /** What the appointment form holds and how it is laid out, without events (`onFormOpening` still gets the items). */
  form?: SchedulerForm<T>;
}
