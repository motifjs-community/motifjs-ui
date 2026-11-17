import type { Component, ComponentBase } from '@motifx/core';
import { part, partBefore, removePart, textPart } from '../../core/draw-parts';
import { put } from '../../core/part-writes';
import { decodeEntity } from './entities';
import type { MarkdownContext } from './markdown-context';
import { safeHref } from './safe-href';
import type { TextRun } from './text-run';

/** A text node grows to this many characters; the next characters start a new one, so a write never copies a long text. */
const MAX_RUN = 1024;
/** What a run is resolved with at a line's end, and at the end of its block. */
const LINE = '\n';
const END = '';
const SPACE = /\s/;
const PUNCT = /[\p{P}\p{S}]/u;
const ASCII_PUNCT = /^[!-/:-@[-`{-~]$/;
/** The characters an address written bare starts with (`https://`, `www.`). */
const URL_CHAR = /^[A-Za-z0-9:/.-]$/;
/** What ends an address written bare but is not part of it. */
const TRAILING = /[?!.,:;*_~'"]+$/;

type FrameKind = 'root' | 'strong' | 'em' | 'del' | 'code' | 'autolink' | 'math';

interface Frame {
  kind: FrameKind;
  host: ComponentBase;
  /** The delimiter that opened it (`*`, `_`, `~`, `` ` ``, `$`). */
  mark: string;
  /** How many backticks opened a code span. */
  count: number;
  /** The address of a link written bare, or the TeX of math, as it grows. */
  url: string;
}

/** A `[` that may still open a link: the run it was typed into and where. */
interface Bracket {
  frame: number;
  run: TextRun;
  at: number;
  image: boolean;
  alt: string;
}

/** Characters already on screen at the end of the run, whose meaning the next character decides. */
type Pending =
  | { kind: 'delim'; ch: string; count: number; before: string }
  | { kind: 'ticks'; count: number }
  | { kind: 'escape' }
  | { kind: 'entity'; text: string }
  | { kind: 'close'; bracket: Bracket }
  | { kind: 'dollar' };

/** A link made at `](`: its address and title come next, and are not text. */
interface LinkTail {
  link: Component<HTMLElement>;
  image: boolean;
  alt: string;
  href: string;
  title: string;
  quote: string;
  phase: 'url' | 'space' | 'title' | 'end';
  depth: number;
}

const TAGS: Record<Exclude<FrameKind, 'root'>, [string, string]> = {
  strong: ['strong', 'mx-markdown__strong'],
  em: ['em', 'mx-markdown__em'],
  del: ['del', 'mx-markdown__del'],
  code: ['code', 'mx-markdown__code'],
  autolink: ['a', 'mx-markdown__link'],
  math: ['span', 'mx-markdown__math']
};

/**
 * Writes the inline content of one block (a paragraph, a heading, a table cell) as it arrives. Every character is on
 * screen when it is taken. A character whose meaning is not known yet (`*`, `` ` ``, `[`, `\`, `&`) stays as text at
 * the end of the run; once the next one decides, the marker leaves the run and the element is made, or it simply
 * stays text. An element, once made, is never made again: what follows goes into it until it closes. With a math
 * door, `$` followed by text opens math: its TeX shows as it is written, and the closing `$` has the door draw it in
 * its place; math still open at the line's end stays text. `[^label]` refers to a footnote.
 */
export class InlineWriter {
  private readonly frames: Frame[];
  private run: TextRun | null = null;
  private pending: Pending | null = null;
  private brackets: Bracket[] = [];
  private link: LinkTail | null = null;
  /** The character before the next one: what flanks a delimiter run; `''` at the start. */
  private prev = '';
  /** The word being written, for an address written bare. */
  private word = '';
  /** Characters of the block writer are at the end of the run, to be taken back or made inline. */
  private raw = false;

  constructor(private readonly context: MarkdownContext, host: ComponentBase) {
    this.frames = [{ kind: 'root', host, mark: '', count: 0, url: '' }];
  }

  /** The element the content is written into. */
  get host(): ComponentBase {
    return this.frames[0].host;
  }

  /** A `\` is waiting for the next character. */
  get isEscaping(): boolean {
    return this.pending?.kind === 'escape';
  }

  private get top(): Frame {
    return this.frames[this.frames.length - 1];
  }

  char(c: string): void {
    this.raw = false;
    if (this.link) {
      this.linkChar(c);
      return;
    }
    const p = this.pending;
    if (p) {
      if (this.extend(p, c)) return;
      this.pending = null;
      if (this.resolve(p, c)) return;
    }
    this.take(c);
  }

  /** A line of the block ends: a soft break, or a hard one after two spaces or a `\`. */
  lineEnd(): void {
    if (this.link) this.closeLink();
    const p = this.pending;
    if (p) {
      this.pending = null;
      if (p.kind === 'escape') {
        this.trim(1);
        this.hardBreak();
        return;
      }
      this.resolve(p, LINE);
    }
    if (this.top.kind === 'autolink') this.endAutolink();
    if (this.top.kind === 'math') this.pop();
    if (this.top.kind === 'code') {
      this.append(' ');
      this.prev = ' ';
      return;
    }
    const spaces = this.run ? / {2,}$/.exec(this.run.value) : null;
    if (spaces) {
      this.trim(spaces[0].length);
      this.hardBreak();
      return;
    }
    this.append(LINE);
    this.prev = LINE;
    this.word = '';
  }

  /** The block ends: what is waiting is decided with nothing after it. Elements left open stay as they are. */
  close(): void {
    if (this.link) this.closeLink();
    const p = this.pending;
    if (p) {
      this.pending = null;
      this.resolve(p, END);
    }
    if (this.top.kind === 'autolink') this.endAutolink();
    this.brackets = [];
    // Spaces and the line break at the block's end show nothing; they leave, as CommonMark leaves them out.
    const blank = this.run && this.top.kind !== 'code' ? /[ \t\n]+$/.exec(this.run.value) : null;
    if (blank) this.trim(blank[0].length);
  }

  /** Characters shown at the end as they are, until the block writer knows what they are. */
  appendRaw(s: string): void {
    this.append(s);
    this.raw = true;
  }

  /** Takes back the last `count` characters given with `appendRaw`. */
  trimRaw(count: number): void {
    this.trim(count);
    this.raw = false;
  }

  /** The closing `#`s of a heading (`## Title ##`), known at the line's end. */
  trimClosingHashes(): void {
    if (!this.run || this.top.kind !== 'root') return;
    const m = /(?:^|[ \t]+)#+[ \t]*$/.exec(this.run.value);
    if (m) this.trim(m[0].length);
  }

  private extend(p: Pending, c: string): boolean {
    if (p.kind === 'delim' && c === p.ch) {
      p.count++;
      this.append(c);
      return true;
    }
    if (p.kind === 'ticks' && c === '`') {
      p.count++;
      this.append(c);
      return true;
    }
    if (p.kind === 'entity' && /^[A-Za-z0-9#]$/.test(c) && p.text.length < 32) {
      p.text += c;
      this.append(c);
      return true;
    }
    return false;
  }

  /** Decides what is waiting, with `after` the character that came next; returns whether `after` was used up. */
  private resolve(p: Pending, after: string): boolean {
    switch (p.kind) {
      case 'delim':
        this.closeOrOpen(p.ch, p.count, p.before, after);
        return false;
      case 'ticks':
        this.codeTicks(p.count, after);
        return false;
      case 'escape':
        if (ASCII_PUNCT.test(after)) {
          this.trim(1);
          this.literal(after);
          return true;
        }
        this.prev = '\\';
        return false;
      case 'entity': {
        this.prev = p.text.slice(-1);
        if (after !== ';') return false;
        const ch = decodeEntity(p.text);
        if (ch === null) {
          this.literal(';');
        } else {
          this.trim(p.text.length);
          this.literal(ch);
        }
        return true;
      }
      case 'close':
        if (after === '(') {
          this.openLink(p.bracket);
          return true;
        }
        this.brackets = this.brackets.filter((b) => b !== p.bracket);
        this.footnoteRef(p.bracket);
        return false;
      case 'dollar':
        this.dollar(after);
        return false;
    }
  }

  private take(c: string): void {
    const top = this.top;
    if (top.kind === 'code') {
      this.append(c);
      if (c === '`') this.pending = { kind: 'ticks', count: 1 };
      this.prev = c;
      return;
    }
    if (top.kind === 'math') {
      this.append(c);
      // A `$` after the TeX's last letter may close it; one after a space or a `\` is TeX.
      if (c === '$' && top.url && !SPACE.test(this.prev) && this.prev !== '\\') this.pending = { kind: 'dollar' };
      else top.url += c;
      this.prev = c;
      return;
    }
    if (top.kind === 'autolink') {
      if (!SPACE.test(c) && c !== '<') {
        this.append(c);
        top.url += c;
        this.prev = c;
        return;
      }
      this.endAutolink();
    }
    for (const b of this.brackets) if (b.image) b.alt += c;
    switch (c) {
      case '*':
      case '_':
      case '~':
        this.append(c);
        this.pending = { kind: 'delim', ch: c, count: 1, before: this.prev };
        this.word = '';
        return;
      case '`':
        this.append(c);
        this.pending = { kind: 'ticks', count: 1 };
        this.word = '';
        return;
      case '\\':
        this.append(c);
        this.pending = { kind: 'escape' };
        this.word = '';
        return;
      case '&':
        this.append(c);
        this.pending = { kind: 'entity', text: '&' };
        this.word = '';
        return;
      case '$':
        if (!this.context.settings.mathRenderer) break;
        this.append(c);
        this.pending = { kind: 'dollar' };
        this.word = '';
        return;
      case '[':
        this.openBracket();
        return;
      case ']':
        if (this.closeBracket()) return;
        break;
    }
    this.append(c);
    this.prev = c;
    if (!URL_CHAR.test(c)) {
      this.word = '';
      return;
    }
    this.word += c;
    if (this.brackets.length) return;
    const word = this.word.toLowerCase();
    if (word === 'http://' || word === 'https://' || word === 'www.') this.startAutolink();
  }

  /** Text that means nothing more: an escaped character, a decoded entity, what a delimiter run left over. */
  private literal(s: string): void {
    this.append(s);
    this.prev = s.slice(-1);
    this.word = '';
  }

  /**
   * A run of `*`, `_` or `~` closes the element of its kind it can close, or opens one when text follows it
   * (CommonMark's flanking rules); what it cannot use stays text.
   */
  private closeOrOpen(ch: string, count: number, before: string, after: string): void {
    const space = (s: string) => s === END || SPACE.test(s);
    const punct = (s: string) => s !== END && !SPACE.test(s) && PUNCT.test(s);
    const left = !space(after) && (!punct(after) || space(before) || punct(before));
    const right = !space(before) && (!punct(before) || space(after) || punct(after));
    let canOpen = left;
    let canClose = right;
    if (ch === '_') {
      canOpen = left && (!right || punct(before));
      canClose = right && (!left || punct(after));
    }
    this.prev = ch;
    if (ch === '~' && count !== 2) return;
    let rest = count;
    let closed = 0;
    if (canClose) {
      while (rest > 0 && this.top.mark === ch && this.top.kind !== 'code') {
        const need = this.top.kind === 'em' ? 1 : 2;
        if (rest < need) break;
        // The run was typed inside the element it closes: it leaves it.
        if (!closed) this.trim(count);
        this.pop();
        rest -= need;
        closed += need;
      }
    }
    if (rest > 0 && canOpen && rest <= 3) {
      if (!closed) this.trim(count);
      if (ch === '~') {
        this.push('del', ch);
      } else if (rest === 3) {
        this.push('em', ch);
        this.push('strong', ch);
      } else {
        this.push(rest === 2 ? 'strong' : 'em', ch);
      }
      return;
    }
    // What a closing run did not use is text after the element it closed.
    if (closed && rest > 0) this.append(ch.repeat(rest));
  }

  /**
   * A `$` opens math when text follows it; the math keeps the `$` on screen until it is drawn. In math, a `$` closes it
   * unless a digit follows (`$5`), and the door draws the TeX in its place; with nothing drawn the text stays as written.
   */
  private dollar(after: string): void {
    const top = this.top;
    this.prev = '$';
    if (top.kind === 'math') {
      if (after >= '0' && after <= '9') {
        top.url += '$';
        return;
      }
      this.pop();
      const drawn = this.context.math(top.url, false);
      if (!drawn) return;
      for (const node of [...top.host.controls.items]) removePart(node);
      top.host.controls.add(drawn);
      put(top.host, 'data-drawn', '');
      return;
    }
    if (after === END || SPACE.test(after) || after === '$') return;
    this.trim(1);
    this.push('math', '$');
    this.append('$');
  }

  /**
   * `[^label]` with no `(` after it refers to a footnote: it leaves the text and the footnote's number takes its place,
   * raised, a link to the note.
   */
  private footnoteRef(bracket: Bracket): void {
    const run = bracket.run;
    if (bracket.image || run !== this.run) return;
    const label = run.value.slice(bracket.at + 1, -1);
    if (!/^\^[^\s\]]+$/.test(label)) return;
    const host = this.frames[bracket.frame].host;
    const items = host.controls.items;
    if (items[items.length - 1] !== run.node) return;
    this.trim(run.value.length - bracket.at);
    const note = this.context.footnote(label.slice(1));
    const link = part<HTMLAnchorElement>(part(host, 'sup', 'mx-markdown__footnote-ref'), 'a', 'mx-markdown__footnote-link');
    textPart(link, String(note.number));
    this.context.footnoteLink(link, note, false);
    this.run = null;
  }

  /** Backticks open a code span when something follows them, and close the one they match in length. */
  private codeTicks(count: number, after: string): void {
    this.prev = '`';
    if (this.top.kind === 'code') {
      if (count === this.top.count) {
        this.trim(count);
        this.pop();
      }
      return;
    }
    if (after === END) return;
    this.trim(count);
    this.push('code', '`', count);
  }

  private openBracket(): void {
    this.append('[');
    const run = this.run!;
    const image = this.prev === '!' && run.value.length >= 2 && run.value[run.value.length - 2] === '!';
    this.brackets.push({ frame: this.frames.length - 1, run, at: run.value.length - (image ? 2 : 1), image, alt: '' });
    this.prev = '[';
    this.word = '';
  }

  /** A `]` in the element its `[` was typed in waits for a `(`. */
  private closeBracket(): boolean {
    const bracket = this.brackets[this.brackets.length - 1];
    if (!bracket || bracket.frame !== this.frames.length - 1) return false;
    this.append(']');
    this.pending = { kind: 'close', bracket };
    this.prev = ']';
    this.word = '';
    return true;
  }

  /**
   * `](` makes the link: what was written since the `[` goes into it as it is (the parts move, nothing is made again),
   * the `[` and the `]` leave. Its address and title come next and are not shown. An image is a link while images
   * are off.
   */
  private openLink(bracket: Bracket): void {
    const host = this.frames[bracket.frame].host;
    const items = host.controls.items;
    const moved = items.slice(items.indexOf(bracket.run.node) + 1);
    const image = bracket.image && this.context.settings.images;
    const link = partBefore<HTMLElement>(host, moved[0] ?? null, image ? 'span' : 'a', image ? 'mx-markdown__image' : 'mx-markdown__link');
    const value = bracket.run.value;
    let after = value.slice(bracket.at + (bracket.image ? 2 : 1));
    bracket.run.value = value.slice(0, bracket.at);
    this.context.touch(bracket.run);
    if (!moved.length) after = after.slice(0, -1);
    if (after) textPart(link, after);
    for (const node of moved) link.controls.add(node);
    if (moved.length) this.trim(1);
    this.run = null;
    this.brackets = [];
    this.word = '';
    this.link = { link, image, alt: bracket.alt.slice(0, -1).replace(/[*_~`\\]/g, ''), href: '', title: '', quote: '', phase: 'url', depth: 0 };
  }

  private linkChar(c: string): void {
    const tail = this.link!;
    switch (tail.phase) {
      case 'url':
        if (c === ')' && !tail.depth) {
          this.closeLink();
          return;
        }
        if (SPACE.test(c)) {
          if (tail.href) tail.phase = 'space';
          return;
        }
        if (c === '(') tail.depth++;
        if (c === ')') tail.depth--;
        tail.href += c;
        return;
      case 'space':
        if (c === '"' || c === "'") {
          tail.quote = c;
          tail.phase = 'title';
          return;
        }
        if (c === ')') {
          this.closeLink();
          return;
        }
        if (SPACE.test(c)) return;
        break;
      case 'title':
        if (c === tail.quote) {
          tail.phase = 'end';
          return;
        }
        tail.title += c;
        return;
      case 'end':
        if (c === ')') {
          this.closeLink();
          return;
        }
        if (SPACE.test(c)) return;
        break;
    }
    this.closeLink();
    this.char(c);
  }

  /** The address is complete: the link takes it, or an allowed image replaces its alternative text. */
  private closeLink(): void {
    const tail = this.link;
    if (!tail) return;
    this.link = null;
    this.prev = ')';
    this.word = '';
    const settings = this.context.settings;
    if (!tail.image) {
      settings.linkMade(tail.link as Component<HTMLAnchorElement>, safeHref(tail.href), tail.title);
      return;
    }
    const src = safeHref(tail.href);
    if (!src || !settings.imageAllowed(src)) return;
    for (const node of [...tail.link.controls.items]) removePart(node);
    const img = part<HTMLImageElement>(tail.link, 'img', 'mx-markdown__img');
    put(img, 'src', src);
    put(img, 'alt', tail.alt);
    if (tail.title) put(img, 'title', tail.title);
  }

  /** `https://`, `http://` or `www.` was typed at a word's start: the word becomes a link that grows with it. */
  private startAutolink(): void {
    const word = this.word;
    this.trim(word.length);
    this.push('autolink', '');
    this.append(word);
    this.top.url = word;
  }

  /** The address ends at a space: punctuation at its end is the sentence's, and leaves the link. */
  private endAutolink(): void {
    const frame = this.top;
    let url = frame.url;
    let trailing = TRAILING.exec(url)?.[0] ?? '';
    url = url.slice(0, url.length - trailing.length);
    while (url.endsWith(')') && url.split('(').length < url.split(')').length) {
      url = url.slice(0, -1);
      trailing = `)${trailing}`;
    }
    if (trailing) this.trim(trailing.length);
    this.pop();
    const href = url.toLowerCase().startsWith('www.') ? `http://${url}` : url;
    this.context.settings.linkMade(frame.host as Component<HTMLAnchorElement>, safeHref(href), '');
    if (trailing) this.append(trailing);
  }

  private push(kind: Exclude<FrameKind, 'root'>, mark: string, count = 0): void {
    const [tag, className] = TAGS[kind];
    this.frames.push({ kind, host: part(this.top.host, tag, className), mark, count, url: '' });
    this.run = null;
    this.word = '';
  }

  private pop(): void {
    if (this.frames.length > 1) this.frames.pop();
    this.run = null;
    this.word = '';
  }

  private hardBreak(): void {
    part(this.top.host, 'br', 'mx-markdown__break');
    this.run = null;
    this.prev = LINE;
    this.word = '';
  }

  private append(s: string): void {
    let run = this.run;
    if (!run || (run.value.length >= MAX_RUN && !this.pending && !this.brackets.length && !this.word && !this.raw)) {
      run = this.run = this.context.run(this.top.host);
    }
    run.value += s;
    this.context.touch(run);
  }

  private trim(count: number): void {
    const run = this.run;
    if (!run || !count) return;
    run.value = run.value.slice(0, Math.max(0, run.value.length - count));
    this.context.touch(run);
  }
}
