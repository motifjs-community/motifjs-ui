import { Component, type ComponentBase } from '@motifx/core';
import type { IconSource } from './icon-source';
import { isNode } from './node-kind';

// Each write below is created only when the value changed: an attribute, a style or a text written again with the same
// value still has the browser work out the styles of what it touches again.

/** A mark written as `"true"`, or taken away. */
export function flag(el: HTMLElement, name: string, on: unknown): void {
  if (on) {
    if (el.getAttribute(name) !== 'true') el.setAttribute(name, 'true');
  } else if (el.hasAttribute(name)) el.removeAttribute(name);
}

/** An attribute there with no value, or taken away. */
export function mark(el: HTMLElement, name: string, on: unknown): void {
  if (on) {
    if (el.getAttribute(name) !== '') el.setAttribute(name, '');
  } else if (el.hasAttribute(name)) el.removeAttribute(name);
}

/** An attribute written as it is, or taken away when there is none. */
export function put(el: HTMLElement, name: string, value: string | null | undefined): void {
  if (value === null || value === undefined || value === '') {
    if (el.hasAttribute(name)) el.removeAttribute(name);
  } else if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

/** A style property (a custom one too); `''` takes it away. */
export function css(el: HTMLElement, name: string, value: string): void {
  if (el.style.getPropertyValue(name) === value) return;
  if (value === '') el.style.removeProperty(name);
  else el.style.setProperty(name, value);
}

/** The text of a part that holds only text. */
export function text(el: HTMLElement, value: string): void {
  if (el.textContent !== value) el.textContent = value;
}

/** Shown or not: `hidden` for what reads it, and `display: none` as well, since a part's own rules give it a display. */
export function shown(el: HTMLElement | null, on: boolean): void {
  if (!el) return;
  if (el.hidden === on) el.hidden = !on;
  css(el, 'display', on ? '' : 'none');
}

/** A part drawn by hand: a MotifJS component of a tag and a class, added to `parent`. */
export function part<E extends HTMLElement = HTMLElement>(parent: ComponentBase, tag: string, className: string): Component<E> {
  const c = new Component<E>(tag);
  if (className) c.element.className = className;
  parent.controls.add(c);
  return c;
}

/** A glyph of the kit's set (`span.mx-glyph`, see `glyph`) as a part of `parent`. */
export function glyphPart(parent: ComponentBase, name: string, className = ''): Component<HTMLSpanElement> {
  const c = part<HTMLSpanElement>(parent, 'span', className ? `mx-glyph ${className}` : 'mx-glyph');
  c.element.dataset.icon = name;
  c.element.setAttribute('aria-hidden', 'true');
  return c;
}

/**
 * An icon as a child of `parent`: an `<img>` for an address (`alt` empty unless given), an element of your own
 * taken in as a component, or the component itself. It goes with `parent`; dispose the one returned when the
 * icon changes.
 */
export function iconPart(parent: ComponentBase, source: IconSource, alt = ''): ComponentBase {
  if (typeof source === 'string') {
    const img = part<HTMLImageElement>(parent, 'img', '');
    img.element.src = source;
    img.element.alt = alt;
    return img;
  }
  const c = isNode(source) ? new Component(source as HTMLElement) : source;
  parent.controls.add(c);
  return c;
}

const placeholders = new WeakMap<Element, Comment>();

/**
 * In the page or not, in its place: removed, a placeholder keeps its place, and it comes back there. For a part
 * whose parent is not changed while it is out (what `x-display` does for JSX).
 */
export function kept(el: HTMLElement, on: boolean): void {
  const holder = placeholders.get(el);
  if (on) {
    if (holder?.parentNode) holder.replaceWith(el);
    return;
  }
  if (!el.parentNode) return;
  const mark = holder ?? document.createComment('');
  placeholders.set(el, mark);
  el.replaceWith(mark);
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
