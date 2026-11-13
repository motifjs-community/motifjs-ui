import type { ComponentBase } from '@motifx/core';

/** The window of the kit (a Control that is one) keys go to, and the modal one on top, in the browser window of a key. */
export interface KeyWindows {
  /** The modal window on top, or `null`. */
  readonly modal: ComponentBase | null;
  /** The modal one when there is one, else the window focus is in, or `null`. Found the first time it is asked. */
  readonly active: ComponentBase | null;
}
