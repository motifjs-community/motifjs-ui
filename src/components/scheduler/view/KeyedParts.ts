import type { ComponentBase } from '@motifx/core';

/**
 * A list of parts kept by hand, with no binding: `show(items)` makes the parts of keys that came, takes away the
 * parts of keys that went, keeps the order, and has the parts that stay draw themselves again. The parts sit in
 * `host` from `start()` on, before whatever comes after them there.
 */
export class KeyedParts<I, P extends ComponentBase> {
  private readonly parts = new Map<string, P>();

  constructor(
    private readonly host: ComponentBase,
    private readonly keyOf: (item: I) => string,
    private readonly make: (item: I) => P,
    private readonly draw: (part: P, item: I) => void,
    private readonly start: () => number = () => 0,
    /** A part was taken away (it is disposed). */
    private readonly gone: (part: P, key: string) => void = () => {},
  ) {}

  /** How many parts are shown. */
  get size(): number {
    return this.parts.size;
  }

  /** The part of a key, if it is shown. */
  get(key: string): P | undefined {
    return this.parts.get(key);
  }

  /** Every part shown, in no given order. */
  each(fn: (part: P) => void): void {
    this.parts.forEach((part) => fn(part));
  }

  show(items: readonly I[]): void {
    const keys = items.map((item) => this.keyOf(item));
    const wanted = new Set(keys);
    for (const [key, part] of this.parts) {
      if (wanted.has(key)) continue;
      this.parts.delete(key);
      this.gone(part, key);
      this.host.controls.remove(part);
    }
    const controls = this.host.controls;
    const start = this.start();
    items.forEach((item, i) => {
      const key = keys[i];
      const at = start + i;
      let part = this.parts.get(key);
      if (part) {
        if (controls.items[at] !== part) controls.moveToIndex(part, at);
        this.draw(part, item);
        return;
      }
      part = this.make(item);
      this.parts.set(key, part);
      controls.add(at, part);
    });
  }

  /** Every part draws itself again. */
  drawAll(items: readonly I[]): void {
    for (const item of items) {
      const part = this.parts.get(this.keyOf(item));
      if (part) this.draw(part, item);
    }
  }

  clear(): void {
    for (const [key, part] of this.parts) {
      this.gone(part, key);
      this.host.controls.remove(part);
    }
    this.parts.clear();
  }
}
