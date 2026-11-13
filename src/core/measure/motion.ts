import type { ComponentBase } from '@motifx/core';
import { styleOf } from './read';
import { measure } from './rounds';

// The design system turns its durations to 0 for reduced motion; hasMotion reads that, on [data-design-language] too
// from the design-system release this layer waits for.
const MOTION = '--mx-motion-duration-normal';
const STYLE: readonly 'display'[] = ['display'];

/**
 * Runs `write` once the styles written so far are worked out, so a transition starts from them or an animation starts
 * over: one style read in the next read, shared by every component asking that frame, and no layout.
 */
export function afterStyle(owner: ComponentBase, write: () => void): () => void {
  return measure(owner, () => styleOf(owner, STYLE), () => write());
}

/** Whether motion is welcome where `component` is: the design system's durations are 0 under reduced motion. */
export function hasMotion(component: ComponentBase): boolean {
  const [duration] = times(styleOf(component, [MOTION])[MOTION]);
  return duration === undefined || duration > 0;
}

/** The longest transition of `component`, its delay counted, in milliseconds; 0 without motion. */
export function transitionTime(component: ComponentBase): number {
  const style = styleOf(component, ['transition-duration', 'transition-delay']);
  const delays = times(style['transition-delay']);
  return times(style['transition-duration']).reduce((most, d, i) => Math.max(most, d + (delays.length ? delays[i % delays.length] : 0)), 0);
}

/** CSS times (`0.2s, 150ms`) in milliseconds. */
function times(list: string): number[] {
  return list
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (parseFloat(t) || 0) * (t.endsWith('ms') ? 1 : t.endsWith('s') ? 1000 : 1));
}
