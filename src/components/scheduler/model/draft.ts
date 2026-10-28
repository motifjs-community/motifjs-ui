/** Where an appointment being moved or resized would go: the layout shows it there (the same box), or a copy of it. */
export interface Draft<T> {
  item: T;
  start: Date;
  end: Date;
  allDay: boolean;
  /** A copy goes there; the appointment stays. */
  copy: boolean;
  /** It may not go there (an event or the time's availability said so). */
  invalid: boolean;
  /** Moved to another group: the values its resource fields would get, by field. */
  resources?: Record<string, unknown> | null;
}
