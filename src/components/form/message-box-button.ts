import type { Bind } from '@motifx/core';
import type { ButtonTone } from '../button/button-tone';
import type { FormResult } from './form-result';

/** A custom button in a message box: its text and the result it closes the box with. */
export interface MessageBoxButton {
  text: Bind<string>;
  result: FormResult;
  /** The button tone. The default is `accent` for the default button (`danger` in a danger box) and `standard` for the rest. */
  tone?: ButtonTone;
}
