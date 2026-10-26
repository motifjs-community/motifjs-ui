const SVG = 'http://www.w3.org/2000/svg';
// Two columns of three dots.
const DOTS = [5.5, 10.5].flatMap((x) => [4, 8, 12].map((y) => [x, y]));

/** The drag icon of a row (`rowDragging.showDragIcons`): plain DOM, the cell holds focus and the name. */
export function createDragHandle(): HTMLSpanElement {
  const handle = document.createElement('span');
  handle.className = 'mx-data-grid__drag-handle';
  handle.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', 'mx-glyph');
  for (const [x, y] of DOTS) {
    const dot = document.createElementNS(SVG, 'circle');
    dot.setAttribute('cx', String(x));
    dot.setAttribute('cy', String(y));
    dot.setAttribute('r', '1.1');
    dot.setAttribute('fill', 'currentColor');
    svg.append(dot);
  }
  handle.append(svg);
  return handle;
}
