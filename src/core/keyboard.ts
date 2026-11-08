import { Emitter, type ComponentBase } from '@motifx/core';
import { accessKeyModifiers } from './access-key';
import { closestControl, controlOf } from './control-map';
import { deepActiveElement, isShown } from './focus';
import { documentOf, isNode } from './node-kind';
import { eachDocument, pageDocuments } from './page-documents';
import { isApplePlatform } from './platform';
import { windowStack } from './window-stack';

// One capture-phase keydown listener on the document serves every shortcut
// and every access key of the app. Capture, because windows stop key events
// at their root; one listener, so controls pay nothing per instance. It is
// installed the first time a shortcut or an access key is registered, in the
// page's document and in each one connected to it (`connectDocument`).
//
// Order: an explicit chord takes precedence over an implicit access key.
//   1. shortcuts: the most specific scope that holds focus first, app-wide last;
//   2. access keys (Alt + letter; Control + Option + letter on Apple
//      platforms) of the active window, else of the page.
// A shortcut may be two chords in a row (`Ctrl+K W`): the first one waits for
// the second, and the key after it is taken either way.

/** The options of `addShortcut`, besides the chord and the handler. */
export interface ShortcutOptions {
  /**
   * Limits the shortcut to times when focus is inside this component and it is
   * enabled. Without it, the shortcut is application-wide.
   */
  scope?: ComponentBase;
  /**
   * Also enables the shortcut in text fields. By default, a chord without Ctrl, Alt
   * or Meta (Delete, a letter, Escape…) does not fire in text fields. Function keys
   * and chords with those modifiers always work.
   */
  inEditable?: boolean;
  /**
   * What it does: the key of a command, or a component's own name for it (`tabDocuments.closeTab`). A shortcut with a
   * name takes the keys the user gave to that name (`shortcuts.keymap`) in place of its own, and shortcuts with the same
   * name share them.
   */
  name?: string;
  /** How it reads in a list of shortcuts. The default is `name`. */
  text?: string | (() => string);
  /** The heading a list of shortcuts groups it under, such as `File`. */
  category?: string | (() => string);
  /** Whether the user's keys take the place of its own. The default is `true`; without a name it never is. */
  customizable?: boolean;
}

/** Return `false` from a handler to pass the key on, to a less specific shortcut and then the page. */
export type ShortcutHandler = (e: KeyboardEvent) => void | boolean;

export interface Chord {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  /** Lower-case `KeyboardEvent.key`, or a single lower-case character. */
  key: string;
}

export interface Registration {
  /** The keys it was given. */
  defaults: readonly string[];
  /** The keys that run it now: the user's for its name, else `defaults`. */
  keys: readonly string[];
  /** Each of `keys` read, in the same order: one chord, or the chords pressed one after the other. */
  sequences: Chord[][];
  handler: ShortcutHandler;
  scope: ComponentBase | null;
  inEditable: boolean;
  name: string | null;
  text: string | (() => string) | null;
  category: string | (() => string) | null;
  customizable: boolean;
}

/** A shortcut and one of its key sequences, as a key press finds it. */
interface Hit {
  reg: Registration;
  chords: Chord[];
}

const registrations = new Set<Registration>();
/** The keys the user gave, by the name of the shortcut. */
let userKeys: Readonly<Record<string, readonly string[]>> = {};
/** @internal Tells `shortcuts` that one was added (the registration) or taken away (`null`). */
export const shortcutChanges = new Emitter<Registration | null>();

/** @internal The shortcuts registered now, in the order they came. */
export function registered(): readonly Registration[] {
  return [...registrations];
}
/** @internal The keys the user gave, by name (`shortcuts.keymap`). */
export function givenKeys(): Readonly<Record<string, readonly string[]>> {
  return userKeys;
}

/** @internal Sets the keys the user gave: every shortcut with one of those names takes them at once. */
export function setGivenKeys(map: Readonly<Record<string, readonly string[]>>): void {
  userKeys = map;
  for (const reg of registrations) readKeys(reg);
  shortcutChanges.fire(null);
}

/** The keys of a shortcut now: the user's for its name, else its own. Keys of the user's that read as none are left out. */
function readKeys(reg: Registration): void {
  const given = reg.name !== null && reg.customizable ? userKeys[reg.name] : undefined;
  const keys: string[] = [];
  reg.sequences = [];
  for (const text of given ?? reg.defaults) {
    try {
      reg.sequences.push(parseShortcut(text));
      keys.push(text);
    } catch {
      // Keys without a key run nothing.
    }
  }
  reg.keys = keys;
}

let installed = false;
/** The shortcuts whose first chords were pressed, waiting for the next one. */
let pending: { hits: Hit[]; step: number } | null = null;

const KEY_ALIASES: Record<string, string> = {
  esc: 'escape',
  del: 'delete',
  ins: 'insert',
  space: ' ',
  spacebar: ' ',
  plus: '+',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  return: 'enter',
};

/**
 * Parses `'Ctrl+S'`, `'Mod+Shift+P'`, `'F2'`, `'Alt+ArrowUp'`. Modifiers:
 * Ctrl (Control), Alt (Option), Shift, Meta (Cmd, Win) and Mod (Cmd on
 * Apple platforms, Ctrl elsewhere). Case does not matter.
 */
export function parseChord(text: string): Chord {
  const parts = text.split('+');
  // 'Ctrl++' → the key is '+'.
  if (parts.at(-1) === '' && parts.length > 1) {
    parts.splice(-2, 2, '+');
  }
  const chord: Chord = { ctrl: false, alt: false, shift: false, meta: false, key: '' };
  for (const raw of parts) {
    const p = raw.trim().toLowerCase();
    if (p === 'ctrl' || p === 'control') chord.ctrl = true;
    else if (p === 'alt' || p === 'option') chord.alt = true;
    else if (p === 'shift') chord.shift = true;
    else if (p === 'meta' || p === 'cmd' || p === 'win') chord.meta = true;
    else if (p === 'mod') isApplePlatform() ? (chord.meta = true) : (chord.ctrl = true);
    else chord.key = KEY_ALIASES[p] ?? p;
  }
  if (!chord.key) throw new Error(`addShortcut: no key in "${text}".`);
  return chord;
}

/** Parses one chord or chords one after the other, split by spaces: `'Ctrl+K W'`. */
export function parseShortcut(text: string): Chord[] {
  return text
    .trim()
    .split(/(?<!\+)\s+(?!\+)/)
    .map(parseChord);
}

/** Whether a text reads as keys `addShortcut` takes: one without a key does not. */
export function isKeys(text: string): boolean {
  try {
    parseShortcut(text);
    return true;
  } catch {
    return false;
  }
}

function keyMatches(chord: Chord, e: KeyboardEvent): boolean {
  return e.key.toLowerCase() === chord.key || physicalKeyMatches(chord.key, e);
}

/**
 * A Latin letter or digit pressed where `key` reports something else (a
 * non-Latin layout, Shift turning 1 into !, Option typing ß on a Mac): match
 * the physical key instead.
 */
function physicalKeyMatches(key: string, e: KeyboardEvent): boolean {
  if (key.length !== 1) return false;
  const code = /[a-z]/.test(key) ? `Key${key.toUpperCase()}` : /[0-9]/.test(key) ? `Digit${key}` : '';
  return !!code && e.code === code;
}

function matches(chord: Chord, e: KeyboardEvent): boolean {
  return (
    e.ctrlKey === chord.ctrl &&
    e.altKey === chord.alt &&
    e.shiftKey === chord.shift &&
    e.metaKey === chord.meta &&
    keyMatches(chord, e) &&
    !typesWithAltGr(chord, e)
  );
}

/**
 * Elsewhere than on Apple platforms Ctrl+Alt is AltGr, which types characters (`{`, `@`, `ą`) on
 * many keyboards: a Ctrl+Alt chord does not take a key that typed something other than its own.
 */
function typesWithAltGr(chord: Chord, e: KeyboardEvent): boolean {
  if (!chord.ctrl || !chord.alt || isApplePlatform()) return false;
  if (e.key.length !== 1 || e.key.toLowerCase() === chord.key) return false;
  return !/\p{L}/u.test(e.key) || !!e.getModifierState?.('AltGraph');
}

/**
 * Registers a keyboard shortcut. It is application-wide by default, except while a
 * modal form is open and for plain keys while focus is in a window. With `scope`, it
 * is active only while focus is inside that component. Returns a function that
 * removes it. `Control.addShortcut` does the same and removes it when the control
 * is disposed. Two chords separated by a space are pressed in sequence (`'Ctrl+K W'`);
 * a list gives several keys that do the same. With a `name`, the keys the user gave
 * to that name (`shortcuts.keymap`) take the place of these.
 *
 * @example
 * const remove = addShortcut('Ctrl+S', () => model.save(), { name: 'save', text: 'Save' });
 * addShortcut('Delete', () => grid.deleteSelected(), { scope: grid });
 * addShortcut(['Ctrl+K Ctrl+W', 'Ctrl+Shift+W'], () => docs.closeAll());
 */
export function addShortcut(keys: string | readonly string[], handler: ShortcutHandler, options: ShortcutOptions = {}): () => void {
  installKeyboard();
  const defaults = typeof keys === 'string' ? [keys] : [...keys];
  // Keys without a key are a slip of the code: said at once.
  for (const text of defaults) parseShortcut(text);
  const reg: Registration = {
    defaults,
    keys: defaults,
    sequences: [],
    handler,
    scope: options.scope ?? null,
    inEditable: !!options.inEditable,
    name: options.name ?? null,
    text: options.text ?? null,
    category: options.category ?? null,
    customizable: options.customizable !== false,
  };
  readKeys(reg);
  registrations.add(reg);
  shortcutChanges.fire(reg);
  return () => {
    if (registrations.delete(reg)) shortcutChanges.fire(null);
  };
}

/**
 * Whether a key event is one of the chords (`'Shift+Tab'`, `'Ctrl+Alt+ArrowLeft'`), as a shortcut
 * would match it. For keys a component reads itself while a mode of its own is on.
 */
export function isChord(chords: readonly string[], e: KeyboardEvent): boolean {
  for (const text of chords) {
    try {
      if (matches(parseChord(text), e)) return true;
    } catch {
      // A chord without a key matches nothing.
    }
  }
  return false;
}

/** @internal Installs the document listener (once). Access keys call it when they first appear. */
export function installKeyboard(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  eachDocument((doc) => {
    const view = doc.defaultView;
    doc.addEventListener('keydown', onKeyDown, true);
    doc.addEventListener('keyup', onKeyUp, true);
    doc.addEventListener('pointerdown', hideAccessKeys, true);
    view?.addEventListener('blur', hideAccessKeys);
    return () => {
      doc.removeEventListener('keydown', onKeyDown, true);
      doc.removeEventListener('keyup', onKeyUp, true);
      doc.removeEventListener('pointerdown', hideAccessKeys, true);
      view?.removeEventListener('blur', hideAccessKeys);
    };
  });
}

/** The document a key event came from: the listener sits on it. */
function eventDocument(e: Event): Document {
  const at = e.currentTarget;
  return isNode(at) ? documentOf(at) : document;
}

function isEditable(el: Element | null): boolean {
  if (!el) return false;
  if ((el as HTMLElement).isContentEditable) return true;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
  return el.tagName === 'INPUT' && !['button', 'submit', 'reset', 'checkbox', 'radio', 'range', 'color', 'file'].includes((el as HTMLInputElement).type);
}

/** The window keys go to: the modal one when there is one, else the one holding focus. */
function activeWindow(focus: Element | null, doc: Document): Element | null {
  return topModal(doc) ?? focus?.closest('dialog') ?? null;
}

/** The front-most modal window of a document: the window stack knows it (and jsdom has no `:modal`). */
function topModal(doc: Document): Element | null {
  const top = windowStack.top(doc);
  return top?.modal ? top.element : null;
}

// Showing the access keys. Elsewhere than on Apple platforms, holding Alt
// shows them; tapping it (press and release with no other key) leaves them
// shown until Alt is tapped again, another key is pressed, the pointer is
// used or the page loses focus. While the page has access keys, that tap is
// kept from the browser, which would otherwise move keyboard focus to its
// menu bar and leave the page deaf to the keys that follow. On Apple
// platforms they show while Control and Option are both held.
let altDown = false;
/** Another key went down while Alt was held: it was a chord, not a tap. */
let altChord = false;
/** The access keys stay shown after a tap. */
let altLatched = false;

function onKeyDown(e: KeyboardEvent): void {
  const doc = eventDocument(e);
  if (isApplePlatform()) {
    if (e.key === 'Alt' || e.key === 'Control') {
      if (e.ctrlKey && e.altKey && !e.metaKey) showAccessKeys(doc);
      return;
    }
  } else if (e.key === 'Alt') {
    if (e.ctrlKey || e.metaKey) return; // AltGr and friends
    if (!altDown) altChord = false;
    altDown = true;
    showAccessKeys(doc);
    if (pageHasAccessKeys(doc)) e.preventDefault();
    return;
  }
  if (altDown) altChord = true;
  else if (altLatched) hideAccessKeys();
  if (e.defaultPrevented || e.isComposing) return;
  const focus = deepActiveElement(doc);
  const win = activeWindow(focus, doc);
  if (pending) {
    if (MODIFIERS.has(e.key)) return;
    continueShortcut(e, focus, win);
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  if (runShortcuts(e, focus, win) || runAccessKey(e, focus, win, doc)) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function onKeyUp(e: KeyboardEvent): void {
  if (isApplePlatform()) {
    if (e.key === 'Alt' || e.key === 'Control') hideAccessKeys();
    return;
  }
  if (e.key !== 'Alt') return;
  const tap = altDown && !altChord;
  altDown = false;
  if (tap && pageHasAccessKeys(eventDocument(e))) e.preventDefault();
  if (tap && !altLatched) {
    altLatched = true; // stays shown
    return;
  }
  hideAccessKeys();
}

function showAccessKeys(doc: Document): void {
  doc.documentElement.setAttribute('data-mx-alt', '');
}

function hideAccessKeys(): void {
  pending = null;
  altLatched = false;
  for (const doc of pageDocuments()) doc.documentElement.removeAttribute('data-mx-alt');
}

/** Whether the keys would reach anything: an access key in the active window or the page. */
function pageHasAccessKeys(doc: Document): boolean {
  const scope = activeWindow(deepActiveElement(doc), doc) ?? doc.body;
  return !!scope.querySelector('[aria-keyshortcuts*="Alt+" i]');
}

const MODIFIERS = new Set(['Control', 'Shift', 'Alt', 'Meta', 'AltGraph']);

function runShortcuts(e: KeyboardEvent, focus: HTMLElement | null, win: Element | null): boolean {
  const hits: Hit[] = [];
  for (const reg of registrations) for (const chords of reg.sequences) hits.push({ reg, chords });
  const candidates = findShortcuts(hits, 0, e, focus, win);
  const waiting = candidates.filter((hit) => hit.chords.length > 1);
  if (waiting.length) {
    pending = { hits: waiting, step: 1 };
    return true;
  }
  return runFirst(candidates, e);
}

/** The key after the first chords of some shortcuts: the one it ends runs, a longer one waits again. */
function continueShortcut(e: KeyboardEvent, focus: HTMLElement | null, win: Element | null): void {
  const { hits, step } = pending!;
  pending = null;
  const candidates = findShortcuts(hits, step, e, focus, win);
  const waiting = candidates.filter((hit) => hit.chords.length > step + 1);
  if (waiting.length) {
    pending = { hits: waiting, step: step + 1 };
    return;
  }
  runFirst(candidates, e);
}

/** Runs the shortcuts found, each once, until one takes the key. */
function runFirst(candidates: Hit[], e: KeyboardEvent): boolean {
  const asked = new Set<Registration>();
  for (const { reg } of candidates) {
    if (asked.has(reg)) continue;
    asked.add(reg);
    if (reg.handler(e) !== false) return true;
  }
  return false;
}

/** The shortcuts whose chord at `step` the key is and that may run here, the most specific scope first. */
function findShortcuts(hits: Iterable<Hit>, step: number, e: KeyboardEvent, focus: HTMLElement | null, win: Element | null): Hit[] {
  const plain = !e.ctrlKey && !e.altKey && !e.metaKey;
  const fKey = /^F\d{1,2}$/.test(e.key);
  const candidates: { hit: Hit; depth: number }[] = [];
  for (const hit of hits) {
    const { reg } = hit;
    // Taken away while its first keys waited.
    if (!registrations.has(reg)) continue;
    const chord = hit.chords[step];
    if (!chord || !matches(chord, e)) continue;
    // A plain key ends a shortcut in a text field too; it does not start one there.
    if (step === 0 && plain && !fKey && !reg.inEditable && isEditable(focus)) continue;
    if (reg.scope) {
      const el = reg.scope.element as Element | null;
      if (reg.scope.isDisposed || !el?.isConnected || !focus || !holds(reg.scope, el, focus)) continue;
      if (win && !win.contains(el)) continue;
      const control = controlOf(el);
      if (control && !control.isEnabled) continue;
      candidates.push({ hit, depth: depthOf(el) });
    } else {
      // App-wide: never across a modal form; plain keys belong to a focused window.
      if (win && topModal(win.ownerDocument) === win) continue;
      if (step === 0 && win && plain && !fKey) continue;
      candidates.push({ hit, depth: -1 });
    }
  }
  candidates.sort((a, b) => b.depth - a.depth);
  return candidates.map((c) => c.hit);
}

/**
 * Whether focus is inside a scope: in its element, or, for a part of it moved into another window
 * (a group of documents, say), in one of its components.
 */
function holds(scope: ComponentBase, el: Element, focus: Element): boolean {
  if (el.contains(focus)) return true;
  if (el.ownerDocument === focus.ownerDocument) return false;
  for (let c: ComponentBase | null | undefined = closestControl(focus); c; c = c.parent) if (c === scope) return true;
  return false;
}

function depthOf(el: Element): number {
  let d = 0;
  for (let n: Element | null = el; n; n = n.parentElement) d++;
  return d;
}

// Access keys.

function runAccessKey(e: KeyboardEvent, focus: HTMLElement | null, win: Element | null, doc: Document): boolean {
  if (!isAccessKeyPress(e)) return false;
  const modifiers = accessKeyModifiers().toLowerCase();
  const scope = win ?? doc.body;
  const targets = Array.from(scope.querySelectorAll<HTMLElement>('[aria-keyshortcuts]')).filter(
    (el) => hasAccessKey(el, modifiers, e) && usable(el) && (win ? true : !el.closest('dialog')),
  );
  if (!targets.length) return false;
  if (targets.length === 1) {
    activate(targets[0]);
    return true;
  }
  // Several controls share the key: each press moves focus to the next one, activating none.
  const current = targets.findIndex((t) => t === focus || t.contains(focus));
  targets[(current + 1) % targets.length].focus();
  return true;
}

/**
 * The platform's access key modifiers and nothing else. Elsewhere than on
 * Apple platforms Ctrl+Alt is AltGr, which types characters such as @ on a
 * Turkish keyboard, so it never counts there.
 */
function isAccessKeyPress(e: KeyboardEvent): boolean {
  if (e.metaKey || !e.altKey) return false;
  if (isApplePlatform()) return e.ctrlKey;
  return !e.ctrlKey && !e.getModifierState?.('AltGraph');
}

/** Whether `el` declares the pressed key with these modifiers (`Alt+S`, `Control+Alt+S`). */
function hasAccessKey(el: Element, modifiers: string, e: KeyboardEvent): boolean {
  const pressed = e.key.length === 1 ? e.key.toLocaleLowerCase() : '';
  return (el.getAttribute('aria-keyshortcuts') ?? '').split(/\s+/).some((token) => {
    const at = token.lastIndexOf('+');
    if (at <= 0 || token.slice(0, at).toLowerCase() !== modifiers) return false;
    const key = token.slice(at + 1).toLocaleLowerCase();
    return key === pressed || physicalKeyMatches(key, e);
  });
}

function usable(el: HTMLElement): boolean {
  // A disabled Control's key is not consumed (one that is not a form element is never natively disabled).
  if (controlOf(el)?.isEnabled === false) return false;
  return (
    !(el as HTMLButtonElement).disabled &&
    el.getAttribute('aria-disabled') !== 'true' &&
    !el.closest('[inert], [hidden]') &&
    isShown(el)
  );
}

/** A Control decides (`onAccessKey`); a plain element is clicked if it is button-like, else focused. */
function activate(el: HTMLElement): void {
  const control = controlOf(el);
  if (control) {
    control.onAccessKey();
    return;
  }
  const label = el as HTMLLabelElement;
  if (el.localName === 'label' && label.control) {
    label.control.focus();
    return;
  }
  el.focus();
  if (el.matches('button, [role=button], a[href], input[type=checkbox], input[type=radio], summary')) el.click();
}
