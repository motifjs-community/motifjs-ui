import type { TreeNode } from './tree-node';

/** A node on screen: where it sits among the siblings shown with it. */
export interface TreeRow<T> {
  node: TreeNode<T>;
  /** How many siblings are shown, itself included. */
  size: number;
  /** 1-based. */
  position: number;
}
