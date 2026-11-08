/** The field that holds the children of an item at `depth` (0 for an item of the top list), or `null` when it has none. */
export type ChildrenAt = (depth: number) => string | null;
