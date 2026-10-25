import type { ComponentBase } from '@motifx/core';
import { Tooltip } from '../../tooltip/Tooltip';

const overflows = (el: Element) => el.scrollWidth > el.clientWidth + 1;

/** The message of a cell with an error (`data-error`), else `''`. */
const messageOf = (el: Element) => el.getAttribute('data-error') ?? '';

/** The tooltip of a button in the grid (`data-hint`), else `''`. */
const hintOf = (el: Element) => el.getAttribute('data-hint') ?? '';

/** Cells that hold buttons, not text. */
const OWN = '.mx-data-grid__actions, .mx-data-grid__select';

/**
 * The full text of a cell or header title cut off with an ellipsis, the message of a cell with an
 * error, or the hint of an action button, in the kit's `Tooltip`: after the pointer rests on it a
 * moment, or at once when it gets keyboard focus. Whether the text is cut off is measured only then.
 */
export class CellTip {
  private readonly tip: Tooltip;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private current: Element | null = null;

  constructor(
    owner: ComponentBase,
    /** Milliseconds the pointer rests before the tip shows. */
    private readonly delay: () => number,
  ) {
    this.tip = new Tooltip({ showOn: 'manual', placement: 'bottom-start' });
    this.tip.element.classList.add('mx-data-grid__tip');
    owner.controls.add(this.tip);
  }

  /** The pointer moved over the grid. */
  hover(e: PointerEvent) {
    const target = (e.target as Element | null)?.closest?.('[data-hint], .mx-data-grid__cell, .mx-data-grid__title') ?? null;
    if (target === this.current) return;
    this.hide();
    if (!target || target.closest('.mx-data-grid__editor') || !this.worth(target)) return;
    this.current = target;
    this.timer = setTimeout(() => this.show(target), Math.max(0, this.delay()));
  }

  /** A cell or a header got keyboard focus. */
  focus(el: HTMLElement) {
    const target = el.classList.contains('mx-data-grid__header-cell') ? el.querySelector('.mx-data-grid__title') : el;
    this.hide();
    if (target && this.worth(target)) {
      this.current = target;
      this.show(target);
    }
  }

  hide() {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.current = null;
    if (this.tip.opened) this.tip.close();
  }

  /** Whether there is something to show: a message, a hint, or text that is cut off. */
  private worth(target: Element): boolean {
    if (messageOf(target) || hintOf(target)) return true;
    return !target.matches(OWN) && overflows(target);
  }

  private show(target: Element) {
    if (!target.isConnected) return;
    const message = messageOf(target);
    this.tip.text = message || hintOf(target) || (target.textContent ?? '');
    this.tip.element.toggleAttribute('data-error', !!message);
    this.tip.target = target;
    this.tip.open();
  }
}
