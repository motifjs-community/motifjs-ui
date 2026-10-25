import { chevronEnd } from '../../../core/glyphs';

/** The arrow of the expand column, drawn as plain DOM (`role="button"`, `aria-expanded`); the cell holds focus, not the arrow. */
export function createExpandButton(label: string): HTMLSpanElement {
  const button = document.createElement('span');
  button.className = 'mx-data-grid__expand-button';
  button.setAttribute('role', 'button');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', label);
  button.hidden = true;
  button.append(chevronEnd());
  return button;
}

/** Shows a row's details state on its arrow (hidden for a row without details); only what changed is written. */
export function setExpandButton(button: HTMLElement, shown: boolean, open: boolean, label: string, controls: string | null) {
  if (button.hidden !== !shown) button.hidden = !shown;
  const expanded = String(open);
  if (button.getAttribute('aria-expanded') !== expanded) button.setAttribute('aria-expanded', expanded);
  if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
  if (controls) button.setAttribute('aria-controls', controls);
  else button.removeAttribute('aria-controls');
}
