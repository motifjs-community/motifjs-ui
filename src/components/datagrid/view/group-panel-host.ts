import type { DragGhost } from '../../../parts/drag/DragGhost';

/** What the group panel asks the grid: the headers it drops chips on, and where focus goes. */
export interface GroupPanelHost {
  isRtl(): boolean;
  /** The picture that follows a dragged chip. */
  readonly ghost: DragGhost;
  /** Marks where a chip dragged over the headers lands (NaN hides the mark); whether the point is over them. */
  showHeaderDrop(field: string, x: number, y: number): boolean;
  /** A chip was dropped on the headers at `x`: the column is ungrouped and put there. */
  dropOnHeaders(field: string, x: number): void;
  /** The last chip went away: focus goes back to the rows. */
  focusRows(): void;
  /** A key on a chip, before the panel handles it: `false` when the app takes it (`onKeyHandling`). */
  keyHandling(e: KeyboardEvent): boolean;
}
