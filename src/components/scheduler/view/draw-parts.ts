import { Component, type ComponentBase } from '@motifx/core';

// Each write below is made only when the value changed: an attribute, a style or a text written again with the same
// value still has the browser work out the styles of what it touches again.

/** A mark written as `"true"`, or taken away. */
export function flag(el: HTMLElement, name: string, on: unknown): void {
  if (on) {
    if (el.getAttribute(name) !== 'true') el.setAttribute(name, 'true');
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
