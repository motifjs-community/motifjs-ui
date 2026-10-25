import { read } from '@motifx/core';
import { iconNode } from '../../../core/icon-node';
import type { ResolvedAction } from './resolved-action';

const releases = new WeakMap<HTMLElement, () => void>();

/** What a button shows: the action, its text and its look. Equal keys draw the same button. */
export function actionKey<T>(a: ResolvedAction<T>): string {
  return [a.action.id, a.text, a.hasIcon, a.showText].join('\u0000');
}

/**
 * A button of a row's actions: a plain element with the kit button's classes (ghost, small), so a
 * row costs no component. Disabled buttons stay focusable (`aria-disabled`) for the arrow keys.
 */
export function createActionButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mx-button mx-button__face mx-data-grid__action';
  button.tabIndex = -1;
  button.dataset.variant = 'ghost';
  button.dataset.size = 'sm';
  return button;
}

/** Shows an action on a button; the content is built again only when the action or its text changes. */
export function fillActionButton<T>(button: HTMLButtonElement, a: ResolvedAction<T>) {
  const key = actionKey(a);
  if (button.dataset.key !== key) {
    releases.get(button)?.();
    releases.delete(button);
    button.replaceChildren();
    const icon = a.hasIcon ? read(a.action.icon) : null;
    if (icon) {
      const holder = document.createElement('span');
      holder.className = 'mx-button__icon';
      holder.setAttribute('aria-hidden', 'true');
      const shown = iconNode(icon);
      holder.append(shown.node);
      releases.set(button, shown.release);
      button.append(holder);
    }
    if (a.showText || !icon) button.append(a.text);
    button.dataset.key = key;
  }
  button.dataset.tone = a.action.tone ?? 'standard';
  button.dataset.action = a.action.id;
  if (a.showText) button.removeAttribute('aria-label');
  else button.setAttribute('aria-label', a.text);
  if (a.hint) button.dataset.hint = a.hint;
  else delete button.dataset.hint;
  if (a.disabled) button.setAttribute('aria-disabled', 'true');
  else button.removeAttribute('aria-disabled');
}
