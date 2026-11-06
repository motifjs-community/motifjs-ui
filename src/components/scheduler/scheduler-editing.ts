import type { SchedulerForm } from './scheduler-form';

/**
 * What the user can change, and the form. Each is a separate switch, and an appointment's own field
 * (`fields.allowDrag`…) takes precedence.
 */
export interface SchedulerEditing<T = unknown> {
  /** Opens the form for a new appointment on a double-click or Enter on cells. The default is `true`. */
  allowAdding: boolean;
  /** Allows the form to edit an appointment. The default is `true`. */
  allowUpdating: boolean;
  /** Enables the Delete key and the Delete buttons of the form and the tooltip. The default is `true`. */
  allowDeleting: boolean;
  /** Allows moving by dragging and with the keyboard. The default is `true`. */
  allowDragging: boolean;
  /** Allows changing the start or the end with its edges and the keyboard. The default is `true`. */
  allowResizing: boolean;
  /** Allows dropping a copy by holding Ctrl while dragging. The default is `true`. */
  allowCopying: boolean;
  /** Asks for confirmation before deleting. The default is `true`. */
  confirmDelete: boolean;
  /** Includes the recurrence editor in the form. The default is `true`. */
  allowRecurrence: boolean;
  /** Includes the time zones of the start and the end in the form. The default is `false`. */
  allowTimeZones: boolean;
  /** The contents and layout of the appointment form, without events. `onFormOpening` still receives the items. */
  form?: SchedulerForm<T>;
}
