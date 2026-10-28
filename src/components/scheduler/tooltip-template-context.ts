/** What a tooltip template gets: the appointment shown, and the tooltip's actions. */
export interface TooltipTemplateContext<T> {
  readonly appointment: T | null;
  /** Its text and time as the scheduler writes them. */
  readonly text: string;
  readonly time: string;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  /** Opens its form. */
  edit(): void;
  /** Deletes it (asking first, as `editing.confirmDelete` says). */
  remove(): void;
  close(): void;
}
