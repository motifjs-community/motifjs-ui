import { closestControl } from './control-map';
import { isShown, keepsKeys, rescueStop, tabbableIn } from './focus';
import { isHtmlElement } from './node-kind';
import { eachDocument } from './page-documents';

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

/** Installs the guard in every document of the page; every Control calls this, only the first one does anything. */
export function installFocusGuard(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  eachDocument((doc) => {
    doc.addEventListener('focusout', onFocusOut, true);
    return () => doc.removeEventListener('focusout', onFocusOut, true);
  });
}

function onFocusOut(e: FocusEvent): void {
  if (e.relatedTarget) return; // focus moves somewhere: nothing is lost
  const el = e.target;
  if (!isHtmlElement(el) || !closestControl(el)) return;
  const doc = el.ownerDocument;
  const trail: Trail = [];
  for (let n: Node | null = el; n && n !== doc.body; n = n.parentNode) {
    trail.push({ node: n, next: n.nextSibling, parent: n.parentNode });
  }
  queueMicrotask(() => {
    if (doc.activeElement && doc.activeElement !== doc.body) return;
    if (el.isConnected && isShown(el)) return; // a click on an empty spot, not a loss
    rescueFrom(el, trail)?.focus({ preventScroll: true });
  });
}

/** The next tabbable element from where `el` was, in its window (or the page); else the one before. */
function rescueFrom(el: HTMLElement, trail: Trail): HTMLElement | null {
  // Still in the document (hidden by CSS): search around the element itself.
  if (el.isConnected) {
    const scope = el.closest('dialog') ?? el.ownerDocument.body;
    return rescueStop(el, scope);
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
  const all = tabbableIn(parent.closest('dialog') ?? parent.ownerDocument.body);
  const stops = all.filter(keepsKeys);
  return stops.find(isAfter) ?? stops.filter((t) => !isAfter(t)).pop() ?? all[0] ?? null;
}
