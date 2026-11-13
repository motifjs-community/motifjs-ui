import type { ComponentBase } from '@motifx/core';
import type { HitCover } from '../../core/measure';
import { windowOf } from '../../core/page-documents';
import { windowStack } from '../../core/window-stack';

/**
 * What may lie over a drag's candidates in the window `space` is in: the windows shown there, front first, and the
 * modal one nearest the front, which leaves nothing behind it to aim at.
 */
export function stackCover(space: ComponentBase): HitCover {
  const shown = windowStack.frontFirst(windowOf(space));
  return { surfaces: shown.map((w) => w.part), modal: shown.find((w) => w.modal)?.part ?? null };
}
