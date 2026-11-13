import type { ComponentBase, IDisposable } from '@motifx/core';
import type { CoverRecord } from './cover-record';

/** A part that stays focusable while disabled (a button can ask for that): only marked `aria-disabled`. */
const KEEPS_FOCUS = 'data-mx-focusable-disabled';

const covered = new WeakMap<ComponentBase, CoverRecord>();

/**
 * Disables one component of a disabled control's area through core, over what the component has itself: `disabled`
 * where the element has it, and out of the Tab order with `aria-disabled` where it takes focus. Disposing the result
 * gives the component its own values back.
 */
export function cover(part: ComponentBase): IDisposable {
  const attr = part.attr;
  const record: CoverRecord = { holds: [], names: new Set(), keepsFocus: attr.has(KEEPS_FOCUS) };
  covered.set(part, record);
  if (record.keepsFocus) hold(part, record, { 'aria-disabled': 'true' });
  else {
    if ('disabled' in part.element) hold(part, record, { disabled: true });
    if (attr.has('tabindex') || attr.has('href') || attr.has('contenteditable')) hold(part, record, { tabindex: -1, 'aria-disabled': 'true' });
  }
  return {
    dispose() {
      if (covered.get(part) === record) covered.delete(part);
      for (const each of record.holds.reverse()) each.dispose();
      record.holds = [];
      record.names.clear();
    },
  };
}

function hold(part: ComponentBase, record: CoverRecord, values: Record<string, unknown>): void {
  record.holds.push(part.attr.hold(values));
  for (const name of Object.keys(values)) record.names.add(name);
}

/** Whether core holds `name` on the part now: its element shows the held value, not the part's own. */
export function isHeld(part: ComponentBase, name: string): boolean {
  return !!covered.get(part)?.names.has(name);
}

/** A covered part that was just given a tabindex, href or contenteditable leaves the Tab order as well. */
export function coverFocus(part: ComponentBase, name: string): void {
  const record = covered.get(part);
  if (!record || record.keepsFocus || record.names.has('tabindex')) return;
  if (name === 'tabindex' || name === 'href' || name === 'contenteditable') hold(part, record, { tabindex: -1, 'aria-disabled': 'true' });
}
