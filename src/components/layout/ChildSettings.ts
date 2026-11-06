import type { Bind, ComponentBase } from '@motifx/core';
import { follow } from '../../core/follow';

/** What a container does with its children's settings. */
interface ChildSettingsHandler {
  /** A child arrived or one of its settings changed. */
  changed(child: ComponentBase, element: HTMLElement): void;
  /** A child left (moved elsewhere or disposed): undo what `changed` wrote on it. */
  left(child: ComponentBase, element: HTMLElement): void;
}

/**
 * The settings a layout container reads from its children (`dock`, `row`, `grow`…). A child
 * says them in its own props, a value or a tracked function, whatever kind of
 * component it is; code can set them later with `set`. Children added at any time are picked
 * up through the container's own `controladded` event, so nothing watches the DOM and nothing
 * runs on resize.
 */
export class ChildSettings {
  private readonly values = new WeakMap<ComponentBase, Map<string, unknown>>();
  private readonly stops = new WeakMap<ComponentBase, Map<string, () => void>>();
  private readonly tracked = new WeakSet<ComponentBase>();
  private readonly running = new Set<() => void>();
  private reading = false;

  constructor(
    private readonly owner: ComponentBase,
    private readonly names: readonly string[],
    private readonly handler: ChildSettingsHandler,
  ) {
    void owner.motif.on('controladded', (_sender, e: { control: ComponentBase }) => this.add(e.control), false);
    void owner.motif.on('controlremoved', (_sender, e: { control: ComponentBase }) => this.leave(e.control), false);
    owner.motif.setDisposable(() => {
      for (const stop of this.running) stop();
      this.running.clear();
    });
  }

  /**
   * Picks up the children already there. Called once the container has stored this object: the
   * handler reads the settings back through the container.
   */
  addPresent(): this {
    for (const child of this.owner.controls.items) this.add(child);
    return this;
  }

  /** The children that take part, in order. */
  get children(): ComponentBase[] {
    return this.owner.controls.items.filter((child) => this.tracked.has(child));
  }

  get(child: ComponentBase, name: string): unknown {
    return this.values.get(child)?.get(name);
  }

  /** Sets a child's setting programmatically: a value, or a tracked function. */
  set(child: ComponentBase, name: string, value: Bind<unknown>): void {
    if (!this.tracked.has(child)) return;
    this.bind(child, name, value);
    this.handler.changed(child, child.element as HTMLElement);
  }

  private add(child: ComponentBase): void {
    if (this.tracked.has(child) || !(child.element instanceof HTMLElement)) return;
    this.tracked.add(child);
    const props = (child.props ?? {}) as Record<string, unknown>;
    this.reading = true;
    for (const name of this.names) if (props[name] !== undefined) this.bind(child, name, props[name] as Bind<unknown>);
    this.reading = false;
    void child.motif.on('x:disposing', () => this.leave(child));
    this.handler.changed(child, child.element);
  }

  private leave(child: ComponentBase): void {
    if (!this.tracked.has(child)) return;
    this.tracked.delete(child);
    const stops = this.stops.get(child);
    if (stops) for (const stop of stops.values()) this.stop(stop);
    this.stops.delete(child);
    this.values.delete(child);
    if (!this.owner.isDisposed) this.handler.left(child, child.element as HTMLElement);
  }

  private bind(child: ComponentBase, name: string, value: Bind<unknown>): void {
    const stops = this.stops.get(child) ?? new Map<string, () => void>();
    this.stops.set(child, stops);
    const old = stops.get(name);
    if (old) this.stop(old);
    stops.delete(name);
    const values = this.values.get(child) ?? new Map<string, unknown>();
    this.values.set(child, values);
    if (typeof value !== 'function') {
      values.set(name, value);
      return;
    }
    let first = true;
    // One of the child's bindings: the child's or the page's `reState()` reads it again.
    const stop = follow(child, name, value as () => unknown, (next) => {
      values.set(name, next);
      if (!first && !this.reading) this.handler.changed(child, child.element as HTMLElement);
    });
    first = false;
    stops.set(name, stop);
    this.running.add(stop);
  }

  private stop(stop: () => void): void {
    stop();
    this.running.delete(stop);
  }
}
