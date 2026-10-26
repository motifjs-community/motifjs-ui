import { documentOf, isHtmlElement } from './node-kind';
import { lastFocusedDocument, pageDocuments } from './page-documents';

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * The element that really has focus, descending through open shadow roots
 * (inside a shadow tree `document.activeElement` is only the host). In the
 * document of `near` when given; else in the page's document, or in the
 * connected window (see `connectDocument`) focus went to last.
 */
export function deepActiveElement(near?: Node | null): HTMLElement | null {
  const doc = near ? documentOf(near) : focusedDocument();
  if (!doc) return null;
  let el: Element | null = doc.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return isHtmlElement(el) && el !== doc.body ? el : null;
}

/** The document that has focus, among the page's own and the connected ones: the one focus went to last. */
function focusedDocument(): Document | null {
  const docs = pageDocuments();
  if (docs.length < 2) return docs[0] ?? null;
  // Focus inside a frame makes the frame the active element of the page around it.
  const holds = (d: Document) => !!d.activeElement && d.activeElement !== d.body && d.activeElement.localName !== 'iframe';
  const last = lastFocusedDocument();
  if (last && holds(last)) return last;
  return docs.find((d) => d.hasFocus() && holds(d)) ?? docs.find(holds) ?? docs[0];
}

/** Rendered and not hidden by CSS (`display`, `visibility`, `content-visibility`); true where the API is missing. */
export function isShown(el: Element): boolean {
  return typeof el.checkVisibility === 'function' ? el.checkVisibility({ visibilityProperty: true }) : true;
}

/** Focusable elements under `root` in document order, skipping hidden, inert and CSS-hidden ones. */
export function focusableIn(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.closest('[hidden], [inert]') && isShown(el));
}

/**
 * The elements Tab visits under `root`, in document order: focusable, not
 * `tabindex="-1"`, and not inside another window (<dialog>) nested in `root`.
 */
export function tabbableIn(root: Element): HTMLElement[] {
  const ownWindow = root.closest('dialog');
  return focusableIn(root).filter((el) => el.tabIndex >= 0 && el.closest('dialog') === ownWindow);
}

/**
 * The first tabbable element of `scope` after `anchor` in document order
 * (before it when `forward` is false), skipping `anchor`'s own subtree.
 */
export function nextTabbable(anchor: Node, scope: Element, forward = true): HTMLElement | null {
  const all = tabbableIn(scope).filter((el) => !anchor.contains(el));
  const after = (el: HTMLElement) => !!(anchor.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  if (forward) return all.find(after) ?? null;
  for (let i = all.length - 1; i >= 0; i--) if (!after(all[i])) return all[i];
  return null;
}

/**
 * Whether `el` can take focus at all (by Tab or programmatically): a
 * focusable kind of element, or any `tabindex` including -1, and not
 * disabled, hidden or inert.
 */
export function isFocusable(el: Element): boolean {
  return (
    (el.matches(FOCUSABLE) || el.hasAttribute('tabindex')) &&
    !el.closest('[hidden], [inert]') &&
    !(el as HTMLButtonElement).disabled &&
    isShown(el)
  );
}

/**
 * Moves focus to the first `[autofocus]` element under `root`, else the first
 * focusable one. Returns `false` when there is nothing to focus.
 */
export function focusInitial(root: Element): boolean {
  const auto = root.querySelector<HTMLElement>('[autofocus]');
  const target = auto && !auto.closest('[hidden], [inert]') ? auto : focusableIn(root)[0];
  if (!target) return false;
  target.focus();
  return true;
}
