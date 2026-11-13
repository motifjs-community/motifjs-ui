import type { ComponentBase } from '@motifx/core';
import { TabGroup } from './TabGroup';
import type { TabSplit } from './TabSplit';

/** A node of the layout tree: a split, or a group (the leaves). */
export type LayoutItem = TabSplit | TabGroup;

/** A layout item as a component: a group is one, a split has its part. */
export function itemPart(item: LayoutItem): ComponentBase {
  return item instanceof TabGroup ? item : item.part;
}
