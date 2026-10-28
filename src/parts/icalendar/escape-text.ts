/** A text as a value writes it: backslash, semicolon and comma escaped, new lines as `\n`. */
export function escapeText(text: string): string {
  return text.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\r\n|\r|\n/g, '\\n');
}
