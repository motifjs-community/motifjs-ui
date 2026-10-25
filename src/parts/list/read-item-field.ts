import { read } from '@motifx/core';
import type { ItemField } from './item-field';

/** Reads `field` of `item`; a primitive item is its own value and text. A `Bind` there is read too. */
export function readItemField<T>(item: T, field: ItemField<T> | undefined, fallback: string): unknown {
  if (typeof field === 'function') return field(item);
  if (item === null || typeof item !== 'object') return item;
  const value = (item as Record<string, unknown>)[field ?? fallback];
  return typeof value === 'function' ? read(value as () => unknown) : value;
}
