const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Rows of cells as an HTML table, for the clipboard: word processors and spreadsheets paste it as a table. */
export function htmlTable(head: readonly string[] | null, rows: readonly (readonly string[])[]): string {
  const line = (cells: readonly string[], tag: 'th' | 'td') => `<tr>${cells.map((c) => `<${tag}>${escape(c)}</${tag}>`).join('')}</tr>`;
  const thead = head ? `<thead>${line(head, 'th')}</thead>` : '';
  return `<table>${thead}<tbody>${rows.map((r) => line(r, 'td')).join('')}</tbody></table>`;
}
