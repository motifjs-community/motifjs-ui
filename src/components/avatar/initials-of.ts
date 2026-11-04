/**
 * The initials of a name: the first letters of its first and last words, in capitals of `locale`
 * ("ada lovelace" → "AL", "ılgın" in Turkish → "I"). What is in brackets and what is not a letter or a
 * digit are left out; `''` when nothing is left.
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
