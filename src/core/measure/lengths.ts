import type { ComponentBase } from '@motifx/core';
import { lookVersion } from './look';
import { lengthKey, ProbeSet } from './probe-set';
import { isLaidOut, rectOf } from './read';
import { afterReads, measure, warnOnce } from './rounds';

const sets = new WeakMap<ComponentBase, ProbeSet>();

/**
 * Makes the probes of the lengths `owner` reads, while it is built, so the first read gives the real length. The probes
 * are parts of `owner`, kept until it goes: pick an owner whose children are its own parts.
 */
export function probeLengths(owner: ComponentBase, lengths: readonly string[], axis: 'inline' | 'block' = 'inline'): void {
  const set = setOf(owner);
  if (!set) return;
  const block = axis === 'block';
  for (const length of lengths) {
    const key = lengthKey(length, block);
    set.note(key, length, block);
    afterReads(() => set.make(key));
  }
}

/**
 * A CSS length in pixels as it comes out in `owner`: a token or any length (`calc(...)`, `50vh`, a share of its room),
 * 0 included. Read from its probe once per look (a change of language, theme or density reads it again) and again when
 * the probe's size observer sees it change, which `owner`'s look watches hear. `fallback` where nothing is laid out. A
 * length not made with `probeLengths` answers `fallback` the first time, and its probe is made with the next write.
 */
export function lengthOf(owner: ComponentBase, length: string, fallback = 0, axis: 'inline' | 'block' = 'inline'): number {
  const set = setOf(owner);
  if (!set) return fallback;
  const block = axis === 'block';
  const key = lengthKey(length, block);
  const entry = set.lengths.get(key);
  if (!entry) {
    set.note(key, length, block);
    warnOnce('length', `lengthOf('${length}') came before probeLengths(): it answers the fallback until its probe, made with the next write, is read.`);
    measure(owner, () => null, () => set.make(key));
    return fallback;
  }
  if (!entry.probe) return fallback;
  if (entry.version !== lookVersion() || !entry.laidOut) {
    const rect = rectOf(entry.probe);
    entry.px = block ? rect.height : rect.width;
    entry.laidOut = isLaidOut(entry.probe);
    entry.version = lookVersion();
  }
  return entry.laidOut ? entry.px : fallback;
}

function setOf(owner: ComponentBase): ProbeSet | null {
  if (owner.isDisposed) return null;
  let set = sets.get(owner);
  if (!set || set.isStopped) {
    set = new ProbeSet(owner);
    sets.set(owner, set);
  }
  return set;
}
