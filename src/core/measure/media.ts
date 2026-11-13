import type { ComponentBase } from '@motifx/core';
import { viewOf } from './element-of';

// Media queries, asked of the window a component is in (a window the app opened answers for itself). A window without
// `matchMedia` answers `false` and never tells a change.

/** The window's media query list for `query`; `null` when the window has none. */
function listOf(component: ComponentBase, query: string): MediaQueryList | null {
  const view = viewOf(component);
  return typeof view?.matchMedia === 'function' ? view.matchMedia(query) : null;
}

/** Whether `query` matches in the window `component` is in: `mediaOf(this, '(pointer: coarse)')`. */
export function mediaOf(component: ComponentBase, query: string): boolean {
  return !!listOf(component, query)?.matches;
}

/**
 * Calls `changed` with the new answer each time `query` starts or stops matching in the window `component` is in
 * (the window it is in now). Returns what stops it; nothing is told where the window has no `matchMedia`.
 */
export function onMedia(component: ComponentBase, query: string, changed: (matches: boolean) => void): () => void {
  const list = listOf(component, query);
  if (!list) return () => {};
  const heard = (): void => changed(list.matches);
  // Older engines (Safari before 14) have addListener alone.
  if (typeof list.addEventListener === 'function') {
    list.addEventListener('change', heard);
    return () => list.removeEventListener('change', heard);
  }
  if (typeof list.addListener === 'function') {
    list.addListener(heard);
    return () => list.removeListener(heard);
  }
  return () => {};
}
