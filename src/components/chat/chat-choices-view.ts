import type { Component } from '@motifx/core';
import { clearParts, loose, part } from '../../core/draw-parts';
import { focusInTextField, focusOn } from '../../core/focus';
import { nextId } from '../../core/next-id';
import { kept, mark, put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { TextBox } from '../textbox/TextBox';
import type { ChatToolPart } from './chat-part';
import type { ChatAnswer, ChatPermissionAnswer, ChatPlanPart } from './chat-request';

/** A choice of a request; `asks`: it takes a text too, and this is the box's placeholder. */
interface ChatChoice {
  value: string;
  label: string;
  asks?: string;
}

/**
 * The choices of a request, in the composer's place until one is taken: a tool call asking before it runs, a plan
 * asking to go on. Its question, then the choices, numbered as a question's options are: a click, or the number's key,
 * takes one, and the arrow keys move between them. A choice that asks for a text opens a box under them: Enter there
 * takes the choice with what was written, Escape goes back to it. Escape elsewhere stops the reply.
 */
export class ChatChoicesView {
  readonly row: Component<HTMLDivElement>;
  private readonly said: Component<HTMLDivElement>;
  private readonly list: Component<HTMLDivElement>;
  private readonly box: TextBox;
  private buttons: Component<HTMLButtonElement>[] = [];
  private labels: Component<HTMLSpanElement>[] = [];
  private items: ChatChoice[] = [];
  /** The choice the box is for; `-1` while it was not opened. */
  private boxFor = -1;
  private asked: ChatPlanPart | ChatToolPart | null = null;

  constructor(private readonly answered: (part: ChatPlanPart | ChatToolPart, answer: ChatAnswer) => void, private readonly stop: () => void) {
    this.row = loose<HTMLDivElement>('div', 'mx-chat__ask');
    put(this.row, 'role', 'group');
    put(this.row, 'data-kind', 'choices');
    const body = part<HTMLDivElement>(this.row, 'div', 'mx-chat__ask-body');
    this.said = part<HTMLDivElement>(body, 'div', 'mx-chat__ask-text');
    const id = nextId('mx-chat-choices');
    put(this.said, 'id', id);
    put(this.row, 'aria-labelledby', id);
    this.list = part<HTMLDivElement>(body, 'div', 'mx-chat__ask-options');
    put(this.list, 'role', 'group');
    put(this.list, 'aria-labelledby', id);
    this.box = new TextBox({ onEnter: () => this.take(this.boxFor) });
    this.box.class.add('mx-chat__ask-other');
    this.box.motif.on('keydown', (_, e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      kept(this.box, false);
      this.drawTaken();
      focusOn(this.buttons[this.boxFor]);
    });
    body.controls.add(this.box);
    kept(this.box, false);
    this.row.motif.on('keydown', (_, e: KeyboardEvent) => this.key(e));
    kept(this.row, false);
  }

  /** The request shown; `null` while it is closed. */
  get part(): ChatPlanPart | ChatToolPart | null {
    return this.asked;
  }

  open(asked: ChatPlanPart | ChatToolPart): void {
    this.close();
    this.asked = asked;
    this.items = this.choiceList();
    this.items.forEach((_, i) => {
      const button = part<HTMLButtonElement>(this.list, 'button', 'mx-chat__ask-option');
      put(button, 'type', 'button');
      text(part<HTMLSpanElement>(button, 'span', 'mx-chat__ask-key'), String(i + 1));
      const main = part<HTMLSpanElement>(button, 'span', 'mx-chat__ask-option-main');
      this.labels.push(part<HTMLSpanElement>(main, 'span', 'mx-chat__ask-label'));
      button.motif.on('click', () => this.take(i));
      this.buttons.push(button);
    });
    kept(this.row, true);
    this.drawTexts();
  }

  close(): void {
    this.asked = null;
    kept(this.row, false);
    clearParts(this.list);
    this.buttons = [];
    this.labels = [];
    this.items = [];
    this.boxFor = -1;
    this.box.value = '';
    kept(this.box, false);
  }

  /** The box when it is open, else the first choice. */
  focus(): boolean {
    if (this.boxFor >= 0 && this.box.isVisible) return this.box.focus();
    const first = this.buttons[0];
    if (!first) return false;
    focusOn(first);
    return true;
  }

  /** The language changed: the question and the choices. */
  drawTexts(): void {
    if (!this.asked) return;
    this.items = this.choiceList();
    text(this.said, this.question());
    this.items.forEach((item, i) => text(this.labels[i], item.label));
    this.box.placeholder = this.items[this.boxFor]?.asks ?? '';
  }

  private question(): string {
    const asked = this.asked!;
    return asked.kind === 'plan' ? uiLocale.strings.chatPlanReady : uiLocale.text('chatAllowTool', { tool: asked.label || asked.name });
  }

  /** A plan's choices (by default "Yes, go ahead"), then "No, keep planning"; a call's "Yes", `always` when given, "No". */
  private choiceList(): ChatChoice[] {
    const asked = this.asked!;
    const strings = uiLocale.strings;
    if (asked.kind === 'plan') {
      const list: ChatChoice[] = asked.choices?.length ? asked.choices.map((c) => ({ ...c })) : [{ value: 'yes', label: strings.chatPlanApprove }];
      list.push({ value: 'no', label: strings.chatPlanKeep, asks: strings.chatPlanHint });
      return list;
    }
    const list: ChatChoice[] = [{ value: 'yes', label: strings.chatAllow }];
    const always = asked.permission?.always;
    if (always) list.push({ value: 'always', label: always });
    list.push({ value: 'no', label: strings.chatDeny, asks: strings.chatDenyHint });
    return list;
  }

  /** Choice `i` was taken: one that asks for a text opens the box first, and goes with what it holds. */
  private take(i: number): void {
    const asked = this.asked;
    const item = this.items[i];
    if (!asked || !item) return;
    if (item.asks && !(this.boxFor === i && this.box.isVisible)) {
      this.boxFor = i;
      this.box.placeholder = item.asks;
      kept(this.box, true);
      this.drawTaken();
      this.box.focus();
      return;
    }
    const said = item.asks ? this.box.value?.trim() || undefined : undefined;
    this.answered(asked, asked.kind === 'plan' ? { choice: item.value, text: said } : { choice: item.value as ChatPermissionAnswer['choice'], text: said });
  }

  /** The choice the open box is for is marked as taken. */
  private drawTaken(): void {
    const open = this.box.isVisible;
    this.buttons.forEach((button, k) => mark(button, 'data-checked', open && k === this.boxFor));
  }

  private key(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.stop();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || focusInTextField(e)) return;
    const count = this.buttons.length;
    const n = Number(e.key);
    if (e.key.length === 1 && n >= 1 && n <= count) {
      e.preventDefault();
      focusOn(this.buttons[n - 1]);
      this.take(n - 1);
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const at = this.buttons.findIndex((b) => b.motif.isEventFrom(e));
    if (at < 0) return;
    e.preventDefault();
    focusOn(this.buttons[(at + (e.key === 'ArrowDown' ? 1 : count - 1)) % count]);
  }
}
