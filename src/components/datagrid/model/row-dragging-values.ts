import type { ComponentBase } from '@motifx/core';

/** The `rowDragging` options as the grid reads them: values, not getters (the handlers are kept apart). */
export interface RowDraggingValues {
  allowReordering: boolean;
  allowDropInsideItem: boolean;
  dropFeedbackMode: 'indicate' | 'push';
  showDragIcons: boolean;
  handle: string;
  group: string | undefined;
  data: unknown;
  dragDirection: 'both' | 'vertical' | 'horizontal';
  boundary: string | ComponentBase | undefined;
  container: string | ComponentBase | undefined;
  cursorOffset: { x?: number; y?: number } | string | undefined;
  autoScroll: boolean;
  scrollSpeed: number;
  scrollSensitivity: number;
  keyboard: boolean;
  moveUpKeys: readonly string[];
  moveDownKeys: readonly string[];
  columnWidth: number;
}
