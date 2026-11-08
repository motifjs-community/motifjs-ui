/** `items` in the order the user gave by key; the ones not named keep their order, after the named ones. */
export function ordered<T>(items: T[], order: readonly string[] | undefined, keyOf: (item: T) => string): T[] {
    if (!order?.length) return items;
    const rank = new Map(order.map((key, i) => [key, i]));
    return items
        .map((item, i) => ({ item, i, r: rank.get(keyOf(item)) }))
        .sort((a, b) => (a.r ?? Infinity) - (b.r ?? Infinity) || a.i - b.i)
        .map(x => x.item);
}
