import { Component, motifComponent, type ComponentBase } from '@motifx/core';
import type { IconSource } from './icon-source';

/** A part drawn by hand: a MotifJS component of a tag and a class, added to `parent`. */
export function part<E extends HTMLElement = HTMLElement>(parent: ComponentBase, tag: string, className: string): Component<E> {
  const c = loose<E>(tag, className);
  parent.controls.add(c);
  return c;
}

/** A text of `parent`, as a text node component: put before `before`, at the end without one. */
export function textPart(parent: ComponentBase, value: string, before: ComponentBase | null = null): ComponentBase {
  const c = motifComponent('text', (node: ComponentBase) => node.setText(value)) as ComponentBase;
  const at = before ? parent.controls.items.indexOf(before) : -1;
  if (at >= 0) parent.controls.insert(at, c);
  else parent.controls.add(c);
  return c;
}

/** A part of a tag and a class, not placed yet: added to a parent later (`controls.add` / `insert`). */
export function loose<E extends HTMLElement = HTMLElement>(tag: string, className = ''): Component<E> {
  const c = new Component<E>(tag);
  if (className) c.class.add(className);
  return c;
}

/** A part of `parent` put before `before` (at the end for `null`). */
export function partBefore<E extends HTMLElement = HTMLElement>(parent: ComponentBase, before: ComponentBase | null, tag: string, className: string): Component<E> {
  const c = loose<E>(tag, className);
  const at = before ? parent.controls.items.indexOf(before) : -1;
  if (at >= 0) parent.controls.insert(at, c);
  else parent.controls.add(c);
  return c;
}

/** Takes a part out of its parent and disposes it (with what it holds), at once. */
export function removePart(c: ComponentBase | null | undefined): void {
  if (!c || c.isDisposed) return;
  if (c.parent) c.parent.controls.remove(c);
  else void c.dispose();
}

/** Takes every part out of `parent` and disposes them. */
export function clearParts(parent: ComponentBase): void {
  for (const c of [...parent.controls.items]) removePart(c);
}

/** A glyph of the kit's set (`span.mx-glyph`, see `glyph`) as a part of `parent`. */
export function glyphPart(parent: ComponentBase, name: string, className = ''): Component<HTMLSpanElement> {
  const c = part<HTMLSpanElement>(parent, 'span', className ? `mx-glyph ${className}` : 'mx-glyph');
  c.attr.add({ 'data-icon': name, 'aria-hidden': 'true' });
  return c;
}

/**
 * An icon as a child of `parent`: an `<img>` for an address (`alt` empty unless given), or the component itself.
 * It goes with `parent`; dispose the one returned when the icon changes.
 */
export function iconPart(parent: ComponentBase, source: IconSource, alt = ''): ComponentBase {
  if (typeof source === 'string') {
    const img = part<HTMLImageElement>(parent, 'img', '');
    img.attr.add({ src: source, alt });
    return img;
  }
  parent.controls.add(source);
  return source;
}

const handed = new WeakMap<object, { value: unknown }>();

/**
 * The value of a control the user changes too (a box, a list, a check box): given only when it is not the one given
 * last, so what the user typed or picked since stays until the value itself changes.
 */
export function handOver<V>(control: { value: V }, value: V): void {
  const last = handed.get(control);
  if (last && Object.is(last.value, value)) return;
  handed.set(control, { value });
  control.value = value;
}
