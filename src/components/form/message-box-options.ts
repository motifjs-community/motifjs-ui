import type { Bind } from '@motifx/core';
import type { FormHost } from './form-host';
import type { FormResult } from './form-result';
import type { MessageBoxButton } from './message-box-button';
import type { MessageBoxTone } from './message-box-tone';

/** What `messageBox` shows. */
export interface MessageBoxOptions {
  title?: Bind<string>;
  text: Bind<string>;
  /** `'ok'`, `'cancel'`, `'yes'`, `'no'` (named from `uiLocale`) or buttons of your own. Default `['ok']`. */
  buttons?: readonly ('ok' | 'cancel' | 'yes' | 'no' | MessageBoxButton)[];
  /** Default `'none'`. */
  tone?: MessageBoxTone;
  /** The result of the button Enter presses and that has focus first. Default: `ok` or `yes`, else the first button; in a danger box focus starts on the safe one. */
  defaultButton?: FormResult;
  /** What it is shown in. Default: the application, else a holder of its own on the page. */
  host?: FormHost;
}
