/** The reason a toast closed: its timer ended, its close button, Escape, its action, or a call to `close()`. */
export type ToastCloseReason = 'timeout' | 'button' | 'escape' | 'action' | 'code';
