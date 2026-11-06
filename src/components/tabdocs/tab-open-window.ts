import type { TabWindowRequest } from './tab-window-request';

/**
 * Opens the browser window a document moves into. Returns a window of the page's origin, or `null` when
 * none could be opened. The default calls `window.open`. An application shell, a host page with its own
 * frame or a test can provide a custom function.
 */
export type TabOpenWindow = (request: TabWindowRequest) => Window | null;
