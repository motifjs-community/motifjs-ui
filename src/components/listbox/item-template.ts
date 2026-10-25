/** Draws an item into `host` instead of its text; may return a cleanup. */
export type ItemTemplate<T> = (item: T, host: HTMLElement) => (() => void) | void;
