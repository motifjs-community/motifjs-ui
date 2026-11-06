import type { Bind } from '@motifx/core';
import type { Toast } from './Toast';

/** A button in a toast, such as Undo. Clicking it runs `click` and then closes the toast. */
export interface ToastAction {
  text: Bind<string>;
  click?: (toast: Toast) => void;
}
