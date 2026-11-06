import { untracked } from '@motifx/core';
import { givenField } from '../../core/given-field';
import type { ItemField } from './item-field';

/**
 * Reads `field` of `item`, untracked. A primitive item is its own value and text. A `Bind` there is called and
 * tracked. A field specified as a function reads the item itself, so it also runs untracked.
 */
export function readItemField<T>(item: T, field: ItemField<T> | undefined, fallback: string): unknown {
  if (typeof field === 'function') return untracked(() => field(item));
  if (item === null || typeof item !== 'object') return item;
  return givenField(item, field ?? fallback);
}
