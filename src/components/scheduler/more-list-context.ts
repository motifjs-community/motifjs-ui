/** The context of a "+N more" list template: the day, its appointments and a way to open one. */
export interface MoreListContext<T> {
  readonly date: Date | null;
  readonly appointments: readonly T[];
  /** Closes the list and performs the same action as a click on the appointment. */
  choose(appointment: T, event: MouseEvent | KeyboardEvent): void;
}
