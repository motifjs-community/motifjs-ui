import { Emitter, read, untracked, type Bind, type ComponentBase } from '@motifx/core';
import { accessKeyEntries, accessKeyModifiers, hideAccessKeyMarks, isAccessKeyToken, showAccessKeyMarks } from './access-key';
import type { AccessKeyEntry } from './access-key-entry';
import type { Chord } from './chord';
import { compareTreeOrder, isWithin, treeDepth } from './component-tree';
import type { Control } from './control';
import { controlFor, focusedWindow, focusInTextField, focusOn, holdsFocus, isRendered, windowOfEvent } from './focus';
import { isLiveControl } from './live-controls';
import { eachDocument, windowOf } from './page-documents';
import { isApplePlatform } from './platform';
import type { ShortcutHandler } from './shortcut-handler';
import type { ShortcutOptions } from './shortcut-options';
import type { ShortcutRegistration } from './shortcut-registration';
import type { KeyWindows } from './key-windows';
import { windowStack } from './window-stack';
import { onDocument, onWindow } from './window-events';

export type { Chord } from './chord';
export type { ShortcutHandler } from './shortcut-handler';
export type { ShortcutOptions } from './shortcut-options';
export type { ShortcutRegistration } from './shortcut-registration';

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
//
// Where focus is and which window a key is in come from the focus layer; which
// control a scope is and what a key does come from the component tree.

/** A shortcut and one of its key sequences, as a key press finds it. */
interface Hit {
  reg: ShortcutRegistration;
  chords: Chord[];
}

const registrations = new Set<ShortcutRegistration>();
/** The keys the user gave, by the name of the shortcut. */
let userKeys: Readonly<Record<string, readonly string[]>> = {};
/** @internal Tells `shortcuts` that one was added (the registration) or taken away (`null`). */
export const shortcutChanges = new Emitter<ShortcutRegistration | null>();

/** @internal The shortcuts registered now, in the order they came. */
export function registered(): readonly ShortcutRegistration[] {
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
function readKeys(reg: ShortcutRegistration): void {
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
  const reg: ShortcutRegistration = {
    defaults,
    keys: defaults,
    sequences: [],
    handler,
    scope: options.scope ?? null,
    within: options.within ?? null,
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
    const stops = [onDocument(doc, 'keydown', onKeyDown, true), onDocument(doc, 'keyup', onKeyUp, true), onDocument(doc, 'pointerdown', hideAccessKeys, true)];
    if (doc.defaultView) stops.push(onWindow(doc, 'blur', hideAccessKeys));
    return () => {
      for (const stop of stops) stop();
    };
  });
}

function windowsOf(e: KeyboardEvent, view: Window | null): KeyWindows {
  // The window stack knows the front-most modal window; the page is not asked.
  const top = windowStack.top(view);
  const modal = top?.modal ? top.part : null;
  let active: { window: ComponentBase | null } | null = modal ? { window: modal } : null;
  return {
    modal,
    get active() {
      active ??= { window: focusedWindow(e) };
      return active.window;
    },
  };
}

/** Whether a part lies inside any window of the kit (a Control that is one), itself included. */
function inAnyWindow(part: ComponentBase): boolean {
  for (let c: ComponentBase | null = part; c; c = c.parent) if (isLiveControl(c) && c.isWindow) return true;
  return false;
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
  const view = windowOfEvent(e);
  if (isApplePlatform()) {
    if (e.key === 'Alt' || e.key === 'Control') {
      if (e.ctrlKey && e.altKey && !e.metaKey) showAccessKeyMarks(view);
      return;
    }
  } else if (e.key === 'Alt') {
    if (e.ctrlKey || e.metaKey) return; // AltGr and friends
    if (!altDown) altChord = false;
    altDown = true;
    showAccessKeyMarks(view);
    if (hasAccessKeys(e, view)) e.preventDefault();
    return;
  }
  if (altDown) altChord = true;
  else if (altLatched) hideAccessKeys();
  if (e.defaultPrevented || e.isComposing) return;
  const windows = windowsOf(e, view);
  if (pending) {
    if (MODIFIERS.has(e.key)) return;
    continueShortcut(e, windows);
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  if (runShortcuts(e, windows) || runAccessKey(e, view, windows)) {
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
  if (tap && hasAccessKeys(e, windowOfEvent(e))) e.preventDefault();
  if (tap && !altLatched) {
    altLatched = true; // stays shown
    return;
  }
  hideAccessKeys();
}

function hideAccessKeys(): void {
  pending = null;
  altLatched = false;
  hideAccessKeyMarks();
}

/** Whether the keys would reach anything: an access key drawn in the page, in the active window, else outside any window. */
function hasAccessKeys(e: KeyboardEvent, view: Window | null): boolean {
  const { active } = windowsOf(e, view);
  return accessKeyEntries().some((entry) => isAccessKeyToken(entry.token) && inPlace(entry.part, view, active) && isRendered(entry.part));
}

const MODIFIERS = new Set(['Control', 'Shift', 'Alt', 'Meta', 'AltGraph']);

function runShortcuts(e: KeyboardEvent, windows: KeyWindows): boolean {
  const hits: Hit[] = [];
  for (const reg of registrations) for (const chords of reg.sequences) hits.push({ reg, chords });
  const candidates = findShortcuts(hits, 0, e, windows);
  const waiting = candidates.filter((hit) => hit.chords.length > 1);
  if (waiting.length) {
    pending = { hits: waiting, step: 1 };
    return true;
  }
  return runFirst(candidates, e);
}

/** The key after the first chords of some shortcuts: the one it ends runs, a longer one waits again. */
function continueShortcut(e: KeyboardEvent, windows: KeyWindows): void {
  const { hits, step } = pending!;
  pending = null;
  const candidates = findShortcuts(hits, step, e, windows);
  const waiting = candidates.filter((hit) => hit.chords.length > step + 1);
  if (waiting.length) {
    pending = { hits: waiting, step: step + 1 };
    return;
  }
  runFirst(candidates, e);
}

/** Runs the shortcuts found, each once, until one takes the key. */
function runFirst(candidates: Hit[], e: KeyboardEvent): boolean {
  const asked = new Set<ShortcutRegistration>();
  for (const { reg } of candidates) {
    if (asked.has(reg)) continue;
    asked.add(reg);
    if (reg.handler(e) !== false) return true;
  }
  return false;
}

/** The shortcuts whose chord at `step` the key is and that may run here, the most specific scope first. */
function findShortcuts(hits: Iterable<Hit>, step: number, e: KeyboardEvent, windows: KeyWindows): Hit[] {
  const plain = !e.ctrlKey && !e.altKey && !e.metaKey;
  const fKey = /^F\d{1,2}$/.test(e.key);
  let typing: boolean | undefined;
  const candidates: { hit: Hit; depth: number }[] = [];
  for (const hit of hits) {
    const { reg } = hit;
    // Taken away while its first keys waited.
    if (!registrations.has(reg)) continue;
    const chord = hit.chords[step];
    if (!chord || !matches(chord, e)) continue;
    // A plain key ends a shortcut in a text field too; it does not start one there.
    if (step === 0 && plain && !fKey && !reg.inEditable && (typing ??= focusInTextField(e))) continue;
    // A shortcut of one part (a tab, a splitter) runs only while focus is in that part.
    if (reg.within && !holdsAny(reg.within, e)) continue;
    const scope = reg.scope;
    if (scope) {
      if (scope.isDisposed || !holdsFocus(scope, e)) continue;
      const win = windows.active;
      if (win && !isWithin(scope, win)) continue;
      if (isLiveControl(scope) && !untracked(() => scope.isEnabled)) continue;
      candidates.push({ hit, depth: treeDepth(scope) });
    } else {
      // App-wide: never across a modal form; plain keys belong to a focused window.
      if (windows.modal) continue;
      if (step === 0 && plain && !fKey && windows.active) continue;
      candidates.push({ hit, depth: -1 });
    }
  }
  candidates.sort((a, b) => b.depth - a.depth);
  return candidates.map((c) => c.hit);
}

/** Whether focus, as a key saw it, is inside one of the parts a shortcut is limited to. */
function holdsAny(within: Bind<ComponentBase | readonly ComponentBase[]>, e: KeyboardEvent): boolean {
  const parts = untracked(() => read(within));
  if (Array.isArray(parts)) return (parts as readonly ComponentBase[]).some((part) => holdsFocus(part, e));
  return holdsFocus(parts as ComponentBase, e);
}

// Access keys.

function runAccessKey(e: KeyboardEvent, view: Window | null, windows: KeyWindows): boolean {
  if (!isAccessKeyPress(e)) return false;
  const win = windows.active;
  const modifiers = accessKeyModifiers().toLowerCase();
  const targets: AccessKeyEntry[] = [];
  for (const entry of accessKeyEntries()) {
    if (targets.some((t) => t.part === entry.part)) continue;
    if (hasAccessKey(entry.token, modifiers, e) && inPlace(entry.part, view, win) && usable(entry.part)) targets.push(entry);
  }
  if (!targets.length) return false;
  if (targets.length === 1) {
    targets[0].run();
    return true;
  }
  // Several controls share the key: each press moves focus to the next one in the order of the component tree,
  // activating none.
  targets.sort((a, b) => compareTreeOrder(a.part, b.part));
  const current = targets.findIndex((t) => holdsFocus(t.part, e));
  focusOn(targets[(current + 1) % targets.length].part);
  return true;
}

/**
 * Whether a part's keys count here: in the browser window of the key, and inside the active window, or outside every
 * window while none is active.
 */
function inPlace(part: ComponentBase, view: Window | null, win: ComponentBase | null): boolean {
  if (windowOf(part) !== view) return false;
  return win ? isWithin(part, win) : !inAnyWindow(part);
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

/** Whether a key the kit declared is the pressed one with these modifiers (`Alt+S`, `Control+Alt+S`). */
function hasAccessKey(token: string, modifiers: string, e: KeyboardEvent): boolean {
  const at = token.lastIndexOf('+');
  if (at <= 0 || token.slice(0, at).toLowerCase() !== modifiers) return false;
  const key = token.slice(at + 1).toLocaleLowerCase();
  const pressed = e.key.length === 1 ? e.key.toLocaleLowerCase() : '';
  return key === pressed || physicalKeyMatches(key, e);
}

/**
 * Whether a part's key can be used now: it and every component above it are shown and none is inert or hidden in its
 * place, it is drawn in the page (not taken out with a kept page, not hidden by CSS), and the control it belongs to (or
 * stands for) is enabled. A disabled control's key is not taken.
 */
function usable(part: ComponentBase): boolean {
  let owner: Control | null = null;
  for (let c: ComponentBase | null = part; c; c = c.parent) {
    if (c.isDisposed || !c.isVisible || c.attr.has('inert') || c.attr.has('hidden')) return false;
    owner ??= controlFor(c);
  }
  const control = owner;
  return isRendered(part) && (!control || untracked(() => control.isEnabled));
}
