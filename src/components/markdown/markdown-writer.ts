import type { ComponentBase } from '@motifx/core';
import { glyphPart, part, removePart } from '../../core/draw-parts';
import { onLanguage } from '../../core/on-language';
import { flag, put } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { CodeBlock } from './code-block';
import { InlineWriter } from './inline-writer';
import type { MarkdownContext } from './markdown-context';
import type { TextRun } from './text-run';

/** A block that holds blocks: the root, a quote, a list, an item. */
interface Container {
  kind: 'root' | 'quote' | 'list' | 'item';
  host: ComponentBase;
  ordered: boolean;
  /** A list's bullet (`-`, `*`, `+`) or the delimiter after its numbers (`.`, `)`). */
  marker: string;
  /** Where an item's content starts: a line indented this far goes on in it. */
  indent: number;
  /** An item that holds nothing yet: a `[ ]` may still start it. */
  fresh: boolean;
}

/** The block that takes the line's text. */
interface Leaf {
  kind: 'paragraph' | 'heading' | 'code' | 'table';
  depth: number;
  inline: InlineWriter | null;
  code: CodeBlock | null;
  table: Table | null;
}

interface Table {
  host: ComponentBase;
  body: ComponentBase | null;
  row: ComponentBase | null;
  cell: InlineWriter | null;
  aligns: string[];
  column: number;
}

/** Where the characters of a block start not decided yet are on screen: in the open paragraph, or as a text of their own. */
interface Shown {
  inline: InlineWriter | null;
  run: TextRun | null;
  length: number;
}

/** The start of a line whose block the next characters decide (`#`, `-`, `1.`, ```` ``` ````, `|`, `[ ]`). */
interface Tail {
  kind: 'heading' | 'fence' | 'marker' | 'ordered' | 'row' | 'delimiter' | 'task';
  text: string;
  ch: string;
  count: number;
  spaced: boolean;
  digits: string;
  delim: string;
  indent: number;
  shown: Shown;
}

/** A line of `|` cells waiting for the line under it to say whether it heads a table. */
interface Header {
  text: string;
  depth: number;
  shown: Shown;
}

type Phase = 'prefix' | 'tail' | 'item' | 'content' | 'info' | 'code' | 'cell';

/**
 * Writes markdown into `root` as it arrives, one character at a time, and never draws a part again. A line's
 * containers (quotes, list items) are matched first; then its first characters say which block it starts. While they
 * do not say it yet, they are on screen as text; once they do, they leave and the block is made, and the line goes on
 * into it. Inline content goes to an `InlineWriter` per paragraph, heading and cell.
 */
export class MarkdownWriter {
  private readonly containers: Container[];
  private leaf: Leaf | null = null;
  private phase: Phase = 'prefix';
  /** The deepest container the line has matched. */
  private matched = 0;
  private matching = true;
  private indent = 0;
  /** A `>` takes one space after it. */
  private quoteSpace = false;
  private skipSpaces = false;
  private lineUsed = false;
  private tail: Tail | null = null;
  private header: Header | null = null;
  private fence = { ch: '', count: 0, indent: 0 };
  private itemIndent = 0;
  private itemSpaces = 0;

  constructor(private readonly context: MarkdownContext, root: ComponentBase) {
    this.containers = [{ kind: 'root', host: root, ordered: false, marker: '', indent: 0, fresh: false }];
  }

  /** Writes `text`; the text nodes it grew are written once, at the end. */
  write(text: string): void {
    for (const c of text) if (c !== '\r') this.char(c);
    this.context.flush();
  }

  /** The text is complete: the last line ends, and what waits is decided as at any line's end. */
  end(): void {
    // A paragraph's last line has no line break after it; every other block ends its line as at a line's end.
    if (this.lineUsed && this.phase === 'content' && this.leaf?.kind === 'paragraph') this.closeLeaf();
    else if (this.lineUsed) this.lineEnd();
    if (this.header) this.headerFailed();
    this.closeLeaf();
    this.popTo(0);
    this.context.flush();
  }

  private char(c: string): void {
    if (c === '\n') {
      this.lineEnd();
      return;
    }
    this.lineUsed = true;
    switch (this.phase) {
      case 'content':
        if (this.skipSpaces && (c === ' ' || c === '\t')) return;
        this.skipSpaces = false;
        this.leaf!.inline!.char(c);
        return;
      case 'code':
        this.leaf!.code!.write(c);
        return;
      case 'info':
        if (c === this.fence.ch && !this.leaf!.code!.info) this.fence.count++;
        else this.leaf!.code!.infoChar(c);
        return;
      case 'cell':
        this.cellChar(c);
        return;
      case 'tail':
        this.tailChar(c);
        return;
      case 'item':
        this.itemChar(c);
        return;
      default:
        this.prefixChar(c);
    }
  }

  private lineEnd(): void {
    switch (this.phase) {
      case 'content': {
        const leaf = this.leaf!;
        if (leaf.kind === 'heading') {
          leaf.inline!.close();
          leaf.inline!.trimClosingHashes();
          this.leaf = null;
        } else {
          leaf.inline!.lineEnd();
        }
        break;
      }
      case 'code': {
        const code = this.leaf!.code!;
        if (code.closes(this.fence.ch, this.fence.count)) {
          code.dropLine();
          this.closeLeaf();
        } else {
          code.lineEnd();
        }
        break;
      }
      case 'info':
        this.leaf!.code!.infoEnd();
        break;
      case 'cell': {
        const table = this.leaf!.table!;
        table.cell?.close();
        table.cell = null;
        break;
      }
      case 'tail':
        this.tailEnd();
        break;
      case 'item':
        this.containers[this.matched].indent = this.itemIndent + 1;
        break;
      default:
        this.blankLine();
    }
    this.phase = 'prefix';
    this.matched = 0;
    this.matching = true;
    this.indent = 0;
    this.quoteSpace = false;
    this.skipSpaces = false;
    this.lineUsed = false;
  }

  private prefixChar(c: string): void {
    if (c === ' ' || c === '\t') {
      if (this.quoteSpace) {
        this.quoteSpace = false;
        return;
      }
      this.indent += c === '\t' ? 4 - (this.indent % 4) : 1;
      if (this.matching) this.matchItem();
      return;
    }
    this.quoteSpace = false;
    if (this.matching) {
      if (this.containers[this.matched + 1]?.kind === 'quote' && c === '>' && this.indent <= 3) {
        this.matched++;
        this.indent = 0;
        this.quoteSpace = true;
        return;
      }
      this.matching = false;
    }
    this.blockStart(c);
  }

  /** Indentation that reaches an open item's content goes on into it. */
  private matchItem(): void {
    const list = this.containers[this.matched + 1];
    const item = this.containers[this.matched + 2];
    if (list?.kind === 'list' && item && this.indent >= item.indent) {
      this.matched += 2;
      this.indent -= item.indent;
    }
  }

  /** The first character of the line after its containers: it goes on in the open block, or starts one. */
  private blockStart(c: string): void {
    const leaf = this.leaf;
    if (leaf?.code) {
      if (leaf.depth === this.matched && this.matched === this.containers.length - 1) {
        this.phase = 'code';
        leaf.code.write(' '.repeat(Math.max(0, this.indent - this.fence.indent)) + c);
        return;
      }
      this.closeLeaf();
    }
    if (leaf?.table) {
      if (leaf.depth === this.matched && c === '|') {
        this.rowStart(leaf.table);
        return;
      }
      this.closeLeaf();
    }
    if (this.header) {
      if (this.header.depth === this.matched && c === '|') {
        this.startTail('delimiter', c);
        return;
      }
      this.headerFailed();
    }
    if (this.indent < 4) {
      const container = this.containers[this.matched];
      if (container.kind === 'item' && container.fresh && c === '[') {
        this.startTail('task', c);
        return;
      }
      switch (c) {
        case '>':
          this.openQuote();
          return;
        case '#':
          this.startTail('heading', c);
          return;
        case '`':
        case '~':
          this.startTail('fence', c);
          return;
        case '-':
        case '*':
        case '+':
        case '_':
          this.startTail('marker', c);
          return;
        case '|':
          this.startTail('row', c);
          return;
        default:
          if (c >= '0' && c <= '9') {
            this.startTail('ordered', c);
            return;
          }
      }
    }
    this.toParagraph(c);
  }

  private startTail(kind: Tail['kind'], c: string): void {
    const shown = kind === 'delimiter' ? this.header!.shown : this.shownAt();
    this.tail = { kind, text: '', ch: c, count: 1, spaced: false, digits: kind === 'ordered' ? c : '', delim: '', indent: this.indent, shown };
    this.phase = 'tail';
    this.grow(c);
  }

  private tailChar(c: string): void {
    const tail = this.tail!;
    const space = c === ' ' || c === '\t';
    switch (tail.kind) {
      case 'heading':
        if (c === '#' && tail.count < 6) {
          tail.count++;
          this.grow(c);
          return;
        }
        if (space) {
          this.openHeading(tail.count);
          return;
        }
        break;
      case 'fence':
        if (c === tail.ch) {
          tail.count++;
          this.grow(c);
          if (tail.count === 3) this.openCode();
          return;
        }
        break;
      case 'marker':
        if (c === tail.ch) {
          tail.count++;
          this.grow(c);
          return;
        }
        if (space && tail.count === 1 && !tail.spaced && tail.ch !== '_') {
          this.openItem(false, tail.ch, 1, 1);
          return;
        }
        if (space && tail.ch !== '+') {
          tail.spaced = true;
          this.grow(c);
          return;
        }
        break;
      case 'ordered':
        if (c >= '0' && c <= '9' && !tail.delim && tail.digits.length < 9) {
          tail.digits += c;
          this.grow(c);
          return;
        }
        if ((c === '.' || c === ')') && !tail.delim) {
          tail.delim = c;
          this.grow(c);
          return;
        }
        // An item of the open list goes on; a new list breaks into a paragraph only from 1.
        if (space && tail.delim && (Number(tail.digits) === 1 || this.leaf?.kind !== 'paragraph' || this.continuesList(true, tail.delim))) {
          this.openItem(true, tail.delim, Number(tail.digits), tail.digits.length + 1);
          return;
        }
        break;
      case 'row':
        this.grow(c);
        return;
      case 'delimiter':
        if (/^[|:\- \t]$/.test(c)) {
          this.grow(c);
          return;
        }
        this.delimiterFailed(c);
        return;
      case 'task':
        if (tail.text.length === 1 && (c === ' ' || c === 'x' || c === 'X')) {
          this.grow(c);
          return;
        }
        if (tail.text.length === 2 && c === ']') {
          this.grow(c);
          return;
        }
        if (tail.text.length === 3 && space) {
          this.openTask(tail.text[1] !== ' ');
          return;
        }
        break;
    }
    this.takeTail();
    this.toParagraph(tail.text + c);
  }

  /** The line ends while its start is not decided: the line's end decides it. */
  private tailEnd(): void {
    const tail = this.tail!;
    switch (tail.kind) {
      case 'heading':
        this.openHeading(tail.count);
        this.closeLeaf();
        return;
      case 'marker':
        if (tail.count >= 3 && tail.ch !== '+') {
          this.openRule();
          return;
        }
        if (tail.count === 1 && tail.ch !== '_') {
          this.openItem(false, tail.ch, 1, 1);
          this.containers[this.matched].indent = this.itemIndent + 1;
          return;
        }
        break;
      case 'row':
        this.tail = null;
        this.reveal(tail.shown, '\n');
        this.header = { text: tail.text, depth: this.matched, shown: tail.shown };
        return;
      case 'delimiter':
        this.delimiterEnd();
        return;
    }
    this.takeTail();
    this.toParagraph(tail.text);
    this.leaf!.inline!.lineEnd();
  }

  /** The tail is decided: its characters leave the screen, for the block to show them as it shows them. */
  private takeTail(): Tail {
    const tail = this.tail!;
    this.tail = null;
    this.hide(tail.shown);
    return tail;
  }

  private shownAt(): Shown {
    const leaf = this.leaf;
    if (leaf?.kind === 'paragraph') return { inline: leaf.inline, run: null, length: 0 };
    return { inline: null, run: this.context.run(this.containers[this.matched].host), length: 0 };
  }

  private grow(c: string): void {
    const tail = this.tail!;
    tail.text += c;
    this.reveal(tail.shown, c);
  }

  private reveal(shown: Shown, s: string): void {
    shown.length += s.length;
    if (shown.inline) {
      shown.inline.appendRaw(s);
      return;
    }
    shown.run!.value += s;
    this.context.touch(shown.run!);
  }

  private hide(shown: Shown): void {
    if (shown.inline) shown.inline.trimRaw(shown.length);
    else if (shown.run) removePart(shown.run.node);
    shown.length = 0;
  }

  /** The host for a new block: the deepest container the line matched, which then holds something. */
  private place(): ComponentBase {
    const container = this.containers[this.matched];
    container.fresh = false;
    return container.host;
  }

  /** Text: it goes on in the open paragraph (a lazy line too), or starts one. */
  private toParagraph(s: string): void {
    let leaf = this.leaf;
    if (leaf?.kind !== 'paragraph') {
      this.closeLeaf();
      this.popTo(this.matched);
      leaf = this.leaf = { kind: 'paragraph', depth: this.matched, inline: new InlineWriter(this.context, part(this.place(), 'p', 'mx-markdown__paragraph')), code: null, table: null };
    }
    this.phase = 'content';
    this.skipSpaces = false;
    for (const c of s) leaf.inline!.char(c);
  }

  private openHeading(level: number): void {
    this.takeTail();
    this.closeLeaf();
    this.popTo(this.matched);
    const heading = part(this.place(), `h${level}`, `mx-markdown__h${level}`);
    this.leaf = { kind: 'heading', depth: this.matched, inline: new InlineWriter(this.context, heading), code: null, table: null };
    this.phase = 'content';
    this.skipSpaces = true;
  }

  private openCode(): void {
    const tail = this.takeTail();
    this.closeLeaf();
    this.popTo(this.matched);
    this.fence = { ch: tail.ch, count: 3, indent: tail.indent };
    this.leaf = { kind: 'code', depth: this.matched, inline: null, code: new CodeBlock(this.context, this.place()), table: null };
    this.phase = 'info';
  }

  private openRule(): void {
    this.takeTail();
    this.closeLeaf();
    this.popTo(this.matched);
    part(this.place(), 'hr', 'mx-markdown__rule');
  }

  private openQuote(): void {
    this.closeLeaf();
    this.popTo(this.matched);
    const host = part(this.place(), 'blockquote', 'mx-markdown__quote');
    this.containers.push({ kind: 'quote', host, ordered: false, marker: '', indent: 0, fresh: false });
    this.matched = this.containers.length - 1;
    this.indent = 0;
    this.quoteSpace = true;
  }

  /** The list right after the matched container is of this kind: an item goes on in it. */
  private continuesList(ordered: boolean, marker: string): boolean {
    const next = this.containers[this.matched + 1];
    return next?.kind === 'list' && next.ordered === ordered && next.marker === marker;
  }

  /** A list item: in the list of its kind right after the matched container, else in a new list. */
  private openItem(ordered: boolean, marker: string, start: number, width: number): void {
    const tail = this.takeTail();
    const depth = this.matched;
    const next = this.containers[depth + 1];
    this.closeLeaf();
    let list: Container;
    if (this.continuesList(ordered, marker)) {
      this.popTo(depth + 1);
      list = next;
    } else {
      this.popTo(depth);
      const host = part(this.place(), ordered ? 'ol' : 'ul', 'mx-markdown__list');
      if (ordered && start !== 1) put(host, 'start', String(start));
      list = { kind: 'list', host, ordered, marker, indent: 0, fresh: false };
      this.containers.push(list);
    }
    const host = part(list.host, 'li', 'mx-markdown__item');
    this.itemIndent = tail.indent + width;
    this.itemSpaces = 1;
    this.containers.push({ kind: 'item', host, ordered, marker, indent: this.itemIndent + 1, fresh: true });
    this.matched = this.containers.length - 1;
    this.indent = 0;
    this.phase = 'item';
  }

  /** The spaces after an item's marker say where its content starts; the first character starts its first block. */
  private itemChar(c: string): void {
    if (c === ' ' || c === '\t') {
      this.itemSpaces++;
      return;
    }
    this.containers[this.matched].indent = this.itemIndent + (this.itemSpaces > 4 ? 1 : this.itemSpaces);
    this.phase = 'prefix';
    this.matching = false;
    this.indent = 0;
    this.blockStart(c);
  }

  private openTask(done: boolean): void {
    this.takeTail();
    put(this.containers[this.matched].host, 'data-task', done ? 'done' : 'open');
    this.toParagraph('');
    const box = part(this.leaf!.inline!.host, 'span', 'mx-markdown__task');
    put(box, 'role', 'img');
    flag(box, 'data-done', done);
    if (done) glyphPart(box, 'check');
    onLanguage(box, () => put(box, 'aria-label', done ? uiLocale.strings.markdownTaskDone : uiLocale.strings.markdownTaskOpen));
    this.skipSpaces = true;
  }

  /** The line under a `|` line: valid, the two lines leave and the table is made; not, they are a paragraph. */
  private delimiterEnd(): void {
    const tail = this.tail!;
    this.tail = null;
    const header = this.header!;
    this.header = null;
    const heads = this.cells(header.text);
    const marks = this.cells(tail.text);
    this.hide(header.shown);
    if (marks.length !== heads.length || !marks.every((m) => /^:?-+:?$/.test(m))) {
      this.toParagraph(header.text);
      this.leaf!.inline!.lineEnd();
      for (const c of tail.text) this.leaf!.inline!.char(c);
      this.leaf!.inline!.lineEnd();
      return;
    }
    this.closeLeaf();
    this.popTo(this.matched);
    const aligns = marks.map((m) => (m.startsWith(':') && m.endsWith(':') ? 'center' : m.endsWith(':') ? 'end' : m.startsWith(':') ? 'start' : ''));
    const host = part(this.place(), 'table', 'mx-markdown__table');
    const row = part(part(host, 'thead', 'mx-markdown__head'), 'tr', 'mx-markdown__row');
    heads.forEach((text, i) => {
      const cell = part(row, 'th', 'mx-markdown__cell');
      if (aligns[i]) put(cell, 'data-align', aligns[i]);
      const inline = new InlineWriter(this.context, cell);
      for (const c of text) inline.char(c);
      inline.close();
    });
    this.leaf = { kind: 'table', depth: this.matched, inline: null, code: null, table: { host, body: null, row: null, cell: null, aligns, column: 0 } };
  }

  /** A character that no delimiter line has: the `|` line and this one are a paragraph. */
  private delimiterFailed(c: string): void {
    const tail = this.tail!;
    this.tail = null;
    const header = this.header!;
    this.header = null;
    this.hide(header.shown);
    this.toParagraph(header.text);
    this.leaf!.inline!.lineEnd();
    this.toParagraph(tail.text + c);
  }

  /** The line under a `|` line starts no delimiter line: the `|` line is a paragraph line. */
  private headerFailed(): void {
    const header = this.header!;
    this.header = null;
    this.hide(header.shown);
    const matched = this.matched;
    this.matched = header.depth;
    this.toParagraph(header.text);
    this.leaf!.inline!.lineEnd();
    this.matched = matched;
  }

  private rowStart(table: Table): void {
    table.body ??= part(table.host, 'tbody', 'mx-markdown__body');
    table.row = part(table.body, 'tr', 'mx-markdown__row');
    table.cell = null;
    table.column = 0;
    this.phase = 'cell';
  }

  /** A `|` closes the cell (an empty one too); the first other character opens the next. */
  private cellChar(c: string): void {
    const table = this.leaf!.table!;
    if (c === '|' && !table.cell?.isEscaping) {
      if (!table.cell) this.openCell(table);
      table.cell!.close();
      table.cell = null;
      return;
    }
    if (!table.cell) {
      if (c === ' ' || c === '\t') return;
      this.openCell(table);
    }
    table.cell!.char(c);
  }

  private openCell(table: Table): void {
    const cell = part(table.row!, 'td', 'mx-markdown__cell');
    const align = table.aligns[table.column++];
    if (align) put(cell, 'data-align', align);
    table.cell = new InlineWriter(this.context, cell);
  }

  /** The cells of a table line, without its outer `|`s; an escaped `\|` stays in its cell. */
  private cells(line: string): string[] {
    const out: string[] = [];
    let cell = '';
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '\\' && line[i + 1] === '|') {
        cell += '\\|';
        i++;
      } else if (line[i] === '|') {
        out.push(cell.trim());
        cell = '';
      } else {
        cell += line[i];
      }
    }
    out.push(cell.trim());
    if (line.trimStart().startsWith('|')) out.shift();
    if (out.length && line.trimEnd().endsWith('|')) out.pop();
    return out;
  }

  /** A blank line: it closes the paragraph and what it ends; list items go on, code keeps it as an empty line. */
  private blankLine(): void {
    if (this.header) this.headerFailed();
    let depth = this.matched;
    if (this.matching) while (this.containers[depth + 1]?.kind === 'list') depth += 2;
    const leaf = this.leaf;
    if (leaf?.code && leaf.depth === depth && depth === this.containers.length - 1) {
      leaf.code.lineEnd();
      return;
    }
    this.closeLeaf();
    this.popTo(depth);
  }

  private closeLeaf(): void {
    const leaf = this.leaf;
    if (!leaf) return;
    this.leaf = null;
    leaf.inline?.close();
    leaf.code?.close();
    if (leaf.table?.cell) {
      leaf.table.cell.close();
      leaf.table.cell = null;
    }
  }

  private popTo(depth: number): void {
    if (this.leaf && this.leaf.depth > depth) this.closeLeaf();
    while (this.containers.length - 1 > depth) this.containers.pop();
  }
}
