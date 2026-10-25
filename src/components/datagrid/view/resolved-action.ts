import type { GridAction } from '../grid-action';
import type { RowState } from '../row-state';

/** An action as one row shows it now. */
export interface ResolvedAction<T> {
  action: GridAction<T>;
  row: T;
  state: RowState;
  text: string;
  /** Tooltip; `''` for none. */
  hint: string;
  disabled: boolean;
  hasIcon: boolean;
  showText: boolean;
  /** In the "more" menu when it does not fit, always, or never. */
  menu: 'auto' | 'always' | 'never';
}
