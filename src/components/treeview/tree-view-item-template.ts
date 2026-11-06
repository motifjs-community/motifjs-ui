/** Draws the content of a row into `host`. It can return a cleanup function. */
export type TreeViewItemTemplate<T> = (item: T, host: HTMLElement) => (() => void) | void;
