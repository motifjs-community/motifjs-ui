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
  boundary: string | HTMLElement | undefined;
  container: string | HTMLElement | undefined;
  cursorOffset: { x?: number; y?: number } | string | undefined;
  autoScroll: boolean;
  scrollSpeed: number;
  scrollSensitivity: number;
  keyboard: boolean;
  moveUpKeys: readonly string[];
  moveDownKeys: readonly string[];
  columnWidth: number;
}
