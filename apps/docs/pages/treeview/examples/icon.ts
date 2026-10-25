const SVG = 'http://www.w3.org/2000/svg';

export const FOLDER = 'M1.5 3.5h5l1.5 1.5h6.5v8h-13z';
export const FILE = 'M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3';

/** A small outline icon, a new element for each row. */
export function icon(path: string): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  const line = svg.appendChild(document.createElementNS(SVG, 'path'));
  line.setAttribute('d', path);
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke', 'currentColor');
  line.setAttribute('stroke-width', '1.2');
  line.setAttribute('stroke-linejoin', 'round');
  return svg;
}
