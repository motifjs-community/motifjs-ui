import type { ComponentBase } from '@motifx/core';

export interface ValueChangedEventArgs<T> {
  value: T;
  previousValue: T;
  /** `true` when the user changed it, `false` when code did. */
  byUser: boolean;
  source: ComponentBase;
  /** The DOM event of a user change. */
  event?: Event;
}
