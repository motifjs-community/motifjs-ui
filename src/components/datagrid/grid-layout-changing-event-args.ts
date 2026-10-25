import type { EventArgs } from '@motifx/core';
import type { GridLayout } from './grid-layout';

/** The user changed the layout (resize, move, hide, pin, sort, reset); `cancel` puts the one before back. */
export interface GridLayoutChangingEventArgs extends EventArgs {
  readonly layout: GridLayout;
  readonly previous: GridLayout;
}
