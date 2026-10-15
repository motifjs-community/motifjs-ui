import { reactive, type ComponentBase } from '@motifx/core';

/** Every piece of text the components write themselves (labels of caption buttons, …). */
export interface UiStrings {
  close: string;
  minimize: string;
  maximize: string;
  restore: string;
  /** Accessible name of a SplitContainer's splitter. */
  splitter: string;
}

export const enStrings: UiStrings = {
  close: 'Close',
  minimize: 'Minimize',
  maximize: 'Maximize',
  restore: 'Restore',
  splitter: 'Resize panes',
};

export const trStrings: UiStrings = {
  close: 'Kapat',
  minimize: 'Simge durumuna küçült',
  maximize: 'Ekranı kapla',
  restore: 'Önceki boyutuna getir',
  splitter: 'Bölmeleri yeniden boyutlandır',
};

/**
 * The component texts, reactive: switching the language updates every label
 * already on screen. Register your own instance as a DI singleton to scope it
 * to an application; components fall back to the shared {@link uiLocale}.
 *
 * @example
 * uiLocale.set(trStrings);
 * // or per app:
 * builder.services.addSingleton(UiLocale, () => new UiLocale(trStrings));
 */
export class UiLocale {
  readonly strings: UiStrings;

  constructor(strings: Partial<UiStrings> = {}) {
    this.strings = reactive({ ...enStrings, ...strings });
  }

  /** Replaces some or all texts; bound labels update in place. */
  set(strings: Partial<UiStrings>): void {
    Object.assign(this.strings, strings);
  }
}

/** The shared fallback used when no `UiLocale` is registered in DI. */
export const uiLocale = new UiLocale();

/** The locale a component should use: its app's DI registration, else the shared one. */
export function localeOf(c: ComponentBase): UiLocale {
  try {
    return (c.getService(UiLocale) as UiLocale | null) ?? uiLocale;
  } catch {
    // No application (tests, a component used before `run`): the shared one.
    return uiLocale;
  }
}
