import type { ComponentBase } from '@motifx/core';
import type { HitCover } from './hit-cover';
import type { Rect } from './rect';

/** How `componentAt` looks for the candidate under a point. */
export interface HitOptions {
  /** A component of the window the point is in: candidates in other windows are passed over. */
  space?: ComponentBase;
  /** What may lie over the candidates: a candidate under another surface, or behind a modal one, is not hit. */
  cover?: HitCover;
  /** The part of a candidate or a surface on the screen when the caller keeps them (a drag); read now otherwise. */
  rects?: (component: ComponentBase) => Rect | null;
}
