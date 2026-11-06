import type { EventArgs } from '@motifx/core';
import type { GridLayout } from './grid-layout';

/** Occurs when the user resizes, moves, hides, pins, sorts or resets. Set `cancel = true` to restore the previous layout. */
export interface GridLayoutChangingEventArgs extends EventArgs {
  readonly layout: GridLayout;
  readonly previous: GridLayout;
}
