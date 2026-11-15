import type { ComponentBase } from '@motifx/core';

/** A text node of the markdown that grows: its value is written to the node once per write, not once per character. */
export class TextRun {
  value = '';
  readonly node: ComponentBase;

  constructor(make: (run: TextRun) => ComponentBase) {
    this.node = make(this);
  }
}
