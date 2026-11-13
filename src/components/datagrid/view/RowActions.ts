import type { Component, ComponentBase } from '@motifx/core';
import { glyphPart, part } from '../../../core/draw-parts';
import { kept, put } from '../../../core/part-writes';
import { orderControls } from '../../../core/order-controls';
import { createActionButton, fillActionButton } from './action-button';
import type { ActionWidths } from './ActionWidths';
import type { CellTipTarget } from './cell-tip-target';
import type { ResolvedAction } from './resolved-action';

/**
 * The buttons of one pooled row's actions cell. The first actions that fit the column show as
 * buttons, in order; the rest go into the "more" menu at the end. An action's `menu` keeps it in the
 * menu always or never; the `'menu'` display puts every other one there. Buttons are reused as the
 * row shows other rows.
 */
export class RowActions<T> {
  /** Actions shown as buttons, in order. */
  shown: ResolvedAction<T>[] = [];
  /** Actions of the "more" menu. */
  overflow: ResolvedAction<T>[] = [];
  private readonly buttons: Component<HTMLButtonElement>[] = [];
  private more: Component<HTMLButtonElement> | null = null;
  private moreHint = '';

  constructor(
    readonly cell: Component<HTMLDivElement>,
    private readonly widths: ActionWidths,
  ) {}

  draw(list: ResolvedAction<T>[], width: number, more: { label: string; hint: string }, display: 'auto' | 'menu') {
    const shown = this.fit(list, width, display);
    this.shown = list.filter((a) => shown.has(a));
    this.overflow = list.filter((a) => !shown.has(a));
    if (this.buttons.length < this.shown.length) {
      while (this.buttons.length < this.shown.length) this.buttons.push(createActionButton());
      // The buttons first, in order, the "more" button after them.
      orderControls(this.cell, this.buttons);
    }
    this.buttons.forEach((button, i) => {
      const a = this.shown[i];
      kept(button, !!a);
      if (a) fillActionButton(button, a);
    });
    if (this.overflow.length && !this.more) this.more = this.createMore();
    this.moreHint = more.hint;
    if (this.more) {
      kept(this.more, this.overflow.length > 0);
      put(this.more, 'aria-label', more.label);
      put(this.more, 'data-hint', more.hint);
    }
  }

  /** The buttons that show, in order, the "more" button last: what Left and Right move between. */
  buttonParts(): Component<HTMLButtonElement>[] {
    const out = this.buttons.slice(0, this.shown.length);
    if (this.more && this.overflow.length) out.push(this.more);
    return out;
  }

  /** The action of a button; `'more'` for the "more" button. */
  actionOfPart(part: ComponentBase): ResolvedAction<T> | 'more' | null {
    if (part === this.more) return 'more';
    const i = this.buttons.indexOf(part as Component<HTMLButtonElement>);
    return i >= 0 ? (this.shown[i] ?? null) : null;
  }

  /** What the cell tip shows for a button of the cell: its hint, read when the tip opens; `null` for a part that is no shown button or has no hint. */
  tipOf(part: ComponentBase): CellTipTarget | null {
    return this.hintOf(part) ? { part, hint: () => this.hintOf(part) } : null;
  }

  /** The tip of the button an event came from; `null` when it came from none, or from one with no hint. */
  tipFrom(e: Event): CellTipTarget | null {
    const button = this.buttonParts().find((b) => b.motif.isEventFrom(e));
    return button ? this.tipOf(button) : null;
  }

  private hintOf(part: ComponentBase): string {
    const action = this.actionOfPart(part);
    if (action === 'more') return this.overflow.length ? this.moreHint : '';
    return action?.hint ?? '';
  }

  private createMore(): Component<HTMLButtonElement> {
    const more = createActionButton();
    more.class.add('mx-data-grid__more');
    more.attr.add({ 'aria-haspopup': 'menu' });
    const icon = part<HTMLSpanElement>(more, 'span', 'mx-button__icon');
    icon.attr.add({ 'aria-hidden': 'true' });
    glyphPart(icon, 'more');
    this.cell.controls.add(more);
    return more;
  }

  /** The actions that show as buttons in `width` pixels: all when they fit, else the ones kept as buttons and, in order, as many others as fit next to the "more" button. */
  private fit(list: ResolvedAction<T>[], width: number, display: 'auto' | 'menu'): Set<ResolvedAction<T>> {
    const kept = list.filter((a) => a.menu === 'never' || (a.menu === 'auto' && display === 'auto'));
    if (!kept.length) return new Set();
    const frame = this.widths.frame();
    const sizes = new Map(kept.map((a) => [a, this.widths.width(a)]));
    const room = width - frame.padding;
    const all = [...sizes.values()].reduce((sum, w) => sum + w, 0) + frame.gap * (kept.length - 1);
    if (kept.length === list.length && all <= room) return new Set(list);
    const budget = room - frame.more - frame.gap;
    const out = new Set(kept.filter((a) => a.menu === 'never'));
    let used = 0;
    for (const a of out) used += (used ? frame.gap : 0) + sizes.get(a)!;
    for (const a of kept) {
      if (out.has(a)) continue;
      const next = used + (used ? frame.gap : 0) + sizes.get(a)!;
      if (next > budget) break;
      used = next;
      out.add(a);
    }
    return out;
  }
}
