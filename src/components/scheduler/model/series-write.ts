/** One write of a change to a series: an appointment added, changed or deleted. */
export interface SeriesWrite<T> {
  kind: 'add' | 'update' | 'delete';
  /** The values added, or the appointment changed or deleted. */
  appointment: T | Partial<T>;
  /** What an update wrote. */
  changes?: Partial<T>;
}
