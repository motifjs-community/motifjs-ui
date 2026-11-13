import type { Component, ComponentBase } from '@motifx/core';
import { part, removePart } from '../../../core/draw-parts';
import { css, kept, put, text } from '../../../core/part-writes';
import type { SummaryPart } from '../model/summary-part';

const drawn = new WeakMap<ComponentBase, string>();

/** An item's parts in a cell, with the separator before it. */
interface ItemParts {
  separator: Component<HTMLSpanElement>;
  item: Component<HTMLElement>;
  text: Component<HTMLSpanElement>;
  label: Component<HTMLSpanElement> | null;
  cssClass: string;
}

/** The items of each cell, in order, and whether they stack (`div`) or share a line (`span`). */
const cells = new WeakMap<ComponentBase, { stacked: boolean; items: ItemParts[] }>();

/**
 * Writes summary items into a cell: one part per item, stacked, or on one line with `separator`
 * between them. An item whose text does not name its column ("Sum: 1,234" under Amount) is read
 * as one that does ("Sum of Amount: 1,234"): the shown text is hidden from assistive technology
 * and the naming one is there, hidden from sight. Nothing is touched when the cell shows the same; a changed
 * text is written into the parts the cell has, and items are added or taken away at the end.
 */
export function fillSummaryCell(cell: ComponentBase, parts: readonly SummaryPart[], separator: string | null) {
  const key = JSON.stringify([parts, separator]);
  if (drawn.get(cell) === key) return;
  drawn.set(cell, key);
  const stacked = separator === null;
  let held = cells.get(cell);
  // Stacked items are other elements than items on one line: a cell that turns from one to the other starts again.
  if (held && held.stacked !== stacked) {
    for (const old of held.items) removeItem(old);
    held = undefined;
  }
  if (!held) cells.set(cell, (held = { stacked, items: [] }));
  const items = held.items;
  while (items.length > parts.length) removeItem(items.pop()!);
  while (items.length < parts.length) items.push(makeItem(cell, stacked));
  parts.forEach((summary, n) => {
    const own = items[n];
    if (separator !== null) text(own.separator, separator);
    kept(own.separator, separator !== null && n > 0);
    if (own.cssClass !== (summary.cssClass ?? '')) {
      for (const name of own.cssClass.split(' ').filter(Boolean)) own.item.class.remove(name);
      for (const name of (summary.cssClass ?? '').split(' ').filter(Boolean)) own.item.class.add(name);
      own.cssClass = summary.cssClass ?? '';
    }
    css(own.item, 'text-align', summary.align ?? '');
    text(own.text, summary.text);
    const named = summary.label !== summary.text;
    put(own.text, 'aria-hidden', named ? 'true' : null);
    if (named && !own.label) own.label = part<HTMLSpanElement>(own.item, 'span', 'mx-sr-only');
    if (own.label) {
      if (named) text(own.label, summary.label);
      kept(own.label, named);
    }
  });
  const align = separator !== null ? parts.find((p) => p.align)?.align : undefined;
  css(cell, 'text-align', align ?? '');
}

function makeItem(cell: ComponentBase, stacked: boolean): ItemParts {
  const separator = part<HTMLSpanElement>(cell, 'span', 'mx-data-grid__summary-separator');
  const item = part<HTMLElement>(cell, stacked ? 'div' : 'span', 'mx-data-grid__summary-item');
  const text = part<HTMLSpanElement>(item, 'span', '');
  return { separator, item, text, label: null, cssClass: '' };
}

function removeItem(own: ItemParts): void {
  removePart(own.separator);
  removePart(own.item);
}
