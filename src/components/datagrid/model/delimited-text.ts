/** Rows of cells as delimited text (tab-separated for the clipboard, CSV): a cell with the separator, a quote or a line break is quoted, its quotes doubled. */
export function writeDelimited(rows: readonly (readonly string[])[], separator: string): string {
  const special = new RegExp(`[${separator === '\t' ? '\t' : separator.replace(/[\\]^-]/g, '\$&')}"\r\n]`);
  return rows.map((cells) => cells.map((cell) => (special.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(separator)).join('\r\n');
}

/** Delimited text back into rows of cells. A cell that starts with a quote runs to its closing quote, line breaks included; the last line break is not a row. */
export function readDelimited(text: string, separator: string): string[][] {
  const rows: string[][] = [];
  let cells: string[] = [];
  let at = 0;
  const end = text.length;
  while (at <= end) {
    let cell = '';
    if (text[at] === '"') {
      at++;
      while (at < end) {
        if (text[at] === '"') {
          if (text[at + 1] === '"') {
            cell += '"';
            at += 2;
            continue;
          }
          at++;
          break;
        }
        cell += text[at++];
      }
      // Text after the closing quote belongs to the cell, as spreadsheets read it.
      while (at < end && text[at] !== separator && text[at] !== '\n' && text[at] !== '\r') cell += text[at++];
    } else {
      while (at < end && text[at] !== separator && text[at] !== '\n' && text[at] !== '\r') cell += text[at++];
    }
    cells.push(cell);
    if (text[at] === separator) {
      at++;
      continue;
    }
    rows.push(cells);
    cells = [];
    if (text[at] === '\r') at++;
    if (text[at] === '\n') at++;
    if (at >= end) break;
  }
  return rows;
}
