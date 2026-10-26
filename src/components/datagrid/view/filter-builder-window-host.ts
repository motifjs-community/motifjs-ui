import type { ComponentBase } from '@motifx/core';
import type { GridFilterBuilderOptions } from '../grid-filter-builder-options';
import type { Switches } from '../model/Switches';
import type { PopupValues } from './popup-values';

/** What the filter builder's window needs from the grid. */
export interface FilterBuilderWindowHost {
  /** The window is shown modal over it and goes with it. */
  owner: ComponentBase;
  /** The builder's props, live. */
  options: GridFilterBuilderOptions;
  /** The window's options. */
  popup: Switches<PopupValues>;
  /** Focus goes back here when the window closes and nothing else has it. */
  returnFocus(): void;
}
