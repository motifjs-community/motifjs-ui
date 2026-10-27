/** The scheduler's keys while focus is inside it (outside text fields). Each is a list of chords; an empty list turns it off. */
export interface SchedulerKeys {
  /** Default `T`. */
  today: string[];
  /** Default `N`, `J`. */
  next: string[];
  /** Default `P`, `K`. */
  previous: string[];
  /** Default `D`, `W`, `X`, `M`: the views by type. */
  dayView: string[];
  weekView: string[];
  workWeekView: string[];
  monthView: string[];
}
