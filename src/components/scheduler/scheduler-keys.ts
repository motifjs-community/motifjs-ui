/**
 * The key bindings that apply while focus is inside the scheduler, outside text fields. Each is a
 * list of chords, and an empty list disables the binding.
 */
export interface SchedulerKeys {
  /** The default is `T`. */
  today: string[];
  /** The defaults are `N` and `J`. */
  next: string[];
  /** The defaults are `P` and `K`. */
  previous: string[];
  /** Show the first view of each type. The defaults are `D`, `W`, `X`, `M` and `A`. */
  dayView: string[];
  weekView: string[];
  workWeekView: string[];
  monthView: string[];
  agendaView: string[];
  /**
   * On a focused appointment in a grouped view, moves it to the previous or next group. Enter saves,
   * and Escape reverts. The defaults are `Alt+Shift+ArrowLeft` and `Alt+Shift+ArrowRight`, mirrored
   * on right-to-left pages.
   */
  previousGroup: string[];
  nextGroup: string[];
}
