/** A text value as it reads: `\n` (or `\N`) a new line, `\,` `\;` `\\` the sign itself. */
export function unescapeText(value: string): string {
  return value.replace(/\\(.)/g, (_, char: string) => (char === 'n' || char === 'N' ? '\n' : char));
}
