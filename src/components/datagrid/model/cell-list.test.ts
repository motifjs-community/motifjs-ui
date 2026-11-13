import { describe, expect, it } from 'vitest';
import { emptyCell, itemSeparator, joinItems, listValues, splitItems } from './cell-list';

describe('cell lists', () => {
  it('separates items the way the locale writes its lists, a word ("and") never', () => {
    expect(itemSeparator('en-US')).toBe(', ');
    expect(itemSeparator('tr')).toBe(', ');
    expect(itemSeparator('ja')).toBe('、');
    expect(itemSeparator('ar')).toBe(', ');
    expect(joinItems(['a', '', 'b'], 'ja')).toBe('a、b');
  });

  it('splits a text at the separator, empty parts left out', () => {
    expect(splitItems(' red ,green,, blue ', 'en-US')).toEqual(['red', 'green', 'blue']);
    expect(splitItems('赤、青', 'ja')).toEqual(['赤', '青']);
    expect(splitItems('  ', 'en-US')).toEqual([]);
  });

  it('reads a cell as a list without empty values; an empty list is no value', () => {
    expect(listValues(['a', null, ' ', 2])).toEqual(['a', 2]);
    expect(listValues('a')).toEqual(['a']);
    expect(listValues(null)).toEqual([]);
    expect(emptyCell([])).toBe(true);
    expect(emptyCell([null, ''])).toBe(true);
    expect(emptyCell([0])).toBe(false);
    expect(emptyCell('')).toBe(true);
  });
});
