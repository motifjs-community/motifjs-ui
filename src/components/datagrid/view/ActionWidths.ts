import type { Component, ComponentBase } from '@motifx/core';
import { glyphPart, part, removePart } from '../../../core/draw-parts';
import { boxOf, measure, styleOf } from '../../../core/measure';
import { actionKey, createActionButton, fillActionButton } from './action-button';
import type { ResolvedAction } from './resolved-action';

const NO_FRAME = Object.freeze({ padding: 0, gap: 0, more: 0 });

/**
 * Widths of action buttons, measured once per action (its id, text and look) in a hidden cell and
 * kept, so fitting a row's buttons only adds numbers: scrolling triggers no layout. An action not
 * measured yet counts 0 and is measured with the window's next reads; `measured` then asks the rows
 * to fit their buttons again. A width of 0 (the grid is not shown yet) is not kept.
 */
export class ActionWidths {
  private readonly widths = new Map<string, number>();
  private frameSize: { padding: number; gap: number; more: number } | null = null;
  private box: Component<HTMLDivElement> | null = null;
  /** Buttons waiting in the hidden cell for the next read, by what they show. */
  private readonly probes = new Map<string, Component<HTMLButtonElement>>();
  /** The "more" button waiting for the next read, with the cell's padding and gap. */
  private moreProbe: Component<HTMLButtonElement> | null = null;

  constructor(
    private readonly host: () => ComponentBase | null,
    /** Runs after new widths are kept. */
    private readonly measured: () => void = () => {},
  ) {}

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
    if (!this.probes.has(key)) {
      const button = createActionButton();
      fillActionButton(button, a);
      box.controls.add(button);
      this.probes.set(key, button);
    }
    measure(box, this.read, this.write);
    return 0;
  }

  /** The cell's padding (both sides), the gap between buttons and the width of the "more" button; zeros until measured. */
  frame(): { padding: number; gap: number; more: number } {
    if (this.frameSize) return this.frameSize;
    const box = this.cell();
    if (!box) return NO_FRAME;
    if (!this.moreProbe) {
      const more = createActionButton();
      glyphPart(more, 'more');
      box.controls.add(more);
      this.moreProbe = more;
    }
    measure(box, this.read, this.write);
    return NO_FRAME;
  }

  private readonly read = () => {
    const box = this.box;
    const more = this.moreProbe;
    const style = box && more ? styleOf(box, ['padding-inline-start', 'padding-inline-end', 'column-gap']) : null;
    return {
      buttons: [...this.probes].map(([key, button]) => ({ key, button, width: boxOf(button).offsetWidth })),
      more,
      frame: more && style
        ? {
            padding: (parseFloat(style['padding-inline-start']) || 0) + (parseFloat(style['padding-inline-end']) || 0),
            gap: parseFloat(style['column-gap']) || 0,
            more: boxOf(more).offsetWidth,
          }
        : null,
    };
  };

  private readonly write = (seen: {
    buttons: { key: string; button: Component<HTMLButtonElement>; width: number }[];
    more: Component<HTMLButtonElement> | null;
    frame: { padding: number; gap: number; more: number } | null;
  }) => {
    let kept = false;
    for (const { key, button, width } of seen.buttons) {
      if (this.probes.get(key) === button) this.probes.delete(key);
      removePart(button);
      if (width > 0) {
        this.widths.set(key, width);
        kept = true;
      }
    }
    if (seen.more) {
      if (this.moreProbe === seen.more) this.moreProbe = null;
      removePart(seen.more);
      if (seen.frame && seen.frame.more > 0) {
        this.frameSize = seen.frame;
        kept = true;
      }
    }
    if (kept) this.measured();
  };

  private cell(): Component<HTMLDivElement> | null {
    const host = this.host();
    if (!host) return null;
    if (!this.box || this.box.isDisposed || this.box.parent !== host) {
      for (const button of this.probes.values()) removePart(button);
      removePart(this.moreProbe);
      this.probes.clear();
      this.moreProbe = null;
      this.box = part<HTMLDivElement>(host, 'div', 'mx-data-grid__cell mx-data-grid__actions');
    }
    return this.box;
  }
}
