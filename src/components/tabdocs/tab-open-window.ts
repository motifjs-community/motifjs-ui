import type { TabWindowRequest } from './tab-window-request';

/**
 * Opens the browser window a document moves into: a window of the page's origin, `null` when
 * none could be opened. The default calls `window.open`; an application shell, a host page with a
 * frame of its own or a test gives its own.
 */
export type TabOpenWindow = (request: TabWindowRequest) => Window | null;
