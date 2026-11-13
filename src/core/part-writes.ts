import type { ComponentBase } from '@motifx/core';
import { coverFocus, isHeld } from './cover';

// Each write below is made only when the value changed: an attribute, a style or a text written again with the same
// value still has the browser work out the styles of what it touches again. A name a disabled control holds on the
// part (see cover.ts) always goes to core: its element shows the held value, and core keeps the part's own.

/** What `css` and `text` wrote last, by part. */
const styles = new WeakMap<ComponentBase, Map<string, string>>();
const texts = new WeakMap<ComponentBase, string>();

/** A mark written as `"true"`, or taken away. */
export function flag(part: ComponentBase, name: string, on: unknown): void {
  put(part, name, on ? 'true' : null);
}

/** An attribute there with no value, or taken away. */
export function mark(part: ComponentBase, name: string, on: unknown): void {
  const attr = part.attr;
  const held = isHeld(part, name);
  if (on) {
    if (held || !attr.has(name) || attr.get(name) !== '') attr.add({ [name]: '' });
    coverFocus(part, name);
  } else if (held || attr.has(name)) attr.remove(name);
}

/** An attribute written as it is, or taken away when there is none. */
export function put(part: ComponentBase, name: string, value: string | null | undefined): void {
  const attr = part.attr;
  const held = isHeld(part, name);
  if (value === null || value === undefined || value === '') {
    if (held || attr.has(name)) attr.remove(name);
    return;
  }
  if (held || !attr.has(name) || attr.get(name) !== value) attr.add({ [name]: value });
  coverFocus(part, name);
}

/** A class there or taken away; core skips a class it already has or never had. */
export function toggleClass(part: ComponentBase, name: string, on: unknown): void {
  if (on) part.class.add(name);
  else part.class.remove(name);
}

/** A style property (a custom one too); `''` takes it away. */
export function css(part: ComponentBase, name: string, value: string): void {
  let written = styles.get(part);
  if ((written?.get(name) ?? '') === value) return;
  if (!written) styles.set(part, (written = new Map()));
  written.set(name, value);
  part.style({ [name]: value });
}

/** The text of a part that holds only text. */
export function text(part: ComponentBase, value: string): void {
  if (texts.get(part) === value) return;
  texts.set(part, value);
  part.setText(value);
}

/**
 * Calls `method` of the part's element at once (`showPopover`, `hidePopover`): a browser call that what follows depends
 * on (a measure, a focus), made now. Nothing where the element has no such method. Returns whether it was called.
 */
export function callNow(part: ComponentBase, method: string, ...args: unknown[]): boolean {
  const el = part.element as unknown as Record<string, unknown> | null | undefined;
  const call = el?.[method];
  if (typeof call !== 'function') return false;
  call.apply(el, args);
  return true;
}

/** Shown or not, staying in the page: `hidden` for what reads it, and `display: none` as well, since a part's own rules give it a display. */
export function shown(part: ComponentBase | null, on: boolean): void {
  if (!part) return;
  mark(part, 'hidden', !on);
  css(part, 'display', on ? '' : 'none');
}

/**
 * In the page or not, in its place: hidden the MotifJS way (a mark holds its place), so the part stays a child
 * and goes with its parent. Taken out at once, with no leave animation.
 */
export function kept(part: ComponentBase | null, on: boolean): void {
  if (!part || part.isVisible === on) return;
  if (on) {
    void part.motif.show();
    return;
  }
  part.motif.options.transition.skipNextLeave = true;
  void part.motif.hide();
}