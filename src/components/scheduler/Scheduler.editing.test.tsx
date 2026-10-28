import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { Scheduler } from './Scheduler';

interface Meeting {
  id?: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  allowDrag?: boolean;
  allowDelete?: boolean;
}

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute);
const tick = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve();
};
const made: Scheduler<Meeting>[] = [];

function make(props: Record<string, unknown> = {}) {
  const scheduler = new Scheduler<Meeting>({ currentDate: at(28, 0), firstDayOfWeek: 1, locale: 'en-GB', ...props });
  made.push(scheduler);
  return mount(scheduler);
}

const boxes = (s: Scheduler<Meeting>) => [...s.element.querySelectorAll<HTMLElement>('.mx-scheduler__appointment')].filter((b) => !b.hidden);
const textOf = (el: Element) => el.querySelector('.mx-scheduler__appointment-text')?.textContent;
const key = (el: Element, k: string, shift = false) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey: shift, bubbles: true, cancelable: true }));

afterEach(async () => {
  for (const s of made.splice(0)) await s.dispose();
});

describe('Scheduler editing', () => {
  it('adds, changes and deletes in the array, asking first', async () => {
    const list = reactive([{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) }]) as Meeting[];
    const asked: string[] = [];
    const told: string[] = [];
    const s = make({
      appointments: list,
      onAppointmentAdding: (e: { appointment: Partial<Meeting> }) => {
        asked.push('add');
        e.appointment.id = 9;
      },
      onAppointmentAdded: () => told.push('added'),
      onAppointmentUpdating: () => asked.push('update'),
      onAppointmentUpdated: () => told.push('updated'),
      onAppointmentDeleting: () => asked.push('delete'),
      onAppointmentDeleted: () => told.push('deleted'),
    });
    await tick();
    const added = await s.addAppointment({ text: 'Review', startDate: at(29, 14), endDate: at(29, 15) });
    expect(added?.id).toBe(9);
    expect(list.length).toBe(2);
    expect(await s.updateAppointment(list[0], { text: 'Daily' })).toBe(true);
    expect(list[0].text).toBe('Daily');
    expect(await s.deleteAppointment(list[1])).toBe(true);
    await tick();
    expect(list.map((m) => m.text)).toEqual(['Daily']);
    expect(boxes(s).map(textOf)).toEqual(['Daily']);
    expect(asked).toEqual(['add', 'update', 'delete']);
    expect(told).toEqual(['added', 'updated', 'deleted']);
  });

  it('an event can refuse, or make it wait for a promise', async () => {
    const list = reactive([{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) }]) as Meeting[];
    let answer: (ok: boolean) => void = () => {};
    const s = make({
      appointments: list,
      onAppointmentDeleting: (e: { cancel: boolean }) => (e.cancel = true),
      onAppointmentUpdating: (e: { promise?: Promise<boolean> }) => (e.promise = new Promise((done) => (answer = done))),
    });
    await tick();
    expect(await s.deleteAppointment(list[0])).toBe(false);
    expect(list.length).toBe(1);
    const changing = s.updateAppointment(list[0], { text: 'Later' });
    await tick();
    expect(list[0].text).toBe('Standup');
    answer(true);
    expect(await changing).toBe(true);
    expect(list[0].text).toBe('Later');
    const refused = s.updateAppointment(list[0], { text: 'No' });
    await tick();
    answer(false);
    expect(await refused).toBe(false);
    expect(list[0].text).toBe('Later');
  });

  it('writes through the data source, whose rows follow', async () => {
    const rows: Meeting[] = [{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) }];
    const source = new data.DataSource<Meeting, number>({ adapter: new data.ArrayAdapter<Meeting, number>({ data: rows, key: 'id' }), loadMode: 'all' });
    const s = make({ dataSource: source, remoteFiltering: false });
    for (let i = 0; i < 4; i++) await tick();
    await s.addAppointment({ id: 2, text: 'Review', startDate: at(29, 14), endDate: at(29, 15) });
    await s.updateAppointment(source.rows[0], { text: 'Daily' });
    for (let i = 0; i < 4; i++) await tick();
    expect(source.rows.map((r) => r.text).sort()).toEqual(['Daily', 'Review']);
    expect(boxes(s).map(textOf).sort()).toEqual(['Daily', 'Review']);
    await s.deleteAppointment(source.rows.find((r) => r.text === 'Review')!);
    for (let i = 0; i < 4; i++) await tick();
    expect(boxes(s).map(textOf)).toEqual(['Daily']);
    source.dispose();
  });

  it('moves by the keys: the box goes, Enter saves, Escape takes it back', async () => {
    const list = reactive([{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) }]) as Meeting[];
    const drops: string[] = [];
    const s = make({
      appointments: list,
      onMoveEnd: (e: { start: Date; byKeys: boolean }) => drops.push(`${e.start.getDate()} ${e.start.getHours()}:${e.start.getMinutes()} ${e.byKeys}`),
    });
    await tick();
    const box = boxes(s)[0];
    key(box, 'ArrowDown');
    key(box, 'ArrowRight');
    await tick();
    expect(box.dataset.draft).toBe('true');
    expect(box.style.getPropertyValue('--_day')).toBe('3');
    key(box, 'Enter');
    await tick();
    expect(drops).toEqual(['29 9:30 true']);
    expect(list[0].startDate).toEqual(at(29, 9, 30));
    expect(list[0].endDate).toEqual(at(29, 10, 30));
    expect(boxes(s)[0]).toBe(box);
    expect(box.dataset.draft).toBeUndefined();
    key(box, 'ArrowDown', true);
    await tick();
    key(box, 'Escape');
    await tick();
    expect(list[0].endDate).toEqual(at(29, 10, 30));
    expect(box.style.getPropertyValue('--_day')).toBe('3');
  });

  it('Shift and the arrows resize; an event can keep it from going somewhere', async () => {
    const list = reactive([{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) }]) as Meeting[];
    const s = make({ appointments: list, onResizing: (e: { end: Date; cancel: boolean }) => (e.cancel = e.end.getHours() >= 11) });
    await tick();
    const box = boxes(s)[0];
    key(box, 'ArrowDown', true);
    await tick();
    expect(box.dataset.invalid).toBeUndefined();
    key(box, 'ArrowDown', true);
    await tick();
    expect(box.dataset.invalid).toBe('true');
    key(box, 'Enter');
    await tick();
    expect(list[0].endDate).toEqual(at(28, 10));
  });

  it("who may change what: editing, and the appointment's own fields winning", async () => {
    const list = reactive([
      { id: 1, text: 'Fixed', startDate: at(28, 9), endDate: at(28, 10), allowDrag: false },
      { id: 2, text: 'Free', startDate: at(28, 12), endDate: at(28, 13) },
    ]) as Meeting[];
    const s = make({ appointments: list, editing: { allowDeleting: false, confirmDelete: false } });
    await tick();
    const [fixed, free] = boxes(s);
    expect(fixed.dataset.draggable).toBeUndefined();
    expect(free.dataset.draggable).toBe('true');
    key(free, 'Delete');
    await tick();
    expect(list.length).toBe(2);
    s.editing = false;
    await tick();
    expect(free.dataset.draggable).toBeUndefined();
    expect(free.querySelectorAll('.mx-scheduler__resize:not([hidden])').length).toBe(0);
  });

  it('Delete on an appointment deletes it (asking first is a setting)', async () => {
    const list = reactive([{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10) }]) as Meeting[];
    const s = make({ appointments: list, editing: { confirmDelete: false } });
    await tick();
    key(boxes(s)[0], 'Delete');
    await tick();
    expect(list.length).toBe(0);
    expect(s.element.querySelector('.mx-scheduler__live')?.textContent).toBe('Standup deleted');
  });
});
