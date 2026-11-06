import type { ComponentBase } from '@motifx/core';

export interface ValidatedEventArgs {
  valid: boolean;
  /** The message shown, or `''` if it passed. */
  message: string;
  source: ComponentBase;
}
