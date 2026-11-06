import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDocument } from './TabDocument';

/**
 * A new window's title: a text where `{title}` is the title of its active document and `{page}` is the
 * page title, or a function that returns it.
 */
export type TabNewWindowTitle = string | ((document: TabDocument | null, window: TabBrowserWindow) => string);
