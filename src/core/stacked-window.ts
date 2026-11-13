import type { ComponentBase } from '@motifx/core';

/** What the window stack needs from a shown window: the window as a component, and an active flag it can flip. */
export interface StackedWindow {
  /** The window's component: its place in the stack is written on it (`--_mx-z`). */
  readonly part: ComponentBase;
  /** A modal window: while it is on top, keys reach nothing outside it. */
  readonly modal?: boolean;
  setActive(active: boolean): void;
}
