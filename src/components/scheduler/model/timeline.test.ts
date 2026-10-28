import { reactive } from '@motifx/core';
import { describe, expect, it } from 'vitest';
import type { SchedulerFields } from '../scheduler-fields';
import type { SchedulerResource } from '../scheduler-resource';
import type { Draft } from './draft';
import { placeStack } from './place-stack';
import type { ResolvedView } from './resolved-view';
import { Resources } from './Resources';
import { SchedulerModel } from './SchedulerModel';
import { stepDate, viewDates } from './view-dates';

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
  roomId?: number;
  ownerId?: number;
}

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute);
const tick = async () => {
  for (let i = 0; i < 4; i++) await Promise.resolve();
};

const view = (over: Partial<ResolvedView> = {}): ResolvedView => ({
  name: 'timelineWeek',
  type: 'timelineWeek',
  intervalCount: 1,
  startDayHour: 8,
  endDayHour: 18,
  cellDuration: 60,
  allDayPanel: false,
  maxAppointmentsPerCell: 'auto',
  groups: [],
  groupByDate: false,
  ...over,
});

const rooms = [
  { id: 1, text: 'Blue', color: '#1565c0' },
  { id: 2, text: 'Green', color: '#2e7d32' },
];
const people = [
  { id: 1, text: 'Ana', roomId: 1 },
  { id: 2, text: 'Ben', roomId: 1 },
  { id: 3, text: 'Cem', roomId: 2 },
];

function model(items: Item[], settings: Partial<ResolvedView> = {}, kinds: SchedulerResource<unknown>[] = []) {
  const state = reactive({
    items,
    view: view(settings),
    date: at(28, 0),
    draft: null as Draft<Item> | null,
    lines: { lane: 20, gap: 2, min: 30 },
  });
  const resources = new Resources(() => kinds);
  const m = new SchedulerModel<Item>({
    date: () => state.date,
    items: () => state.items,
    fields: () => FIELDS,
    view: () => state.view,
    firstDayOfWeek: () => 1,
    workDays: () => [1, 2, 3, 4, 5],
    isHoliday: () => null,
    overlapMode: () => 'columns',
    room: () => ({ month: Infinity, allDay: Infinity }),
    draft: () => state.draft,
    resources,
    lineMetrics: () => state.lines,
  });
  m.start();
  return { m, state };
}

const byRoom: SchedulerResource<unknown>[] = [{ field: 'roomId', items: rooms }];

describe('timeline dates', () => {
  it('a timeline day, week, work week and month show their days; the month has its own days only', () => {
    const week = viewDates(view(), at(28, 9), 1, [1, 2, 3, 4, 5]);
    expect(week.map((d) => d.getDate())).toEqual([26, 27, 28, 29, 30, 31, 1]);
    expect(viewDates(view({ type: 'timelineWorkWeek' }), at(28, 9), 1, [1, 2, 3, 4, 5]).length).toBe(5);
    expect(viewDates(view({ type: 'timelineDay', intervalCount: 2 }), at(28, 9), 1, []).map((d) => d.getDate())).toEqual([28, 29]);
    const month = viewDates(view({ type: 'timelineMonth' }), at(28, 9), 1, []);
    expect([month.length, month[0].getDate(), month[30].getDate()]).toEqual([31, 1, 31]);
  });

  it('the agenda shows its days from the date, and moves by them', () => {
    const agenda = view({ type: 'agenda', agendaDuration: 3 });
    expect(viewDates(agenda, at(28, 9), 1, []).map((d) => d.getDate())).toEqual([28, 29, 30]);
    expect(stepDate(agenda, at(28, 9), 1).getDate()).toBe(31);
  });

  it('with startDate, intervals are counted from it', () => {
    const fortnight = view({ type: 'timelineWeek', intervalCount: 2, startDate: new Date(2026, 9, 12) });
    // From Monday the 12th in steps of two weeks: the 28th is in the one from the 26th.
    expect(viewDates(fortnight, at(28, 9), 1, [])[0].getDate()).toBe(26);
    expect(viewDates(fortnight, at(24, 9), 1, [])[0].getDate()).toBe(12);
    const days = view({ type: 'day', intervalCount: 3, startDate: new Date(2026, 9, 1) });
    expect(viewDates(days, at(28, 9), 1, [])[0].getDate()).toBe(28);
    expect(viewDates(days, at(27, 9), 1, [])[0].getDate()).toBe(25);
  });
});

describe('lanes', () => {
  it('a span takes the lowest lane free at its start; the longer of two that start together goes first', () => {
    const { lanes, count } = placeStack([
      { id: 'a', start: 0, end: 2, order: 0 },
      { id: 'b', start: 1, end: 3, order: 1 },
      { id: 'c', start: 2, end: 4, order: 2 },
      { id: 'd', start: 0, end: 5, order: 3 },
    ]);
    expect(count).toBe(3);
    expect([lanes.get('d'), lanes.get('a'), lanes.get('b'), lanes.get('c')]).toEqual([0, 1, 2, 1]);
  });
});

describe('timeline layout', () => {
  it('a row per group, each laid out on its own: its lanes and its height', async () => {
    const { m } = model(
      [
        { id: 1, text: 'A', startDate: at(26, 9), endDate: at(26, 11), roomId: 1 },
        { id: 2, text: 'B', startDate: at(26, 10), endDate: at(26, 12), roomId: 1 },
        { id: 3, text: 'C', startDate: at(26, 10), endDate: at(26, 12), roomId: 2 },
      ],
      { groups: ['roomId'] },
      byRoom,
    );
    await tick();
    const [blue, green] = m.state.rows;
    expect(m.state.rows.length).toBe(2);
    expect([blue.lanes, green.lanes]).toEqual([2, 1]);
    // 2 + lanes × (20 + 2), at least 30.
    expect([blue.height, green.height]).toEqual([46, 30]);
    expect(blue.first).toBe(0);
    expect(green.first).toBe(7);
    expect(blue.pieces.map((p) => [p.text, p.from, p.span, p.lane])).toEqual([
      ['A', 1, 2, 0],
      ['B', 2, 2, 1],
    ]);
    m.dispose();
  });

  it('a time cut to the hours shown goes on before and after; a day of hours is ten cells here', async () => {
    const { m } = model([{ id: 1, text: 'Night', startDate: at(26, 20), endDate: at(27, 10) }]);
    await tick();
    const [piece] = m.state.rows[0].pieces;
    // Monday 20:00 is past Monday's hours: it shows from Tuesday's first to 10:00.
    expect([piece.from, piece.span, piece.before, piece.after]).toEqual([10, 2, true, false]);
    expect(m.state.ticks.length).toBe(70);
    expect(m.state.upper.length).toBe(7);
    expect(m.state.lower.length).toBe(70);
    m.dispose();
  });

  it('the timeline month takes days whole; past a number of lanes the rest is "+N more" per day', async () => {
    const { m } = model(
      [
        { id: 1, text: 'A', startDate: at(5, 9), endDate: at(6, 12) },
        { id: 2, text: 'B', startDate: at(5, 10), endDate: at(5, 11) },
        { id: 3, text: 'C', startDate: at(5, 13), endDate: at(5, 14) },
      ],
      { type: 'timelineMonth', maxAppointmentsPerCell: 2 },
    );
    await tick();
    const row = m.state.rows[0];
    const a = row.pieces.find((p) => p.text === 'A')!;
    expect([a.from, a.span]).toEqual([4, 2]);
    expect(row.pieces.filter((p) => p.hidden).map((p) => p.text)).toEqual(['C']);
    expect(row.more.map((x) => ({ ...x }))).toEqual([{ day: 4, count: 1 }]);
    expect(row.lanes).toBe(3);
    m.dispose();
  });

  it('a draft lays out only the rows it was and is in; it moves the same piece along its row', async () => {
    const items = [
      { id: 1, text: 'A', startDate: at(26, 9), endDate: at(26, 10), roomId: 1 },
      { id: 2, text: 'B', startDate: at(26, 9), endDate: at(26, 10), roomId: 2 },
    ];
    const { m, state } = model(items, { groups: ['roomId'] }, byRoom);
    await tick();
    const green = m.state.rows[1].pieces;
    const piece = m.state.rows[0].pieces[0];
    state.draft = { item: m.state.rows[0].pieces[0].item, start: at(26, 12), end: at(26, 13), allDay: false, copy: false, invalid: false };
    await tick();
    expect(m.state.rows[0].pieces[0]).toBe(piece);
    expect(piece.from).toBe(4);
    expect(m.state.rows[1].pieces).toBe(green);
    // To the other room: the piece leaves its row, the other row grows a lane.
    state.draft = { ...state.draft, resources: { roomId: 2 } };
    await tick();
    expect(m.state.rows[0].pieces.length).toBe(0);
    expect(m.state.rows[1].pieces.map((p) => p.text)).toEqual(['B', 'A']);
    m.dispose();
  });

  it('nested groups: a row per inner item, the outer item named on its first row', async () => {
    const { m } = model([], { groups: ['roomId', 'ownerId'] }, [
      { field: 'roomId', items: rooms },
      { field: 'ownerId', items: people, parentExpr: 'roomId' },
    ]);
    await tick();
    expect(m.state.rows.map((r) => [r.label, r.starts.join(), r.edge])).toEqual([
      ['Blue, Ana', 'true,true', ''],
      ['Blue, Ben', 'false,true', 'inner'],
      ['Green, Cem', 'true,true', 'outer'],
    ]);
    m.dispose();
  });

  it('the window: a big timeline builds the cells of its window only', async () => {
    const { m } = model([{ id: 1, text: 'A', startDate: at(26, 9), endDate: at(26, 10) }], { scrolling: 'virtual' });
    await tick();
    m.setWindow(20, 10);
    expect(m.shownTicks().map((t) => t.index)).toEqual([20, 21, 22, 23, 24, 25, 26, 27, 28, 29]);
    expect(m.ticksShown(1, 1)).toBe(false);
    m.setWindow(0, 10);
    expect(m.ticksShown(1, 1)).toBe(true);
    m.dispose();
  });

  it('standard scrolling builds every cell; auto turns virtual past a few thousand cells', async () => {
    const { m, state } = model([], { scrolling: 'auto', cellDuration: 60 });
    await tick();
    expect(m.virtual).toBe(false);
    expect(m.shownTicks().length).toBe(70);
    state.view = view({ scrolling: 'auto', cellDuration: 5 });
    await tick();
    // 7 days of 120 cells, one row: under the mark still.
    expect(m.virtual).toBe(false);
    state.view = view({ scrolling: 'virtual' });
    await tick();
    expect(m.virtual).toBe(true);
    m.dispose();
  });
});

describe('the day views with many groups', () => {
  it('only the columns of the window, and their appointments', async () => {
    const many = Array.from({ length: 300 }, (_, i) => ({ id: i + 1, text: `R${i + 1}` }));
    const { m } = model(
      [
        { id: 1, text: 'first', startDate: at(26, 9), endDate: at(26, 10), roomId: 1 },
        { id: 2, text: 'late', startDate: at(26, 9), endDate: at(26, 10), roomId: 250 },
      ],
      { type: 'week', groups: ['roomId'], startDayHour: 0, endDayHour: 24, cellDuration: 30, allDayPanel: true },
      [{ field: 'roomId', items: many }],
    );
    await tick();
    expect(m.state.columns.length).toBe(2100);
    expect(m.virtual).toBe(true);
    m.setWindow(0, 30);
    expect(m.shownColumns().length).toBe(30);
    expect(m.shownTimed().map((p) => p.text)).toEqual(['first']);
    m.setWindow(249 * 7, 30);
    expect(m.shownTimed().map((p) => p.text)).toEqual(['late']);
    expect(m.shownHeads(m.state.dates).map((d) => d.first)).toEqual(Array.from({ length: 30 }, (_, i) => 249 * 7 + i));
    m.dispose();
  });
});

describe('agenda', () => {
  it('a day with nothing is left out; one that lasts days is on each; the whole ones first', async () => {
    const { m } = model(
      [
        { id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 9, 15) },
        { id: 2, text: 'Trip', startDate: at(29, 0), endDate: at(31, 0), allDay: true },
        { id: 3, text: 'Night', startDate: at(29, 22), endDate: at(30, 6) },
      ],
      { type: 'agenda', agendaDuration: 5 },
    );
    await tick();
    expect(m.state.agenda.map((d) => [d.day.local.getDate(), d.items.map((p) => `${p.text}${p.whole ? '*' : ''}`)])).toEqual([
      [28, ['Standup']],
      [29, ['Trip*', 'Night']],
      [30, ['Trip*', 'Night']],
    ]);
    const night = m.state.agenda[2].items[1];
    expect([night.before, night.after, night.start.getHours()]).toEqual([true, false, 0]);
    m.dispose();
  });

  it('with groups, each group its own days (its first under its name)', async () => {
    const { m } = model(
      [
        { id: 1, text: 'Blue one', startDate: at(28, 9), endDate: at(28, 10), roomId: 1 },
        { id: 2, text: 'Green one', startDate: at(29, 9), endDate: at(29, 10), roomId: 2 },
        { id: 3, text: 'Green two', startDate: at(30, 9), endDate: at(30, 10), roomId: 2 },
      ],
      { type: 'agenda', agendaDuration: 3, groups: ['roomId'] },
      byRoom,
    );
    await tick();
    expect(m.state.agenda.map((d) => [d.label, d.first, d.items.map((p) => p.text).join()])).toEqual([
      ['Blue', true, 'Blue one'],
      ['Green', true, 'Green one'],
      ['Green', false, 'Green two'],
    ]);
    m.dispose();
  });
});
