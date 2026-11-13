import type { ComponentBase } from '@motifx/core';
import type { Box } from './box';
import type { Page } from './page';
import type { Rect } from './rect';

/** What the read phase going on has read, by component: each box, rect, style and page once, whoever asks. Emptied when it ends. */
export const roundReads = {
  boxes: new Map<ComponentBase, Box>(),
  rects: new Map<ComponentBase, Rect>(),
  styles: new Map<ComponentBase, CSSStyleDeclaration>(),
  laidOut: new Map<ComponentBase, boolean>(),
  pages: new Map<ComponentBase, Page>(),
};

/** Forgets what was read: a write may have changed it. */
export function forgetReads(): void {
  roundReads.boxes.clear();
  roundReads.rects.clear();
  roundReads.styles.clear();
  roundReads.laidOut.clear();
  roundReads.pages.clear();
}
