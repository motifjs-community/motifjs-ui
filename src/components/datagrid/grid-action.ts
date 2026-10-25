import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { RowState } from './row-state';

/**
 * A button of a row's actions. `text` is always there: it is the button's name for assistive
 * technology even when only the icon shows. Give an element icon as a function (`() => myIcon()`),
 * so every row gets its own.
 */
export interface GridAction<T = any> {
  /** Names the action; its width is measured once per `id` and text. */
  id: string;
  text: Bind<string>;
  icon?: Bind<IconSource | null | undefined>;
  /** Show the text next to the icon. Default: only when there is no icon. */
  showText?: boolean;
  /** Default `'standard'`. */
  tone?: 'standard' | 'accent' | 'danger';
  /** Shown as a tooltip. Default: `text` when only the icon shows. */
  hint?: Bind<string>;
  disabled?: boolean | ((row: T, state: RowState) => boolean);
  /** `false` leaves the action out for that row. */
  visible?: boolean | ((row: T, state: RowState) => boolean);
  onclick: (row: T, state: RowState) => void;
}
