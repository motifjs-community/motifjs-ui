/** Draws a row's content into `host`; may return a cleanup. */
export type TreeViewItemTemplate<T> = (item: T, host: HTMLElement) => (() => void) | void;
