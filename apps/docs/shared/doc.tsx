// Building blocks for the reference pages: a section card, a live example with its code, code
// blocks and API tables whose cells may contain `inline code`.
import { Component, reactive } from '@motifx/core';
import { Button } from '@motifx-community/ui';
import { PageOutline } from '../app/PageOutline';

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

/** A code example. It may scroll sideways, so it takes focus: the keys scroll it. */
export function Code(props: { code: string }) {
  return (
    <pre tabindex="0">
      <code>{props.code.trim()}</code>
    </pre>
  );
}

/** One part of a page, on a card. It joins the page outline the sections on the right list. */
export class Section extends Component<HTMLElement, { anchor: string; title: string }> {
  static override elementTag = 'section';

  override onConfigured(): void {
    const { anchor, title } = this.props;
    this.class.add('docs-section');
    this.attr.add({ 'aria-labelledby': anchor });
    const outline = this.getService(PageOutline);
    if (outline) this.motif.setDisposable(outline.add({ anchor, title }));
  }

  override view() {
    return (
      <>
        <h2 id={this.props.anchor}>{this.props.title}</h2>
        {this.childs}
      </>
    );
  }
}

const CodeIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

/** A live example: a bar with its title and "Show code", the example itself, and its code when asked for. */
export class Example extends Component<HTMLDivElement, { title?: string; code?: string; stack?: boolean }> {
  static override elementTag = 'div';

  private readonly state = reactive({ code: false });

  override onConfigured(): void {
    this.class.add('docs-example');
  }

  override view() {
    const { title, code, stack } = this.props;
    return (
      <>
        <div class="docs-example__bar">
          <h3 class="docs-example__title" x-wait={() => !title}>
            {title ?? ''}
          </h3>
          <div x-wait={() => !code}>
            <Button
              text={() => (this.state.code ? 'Hide code' : 'Show code')}
              icon={() => <CodeIcon />}
              size="sm"
              variant="ghost"
              toggle
              x-model={() => this.state.code}
            />
          </div>
        </div>
        <div class={stack ? 'docs-example__stage docs-example__stage--stack' : 'docs-example__stage'}>{this.childs}</div>
        <div class="docs-example__code" x-wait={() => !this.state.code}>
          <Code code={code ?? ''} />
        </div>
      </>
    );
  }
}

/** A reference table: the first column is the name (rendered as code), the rest is rich text. */
export function ApiTable(props: { head: string[]; rows: string[][] }) {
  const rows = props.rows.map((cells) => ({ id: ++seq, cells: cells.map((c) => ({ id: ++seq, text: c })) }));
  return (
    <div class="table-scroll" tabindex="0">
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
