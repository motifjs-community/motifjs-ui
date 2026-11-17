import type { Component } from '@motifx/core';
import { glyphPart, part } from '../../core/draw-parts';
import { put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { entryFrame, type ChatEntry } from './chat-entry';
import type { ChatTodoPart } from './chat-part';

const GLYPHS = { pending: 'radio', active: 'chevron-end', done: 'check' } as const;

interface TodoRow {
  row: Component<HTMLDivElement>;
  glyph: Component<HTMLSpanElement>;
  label: Component<HTMLSpanElement>;
}

/** The model's to-do list: each task with its state. A new version of the list changes the rows in place. */
export class ChatTodoEntry implements ChatEntry {
  readonly row: Component<HTMLDivElement>;
  private readonly title: Component<HTMLDivElement>;
  private readonly list: Component<HTMLDivElement>;
  private readonly rows: TodoRow[] = [];

  constructor(private readonly todo: ChatTodoPart) {
    const { row, main } = entryFrame('todo');
    this.row = row;
    this.title = part<HTMLDivElement>(main, 'div', 'mx-chat__todo-title');
    this.list = part<HTMLDivElement>(main, 'div', 'mx-chat__todo-list');
    put(this.list, 'role', 'list');
    this.update();
    this.drawTexts();
  }

  append(): void {}

  update(): void {
    const items = this.todo.items;
    while (this.rows.length > items.length) this.list.controls.remove(this.rows.pop()!.row);
    items.forEach((item, i) => {
      let row = this.rows[i];
      if (!row) {
        const el = part<HTMLDivElement>(this.list, 'div', 'mx-chat__todo-item');
        put(el, 'role', 'listitem');
        row = { row: el, glyph: glyphPart(el, GLYPHS[item.status], 'mx-chat__todo-glyph'), label: part<HTMLSpanElement>(el, 'span', 'mx-chat__todo-text') };
        this.rows.push(row);
      }
      put(row.row, 'data-status', item.status);
      put(row.glyph, 'data-icon', GLYPHS[item.status]);
      text(row.label, item.text);
    });
  }

  drawTexts(): void {
    text(this.title, uiLocale.strings.chatTasks);
  }
}
