import type { ComponentBase } from '@motifx/core';
import { css } from '../../core/part-writes';
import type { LayoutSpace } from './layout-space';
import { spaceValue } from './space-value';

/** Writes a space to a custom property of the element the CSS reads (`--_gap`), or removes it. */
export function setSpace(part: ComponentBase, variable: string, value: LayoutSpace | null | undefined): void {
  css(part, variable, spaceValue(value));
}
