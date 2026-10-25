import type { ComponentBase } from '@motifx/core';
import type { FieldButton } from './field-button';

export interface FieldButtonClickEventArgs {
  button: FieldButton;
  source: ComponentBase;
  event: MouseEvent;
}
