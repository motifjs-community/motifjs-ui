import { reactive } from '@motifx/core';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { windowStack } from '../../core/window-stack';
import { Scheduler } from './Scheduler';

interface Job {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
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
  { id: 1, text: 'Atlas', color: '#1565c0' },
  { id: 2, text: 'Bosphorus', color: '#2e7d32' },
];

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
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
});

function make(props: Record<string, unknown> = {}) {
  const scheduler = new Scheduler<Job>({
    currentDate: at(28, 0),
    firstDayOfWeek: 1,
    locale: 'en-GB',
    resources: [{ field: 'roomId', label: 'Room', items: rooms }],
    groups: ['roomId'],
    startDayHour: 8,
    endDayHour: 18,
    cellDuration: 60,
    ...props,
  });
  made.push(scheduler);
  return mount(scheduler);
}

const key = (el: Element, k: string, more: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...more }));
const rowsOf = (s: Scheduler<Job>) => [...s.element.querySelectorAll<HTMLElement>('.mx-scheduler__line')];
const boxIn = (row: HTMLElement) => [...row.querySelectorAll<HTMLElement>('.mx-scheduler__appointment')].filter((b) => !b.hidden);

describe('Scheduler timeline', () => {
  it('a row per group with its name, its cells along the week, its appointments on their lanes', async () => {
    const s = make({
      views: ['timelineWeek'],
      appointments: [
        { id: 1, text: 'Install', startDate: at(26, 9), endDate: at(26, 11), roomId: 1 },
        { id: 2, text: 'Repair', startDate: at(26, 10), endDate: at(26, 12), roomId: 1 },
        { id: 3, text: 'Visit', startDate: at(28, 14), endDate: at(28, 15), roomId: 2 },
      ],
    });
    await settle();
    expect(s.element.dataset.view).toBe('timelineWeek');
    const rows = rowsOf(s);
    expect(rows.map((r) => r.querySelector('.mx-scheduler__resource')?.textContent)).toEqual(['Atlas', 'Bosphorus']);
    expect(rows[0].querySelectorAll('[role="gridcell"][data-cell]').length).toBe(70);
    const [install, repair] = boxIn(rows[0]);
    expect([install.style.getPropertyValue('--_from'), install.style.getPropertyValue('--_lane')]).toEqual(['1', '0']);
    expect([repair.style.getPropertyValue('--_from'), repair.style.getPropertyValue('--_lane')]).toEqual(['2', '1']);
    expect(boxIn(rows[1])[0].style.getPropertyValue('--_from')).toBe(String(2 * 10 + 6));
    const label = rows[1].querySelector('[data-cell="9:6"]')!.getAttribute('aria-label');
    expect(label).toMatch(/^Bosphorus, Wednesday,? 28 October 2026, 14:00/);
  });

  it('the cells’ keys: along the time and to the row below; past the last cell the view moves on', async () => {
    const s = make({ views: ['timelineDay'] });
    await settle();
    const first = s.element.querySelector<HTMLElement>('[data-cell="0:0"]')!;
    first.focus();
    key(first, 'ArrowRight');
    await settle();
    expect(document.activeElement?.getAttribute('data-cell')).toBe('0:1');
    key(document.activeElement!, 'ArrowDown');
    await settle();
    expect(document.activeElement?.getAttribute('data-cell')).toBe('1:1');
    key(document.activeElement!, 'End');
    await settle();
    expect(document.activeElement?.getAttribute('data-cell')).toBe('1:9');
    key(document.activeElement!, 'ArrowRight');
    await settle();
    expect(s.currentDate.getDate()).toBe(29);
    expect(document.activeElement?.getAttribute('data-cell')).toBe('1:0');
  });

  it('an appointment’s keys: Down to the next row (its room changes), Right a snap step on; Enter saves', async () => {
    const list = reactive([{ id: 1, text: 'Install', startDate: at(28, 9), endDate: at(28, 10), roomId: 1 }]) as Job[];
    const s = make({ views: ['timelineDay'], appointments: list });
    await settle();
    const box = boxIn(rowsOf(s)[0])[0];
    box.focus();
    key(box, 'ArrowDown');
    await settle();
    key(rowsOf(s)[1].querySelector('.mx-scheduler__appointment')!, 'ArrowRight');
    await settle();
    key(rowsOf(s)[1].querySelector('.mx-scheduler__appointment')!, 'Enter');
    await settle();
    expect([list[0].roomId, list[0].startDate.getHours(), list[0].endDate.getHours()]).toEqual([2, 10, 11]);
    expect(boxIn(rowsOf(s)[0]).length).toBe(0);
    expect(boxIn(rowsOf(s)[1]).length).toBe(1);
  });

  it('a view’s own template wins over the scheduler’s; null there turns it off', async () => {
    const s = make({
      views: [{ type: 'timelineDay', resourceHeaderTemplate: null }, { type: 'timelineWeek', name: 'week' }],
      currentView: 'week',
      resourceHeaderTemplate: (c: { text: string }) => mountText(`[${c.text}]`),
    });
    await settle();
    expect(rowsOf(s)[0].querySelector('.mx-scheduler__resource')?.textContent).toBe('[Atlas]');
    s.showView('timelineDay');
    await settle();
    expect(rowsOf(s)[0].querySelector('.mx-scheduler__resource')?.textContent).toBe('Atlas');
  });
});

describe('Scheduler agenda', () => {
  it('lists the days with appointments, says so when there are none, and moves over its rows by the keys', async () => {
    const opened: string[] = [];
    const s = make({
      views: [{ type: 'agenda', agendaDuration: 3 }],
      groups: [],
      appointments: [
        { id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 9, 15) },
        { id: 2, text: 'Review', startDate: at(30, 14), endDate: at(30, 15) },
      ],
      onAppointmentDblClick: (e: { appointment: Job; cancel: boolean }) => {
        opened.push(e.appointment.text);
        e.cancel = true;
      },
    });
    await settle();
    const days = [...s.element.querySelectorAll('.mx-scheduler__agenda-group')].map((g) => g.getAttribute('aria-label'));
    expect(days.map((d) => d?.replace(',', ''))).toEqual(['Wednesday 28 October 2026', 'Friday 30 October 2026']);
    const rows = [...s.element.querySelectorAll<HTMLElement>('[role="option"]')];
    expect(rows.map((r) => r.textContent)).toEqual(['09:00–09:15Standup', '14:00–15:00Review']);
    rows[0].focus();
    key(rows[0], 'ArrowDown');
    await settle();
    expect(document.activeElement).toBe(rows[1]);
    expect(rows[1].getAttribute('aria-selected')).toBe('true');
    key(rows[1], 'Enter');
    expect(opened).toEqual(['Review']);
    s.next();
    await settle();
    expect(s.element.querySelector<HTMLElement>('.mx-scheduler__agenda-empty')?.textContent).toBe('No appointments');
  });

  it('an agenda row template draws the row’s content; the row stays an option', async () => {
    const s = make({
      views: ['agenda'],
      groups: [],
      appointments: [{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 9, 15) }],
      agendaRowTemplate: (c: { text: string; time: string }) => mountText(`${c.time} · ${c.text}`),
    });
    await settle();
    const row = s.element.querySelector<HTMLElement>('[role="option"]')!;
    expect(row.textContent).toBe('09:00–09:15 · Standup');
    expect(row.getAttribute('role')).toBe('option');
  });
});

/** A component that writes a text, for a template. */
function mountText(text: string) {
  return <span>{text}</span>;
}
