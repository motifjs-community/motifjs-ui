import type { ComponentBase } from '@motifx/core';

export interface ColorChangedEventArgs {
  /** `#rrggbb` (or `#rrggbbaa`), or `null`. */
  value: string | null;
  /** `true` when the user moved, typed or selected the color, and `false` when it was set programmatically. */
  byUser: boolean;
  source: ComponentBase;
}
