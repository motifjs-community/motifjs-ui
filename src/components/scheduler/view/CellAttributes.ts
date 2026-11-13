import type { ComponentBase } from '@motifx/core';
import { kept, mark, put } from '../../../core/part-writes';

/** A cell's attributes, each written only when it changes. */
export class CellAttributes {
  constructor(private readonly c: ComponentBase) {}

  /** An attribute written as it is (an empty one too), or taken away with `null`. */
  put(name: string, value: string | null): this {
    if (value === '') mark(this.c, name, true);
    else put(this.c, name, value);
    return this;
  }

  flag(name: string, on: boolean): this {
    mark(this.c, name, on);
    return this;
  }

  /** In the page or out of it, the MotifJS way (core's show and hide). */
  kept(on: boolean): this {
    kept(this.c, on);
    return this;
  }
}
