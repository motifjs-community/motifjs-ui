/** What a "+N more" list template gets: the day, its appointments and how to open one. */
export interface MoreListContext<T> {
  readonly date: Date | null;
  readonly appointments: readonly T[];
  /** Closes the list and does what a click on the appointment does. */
  choose(appointment: T, event: MouseEvent | KeyboardEvent): void;
}
