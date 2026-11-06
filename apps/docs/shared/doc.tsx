// Building blocks for the reference pages: a section card, a live example with its code, code
// blocks and API tables whose cells may contain `inline code`.
import { Component, reactive, RouterView, type ComponentBase } from '@motifx/core';
import { Button } from '@motifx-community/ui';
import { PageOutline } from '../app/PageOutline';
import { tx } from '../app/texts';
import { Code } from './Code';
import type { ExampleFile } from './example-file';
import { ExampleCode } from './ExampleCode';

let seq = 0;

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const CODE_LINK = /\[`([^`]+)`\]\(([^)\s]+)\)/g;

interface Part {
  id: number;
  text: string;
  code: boolean;
  href: string;
}

/** Splits "text with `code`, [a link](/page#anchor) and [`a linked name`](/page)" into keyed parts for rendering. */
function parts(text: string): Part[] {
  // With its two groups, split() gives: text, name, address, text …
  const pieces = text.split(CODE_LINK);
  const out: Part[] = [];
  for (let at = 0; at < pieces.length; at += 3) {
    out.push(...plainParts(pieces[at]));
    if (at + 2 < pieces.length) out.push({ id: ++seq, text: pieces[at + 1], code: true, href: pieces[at + 2] });
  }
  return out;
}

function plainParts(text: string): Part[] {
  return text.split('`').flatMap((t, i) => {
    if (i % 2 === 1) return [{ id: ++seq, text: t, code: true, href: '' }];
    // With its two groups, split() gives: text, link text, address, text …
    const pieces = t.split(LINK);
    const out = [];
    for (let at = 0; at < pieces.length; at += 3) {
      out.push({ id: ++seq, text: pieces[at], code: false, href: '' });
      if (at + 2 < pieces.length) out.push({ id: ++seq, text: pieces[at + 1], code: false, href: pieces[at + 2] });
    }
    return out;
  });
}

/** Inline text in the reader's language, where `backticked` spans render as code and [text](/page#anchor) as a link. */
export function Rich(props: { text: string }) {
  return (
    <span>
      {parts(tx(props.text)).map((p) =>
        p.code && p.href ? (
          <a key={p.id} rel="router" href={p.href}>
            <code>{p.text}</code>
          </a>
        ) : p.code ? (
          <code key={p.id}>{p.text}</code>
        ) : p.href.startsWith('http') ? (
          <a key={p.id} href={p.href}>
            {p.text}
          </a>
        ) : p.href ? (
          <a key={p.id} rel="router" href={p.href}>
            {p.text}
          </a>
        ) : (
          <span key={p.id}>{p.text}</span>
        ),
      )}
    </span>
  );
}

export { Code };

/** One part of a page, on a card. It joins the page outline the sections on the right list. */
export class Section extends Component<HTMLElement, { anchor: string; title: string }> {
  static override elementTag = 'section';

  override onConfigured(): void {
    this.class.add('docs-section');
    this.attr.add({ 'aria-labelledby': this.props.anchor });
  }

  override onBuilt(): void {
    const { anchor, title } = this.props;
    const outline = this.getService(PageOutline);
    if (outline) this.motif.setDisposable(outline.add({ anchor, title }, this.page()));
  }

  /** The page this section is on: the child of the router view it sits under. */
  private page(): object {
    let node: ComponentBase = this;
    while (node.parent && !(node.parent instanceof RouterView)) node = node.parent;
    return node;
  }

  override view() {
    return (
      <>
        <h2 id={this.props.anchor}>{() => tx(this.props.title)}</h2>
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

/**
 * A live example: a bar with its title and "Show code", the example itself, and its code when asked
 * for: `files` are the example's own source files (a tab each), `code` a short snippet.
 */
export class Example extends Component<HTMLDivElement, { title?: string; files?: ExampleFile[]; code?: string; stack?: boolean }> {
  static override elementTag = 'div';

  private readonly state = reactive({ code: false });

  override onConfigured(): void {
    this.class.add('docs-example');
  }

  override view() {
    const { title, files, stack } = this.props;
    const code = files?.length || this.props.code;
    return (
      <>
        <div class="docs-example__bar">
          <h3 class="docs-example__title" x-wait={() => !title}>
            {() => tx(title ?? '')}
          </h3>
          <div x-wait={() => !code}>
            <Button
              text={() => tx(this.state.code ? 'Hide code' : 'Show code')}
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
          {files?.length ? <ExampleCode files={files} /> : <Code code={this.props.code ?? ''} />}
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
              <th key={h}>{() => tx(h)}</th>
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
