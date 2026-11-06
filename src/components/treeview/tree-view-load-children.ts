/** Loads the children of an item when it is first expanded. */
export type TreeViewLoadChildren<T> = (item: T) => Promise<readonly T[]>;
