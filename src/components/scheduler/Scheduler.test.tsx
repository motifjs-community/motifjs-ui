import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { Scheduler } from './Scheduler';

interface Meeting {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
}

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute);
const tick = async () => {
  for (let i = 0; i < 4; i++) await Promise.resolve();
};
const made: Scheduler<Meeting>[] = [];

function make(props: Record<string, unknown> = {}) {
  const scheduler = new Scheduler<Meeting>({
    currentDate: at(28, 0),
    firstDayOfWeek: 1,
    locale: 'en-GB',
    ...props,
  });
  made.push(scheduler);
  return mount(scheduler);
}

const boxes = (s: Scheduler<Meeting>) => [...s.element.querySelectorAll<HTMLElement>('.mx-scheduler__appointment')].filter((b) => !b.hidden);
const textOf = (el: Element) => el.querySelector('.mx-scheduler__appointment-text')?.textContent;

afterEach(async () => {
  for (const s of made.splice(0)) await s.dispose();
});

describe('Scheduler', () => {
  it('shows a week of cells and its appointments, the column of each by its day', async () => {
    const s = make({
      appointments: [
        {
          id: 1,
          text: 'Standup',
          startDate: at(28, 9),
          endDate: at(28, 9, 30),
        },
        {
          id: 2,
          text: 'Trip',
          startDate: at(27, 0),
          endDate: at(29, 0),
          allDay: true,
        },
      ],
    });
    await tick();
    expect(s.element.dataset.view).toBe('week');
    expect(s.element.querySelectorAll('.mx-scheduler__cells [role="gridcell"]').length).toBe(7 * 48);
    const standup = s.element.querySelector<HTMLElement>('.mx-scheduler__layer .mx-scheduler__appointment')!;
    expect(textOf(standup)).toBe('Standup');
    expect(standup.style.getPropertyValue('--_day')).toBe('2');
    const bar = s.element.querySelector('.mx-scheduler__bars .mx-scheduler__appointment') as HTMLElement;
    expect(textOf(bar)).toBe('Trip');
    expect(bar.style.gridColumn).toBe('2 / span 2');
    expect(s.visibleRange).toEqual({ start: at(26, 0), end: at(2 + 31, 0) });
  });

  it('follows a reactive array: a moved appointment keeps its box', async () => {
    const list = reactive([{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) }]) as Meeting[];
    const s = make({ appointments: list });
    await tick();
    const box = boxes(s)[0];
    list[0].startDate = at(29, 9);
    list[0].endDate = at(29, 10);
    await tick();
    expect(boxes(s)[0]).toBe(box);
    expect(box.style.getPropertyValue('--_day')).toBe('3');
    list.push({
      id: 2,
      text: 'Review',
      startDate: at(29, 9, 30),
      endDate: at(29, 11),
    });
    await tick();
    expect(boxes(s).map(textOf)).toEqual(['Standup', 'Review']);
    expect(boxes(s)[0]).toBe(box);
    expect(box.style.getPropertyValue('--_width')).toBe('0.5');
  });

  it('moves by its view, asks first, and tells what it shows', async () => {
    const asked: string[] = [];
    const told: string[] = [];
    const s = make({
      onDateChanging: (e: { to: Date; cancel: boolean }) => {
        asked.push(e.to.toDateString());
        if (e.to.getDate() === 21) e.cancel = true;
      },
      onDateChanged: (e: { range: { start: Date } }) => told.push(e.range.start.toDateString()),
    });
    await tick();
    expect(s.next()).toBe(true);
    expect(s.currentDate.getDate()).toBe(4);
    expect(s.previous()).toBe(true);
    expect(s.previous()).toBe(false);
    expect(s.currentDate.getDate()).toBe(28);
    expect(asked.length).toBe(3);
    expect(told).toEqual([at(2 + 31, 0).toDateString(), at(26, 0).toDateString()]);
    expect(s.showView('month')).toBe(true);
    await tick();
    expect(s.element.dataset.view).toBe('month');
    expect(s.element.querySelectorAll('.mx-scheduler__month-grid [role="gridcell"]').length % 7).toBe(0);
    expect(s.next()).toBe(true);
    expect(s.currentDate.getMonth()).toBe(10);
  });

  it('a view can be refused, and a view of its own settings wins over the scheduler', async () => {
    const s = make({
      startDayHour: 8,
      endDayHour: 18,
      views: ['day', { type: 'week', name: 'twoWeeks', intervalCount: 2, startDayHour: 6 }],
      currentView: 'twoWeeks',
      onViewChanging: (e: { to: string; cancel: boolean }) => (e.cancel = e.to === 'day'),
    });
    await tick();
    expect(s.resolvedView).toMatchObject({
      name: 'twoWeeks',
      intervalCount: 2,
      startDayHour: 6,
      endDayHour: 18,
    });
    expect(s.element.querySelectorAll('.mx-scheduler__date').length).toBe(14);
    expect(s.showView('day')).toBe(false);
    expect(s.currentView).toBe('twoWeeks');
  });

  it('selects cells with the keys and says so', async () => {
    const seen: (string | null)[] = [];
    const s = make({
      startDayHour: 8,
      onSelectionChanged: (e: { selection: { start: Date; end: Date } | null }) =>
        seen.push(e.selection ? `${e.selection.start.getHours()}-${e.selection.end.getHours()}` : null),
    });
    await tick();
    const cells = s.element.querySelector('.mx-scheduler__cells') as HTMLElement;
    const key = (k: string, shift = false) =>
      cells.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: k,
          shiftKey: shift,
          bubbles: true,
        }),
      );
    expect(s.selectCells({ start: at(28, 9), end: at(28, 10), allDay: false })).toBe(true);
    await tick();
    key('ArrowDown', true);
    key('ArrowDown', true);
    await tick();
    expect(s.selectedCells).toEqual({
      start: at(28, 9),
      end: at(28, 11),
      allDay: false,
    });
    expect(s.element.querySelectorAll('[aria-selected="true"]').length).toBe(4);
    key('Escape');
    await tick();
    expect(s.selectedCells).toBeNull();
    expect(seen).toEqual(['9-10', '9-11', null]);
  });

  it('a month day that is full shows "+N more", and its list', async () => {
    const day = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      text: `M${i + 1}`,
      startDate: at(28, 8 + i),
      endDate: at(28, 9 + i),
    }));
    let opened: number | null = null;
    const s = make({
      appointments: day,
      currentView: 'month',
      maxAppointmentsPerCell: 2,
      onMoreOpening: (e: { appointments: unknown[] }) => (opened = e.appointments.length),
    });
    await tick();
    const more = [...s.element.querySelectorAll<HTMLButtonElement>('.mx-scheduler__more')].find((b) => !b.hidden)!;
    expect(more.textContent).toBe('+4 more');
    expect(boxes(s).length).toBe(2);
    more.click();
    await tick();
    expect(opened).toBe(6);
    expect([...document.querySelectorAll('.mx-scheduler__more-item .mx-scheduler__more-text')].map((t) => t.textContent)).toEqual([
      'M1',
      'M2',
      'M3',
      'M4',
      'M5',
      'M6',
    ]);
  });

  it('finds appointments, and reads other field names', async () => {
    const s = make({
      fields: { key: 'code', start: 'from', end: 'to', text: 'title' },
      appointments: [
        {
          code: 'a',
          title: 'Call',
          from: '2026-10-28T09:00',
          to: '2026-10-28T10:00',
        },
      ],
    });
    await tick();
    expect(textOf(boxes(s)[0])).toBe('Call');
    expect(s.findAppointment('a')).toMatchObject({ title: 'Call' });
    expect(s.appointmentsIn(at(28, 9, 30), at(28, 9, 45)).length).toBe(1);
  });

  it('asks a data source for the days shown only', async () => {
    const rows: Meeting[] = [
      { id: 1, text: 'In', startDate: at(28, 9), endDate: at(28, 10) },
      { id: 2, text: 'Out', startDate: at(10, 9), endDate: at(10, 10) },
    ];
    const source = new data.DataSource<Meeting, number>({
      adapter: new data.ArrayAdapter<Meeting, number>({
        data: rows,
        key: 'id',
      }),
      loadMode: 'page',
    });
    const s = make({ dataSource: source });
    for (let i = 0; i < 6; i++) await tick();
    expect(source.rows.map((r) => r.text)).toEqual(['In']);
    expect(boxes(s).map(textOf)).toEqual(['In']);
    source.dispose();
  });

  it('writes its texts from uiLocale, its own texts winning', async () => {
    const s = make({ texts: { schedulerAllDay: 'Whole day' } });
    await tick();
    expect(s.element.querySelector('.mx-scheduler__all-day-label')?.textContent).toBe('Whole day');
    expect(s.element.getAttribute('aria-label')).toBe('Scheduler');
  });
});
