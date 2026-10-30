import { describe, expect, it } from 'vitest';
import type { SchedulerBlockedTime } from '../scheduler-blocked-time';
import type { SchedulerFields } from '../scheduler-fields';
import type { SchedulerResource } from '../scheduler-resource';
import type { SchedulerTimeCheck } from '../scheduler-time-check';
import type { ResolvedView } from './resolved-view';
import { Resources } from './Resources';
import { SchedulerModel, type TimeRule } from './SchedulerModel';

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
  color?: string;
  roomId?: number;
  ownerIds?: number[];
}

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute);
const tick = () => Promise.resolve();

const rooms = [
  { id: 1, text: 'Blue', color: '#1565c0' },
  { id: 2, text: 'Green', color: '#2e7d32', workStartHour: 12, workEndHour: 20 },
];
const people = [
  { id: 1, text: 'Ana', color: '#ad1457', roomId: 1 },
  { id: 2, text: 'Ben', color: '#ef6c00', roomId: 1 },
  { id: 3, text: 'Cem', color: '#6a1b9a', roomId: 2, workDays: [1, 2, 3] },
];

function model(
  items: Item[],
  settings: Partial<ResolvedView> = {},
  more: { resources?: SchedulerResource<unknown>[]; blocked?: SchedulerBlockedTime[]; overlap?: boolean | TimeRule<Item>; offHours?: boolean } = {},
) {
  const state = {
    items,
    resources: more.resources ?? [
      { field: 'roomId', label: 'Room', items: rooms },
      { field: 'ownerIds', label: 'People', items: people, allowMultiple: true, parentExpr: 'roomId' },
    ],
    view: {
      name: 'week',
      type: 'week',
      intervalCount: 1,
      startDayHour: 0,
      endDayHour: 24,
      cellDuration: 30,
      allDayPanel: true,
      maxAppointmentsPerCell: 'auto',
      groups: [],
      groupByDate: false,
      ...settings,
    } as ResolvedView,
    blocked: more.blocked ?? [],
    overlap: more.overlap ?? true,
    offHours: more.offHours ?? true,
  };
  const resources = new Resources(() => state.resources as SchedulerResource<unknown>[]);
  const m = new SchedulerModel<Item>({
    date: () => at(28, 0),
    items: () => state.items,
    fields: () => FIELDS,
    view: () => state.view,
    firstDayOfWeek: () => 1,
    workDays: () => [1, 2, 3, 4, 5],
    isHoliday: () => null,
    overlapMode: () => 'columns',
    room: () => ({ month: Infinity, allDay: Infinity }),
    resources,
    workHours: () => ({ start: 9, end: 17 }),
    blockedTimes: () => state.blocked,
    allowOverlap: () => state.overlap,
    allowOffHours: () => state.offHours,
  });
  m.start();
  return { m, state, resources };
}

const meeting = (id: number, day: number, from: number, to: number, more: Partial<Item> = {}): Item => ({ id, text: `M${id}`, startDate: at(day, from), endDate: at(day, to), ...more });

describe('resources', () => {
  it('colour an appointment: its own first, then the kind marked to colour, else the first kind with a colour', async () => {
    const items = [meeting(1, 27, 9, 10, { roomId: 2, ownerIds: [1] }), meeting(2, 27, 11, 12, { roomId: 2, color: '#000000' }), meeting(3, 27, 13, 14, { ownerIds: [3] })];
    const { m, state, resources } = model(items);
    await tick();
    const color = (id: number) => m.state.timed.find((p) => m.itemOf(p).id === id)!.color;
    expect([color(1), color(2), color(3)]).toEqual(['#2e7d32', '#000000', '#6a1b9a']);
    state.resources = [
      { field: 'roomId', items: rooms },
      { field: 'ownerIds', items: people, allowMultiple: true, useColorAsDefault: true },
    ];
    resources.listChanged();
    await tick();
    expect([color(1), color(2), color(3)]).toEqual(['#ad1457', '#000000', '#6a1b9a']);
  });

  it('nest the groups (a person under their own room), outer first, with a head per level', async () => {
    const { m } = model([], { groups: ['roomId', 'ownerIds'], type: 'day' });
    await tick();
    expect(m.state.groups.map((g) => g.path.map((p) => p.text).join(' > '))).toEqual(['Blue > Ana', 'Blue > Ben', 'Green > Cem']);
    expect(m.state.columns.map((c) => c.edge)).toEqual(['', 'inner', 'outer']);
    expect(m.state.heads.map((row) => row.cells.map((c) => `${c.resource!.text}:${c.first}+${c.span}`))).toEqual([
      ['Blue:0+2', 'Green:2+1'],
      ['Ana:0+1', 'Ben:1+1', 'Cem:2+1'],
    ]);
    // An item's own work time wins: Cem works Monday to Wednesday, in Green's hours.
    expect(m.state.groups[2]).toMatchObject({ workStart: 12, workEnd: 20, workDays: [1, 2, 3] });
    expect(m.state.columns[2]).toMatchObject({ workStart: 12, workEnd: 20, work: true });
  });

  it('lay the columns out by group (each with every day) or by date (each day with every group)', async () => {
    const { m, state } = model([], { groups: ['roomId'] });
    await tick();
    const order = () => m.state.columns.map((c) => `${c.group!.path[0].text}${c.day.local.getDate()}`);
    expect(order().slice(0, 3)).toEqual(['Blue26', 'Blue27', 'Blue28']);
    expect(order()[7]).toBe('Green26');
    expect(m.state.columns[7].edge).toBe('outer');
    expect(m.state.dates).toHaveLength(14);
    state.view = { ...state.view, groupByDate: true };
    m.update();
    await tick();
    expect(order().slice(0, 4)).toEqual(['Blue26', 'Green26', 'Blue27', 'Green27']);
    expect(m.state.columns.slice(0, 3).map((c) => c.edge)).toEqual(['', 'inner', 'outer']);
    // A date over its two groups, and the groups under each date.
    expect(m.state.dates.map((d) => `${d.first}+${d.span}`).slice(0, 2)).toEqual(['0+2', '2+2']);
    expect(m.state.heads[0].cells).toHaveLength(14);
  });

  it('show an appointment in every group it has, each piece in that group\'s colour', async () => {
    const resources = [
      { field: 'roomId', items: rooms },
      { field: 'ownerIds', items: people, allowMultiple: true, useColorAsDefault: true },
    ];
    const { m } = model([meeting(1, 28, 9, 10, { roomId: 1, ownerIds: [1, 2] }), meeting(2, 28, 9, 10, { roomId: 1 })], { groups: ['ownerIds'], type: 'day' }, { resources });
    await tick();
    expect(m.state.timed.map((p) => [m.itemOf(p).id, p.column, p.group, p.color])).toEqual([
      [1, 0, 0, '#ad1457'],
      [1, 1, 1, '#ef6c00'],
    ]);
    // Without a value of the field it is grouped by, an appointment is in no group.
    expect(m.shown().map((i) => i.id)).toEqual([1]);
  });

  it('cut a bar over the groups under each date into a piece per day', async () => {
    const conference = { id: 1, text: 'Conference', startDate: at(27, 0), endDate: at(29, 0), allDay: true, roomId: 1 };
    const { m, state } = model([conference], { groups: ['roomId'] });
    await tick();
    expect(m.state.allDay.pieces.map((p) => [p.first, p.span, p.before, p.after])).toEqual([[1, 2, false, false]]);
    state.view = { ...state.view, groupByDate: true };
    m.update();
    await tick();
    expect(m.state.allDay.pieces.map((p) => [p.first, p.span, p.before, p.after])).toEqual([
      [2, 1, false, true],
      [4, 1, true, false],
    ]);
  });

  it('group the month: a week row has every group’s seven days', async () => {
    const { m } = model([meeting(1, 14, 9, 10, { roomId: 2 })], { type: 'month', groups: ['roomId'] });
    await tick();
    expect(m.perRow).toBe(14);
    expect(m.state.weeks[0].columns).toHaveLength(14);
    expect(m.state.dates).toHaveLength(14);
    const week = m.state.weeks.find((w) => w.pieces.length)!;
    // Wednesday 14 October, in Green: the second group's third day.
    expect(week.pieces.map((p) => [p.first, p.group])).toEqual([[9, 1]]);
  });

  it('move an appointment to another group: only the values of the group it leaves change', () => {
    const { m } = model([], { groups: ['roomId', 'ownerIds'] });
    return tick().then(() => {
      const [blueAna, blueBen, greenCem] = m.state.groups;
      const item = meeting(1, 27, 9, 10, { roomId: 1, ownerIds: [1, 3] });
      expect(m.movedValues(item, blueAna, blueBen)).toEqual({ ownerIds: [2, 3] });
      expect(m.movedValues(item, blueAna, greenCem)).toEqual({ roomId: 2, ownerIds: [3] });
      expect(m.movedValues(item, blueAna, blueAna)).toBeNull();
    });
  });

  it('select in one group: a cell of another group is not in the selection', async () => {
    const { m } = model([], { groups: ['roomId'], type: 'day' });
    await tick();
    m.focusCell({ column: 0, slot: 18 });
    m.focusCell({ column: 1, slot: 20 }, true);
    expect(m.selection()).toMatchObject({ allDay: false, resources: { roomId: 1 } });
    expect([m.isSelected(0, 19), m.isSelected(1, 19)]).toEqual([true, false]);
    expect(m.cellOf({ column: 1, slot: 18 })!.resources).toEqual({ roomId: 2 });
  });
});

describe('availability', () => {
  const lunch: SchedulerBlockedTime = { start: at(26, 12), end: at(26, 13), text: 'Lunch', recurrenceRule: 'FREQ=DAILY' };
  const repair: SchedulerBlockedTime = { start: at(29, 0), end: at(29, 0), allDay: true, text: 'Repair', resources: { roomId: 2 } };

  it('marks the cells of blocked times, for every group or only the ones named', async () => {
    const { m } = model([], { groups: ['roomId'] }, { blocked: [lunch, repair] });
    await tick();
    // 12:00 is the 24th row of half hours.
    expect([m.blockAt(0, 24)?.text, m.blockAt(0, 26)?.text, m.blockAt(9, 25)?.text]).toEqual(['Lunch', undefined, 'Lunch']);
    // The repair takes Green's Thursday whole; Blue's is free.
    expect([m.state.columns[3].blocked, m.state.columns[10].blocked]).toEqual([false, true]);
    expect([m.blockAt(10, -1)?.text, m.blockAt(3, -1)]).toEqual(['Repair', null]);
  });

  it('a time over a blocked time, or out of work hours when they are kept, is not free', async () => {
    const { m, state } = model([], {}, { blocked: [lunch, repair] });
    await tick();
    const item = meeting(9, 27, 9, 10, { roomId: 2 });
    expect(m.check(item, at(27, 12, 30), at(27, 13, 30), false).check.blocked.map((b) => b.text)).toEqual(['Lunch']);
    expect(m.check(item, at(27, 12, 30), at(27, 13, 30), false).free).toBe(false);
    expect(m.check(item, at(29, 9), at(29, 10), false).free).toBe(false);
    expect(m.check(item, at(29, 9), at(29, 10), false, { roomId: 1 }).free).toBe(true);
    // Green works from 12: 10 o'clock is off its hours, and so is a Saturday.
    expect(m.check(item, at(27, 10), at(27, 11), false).check.offHours).toBe(true);
    expect(m.check(item, at(27, 10), at(27, 11), false).free).toBe(true);
    state.offHours = false;
    expect(m.check(item, at(27, 10), at(27, 11), false).free).toBe(false);
    expect(m.check(item, at(27, 14), at(27, 15), false).free).toBe(true);
    expect(m.check(item, at(31, 0), at(1, 0), true).free).toBe(false);
  });

  it('with allowOverlap off, an appointment may not overlap another of its group; a rule of its own decides it all', async () => {
    const items = [meeting(1, 27, 9, 10, { roomId: 1 }), meeting(2, 27, 9, 10, { roomId: 2 })];
    const { m, state } = model(items, { groups: ['roomId'] }, { overlap: false });
    await tick();
    const moving = meeting(3, 27, 14, 15, { roomId: 1 });
    expect(m.check(moving, at(27, 9, 30), at(27, 10, 30), false).check.overlapping.map((i) => i.id)).toEqual([1]);
    expect(m.check(moving, at(27, 9, 30), at(27, 10, 30), false).free).toBe(false);
    expect(m.check(items[0], at(27, 9, 30), at(27, 10, 30), false).free).toBe(true);
    // Two at once fit in a room.
    const seen: SchedulerTimeCheck<Item>[] = [];
    state.overlap = (check: SchedulerTimeCheck<Item>) => (seen.push(check), check.overlapping.length < 2);
    expect(m.check(moving, at(27, 9, 30), at(27, 10, 30), false).free).toBe(true);
    expect(seen[0]).toMatchObject({ resources: { roomId: 1 }, offHours: false, blocked: [] });
    // Without groups, every appointment counts.
    state.view = { ...state.view, groups: [] };
    state.overlap = false;
    m.update();
    await tick();
    expect(m.check(moving, at(27, 9, 30), at(27, 10, 30), false).check.overlapping.map((i) => i.id)).toEqual([1, 2]);
  });
});
