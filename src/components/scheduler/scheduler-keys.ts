/** The scheduler's keys while focus is inside it (outside text fields). Each is a list of chords; an empty list turns it off. */
export interface SchedulerKeys {
  /** Default `T`. */
  today: string[];
  /** Default `N`, `J`. */
  next: string[];
  /** Default `P`, `K`. */
  previous: string[];
  /** Default `D`, `W`, `X`, `M`, `A`: the views by type (the first view of the type). */
  dayView: string[];
  weekView: string[];
  workWeekView: string[];
  monthView: string[];
  agendaView: string[];
  /**
   * On a focused appointment while the columns are grouped: moves it to the group before or after
   * (Enter saves, Escape takes it back). Default `Alt+Shift+ArrowLeft` and `Alt+Shift+ArrowRight`,
   * mirrored right to left.
   */
  previousGroup: string[];
  nextGroup: string[];
}
