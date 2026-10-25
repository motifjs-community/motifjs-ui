import { moreMark } from '../../../core/glyphs';
import { actionKey, createActionButton, fillActionButton } from './action-button';
import type { ResolvedAction } from './resolved-action';

/**
 * Widths of action buttons, measured once per action (its id, text and look) in a hidden cell and
 * kept, so fitting a row's buttons only adds numbers: scrolling triggers no layout. A width of 0
 * (the grid is not shown yet) is not kept.
 */
export class ActionWidths {
  private readonly widths = new Map<string, number>();
  private frameSize: { padding: number; gap: number; more: number } | null = null;
  private box: HTMLElement | null = null;

  constructor(private readonly host: () => HTMLElement | null) {}

  /** Measure again (the density changed). */
  clear() {
    this.widths.clear();
    this.frameSize = null;
  }

  width<T>(a: ResolvedAction<T>): number {
    const key = actionKey(a);
    const known = this.widths.get(key);
    if (known !== undefined) return known;
    const box = this.cell();
    if (!box) return 0;
    const button = createActionButton();
    fillActionButton(button, a);
    box.append(button);
    const w = button.offsetWidth;
    button.remove();
    if (w > 0) this.widths.set(key, w);
    return w;
  }

  /** The cell's padding (both sides), the gap between buttons and the width of the "more" button. */
  frame(): { padding: number; gap: number; more: number } {
    if (this.frameSize) return this.frameSize;
    const box = this.cell();
    if (!box || typeof getComputedStyle !== 'function') return { padding: 0, gap: 0, more: 0 };
    const style = getComputedStyle(box);
    const more = createActionButton();
    more.append(moreMark());
    box.append(more);
    const size = {
      padding: (parseFloat(style.paddingInlineStart) || 0) + (parseFloat(style.paddingInlineEnd) || 0),
      gap: parseFloat(style.columnGap) || 0,
      more: more.offsetWidth,
    };
    more.remove();
    if (size.more > 0) this.frameSize = size;
    return size;
  }

  private cell(): HTMLElement | null {
    const host = this.host();
    if (!host) return null;
    if (!this.box || this.box.parentElement !== host) {
      this.box = document.createElement('div');
      this.box.className = 'mx-data-grid__cell mx-data-grid__actions';
      host.append(this.box);
    }
    return this.box;
  }
}
