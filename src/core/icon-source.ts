import type { ComponentBase } from '@motifx/core';

/**
 * An icon: an image address, or a component (an `<svg>` or an icon font tag in JSX, `glyph(name)`).
 *
 * A component stands in one place. Where the kit shows an icon a second time (the "more" menu of a toolbar or a
 * ribbon, the row and the grid of a gallery, the rows of a grid's actions), give a component icon as a function,
 * `icon={() => <svg …/>}`: the kit calls it again for each copy, so every place builds its own. A component given
 * as is stays where it was first shown, and a copy shows none.
 */
export type IconSource = string | ComponentBase;

/**
 * A new copy of an icon given as `given`, a value or a function: an address as it is, the function called again for
 * a new component. `null` for a component given as is, and for one the function hands out again (`shown`, the one
 * already in place): it stays where it is.
 */
export function iconCopy(given: unknown, shown: IconSource | null = null): IconSource | null {
  if (typeof given === 'string') return given || null;
  if (typeof given !== 'function') return null;
  const icon = (given as () => IconSource | null | undefined)();
  if (!icon) return null;
  return typeof icon !== 'string' && icon === shown ? null : icon;
}
