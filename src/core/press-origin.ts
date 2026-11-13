import type { ComponentBase } from '@motifx/core';
import { boxOf, rectOf } from './measure';
import { eachDocument } from './page-documents';
import { css, mark } from './part-writes';
import { onDocument } from './window-events';

// Where a click began, for a design language to draw from: a part that shows presses is noted with
// `showsPresses` and carries `data-mx-press`; while it is held it gets `data-pressed`, and `--_press-x` /
// `--_press-y` hold the point (pixels from its top left corner) a ripple or a state layer grows from. Keys
// press it from its middle. The part pressed is found in the component tree: the innermost noted part the
// event came from. One listener per document for all of them.

let installed = false;

/** The parts that show presses. */
const parts = new Set<ComponentBase>();

/** Notes that `part` shows presses: it carries `data-mx-press`, and a press on it writes where it began. Forgotten when it is disposed. */
export function showsPresses(part: ComponentBase): void {
  if (part.isDisposed || parts.has(part)) return;
  parts.add(part);
  mark(part, 'data-mx-press', true);
  part.motif.setDisposable(() => parts.delete(part));
}

/** Installs the listeners in every document of the page; only the first call does anything. */
export function installPressOrigin(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  eachDocument((doc) => {
    const stops = [
      onDocument(doc, 'pointerdown', onPointerDown, true),
      onDocument(doc, 'keydown', onKeyDown, true),
      onDocument(doc, 'keyup', release, true),
      onDocument(doc, 'pointerup', release, true),
      onDocument(doc, 'pointercancel', release, true),
    ];
    return () => {
      for (const stop of stops) stop();
    };
  });
}

let pressed: ComponentBase | null = null;

/** The innermost part that shows presses the event came from. */
function partOf(e: Event): ComponentBase | null {
  let found: ComponentBase | null = null;
  for (const part of parts) {
    if (part.isDisposed) {
      parts.delete(part);
      continue;
    }
    if (part.motif.isEventFrom(e) && (!found || isInside(part, found))) found = part;
  }
  return found;
}

function isInside(part: ComponentBase, outer: ComponentBase): boolean {
  for (let at = part.parent; at; at = at.parent) if (at === outer) return true;
  return false;
}

function press(part: ComponentBase, x: number, y: number): void {
  if (pressed && pressed !== part && !pressed.isDisposed) mark(pressed, 'data-pressed', false);
  pressed = part;
  css(part, '--_press-x', `${Math.round(x)}px`);
  css(part, '--_press-y', `${Math.round(y)}px`);
  // Written again so a language's ripple starts over on every press: the box is read in between.
  mark(part, 'data-pressed', false);
  void boxOf(part).offsetWidth;
  mark(part, 'data-pressed', true);
}

function onPointerDown(e: PointerEvent): void {
  if (e.button !== 0) return;
  const part = partOf(e);
  if (!part) return;
  const rect = rectOf(part);
  press(part, e.clientX - rect.left, e.clientY - rect.top);
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return;
  const part = partOf(e);
  if (!part) return;
  const box = boxOf(part);
  press(part, box.offsetWidth / 2, box.offsetHeight / 2);
}

function release(): void {
  if (pressed && !pressed.isDisposed) mark(pressed, 'data-pressed', false);
  pressed = null;
}
