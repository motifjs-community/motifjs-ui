/**
 * Creates the initials of a name: the first letters of its first and last words, capitalized for `locale`
 * ("ada lovelace" → "AL", "ılgın" in Turkish → "I"). Text in brackets and characters that are not letters or
 * digits are omitted. Returns `''` when nothing is left.
 */
export function initialsOf(name: string, locale: string): string {
  const words = name
    .replace(/\([^)]*\)|\[[^\]]*\]|\{[^}]*\}/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return '';
  const first = (word: string) => Array.from(word)[0];
  const letters = words.length === 1 ? first(words[0]) : first(words[0]) + first(words[words.length - 1]);
  return letters.toLocaleUpperCase(locale);
}
