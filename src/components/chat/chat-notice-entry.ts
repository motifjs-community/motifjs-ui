import type { Component } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { entryFrame, type ChatEntry } from './chat-entry';
import type { ChatNoticePart } from './chat-part';

/**
 * A line in the flow: the reply stopped or failed, is tried again, or anything the app says there. A retry counts the
 * seconds down to its next try, and says which try it is of how many and why.
 */
export class ChatNoticeEntry implements ChatEntry {
  readonly row: Component<HTMLDivElement>;
  private readonly label: Component<HTMLDivElement>;
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(private readonly notice: ChatNoticePart) {
    const { row, main } = entryFrame('notice');
    this.row = row;
    this.label = part<HTMLDivElement>(main, 'div', 'mx-chat__notice');
    row.motif.setDisposable(() => this.stopTimer());
    this.update();
  }

  append(): void {}

  update(): void {
    put(this.row, 'data-tone', this.notice.tone);
    put(this.label, 'role', this.notice.tone === 'error' ? 'alert' : null);
    if (this.left() > 0 && !this.timer) this.timer = setInterval(() => this.drawTexts(), 1000);
    this.drawTexts();
  }

  drawTexts(): void {
    const { tone, text: said, attempt, attempts } = this.notice;
    const strings = uiLocale.strings;
    if (tone !== 'retry') {
      text(this.label, said || (tone === 'stopped' ? strings.chatStopped : tone === 'error' ? strings.chatFailed : ''));
      return;
    }
    const left = this.left();
    if (left <= 0) this.stopTimer();
    const pieces = [said, left > 0 ? uiLocale.text('chatRetryingIn', { seconds: left }) : strings.chatRetried];
    if (attempt) pieces.push(attempts ? `${attempt}/${attempts}` : String(attempt));
    text(this.label, pieces.filter(Boolean).join(' · '));
  }

  /** Whole seconds to the next try; `0` once it is due, or when the notice is not a retry. */
  private left(): number {
    const until = this.notice.until;
    return until ? Math.max(0, Math.ceil((until - Date.now()) / 1000)) : 0;
  }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
}
