import type { ComponentBase } from '@motifx/core';
import { keepScroll } from '../../core/measure';

/** The components of the layout (the manager, a group, a split, a window and its body, a dock area…). */
const parts = new WeakSet<ComponentBase>();
/** The layout items' components (groups and splits): what a part keeps alive when it goes. */
const items = new WeakSet<ComponentBase>();

/** @internal Marks a component as a part of the layout; `item`: a group or a split. */
export function layoutPart(part: ComponentBase, item = false): void {
  parts.add(part);
  if (item) items.add(part);
}

/**
 * Puts `part` into `holder`, before the first other layout component among the holder's controls from `before` on
 * (at the end when there is none), and core places it; what scrolled inside it keeps its place. `kept`: its scroll as
 * `keepScroll` noted it in a measure's read, for a move made where reading lays the page out (a notice, a write).
 */
export function placePart(holder: ComponentBase, part: ComponentBase, before: ComponentBase | null, kept?: () => void): void {
  if (!parts.has(part) || !parts.has(holder)) return;
  const next = nextPart(holder, part, before);
  const restore = kept ?? keepScroll(part);
  if (part.parent === holder) holder.controls.move(part, next);
  else {
    const at = next ? holder.controls.items.indexOf(next) : -1;
    if (at >= 0) holder.controls.insert(at, part);
    else holder.controls.add(part);
  }
  restore();
}

/** The first layout component among the holder's controls from `before` on, `part` left out. */
function nextPart(holder: ComponentBase, part: ComponentBase, before: ComponentBase | null): ComponentBase | null {
  const controls = holder.controls.items;
  const from = before ? controls.indexOf(before) : -1;
  if (from < 0) return null;
  for (let i = from; i < controls.length; i++) if (controls[i] !== part && parts.has(controls[i])) return controls[i];
  return null;
}

/** Takes a part of the layout out of the page; the groups and splits in it stay alive for the manager to place again or dispose. */
export function dropPart(part: ComponentBase): void {
  // Already gone with what held it (the manager going away).
  if (part.isDisposed) return;
  const keep = (holder: ComponentBase) => {
    for (const child of [...holder.controls.items]) {
      if (child.isDisposed) continue;
      if (items.has(child)) holder.controls.silentDetach(child);
      else keep(child);
    }
  };
  keep(part);
  const parent = part.parent;
  if (parent && !parent.isDisposed) parent.controls.remove(part);
  else void part.dispose();
}

/** Takes out of `holder` the layout components that are not `wanted`, without disposing them. */
export function detachOthers(holder: ComponentBase, wanted: readonly ComponentBase[]): void {
  for (const child of [...holder.controls.items]) if (!wanted.includes(child) && items.has(child)) holder.controls.silentDetach(child);
}
