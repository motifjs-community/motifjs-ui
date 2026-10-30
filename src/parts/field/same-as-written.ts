import { untracked } from '@motifx/core';

const KINDS = new Set(['[object Object]', '[object Array]']);

/**
 * Whether a model hands back the value a control just wrote to it: the same value, or an object or array whose
 * fields are the same, as a reactive model gives its own copy of it. Anything else is a new value of the app's.
 */
export function sameAsWritten(value: unknown, written: unknown): boolean {
  if (Object.is(value, written)) return true;
  if (value === null || written === null || typeof value !== 'object' || typeof written !== 'object') return false;
  const kind = Object.prototype.toString.call(written);
  if (!KINDS.has(kind) || Object.prototype.toString.call(value) !== kind) return false;
  return untracked(() => {
    if (Object.getPrototypeOf(value) !== Object.getPrototypeOf(written)) return false;
    const keys = Object.keys(written);
    if (Object.keys(value).length !== keys.length) return false;
    return keys.every((key) => {
      const a = (value as Record<string, unknown>)[key];
      const b = (written as Record<string, unknown>)[key];
      return Object.is(a, b) || (a !== null && b !== null && typeof a === 'object' && typeof b === 'object');
    });
  });
}
