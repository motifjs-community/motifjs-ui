import type { ComponentBase } from '@motifx/core';
import { onDocument, onWindow } from '../window-events';
import { viewOf } from './element-of';
import type { View } from './view';

// One resize listener and one scroll listener per window for all of the layer that hears them, through window-events.

const listeners = new WeakMap<View, Map<'resize' | 'scroll', { told: Set<{ heard: () => void; except?: ComponentBase }>; stop: () => void }>>();

/**
 * Calls `heard` when the window `component` is in changes size, or when anything in its page scrolls (the page too),
 * except a scroll that starts inside `except`. Returns what stops it.
 */
export function listenPage(component: ComponentBase, kind: 'resize' | 'scroll', heard: () => void, except?: ComponentBase): () => void {
  const view = viewOf(component);
  if (!view) return () => {};
  let own = listeners.get(view);
  if (!own) listeners.set(view, (own = new Map()));
  let entry = own.get(kind);
  if (!entry) {
    const told = new Set<{ heard: () => void; except?: ComponentBase }>();
    const tell = (e: Event): void => {
      for (const each of [...told]) if (!each.except || !each.except.motif.isEventFrom(e)) each.heard();
    };
    const stop = kind === 'resize' ? onWindow(view.document, 'resize', tell) : onDocument(view.document, 'scroll', tell, { capture: true, passive: true });
    own.set(kind, (entry = { told, stop }));
  }
  const mine = { heard, except };
  const kept = entry;
  const all = own;
  kept.told.add(mine);
  return () => {
    if (!kept.told.delete(mine) || kept.told.size) return;
    kept.stop();
    if (all.get(kind) === kept) all.delete(kind);
  };
}
