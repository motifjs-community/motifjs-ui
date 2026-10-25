import type { GroupNode } from './group-node';

/** What sits at a place of the grouped list: a group's row, or a data row by its index in group order. */
export type GroupItemEntry = { node: GroupNode; data: -1 } | { node: null; data: number };
