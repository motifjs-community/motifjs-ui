import { untracked } from '@motifx/core';

/**
 * A field of an object the developer gave. Their object may be reactive or plain and the kit counts on neither, so
 * the field is read untracked: a change to it reaches the kit through the component's refresh, the same for both. A
 * function there is their own live value (a `Bind`): it is called, and what it reads is followed.
 *
 * Only for fields that are values or `Bind`s; a callback (`click`, `calculate…`) is read with `givenValue`.
 */
export function givenField<V = unknown>(owner: unknown, key: PropertyKey): V {
  const value = givenValue<unknown>(owner, key);
  return (typeof value === 'function' ? (value as () => V)() : value) as V;
}

/** A field of an object the developer gave, as it is (a function stays a function), read untracked. */
export function givenValue<V = unknown>(owner: unknown, key: PropertyKey): V {
  if (owner === null || typeof owner !== 'object') return undefined as V;
  return untracked(() => (owner as Record<PropertyKey, unknown>)[key]) as V;
}

/** A list the developer gave, walked without following it: its items as they are, a change through the refresh. */
export function givenList<T>(list: readonly T[] | null | undefined): T[] {
  return list ? untracked(() => Array.from(list)) : [];
}
