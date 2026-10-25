/** One item of a tree, as the tree knows it after reading its fields. */
export interface TreeNode<T> {
  item: T;
  key: unknown;
  parent: TreeNode<T> | null;
  /** 1 for a root. */
  level: number;
  /** `null` while the children are not known yet (they load on the first expand). */
  children: TreeNode<T>[] | null;
  /** Its children load on demand. */
  lazy: boolean;
}
