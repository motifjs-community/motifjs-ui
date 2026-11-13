import type { ComponentBase } from '@motifx/core';
import type { PendingScroll } from './pending-scroll';
import type { ScrollPlace } from './scroll-place';

/** Scrolls written through a component that core has not made yet (it calls the method a microtask later). */
const pending = new WeakMap<ComponentBase, PendingScroll>();

/** Notes a scroll written to `component` (`by`: a move on from where it is) until core has made it: reads in between count it. */
export function notePending(component: ComponentBase, place: ScrollPlace, by = false): void {
  let known = pending.get(component);
  if (!known) pending.set(component, (known = { byStart: 0, byTop: 0, writes: 0 }));
  if (by) {
    known.byStart += place.start ?? 0;
    known.byTop += place.top ?? 0;
  } else {
    if (place.start !== undefined) {
      known.start = place.start;
      known.byStart = 0;
    }
    if (place.top !== undefined) {
      known.top = place.top;
      known.byTop = 0;
    }
  }
  const write = ++known.writes;
  const noted = known;
  // Queued after core's own call, so it runs once that scroll is made; a later write keeps it for its own turn.
  queueMicrotask(() => {
    if (pending.get(component) === noted && noted.writes === write) pending.delete(component);
  });
}

/** The scroll written to `component` and not made yet. */
export function pendingScroll(component: ComponentBase): PendingScroll | undefined {
  return pending.get(component);
}
