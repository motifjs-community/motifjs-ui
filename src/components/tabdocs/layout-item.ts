import type { TabGroup } from './TabGroup';
import type { TabSplit } from './TabSplit';

/** A node of the layout tree: a split, or a group (the leaves). */
export type LayoutItem = TabSplit | TabGroup;
