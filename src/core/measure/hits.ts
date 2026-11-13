import type { ComponentBase } from '@motifx/core';
import { isWithin } from '../component-tree';
import type { HitCover } from './hit-cover';
import type { HitOptions } from './hit-options';
import type { Point } from './point';
import { isRtl, pageOf, rectOf, sameWindow, styleOf } from './read';
import type { Rect } from './rect';

/** A point on the backdrop of a modal surface: nothing under it can be hit. */
const BLOCKED = Symbol('blocked');

/**
 * The part of `component` on the screen: its box cut by the viewport of its window and by every component around it
 * that clips, up to one that is fixed (the top layer, a fixed bar); null when none of it shows.
 */
export function visibleRectOf(component: ComponentBase): Rect | null {
  const rect = rectOf(component);
  const page = pageOf(component);
  let left = Math.max(rect.left, 0);
  let top = Math.max(rect.top, 0);
  let right = Math.min(rect.right, page.width);
  let bottom = Math.min(rect.bottom, page.height);
  for (let at: ComponentBase = component; right > left && bottom > top; ) {
    if (styleOf(at, ['position']).position === 'fixed') break;
    const parent = at.parent;
    if (!parent) break;
    const overflow = styleOf(parent, ['overflow-x', 'overflow-y']);
    const across = clips(overflow['overflow-x']);
    const down = clips(overflow['overflow-y']);
    if (across || down) {
      const clip = rectOf(parent);
      if (across) {
        left = Math.max(left, clip.left);
        right = Math.min(right, clip.right);
      }
      if (down) {
        top = Math.max(top, clip.top);
        bottom = Math.min(bottom, clip.bottom);
      }
    }
    at = parent;
  }
  return right > left && bottom > top ? { left, top, right, bottom, width: right - left, height: bottom - top } : null;
}

/**
 * The first of `candidates` whose part on the screen holds `point`. Give them front first, in the kit's own order (the
 * window stack; inner parts first: `compareTreeOrder` reversed). With `space`, candidates in other windows are passed
 * over. With `cover`, the front surface under the point decides: only candidates inside it can be hit, and on a modal
 * surface's backdrop nothing can.
 */
export function componentAt<C extends ComponentBase>(point: Point, candidates: readonly C[], options: HitOptions = {}): C | null {
  const rectFor = options.rects ?? visibleRectOf;
  const front = options.cover ? frontAt(point, options.cover, rectFor) : null;
  if (front === BLOCKED) return null;
  for (const candidate of candidates) {
    if (candidate.isDisposed || (options.space && !sameWindow(candidate, options.space))) continue;
    if (front && !isWithin(candidate, front)) continue;
    const rect = rectFor(candidate);
    if (rect && holds(rect, point)) return candidate;
  }
  return null;
}

/** How far along `component` a point is: 0 at its start edge (the right one across, right to left; the top one down), 1 at its end. */
export function shareAlong(component: ComponentBase, point: Point, axis: 'x' | 'y' = 'x'): number {
  const rect = rectOf(component);
  const length = axis === 'x' ? rect.width : rect.height;
  if (!(length > 0)) return 0;
  const along = axis === 'y' ? point.y - rect.top : isRtl(component) ? rect.right - point.x : point.x - rect.left;
  return Math.max(0, Math.min(1, along / length));
}

/** The front surface whose part on the screen holds `point`; past a modal one nothing counts, and its backdrop blocks. */
function frontAt(point: Point, cover: HitCover, rectFor: (component: ComponentBase) => Rect | null): ComponentBase | typeof BLOCKED | null {
  const modal = cover.modal ?? null;
  for (const surface of cover.surfaces) {
    if (surface.isDisposed) continue;
    const rect = rectFor(surface);
    if (rect && holds(rect, point)) return surface;
    if (surface === modal) return BLOCKED;
  }
  return modal ? BLOCKED : null;
}

function holds(rect: Rect, point: Point): boolean {
  return point.x >= rect.left && point.x < rect.right && point.y >= rect.top && point.y < rect.bottom;
}

function clips(overflow: string): boolean {
  return overflow !== '' && overflow !== 'visible';
}
