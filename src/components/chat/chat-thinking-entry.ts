import type { Component } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { kept, mark, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Markdown } from '../markdown/Markdown';
import { entryFrame, type ChatEntry } from './chat-entry';
import type { ChatLook } from './chat-look';
import type { ChatThinkingPart } from './chat-part';

/** Thinking shorter than this, with nothing written, is not drawn: a column of empty lines between tool calls says nothing. */
const LEAST_SHOWN = 1000;

/**
 * A reply's thinking: one line that says it thinks (and its newest note) while it runs, then "Thought for 3s". The
 * line opens what was written: the thinking as markdown and its notes.
 */
export class ChatThinkingEntry implements ChatEntry {
  readonly row: Component<HTMLDivElement>;
  private readonly head: Component<HTMLButtonElement>;
  private readonly label: Component<HTMLSpanElement>;
  private readonly note: Component<HTMLSpanElement>;
  private readonly body: Component<HTMLDivElement>;
  private readonly notes: Component<HTMLDivElement>;
  private markdown: Markdown | null = null;
  private drawnNotes = 0;
  private expanded = false;
  private timer: ReturnType<typeof setInterval> | undefined;

  /** `live`: its message is being written; thinking of a message that is not, and has no seconds, reads as done. */
  constructor(private readonly thinking: ChatThinkingPart, private readonly look: ChatLook, private readonly live: boolean) {
    const { row, main } = entryFrame('thinking');
    this.row = row;
    this.head = part<HTMLButtonElement>(main, 'button', 'mx-chat__thinking-head');
    put(this.head, 'type', 'button');
    this.label = part<HTMLSpanElement>(this.head, 'span', 'mx-chat__thinking-label');
    this.note = part<HTMLSpanElement>(this.head, 'span', 'mx-chat__thinking-note');
    this.body = part<HTMLDivElement>(main, 'div', 'mx-chat__thinking-body');
    this.notes = part<HTMLDivElement>(this.body, 'div', 'mx-chat__thinking-notes');
    this.head.motif.on('click', () => {
      this.expanded = !this.expanded;
      this.drawOpen();
    });
    if (thinking.text) this.writer().append(thinking.text);
    row.motif.setDisposable(() => this.stopTimer());
    this.update();
  }

  append(delta: string): void {
    this.writer().append(delta);
    this.update();
  }

  update(): void {
    const p = this.thinking;
    const done = this.isDone;
    put(this.row, 'data-state', done ? 'done' : 'open');
    for (; this.drawnNotes < (p.notes?.length ?? 0); this.drawnNotes++) text(part<HTMLDivElement>(this.notes, 'div', 'mx-chat__thinking-item'), p.notes![this.drawnNotes]);
    kept(this.notes, this.drawnNotes > 0);
    if (done) {
      this.stopTimer();
      if (this.markdown && !this.markdown.isEnded) this.markdown.end();
    } else if (!this.timer) {
      this.timer = setInterval(() => this.drawTexts(), 1000);
    }
    this.drawTexts();
    this.drawOpen();
  }

  drawTexts(): void {
    const p = this.thinking;
    const strings = uiLocale.strings;
    const done = this.isDone;
    const ms = p.seconds !== undefined ? p.seconds * 1000 : done ? LEAST_SHOWN : Date.now() - (p.started ?? Date.now());
    const seconds = Math.max(1, Math.round(ms / 1000));
    const label = !done ? `${strings.chatThinking} ${uiLocale.text('chatSeconds', { seconds })}` : p.seconds !== undefined ? uiLocale.text('chatThought', { seconds }) : strings.chatThoughtBrief;
    text(this.label, label);
    const newest = !done && p.notes?.length ? p.notes[p.notes.length - 1] : '';
    text(this.note, newest);
    kept(this.note, !!newest);
    // Nothing written, and gone within a second: no line. One still running shows once a second has passed.
    const empty = !p.text && !p.notes?.length;
    kept(this.row, !(empty && ms < LEAST_SHOWN));
  }

  private get isDone(): boolean {
    return this.thinking.seconds !== undefined || !this.live;
  }

  private drawOpen(): void {
    const has = !!this.markdown || this.drawnNotes > 0;
    put(this.head, 'aria-expanded', has ? String(this.expanded) : null);
    mark(this.row, 'data-expanded', this.expanded && has);
    kept(this.body, this.expanded && has);
  }

  private writer(): Markdown {
    if (!this.markdown) {
      this.markdown = new Markdown({ streaming: true, highlighter: this.look.highlighter, mathRenderer: this.look.mathRenderer, linkTarget: this.look.linkTarget });
      this.markdown.class.add('mx-chat__thinking-text');
      this.body.controls.insert(0, this.markdown);
    }
    return this.markdown;
  }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
}
