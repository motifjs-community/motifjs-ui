/** What the stack needs from a shown window: its element and an active flag it can flip. */
export interface StackedWindow {
  readonly element: HTMLElement;
  setActive(active: boolean): void;
}

const stack: StackedWindow[] = [];

function renumber(): void {
  stack.forEach((w, i) => {
    // z-index itself comes from CSS: calc(var(--mx-z-overlay) + var(--_mx-z)).
    w.element.style.setProperty('--_mx-z', String(i));
    w.setActive(i === stack.length - 1);
  });
}

/**
 * The page-wide order of shown windows. The last one is
 * on top and active. Modal windows also sit here so "which window is active"
 * has one answer, even though the browser's top layer stacks them itself.
 */
export const windowStack = {
  /** Adds the window on top, or moves it there. */
  bringToFront(w: StackedWindow): void {
    const i = stack.indexOf(w);
    if (i === stack.length - 1 && i !== -1) return;
    if (i !== -1) stack.splice(i, 1);
    stack.push(w);
    renumber();
  },
  remove(w: StackedWindow): void {
    const i = stack.indexOf(w);
    if (i === -1) return;
    stack.splice(i, 1);
    w.setActive(false);
    renumber();
  },
  /** The active (top) window, or `undefined`. */
  top(): StackedWindow | undefined {
    return stack[stack.length - 1];
  },
  /** Number of windows currently shown; for tests and diagnostics. */
  get size(): number {
    return stack.length;
  },
};
