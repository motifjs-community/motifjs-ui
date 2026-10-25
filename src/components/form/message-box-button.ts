import type { Bind } from '@motifx/core';
import type { ButtonTone } from '../button/button-tone';
import type { FormResult } from './form-result';

/** A button of your own in a message box: its text and the result it closes the box with. */
export interface MessageBoxButton {
  text: Bind<string>;
  result: FormResult;
  /** Default: `accent` for the default button (`danger` in a danger box), `standard` for the rest. */
  tone?: ButtonTone;
}
