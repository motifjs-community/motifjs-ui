import type { LayoutOrientation } from '../layout/layout-orientation';
import type { TabLayoutNode } from './tab-layout-node';

/** Groups side by side (`horizontal`) or one under the other, each with its share of the room. */
export interface TabLayoutSplit {
  kind: 'split';
  orientation: LayoutOrientation;
  /** One share per child, adding up to 1. */
  sizes: number[];
  children: TabLayoutNode[];
}
