import type { Component } from '@motifx/core';
import { glyphPart, loose } from '../../../core/draw-parts';

/** The drag icon of a row (`rowDragging.showDragIcons`): the cell holds focus and the name. */
export function createDragHandle(): Component<HTMLSpanElement> {
  const handle = loose<HTMLSpanElement>('span', 'mx-data-grid__drag-handle');
  handle.attr.add({ 'aria-hidden': 'true' });
  glyphPart(handle, 'drag-dots');
  return handle;
}
