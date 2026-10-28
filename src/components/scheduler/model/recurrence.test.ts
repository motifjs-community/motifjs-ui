import { reactive } from '@motifx/core';
import { describe, expect, it } from 'vitest';
import { TimeZone } from '../../../parts/dates/time-zone';
import type { SchedulerFields } from '../scheduler-fields';
import type { ResolvedView } from './resolved-view';
import { SchedulerModel } from './SchedulerModel';
import { SeriesEdit } from './SeriesEdit';

const FIELDS: SchedulerFields = {
  key: 'id',
  start: 'startDate',
  end: 'endDate',
  text: 'text',
  allDay: 'allDay',
  description: 'description',
  color: 'color',
  disabled: 'disabled',
  visible: 'visible',
  allowDrag: 'allowDrag',
  allowResize: 'allowResize',
  allowEdit: 'allowEdit',
  allowDelete: 'allowDelete',
  recurrenceRule: 'recurrenceRule',
  recurrenceException: 'recurrenceException',
  recurrenceId: 'recurrenceId',
  startTimeZone: 'startDateTimeZone',
  endTimeZone: 'endDateTimeZone',
};

interface Item {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  recurrenceRule?: string;
  recurrenceException?: string;
  recurrenceId?: number;
  startDateTimeZone?: string;
}

const MINUTE = 60_000;
const berlin = TimeZone.of('Europe/Berlin');
const newYork = TimeZone.of('America/New_York');
/** A time on a zone's clock. */
const on = (zone: TimeZone, y: number, m: number, d: number, h = 0, min = 0) => zone.date(Date.UTC(y, m - 1, d, h, min));
const tick = async () => {
  for (let i = 0; i < 4; i++) await Promise.resolve();
};

function model(items: Item[], date: Date, zone = berlin, type: ResolvedView['type'] = 'week') {
  const state = reactive({ items, date, zone: zone.name });
  const m = new SchedulerModel<Item>({
    date: () => state.date,
    items: () => state.items,
    fields: () => FIELDS,
    view: () => ({ name: type, type, intervalCount: 1, startDayHour: 0, endDayHour: 24, cellDuration: 30, allDayPanel: true, maxAppointmentsPerCell: 'auto', groups: [], groupByDate: false }),
    firstDayOfWeek: () => 1,
    workDays: () => [1, 2, 3, 4, 5],
    isHoliday: () => null,
    overlapMode: () => 'columns',
    room: () => ({ month: Infinity, allDay: Infinity }),
    zone: () => TimeZone.of(state.zone),
  });
  m.start();
  return { m, state };
}

/** Minutes from the column's top, and how many it covers, of a timed piece. */
const minutes = (piece: { top: number; height: number }) => [Math.round(piece.top * 1440), Math.round(piece.height * 1440)];

describe('series in the layout', () => {
  it('a series shows its occurrences in the days shown, each the same object while it stays, flagged as a series', async () => {
    const items = reactive([
      {
        id: 1,
        text: 'Standup',
        startDate: on(berlin, 2026, 10, 5, 9),
        endDate: on(berlin, 2026, 10, 5, 9, 15),
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
      },
    ]) as Item[];
    const { m, state } = model(items, new Date(2026, 9, 28));
    await tick();
    expect(m.state.timed.map((p) => p.column)).toEqual([0, 2, 4]);
    expect(m.state.timed.every((p) => p.series && !p.exception)).toBe(true);
    expect(minutes(m.state.timed[0])).toEqual([540, 15]);
    const first = m.state.timed[0];
    const occurrence = first.item;
    expect(m.occurrenceOf(occurrence)?.series).toBe(m.seriesOf(occurrence));
    items[0].text = 'Daily';
    await tick();
    expect(m.state.timed[0]).toBe(first);
    expect(first.text).toBe('Daily');
    state.date = new Date(2026, 10, 4);
    await tick();
    expect(m.state.timed.map((p) => p.column)).toEqual([0, 2, 4]);
    expect(m.appointmentsIn(on(berlin, 2026, 10, 1), on(berlin, 2026, 11, 1)).length).toBe(12);
  });

  it('times in the exception field are left out; an occurrence changed apart shows marked as one', async () => {
    const items = reactive([
      {
        id: 1,
        text: 'Review',
        startDate: on(berlin, 2026, 10, 5, 10),
        endDate: on(berlin, 2026, 10, 5, 11),
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
        recurrenceException: '20261026T090000Z',
      },
      { id: 2, text: 'Review (moved)', startDate: on(berlin, 2026, 10, 27, 14), endDate: on(berlin, 2026, 10, 27, 15), recurrenceId: 1 },
    ]) as Item[];
    const { m } = model(items, new Date(2026, 9, 28));
    await tick();
    expect(m.state.timed.map((p) => [p.column, p.text, p.series, p.exception])).toEqual([[1, 'Review (moved)', false, true]]);
    expect(m.seriesOf(items[1])).toBe(items[0]);
    expect(m.isException(items[1])).toBe(true);
  });

  it('an all-day series keeps its days', async () => {
    const items = [
      { id: 1, text: 'Gym', startDate: new Date(2026, 9, 1), endDate: new Date(2026, 9, 2), allDay: true, recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU,TH' },
    ];
    const { m } = model(items, new Date(2026, 9, 28), newYork);
    await tick();
    expect(m.state.allDay.pieces.map((p) => [p.first, p.span])).toEqual([
      [1, 1],
      [3, 1],
    ]);
  });

  it('a series repeats on its own clock: 09:00 in New York is 15:00 in Berlin, then 14:00 while only America has summer time', async () => {
    const items = [
      {
        id: 1,
        text: 'Call',
        startDate: on(newYork, 2026, 3, 2, 9),
        endDate: on(newYork, 2026, 3, 2, 10),
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
        startDateTimeZone: 'America/New_York',
      },
    ];
    const { m, state } = model(items, new Date(2026, 2, 2));
    await tick();
    expect(minutes(m.state.timed[0])).toEqual([900, 60]);
    state.date = new Date(2026, 2, 9);
    await tick();
    expect(minutes(m.state.timed[0])).toEqual([840, 60]);
    state.date = new Date(2026, 2, 30);
    await tick();
    expect(minutes(m.state.timed[0])).toEqual([900, 60]);
  });
});

describe('summer time in the layout', () => {
  it('Europe, the hour put back: a series keeps 09:00, an hour inside the doubled hour shows as long as it lasts', async () => {
    const items = [
      { id: 1, text: 'Daily', startDate: on(berlin, 2026, 10, 19, 9), endDate: on(berlin, 2026, 10, 19, 10), recurrenceRule: 'FREQ=DAILY' },
      // 02:30 summer time to 02:30 winter time: an hour that the clock shows as no time at all.
      { id: 2, text: 'Doubled', startDate: new Date(Date.UTC(2026, 9, 25, 0, 30)), endDate: new Date(Date.UTC(2026, 9, 25, 1, 30)) },
    ];
    const { m } = model(items, new Date(2026, 9, 21));
    await tick();
    const daily = m.state.timed.filter((p) => p.text === 'Daily');
    expect(daily.map(minutes)).toEqual(Array.from({ length: 7 }, () => [540, 60]));
    const doubled = m.state.timed.find((p) => p.text === 'Doubled')!;
    expect([doubled.column, ...minutes(doubled)]).toEqual([6, 150, 60]);
    expect((doubled.end.getTime() - doubled.start.getTime()) / MINUTE).toBe(60);
  });

  it('Europe, the hour put forward: 01:30 to 03:30 lasts an hour but reaches the 03:30 row; a new appointment in the skipped hour starts after it', async () => {
    const items = [{ id: 1, text: 'Night', startDate: new Date(Date.UTC(2026, 2, 29, 0, 30)), endDate: new Date(Date.UTC(2026, 2, 29, 1, 30)) }];
    const { m } = model(items, new Date(2026, 2, 26));
    await tick();
    const night = m.state.timed[0];
    expect([night.column, ...minutes(night)]).toEqual([6, 90, 120]);
    const cell = m.cellOf({ column: 6, slot: 5 })!;
    expect(cell.start.toISOString()).toBe('2026-03-29T01:30:00.000Z');
  });

  it('America: the same on its own dates', async () => {
    const items = [
      { id: 1, text: 'Forward', startDate: on(newYork, 2026, 3, 8, 1), endDate: on(newYork, 2026, 3, 8, 4) },
      { id: 2, text: 'Back', startDate: new Date(Date.UTC(2026, 10, 1, 5, 30)), endDate: new Date(Date.UTC(2026, 10, 1, 6, 30)) },
    ];
    const { m, state } = model(items, new Date(2026, 2, 5), newYork);
    await tick();
    const forward = m.state.timed[0];
    expect([forward.column, ...minutes(forward)]).toEqual([6, 60, 180]);
    expect((forward.end.getTime() - forward.start.getTime()) / MINUTE).toBe(120);
    state.date = new Date(2026, 10, 1);
    await tick();
    const back = m.state.timed[0];
    expect([back.text, back.column, ...minutes(back)]).toEqual(['Back', 6, 90, 60]);
  });

  it('the days and today follow the zone: the same moment is another day in Tokyo', async () => {
    const tokyo = TimeZone.of('Asia/Tokyo');
    const items = [{ id: 1, text: 'Late', startDate: new Date(Date.UTC(2026, 9, 27, 20)), endDate: new Date(Date.UTC(2026, 9, 27, 21)) }];
    const { m, state } = model(items, new Date(2026, 9, 28));
    await tick();
    expect(m.state.timed[0].column).toBe(1);
    state.zone = tokyo.name;
    await tick();
    expect([m.state.timed[0].column, ...minutes(m.state.timed[0])]).toEqual([2, 300, 60]);
    expect(m.state.days[0].date.toISOString()).toBe('2026-10-25T15:00:00.000Z');
  });
});

describe('series edits', () => {
  function setup(rule = 'FREQ=WEEKLY;BYDAY=MO,WE', exceptions = '') {
    const items = reactive([
      { id: 1, text: 'Sync', startDate: on(berlin, 2026, 10, 5, 9), endDate: on(berlin, 2026, 10, 5, 10), recurrenceRule: rule, recurrenceException: exceptions },
    ]) as Item[];
    const { m } = model(items, new Date(2026, 9, 28));
    const edit = new SeriesEdit<Item>({
      fields: () => FIELDS,
      occurrences: m.occurrences,
      keyOf: (item) => item.id,
    });
    const occurrence = (day: number) => m.appointmentsIn(on(berlin, 2026, 10, day), on(berlin, 2026, 10, day + 1))[0];
    return { items, m, edit, occurrence };
  }

  it('this occurrence: a new appointment in its place naming its series, its time left out of the series', async () => {
    const { items, edit, occurrence } = setup();
    await tick();
    const plan = edit.update(occurrence(28), { startDate: on(berlin, 2026, 10, 28, 11), text: 'Sync (late)' }, 'occurrence');
    expect(plan.add).toHaveLength(1);
    expect(plan.add[0]).toMatchObject({ text: 'Sync (late)', recurrenceId: 1, startDate: on(berlin, 2026, 10, 28, 11), endDate: on(berlin, 2026, 10, 28, 10) });
    expect(plan.add[0]).not.toHaveProperty('id');
    expect(plan.add[0]).not.toHaveProperty('recurrenceRule');
    expect(plan.update).toEqual([{ item: items[0], changes: { recurrenceException: '20261028T080000Z' } }]);
  });

  it('this and following: the series ends just before it, a new one goes on from it with the change', async () => {
    const { items, edit, occurrence } = setup('FREQ=WEEKLY;BYDAY=MO,WE', '20261007T070000Z,20261104T080000Z');
    await tick();
    const plan = edit.update(occurrence(28), { text: 'Sync 2' }, 'following');
    expect(plan.update[0].item).toBe(items[0]);
    expect(plan.update[0].changes).toEqual({ recurrenceRule: 'FREQ=WEEKLY;UNTIL=20261028T075959Z;BYDAY=MO,WE', recurrenceException: '20261007T070000Z' });
    expect(plan.add[0]).toMatchObject({ text: 'Sync 2', startDate: on(berlin, 2026, 10, 28, 9), recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE', recurrenceException: '20261104T080000Z' });
  });

  it('this and following with a count: the count is split between the two', async () => {
    const { edit, occurrence } = setup('FREQ=WEEKLY;COUNT=10;BYDAY=MO,WE');
    await tick();
    const plan = edit.update(occurrence(28), { text: 'Later' }, 'following');
    // 5, 7, 12, 14, 19, 21, 26 October came before.
    expect(plan.update[0].changes).toMatchObject({ recurrenceRule: 'FREQ=WEEKLY;COUNT=7;BYDAY=MO,WE' });
    expect(plan.add[0]).toMatchObject({ recurrenceRule: 'FREQ=WEEKLY;COUNT=3;BYDAY=MO,WE' });
  });

  it('the whole series: moved a day and an hour on one occurrence, every one moves (its weekdays too)', async () => {
    const { items, edit, occurrence } = setup();
    await tick();
    const plan = edit.update(occurrence(28), { startDate: on(berlin, 2026, 10, 29, 10), endDate: on(berlin, 2026, 10, 29, 11) }, 'series');
    expect(plan.add).toEqual([]);
    expect(plan.update[0].item).toBe(items[0]);
    expect(plan.update[0].changes).toEqual({
      startDate: on(berlin, 2026, 10, 6, 10),
      endDate: on(berlin, 2026, 10, 6, 11),
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU,TH',
    });
  });

  it('this and following on the first one is the whole series', async () => {
    const { edit, m } = setup();
    await tick();
    const first = m.appointmentsIn(on(berlin, 2026, 10, 5), on(berlin, 2026, 10, 6))[0];
    expect(edit.update(first, { text: 'All' }, 'following')).toEqual({ add: [], update: [{ item: m.seriesOf(first), changes: { text: 'All' } }], remove: [] });
  });

  it('deleting: this one is left out, the following end the series (and go with their changed ones), the series goes whole', async () => {
    const { items, edit, occurrence } = setup();
    items.push(
      { id: 7, text: 'Moved early', startDate: on(berlin, 2026, 10, 13, 9), endDate: on(berlin, 2026, 10, 13, 10), recurrenceId: 1 },
      { id: 8, text: 'Moved late', startDate: on(berlin, 2026, 11, 3, 9), endDate: on(berlin, 2026, 11, 3, 10), recurrenceId: 1 },
    );
    await tick();
    expect(edit.remove(occurrence(28), 'occurrence').update[0].changes).toEqual({ recurrenceException: '20261028T080000Z' });
    const exceptions = items.filter((i) => i.recurrenceId === 1);
    const following = edit.remove(occurrence(28), 'following', exceptions);
    expect(following.update[0].changes).toMatchObject({ recurrenceRule: 'FREQ=WEEKLY;UNTIL=20261028T075959Z;BYDAY=MO,WE' });
    expect(following.remove.map((i) => i.id)).toEqual([8]);
    expect(edit.remove(occurrence(28), 'series', exceptions).remove.map((i) => i.id)).toEqual([1, 7, 8]);
  });
});
