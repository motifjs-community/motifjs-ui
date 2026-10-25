import type { LayoutSpace } from './layout-space';
import { spaceValue } from './space-value';

/**
 * Writes a padding the way CSS reads one to four values (block-start, inline-end, block-end,
 * inline-start), on the logical sides, so it follows the reading direction.
 */
export function setPadding(el: HTMLElement, value: LayoutSpace | null | undefined): void {
  const words = spaceValue(value).split(' ').filter(Boolean);
  const [start, end = start, blockEnd = start, inlineStart = end] = words;
  const style = el.style;
  style.setProperty('padding-block-start', start ?? '');
  style.setProperty('padding-inline-end', end ?? '');
  style.setProperty('padding-block-end', blockEnd ?? '');
  style.setProperty('padding-inline-start', inlineStart ?? '');
}
