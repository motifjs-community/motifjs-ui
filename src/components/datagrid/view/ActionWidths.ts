import type { Component, ComponentBase } from '@motifx/core';
import { glyphPart, part, removePart } from '../../../core/draw-parts';
import { boxOf, canMeasure, measure, measureAfterDrawn, styleOf } from '../../../core/measure';
import { actionKey, createActionButton, fillActionButton } from './action-button';
import type { ResolvedAction } from './resolved-action';

const NO_FRAME = Object.freeze({ padding: 0, gap: 0, more: 0 });

/**
 * Widths of action buttons, measured once per action (its id, text and look) in a hidden cell and
 * kept, so fitting a row's buttons only adds numbers: scrolling triggers no layout. An action not
 * measured yet counts 0 and is measured once the page is drawn, with everything asked in that frame:
 * read then, it lays nothing out. `waiting` tells while it waits (the rows keep their buttons out of
 * sight meanwhile) and `measured` then asks the rows to fit their buttons again. A width of 0 (the
 * grid is not shown yet) is not kept.
 */
export class ActionWidths {
  private readonly widths = new Map<string, number>();
  private frameSize: { padding: number; gap: number; more: number } | null = null;
  private box: Component<HTMLDivElement> | null = null;
  /** Buttons waiting in the hidden cell for the next read, by what they show. */
  private readonly probes = new Map<string, Component<HTMLButtonElement>>();
  /** The "more" button waiting for the next read, with the cell's padding and gap. */
  private moreProbe: Component<HTMLButtonElement> | null = null;
  /** Takes back the read that waits for the page to be drawn. */
  private pending: (() => void) | null = null;

  constructor(
    private readonly host: () => ComponentBase | null,
    /** Runs after new widths are kept. */
    private readonly measured: () => void = () => {},
    /** Tells whether buttons wait to be measured. */
    private readonly waiting: (on: boolean) => void = () => {},
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
    this.ask(box);
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
    this.ask(box);
    return NO_FRAME;
  }

  /** One read for everything asked before the page is drawn; a window that lays nothing out (a test document) reads with its next round. */
  private ask(box: Component<HTMLDivElement>) {
    if (!canMeasure(box)) {
      measure(box, this.read, this.write);
      return;
    }
    if (this.pending) return;
    this.pending = measureAfterDrawn(box, this.read, this.write);
    this.waiting(true);
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
    if (this.pending) {
      this.pending = null;
      this.waiting(false);
    }
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
