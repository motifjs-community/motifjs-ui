import type { LayoutSpace } from './layout-space';
import { spaceValue } from './space-value';

/** Writes a space to a custom property of the element the CSS reads (`--_gap`), or removes it. */
export function setSpace(el: HTMLElement, variable: string, value: LayoutSpace | null | undefined): void {
  const css = spaceValue(value);
  if (css) el.style.setProperty(variable, css);
  else el.style.removeProperty(variable);
}
