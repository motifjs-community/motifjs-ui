import { Component } from '@motifx/core';

/**
 * The kit's glyphs, by name: each is a `span.mx-glyph` component that CSS draws (a mask of `--mx-icon-<name>`
 * in the text color), not placed yet: give it as an icon, or add it to a part. A design language brings its own set
 * as tokens (`tokens/icons/<language>.icons.json`) and nothing here changes; the names and the kit's own drawings
 * are in `tokens/icons/kit.icons.json`. `glyphPart` (core/draw-parts) makes one as a part of a parent.
 */
export function glyph(name: string): Component<HTMLSpanElement> {
  const mark = new Component<HTMLSpanElement>('span');
  mark.class.add('mx-glyph');
  mark.attr.add({ 'data-icon': name, 'aria-hidden': 'true' });
  return mark;
}

/** The arrow of a control that opens something below it. */
export const chevronDown = (): Component<HTMLSpanElement> => glyph('chevron-down');

/** The mark of a checked item. */
export const checkMark = (): Component<HTMLSpanElement> => glyph('check');

export const chevronUp = (): Component<HTMLSpanElement> => glyph('chevron-up');

export const dismissMark = (): Component<HTMLSpanElement> => glyph('dismiss');

export const eyeOpen = (): Component<HTMLSpanElement> => glyph('eye-open');

export const eyeClosed = (): Component<HTMLSpanElement> => glyph('eye-closed');

export const infoMark = (): Component<HTMLSpanElement> => glyph('info');

export const successMark = (): Component<HTMLSpanElement> => glyph('success');

export const cautionMark = (): Component<HTMLSpanElement> => glyph('caution');

export const dangerMark = (): Component<HTMLSpanElement> => glyph('danger');

/** The mark of a checkbox that is neither checked nor unchecked. */
export const dashMark = (): Component<HTMLSpanElement> => glyph('dash');

export const plusMark = (): Component<HTMLSpanElement> => glyph('plus');

export const calendarMark = (): Component<HTMLSpanElement> => glyph('calendar');

export const clockMark = (): Component<HTMLSpanElement> => glyph('clock');

/** The mark of the chosen item of a group. */
export const radioMark = (): Component<HTMLSpanElement> => glyph('radio');

/** Three dots: more commands. */
export const moreMark = (): Component<HTMLSpanElement> => glyph('more');

/** The arrow of a branch that opens towards the end (mirrored right to left by CSS). */
export const chevronEnd = (): Component<HTMLSpanElement> => glyph('chevron-end');

/** The arrow towards the start: back, earlier (mirrored right to left by CSS). */
export const chevronStart = (): Component<HTMLSpanElement> => glyph('chevron-start');

/** A window filling the screen. */
export const maximizeMark = (): Component<HTMLSpanElement> => glyph('maximize');

/** A window back to its own size. */
export const restoreMark = (): Component<HTMLSpanElement> => glyph('restore');

/** A frame cut in two side by side: split. */
export const splitMark = (): Component<HTMLSpanElement> => glyph('split');

/** A window folded away. */
export const minimizeMark = (): Component<HTMLSpanElement> => glyph('minimize');

/** A funnel: filter by values. */
export const filterMark = (): Component<HTMLSpanElement> => glyph('filter');

/** Edit. */
export const pencilMark = (): Component<HTMLSpanElement> => glyph('pencil');

/** Delete. */
export const trashMark = (): Component<HTMLSpanElement> => glyph('trash');

/** Take back. */
export const undoMark = (): Component<HTMLSpanElement> => glyph('undo');

/** Save to a file. */
export const downloadMark = (): Component<HTMLSpanElement> => glyph('download');

/** Keep the changes (a disk). */
export const saveMark = (): Component<HTMLSpanElement> => glyph('save');

/** The list of columns. */
export const columnsMark = (): Component<HTMLSpanElement> => glyph('columns');

/** Look for something. */
export const searchMark = (): Component<HTMLSpanElement> => glyph('search');

/** A pushpin: a tab kept at the start. */
export const pinMark = (): Component<HTMLSpanElement> => glyph('pin');

/** A padlock: closed to new things. */
export const lockMark = (): Component<HTMLSpanElement> => glyph('lock');

/** A head and shoulders: someone with no picture or name to show. */
export const personMark = (): Component<HTMLSpanElement> => glyph('person');

/** Two columns of dots: something to take hold of and drag. */
export const gripMark = (): Component<HTMLSpanElement> => glyph('grip');

/** A dock guide: a window with the part a drop there would take marked. */
export const dockGuideMark = (side: 'center' | 'left' | 'right' | 'up' | 'down'): Component<HTMLSpanElement> => glyph(`dock-guide-${side}`);

/** Two columns of three dots: a row to take hold of and drag. */
export const dragDots = (): Component<HTMLSpanElement> => glyph('drag-dots');
