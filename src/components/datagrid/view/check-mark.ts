import { checkMark, dashMark } from '../../../core/glyphs';

/** A check box drawn as plain DOM (`role="checkbox"`) for the selection column; the cell holds focus, not the box. */
export function createCheck(label: string): HTMLSpanElement {
  const box = document.createElement('span');
  box.className = 'mx-data-grid__check';
  box.setAttribute('role', 'checkbox');
  box.setAttribute('aria-checked', 'false');
  // Named from the start: a row drawn before its state is known is read too.
  box.setAttribute('aria-label', label);
  const check = checkMark();
  check.classList.add('mx-data-grid__check-mark');
  const dash = dashMark();
  dash.classList.add('mx-data-grid__check-dash');
  box.append(check, dash);
  return box;
}

/** Shows a state on a check box; only what changed is written. */
export function setCheck(box: HTMLElement, state: boolean | 'mixed', label: string, enabled = true) {
  const value = state === 'mixed' ? 'mixed' : String(state);
  if (box.getAttribute('aria-checked') !== value) box.setAttribute('aria-checked', value);
  if (box.getAttribute('aria-label') !== label) box.setAttribute('aria-label', label);
  if (enabled) box.removeAttribute('aria-disabled');
  else box.setAttribute('aria-disabled', 'true');
}
