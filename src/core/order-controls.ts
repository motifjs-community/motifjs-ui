import type { ComponentBase } from '@motifx/core';
import { holdsFocus } from './focus';

/**
 * Puts `desired` first among the controls of `parent`, in that order, moving as few as possible and never the one that
 * holds keyboard focus: moving a focused element blurs it. A desired control not in `parent` yet is inserted at its
 * place. Other controls keep their order after the desired ones.
 */
export function orderControls(parent: ComponentBase, desired: readonly ComponentBase[]): void {
  const items = parent.controls.items;
  for (let k = 0; k < desired.length; k++) {
    const want = desired[k];
    if (want.parent !== parent) {
      parent.controls.insert(k, want);
      continue;
    }
    if (items[k] === want) continue;
    if (holdsFocus(want)) {
      // Move what stands before it to just after it instead.
      while (items[k] !== want) parent.controls.move(items[k], items[items.indexOf(want) + 1] ?? null);
      continue;
    }
    parent.controls.move(want, items[k] ?? null);
  }
}
