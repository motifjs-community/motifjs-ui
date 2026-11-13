import type { DragGhost } from '../../../parts/drag/DragGhost';
import type { GroupDrop } from './group-drop';

/** What the group panel asks the grid: the headers it drops chips on, and where focus goes. */
export interface GroupPanelHost {
  isRtl(): boolean;
  /** The picture that follows a dragged chip. */
  readonly ghost: DragGhost;
  /** Where a chip dragged over the headers lands (index -1: not over them, or NaN); reads only. */
  headerDropAt(field: string, x: number, y: number): GroupDrop;
  /** Marks where a drop read with `headerDropAt` lands; one at -1 hides the mark. */
  showHeaderDrop(drop: GroupDrop): void;
  /** A chip was dropped on the headers at place `index` (read with `headerDropAt`): the column is ungrouped and put there. */
  dropOnHeaders(field: string, index: number): void;
  /** The last chip went away: focus goes back to the rows. */
  focusRows(): void;
  /** A key on a chip, before the panel handles it: `false` when the app takes it (`onKeyHandling`). */
  keyHandling(e: KeyboardEvent): boolean;
}
