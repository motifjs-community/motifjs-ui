import type { ComponentBase } from '@motifx/core';
import type { LayoutItem } from './layout-item';
import { TabSplit } from './TabSplit';

/** The component of a node of the layout: a split's part, or the group itself. */
export function itemPart(item: LayoutItem): ComponentBase {
  return item instanceof TabSplit ? item.part : item;
}
