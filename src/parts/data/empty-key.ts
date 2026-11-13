/** A key that stands for no row: `null`, `undefined` or an empty text, as the data layer counts them. */
export function isEmptyKey(key: unknown): key is null | undefined | '' {
  return key === null || key === undefined || key === '';
}
