import type { ComponentBase } from '@motifx/core';
import { viewOf } from './element-of';
import { listenPage } from './page-events';
import { noteRead } from './rounds';
import type { Viewport } from './viewport-rect';

const NO_VIEWPORT: Viewport = Object.freeze({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, windowWidth: 0, windowHeight: 0 });

/**
 * The part of the window `component` is in that is in sight now: the visual viewport where the browser has one (a
 * pinch zoom or an on-screen keyboard makes it smaller than the window), else the whole window.
 */
export function viewportOf(component: ComponentBase): Viewport {
  const view = viewOf(component);
  if (!view) return NO_VIEWPORT;
  noteRead();
  const windowWidth = view.innerWidth;
  const windowHeight = view.innerHeight;
  const visual = view.visualViewport;
  const left = visual ? visual.offsetLeft : 0;
  const top = visual ? visual.offsetTop : 0;
  const width = visual ? visual.width : windowWidth;
  const height = visual ? visual.height : windowHeight;
  return { left, top, right: left + width, bottom: top + height, width, height, windowWidth, windowHeight };
}

/**
 * Calls `heard` when the part of the window in sight changes (`onLayout(…, 'viewport')`): the visual viewport's resize
 * and scroll where the browser has one, else the window's resize. Returns what stops it.
 */
export function listenViewport(component: ComponentBase, heard: () => void): () => void {
  const visual = viewOf(component)?.visualViewport;
  if (!visual) return listenPage(component, 'resize', heard);
  visual.addEventListener('resize', heard);
  visual.addEventListener('scroll', heard);
  return () => {
    visual.removeEventListener('resize', heard);
    visual.removeEventListener('scroll', heard);
  };
}
