import type { TabBrowserWindow } from './TabBrowserWindow';
import type { TabDocument } from './TabDocument';

/**
 * A new window's title: a text where `{title}` is its active document's title and `{page}` the
 * page's own title, or a function that makes it.
 */
export type TabNewWindowTitle = string | ((document: TabDocument | null, window: TabBrowserWindow) => string);
