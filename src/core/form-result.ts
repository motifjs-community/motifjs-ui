/**
 * The answer a form closes with, like `dialog.returnValue`: `'ok'`,
 * `'cancel'`, `'yes'`, `'no'` or any string the app uses. `'none'` while the
 * form is open, or when it closed without an answer. `showDialog()` resolves
 * with it; a button inside the form carrying `data-result="ok"` closes the
 * form with that value.
 *
 * @example
 * if ((await new CustomerForm().showDialog(this)) === 'ok') save();
 */
export type FormResult = 'none' | 'ok' | 'cancel' | 'yes' | 'no' | (string & {});

/**
 * Why a form is closing:
 * - `code`: code called `close()` (a `data-result` button counts as code);
 * - `user`: the close button in the title bar, or Escape;
 * - `owner`: the component the form's lifetime is bound to is being
 *   disposed. The form dies with it; `cancel` is ignored in this case.
 */
export type CloseReason = 'code' | 'user' | 'owner';

/** A `data-result` attribute value as a {@link FormResult}; empty or missing becomes `'none'`. */
export function toFormResult(value: string | null | undefined): FormResult {
  return value ? value : 'none';
}
