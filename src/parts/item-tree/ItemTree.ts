import type { ChildrenAt } from "./children-at";
import { changedList, indexOfKey, inserted, itemsAlong, partsOf, positionsOf } from "./item-paths";

/**
 * Changes by path to a tree of items given by the app: `file/recent/clear`, each part a key or a position. What was
 * given is never changed: each change makes a new list, the items along the changed path new objects and the others
 * the ones given, and hands it to `apply`. Between `beginUpdate()` and `endUpdate()` the changes are held and applied
 * at once.
 */
export class ItemTree<T> {
    childrenAt: ChildrenAt;
    read: () => readonly T[];
    apply: (next: T[]) => void;
    batch = 0;
    pending: T[] | null = null;

    constructor(childrenAt: ChildrenAt, read: () => readonly T[], apply: (next: T[]) => void) {
        this.childrenAt = childrenAt;
        this.read = read;
        this.apply = apply;
    }

    /** The items as they are now, the held changes included. */
    get current(): readonly T[] {
        return this.pending ?? this.read();
    }

    /** The item at `path`, as it is now; `null` when there is none. */
    find(path: string): unknown {
        const parts = partsOf(path);
        if (!parts.length) return null;
        return itemsAlong(this.current, parts, this.childrenAt)?.[parts.length - 1] ?? null;
    }

    /** Adds an item to the list under `parentPath` (the top list when empty) at `index`, the end by default. */
    add(parentPath: string, item: unknown, index?: number): boolean {
        return this.change(partsOf(parentPath), list => inserted(list, item, index));
    }

    remove(path: string): boolean {
        const parts = partsOf(path);
        if (!parts.length) return false;
        const key = parts[parts.length - 1];
        return this.change(parts.slice(0, -1), list => {
            const at = indexOfKey(list, key);
            return at < 0 ? null : list.filter((_, i) => i !== at);
        });
    }

    /** Changes fields of the item at `path`; the others stay as they are. */
    update(path: string, changes: object): boolean {
        const parts = partsOf(path);
        if (!parts.length) return false;
        const key = parts[parts.length - 1];
        return this.change(parts.slice(0, -1), list => {
            const at = indexOfKey(list, key);
            return at < 0 ? null : list.map((x, i) => (i === at ? { ...(x as object), ...changes } : x));
        });
    }

    /**
     * Moves the item at `path` to `index` in its list, or in the list under `toParent` (the top list when empty). The
     * index counts the list without the item. An item cannot move into itself.
     */
    move(path: string, index: number, toParent?: string): boolean {
        const list = this.current;
        const parts = partsOf(path);
        const from = parts.length ? positionsOf(list, parts, this.childrenAt) : null;
        if (!from) return false;
        const to = toParent === undefined ? from.slice(0, -1) : positionsOf(list, partsOf(toParent), this.childrenAt);
        if (!to || (to.length >= from.length && from.every((n, i) => to[i] === n))) return false;
        const parent = from.slice(0, -1);
        const at = from[from.length - 1];
        const item = itemsAlong(list, parts, this.childrenAt)![parts.length - 1];
        // Taking the item out shifts its later neighbors, and the target may sit under one of them.
        const depth = parent.length;
        if (to.length > depth && parent.every((n, i) => to[i] === n) && to[depth] > at) to[depth]--;
        const taken = changedList(list, parent, this.childrenAt, items => items.filter((_, i) => i !== at));
        const next = taken && changedList(taken, to, this.childrenAt, items => inserted(items, item, index));
        return next ? this.commit(next as T[]) : false;
    }

    beginUpdate(): void {
        this.batch++;
    }

    endUpdate(): void {
        if (this.batch > 0) this.batch--;
        if (this.batch === 0 && this.pending) {
            const next = this.pending;
            this.pending = null;
            this.apply(next);
        }
    }

    /** Changes the list under `parent` (the parts of a path) with `change`; `false` when nothing changed. */
    change(parent: string[], change: (list: readonly unknown[]) => unknown[] | null): boolean {
        const list = this.current;
        const positions = positionsOf(list, parent, this.childrenAt);
        const next = positions && changedList(list, positions, this.childrenAt, change);
        return next ? this.commit(next as T[]) : false;
    }

    commit(next: T[]): boolean {
        if (this.batch > 0) {
            this.pending = next;
        } else {
            this.pending = null;
            this.apply(next);
        }
        return true;
    }
}
