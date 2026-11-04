/**
 * The kit's glyphs, by name: each is a `span.mx-glyph` that CSS draws (a mask of `--mx-icon-<name>`
 * in the text colour). A design language brings its own set as tokens (`tokens/icons/<language>.icons.json`)
 * and nothing here changes; the names and the kit's own drawings are in `tokens/icons/kit.icons.json`.
 */
export function glyph(name: string): HTMLSpanElement {
  const mark = document.createElement('span');
  mark.className = 'mx-glyph';
  mark.dataset.icon = name;
  mark.setAttribute('aria-hidden', 'true');
  return mark;
}

/** The arrow of a control that opens something below it. */
export const chevronDown = (): HTMLSpanElement => glyph('chevron-down');

/** The mark of a checked item. */
export const checkMark = (): HTMLSpanElement => glyph('check');

export const chevronUp = (): HTMLSpanElement => glyph('chevron-up');

export const dismissMark = (): HTMLSpanElement => glyph('dismiss');

export const eyeOpen = (): HTMLSpanElement => glyph('eye-open');

export const eyeClosed = (): HTMLSpanElement => glyph('eye-closed');

export const infoMark = (): HTMLSpanElement => glyph('info');

export const successMark = (): HTMLSpanElement => glyph('success');

export const cautionMark = (): HTMLSpanElement => glyph('caution');

export const dangerMark = (): HTMLSpanElement => glyph('danger');

/** The mark of a checkbox that is neither checked nor unchecked. */
export const dashMark = (): HTMLSpanElement => glyph('dash');

export const plusMark = (): HTMLSpanElement => glyph('plus');

export const calendarMark = (): HTMLSpanElement => glyph('calendar');

export const clockMark = (): HTMLSpanElement => glyph('clock');

/** The mark of the chosen item of a group. */
export const radioMark = (): HTMLSpanElement => glyph('radio');

/** Three dots: more commands. */
export const moreMark = (): HTMLSpanElement => glyph('more');

/** The arrow of a branch that opens towards the end (mirrored right to left by CSS). */
export const chevronEnd = (): HTMLSpanElement => glyph('chevron-end');

/** The arrow towards the start: back, earlier (mirrored right to left by CSS). */
export const chevronStart = (): HTMLSpanElement => glyph('chevron-start');

/** A window filling the screen. */
export const maximizeMark = (): HTMLSpanElement => glyph('maximize');

/** A window back to its own size. */
export const restoreMark = (): HTMLSpanElement => glyph('restore');

/** A frame cut in two side by side: split. */
export const splitMark = (): HTMLSpanElement => glyph('split');

/** A window folded away. */
export const minimizeMark = (): HTMLSpanElement => glyph('minimize');

/** A funnel: filter by values. */
export const filterMark = (): HTMLSpanElement => glyph('filter');

/** Edit. */
export const pencilMark = (): HTMLSpanElement => glyph('pencil');

/** Delete. */
export const trashMark = (): HTMLSpanElement => glyph('trash');

/** Take back. */
export const undoMark = (): HTMLSpanElement => glyph('undo');

/** Save to a file. */
export const downloadMark = (): HTMLSpanElement => glyph('download');

/** Keep the changes (a disk). */
export const saveMark = (): HTMLSpanElement => glyph('save');

/** The list of columns. */
export const columnsMark = (): HTMLSpanElement => glyph('columns');

/** Look for something. */
export const searchMark = (): HTMLSpanElement => glyph('search');

/** A pushpin: a tab kept at the start. */
export const pinMark = (): HTMLSpanElement => glyph('pin');

/** A padlock: closed to new things. */
export const lockMark = (): HTMLSpanElement => glyph('lock');

/** A head and shoulders: someone with no picture or name to show. */
export const personMark = (): HTMLSpanElement => glyph('person');

/** Two columns of dots: something to take hold of and drag. */
export const gripMark = (): HTMLSpanElement => glyph('grip');

/** A dock guide: a window with the part a drop there would take marked. */
export const dockGuideMark = (side: 'center' | 'left' | 'right' | 'up' | 'down'): HTMLSpanElement => glyph(`dock-guide-${side}`);

/** Two columns of three dots: a row to take hold of and drag. */
export const dragDots = (): HTMLSpanElement => glyph('drag-dots');
