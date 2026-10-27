import { dragDots } from '../../../core/glyphs';

/** The drag icon of a row (`rowDragging.showDragIcons`): plain DOM, the cell holds focus and the name. */
export function createDragHandle(): HTMLSpanElement {
  const handle = document.createElement('span');
  handle.className = 'mx-data-grid__drag-handle';
  handle.setAttribute('aria-hidden', 'true');
  handle.append(dragDots());
  return handle;
}
