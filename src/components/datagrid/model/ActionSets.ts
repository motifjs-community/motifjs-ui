import { reactive, read, untracked } from '@motifx/core';
import type { BuiltInAction } from '../built-in-action';
import type { GridAction } from '../grid-action';
import type { GridActionItem } from '../grid-action-item';
import type { GridActionLocation } from '../grid-action-location';
import type { RowState } from '../row-state';
import type { ActionEntry } from './action-entry';
import type { ActionTarget } from './action-target';
import type { GridModel } from './GridModel';

/**
 * Which rows the toolbar and the bottom bar act on, and the actions those rows share: one row's
 * own actions, or the ones every row has (same `id`, visible for each), disabled as
 * `actionsMultipleEnabled` says. Reads are reactive: the bars follow the selection, the active row
 * and the rows' states. The rows drawn tell what they hold, so the actions column shows only while
 * an action sits in the row.
 */
export class ActionSets<T> {
  private readonly marks = reactive({ inRow: 0, never: 0 });
  private readonly drawn = new Map<object, { inRow: boolean; never: boolean }>();

  constructor(private readonly model: GridModel<T>) {}

  /** The action of an entry of the `actions` prop. */
  resolve(item: GridActionItem<T>): GridAction<T> | undefined {
    return typeof item === 'string' ? (this.model.builtIns?.[item as BuiltInAction] as GridAction<T> | undefined) : item;
  }

  locationOf(action: GridAction<T>): GridActionLocation {
    return read(action.location) ?? this.model.settings.get('actionsLocation');
  }

  menuOf(action: GridAction<T>): 'auto' | 'always' | 'never' {
    return read(action.menu) ?? 'auto';
  }

  inContextMenu(action: GridAction<T>): boolean {
    return read(action.contextMenu) ?? this.model.settings.get('actionsContextMenu');
  }

  /** Whether some action sits in the row: the column shows while one does. Reactive. */
  inRow(): boolean {
    const list = this.model.actionList;
    if (list) return list.some((item) => {
      const action = this.resolve(item);
      return !!action && this.locationOf(action) === 'row';
    });
    if (this.model.settings.get('actionsLocation') === 'row') return true;
    return this.marks.inRow > 0;
  }

  /** Whether actions can show in a bar: one of the listed ones sits there (with a function: maybe). Reactive. */
  canShowIn(location: GridActionLocation): boolean {
    if (!this.model.hasActions) return false;
    const list = this.model.actionList;
    if (!list) return true;
    return list.some((item) => {
      const action = this.resolve(item);
      return !!action && this.locationOf(action) === location;
    });
  }

  /** Whether an action in the row stays a button even in the `'menu'` display. Reactive. */
  anyNever(): boolean {
    const list = this.model.actionList;
    if (list) return list.some((item) => {
      const action = this.resolve(item);
      return !!action && this.locationOf(action) === 'row' && this.menuOf(action) === 'never';
    });
    return this.marks.never > 0;
  }

  /** A drawn row tells what its actions hold (with `actions` as a function the grid learns it from the rows). */
  markRow(holder: object, inRow: boolean, never: boolean) {
    const before = this.drawn.get(holder);
    if (before?.inRow === inRow && before?.never === never) return;
    if (inRow || never) this.drawn.set(holder, { inRow, never });
    else this.drawn.delete(holder);
    let rows = 0;
    let nevers = 0;
    for (const m of this.drawn.values()) {
      if (m.inRow) rows++;
      if (m.never) nevers++;
    }
    untracked(() => {
      if (this.marks.inRow !== rows) this.marks.inRow = rows;
      if (this.marks.never !== nevers) this.marks.never = nevers;
    });
  }

  /** What the bars act on now, by `actionsTarget`. Reactive. */
  target(): ActionTarget<T> {
    const s = this.model.settings;
    const mode = s.get('actionsTarget');
    const by = mode === 'auto' ? (s.get('selection') === 'none' ? 'focused' : 'selection') : mode;
    return by === 'focused' ? this.focusedTarget() : this.selectionTarget();
  }

  /** The active row, when it is a loaded data row. */
  focusedTarget(): ActionTarget<T> {
    const model = this.model;
    void model.state.version;
    const i = model.state.activeRow;
    if (i < 0 || model.groupAt(i) || model.footerAt(i)) return { kind: 'none' };
    const row = model.rowAt(i);
    return row === undefined ? { kind: 'none' } : { kind: 'rows', rows: [row], from: 'focused' };
  }

  /** The selected rows; the selection as a state when some of them are not loaded. */
  selectionTarget(): ActionTarget<T> {
    const model = this.model;
    const sel = model.selection;
    if (sel.empty) return { kind: 'none' };
    void model.state.version;
    const selection = sel.snapshot();
    const source = model.data.source;
    if (selection.all) {
      if (source.loadMode !== 'all') return { kind: 'selection', selection, count: sel.count(model.dataTotal) };
      const rows = source.rows.filter((row) => sel.isSelected(model.selectId(row)));
      return rows.length ? { kind: 'rows', rows, from: 'selection' } : { kind: 'none' };
    }
    const rows: T[] = [];
    for (const key of selection.keys) {
      const row = model.data.rowByKey(key);
      if (row === undefined) return { kind: 'selection', selection, count: selection.keys.length };
      rows.push(row);
    }
    return { kind: 'rows', rows, from: 'selection' };
  }

  /** The actions the bar at `location` shows now. Reactive. */
  barEntries(location: GridActionLocation): ActionEntry<T>[] {
    return this.entries(this.target(), (a) => this.locationOf(a) === location);
  }

  /** The actions a target's rows share, among those `keep` takes. Reactive. */
  entries(target: ActionTarget<T>, keep: (action: GridAction<T>) => boolean): ActionEntry<T>[] {
    if (target.kind === 'none') return [];
    if (target.kind === 'selection') return this.selectionEntries(target, keep);
    const fromSelection = target.from === 'selection';
    const items = target.rows.map((row) => this.itemOf(row));
    const lists = items.map((it) => this.model.rowActions(it.row, it.state).filter((a) => keep(a) && runs(a)));
    if (items.length === 1) {
      const it = items[0];
      return lists[0].map((action) => ({
        action,
        text: read(action.text) ?? '',
        count: 1,
        disabled: isDisabled(action, it.row, it.state),
        items: [{ ...it, action }],
        selection: null,
        fromSelection,
      }));
    }
    const others = lists.slice(1).map((list) => new Map(list.map((a) => [a.id, a])));
    const out: ActionEntry<T>[] = [];
    for (const action of lists[0]) {
      const own = [action, ...others.map((m) => m.get(action.id))];
      if (own.some((a) => !a || read(a.multiple) === false)) continue;
      const all = items.map((it, i) => ({ ...it, action: own[i]! }));
      const on = all.filter((x) => !isDisabled(x.action, x.row, x.state));
      const any = (read(action.multipleEnabled) ?? this.model.settings.get('actionsMultipleEnabled')) === 'any';
      const disabled = any ? on.length === 0 : on.length < all.length;
      const runOn = any && on.length ? on : all;
      out.push({ action, text: read(action.text) ?? '', count: runOn.length, disabled, items: runOn, selection: null, fromSelection });
    }
    return out;
  }

  /** A row's text with the count of rows it runs on, as the buttons and menus show it. */
  label(entry: ActionEntry<T>): string {
    const show = read(entry.action.showCount) ?? this.model.settings.get('actionsShowCount');
    if (!show || entry.count < 2) return entry.text;
    return this.model.text('gridActionCount', { text: entry.text, count: this.model.formatter.count(entry.count) });
  }

  /** The name a screen reader gives the action: its text and how many rows it runs on. */
  spokenLabel(entry: ActionEntry<T>): string {
    if (entry.count < 2) return entry.text;
    return this.model.text('gridActionCountLabel', { text: entry.text, count: this.model.formatter.count(entry.count) });
  }

  /** What the bars act on, in words ("Actions for 3 selected rows"); `''` for nothing. Reactive. */
  targetLabel(): string {
    const target = this.target();
    const model = this.model;
    if (target.kind === 'none') return '';
    if (target.kind === 'rows' && target.from === 'focused') return model.text('gridActionsForRow');
    const count = target.kind === 'rows' ? target.rows.length : target.count;
    if (count === 1) return model.text('gridActionsForSelectedRow');
    return model.text('gridActionsForSelectedRows', { count: model.formatter.count(count) });
  }

  /** A row with its state, as its actions see it. */
  itemOf(row: T): { row: T; state: RowState } {
    const model = this.model;
    const rowId = model.rowIdOf(row);
    const obj = model.edit(rowId)?.row ?? row;
    let index = model.indexOfKey(rowId);
    if (index < 0) index = model.indexOfRow(obj);
    return { row: obj, state: model.rowState(obj, rowId, index) };
  }

  /** Rows not loaded: only the listed actions that work on a selection, without asking a row. */
  private selectionEntries(target: Extract<ActionTarget<T>, { kind: 'selection' }>, keep: (action: GridAction<T>) => boolean): ActionEntry<T>[] {
    const out: ActionEntry<T>[] = [];
    for (const item of this.model.actionList ?? []) {
      const action = this.resolve(item);
      if (!action?.onclickSelection || !keep(action) || action.visible === false || read(action.multiple) === false) continue;
      out.push({ action, text: read(action.text) ?? '', count: target.count, disabled: action.disabled === true, items: [], selection: target.selection, fromSelection: true });
    }
    return out;
  }
}

function runs<T>(action: GridAction<T>): boolean {
  return !!(action.onclick || action.onclickMany || action.onclickSelection);
}

function isDisabled<T>(action: GridAction<T>, row: T, state: RowState): boolean {
  return typeof action.disabled === 'function' ? action.disabled(row, state) : !!action.disabled;
}
