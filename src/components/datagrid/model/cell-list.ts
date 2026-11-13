import { data } from '@motifx-community/data';

const separators = new Map<string, string>();

/** The values of a cell that holds a list (a `multiple` column): its array without empty values; one value is a list of one, none an empty list. */
export function listValues(v: unknown): unknown[] {
  if (Array.isArray(v)) return v.filter((x) => !blank(x));
  return blank(v) ? [] : [v];
}

/** No value: an empty value, or a list with none (an empty array). */
export function emptyCell(v: unknown): boolean {
  return Array.isArray(v) ? v.every(blank) : data.isEmpty(v);
}

/** What separates the items of a list in a locale's text: the one between the items of its lists (`, `, `、`), else `, `. */
export function itemSeparator(locale: string): string {
  let found = separators.get(locale);
  if (found === undefined) {
    const parts = new Intl.ListFormat(locale, { type: 'conjunction' }).formatToParts(['a', 'b', 'c', 'd']);
    const between = parts.find((p) => p.type === 'literal')?.value ?? '';
    // A word ("and") is no separator.
    found = between.trim() && !/\p{L}/u.test(between) ? between : ', ';
    separators.set(locale, found);
  }
  return found;
}

/** The texts of a list's items as one text, in the locale's way; empty texts are left out. */
export function joinItems(texts: readonly string[], locale: string): string {
  return texts.filter((t) => t !== '').join(itemSeparator(locale));
}

/** A text read as the texts of a list's items, split at the locale's separator; empty items are left out. */
export function splitItems(text: string, locale: string): string[] {
  return text
    .split(itemSeparator(locale).trim())
    .map((t) => t.trim())
    .filter((t) => t !== '');
}

function blank(v: unknown): boolean {
  return data.isEmpty(v) || (typeof v === 'string' && v.trim() === '');
}
