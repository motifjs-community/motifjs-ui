import type { ComponentBase } from '@motifx/core';

/** A cell's attributes, each written only when it changes. */
export class CellAttributes {
  constructor(private readonly c: ComponentBase) {}

  put(name: string, value: string | null): this {
    if (this.c.element.getAttribute(name) === value) return this;
    if (value === null) this.c.attr.remove(name);
    else this.c.attr.add({ [name]: value });
    return this;
  }

  flag(name: string, on: boolean): this {
    return this.put(name, on ? '' : null);
  }
}
