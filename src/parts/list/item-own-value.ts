import { untracked } from '@motifx/core';
import { givenValue } from '../../core/given-field';

/** An item's value when no value field is given: its `value` field, else the item itself. Read untracked. */
export function itemOwnValue(item: unknown): unknown {
  if (item === null || typeof item !== 'object') return item;
  return untracked(() => 'value' in item) ? givenValue(item, 'value') : item;
}
