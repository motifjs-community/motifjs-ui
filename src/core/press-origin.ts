import { eachDocument } from './page-documents';
import { isHtmlElement } from './node-kind';

// Where a press began, for a design language to draw from: a part that shows presses carries
// `data-mx-press`; while it is held it gets `data-pressed`, and `--_press-x` / `--_press-y` hold the
// point (pixels from its top left corner) a ripple or a state layer grows from. Keys press it from its
// middle. One listener per document for all of them.

let installed = false;

/** Installs the listeners in every document of the page; only the first call does anything. */
export function installPressOrigin(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  eachDocument((doc) => {
    doc.addEventListener('pointerdown', onPointerDown, true);
    doc.addEventListener('keydown', onKeyDown, true);
    doc.addEventListener('keyup', release, true);
    doc.addEventListener('pointerup', release, true);
    doc.addEventListener('pointercancel', release, true);
    return () => {
      doc.removeEventListener('pointerdown', onPointerDown, true);
      doc.removeEventListener('keydown', onKeyDown, true);
      doc.removeEventListener('keyup', release, true);
      doc.removeEventListener('pointerup', release, true);
      doc.removeEventListener('pointercancel', release, true);
    };
  });
}

let pressed: HTMLElement | null = null;

function partOf(target: EventTarget | null): HTMLElement | null {
  return isHtmlElement(target) ? target.closest<HTMLElement>('[data-mx-press]') : null;
}

function press(part: HTMLElement, x: number, y: number): void {
  if (pressed && pressed !== part) pressed.removeAttribute('data-pressed');
  pressed = part;
  part.style.setProperty('--_press-x', `${Math.round(x)}px`);
  part.style.setProperty('--_press-y', `${Math.round(y)}px`);
  // Written again so a language's ripple starts over on every press.
  part.removeAttribute('data-pressed');
  void part.offsetWidth;
  part.setAttribute('data-pressed', '');
}

function onPointerDown(e: PointerEvent): void {
  if (e.button !== 0) return;
  const part = partOf(e.target);
  if (!part) return;
  const box = part.getBoundingClientRect();
  press(part, e.clientX - box.left, e.clientY - box.top);
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return;
  const part = partOf(e.target);
  if (!part) return;
  press(part, part.offsetWidth / 2, part.offsetHeight / 2);
}

function release(): void {
  pressed?.removeAttribute('data-pressed');
  pressed = null;
}
