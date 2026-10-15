import { closestControl } from './control-map';
import { isShown, nextTabbable, tabbableIn } from './focus';

// Focus must never fall to <body> because a control went away: disposed,
// removed by a list or a branch, hidden by CSS. Browsers fire `focusout`
// synchronously while the element is still in the document, so one listener
// on the document can note where it was; a microtask later, if focus did land
// on <body> and the element is really gone or hidden (not a click on an empty
// spot), focus moves to the next usable element from that spot. Only focus
// inside a Control is guarded: the package's rule, and route changes stay the
// router's business.

/** Where the lost element sat: each ancestor with the sibling that followed it. */
type Trail = { node: Node; next: Node | null; parent: Node | null }[];

let installed = false;

/** Installs the guard once per document; every Control calls this, only the first one does anything. */
export function installFocusGuard(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('focusout', onFocusOut, true);
}

function onFocusOut(e: FocusEvent): void {
  if (e.relatedTarget) return; // focus moves somewhere: nothing is lost
  const el = e.target;
  if (!(el instanceof HTMLElement) || !closestControl(el)) return;
  const trail: Trail = [];
  for (let n: Node | null = el; n && n !== document.body; n = n.parentNode) {
    trail.push({ node: n, next: n.nextSibling, parent: n.parentNode });
  }
  queueMicrotask(() => {
    if (document.activeElement && document.activeElement !== document.body) return;
    if (el.isConnected && isShown(el)) return; // a click on an empty spot, not a loss
    rescueFrom(el, trail)?.focus({ preventScroll: true });
  });
}

/** The next tabbable element from where `el` was, in its window (or the page); else the one before. */
function rescueFrom(el: HTMLElement, trail: Trail): HTMLElement | null {
  // Still in the document (hidden by CSS): search around the element itself.
  if (el.isConnected) {
    const scope = el.closest('dialog') ?? document.body;
    return nextTabbable(el, scope) ?? nextTabbable(el, scope, false);
  }
  // Removed: the topmost removed ancestor's parent and old next sibling mark the spot.
  const step = trail.find((s) => !s.node.isConnected && s.parent?.isConnected);
  if (!step) return null;
  const parent = step.parent as Element;
  const next = step.next?.parentNode === parent ? step.next : null;
  const isAfter = (t: HTMLElement) =>
    next
      ? t === next || !!(next.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING)
      : !parent.contains(t) && !!(parent.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING);
  const all = tabbableIn(parent.closest('dialog') ?? document.body);
  return all.find(isAfter) ?? all.filter((t) => !isAfter(t)).pop() ?? null;
}
