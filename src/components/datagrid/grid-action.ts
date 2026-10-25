import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { GridActionLocation } from './grid-action-location';
import type { GridActionRun } from './grid-action-run';
import type { GridSelection } from './grid-selection';
import type { RowState } from './row-state';

/**
 * A button of a row's actions. `text` is always there: it is the button's name for assistive
 * technology even when only the icon shows. Give an element icon as a function (`() => myIcon()`),
 * so every row gets its own.
 *
 * An action shows in its row, or in the toolbar or the bottom bar for the selected rows
 * (`location`); there several rows share the actions they all have. On several rows `onclickMany`
 * runs once with all of them; without it `onclick` runs for each row in turn.
 */
export interface GridAction<T = any> {
  /** Names the action; its width is measured once per `id` and text. Rows share an action by its `id`. */
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
  /** Where it shows. Default: the grid's `actionsLocation`. */
  location?: Bind<GridActionLocation>;
  /** In its "more" menu: when it does not fit, always, or never (a button even in the `'menu'` display). Default `'auto'`. */
  menu?: Bind<'auto' | 'always' | 'never'>;
  /** It can run on several rows at once. Default `true`; the grid's `edit` `false`. */
  multiple?: Bind<boolean>;
  /** On several rows: usable while it is enabled for all of them, or for any (it then runs on those). Default: the grid's `actionsMultipleEnabled`. */
  multipleEnabled?: Bind<'all' | 'any'>;
  /** On several rows one by one: a failed row stops the rest. Default: the grid's `actionsStopOnError`. */
  stopOnError?: Bind<boolean>;
  /** The count of rows it runs on, after its text ("Approve (3)"). Default: the grid's `actionsShowCount`. */
  showCount?: Bind<boolean>;
  /** In the row's context menu. Default: the grid's `actionsContextMenu`. */
  contextMenu?: Bind<boolean>;
  /** A line before it in a menu, to group the commands. */
  beginGroup?: Bind<boolean>;
  /** Runs for one row. A promise is waited for; a throw, a rejection or a promise of `false` counts the row as failed. */
  onclick?: (row: T, state: RowState) => unknown;
  /** Runs once for several rows (one row too, when there is no `onclick`). */
  onclickMany?: (rows: T[], e: GridActionRun) => unknown;
  /**
   * Runs for a selection whose rows are not loaded ("select all" over a server): it gets the selection
   * as `grid.selection` has it, to send to the server. Only actions that have it show in that state.
   */
  onclickSelection?: (selection: GridSelection, e: GridActionRun) => unknown;
}
