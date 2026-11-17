import type { Component } from '@motifx/core';
import { loose, part } from '../../core/draw-parts';
import { glyph } from '../../core/glyphs';
import { kept, mark } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import { ChatCopyButton } from './chat-copy-button';
import { ChatFlowView } from './chat-flow-view';
import type { ChatLook } from './chat-look';
import type { ChatMessage } from './chat-message';
import { ChatQuestionView } from './chat-question-view';
import type { ChatTurn } from './chat-turn';

/**
 * The part of a turn: the user's question, then what the model did, then its actions once the reply ended (copy it;
 * try again when it failed or stopped). It is made from the turn's messages when the turn comes near the view and
 * disposed when it goes far; a reply streaming into it writes into its flow.
 */
export class ChatTurnView {
  readonly row: Component<HTMLDivElement>;
  readonly flow: ChatFlowView;
  private readonly question: ChatQuestionView | null;
  private readonly actions: Component<HTMLDivElement>;
  private readonly copy: ChatCopyButton;
  private retryButton: Button | null = null;

  constructor(readonly turn: ChatTurn, private readonly look: ChatLook) {
    this.row = loose<HTMLDivElement>('div', 'mx-chat__turn');
    const first = turn.messages[0];
    this.question = first?.role === 'user' ? new ChatQuestionView(first, look) : null;
    if (this.question) this.row.controls.add(this.question.row);
    this.flow = new ChatFlowView(look, () => turn.messages[turn.messages.length - 1]?.status === 'streaming');
    this.row.controls.add(this.flow.row);
    for (const message of turn.messages) if (message !== first || !this.question) this.add(message);
    this.actions = part<HTMLDivElement>(this.row, 'div', 'mx-chat__turn-actions');
    this.copy = new ChatCopyButton(() => this.replyText());
    this.actions.controls.add(this.copy.button);
    this.drawActions();
  }

  /**
   * The actions as the turn stands: none while its reply is written; copy when it wrote text; try again when its last
   * reply failed or stopped, the turn is the latest and the app takes retries.
   */
  drawActions(): void {
    const messages = this.turn.messages;
    const last = messages[messages.length - 1];
    const live = last?.status === 'streaming';
    const said = this.replyText();
    const failed = !live && !!last && last.role !== 'user' && (last.status === 'error' || last.status === 'stopped') && this.look.isLatest(this.turn);
    const retry = this.look.retry;
    if (failed && retry && !this.retryButton) {
      // Its variant and size come from its place.
      this.retryButton = new Button({ icon: glyph('repeat') });
      this.retryButton.class.add('mx-chat__action');
      this.retryButton.motif.on('click', () => {
        const at = this.turn.messages[this.turn.messages.length - 1];
        if (at) retry(at);
      });
      this.retryButton.text = uiLocale.strings.chatRetry;
      this.actions.controls.add(this.retryButton);
    }
    kept(this.copy.button, !!said);
    kept(this.retryButton, failed);
    mark(this.actions, 'data-failed', failed && !!retry);
    kept(this.actions, !live && (!!said || (failed && !!retry)));
  }

  /** The row of the turn's question; the first turn may have none. */
  get questionRow(): Component<HTMLDivElement> | null {
    return this.question?.row ?? null;
  }

  /** Draws a message of the model at the end of the flow, as far as it is written; its first text shows its time. */
  add(message: ChatMessage): void {
    const parts = message.parts;
    const streaming = message.status === 'streaming';
    let timed = !message.time;
    parts.forEach((p, i) => {
      const time = !timed && p.kind === 'text' ? message.time : undefined;
      if (time) timed = true;
      this.flow.add(p, streaming && i === parts.length - 1, time);
    });
    if (!streaming) this.flow.close();
  }

  drawTexts(): void {
    this.question?.drawTexts();
    this.flow.drawTexts();
    this.copy.drawTexts();
    if (this.retryButton) this.retryButton.text = uiLocale.strings.chatRetry;
  }

  /** What the model wrote in the turn, as markdown: its texts, a blank line between them. */
  private replyText(): string {
    const said: string[] = [];
    for (const m of this.turn.messages) if (m.role !== 'user') for (const p of m.parts) if (p.kind === 'text' && p.text) said.push(p.text);
    return said.join('\n\n');
  }
}
