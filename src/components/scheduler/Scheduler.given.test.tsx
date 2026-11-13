import { reactive, type ComponentBase } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { whenMeasured } from '../../core/measure';
import { windowStack } from '../../core/window-stack';
import type { AppointmentTemplateContext } from './appointment-template-context';
import { Scheduler } from './Scheduler';
import type { TooltipTemplateContext } from './tooltip-template-context';

interface Meeting {
  id?: number;
  text: string;
  startDate: Date;
  endDate: Date;
  roomId?: number;
  recurrenceRule?: string;
  recurrenceException?: string;
  recurrenceId?: number;
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
const made: Scheduler<Meeting>[] = [];
const sources: data.DataSource<Meeting, number>[] = [];

function make(props: Record<string, unknown> = {}) {
  const scheduler = new Scheduler<Meeting>({ currentDate: at(28, 0), firstDayOfWeek: 1, locale: 'en-GB', editing: { confirmDelete: false }, ...props });
  made.push(scheduler);
  return mount(scheduler);
}

const boxes = (s: Scheduler<Meeting>) => [...s.element.querySelectorAll<HTMLElement>('.mx-scheduler__appointment')].filter((b) => !b.hidden);
const textOf = (el: Element) => el.querySelector('.mx-scheduler__appointment-text')?.textContent;
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const form = () => document.querySelector<HTMLElement>('.mx-scheduler__form')!;
const button = (text: string) => [...form().querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent === text)!;

/** The developer's list, as they choose to give it. */
const given = (kind: 'plain' | 'reactive', items: Meeting[]): Meeting[] => (kind === 'plain' ? items : (reactive(items) as Meeting[]));

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

for (const kind of ['plain', 'reactive'] as const) {
  describe(`Scheduler with ${kind} appointments`, () => {
    it('hands back the very objects: shown, content ready, a click, a template, the tooltip', async () => {
      const list = given(kind, [
        { id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) },
        { text: 'No key', startDate: at(29, 9), endDate: at(29, 10) },
      ]);
      const ready: unknown[][] = [];
      const clicked: unknown[] = [];
      const templated: AppointmentTemplateContext<Meeting>[] = [];
      let tip: TooltipTemplateContext<Meeting> | null = null;
      const s = make({
        appointments: list,
        onContentReady: (e: { appointments: readonly Meeting[] }) => ready.push([...e.appointments]),
        onAppointmentClick: (e: { appointment: Meeting }) => clicked.push(e.appointment),
        appointmentTemplate: (ctx: AppointmentTemplateContext<Meeting>) => {
          templated.push(ctx);
          return (<b class="own">{() => ctx.appointment.text}</b>) as ComponentBase;
        },
        appointmentTooltipTemplate: (ctx: TooltipTemplateContext<Meeting>) => {
          tip = ctx;
          return (<i>{() => ctx.text}</i>) as ComponentBase;
        },
      });
      await settle();
      expect(s.shownAppointments[0]).toBe(list[0]);
      expect(s.shownAppointments[1]).toBe(list[1]);
      expect(ready.at(-1)?.[0]).toBe(list[0]);
      expect(templated.map((c) => c.appointment)).toEqual([list[0], list[1]]);
      expect(templated[0].appointment).toBe(list[0]);
      const [, keyless] = boxes(s);
      keyless.click();
      await settle();
      expect(clicked).toEqual([list[1]]);
      expect(clicked[0]).toBe(list[1]);
      expect(tip!.appointment).toBe(list[1]);
      // One id for an appointment without a key: its own box is the open one.
      expect(keyless.dataset.open).toBe('true');
      expect(s.findAppointment(1)).toBe(list[0]);
      const values = { id: 3, text: 'Lunch', startDate: at(30, 12), endDate: at(30, 13) };
      const added: unknown[] = [];
      s.onAppointmentAdded((e) => added.push(e.appointment));
      expect(await s.addAppointment(values)).toBe(values);
      expect(added[0]).toBe(values);
      expect(list.includes(values)).toBe(true);
    });

    it('a change in place shows after refresh(), and not before', async () => {
      const list = given(kind, [{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) }]);
      const s = make({
        appointments: list,
        appointmentTemplate: (ctx: AppointmentTemplateContext<Meeting>) =>
          (
            <b>
              <span class="kit">{() => ctx.text}</span>
              <span class="own">{() => ctx.appointment.text}</span>
            </b>
          ) as ComponentBase,
      });
      await settle();
      const own = () => `${s.element.querySelector('.kit')?.textContent}|${s.element.querySelector('.own')?.textContent}`;
      expect(own()).toBe('Standup|Standup');
      list[0].text = 'Daily';
      await settle();
      // What the scheduler writes waits for the refresh (a reactive object read in a template of one's own is followed by that template).
      expect(boxes(s)[0].querySelector('.kit')?.textContent).toBe('Standup');
      if (kind === 'plain') expect(own()).toBe('Standup|Standup');
      s.refreshAppointment(list[0]);
      await settle();
      expect(own()).toBe('Daily|Daily');
      list[0].text = 'Weekly';
      list.push({ id: 2, text: 'Review', startDate: at(29, 9), endDate: at(29, 10) });
      await settle();
      expect(boxes(s).length).toBe(1);
      s.refresh();
      await settle();
      expect(boxes(s).length).toBe(2);
      expect(own()).toBe('Weekly|Weekly');
      expect(s.shownAppointments[1]).toBe(list[1]);
    });

    it('Delete, the keys moving it, and the form all work on the object itself', async () => {
      const list = given(kind, [
        { id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) },
        { id: 2, text: 'Review', startDate: at(28, 12), endDate: at(28, 13) },
      ]);
      const first = list[0];
      const moved: unknown[] = [];
      const updated: unknown[] = [];
      const deleted: unknown[] = [];
      const opened: unknown[] = [];
      const s = make({
        appointments: list,
        onMoveEnd: (e: { appointment: Meeting }) => moved.push(e.appointment),
        onAppointmentUpdated: (e: { appointment: Meeting }) => updated.push(e.appointment),
        onAppointmentDeleted: (e: { appointment: Meeting }) => deleted.push(e.appointment),
        onFormOpening: (e: { appointment: Meeting | null }) => opened.push(e.appointment),
      });
      await settle();
      const box = boxes(s)[0];
      key(box, 'ArrowRight');
      await tick();
      key(box, 'Enter');
      await settle();
      expect(moved[0]).toBe(first);
      expect(updated[0]).toBe(first);
      expect(list[0]).toBe(first);
      expect(first.startDate).toEqual(at(29, 9));
      expect(box.style.getPropertyValue('--_column')).toBe('3');
      box.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      await settle();
      expect(opened[0]).toBe(first);
      const title = form().querySelector<HTMLInputElement>('.mx-text-box input')!;
      title.value = 'Daily';
      title.dispatchEvent(new InputEvent('input', { bubbles: true }));
      button('Save').click();
      await settle();
      // The form closes with the window's next frame; what it says is written then.
      await whenMeasured(s);
      await settle();
      expect(list[0]).toBe(first);
      expect(first.text).toBe('Daily');
      expect(updated[1]).toBe(first);
      expect(boxes(s).map(textOf)).toEqual(['Review', 'Daily']);
      key(boxes(s).find((b) => textOf(b) === 'Review')!, 'Delete');
      await settle();
      expect(deleted.length).toBe(1);
      expect(list.map((m) => m.text)).toEqual(['Daily']);
      expect(boxes(s).map(textOf)).toEqual(['Daily']);
    });

    it('a series: its occurrence is edited apart, the series being the object given', async () => {
      const list = given(kind, [{ id: 1, text: 'Standup', startDate: at(26, 9), endDate: at(26, 10), recurrenceRule: 'FREQ=DAILY;COUNT=5' }]);
      const series = list[0];
      const asked: unknown[] = [];
      const s = make({ appointments: list, seriesEdit: 'occurrence', onAppointmentUpdating: (e: { series: Meeting | null }) => asked.push(e.series) });
      await settle();
      const occurrence = s.shownAppointments[2];
      expect(s.seriesOf(occurrence)).toBe(series);
      expect(await s.updateAppointment(occurrence, { text: 'Moved' })).toBe(true);
      await settle();
      expect(asked[0]).toBe(series);
      expect(list[0]).toBe(series);
      expect(String(series.recurrenceException)).not.toBe('');
      expect(list.length).toBe(2);
      expect(list[1].recurrenceId).toBe(1);
      expect(boxes(s).map(textOf)).toEqual(['Standup', 'Standup', 'Moved', 'Standup', 'Standup']);
      expect(await s.deleteAppointment(s.shownAppointments[0], 'series')).toBe(true);
      await settle();
      expect(list.length).toBe(0);
    });
  });
}

describe('Scheduler props as given', () => {
  it('keeps the day the user moved to across a reState, and takes a new day of yours', async () => {
    const state = reactive({ date: at(26, 0) });
    const plain = { date: at(26, 0) };
    const bound = make({ currentDate: () => state.date, currentView: 'day' }) as unknown as Scheduler<Meeting>;
    const given = make({ currentDate: () => plain.date, currentView: 'day' }) as unknown as Scheduler<Meeting>;
    await settle();
    bound.next();
    given.next();
    await settle();
    expect([bound.currentDate.getDate(), given.currentDate.getDate()]).toEqual([27, 27]);
    bound.reState();
    given.reState();
    await settle();
    expect([bound.currentDate.getDate(), given.currentDate.getDate()]).toEqual([27, 27]);
    plain.date = at(20, 0);
    given.reState();
    await settle();
    expect(given.currentDate.getDate()).toBe(20);
    state.date = at(21, 0);
    await settle();
    expect(bound.currentDate.getDate()).toBe(21);
  });
});

describe('Scheduler with a data source', () => {
  it('hands back its rows, deletes through it, and reads a row again on refresh()', async () => {
    const rows: Meeting[] = [
      { id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) },
      { id: 2, text: 'Review', startDate: at(28, 12), endDate: at(28, 13) },
    ];
    const source = new data.DataSource<Meeting, number>({ adapter: new data.ArrayAdapter<Meeting, number>({ data: rows, key: 'id' }), loadMode: 'all' });
    sources.push(source);
    const clicked: unknown[] = [];
    const s = make({ dataSource: source, remoteFiltering: false, onAppointmentClick: (e: { appointment: Meeting }) => clicked.push(e.appointment) });
    await settle();
    expect(s.shownAppointments[0]).toBe(source.rows[0]);
    boxes(s)[0].click();
    await settle();
    expect(clicked[0]).toBe(source.rows[0]);
    source.rows[0].text = 'Daily';
    await settle();
    expect(boxes(s).map(textOf)).toEqual(['Standup', 'Review']);
    s.refresh();
    await settle();
    expect(boxes(s).map(textOf)).toEqual(['Daily', 'Review']);
    key(boxes(s)[1], 'Delete');
    await settle();
    expect(source.rows.map((r) => r.text)).toEqual(['Daily']);
    expect(boxes(s).map(textOf)).toEqual(['Daily']);
    const values = { id: 3, text: 'Lunch', startDate: at(30, 12), endDate: at(30, 13) };
    expect(await s.addAppointment(values)).toBe(values);
    await settle();
    expect(source.rows.includes(values)).toBe(true);
    expect(s.shownAppointments.includes(values)).toBe(true);
  });
});

describe('Scheduler resources as given', () => {
  for (const kind of ['plain', 'reactive'] as const) {
    it(`reads ${kind} resource items as they are; a colour changed in place shows after refreshResources()`, async () => {
      const rooms = kind === 'plain' ? [{ id: 1, text: 'Atlas', color: '#1565c0' }] : reactive([{ id: 1, text: 'Atlas', color: '#1565c0' }]);
      const s = make({
        appointments: [{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10), roomId: 1 }],
        resources: [{ field: 'roomId', items: rooms }],
      });
      await settle();
      const box = boxes(s)[0];
      expect(box.style.getPropertyValue('--_color')).toBe('#1565c0');
      expect(s.resourcesOf(s.shownAppointments[0])[0].items[0].item).toBe(rooms[0]);
      rooms[0].color = '#2e7d32';
      await settle();
      expect(box.style.getPropertyValue('--_color')).toBe('#1565c0');
      s.refreshResources();
      await settle();
      expect(box.style.getPropertyValue('--_color')).toBe('#2e7d32');
    });
  }
});
