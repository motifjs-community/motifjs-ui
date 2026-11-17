import { Component, errorHandler, type ComponentBase } from '@motifx/core';
import { writeClipboard } from '../../core/clipboard';
import { loose, part, removePart, textPart } from '../../core/draw-parts';
import { glyph } from '../../core/glyphs';
import { onLanguage } from '../../core/on-language';
import { css, kept, mark, put } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import type { CodeColorer } from './code-colorer';
import type { CodeRun } from './code-run';
import type { MarkdownContext } from './markdown-context';
import type { TextRun } from './text-run';

/** How long the copy button says the code was copied, in milliseconds. */
const COPIED_FOR = 1500;

/**
 * A fenced code block: a header with the language and a copy button, and the code. Its lines are written as they
 * arrive; a line that ends takes the colours of the highlighter, when there is one, and is not written again. Past the
 * markdown's `codeLines`, the block shows that many lines and a button under it shows them all, and folds them again.
 * Once it is complete, `math` is drawn by the math door in the block's place, and a language the diagram door draws by
 * that door in the code's place.
 */
export class CodeBlock {
  /** The block's frame: its header and its code. */
  readonly frame: Component<HTMLDivElement>;
  private readonly header: Component<HTMLDivElement>;
  private readonly pre: Component<HTMLPreElement>;
  private readonly label: TextRun;
  private readonly code: Component<HTMLElement>;
  private readonly copyButton: Button | null = null;
  /** The button under a long block that shows all its lines, made when the block grows past the limit. */
  private moreButton: Button | null = null;
  private unfolded = false;
  private lines = 0;
  private line: TextRun | null = null;
  private lineText = '';
  private source = '';
  private infoText = '';
  private colorer: CodeColorer | null = null;
  private isCopied = false;
  /** Starts the time the button says "Copied"; set with the button. */
  private copied: () => void = () => {};

  constructor(private readonly context: MarkdownContext, host: ComponentBase) {
    const frame = part<HTMLDivElement>(host, 'div', 'mx-markdown__block');
    this.frame = frame;
    const header = part<HTMLDivElement>(frame, 'div', 'mx-markdown__code-header');
    this.header = header;
    this.label = context.run(part(header, 'span', 'mx-markdown__language'));
    if (context.settings.copyButton) {
      // Its variant and size come from its place.
      const button = new Button({ icon: glyph('copy') });
      button.class.add('mx-markdown__copy');
      button.motif.on('click', () => this.copy());
      header.controls.add(button);
      this.copyButton = button;
      onLanguage(button, () => this.drawCopy());
      let timer: ReturnType<typeof setTimeout> | undefined;
      button.motif.setDisposable(() => clearTimeout(timer));
      this.copied = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.isCopied = false;
          if (!button.isDisposed) this.drawCopy();
        }, COPIED_FOR);
      };
    }
    this.pre = part<HTMLPreElement>(frame, 'pre', 'mx-markdown__pre');
    this.code = part<HTMLElement>(this.pre, 'code', 'mx-markdown__code-text');
  }

  /** The info string written so far: the language is its first word. */
  get info(): string {
    return this.infoText;
  }

  /** The code written so far, the line being written included. */
  get text(): string {
    return this.source + this.lineText;
  }

  infoChar(c: string): void {
    if (!this.infoText && /\s/.test(c)) return;
    this.infoText += c;
    this.label.value += c;
    this.context.touch(this.label);
  }

  /** The info string is complete: the label keeps the language, and the highlighter is asked for the block. */
  infoEnd(): void {
    const language = this.infoText.trim().split(/\s+/)[0] ?? '';
    if (this.label.value !== language) {
      this.label.value = language;
      this.context.touch(this.label);
    }
    if (language) put(this.code, 'data-language', language);
    const highlighter = this.context.settings.highlighter;
    if (!highlighter) return;
    try {
      this.colorer = highlighter.open(language);
    } catch (error) {
      errorHandler.reportSuppressed('Markdown', error);
    }
  }

  write(s: string): void {
    if (!s) return;
    this.line ??= this.context.run(this.code);
    this.line.value += s;
    this.lineText += s;
    this.context.touch(this.line);
  }

  /** The line ends: it takes its colours, or its line break. */
  lineEnd(): void {
    const text = this.lineText;
    const line = this.line ?? this.context.run(this.code);
    this.source += `${text}\n`;
    this.lineText = '';
    this.line = null;
    this.lines++;
    this.drawFold();
    const runs = this.colors(text);
    if (!runs) {
      line.value += '\n';
      this.context.touch(line);
      return;
    }
    removePart(line.node);
    for (const run of runs) {
      if (!run.className && !run.color) {
        textPart(this.code, run.text);
        continue;
      }
      const span = loose<HTMLSpanElement>('span', run.className ?? '');
      if (run.color) css(span, 'color', run.color);
      textPart(span, run.text);
      this.code.controls.add(span);
    }
    textPart(this.code, '\n');
  }

  /** The line being written is a closing fence of `ch`, at least `count` long. */
  closes(ch: string, count: number): boolean {
    const m = /^ {0,3}(`+|~+)[ \t]*$/.exec(this.lineText);
    return !!m && m[1][0] === ch && m[1].length >= count;
  }

  /** Takes the line being written away: it was the closing fence. */
  dropLine(): void {
    if (this.line) removePart(this.line.node);
    this.line = null;
    this.lineText = '';
  }

  close(): void {
    try {
      this.colorer?.close?.();
    } catch (error) {
      errorHandler.reportSuppressed('Markdown', error);
    }
    this.colorer = null;
    this.draw();
  }

  /** The code is complete: math, or a language the diagram door draws, is drawn by its door. */
  private draw(): void {
    const language = this.label.value;
    if (language === 'math') {
      const drawn = this.context.math(this.text.trim(), true);
      if (drawn) this.show(drawn, 'math');
      return;
    }
    const diagrams = this.context.settings.diagramRenderer;
    if (!diagrams || !language) return;
    let drawn: Element | Promise<Element | null> | null = null;
    try {
      if (diagrams.draws(language)) drawn = diagrams.render(this.text, language);
    } catch (error) {
      errorHandler.reportSuppressed('Markdown', error);
    }
    if (!drawn) return;
    if (!('then' in drawn)) {
      this.show(new Component(drawn as HTMLElement), 'diagram');
      return;
    }
    // A door that loads or lays out first: what it gives later takes the code's place, while the block is still there.
    drawn.then(
      (element) => {
        if (element && !this.frame.isDisposed) this.show(new Component(element as HTMLElement), 'diagram');
      },
      (error: unknown) => errorHandler.reportSuppressed('Markdown', error)
    );
  }

  /** What a door drew takes the code's place; math takes the whole block's, its header too. */
  private show(drawn: ComponentBase, kind: 'math' | 'diagram'): void {
    kept(this.pre, false);
    if (kind === 'math') kept(this.header, false);
    kept(this.moreButton, false);
    mark(this.frame, 'data-folded', false);
    this.frame.controls.add(drawn);
    put(this.frame, 'data-drawn', kind);
  }

  /** Past the limit, the block shows its first lines and the button under it the count of all; open, it shows them all. */
  private drawFold(): void {
    const limit = this.context.settings.codeLines;
    if (!this.moreButton && (!limit || this.lines <= limit)) return;
    if (!this.moreButton) {
      // Its variant and size come from its place.
      const button = new Button({ icon: glyph('chevron-down') });
      button.class.add('mx-markdown__code-more');
      button.motif.on('click', () => {
        this.unfolded = !this.unfolded;
        this.drawFold();
      });
      this.frame.controls.add(button);
      this.moreButton = button;
      css(this.frame, '--_code-lines', String(limit));
      onLanguage(button, () => this.drawMore());
    }
    mark(this.frame, 'data-folded', !this.unfolded);
    this.drawMore();
  }

  private drawMore(): void {
    const button = this.moreButton;
    if (!button) return;
    const count = this.lines + (this.lineText ? 1 : 0);
    button.text = this.unfolded ? uiLocale.strings.markdownShowFewer : uiLocale.text('markdownShowLines', { count });
    // Its chevron turns up with it (markdown.css).
    put(button, 'aria-expanded', String(this.unfolded));
  }

  private colors(text: string): readonly CodeRun[] | null {
    if (!this.colorer) return null;
    try {
      const runs = this.colorer.line(text);
      if (runs.map((r) => r.text).join('') === text) return runs;
      errorHandler.reportSuppressed('Markdown', new Error('Markdown: the highlighter changed the text of a line; it stays plain.'));
    } catch (error) {
      errorHandler.reportSuppressed('Markdown', error);
    }
    return null;
  }

  private copy(): void {
    writeClipboard(this.context.settings.owner, { text: this.text });
    this.isCopied = true;
    this.drawCopy();
    this.copied();
  }

  private drawCopy(): void {
    if (this.copyButton) this.copyButton.text = this.isCopied ?uiLocale.strings.markdownCopied : uiLocale.strings.markdownCopy;
  }
}
