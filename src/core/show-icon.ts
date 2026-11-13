import type { ComponentBase } from '@motifx/core';
import { iconPart, removePart } from './draw-parts';
import type { IconSource } from './icon-source';

/**
 * Shows an icon in `into`, a part of the kit: an `<img>` for an address, or the app's component. Returns what takes
 * it away again (removed and disposed).
 */
export function showIcon(source: IconSource, into: ComponentBase): () => void {
  const icon = iconPart(into, source);
  return () => removePart(icon);
}
