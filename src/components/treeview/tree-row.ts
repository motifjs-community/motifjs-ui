import type { TreeNode } from './tree-node';

/** A node on screen, with its position among the siblings shown with it. */
export interface TreeRow<T> {
  node: TreeNode<T>;
  /** The number of siblings shown, including itself. */
  size: number;
  /** The position, starting from 1. */
  position: number;
}
