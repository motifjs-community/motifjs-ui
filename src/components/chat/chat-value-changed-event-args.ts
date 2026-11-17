import type { ComponentBase } from '@motifx/core';

/** The user changed a choice of the composer: the mode, the model, the thinking. */
export interface ChatValueChangedEventArgs<T> {
  value: T;
  source: ComponentBase;
}
