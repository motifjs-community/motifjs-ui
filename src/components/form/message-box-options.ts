import type { Bind } from '@motifx/core';
import type { FormHost } from './form-host';
import type { FormResult } from './form-result';
import type { MessageBoxButton } from './message-box-button';
import type { MessageBoxTone } from './message-box-tone';

/** The content and options of a `messageBox`. */
export interface MessageBoxOptions {
  title?: Bind<string>;
  text: Bind<string>;
  /** `'ok'`, `'cancel'`, `'yes'`, `'no'` (named from `uiLocale`) or custom buttons. The default is `['ok']`. */
  buttons?: readonly ('ok' | 'cancel' | 'yes' | 'no' | MessageBoxButton)[];
  /** The tone of the box. The default is `'none'`. */
  tone?: MessageBoxTone;
  /**
   * The result of the button that Enter activates and that receives focus first. The default is `ok` or `yes`,
   * otherwise the first button. In a danger box, focus starts on the safe button.
   */
  defaultButton?: FormResult;
  /** Where it is shown. The default is the application, otherwise the page's body. */
  host?: FormHost;
}
