/** One item of a tree, as the tree stores it after reading its fields. */
export interface TreeNode<T> {
  item: T;
  key: unknown;
  parent: TreeNode<T> | null;
  /** The depth of the node, which is 1 for a root. */
  level: number;
  /** `null` until the children are known, which happens on the first expand. */
  children: TreeNode<T>[] | null;
  /** Indicates that its children load on demand. */
  lazy: boolean;
}
