import type { Component } from '@motifx/core';
import { loose, part } from '../../core/draw-parts';
import { glyph } from '../../core/glyphs';
import { put, text } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import { TextBox } from '../textbox/TextBox';

/**
 * The search over the conversation, at its top: the text to find, which result shows of how many, a button to the
 * result above and one to the result below, and one that closes it. The conversation ends at the bottom, as a
 * terminal's: Enter goes up to the older result, Shift+Enter down to the newer one, and Escape closes it.
 */
export class ChatSearchBar {
  readonly row: Component<HTMLDivElement>;
  readonly box: TextBox;
  private readonly count: Component<HTMLSpanElement>;
  private readonly previous: Button;
  private readonly next: Button;
  private readonly close: Button;
  private shown = { at: -1, count: 0, query: '' };

  constructor(find: (query: string) => void, move: (step: number) => void, close: () => void) {
    this.row = loose<HTMLDivElement>('div', 'mx-chat__search');
    put(this.row, 'role', 'search');
    this.box = new TextBox({
      type: 'search',
      labelMode: 'hidden',
      onValueChanged: (e) => find(e.value ?? ''),
      onEnter: (e) => move(e.event.shiftKey ? 1 : -1)
    });
    this.box.class.add('mx-chat__search-box');
    this.row.controls.add(this.box);
    this.count = part<HTMLSpanElement>(this.row, 'span', 'mx-chat__search-count');
    put(this.count, 'aria-live', 'polite');
    // Their variants and sizes come from their place.
    this.previous = this.button('chevron-up', 'mx-chat__search-previous', () => move(-1));
    this.next = this.button('chevron-down', 'mx-chat__search-next', () => move(1));
    this.close = this.button('dismiss', 'mx-chat__search-close', close);
    this.row.motif.on('keydown', (_sender, e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      close();
    });
    this.drawTexts();
  }

  /** The text searched for. */
  get query(): string {
    return this.box.value ?? '';
  }

  /** Writes `query` in the box without searching: the chat searches it itself. */
  set query(value: string) {
    this.box.value = value;
  }

  focus(): void {
    this.box.focus();
    this.box.select();
  }

  /** Which result shows (`at` from 0) of how many found for `query`. */
  drawCount(at: number, count: number, query: string): void {
    this.shown = { at, count, query };
    const strings = uiLocale.strings;
    text(this.count, !query.trim() ? '' : count ? uiLocale.text('chatSearchCount', { index: at + 1, count }) : strings.chatSearchNone);
    this.previous.enabled = count > 0;
    this.next.enabled = count > 0;
  }

  drawTexts(): void {
    const strings = uiLocale.strings;
    this.box.placeholder = strings.chatSearch;
    this.box.label = strings.chatSearch;
    this.name(this.previous, strings.chatSearchPrevious);
    this.name(this.next, strings.chatSearchNext);
    this.name(this.close, strings.close);
    this.drawCount(this.shown.at, this.shown.count, this.shown.query);
  }

  private button(icon: string, className: string, click: () => void): Button {
    const button = new Button({ icon: glyph(icon) });
    button.class.add(className);
    // The box keeps the focus while the results are gone through.
    button.motif.on('pointerdown', (_sender, e) => e.preventDefault());
    button.motif.on('click', click);
    this.row.controls.add(button);
    return button;
  }

  private name(button: Button, said: string): void {
    put(button, 'aria-label', said);
    button.hint = said;
  }
}
