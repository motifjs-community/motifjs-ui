import { onNodesMoved } from './document-watch';

/**
 * A `ResizeObserver` that follows its targets into another window. A browser's observer only
 * reports elements of its own window's documents: an element moved into a window the app opened
 * would never be reported again. This one keeps an observer per window and moves each target to
 * the observer of the window it is in now. Where the browser has no `ResizeObserver` it does
 * nothing.
 */
export class ResizeWatch {
  private readonly observers = new Map<Window, ResizeObserver>();
  private readonly targets = new Map<Element, { view: Window | null; options?: ResizeObserverOptions }>();
  private stopMoves: (() => void) | null = null;

  constructor(private readonly callback: (entries: ResizeObserverEntry[]) => void) {}

  observe(target: Element, options?: ResizeObserverOptions): void {
    this.unobserve(target);
    const view = this.attach(target, options);
    this.targets.set(target, { view, options });
    this.stopMoves ??= onNodesMoved(() => this.recheck());
  }

  unobserve(target: Element): void {
    const known = this.targets.get(target);
    if (!known) return;
    if (known.view) this.observers.get(known.view)?.unobserve(target);
    this.targets.delete(target);
    if (!this.targets.size) this.stopWatching();
  }

  disconnect(): void {
    for (const observer of this.observers.values()) observer.disconnect();
    this.observers.clear();
    this.targets.clear();
    this.stopWatching();
  }

  /** Targets now in another window go to that window's observer. */
  private recheck(): void {
    for (const [target, known] of this.targets) {
      const view = target.ownerDocument.defaultView;
      if (view === known.view) continue;
      if (known.view) this.observers.get(known.view)?.unobserve(target);
      known.view = this.attach(target, known.options);
    }
  }

  private stopWatching(): void {
    this.stopMoves?.();
    this.stopMoves = null;
  }

  private attach(target: Element, options?: ResizeObserverOptions): Window | null {
    const view = target.ownerDocument.defaultView;
    const Observer = view?.ResizeObserver;
    if (!view || typeof Observer !== 'function') return null;
    let observer = this.observers.get(view);
    if (!observer) {
      observer = new Observer((entries) => this.callback(entries));
      this.observers.set(view, observer);
    }
    observer.observe(target, options);
    return view;
  }
}
