import type { ComponentBase } from '@motifx/core';

/** Where focus was, to give it back later (`rememberFocus`). It holds the place; nothing reads it as an element. */
export interface FocusMark {
  /** Sets focus there again when that place can still take it. Returns whether focus is there now. */
  restore(options?: FocusOptions): boolean;
  /** Whether that place is `part` or inside it, or inside a part that stands for it (`standFor`). */
  isIn(part: ComponentBase): boolean;
}
