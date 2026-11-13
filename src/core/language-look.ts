import type { ComponentBase } from '@motifx/core';
import { measure, onLookChange, readAgain, styleOf } from './measure';

/**
 * What the design language decides for a control that is not told: keywords read from the control's slots on its own
 * element (`--_button-variant: ghost`), so the place a control sits in can decide them too (a toolbar's buttons, a list's
 * search box). Read with the reads of the control's window when asked (once it is in the page, after a change of the
 * look), every control of a window in one read phase; `changed` runs in the write when a value differs. It follows no
 * lifecycle of its own, so a list of many controls pays for no subscription per control: a control found out of the page
 * reads again once core places it.
 */
export class LanguageLook<K extends string> {
  private readonly values = new Map<K, string | null>();
  private waiting = false;

  constructor(
    private readonly component: ComponentBase,
    private readonly tokens: Record<K, string>,
    private readonly changed: () => void,
  ) {}

  /** The language's keyword, or null before it is read or when the token is not there. */
  get(name: K): string | null {
    return this.values.get(name) ?? null;
  }

  /** Reads with the next reads of the control's window. */
  read(): void {
    measure(this.component, this.take, this.apply);
  }

  /** Reads at once, in the write of a fit that tries a layout and measures it: counted as a read after writes. */
  readNow(): void {
    this.apply(readAgain(this.take));
  }

  /** Reads several at once with one layout, after a fit wrote all it tries (each control's look would cost its own). */
  static readNowTogether(looks: readonly LanguageLook<string>[]): void {
    if (!looks.length) return;
    const reads = readAgain(() => looks.map((look) => look.take()));
    looks.forEach((look, i) => look.apply(reads[i]));
  }

  /** Reads again after every change of the look; returns what stops it. */
  watch(): () => void {
    return onLookChange(this.component, () => this.read());
  }

  private readonly take = (): Record<string, string> | null => {
    const read = styleOf(this.component, ['display', ...Object.values<string>(this.tokens)]);
    // Out of the page nothing is worked out, its display neither.
    return read.display ? read : null;
  };

  private readonly apply = (read: Record<string, string> | null): void => {
    if (!read) return this.again();
    let differs = false;
    for (const name of Object.keys(this.tokens) as K[]) {
      const value = read[this.tokens[name]] || null;
      if (value === this.get(name)) continue;
      this.values.set(name, value);
      differs = true;
    }
    if (differs) this.changed();
  };

  /** Found out of the page: reads once core places it again. */
  private again(): void {
    const component = this.component;
    if (this.waiting || component.isDisposed) return;
    this.waiting = true;
    void component.motif.on('x:mounted', () => {
      this.waiting = false;
      this.read();
    });
  }
}
