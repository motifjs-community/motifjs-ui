/** A cell by its place: the column's index (a day, in a group), and the time row's (`-1`: the all-day panel, or a day of the month view). */
export interface CellPlace {
  column: number;
  slot: number;
}
