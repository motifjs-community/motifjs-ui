/** Draws an item into `host` instead of its text. It can return a cleanup function. */
export type ItemTemplate<T> = (item: T, host: HTMLElement) => (() => void) | void;
