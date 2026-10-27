/** A cell by its place: the day's index, and the time row's (`-1`: the all-day panel, or a day of the month view). */
export interface CellPlace {
  day: number;
  slot: number;
}
