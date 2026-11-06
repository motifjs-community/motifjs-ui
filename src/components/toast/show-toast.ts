import type { Bind } from '@motifx/core';
import type { Toast } from './Toast';
import type { ToastProps } from './toast-props';
import { Toaster } from './Toaster';

/**
 * Shows toasts on `Toaster.default`: one created in `document.body` on first use, or the one the application
 * assigned. Each call returns the `Toast`, to `close()` or `update()` it, or to await `closed`.
 *
 * @example
 * toast.success('Saved.');
 * const t = toast.show({ title: 'Export', text: 'Preparing the file…', duration: 0 });
 * toast.danger('The server did not answer.', { action: { text: 'Retry', click: () => this.retry() } });
 */
export const toast = {
  show: (options: ToastProps | Toast): Toast => Toaster.default.show(options),
  info: (text: Bind<string>, options?: ToastProps): Toast => Toaster.default.info(text, options),
  success: (text: Bind<string>, options?: ToastProps): Toast => Toaster.default.success(text, options),
  caution: (text: Bind<string>, options?: ToastProps): Toast => Toaster.default.caution(text, options),
  danger: (text: Bind<string>, options?: ToastProps): Toast => Toaster.default.danger(text, options),
  closeAll: (): void => Toaster.default.closeAll(),
};
