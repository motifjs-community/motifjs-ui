import { givenField, givenList, givenValue } from "../../core/given-field";
import type { ChildrenAt } from "./children-at";

// Paths name an item by the keys along the way, joined with `/`: `file/recent/clear`. A part is the item's key, else
// its position.

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

/** The items along a path, from the top to the last part, read in what the app gave; `null` when a part is missing. */
export function itemsAlong(list: readonly unknown[], parts: string[], childrenAt: ChildrenAt): unknown[] | null {
    const found: unknown[] = [];
    let current = list;
    for (const [depth, key] of parts.entries()) {
        const index = indexOfKey(current, key);
        if (index < 0) return null;
        const item = current[index];
        found.push(item);
        if (depth < parts.length - 1) {
            const field = childrenAt(depth);
            if (!field) return null;
            current = givenList(givenField<readonly unknown[] | undefined>(item, field));
        }
    }
    return found;
}

/** The positions along a path, from the top to the last part; `null` when a part is missing. */
export function positionsOf(list: readonly unknown[], parts: string[], childrenAt: ChildrenAt): number[] | null {
    const found: number[] = [];
    let current = list;
    for (const [depth, key] of parts.entries()) {
        const index = indexOfKey(current, key);
        if (index < 0) return null;
        found.push(index);
        if (depth < parts.length - 1) {
            const field = childrenAt(depth);
            if (!field) return null;
            current = givenList(givenField<readonly unknown[] | undefined>(current[index], field));
        }
    }
    return found;
}

/**
 * A new list with the list under the item at `positions` changed by `change` (the top list when `positions` is
 * empty); the items along the way are new objects, the others the ones given. Nothing given is changed. `null` when a
 * position is missing or `change` refuses.
 */
export function changedList(list: readonly unknown[], positions: number[], childrenAt: ChildrenAt, change: (list: readonly unknown[]) => unknown[] | null, depth = 0): unknown[] | null {
    if (depth === positions.length) return change(list);
    const index = positions[depth];
    const field = childrenAt(depth);
    if (index < 0 || index >= list.length || !field) return null;
    const item = list[index] as Record<string, unknown>;
    const children = changedList(givenList(givenField<readonly unknown[] | undefined>(item, field)), positions, childrenAt, change, depth + 1);
    if (!children) return null;
    const copy = { ...item, [field]: children };
    return list.map((x, i) => (i === index ? copy : x));
}

/** `list` with `item` put at `index` (the end when it is missing or past it). */
export function inserted(list: readonly unknown[], item: unknown, index?: number): unknown[] {
    const at = index === undefined ? list.length : Math.max(0, Math.min(index, list.length));
    return [...list.slice(0, at), item, ...list.slice(at)];
}
