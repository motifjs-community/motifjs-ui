import type { GroupNode } from './group-node';

/** What sits at a place of the grouped list: a group's row or its footer, or a data row by its index in group order. */
export type GroupItemEntry = { node: GroupNode; data: -1; footer: boolean } | { node: null; data: number; footer: false };
