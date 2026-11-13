import { motifComponent, type ComponentBase } from '@motifx/core';
import type { AccessKeyEntry } from './access-key-entry';
import { clearParts, part } from './draw-parts';
import { focusOn } from './focus';
import { isLiveControl } from './live-controls';
import { windowOf } from './page-documents';
import type { ParsedAccessKey } from './parsed-access-key';
import { kept, mark, put, text } from './part-writes';
import { isApplePlatform } from './platform';
import { uiLocale } from './ui-locale';

export type { ParsedAccessKey } from './parsed-access-key';

// The kit keeps its own access keys: which part declares which key, and what pressing it does. The keyboard asks
// this list, never the page. While Alt is held, what shows the keys of that window is marked `data-mx-alt`.

/** The keys each part declares through the kit, with what pressing each one does. */
const keyed = new Map<ComponentBase, Map<string, () => boolean>>();
/** The components an access key was drawn in (`renderAccessKey`). */
const drawnIn = new Set<ComponentBase>();
/** Components whose disposal already takes them off the lists. */
const watched = new WeakSet<ComponentBase>();
/** What is marked `data-mx-alt` now. */
const marked = new Set<ComponentBase>();
/** The parts `renderAccessKey` drew in each component: the text before the key, the key, the text after it. */
const drawnParts = new WeakMap<ComponentBase, { texts: { before: string; after: string }; before: ComponentBase; key: ComponentBase; after: ComponentBase }>();
/** The window whose access keys show now; `undefined` while none do. */
let showing: Window | null | undefined;

/**
 * Parses a control text. The character after a single `&` is the access key
 * (`&File` → F), and `&&` is a literal ampersand. Only the first marker counts.
 */
export function parseAccessKey(source: string): ParsedAccessKey {
  if (!source.includes('&')) return { text: source, key: null, index: -1 };
  let text = '';
  let key: string | null = null;
  let index = -1;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch !== '&' || i === source.length - 1) {
      text += ch;
      continue;
    }
    const next = source[++i];
    if (next === '&') text += '&';
    else {
      if (key === null && next.trim()) {
        key = next;
        index = text.length;
      }
      text += next;
    }
  }
  return { text, key, index };
}

/**
 * Renders a parsed text into `host`, replacing its content. The access key
 * is wrapped in `<span class="mx-access-key">` and underlined while the access
 * key modifiers are held (or always, with `data-mx-access-keys="always"` on
 * <html>). The accessible name stays the plain text.
 */
export function renderAccessKey(host: ComponentBase, parsed: ParsedAccessKey): void {
  // Drawn once: a text given again changes only the texts, the key's part kept while there is a key. Content another
  // hand wrote in between is let go and drawn anew.
  const at = parsed.index;
  let drawn = drawnParts.get(host);
  const items = host.controls.items;
  if (!drawn || items.length !== 3 || items[0] !== drawn.before || items[1] !== drawn.key || items[2] !== drawn.after) {
    clearParts(host);
    const texts = { before: '', after: '' };
    // A text node takes its text when it is placed: it reads the latest one.
    const textOf = (read: () => string): ComponentBase => {
      const node = motifComponent('text', (n: ComponentBase) => n.setText(read())) as ComponentBase;
      host.controls.add(node);
      return node;
    };
    drawn = { texts, before: textOf(() => texts.before), key: part<HTMLSpanElement>(host, 'span', 'mx-access-key'), after: textOf(() => texts.after) };
    drawnParts.set(host, drawn);
  }
  drawn.texts.before = at < 0 ? parsed.text : parsed.text.slice(0, at);
  drawn.texts.after = at < 0 ? '' : parsed.text.slice(at + 1);
  drawn.before.setText(drawn.texts.before);
  drawn.after.setText(drawn.texts.after);
  text(drawn.key, at < 0 ? '' : parsed.text[at]);
  kept(drawn.key, at >= 0);
  if (at < 0) {
    drawnIn.delete(host);
    return;
  }
  drawnIn.add(host);
  watch(host);
  if (showing !== undefined && windowOf(host) === showing) markOne(host);
}

/**
 * The modifiers that press an access key on this platform, as written in
 * `aria-keyshortcuts`: `Alt`, or `Control+Alt` (Control + Option) on Apple
 * platforms, where Option alone types characters. Browsers use the same keys
 * for HTML `accesskey`.
 */
export function accessKeyModifiers(): string {
  return isApplePlatform() ? 'Control+Alt' : 'Alt';
}

/** The `aria-keyshortcuts` token for an access key: `Alt+D`, or `Control+Alt+D` on Apple platforms. */
export function accessKeyToken(key: string): string {
  return `${accessKeyModifiers()}+${key.toLocaleUpperCase(uiLocale.locale)}`;
}

/** Whether a key is an access key of this platform (`Alt+S`, `Control+Alt+S` on Apple platforms), not another shortcut. */
export function isAccessKeyToken(token: string): boolean {
  const at = token.lastIndexOf('+');
  return at > 0 && token.slice(0, at) === accessKeyModifiers();
}

/**
 * Adds or replaces this package's key in a part's `aria-keyshortcuts`, keeping the app's own, and keeps what pressing
 * it does: `run`, else focus and a click, as on a button. The key goes when it is replaced by `null` or the part is
 * disposed.
 */
export function setAccessKeyAttribute(target: ComponentBase, previous: string | null, next: string | null, run?: () => boolean): void {
  const tokens = (target.attr.get('aria-keyshortcuts') ?? '').split(/\s+/).filter((t) => t && t !== previous);
  if (next) tokens.unshift(next);
  put(target, 'aria-keyshortcuts', tokens.join(' ') || null);
  const keys = keyed.get(target);
  if (previous && previous !== next) keys?.delete(previous);
  if (next) {
    const press = run ?? (() => pressPart(target));
    if (keys) keys.set(next, press);
    else keyed.set(target, new Map([[next, press]]));
    watch(target);
    if (showing !== undefined && isAccessKeyToken(next) && windowOf(target) === showing) markKeyed(target);
  } else if (keys && !keys.size) keyed.delete(target);
}

/** @internal The keys the kit's parts declare now, each with its part and what pressing it does. */
export function accessKeyEntries(): AccessKeyEntry[] {
  const entries: AccessKeyEntry[] = [];
  for (const [target, keys] of keyed) for (const [token, run] of keys) entries.push({ part: target, token, run });
  return entries;
}

/** @internal Whether a part of the kit declares `token` now. */
export function isAccessKeyTaken(token: string): boolean {
  for (const [target, keys] of keyed) if (!target.isDisposed && keys.has(token)) return true;
  return false;
}

/**
 * @internal Shows the access keys of `view` while Alt is held: marks `data-mx-alt` on each component a key was drawn
 * in, and on each part with an access key with the control it belongs to.
 */
export function showAccessKeyMarks(view: Window | null): void {
  // A held Alt repeats its keydown: what is shown stays shown, and later keys are marked as they come.
  if (showing === view) return;
  showing = view;
  for (const host of drawnIn) if (windowOf(host) === view) markOne(host);
  for (const [target, keys] of keyed) {
    if ([...keys.keys()].some(isAccessKeyToken) && windowOf(target) === view) markKeyed(target);
  }
}

/** @internal Takes the access key marks away. */
export function hideAccessKeyMarks(): void {
  showing = undefined;
  for (const c of marked) if (!c.isDisposed) mark(c, 'data-mx-alt', false);
  marked.clear();
}

/** What a key does for a part given no action of its own: focus, and a click, as on a button. */
function pressPart(target: ComponentBase): boolean {
  focusOn(target);
  target.attr.add({ click: true });
  return true;
}

/** Takes a component off the lists when it is disposed (once per component). */
function watch(c: ComponentBase): void {
  if (watched.has(c)) return;
  watched.add(c);
  c.motif.setDisposable(() => {
    keyed.delete(c);
    drawnIn.delete(c);
    marked.delete(c);
  });
}

/** A part with an access key, and the control it belongs to: its label may stand beside the part. */
function markKeyed(target: ComponentBase): void {
  markOne(target);
  for (let c: ComponentBase | null = target; c; c = c.parent) {
    if (!isLiveControl(c)) continue;
    markOne(c);
    return;
  }
}

function markOne(c: ComponentBase): void {
  if (marked.has(c)) return;
  marked.add(c);
  mark(c, 'data-mx-alt', true);
}
