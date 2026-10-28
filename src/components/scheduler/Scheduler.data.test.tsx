import { data } from '@motifx-community/data';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { windowStack } from '../../core/window-stack';
import { formatRuleDate } from '../../parts/recurrence/format-rule-date';
import { rangeFilter } from './model/range-filter';
import { Scheduler } from './Scheduler';

interface Meeting {
  id?: number;
  text: string;
  startDate: Date | string;
  endDate: Date | string;
  recurrenceRule?: string;
  recurrenceException?: string;
  recurrenceId?: number;
}

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute);
const tick = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve();
};
const settle = async () => {
  for (let i = 0; i < 6; i++) await tick();
  await new Promise((done) => setTimeout(done, 0));
  for (let i = 0; i < 6; i++) await tick();
};
const made: Scheduler<Meeting>[] = [];
const sources: data.DataSource<Meeting, number>[] = [];

beforeAll(() => {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
  proto.show = proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

afterEach(async () => {
  for (const s of made.splice(0)) await s.dispose();
  for (const source of sources.splice(0)) source.dispose();
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
});

const series = (): Meeting => ({ id: 1, text: 'Standup', startDate: at(5, 9), endDate: at(5, 10), recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR' });

/** A scheduler over a data source of the in-memory adapter (new rows get keys from 10). */
function fromSource(rows: Meeting[], props: Record<string, unknown> = {}, adapter?: data.DataAdapter<Meeting, number>) {
  let next = 10;
  const source = new data.DataSource<Meeting, number>({ adapter: adapter ?? new data.ArrayAdapter<Meeting, number>({ data: rows, key: 'id', createKey: () => next++ }), loadMode: 'all' });
  sources.push(source);
  const scheduler = new Scheduler<Meeting>({ dataSource: source, currentDate: at(28, 0), firstDayOfWeek: 1, locale: 'en-GB', ...props });
  made.push(scheduler);
  mount(scheduler);
  return { s: scheduler, source };
}
const boxes = (s: Scheduler<Meeting>) => [...s.element.querySelectorAll<HTMLElement>('.mx-scheduler__appointment')].filter((b) => !b.hidden);
const on = (s: Scheduler<Meeting>, day: number) => s.shownAppointments.find((a) => new Date(a.startDate).getDate() === day)!;
const row = (source: data.DataSource<Meeting, number>, id: number) => source.rows.find((r) => r.id === id)!;

describe('rangeFilter', () => {
  it('keeps what a range may show: what overlaps it, and every series that began before it', () => {
    const fields = { start: 'startDate', end: 'endDate', recurrenceRule: 'recurrenceRule' };
    const rows = [
      { id: 1, startDate: at(1, 9), endDate: at(1, 10), recurrenceRule: 'FREQ=DAILY' },
      { id: 2, startDate: at(1, 9), endDate: at(1, 10), recurrenceRule: '' },
      { id: 3, startDate: at(27, 9), endDate: at(27, 10) },
      { id: 4, startDate: at(30, 23), endDate: at(31, 2) },
      { id: 5, startDate: at(2, 9), endDate: at(2, 10), recurrenceRule: 'FREQ=WEEKLY' },
      { id: 6, startDate: new Date(2026, 10, 9), endDate: new Date(2026, 10, 9, 1), recurrenceRule: 'FREQ=DAILY' },
    ];
    const range = { start: at(26, 0), end: at(31, 0) };
    const filter = rangeFilter(range, fields);
    expect(data.queryArray(rows, { filter }).rows.map((r) => r.id)).toEqual([1, 3, 4, 5]);
    // Without its part on the rule, the series that began before the range would be left out.
    const span = (filter as { and: data.FilterExpression[] }).and;
    expect(data.queryArray(rows, { filter: { and: [span[0], { field: 'endDate', op: '>=', value: range.start }] } }).rows.map((r) => r.id)).toEqual([3, 4]);
  });
});

describe('Scheduler: series through a data source', () => {
  it('this occurrence: the changed one is a new row naming the series, the series row gets its time left out', async () => {
    const rows = [series()];
    const { s, source } = fromSource(rows);
    await settle();
    expect(await s.updateAppointment(on(s, 28), { text: 'Apart', startDate: at(28, 11), endDate: at(28, 12) }, 'occurrence')).toBe(true);
    await settle();
    expect(source.rows).toHaveLength(2);
    expect(row(source, 10)).toMatchObject({ text: 'Apart', recurrenceId: 1, startDate: at(28, 11) });
    expect(row(source, 1).recurrenceException).toMatch(/^\d{8}T\d{6}Z$/);
    expect(boxes(s).filter((b) => b.dataset.exception).length).toBe(1);
  });

  it('this and following: the series row ends before it, the new series is a row of its own', async () => {
    const rows = [series()];
    const { s, source } = fromSource(rows);
    await settle();
    await s.updateAppointment(on(s, 28), { text: 'Later' }, 'following');
    await settle();
    expect(row(source, 1).recurrenceRule).toMatch(/^FREQ=WEEKLY;UNTIL=\d{8}T\d{6}Z;BYDAY=MO,WE,FR$/);
    expect(row(source, 10)).toMatchObject({ text: 'Later', recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR', startDate: at(28, 9) });
    expect(boxes(s).map((b) => b.querySelector('.mx-scheduler__appointment-text')?.textContent)).toEqual(['Standup', 'Later', 'Later']);
  });

  it('the whole series: its row moves', async () => {
    const rows = [series()];
    const { s, source } = fromSource(rows);
    await settle();
    await s.updateAppointment(on(s, 30), { startDate: at(30, 10), endDate: at(30, 11) }, 'series');
    await settle();
    expect(source.rows).toHaveLength(1);
    expect(row(source, 1)).toMatchObject({ startDate: at(5, 10), endDate: at(5, 11) });
  });

  it('deleting: one is left out, the following end the series and take their changed rows, the series goes with its changed rows', async () => {
    const rows = [
      series(),
      { id: 2, text: 'Moved early', startDate: at(13, 15), endDate: at(13, 16), recurrenceId: 1 },
      { id: 3, text: 'Moved late', startDate: at(29, 15), endDate: at(29, 16), recurrenceId: 1 },
    ];
    const { s, source } = fromSource(rows);
    await settle();
    await s.deleteAppointment(on(s, 26), 'occurrence');
    await settle();
    expect(row(source, 1).recurrenceException).toMatch(/Z$/);
    await s.deleteAppointment(s.shownAppointments.find((a) => s.isOccurrence(a) && new Date(a.startDate).getDate() === 28)!, 'following');
    await settle();
    expect(row(source, 1).recurrenceRule).toMatch(/UNTIL=/);
    // The one changed apart after it goes with them; the one before stays (it was not even loaded).
    expect(rows.map((r) => r.id).sort()).toEqual([1, 2]);
    await s.deleteAppointment(s.occurrencesOf(row(source, 1), at(1, 0), at(31, 0))[0], 'series');
    await settle();
    // …and the series takes the one that was not loaded too.
    expect(rows).toEqual([]);
  });

  it('a changed occurrence is an ordinary row: it loads, shows, edits without a question and stays after a reload', async () => {
    const rows = [
      { ...series(), recurrenceException: formatRuleDate({ time: at(28, 9).getTime(), utc: true, dateOnly: false }) },
      { id: 2, text: 'Moved', startDate: at(28, 15), endDate: at(28, 16), recurrenceId: 1 },
    ];
    const { s, source } = fromSource(rows);
    await settle();
    const moved = s.shownAppointments.find((a) => a.text === 'Moved')!;
    expect(s.isException(moved)).toBe(true);
    expect(s.seriesOf(moved)?.id).toBe(1);
    let asked = 0;
    s.onSeriesAsking(() => asked++);
    expect(await s.updateAppointment(moved, { text: 'Moved again' })).toBe(true);
    await source.reload();
    await settle();
    const again = s.shownAppointments.find((a) => a.text === 'Moved again')!;
    expect(asked).toBe(0);
    expect(s.isException(again)).toBe(true);
    expect(boxes(s).filter((b) => b.dataset.exception).length).toBe(1);
    expect(await s.updateAppointment(on(s, 30), { text: 'Friday' }, 'occurrence')).toBe(true);
    await settle();
    expect(source.rows.filter((r) => r.recurrenceId === 1).map((r) => r.text).sort()).toEqual(['Friday', 'Moved again']);
  });
});

describe('Scheduler: a series over a REST service', () => {
  /** An in-memory REST endpoint at /api/meetings (JSON, so dates travel as text), reached through the adapter's `fetch`. */
  function service(rows: Meeting[]) {
    const calls: string[] = [];
    let id = 100;
    let failing: string | null = null;
    const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    const fetch = async (input: string, init: RequestInit) => {
      const url = new URL(input, 'http://test');
      const body = init.body ? JSON.parse(String(init.body)) : undefined;
      calls.push(`${init.method} ${url.pathname}`);
      if (failing === init.method) return json({ message: 'Refused' }, 500);
      if (url.pathname === '/api/meetings' && init.method === 'GET') {
        const filter = url.searchParams.get('filter');
        return json({ items: data.queryArray(rows, { filter: filter ? JSON.parse(filter) : undefined }).rows });
      }
      if (init.method === 'POST') {
        const created = { ...body, id: id++ };
        rows.push(created);
        return json(created, 201);
      }
      const at = rows.findIndex((r) => r.id === Number(url.pathname.split('/').pop()));
      if (init.method === 'PATCH') return json(Object.assign(rows[at], body));
      rows.splice(at, 1);
      return new Response(null, { status: 204 });
    };
    const adapter = new data.RestAdapter<Meeting, number>({ url: '/api/meetings', key: 'id', fetch });
    return { adapter, calls, rows, fail: (method: string | null) => (failing = method) };
  }
  const iso = (d: Date) => d.toISOString();

  it('asks for the days shown and the series before them, and writes a changed occurrence in order: the new row, then the series', async () => {
    const api = service([
      { id: 1, text: 'Standup', startDate: iso(at(5, 9)), endDate: iso(at(5, 10)), recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR' },
      { id: 2, text: 'Long ago', startDate: iso(at(1, 9)), endDate: iso(at(1, 10)) },
    ]);
    const { s, source } = fromSource([], {}, api.adapter);
    await settle();
    expect(source.rows.map((r) => r.id)).toEqual([1]);
    expect(boxes(s)).toHaveLength(3);
    api.calls.length = 0;
    await s.updateAppointment(on(s, 28), { text: 'Apart' }, 'occurrence');
    await settle();
    expect(api.calls.slice(0, 2)).toEqual(['POST /api/meetings', 'PATCH /api/meetings/1']);
    expect(api.rows.find((r) => r.id === 100)).toMatchObject({ text: 'Apart', recurrenceId: 1 });
    expect(api.rows.find((r) => r.id === 1)?.recurrenceException).toMatch(/Z$/);
  });

  it('when a later write fails the earlier one is taken back, and onDataError says what was saved', async () => {
    const api = service([{ id: 1, text: 'Standup', startDate: iso(at(5, 9)), endDate: iso(at(5, 10)), recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR' }]);
    const errors: { saved: string[]; unsaved: string[]; undone: boolean }[] = [];
    const { s } = fromSource([], { onDataError: (e: { saved: { kind: string }[]; unsaved: { kind: string }[]; undone: boolean }) => errors.push({ saved: e.saved.map((w) => w.kind), unsaved: e.unsaved.map((w) => w.kind), undone: e.undone }) }, api.adapter);
    await settle();
    api.fail('PATCH');
    expect(await s.updateAppointment(on(s, 28), { text: 'Apart' }, 'occurrence')).toBe(false);
    await settle();
    expect(errors).toEqual([{ saved: ['add'], unsaved: ['update'], undone: true }]);
    expect(api.rows.map((r) => r.id)).toEqual([1]);
    expect(api.calls).toContain('DELETE /api/meetings/100');
    expect(s.element.querySelector('.mx-scheduler__live')?.textContent).toBe('Could not save.');
  });

  it('when taking it back fails too, it says plainly that part of the change was saved', async () => {
    const api = service([{ id: 1, text: 'Standup', startDate: iso(at(5, 9)), endDate: iso(at(5, 10)), recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR' }]);
    const errors: boolean[] = [];
    const { s } = fromSource([], { onDataError: (e: { undone: boolean }) => errors.push(e.undone) }, api.adapter);
    await settle();
    // The new series is added, the old one cannot be ended, and the new one cannot be deleted again.
    const failing = api.adapter as unknown as { removeRow: () => Promise<void> };
    failing.removeRow = () => Promise.reject(new Error('Refused'));
    api.fail('PATCH');
    expect(await s.updateAppointment(on(s, 28), { text: 'Later' }, 'following')).toBe(false);
    await settle();
    expect(errors).toEqual([false]);
    expect(api.rows).toHaveLength(2);
    expect(s.element.querySelector('.mx-scheduler__live')?.textContent).toBe('Could not save all of it: part of the change was saved.');
  });
});
