import type { Component } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { kept, mark, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Markdown } from '../markdown/Markdown';
import { entryFrame, type ChatEntry } from './chat-entry';
import type { ChatLook } from './chat-look';
import type { ChatCompactionPart } from './chat-part';

/**
 * Where the conversation was summed up for the model: a line across the flow with "Conversation summarized" on it,
 * which opens the summary under it when there is one.
 */
export class ChatCompactionEntry implements ChatEntry {
  readonly row: Component<HTMLDivElement>;
  private readonly head: Component<HTMLButtonElement>;
  private readonly body: Component<HTMLDivElement> | null = null;
  private expanded = false;

  constructor(compaction: ChatCompactionPart, look: ChatLook) {
    const { row, main } = entryFrame('compaction');
    this.row = row;
    const line = part<HTMLDivElement>(main, 'div', 'mx-chat__compaction');
    part<HTMLSpanElement>(line, 'span', 'mx-chat__compaction-line');
    this.head = part<HTMLButtonElement>(line, 'button', 'mx-chat__compaction-head');
    put(this.head, 'type', 'button');
    part<HTMLSpanElement>(line, 'span', 'mx-chat__compaction-line');
    if (compaction.text) {
      this.body = part<HTMLDivElement>(main, 'div', 'mx-chat__compaction-text');
      this.body.controls.add(new Markdown({ text: compaction.text, highlighter: look.highlighter, mathRenderer: look.mathRenderer, linkTarget: look.linkTarget }));
      this.head.motif.on('click', () => {
        this.expanded = !this.expanded;
        this.drawOpen();
      });
    }
    this.drawOpen();
    this.drawTexts();
  }

  append(): void {}

  update(): void {}

  drawTexts(): void {
    text(this.head, uiLocale.strings.chatCompacted);
  }

  private drawOpen(): void {
    kept(this.body, this.expanded);
    mark(this.row, 'data-expanded', this.expanded);
    put(this.head, 'aria-expanded', this.body ? String(this.expanded) : null);
  }
}
