import { givenList } from '../../core/given-field';
import type { TreeCheckState } from './tree-check-state';
import type { TreeFields } from './tree-fields';
import type { TreeNode } from './tree-node';
import type { TreeRow } from './tree-row';

/**
 * The nodes of a tree read from its items, nested (a `children` array) or flat (a `parentId` on
 * each item). Children loaded on demand are kept here and survive the next read. It tracks which
 * nodes are on screen and how check boxes combine, and it draws nothing.
 */
export class TreeModel<T> {
  roots: TreeNode<T>[] = [];
  /** Children loaded on demand, by the key of their parent. */
  readonly loaded = new Map<unknown, readonly T[]>();
  private byKey = new Map<unknown, TreeNode<T>>();
  private fields: TreeFields<T> | null = null;
  private lazy = false;

  /** Re-reads the items. With `lazy`, a node without children can load them. */
  read(items: readonly T[], fields: TreeFields<T>, flat: boolean, lazy: boolean): void {
    this.fields = fields;
    this.lazy = lazy;
    this.byKey = new Map();
    this.roots = flat ? this.readFlat(items) : this.readNested(items, null);
  }

  /** Stores children that have just loaded. */
  setChildren(node: TreeNode<T>, given: readonly T[]): void {
    const items = givenList(given);
    this.loaded.set(node.key, items);
    node.children = this.readNested(items, node);
  }

  node(key: unknown): TreeNode<T> | undefined {
    return this.byKey.get(key);
  }

  /** Every known node, with parents before their children. */
  *walk(nodes: readonly TreeNode<T>[] = this.roots): Generator<TreeNode<T>> {
    for (const node of nodes) {
      yield node;
      if (node.children) yield* this.walk(node.children);
    }
  }

  /** Indicates whether `node` has children to show, or can load some. */
  hasChildren(node: TreeNode<T>, shown: Set<TreeNode<T>> | null): boolean {
    if (!node.children) return node.lazy;
    return shown ? node.children.some((child) => shown.has(child)) : node.children.length > 0;
  }

  /** The nodes on screen, in order: the roots, and the children of the expanded nodes. */
  rows(isOpen: (node: TreeNode<T>) => boolean, shown: Set<TreeNode<T>> | null): TreeRow<T>[] {
    const rows: TreeRow<T>[] = [];
    const add = (nodes: readonly TreeNode<T>[]) => {
      const list = shown ? nodes.filter((node) => shown.has(node)) : nodes;
      list.forEach((node, index) => {
        rows.push({ node, size: list.length, position: index + 1 });
        if (node.children && isOpen(node)) add(node.children);
      });
    };
    add(this.roots);
    return rows;
  }

  /** The nodes that pass `test`, with their ancestors. */
  match(test: (node: TreeNode<T>) => boolean): Set<TreeNode<T>> {
    const shown = new Set<TreeNode<T>>();
    for (const node of this.walk()) {
      if (!test(node)) continue;
      for (let n: TreeNode<T> | null = node; n && !shown.has(n); n = n.parent) shown.add(n);
    }
    return shown;
  }

  /** `keys` in tree order. Keys of unknown nodes come last. */
  inOrder(keys: Set<unknown>): unknown[] {
    const known: unknown[] = [];
    for (const node of this.walk()) if (keys.has(node.key)) known.push(node.key);
    const rest = [...keys].filter((key) => !this.byKey.has(key));
    return known.length === keys.size ? known : [...known, ...rest];
  }

  /**
   * Synchronizes the checked keys with the tree and returns the state of each node. With
   * `recursive`, the children of a checked node are checked, and a parent is checked when all its
   * children are, or mixed when some are.
   */
  checkStates(checked: Set<unknown>, recursive: boolean): Map<TreeNode<T>, TreeCheckState> {
    const states = new Map<TreeNode<T>, TreeCheckState>();
    if (!recursive) {
      for (const node of this.walk()) states.set(node, checked.has(node.key) ? 'checked' : 'unchecked');
      return states;
    }
    const visit = (node: TreeNode<T>, inherited: boolean): TreeCheckState => {
      const on = inherited || checked.has(node.key);
      let state: TreeCheckState = on ? 'checked' : 'unchecked';
      if (node.children?.length) {
        const below = node.children.map((child) => visit(child, on));
        if (below.every((s) => s === 'checked')) state = 'checked';
        else if (below.every((s) => s === 'unchecked')) state = 'unchecked';
        else state = 'mixed';
      }
      if (state === 'checked') checked.add(node.key);
      else checked.delete(node.key);
      states.set(node, state);
      return state;
    };
    for (const root of this.roots) visit(root, false);
    return states;
  }

  /** Checks or unchecks a node. With `recursive`, its children change with it and its parents are updated. */
  setChecked(node: TreeNode<T>, on: boolean, checked: Set<unknown>, recursive: boolean): void {
    const nodes = recursive ? [...this.walk([node])] : [node];
    for (const n of nodes) {
      if (on) checked.add(n.key);
      else checked.delete(n.key);
    }
    if (recursive && !on) for (let p = node.parent; p; p = p.parent) checked.delete(p.key);
  }

  private create(item: T, parent: TreeNode<T> | null): TreeNode<T> {
    const fields = this.fields!;
    const own = fields.key(item);
    const node: TreeNode<T> = {
      item,
      key: own === undefined || own === null ? item : own,
      parent,
      level: parent ? parent.level + 1 : 1,
      children: null,
      lazy: this.lazy && fields.hasChildren(item) !== false,
    };
    this.byKey.set(node.key, node);
    return node;
  }

  private readNested(items: readonly T[], parent: TreeNode<T> | null): TreeNode<T>[] {
    return givenList(items).map((item) => {
      const node = this.create(item, parent);
      const own = this.fields!.children(item);
      const children = Array.isArray(own) ? givenList(own as readonly T[]) : this.loaded.get(node.key);
      if (children) node.children = this.readNested(children, node);
      else if (!node.lazy) node.children = [];
      return node;
    });
  }

  private readFlat(given: readonly T[]): TreeNode<T>[] {
    const items = givenList(given);
    const nodes = items.map((item) => this.create(item, null));
    const roots: TreeNode<T>[] = [];
    nodes.forEach((node, index) => {
      const key = this.fields!.parent(items[index]);
      const owner = key === undefined || key === null ? undefined : this.byKey.get(key);
      if (owner && owner !== node) {
        node.parent = owner;
        (owner.children ??= []).push(node);
      } else {
        roots.push(node);
      }
    });
    const place = (list: TreeNode<T>[], level: number) => {
      for (const node of list) {
        node.level = level;
        if (!node.children) {
          const children = this.loaded.get(node.key);
          if (children) node.children = this.readNested(children, node);
          else if (!node.lazy) node.children = [];
        } else {
          place(node.children, level + 1);
        }
      }
    };
    place(roots, 1);
    return roots;
  }
}
