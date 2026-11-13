import type { Rect } from './rect';

/** A component's element as read at one moment: where it is, its sizes, its scroll and its direction. A copy. */
export interface Box extends Rect {
  /** The border box as laid out, in whole pixels; transforms do not count. */
  readonly offsetWidth: number;
  readonly offsetHeight: number;
  /** Its start and top borders (and a scroll bar on the left, right to left). */
  readonly clientLeft: number;
  readonly clientTop: number;
  /** The room inside its borders, without its scroll bars. */
  readonly clientWidth: number;
  readonly clientHeight: number;
  /** All of its content, what is scrolled out of view too. */
  readonly scrollWidth: number;
  readonly scrollHeight: number;
  /** How far it is scrolled: from its inline start (never negative, right to left too) and from its top. */
  readonly scrollStart: number;
  readonly scrollTop: number;
  /** Written right to left. */
  readonly rtl: boolean;
}
