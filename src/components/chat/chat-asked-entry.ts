import type { Component } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { kept, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import { entryFrame, type ChatEntry } from './chat-entry';
import type { ChatLook } from './chat-look';
import type { ChatQuestionsPart } from './chat-request';

/**
 * Questions the model asked, as the flow keeps them: how many and where they stand, then each question with its answer
 * under it. The form is under the conversation, in the composer's place; while it waits, "Answer" takes the focus there.
 */
export class ChatAskedEntry implements ChatEntry {
  readonly row: Component<HTMLDivElement>;
  private readonly count: Component<HTMLSpanElement>;
  private readonly state: Component<HTMLSpanElement>;
  private readonly button: Button;
  private readonly answers: Component<HTMLDivElement>[] = [];

  constructor(private readonly asked: ChatQuestionsPart, look: ChatLook, private readonly live: () => boolean) {
    const { row, main } = entryFrame('questions');
    this.row = row;
    const head = part<HTMLDivElement>(main, 'div', 'mx-chat__asked-head');
    this.count = part<HTMLSpanElement>(head, 'span', 'mx-chat__asked-count');
    this.state = part<HTMLSpanElement>(head, 'span', 'mx-chat__asked-state');
    // Its variant and size come from its place.
    this.button = new Button();
    this.button.class.add('mx-chat__asked-button');
    this.button.motif.on('click', () => look.ask(asked));
    head.controls.add(this.button);
    const list = part<HTMLDivElement>(main, 'div', 'mx-chat__asked-list');
    for (const q of asked.questions) {
      const pair = part<HTMLDivElement>(list, 'div', 'mx-chat__asked-pair');
      text(part<HTMLDivElement>(pair, 'div', 'mx-chat__asked-question'), q.text);
      this.answers.push(part<HTMLDivElement>(pair, 'div', 'mx-chat__asked-answer'));
    }
    this.update();
  }

  append(): void {}

  update(): void {
    const answer = this.asked.answer;
    const waiting = !answer && this.live();
    put(this.row, 'data-status', waiting ? 'waiting' : null);
    kept(this.button, waiting);
    this.asked.questions.forEach((q, i) => {
      const said = answer?.answers.find((a) => a.id === (q.id ?? String(i + 1)))?.values.join(', ') ?? '';
      text(this.answers[i], said);
      kept(this.answers[i], !!said);
    });
    this.drawTexts();
  }

  drawTexts(): void {
    const strings = uiLocale.strings;
    const answer = this.asked.answer;
    text(this.count, uiLocale.text('chatQuestionCount', { count: this.asked.questions.length }));
    let said = strings.chatAnswered;
    if (!answer) said = this.live() ? strings.chatWaitingAnswer : strings.chatUnanswered;
    else if (answer.declined) said = strings.chatDeclined;
    text(this.state, said);
    this.button.text = strings.chatAnswer;
  }
}
