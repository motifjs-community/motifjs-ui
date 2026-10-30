import type { GridActionRanEventArgs } from '../grid-action-ran-event-args';
import type { GridActionRun } from '../grid-action-run';
import type { GridSelection } from '../grid-selection';
import type { ActionEntry } from './action-entry';
import type { GridModel } from './GridModel';
import type { RunPanel } from './run-panel';
import { readField } from './read-field';

type Place = GridActionRun['location'];

const isThenable = (value: unknown): value is PromiseLike<unknown> => !!value && typeof (value as PromiseLike<unknown>).then === 'function';

/**
 * Runs an action on its rows: `onclickMany` once with all of them, else `onclick` for each row in
 * turn (waiting for a promise), or `onclickSelection` with the selection. Work that waits shows the
 * progress panel with Stop; a failed row does not stop the others unless `stopOnError`. The outcome
 * is announced and told through `onActionRan`. Plain functions run at once, in the same task.
 */
export class ActionRunner<T> {
  private controller: AbortController | null = null;

  constructor(
    private readonly model: GridModel<T>,
    private readonly panel: RunPanel,
  ) {}

  /** Stops the action running now: the rows not started are left. */
  stop() {
    this.controller?.abort();
  }

  dispose() {
    this.stop();
  }

  /** Runs an entry, after `onActionRunning`; `null` when it is disabled, another one runs, or the event cancels it. */
  run(entry: ActionEntry<T>, location: Place): Promise<GridActionRanEventArgs<T> | null> {
    const { model } = this;
    const ev = model.events;
    if (model.state.acting || entry.disabled) return Promise.resolve(null);
    const action = entry.action;
    const rows = entry.items.map((it) => it.row);
    const selection = entry.selection ?? (entry.fromSelection ? model.selection.snapshot() : null);
    if (!ev.ask(ev.actionRunning, () => ({ action, rows, selection, location, cancel: false }))) return Promise.resolve(null);
    return this.work(entry, location, rows);
  }

  private async work(entry: ActionEntry<T>, location: Place, rows: T[]): Promise<GridActionRanEventArgs<T>> {
    const { model } = this;
    const st = model.state;
    const settings = model.settings;
    const action = entry.action;
    const total = entry.selection ? entry.count : rows.length;
    const controller = new AbortController();
    this.controller = controller;
    const errors: { row: T | undefined; error: unknown }[] = [];
    let done = 0;
    let failed = 0;
    let waiting = false;
    let panel = false;
    // The first promise: the grid waits, and the panel shows for several rows.
    const wait = () => {
      if (waiting) return;
      waiting = true;
      st.acting = true;
      model.stateChanged('acting');
      if (total > 1 && settings.get('actionsProgress')) panel = this.panel.open(model.text('gridActionRunning', { action: entry.text }), () => controller.abort());
    };
    const e: GridActionRun = {
      location,
      signal: controller.signal,
      progress: (n, of = total) => panel && this.panel.progress(n, of),
    };
    const whole = async (call: () => unknown) => {
      try {
        let result = call();
        if (isThenable(result)) {
          wait();
          result = await result;
        }
        if (result === false) failed = total;
        else done = total;
      } catch (error) {
        failed = total;
        errors.push({ row: undefined, error });
      }
    };
    try {
      if (entry.selection) {
        await whole(() => action.onclickSelection!(entry.selection!, e));
      } else if (action.onclickMany && (rows.length > 1 || !action.onclick)) {
        await whole(() => action.onclickMany!(rows, e));
      } else if (action.onclick) {
        const stopOnError = readField(action, 'stopOnError') ?? settings.get('actionsStopOnError');
        for (const it of entry.items) {
          if (controller.signal.aborted) break;
          let ok = true;
          try {
            const result = (it.action.onclick ?? action.onclick)(it.row, it.state);
            if (isThenable(result)) {
              wait();
              e.progress(done + failed);
              ok = (await result) !== false;
            }
          } catch (error) {
            ok = false;
            errors.push({ row: it.row, error });
          }
          if (ok) done++;
          else failed++;
          e.progress(done + failed);
          if (!ok && stopOnError) break;
        }
      } else if (action.onclickSelection) {
        await whole(() => action.onclickSelection!(this.keysOf(rows), e));
      }
    } finally {
      if (this.controller === controller) this.controller = null;
      if (panel) this.panel.close();
      if (waiting) {
        st.acting = false;
        model.stateChanged('acting');
      }
    }
    const canceled = controller.signal.aborted && done + failed < total;
    if (total > 1 || failed > 0 || canceled) this.announce(entry.text, total, done, failed, canceled);
    const ran: GridActionRanEventArgs<T> = { action, rows, location, done, failed, canceled, errors };
    const ev = model.events;
    if (ev.listened(ev.actionRan)) ev.actionRan.fire(ran);
    else for (const { error } of errors) console.error(error);
    return ran;
  }

  private announce(text: string, total: number, done: number, failed: number, canceled: boolean) {
    const model = this.model;
    const n = (value: number) => model.formatter.count(value);
    const values = { action: text, count: n(total), total: n(total), done: n(done), failed: n(failed) };
    if (canceled) model.announce(model.text('gridActionStopped', values));
    else if (!failed) model.announce(model.text('gridActionDone', values));
    else if (!done) model.announce(model.text('gridActionFailed', values));
    else model.announce(model.text('gridActionPartly', values));
  }

  /** Loaded rows as a selection of their keys, for an action that only takes a selection. */
  private keysOf(rows: T[]): GridSelection {
    const adapter = this.model.data.source.adapter;
    return { all: false, keys: rows.map((row) => adapter.keyOf(row)), except: [], filter: null };
  }
}
