import type { ComponentBase } from '@motifx/core';
import { elementOf } from './element-of';
import type { LayoutChange } from './layout-change';
import type { LayoutOptions } from './layout-options';
import { holderOf } from './read';
import { warnOnce } from './rounds';
import type { Size } from './size';
import { Watch } from './watch';
import { Watcher } from './watcher';

/**
 * Calls `changed` when `change` happens to `target`, and once when it is first in a page:
 * - `size`: its size changed; the size comes with the call. The first one is read by the layer in the first run after
 *   this call (and after it is shown again or moved); later ones come from the size observer, a frame after the browser
 *   laid them out. A size within half a pixel of the last one told is not told again.
 * - `look`: the design language, theme or density changed, fonts finished loading, a length it reads came out another size, or it moved into
 *   another window.
 * - `page`: its window changed size. `scroll`: something scrolled in the page of its window, but inside `except`.
 * - `sight`: it came into the viewport of its window or left it; whether it is in sight comes with the call.
 * - `viewport`: the part of its window in sight (`viewportOf`) changed: a pinch zoom, an on-screen keyboard, or where
 *   the browser has no visual viewport, the window's size.
 * `changed` runs at the start of the next round of that window, before the reads: it may write a state to measure and
 * ask for reads (`measure`), and reads nothing itself. The watch follows `target` from window to window, waits while it
 * is out of the page, and ends with `target`, with `owner` when given, or when the returned function is called.
 * Notices wait until core reports `target` mounted: a component placed outside the component tree never hears them.
 * A target with no element of its own (a list, a branch) is watched for `size` and `sight` through `holderOf(target)`.
 */
export function onLayout(target: ComponentBase, change: 'size', changed: (size: Size) => void, options?: LayoutOptions): () => void;
export function onLayout(target: ComponentBase, change: 'sight', changed: (seen: boolean) => void, options?: LayoutOptions): () => void;
export function onLayout(target: ComponentBase, change: 'look' | 'page' | 'scroll' | 'viewport', changed: () => void, options?: LayoutOptions): () => void;
export function onLayout(target: ComponentBase, change: LayoutChange, changed: (value: never) => void, options: LayoutOptions = {}): () => void {
  const owner = options.owner ?? target;
  if (target.isDisposed || owner.isDisposed) return () => {};
  let watched = target;
  if ((change === 'size' || change === 'sight') && !elementOf(target)) {
    warnOnce('fragment', 'onLayout() watches a component with no element of its own through the one that holds it; give holderOf(component) to say so.');
    watched = holderOf(target) ?? target;
  }
  const holder = Watcher.of(watched);
  const owners = [target, owner].filter((c, i, all) => c !== watched && all.indexOf(c) === i).map((c) => Watcher.of(c));
  const watch = new Watch(watched, [holder, ...owners], change, options.box ?? 'border', changed as (value: unknown) => void, options.except);
  holder.hold(watch);
  for (const each of owners) each.own(watch);
  return () => watch.stop();
}
