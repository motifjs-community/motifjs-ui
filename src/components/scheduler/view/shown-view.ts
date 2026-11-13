import type { ComponentBase } from '@motifx/core';
import type { CellPlace } from '../model/cell-place';

/** What the scheduler asks of the view it shows: to draw itself again, and the parts it made, kept as it made them. */
export interface ShownView {
  /** Draws all of the view again. */
  draw(): void;
  /** The cell showing a place, while it is built (a big view builds only the cells in view); `null` where there is none. */
  cellAt(place: CellPlace): ComponentBase | null;
  /** The box of a piece (in the agenda: its row), while it is built; `null` where there is none. */
  boxOf(id: string): ComponentBase | null;
}
