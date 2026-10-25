/** Loads the children of an item the first time it opens. */
export type TreeViewLoadChildren<T> = (item: T) => Promise<readonly T[]>;
