import type { ComponentBase } from '@motifx/core';
import { pageWindow, windowOf } from './page-documents';
import { css } from './part-writes';
import type { StackedWindow } from './stacked-window';

export type { StackedWindow } from './stacked-window';

/** The shown windows, back to front, each with the browser window it was shown in when it last came to the front. */
const stack: { window: StackedWindow; view: Window | null }[] = [];

/** The windows shown in one browser window, back to front: the page and each window it opened stack their own. */
function inWindow(view: Window | null): StackedWindow[] {
  return stack.filter((s) => s.view === view).map((s) => s.window);
}

function renumber(view: Window | null): void {
  const own = inWindow(view);
  own.forEach((w, i) => {
    // z-index itself comes from CSS: calc(var(--mx-z-window) + var(--_mx-z)).
    css(w.part, '--_mx-z', String(i));
    w.setActive(i === own.length - 1);
  });
}

/**
 * The order of shown windows, one stack per browser window. The last one is on top and active. Modal
 * windows also sit here so "which window is active" has one answer, even though the browser's top
 * layer stacks them itself.
 */
export const windowStack = {
  /** Adds the window on top of the stack of the browser window it is in, or moves it there. */
  bringToFront(w: StackedWindow): void {
    const i = stack.findIndex((s) => s.window === w);
    const view = windowOf(w.part);
    if (i !== -1 && i === stack.length - 1 && stack[i].view === view) return;
    const before = i === -1 ? undefined : stack[i].view;
    if (i !== -1) stack.splice(i, 1);
    stack.push({ window: w, view });
    // Moved into another browser window: the one it left numbers its own again.
    if (before !== undefined && before !== view) renumber(before);
    renumber(view);
  },
  remove(w: StackedWindow): void {
    const i = stack.findIndex((s) => s.window === w);
    if (i === -1) return;
    const [{ view }] = stack.splice(i, 1);
    w.setActive(false);
    renumber(view);
  },
  /** The active (top) window shown in a browser window (the page's by default), or `undefined`. */
  top(view: Window | null = pageWindow()): StackedWindow | undefined {
    if (!view) return stack[stack.length - 1]?.window;
    const own = inWindow(view);
    return own[own.length - 1];
  },
  /** The place of the window whose component is `part` in its browser window's stack, 0 at the back; -1 when it is not shown. */
  orderOf(part: ComponentBase): number {
    const s = stack.find((each) => each.window.part === part);
    return s ? inWindow(s.view).indexOf(s.window) : -1;
  },
  /** The windows shown in a browser window (the page's by default), front first. */
  frontFirst(view: Window | null = pageWindow()): StackedWindow[] {
    return inWindow(view).reverse();
  },
  /** Number of windows currently shown; for tests and diagnostics. */
  get size(): number {
    return stack.length;
  },
};
