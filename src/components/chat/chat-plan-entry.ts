import type { Component, ComponentBase } from '@motifx/core';
import { part, removePart } from '../../core/draw-parts';
import { kept, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Markdown } from '../markdown/Markdown';
import { ChatChoices, type ChatChoice } from './chat-choices';
import { entryFrame, type ChatEntry } from './chat-entry';
import type { ChatLook } from './chat-look';
import type { ChatPlanPart } from './chat-request';

/**
 * A plan the model wrote, in its box: while it waits, the ways to go on under it ("No, keep planning" last, with what to
 * change); then what the user took, or that nobody answered.
 */
export class ChatPlanEntry implements ChatEntry {
  readonly row: Component<HTMLDivElement>;
  private readonly title: Component<HTMLDivElement>;
  private readonly request: Component<HTMLDivElement>;
  private readonly answer: Component<HTMLDivElement>;
  private readonly markdown: Markdown;
  private choices: ChatChoices | null = null;

  constructor(private readonly plan: ChatPlanPart, private readonly look: ChatLook, private readonly live: () => boolean) {
    const { row, main } = entryFrame('plan');
    this.row = row;
    const box = part<HTMLDivElement>(main, 'div', 'mx-chat__plan');
    this.title = part<HTMLDivElement>(box, 'div', 'mx-chat__plan-title');
    this.markdown = new Markdown({ text: plan.text, highlighter: look.highlighter, mathRenderer: look.mathRenderer, diagramRenderer: look.diagramRenderer, linkTarget: look.linkTarget });
    this.markdown.class.add('mx-chat__plan-text');
    box.controls.add(this.markdown);
    this.request = part<HTMLDivElement>(main, 'div', 'mx-chat__request');
    this.answer = part<HTMLDivElement>(this.request, 'div', 'mx-chat__answer');
    this.update();
  }

  append(): void {}

  found(index: number): ComponentBase | null {
    return this.markdown.blockAt(index);
  }

  update(): void {
    const waiting = !this.plan.answer && this.live();
    put(this.row, 'data-status', waiting ? 'waiting' : null);
    if (waiting && !this.choices) {
      this.choices = new ChatChoices(uiLocale.strings.chatPlanReady, this.choiceList(), (value, said) => this.look.answer(this.plan, { choice: value, text: said }));
      this.request.controls.add(this.choices.row);
    } else if (!waiting && this.choices) {
      removePart(this.choices.row);
      this.choices = null;
    }
    kept(this.answer, !waiting);
    this.drawTexts();
  }

  drawTexts(): void {
    const strings = uiLocale.strings;
    text(this.title, strings.chatPlan);
    if (this.choices) {
      this.choices.drawTexts(strings.chatPlanReady, this.choiceList());
      return;
    }
    const answer = this.plan.answer;
    put(this.answer, 'data-answer', !answer ? 'none' : answer.choice === 'no' ? 'no' : 'yes');
    if (!answer) text(this.answer, strings.chatUnanswered);
    else if (answer.choice === 'no') text(this.answer, answer.text ? `${strings.chatPlanKept}: ${answer.text}` : strings.chatPlanKept);
    else text(this.answer, this.plan.choices?.find((c) => c.value === answer.choice)?.label ?? strings.chatPlanApproved);
  }

  focus(): boolean {
    return this.choices?.focus() ?? false;
  }

  private choiceList(): ChatChoice[] {
    const strings = uiLocale.strings;
    const list: ChatChoice[] = this.plan.choices?.length ? this.plan.choices.map((c) => ({ ...c })) : [{ value: 'yes', label: strings.chatPlanApprove }];
    list.push({ value: 'no', label: strings.chatPlanKeep, asks: strings.chatPlanHint });
    return list;
  }
}
