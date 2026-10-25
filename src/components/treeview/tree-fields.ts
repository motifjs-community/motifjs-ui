/** How a tree reads its items. */
export interface TreeFields<T> {
  key: (item: T) => unknown;
  children: (item: T) => unknown;
  parent: (item: T) => unknown;
  hasChildren: (item: T) => unknown;
}
