const MOST_OCTETS = 75;

function octets(char: string): number {
  const code = char.codePointAt(0)!;
  return code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
}

/** A content line folded at 75 octets of UTF-8, never inside a character; each next line starts with a space. */
export function foldLine(line: string): string {
  const parts: string[] = [];
  let part = '';
  let size = 0;
  for (const char of line) {
    const length = octets(char);
    if (size + length > MOST_OCTETS) {
      parts.push(part);
      part = ' ';
      size = 1;
    }
    part += char;
    size += length;
  }
  parts.push(part);
  return parts.join('\r\n');
}
