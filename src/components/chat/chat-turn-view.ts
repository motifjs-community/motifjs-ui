import type { Component, ComponentBase } from '@motifx/core';
import { loose, part } from '../../core/draw-parts';
import { glyph } from '../../core/glyphs';
import { kept, mark, put } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import { ChatCopyButton } from './chat-copy-button';
import { ChatFlowView } from './chat-flow-view';
import type { ChatLook } from './chat-look';
import type { ChatFeedback, ChatMessage } from './chat-message';
import type { ChatPart } from './chat-part';
import { ChatQuestionView } from './chat-question-view';
import type { ChatTurn } from './chat-turn';

/**
 * The part of a turn: the user's question, then what the model did, then its actions once the reply ended (copy it;
 * say it was good or bad; try again when it failed or stopped, or ask for another). It is made from the turn's
 * messages when the turn comes near the view and disposed when it goes far; a reply streaming into it writes into its
 * flow. It is an article of the conversation's feed, named by its question, busy while its reply is written.
 */
export class ChatTurnView {
  readonly row: Component<HTMLDivElement>;
  readonly flow: ChatFlowView;
  private readonly question: ChatQuestionView | null;
  private readonly actions: Component<HTMLDivElement>;
  private readonly copy: ChatCopyButton;
  private retryButton: Button | null = null;
  private regenerateButton: Button | null = null;
  private goodButton: Button | null = null;
  private badButton: Button | null = null;

  constructor(readonly turn: ChatTurn, private readonly look: ChatLook) {
    this.row = loose<HTMLDivElement>('div', 'mx-chat__turn');
    put(this.row, 'role', 'article');
    put(this.row, 'tabindex', '-1');
    const first = turn.messages[0];
    this.question = first?.role === 'user' ? new ChatQuestionView(first, look) : null;
    if (this.question) this.row.controls.add(this.question.row);
    if (this.question?.bubbleId) put(this.row, 'aria-labelledby', this.question.bubbleId);
    this.flow = new ChatFlowView(look, () => turn.messages[turn.messages.length - 1]?.status === 'streaming');
    this.row.controls.add(this.flow.row);
    for (const message of turn.messages) if (message !== first || !this.question) this.add(message);
    this.actions = part<HTMLDivElement>(this.row, 'div', 'mx-chat__turn-actions');
    this.copy = new ChatCopyButton(() => this.replyText());
    this.actions.controls.add(this.copy.button);
    this.drawActions();
    this.drawLabel();
  }

  /** Its place in the feed: `at` from 0, of `count` turns (`-1` while older ones may still come). */
  drawPlace(at: number, count: number): void {
    put(this.row, 'aria-posinset', String(at + 1));
    put(this.row, 'aria-setsize', String(count));
  }

  /**
   * The actions as the turn stands: none while its reply is written; copy when it wrote text; good and bad when the
   * app takes feedback; on the latest turn, try again when its reply failed or stopped and the app takes retries, or
   * else another reply when the app takes regenerations.
   */
  drawActions(): void {
    const messages = this.turn.messages;
    const last = messages[messages.length - 1];
    const live = last?.status === 'streaming';
    const said = this.replyText();
    const ended = !live && !!last && last.role !== 'user';
    const latest = ended && this.look.isLatest(this.turn);
    const failed = latest && (last.status === 'error' || last.status === 'stopped');
    const { retry, regenerate, feedback } = this.look;
    const retrying = failed && !!retry;
    const again = latest && !retrying && !!regenerate;
    const judged = ended && !!said && !!feedback;
    const made = (judged && !this.goodButton) || (retrying && !this.retryButton) || (again && !this.regenerateButton);
    if (judged && !this.goodButton) {
      this.goodButton = this.feedbackButton('thumb-up', 'good');
      this.badButton = this.feedbackButton('thumb-down', 'bad');
    }
    if (retrying && !this.retryButton) this.retryButton = this.againButton(() => retry);
    if (again && !this.regenerateButton) this.regenerateButton = this.againButton(() => regenerate);
    if (made) this.drawActionTexts();
    kept(this.copy.button, !!said);
    kept(this.goodButton, judged);
    kept(this.badButton, judged);
    kept(this.retryButton, retrying);
    kept(this.regenerateButton, again);
    this.drawFeedback();
    mark(this.actions, 'data-failed', retrying);
    kept(this.actions, !live && (!!said || retrying || again));
    put(this.row, 'aria-busy', live ? 'true' : null);
  }

  /** What shows the character at `index` of `part`'s text in `message`, for a search. */
  found(message: ChatMessage, part: ChatPart, index: number): ComponentBase | null {
    if (this.question && message === this.turn.messages[0]) return this.question.found();
    return this.flow.found(part, index);
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
    put(this.row, 'aria-busy', streaming ? 'true' : null);
  }

  drawTexts(): void {
    this.question?.drawTexts();
    this.flow.drawTexts();
    this.drawActionTexts();
    this.drawLabel();
  }

  private drawActionTexts(): void {
    const strings = uiLocale.strings;
    this.copy.drawTexts();
    if (this.retryButton) this.retryButton.text = strings.chatRetry;
    if (this.regenerateButton) this.regenerateButton.text = strings.chatRegenerate;
    for (const [button, said] of [
      [this.goodButton, strings.chatGood],
      [this.badButton, strings.chatBad]
    ] as const) {
      if (!button) continue;
      put(button, 'aria-label', said);
      button.hint = said;
    }
  }

  /** The reply the turn's actions speak of: its last message of the model. */
  private get reply(): ChatMessage | undefined {
    const messages = this.turn.messages;
    for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role !== 'user') return messages[i];
    return undefined;
  }

  /** Try again, or another reply: the turn's reply goes, from its last message on, and the app writes it again. */
  private againButton(run: () => ((message: ChatMessage) => void) | null): Button {
    // Its variant and size come from its place.
    const button = new Button({ icon: glyph('repeat') });
    button.class.add('mx-chat__action');
    button.motif.on('click', () => {
      const at = this.turn.messages[this.turn.messages.length - 1];
      const go = run();
      if (at && go) go(at);
    });
    this.actions.controls.add(button);
    return button;
  }

  /** Good or bad, its icon alone: pressed while the reply has it; pressed again, it is taken back. */
  private feedbackButton(icon: string, value: ChatFeedback): Button {
    // Its variant and size come from its place.
    const button = new Button({ icon: glyph(icon), toggle: true });
    button.class.add('mx-chat__action');
    // The button turned itself on or off first.
    button.motif.on('click', () => {
      const reply = this.reply;
      if (!reply) return;
      const now = button.pressed ? value : null;
      if (now) reply.feedback = now;
      else delete reply.feedback;
      this.drawFeedback();
      this.look.feedback?.(reply, now);
    });
    this.actions.controls.add(button);
    return button;
  }

  private drawFeedback(): void {
    const feedback = this.reply?.feedback;
    if (this.goodButton) this.goodButton.pressed = feedback === 'good';
    if (this.badButton) this.badButton.pressed = feedback === 'bad';
  }

  /** A turn with no question text is named by who speaks in it. */
  private drawLabel(): void {
    if (this.question?.bubbleId) return;
    const strings = uiLocale.strings;
    put(this.row, 'aria-label', this.question ? strings.chatYou : strings.chatAssistant);
  }

  /** What the model wrote in the turn, as markdown: its texts, a blank line between them. */
  private replyText(): string {
    const said: string[] = [];
    for (const m of this.turn.messages) if (m.role !== 'user') for (const p of m.parts) if (p.kind === 'text' && p.text) said.push(p.text);
    return said.join('\n\n');
  }
}
