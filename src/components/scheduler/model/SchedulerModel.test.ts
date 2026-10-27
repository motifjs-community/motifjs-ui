import { reactive } from '@motifx/core';
import { describe, expect, it } from 'vitest';
import type { SchedulerFields } from '../scheduler-fields';
import { placeLanes } from './place-lanes';
import { placeTimed } from './place-timed';
import type { ResolvedView } from './resolved-view';
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
};

const view = (over: Partial<ResolvedView> = {}): ResolvedView => ({
  name: 'week',
  type: 'week',
  intervalCount: 1,
  startDayHour: 0,
  endDayHour: 24,
  cellDuration: 30,
  allDayPanel: true,
  maxAppointmentsPerCell: 'auto',
  ...over,
});

interface Item {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  visible?: boolean;
}

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute);
const tick = () => Promise.resolve();

function model(items: Item[], settings: Partial<ResolvedView> = {}, room = { month: Infinity, allDay: Infinity }) {
  const state = reactive({
    items,
    view: view(settings),
    room,
    date: at(28, 0),
  });
  const m = new SchedulerModel<Item>({
    date: () => state.date,
    items: () => state.items,
    fields: () => FIELDS,
    view: () => state.view,
    firstDayOfWeek: () => 1,
    workDays: () => [1, 2, 3, 4, 5],
    isHoliday: () => null,
    overlapMode: () => 'columns',
    room: () => state.room,
  });
  m.start();
  return { m, state };
}

describe('view dates', () => {
  it('a week starts on the first day of the week; a work week keeps the work days', () => {
    const week = viewDates(view(), at(28, 9), 1, [1, 2, 3, 4, 5]);
    expect(week.map((d) => d.getDate())).toEqual([26, 27, 28, 29, 30, 31, 1]);
    const work = viewDates(view({ type: 'workWeek' }), at(28, 9), 1, [1, 2, 3, 4, 5]);
    expect(work.map((d) => d.getDate())).toEqual([26, 27, 28, 29, 30]);
  });

  it('a month shows whole weeks around it; the steps are a day, a week or a month times the interval', () => {
    const month = viewDates(view({ type: 'month' }), at(28, 9), 1, []);
    expect(month.length % 7).toBe(0);
    expect(month[0].getDate()).toBe(28); // Monday 28 September
    expect(month[month.length - 1].getDate()).toBe(1); // Sunday 1 November
    expect(stepDate(view({ type: 'day', intervalCount: 3 }), at(28, 9), 1).getDate()).toBe(31);
    expect(stepDate(view({ intervalCount: 2 }), at(28, 9), -1).getDate()).toBe(14);
    expect(stepDate(view({ type: 'month' }), at(31, 9), 1).getMonth()).toBe(10);
  });
});

describe('layout', () => {
  it('overlapping spans share the width; a span widens over free columns', () => {
    const places = placeTimed([
      { id: 'a', start: 60, end: 180 },
      { id: 'b', start: 60, end: 120 },
      { id: 'c', start: 120, end: 180 },
      { id: 'd', start: 300, end: 360 },
    ]);
    expect(places.get('a')).toEqual({ column: 0, columns: 2, spread: 1 });
    expect(places.get('b')).toEqual({ column: 1, columns: 2, spread: 1 });
    expect(places.get('c')).toEqual({ column: 1, columns: 2, spread: 1 });
    expect(places.get('d')).toEqual({ column: 0, columns: 1, spread: 1 });
  });

  it('bars take the lowest free line, longer ones first', () => {
    const lanes = placeLanes([
      { id: 'short', first: 1, last: 1, order: 1 },
      { id: 'long', first: 0, last: 3, order: 0 },
      { id: 'later', first: 2, last: 2, order: 2 },
    ]);
    expect([lanes.get('long'), lanes.get('short'), lanes.get('later')]).toEqual([0, 1, 1]);
  });

  it('places timed appointments in their day columns and keeps each piece as the same object', async () => {
    const items = reactive([
      { id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) },
      { id: 2, text: 'Review', startDate: at(28, 9, 30), endDate: at(28, 11) },
    ]) as Item[];
    const { m } = model(items);
    await tick();
    const wednesday = m.state.timed.filter((p) => p.day === 2);
    expect(wednesday.map((p) => p.item.text)).toEqual(['Standup', 'Review']);
    const standup = wednesday[0];
    expect(standup.top).toBeCloseTo(9 / 24);
    expect(standup.height).toBeCloseTo(1 / 24);
    expect([standup.left, standup.width]).toEqual([0, 0.5]);
    items[1].startDate = at(28, 14);
    items[1].endDate = at(28, 15);
    await tick();
    expect(m.state.timed.find((p) => p.item.text === 'Standup')).toBe(standup);
    expect([standup.left, standup.width]).toEqual([0, 1]);
  });

  it('an appointment over midnight is a piece on each day; a long one goes to the all-day panel', async () => {
    const { m } = model([
      { id: 1, text: 'Night', startDate: at(28, 22), endDate: at(29, 2) },
      { id: 2, text: 'Trip', startDate: at(27, 8), endDate: at(30, 18) },
      {
        id: 3,
        text: 'Holiday',
        startDate: at(29, 0),
        endDate: at(29, 0),
        allDay: true,
      },
    ]);
    await tick();
    expect(m.state.timed.filter((p) => p.day === 2).map((p) => [p.item.text, p.before, p.after])).toEqual([['Night', false, true]]);
    expect(m.state.timed.filter((p) => p.day === 3).map((p) => [p.item.text, p.before, p.after])).toEqual([['Night', true, false]]);
    expect(m.state.allDay.pieces.map((p) => [p.item.text, p.first, p.span])).toEqual([
      ['Trip', 1, 4],
      ['Holiday', 3, 1],
    ]);
  });

  it('a month week leaves out what does not fit and counts it per day', async () => {
    const items: Item[] = [1, 2, 3, 4].map((i) => ({
      id: i,
      text: `A${i}`,
      startDate: at(28, 8 + i),
      endDate: at(28, 9 + i),
    }));
    const { m, state } = model(items, { type: 'month', name: 'month' }, { month: 3, allDay: Infinity });
    await tick();
    const week = m.state.weeks.find((w) => w.days.some((d) => d.date.getDate() === 28 && d.date.getMonth() === 9))!;
    const day = week.days.findIndex((d) => d.date.getDate() === 28);
    expect(week.pieces.filter((p) => !p.hidden).length).toBe(2);
    expect(week.more[day]).toBe(2);
    expect(week.pieces.every((p) => p.timed)).toBe(true);
    state.view = view({
      type: 'month',
      name: 'month',
      maxAppointmentsPerCell: 4,
    });
    await tick();
    expect(week.more[day]).toBe(0);
  });

  it('selects from the anchor to the focus; an all-day cell selects whole days', async () => {
    const { m } = model([]);
    await tick();
    m.focusCell({ day: 1, slot: 18 });
    m.focusCell({ day: 1, slot: 20 }, true);
    expect(m.selection()).toEqual({
      start: at(27, 9),
      end: at(27, 10, 30),
      allDay: false,
    });
    expect(m.isSelected(1, 19)).toBe(true);
    expect(m.isSelected(1, 21)).toBe(false);
    m.focusCell({ day: 2, slot: -1 });
    m.focusCell({ day: 4, slot: -1 }, true);
    expect(m.selection()).toEqual({
      start: at(28, 0),
      end: at(31, 0),
      allDay: true,
    });
  });

  it('leaves out hidden appointments and finds the ones in a time', async () => {
    const { m } = model([
      { id: 1, text: 'Shown', startDate: at(28, 9), endDate: at(28, 10) },
      {
        id: 2,
        text: 'Hidden',
        startDate: at(28, 9),
        endDate: at(28, 10),
        visible: false,
      },
    ]);
    await tick();
    expect(m.state.shown.map((i) => i.text)).toEqual(['Shown']);
    expect(m.appointmentsIn(at(28, 9, 30), at(28, 9, 45)).map((i) => i.text)).toEqual(['Shown']);
    expect(m.appointmentsIn(at(28, 10), at(28, 11))).toEqual([]);
  });
});
