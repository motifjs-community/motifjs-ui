import type { ComponentBase } from '@motifx/core';
import { accessKeyModifiers } from './access-key';
import { controlOf } from './control-map';
import { deepActiveElement, isShown } from './focus';
import { isApplePlatform } from './platform';
import { windowStack } from './window-stack';

// One capture-phase keydown listener on the document serves every shortcut
// and every access key of the app. Capture, because windows stop key events
// at their root; one listener, so controls pay nothing per instance. It is
// installed the first time a shortcut or an access key is registered.
//
// Order: an explicit chord wins over an implicit access key.
//   1. shortcuts: the most specific scope that holds focus first, app-wide last;
//   2. access keys (Alt + letter; Control + Option + letter on Apple
//      platforms) of the active window, else of the page.

/** What `addShortcut` takes besides the chord and the handler. */
export interface ShortcutOptions {
  /**
   * Only while focus is inside this component (and it is enabled). Without
   * it the shortcut is app-wide.
   */
  scope?: ComponentBase;
  /**
   * Also when focus is in a text field. By default a chord without Ctrl, Alt
   * or Meta (Delete, a letter, Escape…) leaves text fields alone; F-keys and
   * chords with those modifiers always work.
   */
  inEditable?: boolean;
}

/** Return `false` from a handler to let the key go on (to a less specific shortcut, then the page). */
export type ShortcutHandler = (e: KeyboardEvent) => void | boolean;

interface Chord {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  /** Lower-case `KeyboardEvent.key`, or a single lower-case character. */
  key: string;
}

interface Registration {
  chord: Chord;
  handler: ShortcutHandler;
  scope: ComponentBase | null;
  inEditable: boolean;
}

const registrations = new Set<Registration>();
let installed = false;

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
    keyMatches(chord, e)
  );
}

/**
 * Registers a keyboard shortcut. App-wide by default (except while a modal
 * form is open, and except plain keys while focus is in a window); with
 * `scope`, only while focus is inside that component. Returns the function
 * that removes it. `Control.addShortcut` does the same and removes it when the
 * control is disposed.
 *
 * @example
 * const remove = addShortcut('Ctrl+S', () => model.save());
 * addShortcut('Delete', () => grid.deleteSelected(), { scope: grid });
 */
export function addShortcut(chord: string, handler: ShortcutHandler, options: ShortcutOptions = {}): () => void {
  installKeyboard();
  const reg: Registration = { chord: parseChord(chord), handler, scope: options.scope ?? null, inEditable: !!options.inEditable };
  registrations.add(reg);
  return () => void registrations.delete(reg);
}

/** @internal Installs the document listener (once). Access keys call it when they first appear. */
export function installKeyboard(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('keyup', onKeyUp, true);
  document.addEventListener('pointerdown', hideAccessKeys, true);
  window.addEventListener('blur', hideAccessKeys);
}

function isEditable(el: Element | null): boolean {
  if (!el) return false;
  if ((el as HTMLElement).isContentEditable) return true;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
  return el.tagName === 'INPUT' && !['button', 'submit', 'reset', 'checkbox', 'radio', 'range', 'color', 'file'].includes((el as HTMLInputElement).type);
}

/** The window keys go to: the modal one when there is one, else the one holding focus. */
function activeWindow(focus: Element | null): Element | null {
  return topModal() ?? focus?.closest('dialog') ?? null;
}

/** The front-most modal window: the window stack knows it (and jsdom has no `:modal`). */
function topModal(): Element | null {
  const top = windowStack.top();
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
  if (isApplePlatform()) {
    if (e.key === 'Alt' || e.key === 'Control') {
      if (e.ctrlKey && e.altKey && !e.metaKey) showAccessKeys();
      return;
    }
  } else if (e.key === 'Alt') {
    if (e.ctrlKey || e.metaKey) return; // AltGr and friends
    if (!altDown) altChord = false;
    altDown = true;
    showAccessKeys();
    if (pageHasAccessKeys()) e.preventDefault();
    return;
  }
  if (altDown) altChord = true;
  else if (altLatched) hideAccessKeys();
  if (e.defaultPrevented || e.isComposing) return;
  const focus = deepActiveElement();
  const win = activeWindow(focus);
  if (runShortcuts(e, focus, win) || runAccessKey(e, focus, win)) {
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
  if (tap && pageHasAccessKeys()) e.preventDefault();
  if (tap && !altLatched) {
    altLatched = true; // stays shown
    return;
  }
  hideAccessKeys();
}

function showAccessKeys(): void {
  document.documentElement.setAttribute('data-mx-alt', '');
}

function hideAccessKeys(): void {
  altLatched = false;
  document.documentElement.removeAttribute('data-mx-alt');
}

/** Whether the keys would reach anything: an access key in the active window or the page. */
function pageHasAccessKeys(): boolean {
  const scope = activeWindow(deepActiveElement()) ?? document.body;
  return !!scope.querySelector('[aria-keyshortcuts*="Alt+" i]');
}

function runShortcuts(e: KeyboardEvent, focus: HTMLElement | null, win: Element | null): boolean {
  const plain = !e.ctrlKey && !e.altKey && !e.metaKey;
  const fKey = /^F\d{1,2}$/.test(e.key);
  const candidates: { reg: Registration; depth: number }[] = [];
  for (const reg of registrations) {
    if (!matches(reg.chord, e)) continue;
    if (plain && !fKey && !reg.inEditable && isEditable(focus)) continue;
    if (reg.scope) {
      const el = reg.scope.element as Element | null;
      if (reg.scope.isDisposed || !el?.isConnected || !focus || !el.contains(focus)) continue;
      if (win && !win.contains(el)) continue;
      const control = controlOf(el);
      if (control && !control.isEnabled) continue;
      candidates.push({ reg, depth: depthOf(el) });
    } else {
      // App-wide: never across a modal form; plain keys belong to a focused window.
      if (win && topModal() === win) continue;
      if (win && plain && !fKey) continue;
      candidates.push({ reg, depth: -1 });
    }
  }
  candidates.sort((a, b) => b.depth - a.depth);
  for (const { reg } of candidates) if (reg.handler(e) !== false) return true;
  return false;
}

function depthOf(el: Element): number {
  let d = 0;
  for (let n: Element | null = el; n; n = n.parentElement) d++;
  return d;
}

// Access keys.

function runAccessKey(e: KeyboardEvent, focus: HTMLElement | null, win: Element | null): boolean {
  if (!isAccessKeyPress(e)) return false;
  const modifiers = accessKeyModifiers().toLowerCase();
  const scope = win ?? document.body;
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
  if (el instanceof HTMLLabelElement && el.control) {
    el.control.focus();
    return;
  }
  el.focus();
  if (el.matches('button, [role=button], a[href], input[type=checkbox], input[type=radio], summary')) el.click();
}
