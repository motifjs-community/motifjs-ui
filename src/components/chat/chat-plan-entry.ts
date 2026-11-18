import type { Component, ComponentBase } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { kept, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import { Markdown } from '../markdown/Markdown';
import { entryFrame, type ChatEntry } from './chat-entry';
import type { ChatLook } from './chat-look';
import type { ChatPlanPart } from './chat-request';

/**
 * A plan the model wrote, in its box. While it waits, the ways to go on are in the composer's place and a line under it
 * says so, with "Answer" to go there; then what the user took, or that nobody answered.
 */
export class ChatPlanEntry implements ChatEntry {
  readonly row: Component<HTMLDivElement>;
  private readonly title: Component<HTMLDivElement>;
  private readonly asking: Component<HTMLDivElement>;
  private readonly state: Component<HTMLSpanElement>;
  private readonly button: Button;
  private readonly answer: Component<HTMLDivElement>;
  private readonly markdown: Markdown;

  constructor(private readonly plan: ChatPlanPart, look: ChatLook, private readonly live: () => boolean) {
    const { row, main } = entryFrame('plan');
    this.row = row;
    const box = part<HTMLDivElement>(main, 'div', 'mx-chat__plan');
    this.title = part<HTMLDivElement>(box, 'div', 'mx-chat__plan-title');
    this.markdown = new Markdown({
      text: plan.text,
      highlighter: look.highlighter,
      mathRenderer: look.mathRenderer,
      diagramRenderer: look.diagramRenderer,
      linkTarget: look.linkTarget,
      codeLines: look.codeLines
    });
    this.markdown.class.add('mx-chat__plan-text');
    box.controls.add(this.markdown);
    const request = part<HTMLDivElement>(main, 'div', 'mx-chat__request');
    this.asking = part<HTMLDivElement>(request, 'div', 'mx-chat__asked-head');
    this.state = part<HTMLSpanElement>(this.asking, 'span', 'mx-chat__asked-state');
    // Its variant and size come from its place.
    this.button = new Button();
    this.button.class.add('mx-chat__asked-button');
    this.button.motif.on('click', () => look.ask(plan));
    this.asking.controls.add(this.button);
    this.answer = part<HTMLDivElement>(request, 'div', 'mx-chat__answer');
    this.update();
  }

  append(): void {}

  found(index: number): ComponentBase | null {
    return this.markdown.blockAt(index);
  }

  drawing(): boolean {
    return this.markdown.isDrawing;
  }

  update(): void {
    const waiting = !this.plan.answer && this.live();
    put(this.row, 'data-status', waiting ? 'waiting' : null);
    kept(this.asking, waiting);
    kept(this.answer, !waiting);
    this.drawTexts();
  }

  drawTexts(): void {
    const strings = uiLocale.strings;
    text(this.title, strings.chatPlan);
    text(this.state, strings.chatWaitingAnswer);
    this.button.text = strings.chatAnswer;
    const answer = this.plan.answer;
    put(this.answer, 'data-answer', !answer ? 'none' : answer.choice === 'no' ? 'no' : 'yes');
    if (!answer) text(this.answer, strings.chatUnanswered);
    else if (answer.choice === 'no') text(this.answer, answer.text ? `${strings.chatPlanKept}: ${answer.text}` : strings.chatPlanKept);
    else text(this.answer, this.plan.choices?.find((c) => c.value === answer.choice)?.label ?? strings.chatPlanApproved);
  }
}
