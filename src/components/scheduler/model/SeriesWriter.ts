import type { AppointmentStore } from './AppointmentStore';
import type { SeriesPlan } from './series-plan';
import type { SeriesRun } from './series-run';
import type { SeriesWrite } from './series-write';

interface Done<T> {
  write: SeriesWrite<T>;
  /** How to take it back: the row added, the values before an update, the row deleted. */
  added?: T;
  before?: Partial<T>;
  deleted?: Partial<T>;
}

/**
 * Writes what a change to a series comes to, one write after another through the store (so
 * through the data source's adapter): the appointments to add first, then the changes, then the
 * deletes. When a write fails, the ones saved before it are taken back in the opposite order (a
 * row added is deleted, a change is written back, a row deleted is added again), and the result
 * says what was saved, what was not, and whether it was all taken back.
 */
export class SeriesWriter<T> {
  constructor(private readonly store: AppointmentStore<T>) {}

  async run(plan: SeriesPlan<T>): Promise<SeriesRun<T>> {
    const writes: SeriesWrite<T>[] = [
      ...plan.add.map((values): SeriesWrite<T> => ({ kind: 'add', appointment: values })),
      ...plan.update.map(({ item, changes }): SeriesWrite<T> => ({ kind: 'update', appointment: item, changes })),
      ...plan.remove.map((item): SeriesWrite<T> => ({ kind: 'delete', appointment: item })),
    ];
    const done: Done<T>[] = [];
    for (const write of writes) {
      try {
        done.push(await this.write(write));
      } catch (error) {
        const undone = await this.undo(done);
        return { added: null, failed: true, error, saved: done.map((d) => d.write), unsaved: writes.slice(done.length), undone };
      }
    }
    return { added: done.find((d) => d.added)?.added ?? null, failed: false, error: undefined, saved: writes, unsaved: [], undone: false };
  }

  private async write(write: SeriesWrite<T>): Promise<Done<T>> {
    const item = write.appointment as T;
    if (write.kind === 'add') return { write, added: await this.store.add(write.appointment as Partial<T>) };
    if (write.kind === 'update') {
      const record = item as Record<string, unknown>;
      const before = Object.fromEntries(Object.keys(write.changes ?? {}).map((key) => [key, copy(record[key])])) as Partial<T>;
      await this.store.update(item, write.changes ?? {});
      return { write, before };
    }
    const deleted = { ...(item as object) } as Partial<T>;
    await this.store.remove(item);
    return { write, deleted };
  }

  /** Takes saved writes back, the last first; `true` when every one was. */
  private async undo(done: Done<T>[]): Promise<boolean> {
    let all = true;
    for (const step of [...done].reverse()) {
      try {
        if (step.added !== undefined) await this.store.remove(step.added);
        else if (step.before) await this.store.update(step.write.appointment as T, step.before);
        else if (step.deleted) await this.store.add(step.deleted);
      } catch {
        all = false;
      }
    }
    return all;
  }
}

/** A field's value as it is now (a date copied: the row may change it in place). */
function copy(value: unknown): unknown {
  return value instanceof Date ? new Date(value.getTime()) : value;
}
