import type { ComponentBase } from '@motifx/core';

/** A part that answers a key it declares in `aria-keyshortcuts`, as `setAccessKeyAttribute` keeps it. */
export interface AccessKeyEntry {
  /** The part that carries the key. */
  readonly part: ComponentBase;
  /** The key with its modifiers, as `aria-keyshortcuts` writes it: `Alt+S`, `Control+Alt+S`. */
  readonly token: string;
  /** What pressing it does. Returns whether it did anything. */
  readonly run: () => boolean;
}
