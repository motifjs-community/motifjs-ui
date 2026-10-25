import type { SummaryPart } from '../model/summary-part';

const drawn = new WeakMap<HTMLElement, string>();

/**
 * Writes summary items into a cell: one element per item, stacked, or on one line with `separator`
 * between them. An item whose text does not name its column ("Sum: 1,234" under Amount) is read
 * as one that does ("Sum of Amount: 1,234"): the shown text is hidden from assistive technology
 * and the naming one is there, hidden from sight. Nothing is touched when the cell shows the same.
 */
export function fillSummaryCell(cell: HTMLElement, parts: readonly SummaryPart[], separator: string | null) {
  const key = JSON.stringify([parts, separator]);
  if (drawn.get(cell) === key) return;
  drawn.set(cell, key);
  const nodes: Node[] = [];
  parts.forEach((part, n) => {
    if (separator !== null && n > 0) nodes.push(document.createTextNode(separator));
    const item = document.createElement(separator === null ? 'div' : 'span');
    item.className = part.cssClass ? `mx-data-grid__summary-item ${part.cssClass}` : 'mx-data-grid__summary-item';
    if (part.align) item.style.textAlign = part.align;
    const text = document.createElement('span');
    text.textContent = part.text;
    item.append(text);
    if (part.label !== part.text) {
      text.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span');
      label.className = 'mx-sr-only';
      label.textContent = part.label;
      item.append(label);
    }
    nodes.push(item);
  });
  cell.replaceChildren(...nodes);
  const align = separator !== null ? parts.find((p) => p.align)?.align : undefined;
  cell.style.textAlign = align ?? '';
}
