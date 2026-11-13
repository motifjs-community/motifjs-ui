import type { Component, ComponentBase } from '@motifx/core';
import { glyphPart, loose } from '../../../core/draw-parts';
import { mark, put } from '../../../core/part-writes';

/** The arrow of the expand column (`role="button"`, `aria-expanded`); the cell holds focus, not the arrow. */
export function createExpandButton(label: string, className = 'mx-data-grid__expand-button', icon = 'chevron-end'): Component<HTMLSpanElement> {
  const button = loose<HTMLSpanElement>('span', className);
  button.attr.add({ role: 'button', 'aria-expanded': 'false', 'aria-label': label, hidden: true });
  glyphPart(button, icon);
  return button;
}

/** Shows a row's details state on its arrow (hidden for a row without details); only what changed is written. */
export function drawExpandButton(button: ComponentBase, shown: boolean, open: boolean, label: string, controls: string | null): void {
  mark(button, 'hidden', !shown);
  put(button, 'aria-expanded', String(open));
  put(button, 'aria-label', label);
  put(button, 'aria-controls', controls);
}
