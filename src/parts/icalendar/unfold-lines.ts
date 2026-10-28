/** The content lines of a file: a leading BOM dropped, any line end (CRLF, LF, CR) taken, folded lines joined, empty ones left out. */
export function unfoldLines(text: string): string[] {
  return text
    .replace(/^﻿/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n[ \t]/g, '')
    .split('\n')
    .filter((line) => line.trim() !== '');
}
