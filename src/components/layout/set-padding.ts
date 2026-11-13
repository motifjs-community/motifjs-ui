import type { ComponentBase } from '@motifx/core';
import { css } from '../../core/part-writes';
import type { LayoutSpace } from './layout-space';
import { spaceValue } from './space-value';

const SIDES = ['padding-block-start', 'padding-inline-end', 'padding-block-end', 'padding-inline-start'];

/**
 * Writes a padding the way CSS reads one to four values (block-start, inline-end, block-end,
 * inline-start), on the logical sides, so it follows the reading direction.
 */
export function setPadding(part: ComponentBase, value: LayoutSpace | null | undefined): void {
  const words = spaceValue(value).split(' ').filter(Boolean);
  const [start, end = start, blockEnd = start, inlineStart = end] = words;
  const values = [start, end, blockEnd, inlineStart];
  SIDES.forEach((side, i) => css(part, side, values[i] ?? ''));
}
