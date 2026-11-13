import type { Bind, ComponentBase } from '@motifx/core';

/** A part of the grid the cell tip is for (a cell, a header title, a button), and what the tip says for it. */
export interface CellTipTarget {
  part: ComponentBase;
  /** The message of a cell with an error. */
  message?: Bind<string>;
  /** The hint of a button, or of a lookup cell. */
  hint?: Bind<string>;
  /** The full text, shown when it is cut off; a cell that holds buttons gives none. */
  text?: Bind<string>;
}
