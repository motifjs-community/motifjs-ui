import type { ComponentBase } from '@motifx/core';

export interface ColorChangedEventArgs {
  /** `#rrggbb` (or `#rrggbbaa`), or `null`. */
  value: string | null;
  /** `true` when the user moved, typed or chose it, `false` when code set it. */
  byUser: boolean;
  source: ComponentBase;
}
