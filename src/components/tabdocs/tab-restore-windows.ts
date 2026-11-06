/**
 * How `loadLayout` restores saved new windows. `float` places their documents in floating windows.
 * `reopen` opens the windows again, but a browser lets a page open windows only on a click or a key
 * press, so what it blocks stays floating until `reopenWindows`. `main` places them among the
 * documents of the main window.
 */
export type TabRestoreWindows = 'float' | 'reopen' | 'main';
