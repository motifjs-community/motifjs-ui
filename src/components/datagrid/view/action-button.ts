import type { Component, ComponentBase } from '@motifx/core';
import { loose, part, partBefore } from '../../../core/draw-parts';
import { kept, put, text } from '../../../core/part-writes';
import { showIcon } from '../../../core/show-icon';
import type { ResolvedAction } from './resolved-action';
import { readField } from '../model/read-field';

const releases = new WeakMap<Component<HTMLButtonElement>, () => void>();
/** The key each button was drawn for. */
const keys = new WeakMap<Component<HTMLButtonElement>, string>();
/** The parts of each button's face: made the first time they are needed, then written in place. */
const faces = new WeakMap<
  Component<HTMLButtonElement>,
  { holder: Component<HTMLSpanElement> | null; iconOf: string | null; icon: boolean; text: Component<HTMLSpanElement> | null }
>();
/** The hint each button was drawn with. */
const hints = new WeakMap<ComponentBase, string>();

/** What a button shows: the action, its text and its look. Equal keys draw the same button. */
export function actionKey<T>(a: ResolvedAction<T>): string {
  return [a.action.id, a.text, a.hasIcon, a.showText].join('\u0000');
}

/** The hint (tooltip) a button shows now, `''` for none: what the grid's cell tip says for it. */
export function actionHint(button: ComponentBase): string {
  return hints.get(button) ?? '';
}

/**
 * A button of a row's actions: a part with the kit button's classes (ghost, small), so a row costs no
 * Button control. Disabled buttons stay focusable (`aria-disabled`) for the arrow keys.
 */
export function createActionButton(): Component<HTMLButtonElement> {
  const button = loose<HTMLButtonElement>('button', 'mx-button mx-button__face mx-data-grid__action');
  button.attr.add({ type: 'button' });
  put(button, 'tabindex', '-1');
  button.attr.add({ 'data-variant': 'ghost', 'data-size': 'sm' });
  return button;
}

/**
 * Shows an action on a button. Its icon holder and text are made once and written in place; the icon itself
 * is shown again only when it is another one.
 */
export function fillActionButton<T>(button: Component<HTMLButtonElement>, a: ResolvedAction<T>) {
  const key = actionKey(a);
  if (keys.get(button) !== key) {
    const face = faces.get(button) ?? { holder: null, iconOf: null, icon: false, text: null };
    faces.set(button, face);
    // The icon is the action's: it is shown again only for another action (an icon given as a function makes a new one).
    const iconOf = a.hasIcon ? a.action.id : null;
    if (face.iconOf !== iconOf) {
      releases.get(button)?.();
      releases.delete(button);
      const icon = iconOf !== null ? readField(a.action, 'icon') : null;
      if (icon && !face.holder) {
        face.holder = partBefore<HTMLSpanElement>(button, face.text, 'span', 'mx-button__icon');
        face.holder.attr.add({ 'aria-hidden': 'true' });
      }
      if (icon && face.holder) releases.set(button, showIcon(icon, face.holder));
      face.iconOf = iconOf;
      face.icon = !!icon;
    }
    if (face.holder) kept(face.holder, face.icon);
    const showText = a.showText || !face.icon;
    if (showText && !face.text) face.text = part<HTMLSpanElement>(button, 'span', 'mx-button__text');
    if (face.text) {
      if (showText) text(face.text, a.text);
      kept(face.text, showText);
    }
    keys.set(button, key);
  }
  put(button, 'data-tone', a.action.tone ?? 'standard');
  put(button, 'data-action', a.action.id);
  if (a.showText) put(button, 'aria-label', null);
  else put(button, 'aria-label', a.text);
  hints.set(button, a.hint);
  if (a.hint) put(button, 'data-hint', a.hint);
  else put(button, 'data-hint', null);
  if (a.disabled) put(button, 'aria-disabled', 'true');
  else put(button, 'aria-disabled', null);
}
