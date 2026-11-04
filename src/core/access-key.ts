import { isApplePlatform } from './platform';
import { uiLocale } from './ui-locale';

/** A control text with its access key: `&Dosya` → text `Dosya`, key `D` at index 0. */
export interface ParsedAccessKey {
  /** The text without the marker (`&&` becomes `&`). */
  text: string;
  /** The access key as written (`D`), or `null` when the text has none. */
  key: string | null;
  /** Index of the access key in `text`, -1 when there is none. */
  index: number;
}

/**
 * Parses a control text: the character after a single `&` is the access key
 * (`&File` → F), `&&` is a literal ampersand. Only the first marker counts.
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
 * Renders a parsed text into `host` (replacing its content): the access key
 * is wrapped in `<span class="mx-access-key">`, underlined while the access
 * key modifiers are held (or always, with `data-mx-access-keys="always"` on
 * <html>). The accessible name stays the plain text.
 */
export function renderAccessKey(host: Element, parsed: ParsedAccessKey): void {
  if (parsed.index < 0) {
    host.textContent = parsed.text;
    return;
  }
  const mark = host.ownerDocument.createElement('span');
  mark.className = 'mx-access-key';
  mark.textContent = parsed.text[parsed.index];
  host.replaceChildren(parsed.text.slice(0, parsed.index), mark, parsed.text.slice(parsed.index + 1));
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

/** Adds or replaces this package's access key token in an element's `aria-keyshortcuts`, keeping the app's own. */
export function setAccessKeyAttribute(el: Element, previous: string | null, next: string | null): void {
  const tokens = (el.getAttribute('aria-keyshortcuts') ?? '').split(/\s+/).filter((t) => t && t !== previous);
  if (next) tokens.unshift(next);
  if (tokens.length) el.setAttribute('aria-keyshortcuts', tokens.join(' '));
  else el.removeAttribute('aria-keyshortcuts');
}
