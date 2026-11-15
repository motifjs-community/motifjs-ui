import type { ComponentBase } from '@motifx/core';
import { iconPart } from './draw-parts';
import type { IconSource } from './icon-source';

/**
 * Shows an icon in `into`, a part of the kit: an `<img>` for an address, or the app's component. It goes with `into`;
 * `clearParts(into)` takes it out for another one.
 */
export function showIcon(source: IconSource, into: ComponentBase): void {
  iconPart(into, source);
}
