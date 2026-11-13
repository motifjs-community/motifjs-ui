import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { Scheduler } from './Scheduler';

interface Job {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  roomId?: number;
}

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute);
const tick = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve();
};
const settle = async () => {
  for (let i = 0; i < 4; i++) await tick();
  await new Promise((done) => setTimeout(done, 0));
  for (let i = 0; i < 4; i++) await tick();
};
const made: Scheduler<Job>[] = [];
const rooms = [
  { id: 1, text: 'Atlas' },
  { id: 2, text: 'Bosphorus' },
];

afterEach(async () => {
  for (const s of made.splice(0)) await s.dispose();
});

function make(props: Record<string, unknown> = {}) {
  const scheduler = new Scheduler<Job>({
    currentDate: at(28, 0),
    firstDayOfWeek: 1,
    locale: 'en-GB',
    startDayHour: 8,
    endDayHour: 18,
    cellDuration: 60,
    ...props,
  });
  made.push(scheduler);
  return mount(scheduler);
}

const cells = (s: Scheduler<Job>, scope: string) => [...s.element.querySelectorAll<HTMLElement>(`${scope} [role="gridcell"]`)];
const boxes = (s: Scheduler<Job>) => [...s.element.querySelectorAll<HTMLElement>('.mx-scheduler__appointment')].filter((b) => !b.hidden);
const sameNodes = (before: HTMLElement[], after: HTMLElement[]) => before.length === after.length && before.every((el, i) => el === after[i]);

describe('Scheduler keeps its parts', () => {
  it('the week grid keeps its cells across dates, day/week/work week and another cell template', async () => {
    const s = make({
      views: ['day', 'week', 'workWeek', 'month'],
      currentView: 'week',
      appointments: [{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) }],
    });
    await settle();
    const view = s.element.querySelector('.mx-scheduler__time-view');
    const before = cells(s, '.mx-scheduler__cells');
    expect(before.length).toBe(7 * 10);
    s.next();
    await settle();
    expect(sameNodes(before, cells(s, '.mx-scheduler__cells'))).toBe(true);
    s.previous();
    await settle();
    const box = boxes(s)[0];
    s.currentView = 'workWeek';
    await settle();
    expect(s.element.querySelector('.mx-scheduler__time-view')).toBe(view);
    expect(boxes(s)[0]).toBe(box);
    const work = cells(s, '.mx-scheduler__cells');
    expect(work.length).toBe(5 * 10);
    expect(work.every((c) => before.includes(c))).toBe(true);
    s.currentView = 'day';
    await settle();
    expect(s.element.querySelector('.mx-scheduler__time-view')).toBe(view);
    const day = cells(s, '.mx-scheduler__cells');
    // A template takes its context: a function of none would be read as a binding.
    s.dataCellTemplate = (_context) => {
      const c = new Component<HTMLSpanElement>('span');
      c.class.add('my-cell');
      return c;
    };
    await settle();
    expect(sameNodes(day, cells(s, '.mx-scheduler__cells'))).toBe(true);
    expect(s.element.querySelectorAll('.mx-scheduler__cells .my-cell').length).toBe(day.length);
  });

  it('the month keeps its cells as it moves on, a week more or less only adding or taking a row', async () => {
    const s = make({ views: ['month'], currentView: 'month' });
    await settle();
    const before = cells(s, '.mx-scheduler__month-view');
    expect(before.length).toBe(35);
    s.next();
    await settle();
    const november = cells(s, '.mx-scheduler__month-view');
    expect(november.length).toBe(42);
    expect(sameNodes(before, november.slice(0, 35))).toBe(true);
    s.next();
    await settle();
    expect(sameNodes(november.slice(0, 35), cells(s, '.mx-scheduler__month-view').slice(0, 35))).toBe(true);
  });

  it('the timeline keeps its rows by resource and its cells as the dates move', async () => {
    const s = make({
      views: ['timelineWeek'],
      resources: [{ field: 'roomId', label: 'Room', items: rooms }],
      groups: ['roomId'],
      appointments: [{ id: 1, text: 'Install', startDate: at(26, 9), endDate: at(26, 11), roomId: 1 }],
    });
    await settle();
    const rows = [...s.element.querySelectorAll<HTMLElement>('.mx-scheduler__line')];
    expect(rows.length).toBe(2);
    const before = cells(s, '.mx-scheduler__line');
    s.next();
    await settle();
    expect(sameNodes(rows, [...s.element.querySelectorAll<HTMLElement>('.mx-scheduler__line')])).toBe(true);
    expect(sameNodes(before, cells(s, '.mx-scheduler__line'))).toBe(true);
    s.dataCellTemplate = (_context) => new Component<HTMLSpanElement>('span');
    await settle();
    expect(sameNodes(before, cells(s, '.mx-scheduler__line'))).toBe(true);
    expect(s.element.querySelectorAll('.mx-scheduler__line .mx-scheduler__cell-content').length).toBe(s.element.querySelectorAll('.mx-scheduler__line .mx-scheduler__cell').length);
  });
});
