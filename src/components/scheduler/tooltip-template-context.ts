/** The context of a tooltip template: the displayed appointment and the tooltip's actions. */
export interface TooltipTemplateContext<T> {
  readonly appointment: T | null;
  /** Its text and time as the scheduler displays them. */
  readonly text: string;
  readonly time: string;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  /** Opens the appointment's form. */
  edit(): void;
  /** Deletes the appointment, after confirmation if `editing.confirmDelete` is set. */
  remove(): void;
  close(): void;
}
