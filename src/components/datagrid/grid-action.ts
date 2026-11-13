import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { GridActionLocation } from './grid-action-location';
import type { GridActionRun } from './grid-action-run';
import type { GridSelection } from './grid-selection';
import type { RowState } from './row-state';

/**
 * A button among a row's actions. `text` is required: it is the button's accessible name even when
 * only the icon is displayed. Provide a component icon as a function (`() => myIcon()`), so that
 * every row has its own.
 *
 * An action appears in its row, or in the toolbar or the bottom bar for the selected rows (`location`),
 * where several rows share the actions they all have. On several rows, `onclickMany` runs once with
 * all of them. Without it, `onclick` runs for each row in turn.
 */
export interface GridAction<T = any> {
  /** Identifies the action. Its width is measured once per `id` and text, and rows share an action by its `id`. */
  id: string;
  text: Bind<string>;
  icon?: Bind<IconSource | null | undefined>;
  /** Shows the text next to the icon. By default, only when there is no icon. */
  showText?: boolean;
  /** The color of its button and of its menu items. The default is `'standard'`. */
  tone?: 'standard' | 'accent' | 'danger';
  /** A tooltip. By default, `text` when only the icon is displayed. */
  hint?: Bind<string>;
  disabled?: boolean | ((row: T, state: RowState) => boolean);
  /** `false` omits the action for that row. */
  visible?: boolean | ((row: T, state: RowState) => boolean);
  /** Where it appears. The default is the grid's `actionsLocation`. */
  location?: Bind<GridActionLocation>;
  /**
   * When it moves into the "more" menu: when it does not fit, always, or never (a button even in the
   * `'menu'` display). The default is `'auto'`.
   */
  menu?: Bind<'auto' | 'always' | 'never'>;
  /** Allows it to run on several rows at once. The default is `true`, and `false` for the built-in `edit`. */
  multiple?: Bind<boolean>;
  /**
   * On several rows, the action is available while it is enabled for all of them, or for any (it then
   * runs on those). The default is the grid's `actionsMultipleEnabled`.
   */
  multipleEnabled?: Bind<'all' | 'any'>;
  /** On several rows one by one, a failed row stops the rest. The default is the grid's `actionsStopOnError`. */
  stopOnError?: Bind<boolean>;
  /**
   * Shows the count of rows it runs on after its text ("Approve (3)"). The default is the grid's
   * `actionsShowCount`.
   */
  showCount?: Bind<boolean>;
  /** Includes it in the row's context menu. The default is the grid's `actionsContextMenu`. */
  contextMenu?: Bind<boolean>;
  /** Shows a separator before it in a menu, to group the commands. */
  beginGroup?: Bind<boolean>;
  /** Runs for one row. A promise is awaited. An error, a rejection or a promise of `false` counts the row as failed. */
  onclick?: (row: T, state: RowState) => unknown;
  /** Runs once for several rows (one row too, when there is no `onclick`). */
  onclickMany?: (rows: T[], e: GridActionRun) => unknown;
  /**
   * Runs for a selection whose rows are not loaded ("select all" over a server). It receives the
   * selection as in `grid.selection`, to send to the server. Only actions that have it appear in that
   * state.
   */
  onclickSelection?: (selection: GridSelection, e: GridActionRun) => unknown;
}
