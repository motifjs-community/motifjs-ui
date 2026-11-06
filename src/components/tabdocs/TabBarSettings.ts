import { createSignal, read, type Bind } from '@motifx/core';
import type { TabBarButton } from './tab-bar-button';
import type { TabBarButtonSize } from './tab-bar-button-size';
import type { TabLayoutBar } from './tab-layout-bar';
import type { TabSize } from './tab-size';

/**
 * The appearance of the strips of a dock area or floating window. Each setting is a value or a
 * tracked function. `null`, the default, uses the manager's `compact…` prop of the same name.
 */
export class TabBarSettings {
  private readonly own = {
    scrollButtons: createSignal<Bind<boolean | null>>(null),
    tabSize: createSignal<Bind<TabSize | null>>(null),
    tabMinWidth: createSignal<Bind<number | null>>(null),
    singleTabTitle: createSignal<Bind<boolean | null>>(null),
    barButtons: createSignal<Bind<readonly TabBarButton[] | 'all' | 'auto' | null>>(null),
    barButtonSize: createSignal<Bind<TabBarButtonSize | null>>(null),
  };

  /** Shows buttons that scroll its strips when the tabs do not fit. Reactive. */
  get scrollButtons(): boolean | null {
    return read(this.own.scrollButtons.value);
  }
  set scrollButtons(value: Bind<boolean | null>) {
    this.own.scrollButtons.value = value;
  }
  /** How wide its tabs are. Reactive. */
  get tabSize(): TabSize | null {
    return read(this.own.tabSize.value);
  }
  set tabSize(value: Bind<TabSize | null>) {
    this.own.tabSize.value = value;
  }
  /** The minimum width of its tabs, in pixels. Reactive. */
  get tabMinWidth(): number | null {
    return read(this.own.tabMinWidth.value);
  }
  set tabMinWidth(value: Bind<number | null>) {
    this.own.tabMinWidth.value = value;
  }
  /** Shows a strip with one document as a title. Reactive. */
  get singleTabTitle(): boolean | null {
    return read(this.own.singleTabTitle.value);
  }
  set singleTabTitle(value: Bind<boolean | null>) {
    this.own.singleTabTitle.value = value;
  }
  /**
   * The built-in buttons that stay in its toolbars, and the others move into the "…" menu. `'all'` keeps
   * every button, as in the document groups. `'auto'` works as in the manager's `compactBarButtons`.
   * Reactive.
   */
  get barButtons(): readonly TabBarButton[] | 'all' | 'auto' | null {
    return read(this.own.barButtons.value);
  }
  set barButtons(value: Bind<readonly TabBarButton[] | 'all' | 'auto' | null>) {
    this.own.barButtons.value = value;
  }
  /** The size of the buttons in its toolbars. Reactive. */
  get barButtonSize(): TabBarButtonSize | null {
    return read(this.own.barButtonSize.value);
  }
  set barButtonSize(value: Bind<TabBarButtonSize | null>) {
    this.own.barButtonSize.value = value;
  }

  /** @internal The settings given as plain values, for `saveLayout`; a function is the app's to give again. */
  savedBar(): TabLayoutBar | undefined {
    const saved: Record<string, unknown> = {};
    for (const [name, signal] of Object.entries(this.own)) {
      const value = signal.peek();
      if (value !== null && typeof value !== 'function') saved[name] = value;
    }
    return Object.keys(saved).length ? (saved as TabLayoutBar) : undefined;
  }

  /** @internal Puts back what `savedBar` wrote. */
  restoreBar(saved: TabLayoutBar | undefined): void {
    if (!saved) return;
    for (const [name, signal] of Object.entries(this.own) as [keyof TabLayoutBar, { value: unknown }][]) {
      if (saved[name] !== undefined) signal.value = saved[name];
    }
  }
}
