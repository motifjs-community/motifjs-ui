import { onLookChanged } from './look-watch';

/**
 * What the design language decides for a control that is not told: keywords read from the control's
 * slots on its own element (`--_button-variant: ghost`), so the place a control sits in can decide them
 * too (a toolbar's buttons, a list's search box). Read once the control is in the page and again when
 * the language, theme or density changes; `changed` runs when a value differs.
 */
export class LanguageLook<K extends string> {
  private readonly values = new Map<K, string | null>();

  constructor(
    private readonly element: Element,
    private readonly tokens: Record<K, string>,
    private readonly changed: () => void,
  ) {}

  /** The language's keyword, or null before it is read or when the token is not there. */
  get(name: K): string | null {
    return this.values.get(name) ?? null;
  }

  read(): void {
    if (!this.element.isConnected) return;
    const style = getComputedStyle(this.element);
    let differs = false;
    for (const name of Object.keys(this.tokens) as K[]) {
      const value = style.getPropertyValue(this.tokens[name]).trim() || null;
      if (value === this.get(name)) continue;
      this.values.set(name, value);
      differs = true;
    }
    if (differs) this.changed();
  }

  /** Reads again on every change of language, theme or density; returns the function that stops it. */
  watch(): () => void {
    return onLookChanged(() => this.read());
  }
}
