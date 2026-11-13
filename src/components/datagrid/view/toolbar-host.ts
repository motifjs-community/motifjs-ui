import type { ComponentBase } from '@motifx/core';
import type { DataGrid } from '../DataGrid';
import type { GridToolbarItem } from '../grid-toolbar-item';
import type { GridToolbarItemName } from '../grid-toolbar-item-name';
import type { ActionEntry } from '../model/action-entry';
import type { ExportCommand } from './export-command';
import type { GroupPanel } from './GroupPanel';

/** What the toolbar asks the grid; the grid owns its data, menus and focus. */
export interface ToolbarHost {
  grid: DataGrid<any>;
  /** Whether there is something to export (an exportable visible column). */
  canExport(): boolean;
  /** The commands of the export button: a format each, and each again for the selected rows when allowed. Reactive. */
  exportCommands(): ExportCommand[];
  /** The export button's name ("Export", or `export.texts.exportTo`). Reactive. */
  exportName(): string;
  /** Opens the list of columns under `anchor`, the toolbar's button. */
  openColumns(anchor: ComponentBase): void;
  /** Whether the list of columns has a column to show or hide. */
  hasColumns(): boolean;
  /** The group panel, which the toolbar holds while `groupPanel` is on. */
  groupPanel(): GroupPanel<any>;
  /** Id of the grid, for ids of the bar's own elements. */
  gridId: string;
  /** Whether actions can show in the toolbar (the `rowActions` item). Reactive. */
  hasBarActions(): boolean;
  /** The actions the toolbar shows now. Reactive. */
  barEntries(): ActionEntry<any>[];
  /** Runs an action of the bar on its rows. */
  runBarAction(entry: ActionEntry<any>, location: 'toolbar'): void;
  /** The items the bar takes, as `onToolbarPreparing` leaves them. */
  prepare(items: readonly (GridToolbarItem | GridToolbarItemName)[]): readonly (GridToolbarItem | GridToolbarItemName)[];
}
