import type { ComponentBase } from '@motifx/core';

export interface EnterKeyEventArgs<T> {
  value: T;
  source: ComponentBase;
  event: KeyboardEvent;
}
