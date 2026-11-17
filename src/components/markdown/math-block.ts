import type { Component, ComponentBase } from '@motifx/core';
import { part, removePart } from '../../core/draw-parts';
import { put } from '../../core/part-writes';
import type { MarkdownContext } from './markdown-context';
import type { TextRun } from './text-run';

/**
 * A block of display math, from `$$` at a line's start to a line that ends with `$$`: its TeX shows as it arrives, and
 * once it is complete the math door draws it in its place.
 */
export class MathBlock {
  readonly frame: Component<HTMLDivElement>;
  private readonly code: Component<HTMLElement>;
  private readonly run: TextRun;
  private tex = '';
  private line = '';
  private closed = false;

  constructor(private readonly context: MarkdownContext, host: ComponentBase) {
    this.frame = part<HTMLDivElement>(host, 'div', 'mx-markdown__math-block');
    this.code = part<HTMLElement>(this.frame, 'code', 'mx-markdown__math-text');
    this.run = context.run(this.code);
  }

  write(c: string): void {
    this.line += c;
    this.run.value += c;
    this.context.touch(this.run);
  }

  /** The line being written ends with `$$`: it leaves the text, and the block ends with the line. */
  ends(): boolean {
    const line = this.line.trimEnd();
    if (!line.endsWith('$$')) return false;
    const kept = line.slice(0, -2);
    this.run.value = this.run.value.slice(0, this.run.value.length - (this.line.length - kept.length));
    this.context.touch(this.run);
    this.tex += kept;
    this.line = '';
    return true;
  }

  lineEnd(): void {
    // The line `$$` opened on shows nothing when it holds nothing.
    if (!this.tex && !this.line) return;
    this.tex += `${this.line}\n`;
    this.line = '';
    this.run.value += '\n';
    this.context.touch(this.run);
  }

  /** The TeX is complete: the door draws it in its place, or it stays as written. */
  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.tex += this.line;
    this.line = '';
    const drawn = this.context.math(this.tex.trim(), true);
    if (!drawn) return;
    removePart(this.code);
    this.frame.controls.add(drawn);
    put(this.frame, 'data-drawn', '');
  }
}
