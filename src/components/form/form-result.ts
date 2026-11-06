/** How a form closed: `'ok'`, `'cancel'` or any custom word, like `dialog.returnValue`. */
export type FormResult = 'ok' | 'cancel' | (string & {});
