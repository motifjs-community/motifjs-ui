import { Emitter, errorHandler, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { clearParts } from '../../core/draw-parts';
import { functionValue } from '../../core/function-value';
import { afterDrawn } from '../../core/measure';
import { put } from '../../core/part-writes';
import type { CodeHighlighter } from './code-highlighter';
import type { DiagramRenderer } from './diagram-renderer';
import { MarkdownContext, type MarkdownSettings } from './markdown-context';
import type { MarkdownLinkClickEventArgs } from './markdown-link-click-event-args';
import type { MarkdownProps } from './markdown-props';
import { MarkdownWriter } from './markdown-writer';
import type { MathRenderer } from './math-renderer';

const OWN = ['streaming', 'highlighter', 'mathRenderer', 'diagramRenderer', 'images', 'linkTarget', 'copyButton', 'codeLines'] as const;

/** A text given at once longer than this many characters is drawn a piece a frame: the page never stops for it. */
const AT_ONCE = 50_000;
/** How long a piece is written for, in milliseconds; the frame then lays it out. */
const PIECE_TIME = 8;
/** How much is written between two looks at the clock. */
const STEP = 2_000;

/**
 * Draws markdown, all of it at once or as it arrives. Every character is on screen the moment it is written: a mark
 * whose meaning is not known yet (`**`, `#`, `|`) shows as text at the end until it is, then its element is made and
 * the text goes on into it. Nothing drawn is ever drawn again, neither while the text grows nor when it ends; what a
 * door draws (math, a diagram) takes the place of its text once the text is complete. Footnotes (`[^1]`) are numbered
 * links to their notes, and back. A very long text given at once is drawn a piece a frame, from its start, so the page
 * never stops for it; a long code block can show its first lines alone (`codeLines`).
 *
 * @example
 * <Markdown text={() => this.answer.text} streaming={() => this.answer.busy} />
 *
 * const view = new Markdown();
 * for await (const delta of stream) view.append(delta);
 * view.end();
 */
export class Markdown extends Control<HTMLDivElement, MarkdownProps> implements MarkdownSettings {
  private readonly drawing: MarkdownContext;
  private writer: MarkdownWriter;
  /** The text drawn so far. */
  private written = '';
  /** The text given and not drawn yet: it is drawn a piece a frame. */
  private waiting = '';
  /** Takes back the next piece. */
  private stopPiece: (() => void) | null = null;
  private ended = false;
  /** `append` is handing its text to the property: it is drawn already. */
  private appending = false;
  private readonly linkClicked = new Emitter<MarkdownLinkClickEventArgs>();

  constructor(props?: IBaseProp<MarkdownProps>) {
    super('div', props);
    const own = (this.props ?? {}) as MarkdownProps;
    this.class.add('mx-markdown');
    this.drawing = new MarkdownContext(this);
    this.writer = new MarkdownWriter(this.drawing, this);
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.allowImage !== undefined) this.bindProperty('allowImage', functionValue(own.allowImage));
    if (own.onLinkClick) this.onLinkClick(own.onLinkClick);
    this.observeProperty<string>('text', (text) => this.drawText(text ?? ''));
    // Streaming that stops ends the text; a component that never had text waits for `append`.
    this.observeProperty<boolean>('streaming', (on) => {
      if (!on && this.written) this.end();
    });
    this.motif.setDisposable(() => this.linkClicked.dispose());
  }

  // Properties (see MarkdownProps).

  get streaming(): boolean {
    return this.getProperty<boolean | undefined>('streaming') === true;
  }
  set streaming(value: Bind<boolean>) {
    this.assignProperty('streaming', value, Boolean);
  }
  get highlighter(): CodeHighlighter | null {
    return this.getProperty<CodeHighlighter | null | undefined>('highlighter') ?? null;
  }
  set highlighter(value: Bind<CodeHighlighter | null>) {
    this.assignProperty('highlighter', value);
  }
  get mathRenderer(): MathRenderer | null {
    return this.getProperty<MathRenderer | null | undefined>('mathRenderer') ?? null;
  }
  set mathRenderer(value: Bind<MathRenderer | null>) {
    this.assignProperty('mathRenderer', value);
  }
  get diagramRenderer(): DiagramRenderer | null {
    return this.getProperty<DiagramRenderer | null | undefined>('diagramRenderer') ?? null;
  }
  set diagramRenderer(value: Bind<DiagramRenderer | null>) {
    this.assignProperty('diagramRenderer', value);
  }
  get images(): boolean {
    return this.getProperty<boolean | undefined>('images') === true;
  }
  set images(value: Bind<boolean>) {
    this.assignProperty('images', value, Boolean);
  }
  get allowImage(): ((src: string) => boolean) | null {
    return this.getProperty<((src: string) => boolean) | null | undefined>('allowImage') ?? null;
  }
  set allowImage(value: Bind<((src: string) => boolean) | null>) {
    this.assignProperty('allowImage', functionValue(value));
  }
  get linkTarget(): string {
    return this.getProperty<string | undefined>('linkTarget') ?? '_blank';
  }
  set linkTarget(value: Bind<string>) {
    this.assignProperty('linkTarget', value);
  }
  get copyButton(): boolean {
    return this.getProperty<boolean | undefined>('copyButton') !== false;
  }
  set copyButton(value: Bind<boolean>) {
    this.assignProperty('copyButton', value, Boolean);
  }
  get codeLines(): number {
    return Math.max(0, Math.floor(this.getProperty<number | undefined>('codeLines') ?? 0));
  }
  set codeLines(value: Bind<number>) {
    this.assignProperty('codeLines', value);
  }

  /** `true` once the text is complete: `end()` was called, or a text was given while not streaming. */
  get isEnded(): boolean {
    return this.ended;
  }

  /** `true` while a long text given at once is still being drawn, a piece a frame. */
  get isDrawing(): boolean {
    return this.waiting.length > 0;
  }

  /** Occurs when a link is clicked. Set `e.cancel` to handle it yourself. */
  get onLinkClick(): MotifEvent<MarkdownLinkClickEventArgs> {
    return this.linkClicked.event;
  }

  /** The component the writer draws for: this one. */
  get owner(): this {
    return this;
  }

  /** Adds `delta` to the text: what it completes takes its form, the rest is on screen as text at once. */
  append(delta: string): void {
    if (!delta) return;
    if (this.ended) {
      errorHandler.reportSuppressed('Markdown', new Error('Markdown: append() after the text ended; call clear() to start again.'));
      return;
    }
    this.write(delta);
    this.appending = true;
    this.changeProperty('text', this.written + this.waiting);
    this.appending = false;
  }

  /**
   * The text is complete. What waits at the end is decided as at the end of a line, once every piece is drawn; nothing
   * drawn is drawn again.
   */
  end(): void {
    if (this.ended) return;
    this.ended = true;
    if (!this.waiting) this.writer.end();
  }

  /**
   * The block drawn for the character at `index` of the text (a paragraph, heading, code block, rule or table row): the
   * last one that starts at or before it. `null` before the first, or while the text has not reached it.
   */
  blockAt(index: number): ComponentBase | null {
    return index < this.written.length ? this.writer.blockAt(index) : null;
  }

  /** Removes everything, to start a new text. */
  clear(): void {
    this.restart();
    this.changeProperty('text', '');
  }

  imageAllowed(src: string): boolean {
    const allow = this.peekProperty<((src: string) => boolean) | null>('allowImage');
    if (!allow) return true;
    try {
      return allow(src) === true;
    } catch (error) {
      errorHandler.reportSuppressed('Markdown', error);
      return false;
    }
  }

  linkMade(link: Component<HTMLAnchorElement>, href: string | null, title: string): void {
    if (href !== null) put(link, 'href', href);
    if (title) put(link, 'title', title);
    const target = this.linkTarget;
    if (href !== null && target) {
      put(link, 'target', target);
      put(link, 'rel', 'noopener noreferrer');
    }
    link.motif.on('click', (_sender, e) => {
      const args: MarkdownLinkClickEventArgs = { href: href ?? '', event: e, cancel: false, source: this };
      this.linkClicked.fire(args);
      if (args.cancel) e.preventDefault();
    });
  }

  /** A text that goes on from the one given adds what is new; another text is a new one. */
  private drawText(text: string): void {
    if (this.appending) return;
    const given = this.written + this.waiting;
    if (text !== given) {
      if (this.ended || !text.startsWith(given)) {
        this.restart();
        this.write(text);
      } else {
        this.write(text.slice(given.length));
      }
    }
    if (!this.streaming && text) this.end();
  }

  /** Draws `s` after what is given: at once, or a piece a frame when it is long or pieces still wait. */
  private write(s: string): void {
    if (!s) return;
    if (!this.waiting && s.length <= AT_ONCE) {
      this.writer.write(s);
      this.written += s;
      return;
    }
    this.waiting += s;
    if (!this.stopPiece) this.drawPiece();
  }

  /** Writes what waits for a moment, then lets the frame lay it out; the text ends after its last piece when it ended. */
  private readonly drawPiece = (): void => {
    this.stopPiece = null;
    const waiting = this.waiting;
    const start = performance.now();
    let at = 0;
    while (at < waiting.length && performance.now() - start < PIECE_TIME) {
      let end = Math.min(waiting.length, at + STEP);
      // The two halves of a character written in two code units stay together.
      const last = waiting.charCodeAt(end - 1);
      if (end < waiting.length && last >= 0xd800 && last <= 0xdbff) end++;
      const piece = waiting.slice(at, end);
      this.writer.write(piece);
      this.written += piece;
      at = end;
    }
    this.waiting = waiting.slice(at);
    if (this.waiting) this.stopPiece = afterDrawn(this, this.drawPiece);
    else if (this.ended) this.writer.end();
  };

  private restart(): void {
    this.stopPiece?.();
    this.stopPiece = null;
    this.waiting = '';
    clearParts(this);
    this.drawing.reset();
    this.writer = new MarkdownWriter(this.drawing, this);
    this.written = '';
    this.ended = false;
  }
}
