import { givenField, givenList, givenValue } from "../../core/given-field";

// Paths: `tab/group/command`, a row's command a fourth part; each part is a key, else the position. The children of a
// tab are its `groups`, of a group and of a row their `commands`.
const CHILDREN = ['groups', 'commands', 'commands'];

/** The parts of a path. */
export function partsOf(path: string): string[] {
    return path.split('/').filter(part => part !== '');
}

/** The key of an item in its list: its own, else its position. */
export function keyOf(item: unknown, index: number): string {
    return String(givenValue<string | number | undefined>(item, 'key') ?? index);
}

export function indexOfKey(list: readonly unknown[], key: string): number {
    return list.findIndex((item, i) => keyOf(item, i) === key);
}

/** The items along a path, from the tab to the last part, read in what the app gave; `null` when a part is missing. */
export function itemsAlong(tabs: readonly unknown[], parts: string[]): unknown[] | null {
    const found: unknown[] = [];
    let list = tabs;
    for (const [depth, key] of parts.entries()) {
        const index = indexOfKey(list, key);
        if (index < 0) return null;
        const item = list[index];
        found.push(item);
        if (depth < parts.length - 1) list = givenList(givenField<readonly unknown[] | undefined>(item, CHILDREN[depth]));
    }
    return found;
}

/**
 * A new list of tabs with the list under `parent` changed by `change`; the items along the way are new objects, the
 * others the ones given. Nothing given is changed. `null` when a part is missing or `change` refuses.
 */
export function changedTabs(tabs: readonly unknown[], parent: string[], change: (list: readonly unknown[]) => unknown[] | null): unknown[] | null {
    return changeAt(tabs, parent, 0, change);
}

function changeAt(list: readonly unknown[], parent: string[], depth: number, change: (list: readonly unknown[]) => unknown[] | null): unknown[] | null {
    if (depth === parent.length) return change(list);
    const index = indexOfKey(list, parent[depth]);
    if (index < 0 || depth >= CHILDREN.length) return null;
    const item = list[index] as Record<string, unknown>;
    const field = CHILDREN[depth];
    const children = changeAt(givenList(givenField<readonly unknown[] | undefined>(item, field)), parent, depth + 1, change);
    if (!children) return null;
    const copy = { ...item, [field]: children };
    return list.map((x, i) => (i === index ? copy : x));
}

/** `list` with `item` put at `index` (the end when it is missing or past it). */
export function inserted(list: readonly unknown[], item: unknown, index?: number): unknown[] {
    const at = index === undefined ? list.length : Math.max(0, Math.min(index, list.length));
    return [...list.slice(0, at), item, ...list.slice(at)];
}
