/**
 * Keeps `count` of the items of a series while keeping its shape: of each stretch, the item that makes the largest
 * triangle with its neighbors, so peaks stay where a plain "every nth" would lose them. Items stay in order, and the
 * first and last are always kept. Each is read through `x` and `y`.
 */
export function thinOut<T>(items: readonly T[], count: number, x: (item: T) => number, y: (item: T) => number): T[] {
    const size = items.length;
    if (count >= size || count < 3) return [...items];
    const kept: T[] = [items[0]];
    const bucket = (size - 2) / (count - 2);
    let last = 0;
    for (let i = 0; i < count - 2; i++) {
        const nextStart = Math.floor((i + 1) * bucket) + 1;
        const nextEnd = Math.min(size, Math.floor((i + 2) * bucket) + 1);
        let averageX = 0;
        let averageY = 0;
        for (let j = nextStart; j < nextEnd; j++) {
            averageX += x(items[j]);
            averageY += y(items[j]);
        }
        const inNext = Math.max(1, nextEnd - nextStart);
        averageX /= inNext;
        averageY /= inNext;
        const fromX = x(items[last]);
        const fromY = y(items[last]);
        let largest = -1;
        let chosen = nextStart - 1;
        for (let j = Math.floor(i * bucket) + 1; j < nextStart; j++) {
            const area = Math.abs((fromX - averageX) * (y(items[j]) - fromY) - (fromX - x(items[j])) * (averageY - fromY));
            if (area > largest) {
                largest = area;
                chosen = j;
            }
        }
        kept.push(items[chosen]);
        last = chosen;
    }
    kept.push(items[size - 1]);
    return kept;
}
