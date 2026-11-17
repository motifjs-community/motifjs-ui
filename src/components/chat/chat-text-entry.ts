import type { Component, ComponentBase } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { text } from '../../core/part-writes';
import { Markdown } from '../markdown/Markdown';
import { entryFrame, type ChatEntry } from './chat-entry';
import type { ChatLook } from './chat-look';
import type { ChatTextPart } from './chat-text-part';

/** Markdown of a reply. Text still being written stays open, and each piece is added to what is drawn. */
export class ChatTextEntry implements ChatEntry {
  readonly row: Component<HTMLDivElement>;
  private readonly time: Component<HTMLDivElement> | null = null;
  private readonly markdown: Markdown;

  constructor(textPart: ChatTextPart, private readonly look: ChatLook, open: boolean, private readonly date?: Date) {
    const { row, main } = entryFrame('text');
    this.row = row;
    if (date) this.time = part<HTMLDivElement>(main, 'div', 'mx-chat__time');
    this.markdown = new Markdown({
      text: textPart.text,
      streaming: open,
      highlighter: look.highlighter,
      mathRenderer: look.mathRenderer,
      diagramRenderer: look.diagramRenderer,
      linkTarget: look.linkTarget,
      codeLines: look.codeLines
    });
    this.markdown.class.add('mx-chat__text');
    main.controls.add(this.markdown);
    this.drawTexts();
  }

  append(delta: string): void {
    this.markdown.append(delta);
  }

  update(): void {}

  found(index: number): ComponentBase | null {
    return this.markdown.blockAt(index);
  }

  drawing(): boolean {
    return this.markdown.isDrawing;
  }

  /** The text is complete: what is still pending takes its form. */
  end(): void {
    if (!this.markdown.isEnded) this.markdown.end();
  }

  drawTexts(): void {
    if (this.time && this.date) text(this.time, this.look.time(this.date));
  }
}
