import { errorHandler, untracked, type ComponentBase } from '@motifx/core';
import { onLookChanged } from '../look-watch';

// Where the layer hears that the look changed. Today that is look-watch.ts: the design language, theme and density
// attributes and the fonts that finish loading, watched in every document of the page and told once per microtask. When the design system sends a look
// event of its own, this file is the one to change.

const listeners = new Set<{ heard: () => void }>();
const byComponent = new WeakMap<ComponentBase, Set<{ heard: () => void }>>();
let hearing = false;
let version = 0;

/**
 * Calls `heard` after each change of the look (a design language, a theme, a density, fonts that finished loading) and when a length `component` reads
 * came out another size. Nothing is followed per component: `heard` runs while it is out of the page too, so read through
 * `measure` and leave out what is not laid out. Returns what stops it.
 */
export function onLookChange(component: ComponentBase, heard: () => void): () => void {
  hear();
  const entry = { heard };
  listeners.add(entry);
  let own = byComponent.get(component);
  if (!own) byComponent.set(component, (own = new Set()));
  own.add(entry);
  const mine = own;
  return () => {
    listeners.delete(entry);
    mine.delete(entry);
  };
}

/** Tells the look listeners of `component` alone: a length it reads came out another size. */
export function tellLook(component: ComponentBase): void {
  const own = byComponent.get(component);
  if (own) for (const entry of [...own]) tell(entry);
}

/** Counts the changes of the look: a length read under another count is read again. */
export function lookVersion(): number {
  hear();
  return version;
}

/** Hears the look from the first use on and keeps hearing it: a count that stopped would pass a length read under an old look as fresh. */
function hear(): void {
  if (hearing) return;
  hearing = true;
  onLookChanged(changed);
}

function changed(): void {
  version++;
  for (const entry of [...listeners]) tell(entry);
}

/** One listener told: one that fails is reported, and the others are told still. */
function tell(entry: { heard: () => void }): void {
  try {
    untracked(entry.heard);
  } catch (error) {
    errorHandler.report(error instanceof Error ? error : new Error(String(error)));
  }
}
