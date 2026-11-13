import type { ComponentBase } from '@motifx/core';

/** A read and the write that uses what it read, for a round of the owner's window. */
export interface Job {
  readonly owner: ComponentBase;
  readonly read: () => unknown;
  readonly write: (value: unknown) => void;
  /** Taken back, or its loop stopped. */
  cancelled: boolean;
}
