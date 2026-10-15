// Small building blocks for the reference pages: code blocks, API tables
// whose cells may contain `inline code`, and an on-page table of contents.

let seq = 0;

/** Splits "text with `code` in it" into keyed parts for rendering. */
function parts(text: string): { id: number; text: string; code: boolean }[] {
  return text.split('`').map((t, i) => ({ id: ++seq, text: t, code: i % 2 === 1 }));
}

/** Inline text where `backticked` spans render as code. */
export function Rich(props: { text: string }) {
  return (
    <span>
      {parts(props.text).map((p) => (p.code ? <code key={p.id}>{p.text}</code> : <span key={p.id}>{p.text}</span>))}
    </span>
  );
}

/** A code example. */
export function Code(props: { code: string }) {
  return (
    <pre>
      <code>{props.code.trim()}</code>
    </pre>
  );
}

/** A reference table: the first column is the name (rendered as code), the rest is rich text. */
export function ApiTable(props: { head: string[]; rows: string[][] }) {
  const rows = props.rows.map((cells) => ({ id: ++seq, cells: cells.map((c) => ({ id: ++seq, text: c })) }));
  return (
    <div class="table-scroll">
      <table class="token-table api-table">
        <thead>
          <tr>
            {props.head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {row.cells.map((cell, i) =>
                i === 0 ? (
                  <td key={cell.id}>
                    <code>{cell.text}</code>
                  </td>
                ) : (
                  <td key={cell.id}>
                    <Rich text={cell.text} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The on-page table of contents; `items` are [anchor id, label]. */
export function Toc(props: { items: [string, string][] }) {
  return (
    <nav class="docs-toc" aria-label="On this page">
      <span class="docs-toc__title">On this page</span>
      <ul>
        {props.items.map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`}>{label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
