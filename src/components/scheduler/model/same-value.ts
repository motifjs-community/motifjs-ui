/** Two resource values are the same: equal, or the same text (a key read as a number from one place, as a text from another). */
export function sameValue(a: unknown, b: unknown): boolean {
  return a === b || (a !== null && a !== undefined && b !== null && b !== undefined && String(a) === String(b));
}
