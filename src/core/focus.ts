import type { ComponentBase } from '@motifx/core';
import { isWithin } from './component-tree';
import type { Control } from './control';
import type { FocusMark } from './focus-mark';
import { isLiveControl, liveControls } from './live-controls';
import { documentOf, isElement, isHtmlElement, isNode } from './node-kind';
import { lastFocusedDocument, pageDocuments, windowOf } from './page-documents';

// The focus layer: the one place where the kit asks the browser about focus and moves it. What the components call
// takes and gives components. The functions marked "focus layer only" take elements: this file, focus-guard.ts and
// container.ts use them, nothing else.

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

/** A field on one line: Enter there does not start a new line. */
const LINE_FIELDS =
  'input:not([type=button],[type=submit],[type=reset],[type=image],[type=file]), select, [role=textbox]:not([aria-multiline=true]), [role=combobox], [role=spinbutton]';

/** A field: anything the user fills in or picks in, a check box and a slider included. */
const FIELDS = `${LINE_FIELDS}, textarea, [contenteditable]:not([contenteditable=false]), [role=slider], [role=switch], [role=checkbox], [role=radio], [role=listbox]`;

/** A field to type in or pick from a list (what brings up an on-screen keyboard). */
const TEXT_FIELDS =
  'input:not([type=button],[type=submit],[type=reset],[type=image],[type=file],[type=checkbox],[type=radio]), select, textarea, [role=textbox], [role=combobox], [role=spinbutton], [contenteditable]:not([contenteditable=false])';

/** Parts that stand for a component elsewhere (`standFor`): focus in the part counts as focus in that component. */
/** Inputs that leave the arrow keys to the control around them. */
const ARROW_INPUTS_OUT = ['button', 'submit', 'reset', 'checkbox', 'radio', 'color', 'file', 'image'];

const standIns = new Map<ComponentBase, ComponentBase>();
/** Parts whose disposal already takes their place as a stand-in away. */
const watched = new WeakSet<ComponentBase>();

/**
 * The element that really has focus, descending through open shadow roots
 * (inside a shadow tree `document.activeElement` is only the host). In the
 * document of `near` when given; else in the page's document, or in the
 * connected window (see `connectDocument`) focus went to last. Focus layer only.
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

/** Rendered and not hidden by CSS (`display`, `visibility`, `content-visibility`); true where the API is missing. Focus layer only. */
export function isShown(el: Element): boolean {
  return typeof el.checkVisibility === 'function' ? el.checkVisibility({ visibilityProperty: true }) : true;
}

/** Focusable elements under `root` in document order, skipping hidden, inert and CSS-hidden ones. Focus layer only. */
export function focusableIn(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.closest('[hidden], [inert]') && isShown(el));
}

/**
 * The elements Tab visits under `root`, in document order: focusable, not `tabindex="-1"`, and not inside a window (a
 * Control that is one) nested in `root`. Focus layer only.
 */
export function tabbableIn(root: Element): HTMLElement[] {
  const nested = windowsInside(root);
  return focusableIn(root).filter((el) => el.tabIndex >= 0 && !nested.some((w) => w.contains(el)));
}

/**
 * The first tabbable element of `scope` after `anchor` in document order
 * (before it when `forward` is false), skipping `anchor`'s own subtree. Focus layer only.
 */
export function nextTabbable(anchor: Node, scope: Element, forward = true): HTMLElement | null {
  const all = tabbableIn(scope).filter((el) => !anchor.contains(el));
  const after = (el: HTMLElement) => !!(anchor.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  if (forward) return all.find(after) ?? null;
  for (let i = all.length - 1; i >= 0; i--) if (!after(all[i])) return all[i];
  return null;
}

/**
 * Where focus goes when `anchor` can no longer hold it: the next tabbable element of `scope`, else the one
 * before it. An iframe is the last choice, because keys pressed inside it never reach the page. Focus layer only.
 */
export function rescueStop(anchor: Node, scope: Element): HTMLElement | null {
  const stops = tabbableIn(scope).filter((el) => !anchor.contains(el) && keepsKeys(el));
  const after = (el: HTMLElement) => !!(anchor.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  return stops.find(after) ?? stops.filter((el) => !after(el)).pop() ?? nextTabbable(anchor, scope) ?? nextTabbable(anchor, scope, false);
}

/**
 * Whether `el` can take focus at all (by Tab or programmatically): a
 * focusable kind of element, or any `tabindex` including -1, and not
 * disabled, hidden or inert. Focus layer only.
 */
export function isFocusable(el: Element): boolean {
  return (
    (el.matches(FOCUSABLE) || el.hasAttribute('tabindex')) &&
    !el.closest('[hidden], [inert]') &&
    !(el as HTMLButtonElement).disabled &&
    isShown(el)
  );
}

/** Keys pressed inside an iframe never reach the page, so focus on open skips it and Escape keeps working. Focus layer only. */
export function keepsKeys(el: Element): boolean {
  return el.localName !== 'iframe';
}

/**
 * Moves focus to the first `[autofocus]` element under `root`, else the first
 * focusable one that is not an iframe. Returns `false` when there is nothing to focus. Focus layer only.
 */
export function focusInitial(root: Element): boolean {
  const auto = root.querySelector<HTMLElement>('[autofocus]');
  const target = auto && !auto.closest('[hidden], [inert]') ? auto : focusableIn(root).find(keepsKeys);
  if (!target) return false;
  target.focus();
  return true;
}

/**
 * Where focus goes when `area` stops being usable while it holds focus: the
 * next tabbable element after it in the same window (or page), else the one
 * before it. `null` when focus is not inside `area` or nothing else is usable. Focus layer only.
 */
export function rescueTarget(area: Element): HTMLElement | null {
  const active = deepActiveElement();
  if (!active || !area.contains(active)) return null;
  return rescueStop(area, windowElementAround(area.parentNode) ?? area.ownerDocument.body);
}

/** The element of the innermost window (a Control that is one) holding `node`, `null` when none does. Focus layer only. */
export function windowElementAround(node: Node | null): Element | null {
  if (!node) return null;
  let found: Element | null = null;
  for (const control of liveControls()) {
    if (!control.isWindow) continue;
    const el = elementOf(control);
    if (el && el.contains(node) && (!found || found.contains(el))) found = el;
  }
  return found;
}

/**
 * The element of the nearest window (a Control that is one) above `part` in the component tree, `part` itself
 * included with `self`; `null` when there is none. Focus layer only.
 */
export function windowElementOf(part: ComponentBase, self = false): Element | null {
  for (let c: ComponentBase | null = self ? part : part.parent; c; c = c.parent) {
    if (isLiveControl(c) && c.isWindow) return elementOf(c);
  }
  return null;
}

/** The Control `part` counts as: the part itself when it is one, else the Control it stands for (`standFor`). */
export function controlFor(part: ComponentBase): Control | null {
  if (isLiveControl(part)) return part;
  const owner = standIns.get(part);
  return isLiveControl(owner) ? owner : null;
}

/** Whether `node` is in `part`, or in a part standing for it or for a component inside it. Focus layer only. */
export function holdsNode(part: ComponentBase, node: Node): boolean {
  // Focus inside a shadow tree counts for the part holding its host.
  for (let n: Node | null = node; n; n = shadowHostOf(n)) {
    if (elementOf(part)?.contains(n)) return true;
    for (const [stand, owner] of standIns) {
      if (elementOf(stand)?.contains(n) && isWithin(owner, part)) return true;
    }
  }
  return false;
}

/** Whether an event started in a part that stands for a component (`standFor`). Focus layer only. */
export function isFromStandIn(e: Event): boolean {
  for (const stand of standIns.keys()) if (stand.motif.isEventFrom(e)) return true;
  return false;
}

/** The place of `el`, to give it focus again later. Focus layer only. */
export function markOf(el: HTMLElement): FocusMark {
  return {
    restore(options) {
      if (!el.isConnected) return false;
      if (deepActiveElement(el) === el) return true;
      return isFocusable(el) && moveTo(el, options);
    },
    isIn(part) {
      return holdsNode(part, el);
    },
  };
}

// What components call: components in, components out.

/** Sets focus on a component's element. */
export function focusOn(part: ComponentBase, options?: FocusOptions): void {
  (elementOf(part) as HTMLElement | null)?.focus(options);
}

/** Sets focus on a text field or text area and selects all of its text, as the page's selection. */
export function focusAndSelect(part: ComponentBase): void {
  const el = elementOf(part) as HTMLTextAreaElement | null;
  if (!el) return;
  el.focus({ preventScroll: true });
  if (typeof el.select === 'function') el.select();
}

/** Whether focus is on a component's element. */
export function isFocused(part: ComponentBase): boolean {
  const el = elementOf(part);
  return !!el && deepActiveElement(el) === el;
}

/**
 * Whether focus is on a component or inside it (CSS `:focus-within`), a part standing for it (`standFor`) included:
 * focus in the component's document, or with `event` in the document the event came from (a key goes where focus is).
 */
export function holdsFocus(part: ComponentBase, event?: Event): boolean {
  const el = elementOf(part);
  if (!el) return false;
  const active = event ? activeOf(event) : deepActiveElement(el);
  return !!active && holdsNode(part, active);
}

/** Whether a component can take focus now: a focusable kind of element or one with a tabindex, not disabled, hidden or inert, and shown. */
export function canTakeFocus(part: ComponentBase): boolean {
  const el = elementOf(part);
  return !!el && el.isConnected && isFocusable(el);
}

/** Whether anything inside a component can take focus now. */
export function hasFocusableIn(part: ComponentBase): boolean {
  const el = elementOf(part);
  return !!el && focusableIn(el).length > 0;
}

/**
 * Whether anything inside a component can take focus by its markup: a focusable element not under `[hidden]` or
 * `[inert]`. No style is read, so the page is not laid out for it (what only CSS hides counts as focusable).
 */
export function holdsFocusable(part: ComponentBase): boolean {
  const el = elementOf(part);
  return !!el && Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).some((e) => !e.closest('[hidden], [inert]'));
}

/**
 * Moves focus to the first element of a kind inside a component: `'any'` (the default) an `[autofocus]` one, else
 * the first that takes focus and keeps the keys (not a frame); `'autofocus'` only an `[autofocus]` one; `'field'` the
 * first field (a box, a list, a check box, a slider…); `'text'` the first field to type in or pick from; `'stop'` the
 * first Tab stop that keeps the keys. Returns whether focus is there now.
 */
export function focusFirstIn(part: ComponentBase, kind: 'any' | 'autofocus' | 'field' | 'text' | 'stop' = 'any', options?: FocusOptions): boolean {
  const root = elementOf(part);
  const target = root ? firstOfKind(root, kind) : null;
  return !!target && moveTo(target, options);
}

/**
 * Moves focus among the Tab stops inside a component: to the first or the last, or to the next or the previous one
 * from where focus is. Returns `false` when there is none there (an edge, or no stop at all).
 */
export function focusStopIn(part: ComponentBase, which: 'first' | 'last' | 'next' | 'previous', options?: FocusOptions): boolean {
  const root = elementOf(part);
  if (!root) return false;
  const stops = tabbableIn(root);
  const current = deepActiveElement(root);
  const inside = !!current && root.contains(current);
  let target: HTMLElement | undefined;
  if (which === 'first' || (which === 'next' && !inside)) target = stops[0];
  else if (which === 'last' || !inside) target = stops[stops.length - 1];
  else if (which === 'next') target = stops.find((el) => follows(current!, el));
  else target = stops.filter((el) => el !== current && !follows(current!, el)).pop();
  return !!target && moveTo(target, options);
}

/**
 * Moves focus off a component: to the next Tab stop after it in its window (or the page), else to the one before it,
 * never to one inside it. A frame is the last choice: keys pressed inside it never reach the page. Returns whether
 * focus moved there.
 */
export function focusAway(part: ComponentBase, options?: FocusOptions): boolean {
  const el = elementOf(part);
  const target = el ? rescueStop(el, windowElementOf(part) ?? documentOf(el).body) : null;
  return !!target && moveTo(target, options);
}

/** Moves focus to the first Tab stop past a component in its window (or the page), before it when `forward` is false. */
export function focusPast(part: ComponentBase, forward = true, options?: FocusOptions): boolean {
  const el = elementOf(part);
  const target = el ? nextTabbable(el, windowElementOf(part) ?? documentOf(el).body, forward) : null;
  return !!target && moveTo(target, options);
}

/** Takes focus off whatever has it inside a component; focus goes to the page. */
export function releaseFocus(part: ComponentBase): void {
  const el = elementOf(part);
  const active = el ? deepActiveElement(el) : null;
  if (active && el!.contains(active)) active.blur();
}

let settingAside = false;

/**
 * Takes focus out of `part` on purpose, to give it back soon (`FocusMark.restore`): the focus guard leaves it on the page
 * meanwhile instead of moving it on.
 */
export function setFocusAside(part: ComponentBase): void {
  settingAside = true;
  try {
    releaseFocus(part);
  } finally {
    settingAside = false;
  }
}

/** Whether focus is being taken out on purpose now (`setFocusAside`). */
export function isSettingFocusAside(): boolean {
  return settingAside;
}

/**
 * Moves focus out of `area` when it holds it and is about to stop being usable: to the next tabbable element
 * of its window (or page), else the one before. The page is not scrolled: the user did not move there.
 */
export function rescueFocus(area: ComponentBase): void {
  if (holdsFocus(area)) focusAway(area, { preventScroll: true });
}

/** Remembers where focus is now (with `event`, in the document the event came from), to give it back later; `null` when nothing has it. */
export function rememberFocus(event?: Event): FocusMark | null {
  const active = event ? activeOf(event) : deepActiveElement();
  return active ? markOf(active) : null;
}

/** Whether focus is in a field that takes typing: a text box, a text area, a list box, an editable region. */
export function focusInTextField(event?: Event): boolean {
  return isEditable(event ? activeOf(event) : deepActiveElement());
}

/** Whether focus is in a field that keeps the arrow keys and Home and End for itself: a text field, or a slider. */
export function focusInArrowField(event?: Event): boolean {
  const active = event ? activeOf(event) : deepActiveElement();
  if (!active) return false;
  if (active.isContentEditable || active.localName === 'textarea' || active.localName === 'select') return true;
  if (active.getAttribute('role') === 'slider') return true;
  return active.localName === 'input' && !ARROW_INPUTS_OUT.includes((active as HTMLInputElement).type);
}

/** Whether focus is going into the part (or a part standing for it): the related target of a focus event. */
export function focusGoesInto(part: ComponentBase, e: FocusEvent): boolean {
  const next = e.relatedTarget as Node | null;
  return !!next && typeof next.nodeType === 'number' && holdsNode(part, next);
}

/** Whether the focus is shown as keyboard focus (the browser's focus-visible rule), in the document the event came from. */
export function focusIsVisible(event?: Event): boolean {
  const active = event ? activeOf(event) : deepActiveElement();
  if (!active) return false;
  try {
    return active.matches(':focus-visible');
  } catch {
    return true;
  }
}

/** Whether focus is in a field on one line, where Enter does not start a new line. */
export function focusInLineField(event?: Event): boolean {
  const active = event ? activeOf(event) : deepActiveElement();
  return !!active && active.matches(LINE_FIELDS);
}

/** The window (a Control that is one) focus is in, the innermost; `null` when focus is in none. */
export function focusedWindow(event?: Event): Control | null {
  const active = event ? activeOf(event) : deepActiveElement();
  if (!active) return null;
  let found: Control | null = null;
  for (const control of liveControls()) {
    if (control.isWindow && holdsNode(control, active) && (!found || isWithin(control, found))) found = control;
  }
  return found;
}

/** The browser window focus is in: the page's own, or the one it opened (`connectDocument`) focus went to last. */
export function windowWithFocus(): Window | null {
  return focusedDocument()?.defaultView ?? null;
}

/**
 * Whether the browser window `part` is in (`windowOf`) has focus: the one the user works in. True where the page
 * cannot tell (no `hasFocus`), so a check never stops what it guards; false without a window.
 */
export function windowHasFocus(part: ComponentBase): boolean {
  const doc = windowOf(part)?.document;
  if (!doc) return false;
  return typeof doc.hasFocus === 'function' ? doc.hasFocus() : true;
}

/** Brings the browser window `part` is in to the front, unless it has focus already. */
export function bringWindowUp(part: ComponentBase): void {
  const view = windowOf(part);
  if (view && !windowHasFocus(part)) view.focus();
}

/** The browser window an event came from: the page's own, or one the page opened. */
export function windowOfEvent(e: Event): Window | null {
  const at = sourceOf(e);
  return at ? documentOf(at).defaultView : null;
}

/** Whether a component is rendered: in the page, and not hidden by CSS (`display`, `visibility`, `content-visibility`). */
export function isRendered(part: ComponentBase): boolean {
  const el = elementOf(part);
  return !!el && el.isConnected && isShown(el);
}

/**
 * Makes focus in `part` count as focus in `owner`, for a part of a component that stands elsewhere: a tab's header in
 * its strip, a page of a component moved into a window of its own. It ends when `part` is disposed, or with the
 * function returned.
 */
export function standFor(part: ComponentBase, owner: ComponentBase): () => void {
  standIns.set(part, owner);
  if (!watched.has(part)) {
    watched.add(part);
    part.motif.setDisposable(() => standIns.delete(part));
  }
  return () => {
    if (standIns.get(part) === owner) standIns.delete(part);
  };
}

function elementOf(part: ComponentBase | null | undefined): Element | null {
  const el: unknown = part?.element;
  return isElement(el) ? el : null;
}

/** Where an event is listened to: the document of a key listener, else the node it started at. */
function sourceOf(e: Event): Node | null {
  if (isNode(e.currentTarget)) return e.currentTarget;
  return isNode(e.target) ? e.target : null;
}

/** The element that has focus in the document an event came from. */
function activeOf(e: Event): HTMLElement | null {
  const at = sourceOf(e);
  return at ? deepActiveElement(at) : deepActiveElement();
}

/** The elements of the windows (Controls that are windows) nested in `root`. */
function windowsInside(root: Element): Element[] {
  const found: Element[] = [];
  for (const control of liveControls()) {
    if (!control.isWindow) continue;
    const el = elementOf(control);
    if (el && el !== root && root.contains(el)) found.push(el);
  }
  return found;
}

function firstOfKind(root: Element, kind: 'any' | 'autofocus' | 'field' | 'text' | 'stop'): HTMLElement | null {
  if (kind === 'any' || kind === 'autofocus') {
    const auto = root.querySelector<HTMLElement>('[autofocus]');
    if (auto && isFocusable(auto)) return auto;
    if (kind === 'autofocus') return null;
  }
  const all = focusableIn(root);
  if (kind === 'field') return all.find((el) => el.matches(FIELDS)) ?? null;
  if (kind === 'text') return all.find((el) => el.matches(TEXT_FIELDS)) ?? null;
  if (kind === 'stop') return all.find((el) => el.tabIndex >= 0 && keepsKeys(el)) ?? null;
  return all.find(keepsKeys) ?? null;
}

/** The shadow host `n` sits under, or `null` outside a shadow tree. */
function shadowHostOf(n: Node): Node | null {
  const root = n.getRootNode();
  return root !== n && 'host' in root ? ((root as ShadowRoot).host ?? null) : null;
}

function isEditable(el: Element | null): boolean {
  if (!el) return false;
  if ((el as HTMLElement).isContentEditable) return true;
  if (el.localName === 'textarea' || el.localName === 'select') return true;
  return el.localName === 'input' && !['button', 'submit', 'reset', 'checkbox', 'radio', 'range', 'color', 'file'].includes((el as HTMLInputElement).type);
}

/** Whether `el` comes after `anchor` in document order (inside it too). */
function follows(anchor: Node, el: Node): boolean {
  return anchor !== el && !!(anchor.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
}

function moveTo(target: HTMLElement, options?: FocusOptions): boolean {
  target.focus(options);
  return deepActiveElement(target) === target;
}
