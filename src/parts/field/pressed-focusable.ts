import type { ComponentBase } from '@motifx/core';
import { canTakeFocus } from '../../core/focus';

/** Whether a press began on a part inside `part` that takes focus itself: a button, a box, anything with a tabindex. */
export function pressedFocusable(part: ComponentBase, e: Event): boolean {
  return part.controls.items.some((child) => child.motif.isEventFrom(e) && (canTakeFocus(child) || pressedFocusable(child, e)));
}
