import type { Component } from '@motifx/core';
import { clearParts, part } from '../../core/draw-parts';
import { kept, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import { entryFrame, type ChatEntry } from './chat-entry';
import type { ChatLook } from './chat-look';
import type { ChatFormPart, ChatFormValue } from './chat-request';

/**
 * A form a reply asked the user to fill in, as the flow keeps it: who asks and where it stands, what it asks for, then
 * each field the user filled in with what they wrote. The form is under the conversation, in the composer's place;
 * while it waits, "Answer" takes the focus there.
 */
export class ChatFormEntry implements ChatEntry {
  readonly row: Component<HTMLDivElement>;
  private readonly title: Component<HTMLSpanElement>;
  private readonly state: Component<HTMLSpanElement>;
  private readonly button: Button;
  private readonly list: Component<HTMLDivElement>;

  constructor(private readonly asked: ChatFormPart, look: ChatLook, private readonly live: () => boolean) {
    const { row, main } = entryFrame('form');
    this.row = row;
    const head = part<HTMLDivElement>(main, 'div', 'mx-chat__asked-head');
    this.title = part<HTMLSpanElement>(head, 'span', 'mx-chat__asked-count');
    this.state = part<HTMLSpanElement>(head, 'span', 'mx-chat__asked-state');
    // Its variant and size come from its place.
    this.button = new Button();
    this.button.class.add('mx-chat__asked-button');
    this.button.motif.on('click', () => look.ask(asked));
    head.controls.add(this.button);
    text(part<HTMLDivElement>(main, 'div', 'mx-chat__form-message'), asked.message);
    this.list = part<HTMLDivElement>(main, 'div', 'mx-chat__asked-list');
    this.update();
  }

  append(): void {}

  update(): void {
    const answer = this.asked.answer;
    const waiting = !answer && this.live();
    put(this.row, 'data-status', waiting ? 'waiting' : null);
    kept(this.button, waiting);
    clearParts(this.list);
    const content = answer?.action === 'accept' ? (answer.content ?? {}) : {};
    for (const [key, value] of Object.entries(content)) {
      const field = this.asked.schema.properties?.[key];
      const pair = part<HTMLDivElement>(this.list, 'div', 'mx-chat__asked-pair');
      text(part<HTMLDivElement>(pair, 'div', 'mx-chat__asked-question'), field?.title || key);
      text(part<HTMLDivElement>(pair, 'div', 'mx-chat__asked-answer'), this.said(key, value));
    }
    kept(this.list, Object.keys(content).length > 0);
    this.drawTexts();
  }

  drawTexts(): void {
    const strings = uiLocale.strings;
    const source = this.asked.source;
    text(this.title, source ? uiLocale.text('chatFormFrom', { source }) : strings.chatForm);
    const answer = this.asked.answer;
    let said = strings.chatAnswered;
    if (!answer) said = this.live() ? strings.chatWaitingAnswer : strings.chatUnanswered;
    else if (answer.action === 'decline') said = strings.chatFormDeclined;
    else if (answer.action === 'cancel') said = strings.chatFormCancelled;
    text(this.state, said);
    this.button.text = strings.chatAnswer;
  }

  /** A value as the user chose it: the name of a choice, yes or no, the values of several. */
  private said(key: string, value: ChatFormValue): string {
    const field = this.asked.schema.properties?.[key];
    const name = (v: string): string => {
      if (field?.type === 'string') {
        const titled = field.oneOf?.find((c) => c.const === v)?.title;
        const at = field.enum?.indexOf(v) ?? -1;
        return titled || (at >= 0 ? field.enumNames?.[at] : undefined) || v;
      }
      if (field?.type === 'array') return field.items.anyOf?.find((c) => c.const === v)?.title || v;
      return v;
    };
    if (typeof value === 'boolean') return value ? uiLocale.strings.yes : uiLocale.strings.no;
    if (Array.isArray(value)) return value.map(name).join(', ');
    return typeof value === 'string' ? name(value) : new Intl.NumberFormat(uiLocale.locale).format(value);
  }
}
