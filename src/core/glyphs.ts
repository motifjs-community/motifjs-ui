const SVG = 'http://www.w3.org/2000/svg';

function glyph(path: string): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', 'mx-glyph');
  const line = document.createElementNS(SVG, 'path');
  line.setAttribute('d', path);
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke', 'currentColor');
  line.setAttribute('stroke-width', '1.5');
  line.setAttribute('stroke-linecap', 'round');
  line.setAttribute('stroke-linejoin', 'round');
  svg.append(line);
  return svg;
}

/** The arrow of a control that opens something below it. */
export const chevronDown = (): SVGSVGElement => glyph('M4 6l4 4 4-4');

/** The mark of a checked item. */
export const checkMark = (): SVGSVGElement => glyph('M3.5 8.5l3 3 6-7');

export const chevronUp = (): SVGSVGElement => glyph('M4 10l4-4 4 4');

export const dismissMark = (): SVGSVGElement => glyph('M4.5 4.5l7 7M11.5 4.5l-7 7');

const EYE = 'M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8zM8 6a2 2 0 1 0 0 4a2 2 0 1 0 0-4z';

export const eyeOpen = (): SVGSVGElement => glyph(EYE);

export const eyeClosed = (): SVGSVGElement => glyph(`${EYE}M2.5 2.5l11 11`);

const RING = 'M8 1.75a6.25 6.25 0 1 0 0 12.5a6.25 6.25 0 1 0 0-12.5z';

export const infoMark = (): SVGSVGElement => glyph(`${RING}M8 7.25v4M8 4.9v.1`);

export const successMark = (): SVGSVGElement => glyph(`${RING}M5.25 8.25l1.875 1.875L10.75 6.25`);

export const cautionMark = (): SVGSVGElement => glyph('M8 2L14.5 13.5H1.5zM8 6.5v3.25M8 11.65v.1');

export const dangerMark = (): SVGSVGElement => glyph(`${RING}M6 6l4 4M10 6l-4 4`);

/** The mark of a checkbox that is neither checked nor unchecked. */
export const dashMark = (): SVGSVGElement => glyph('M4 8h8');

export const plusMark = (): SVGSVGElement => glyph('M8 4v8M4 8h8');

export const calendarMark = (): SVGSVGElement => glyph('M3 4.5h10v8.5h-10zM3 7h10M5.5 3v3M10.5 3v3');

export const clockMark = (): SVGSVGElement => glyph('M8 2.5a5.5 5.5 0 1 0 0 11a5.5 5.5 0 1 0 0-11zM8 5v3l2 1.5');

/** The mark of the chosen item of a group. */
export const radioMark = (): SVGSVGElement => {
  const svg = glyph('M6 8a2 2 0 1 0 4 0a2 2 0 1 0-4 0z');
  svg.firstElementChild!.setAttribute('fill', 'currentColor');
  return svg;
};

/** Three dots: more commands. */
export const moreMark = (): SVGSVGElement => glyph('M2.75 8a.75 .75 0 1 0 1.5 0a.75 .75 0 1 0-1.5 0zM7.25 8a.75 .75 0 1 0 1.5 0a.75 .75 0 1 0-1.5 0zM11.75 8a.75 .75 0 1 0 1.5 0a.75 .75 0 1 0-1.5 0z');

/** The arrow of a branch that opens towards the end (mirrored right to left by CSS). */
export const chevronEnd = (): SVGSVGElement => glyph('M6 4l4 4-4 4');

/** A window filling the screen. */
export const maximizeMark = (): SVGSVGElement => glyph('M3.5 3.5h9v9h-9z');

/** A window back to its own size. */
export const restoreMark = (): SVGSVGElement => glyph('M3.5 5.5h7v7h-7zM5.5 5.5v-2h7v7h-2');

/** A window folded away. */
export const minimizeMark = (): SVGSVGElement => glyph('M4 8.5h8');

/** A funnel: filter by values. */
export const filterMark = (): SVGSVGElement => glyph('M2.5 3.5h11l-4.25 5v4.25l-2.5 1.25v-5.5z');

/** Edit. */
export const pencilMark = (): SVGSVGElement => glyph('M10.5 2.75l2.75 2.75-7.5 7.5h-2.75v-2.75zM9 4.25l2.75 2.75');

/** Delete. */
export const trashMark = (): SVGSVGElement => glyph('M3 4.5h10M6.5 4.5v-1.5h3v1.5M4.5 4.5l.75 9h5.5l.75-9M7 7v4M9 7v4');

/** Take back. */
export const undoMark = (): SVGSVGElement => glyph('M5.5 3.5l-2.5 2.5 2.5 2.5M3 6h6.5a3.5 3.5 0 0 1 0 7h-3');

/** Save to a file. */
export const downloadMark = (): SVGSVGElement => glyph('M8 2.5v7.5M4.75 6.75L8 10l3.25-3.25M3 12.5v1h10v-1');
