/** Where a point drops on the group panel (or a chip on the headers): its place among the chips (or columns), and where the mark goes. */
export interface GroupDrop {
  /** The place among the chips (or columns); -1 when the point is not over the drop area. */
  readonly index: number;
  /** Pixels from the panel's inline start (the header row's left) to the mark. */
  readonly offset: number;
}
