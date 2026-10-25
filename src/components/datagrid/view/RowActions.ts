import { moreMark } from '../../../core/glyphs';
import { createActionButton, fillActionButton } from './action-button';
import type { ActionWidths } from './ActionWidths';
import type { ResolvedAction } from './resolved-action';

/**
 * The buttons of one pooled row's actions cell. The first actions that fit the column show as
 * buttons, in order; the rest go into the "more" menu at the end. Buttons are reused as the row
 * shows other rows.
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

  draw(list: ResolvedAction<T>[], width: number, moreLabel: string) {
    const fit = this.fit(list, width);
    this.shown = list.slice(0, fit);
    this.overflow = list.slice(fit);
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
      this.more.setAttribute('aria-label', moreLabel);
      this.more.dataset.hint = moreLabel;
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

  /** How many of the actions show as buttons in `width` pixels: all, or as many as fit next to the "more" button. */
  private fit(list: ResolvedAction<T>[], width: number): number {
    if (!list.length) return 0;
    const frame = this.widths.frame();
    const sizes = list.map((a) => this.widths.width(a));
    const room = width - frame.padding;
    const all = sizes.reduce((sum, w) => sum + w, 0) + frame.gap * (sizes.length - 1);
    if (all <= room) return list.length;
    const budget = room - frame.more - frame.gap;
    let used = 0;
    let n = 0;
    for (const w of sizes) {
      const next = used + (n ? frame.gap : 0) + w;
      if (next > budget) break;
      used = next;
      n++;
    }
    return n;
  }
}
