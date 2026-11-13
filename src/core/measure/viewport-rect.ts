import type { Rect } from './rect';

/**
 * The part of a window in sight (`viewportOf`): pixels from the top left corner of the window's layout viewport, with
 * the size of the whole window (`innerWidth`, `innerHeight`). What the window has below `bottom` is covered, by an
 * on-screen keyboard for one.
 */
export interface Viewport extends Rect {
  readonly windowWidth: number;
  readonly windowHeight: number;
}
