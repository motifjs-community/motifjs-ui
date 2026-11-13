import type { IDisposable } from '@motifx/core';

/** What covering holds on one part of a disabled control's area. */
export interface CoverRecord {
  holds: IDisposable[];
  /** The names held: the part's own writes of them wait in core until the part is given back. */
  names: Set<string>;
  /** A part that stays focusable while disabled: only `aria-disabled` is held. */
  keepsFocus: boolean;
}
