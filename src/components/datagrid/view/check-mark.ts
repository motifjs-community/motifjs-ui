import type { Component, ComponentBase } from '@motifx/core';
import { glyphPart, loose } from '../../../core/draw-parts';
import { flag, put } from '../../../core/part-writes';

/** A check box part (`role="checkbox"`) for the selection column; the cell holds focus, not the box. */
export function createCheck(label: string): Component<HTMLSpanElement> {
  const box = loose<HTMLSpanElement>('span', 'mx-data-grid__check');
  box.attr.add({ role: 'checkbox', 'aria-checked': 'false' });
  // Named from the start: a row drawn before its state is known is read too.
  box.attr.add({ 'aria-label': label });
  glyphPart(box, 'check', 'mx-data-grid__check-mark');
  glyphPart(box, 'dash', 'mx-data-grid__check-dash');
  return box;
}

/** Shows a state on a check box; only what changed is written. */
export function drawCheck(box: ComponentBase, state: boolean | 'mixed', label: string, enabled = true): void {
  put(box, 'aria-checked', state === 'mixed' ? 'mixed' : String(state));
  put(box, 'aria-label', label);
  flag(box, 'aria-disabled', !enabled);
}
