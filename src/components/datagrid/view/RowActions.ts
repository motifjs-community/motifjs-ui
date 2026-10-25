import { moreMark } from '../../../core/glyphs';
import { createActionButton, fillActionButton } from './action-button';
import type { ActionWidths } from './ActionWidths';
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
  private readonly buttons: HTMLButtonElement[] = [];
  private more: HTMLButtonElement | null = null;

  constructor(
    readonly cell: HTMLElement,
    private readonly widths: ActionWidths,
  ) {}

  draw(list: ResolvedAction<T>[], width: number, more: { label: string; hint: string }, display: 'auto' | 'menu') {
    const shown = this.fit(list, width, display);
    this.shown = list.filter((a) => shown.has(a));
    this.overflow = list.filter((a) => !shown.has(a));
    while (this.buttons.length < this.shown.length) {
      const button = createActionButton();
      this.buttons.push(button);
      this.cell.insertBefore(button, this.more);
    }
    this.buttons.forEach((button, i) => {
      const a = this.shown[i];
      button.hidden = !a;
      if (a) fillActionButton(button, a);
    });
    if (this.overflow.length && !this.more) this.more = this.createMore();
    if (this.more) {
      this.more.hidden = !this.overflow.length;
      this.more.setAttribute('aria-label', more.label);
      this.more.dataset.hint = more.hint;
    }
  }

  /** The buttons that show, the "more" button last: what Left and Right move between. */
  focusables(): HTMLButtonElement[] {
    const out = this.buttons.filter((b) => !b.hidden);
    if (this.more && !this.more.hidden) out.push(this.more);
    return out;
  }

  /** The action of a button; `'more'` for the "more" button. */
  actionOf(el: Element): ResolvedAction<T> | 'more' | null {
    if (el === this.more) return 'more';
    const i = this.buttons.indexOf(el as HTMLButtonElement);
    return i >= 0 ? (this.shown[i] ?? null) : null;
  }

  private createMore(): HTMLButtonElement {
    const more = createActionButton();
    more.classList.add('mx-data-grid__more');
    more.setAttribute('aria-haspopup', 'menu');
    const icon = document.createElement('span');
    icon.className = 'mx-button__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.append(moreMark());
    more.append(icon);
    this.cell.append(more);
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
