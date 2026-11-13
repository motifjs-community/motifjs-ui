import { read, type ComponentBase } from '@motifx/core';
import { Tooltip } from '../../tooltip/Tooltip';
import type { TooltipTarget } from '../../tooltip/tooltip-target';
import { mark } from '../../../core/part-writes';
import { boxOf, isInPage, measure } from '../../../core/measure';
import type { CellTipTarget } from './cell-tip-target';

/** Cells that hold buttons, not text. */
const OWN = ['mx-data-grid__actions', 'mx-data-grid__select'];

/** The tip of a header title or a summary cell: its `data-error` message, its `data-hint`, and its text unless it holds buttons. */
export function tipOfPart(part: ComponentBase): CellTipTarget {
  const message = () => part.attr.get('data-error') ?? '';
  const hint = () => part.attr.get('data-hint') ?? '';
  if (OWN.some((name) => part.class.has(name))) return { part, message, hint };
  return { part, message, hint, text: () => (part.element as Element).textContent ?? '' };
}

/**
 * The full text of a cell or header title cut off with an ellipsis, the message of a cell with an
 * error, or the hint of an action button, in the kit's `Tooltip`: after the pointer rests on it a
 * moment, or at once when it gets keyboard focus. Whether the text is cut off is measured only then.
 */
export class CellTip {
  private readonly tip: Tooltip;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private current: TooltipTarget | null = null;
  /** The part whose text is measured now, and whether its tip then waits for the pointer to rest. */
  private checking: { target: CellTipTarget; rest: boolean } | null = null;
  private stopCheck: (() => void) | null = null;

  constructor(
    private readonly owner: ComponentBase,
    /** Milliseconds the pointer rests before the tip shows. */
    private readonly delay: () => number,
  ) {
    this.tip = new Tooltip({ showOn: 'manual', placement: 'bottom-start' });
    this.tip.class.add('mx-data-grid__tip');
    owner.controls.add(this.tip);
  }

  /** The pointer is on a cell, a header title or a button of the grid; `null` when it is on none of them. */
  hovered(target: CellTipTarget | null) {
    const part = target?.part ?? null;
    if (part === this.current) return;
    this.hide();
    if (!target) return;
    this.current = part;
    this.openIfWorth(target, true);
  }

  /** A cell or a header title got keyboard focus. */
  focused(target: CellTipTarget | null) {
    this.hide();
    if (!target) return;
    this.current = target.part;
    this.openIfWorth(target, false);
  }

  /** A cell or a header got keyboard focus: a header shows the tip of its title. */
  focus(part: ComponentBase) {
    const target = part.class.has('mx-data-grid__header-cell') ? (part.controls.items.find((c) => c.class.has('mx-data-grid__title')) ?? null) : part;
    this.focused(target ? tipOfPart(target) : null);
  }

  hide() {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.stopCheck?.();
    this.stopCheck = null;
    this.checking = null;
    this.current = null;
    if (this.tip.opened) this.tip.close();
  }

  /** Opens the tip of a part that has something to show: a message, a hint, or text that is cut off, measured with the window's next reads. */
  private openIfWorth(target: CellTipTarget, rest: boolean) {
    if (read(target.message) || read(target.hint)) this.open(target, rest);
    else if (target.text !== undefined) {
      this.checking = { target, rest };
      this.stopCheck = measure(this.owner, this.readCut, this.writeCut);
    }
  }

  private readonly readCut = (): boolean => {
    const part = this.checking?.target.part;
    if (!part || !isInPage(part)) return false;
    const box = boxOf(part);
    return box.scrollWidth > box.clientWidth + 1;
  };

  private readonly writeCut = (cut: boolean) => {
    const checking = this.checking;
    this.checking = null;
    this.stopCheck = null;
    if (cut && checking && checking.target.part === this.current) this.open(checking.target, checking.rest);
  };

  private open(target: CellTipTarget, rest: boolean) {
    if (rest) this.timer = setTimeout(() => this.showTip(target), Math.max(0, this.delay()));
    else this.showTip(target);
  }

  private showTip(target: CellTipTarget) {
    if (!isInPage(target.part)) return;
    const message = read(target.message) ?? '';
    this.tip.text = message || read(target.hint) || (read(target.text) ?? '');
    mark(this.tip, 'data-error', !!message);
    this.tip.target = target.part;
    this.tip.open();
  }
}
