import type { ListOption } from '../list-option';

/** The value and display text of a list option. */
export function optionOf(o: ListOption): { value: unknown; label: string } {
  return typeof o === 'object' && o !== null ? o : { value: o, label: String(o) };
}
