/**
 * What `loadLayout` does with the new windows a layout saved: `float` puts their documents in
 * floating windows, `reopen` opens the windows again (a browser lets a page open windows only
 * on a click or a key: what it blocks stays floating until `reopenWindows`), `main` puts them
 * among the documents of the main window.
 */
export type TabRestoreWindows = 'float' | 'reopen' | 'main';
