import type { Component } from '@motifx/core';
import { loose, part } from '../../core/draw-parts';
import { focusInTextField, focusOn } from '../../core/focus';
import { nextId } from '../../core/next-id';
import { kept, put, text } from '../../core/part-writes';
import { TextBox } from '../textbox/TextBox';

/** A choice of a request; `asks`: it takes a text too, and this is the box's placeholder. */
export interface ChatChoice {
  value: string;
  label: string;
  asks?: string;
}

/**
 * The choices of a request under its question, numbered: a click, or the number's key while the focus is among them,
 * takes one, and the arrow keys move between them. A choice that asks for a text opens a box under it: Enter there
 * takes the choice with what was written, Escape goes back to it.
 */
export class ChatChoices {
  readonly row: Component<HTMLDivElement>;
  private readonly title: Component<HTMLDivElement>;
  private readonly buttons: Component<HTMLButtonElement>[] = [];
  private readonly labels: Component<HTMLSpanElement>[] = [];
  private box: TextBox | null = null;
  private boxFor = -1;

  constructor(said: string, private items: ChatChoice[], private readonly chosen: (value: string, text?: string) => void) {
    this.row = loose<HTMLDivElement>('div', 'mx-chat__choices');
    put(this.row, 'role', 'group');
    this.title = part<HTMLDivElement>(this.row, 'div', 'mx-chat__choices-title');
    const id = nextId('mx-chat-choices');
    put(this.title, 'id', id);
    put(this.row, 'aria-labelledby', id);
    text(this.title, said);
    items.forEach((item, i) => {
      const button = part<HTMLButtonElement>(this.row, 'button', 'mx-chat__choice');
      put(button, 'type', 'button');
      text(part<HTMLSpanElement>(button, 'span', 'mx-chat__choice-key'), String(i + 1));
      const label = part<HTMLSpanElement>(button, 'span', 'mx-chat__choice-label');
      text(label, item.label);
      button.motif.on('click', () => this.take(i));
      this.buttons.push(button);
      this.labels.push(label);
    });
    this.row.motif.on('keydown', (_, e: KeyboardEvent) => this.key(e));
  }

  /** The first choice takes the focus. */
  focus(): boolean {
    focusOn(this.buttons[0]);
    return true;
  }

  /** The language changed: the question and the choices in it. */
  drawTexts(said: string, items: ChatChoice[]): void {
    this.items = items;
    text(this.title, said);
    items.forEach((item, i) => text(this.labels[i], item.label));
    if (this.box) this.box.placeholder = items[this.boxFor]?.asks ?? '';
  }

  private take(i: number): void {
    const item = this.items[i];
    if (!item.asks) {
      this.chosen(item.value);
    } else if (this.box?.isVisible && this.boxFor === i) {
      this.chosen(item.value, this.box.value.trim() || undefined);
    } else {
      this.openBox(i);
    }
  }

  private openBox(i: number): void {
    if (!this.box) {
      this.box = new TextBox({ onEnter: () => this.take(this.boxFor) });
      this.box.class.add('mx-chat__choice-box');
      this.box.motif.on('keydown', (_, e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        e.preventDefault();
        e.stopPropagation();
        kept(this.box, false);
        focusOn(this.buttons[this.boxFor]);
      });
      // Under its choice: the title, then the buttons.
      this.row.controls.insert(i + 2, this.box);
    }
    this.boxFor = i;
    this.box.placeholder = this.items[i].asks ?? '';
    kept(this.box, true);
    this.box.focus();
  }

  private key(e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey || e.altKey || focusInTextField(e)) return;
    const count = this.items.length;
    const n = Number(e.key);
    if (e.key.length === 1 && n >= 1 && n <= count) {
      e.preventDefault();
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
