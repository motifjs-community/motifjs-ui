import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { windowStack } from '../../core/window-stack';
import { Slider } from '../slider/Slider';
import { rangeFilter } from './model/range-filter';
import { Scheduler } from './Scheduler';

interface Booking {
  id?: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  roomId?: number;
  ownerIds?: number[];
  priority?: number;
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
const made: Scheduler<Booking>[] = [];
const sources: data.DataSource<unknown, unknown>[] = [];

const rooms = [
  { id: 1, text: 'Atlas', color: '#1565c0' },
  { id: 2, text: 'Bosphorus', color: '#2e7d32' },
];
const people = [
  { id: 1, text: 'Ana', color: '#ad1457' },
  { id: 2, text: 'Ben', color: '#ef6c00' },
  { id: 3, text: 'Cem', color: '#00838f' },
];
const kinds = [
  { field: 'roomId', label: 'Room', items: rooms },
  { field: 'ownerIds', label: 'People', items: people, allowMultiple: true },
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
  for (const source of sources.splice(0)) source.dispose();
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
});

function make(props: Record<string, unknown> = {}) {
  const scheduler = new Scheduler<Booking>({ currentDate: at(28, 0), firstDayOfWeek: 1, locale: 'en-GB', resources: kinds, ...props });
  made.push(scheduler);
  return mount(scheduler);
}

const boxes = (s: Scheduler<Booking>) => [...s.element.querySelectorAll<HTMLElement>('.mx-scheduler__appointment')].filter((b) => !b.hidden);
const key = (el: Element, k: string, more: KeyboardEventInit = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...more }));
const form = () => document.querySelector<HTMLElement>('.mx-scheduler__form')!;
const button = (text: string) => [...form().querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent === text)!;
const labels = () =>
  [...form().querySelectorAll('.mx-form-layout__item')]
    .filter((i) => !i.closest('[hidden]'))
    .map((i) => {
      if (i.querySelector('.mx-recurrence-editor')) return 'Repeat';
      const legend = i.querySelector(':scope > fieldset > legend');
      if (legend) return legend.textContent;
      return i.querySelector('.mx-form-layout__item') ? '' : (i.querySelector('.mx-field__label > span')?.textContent ?? '');
    })
    .filter((t) => t);

describe('Scheduler: groups', () => {
  it('heads the groups over their columns, names each cell by its group and paints the boxes in their colours', async () => {
    const list = reactive([{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10), roomId: 2, ownerIds: [1, 3] }]) as Booking[];
    const s = make({ appointments: list, groups: ['roomId'], currentView: 'day' });
    await tick();
    const heads = [...s.element.querySelectorAll('.mx-scheduler__group-head')].map((h) => h.textContent);
    expect(heads).toEqual(['Atlas', 'Bosphorus']);
    expect(s.element.querySelector('[data-cell="1:18"]')!.getAttribute('aria-label')).toBe('Bosphorus, Wednesday, 28 October 2026, 9:00');
    expect(s.element.querySelector('[data-cell="1:0"]')!.getAttribute('data-edge')).toBe('outer');
    const [box] = boxes(s);
    expect([box.style.getPropertyValue('--_column'), box.style.getPropertyValue('--_color')]).toEqual(['1', '#2e7d32']);
    // Grouped by the people too: the room heads span its people, the box stands in both of its people.
    s.groups = ['roomId', 'ownerIds'];
    await tick();
    expect(s.element.querySelectorAll('.mx-scheduler__groups').length).toBe(2);
    expect(boxes(s).map((b) => b.style.getPropertyValue('--_column'))).toEqual(['3', '5']);
    expect(s.element.querySelector('.mx-scheduler__head')!.hasAttribute('data-by-date')).toBe(true);
  });

  it('a drag by the keys to the next group changes only that group’s value; Enter saves', async () => {
    const list = reactive([{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10), ownerIds: [1, 3] }]) as Booking[];
    const seen: (Record<string, unknown> | null)[] = [];
    const s = make({ appointments: list, groups: ['ownerIds'], currentView: 'day', onMoving: (e: { resources: Record<string, unknown> | null }) => seen.push(e.resources) });
    await tick();
    const ana = boxes(s).find((b) => b.style.getPropertyValue('--_column') === '0')!;
    key(ana, 'ArrowRight', { altKey: true, shiftKey: true });
    await tick();
    expect(seen.at(-1)).toEqual({ ownerIds: [2, 3] });
    key(ana, 'Enter');
    await settle();
    expect(list[0].ownerIds).toEqual([2, 3]);
    expect(list[0].startDate).toEqual(at(28, 9));
  });

  it('a new appointment from a cell of a group gets its resources; an appointment shows its items in the tooltip', async () => {
    const list = reactive([] as Booking[]);
    const s = make({ appointments: list, groups: ['roomId'], currentView: 'day', editing: { confirmDelete: false } });
    await tick();
    const opening = s.showAppointmentForm(null, { start: at(28, 9), end: at(28, 10), allDay: false, resources: { roomId: 2 } });
    await settle();
    expect(labels()).toEqual(['Title', 'Start', 'End', 'All day', 'Room', 'People', 'Repeat', 'Description']);
    const title = form().querySelector<HTMLInputElement>('.mx-text-box input')!;
    title.value = 'Review';
    title.dispatchEvent(new InputEvent('input', { bubbles: true }));
    button('Save').click();
    await opening;
    await settle();
    expect(list).toHaveLength(1);
    expect([list[0].roomId, list[0].ownerIds]).toEqual([2, []]);
    expect(s.resourcesOf(list[0]).map((k) => `${k.label}: ${k.items.map((i) => i.text).join()}`)).toEqual(['Room: Bosphorus']);
  });

  it('marks blocked cells and keeps what the user moves off a blocked time, off hours and other appointments when told', async () => {
    const list = reactive([
      { id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10), roomId: 1 },
      { id: 2, text: 'Review', startDate: at(28, 14), endDate: at(28, 15), roomId: 1 },
    ]) as Booking[];
    const s = make({
      appointments: list,
      groups: ['roomId'],
      currentView: 'day',
      blockedTimes: [{ start: at(28, 12), end: at(28, 13), text: 'Lunch' }],
      allowOverlap: false,
    });
    await tick();
    const cell = s.element.querySelector('[data-cell="0:24"]')!;
    expect(s.element.querySelector('[data-cell="0:24"]')!.hasAttribute('data-blocked')).toBe(true);
    expect(s.element.querySelector('[data-cell="0:24"]')!.getAttribute('aria-label')).toContain('not available: Lunch');
    expect(s.checkTime(list[0], at(28, 14, 30), at(28, 15, 30)).overlapping.map((b) => b.id)).toEqual([2]);
    expect(s.checkTime(list[0], at(28, 14, 30), at(28, 15, 30), { resources: { roomId: 2 } }).free).toBe(true);
    // Down by the keys into the lunch: the box shows it may not go there; Enter leaves it.
    const box = boxes(s).find((b) => b.textContent?.includes('Standup'))!;
    for (let i = 0; i < 6; i++) key(box, 'ArrowDown');
    await tick();
    expect(box.dataset.invalid).toBe('true');
    expect(box.querySelector('.mx-scheduler__drop-mark')!.hasAttribute('hidden')).toBe(false);
    key(box, 'Enter');
    await settle();
    expect(list[0].startDate).toEqual(at(28, 9));
    // The rule of its own lets it overlap.
    s.allowOverlap = (check: { blocked: unknown[] }) => check.blocked.length > 0;
    await tick();
    expect(s.checkTime(list[0], at(28, 12, 30), at(28, 13, 30)).free).toBe(true);
  });
});

describe('Scheduler: a resource’s own switches', () => {
  it('a resource item’s own allowDrag and allowDelete win over editing; the appointment’s own wins over both', async () => {
    const locked = [{ id: 1, text: 'Atlas', allowDrag: false, allowDelete: false }, { id: 2, text: 'Bosphorus' }];
    const list = reactive([
      { id: 1, text: 'In Atlas', startDate: at(28, 9), endDate: at(28, 10), roomId: 1 },
      { id: 2, text: 'In Bosphorus', startDate: at(28, 11), endDate: at(28, 12), roomId: 2 },
      { id: 3, text: 'Own', startDate: at(28, 13), endDate: at(28, 14), roomId: 1, allowDrag: true },
    ]) as Booking[];
    const s = make({ appointments: list, resources: [{ field: 'roomId', items: locked }], editing: { confirmDelete: false } });
    await tick();
    const box = (text: string) => boxes(s).find((b) => b.textContent?.includes(text))!;
    expect([box('In Atlas').dataset.draggable, box('In Bosphorus').dataset.draggable, box('Own').dataset.draggable]).toEqual([undefined, 'true', 'true']);
    key(box('In Atlas'), 'Delete');
    await settle();
    expect(list).toHaveLength(3);
  });
});

describe('Scheduler: the form', () => {
  it('editing.form: order, a group, tabs, a built-in changed, and a field shown and locked for one appointment only', async () => {
    const list = reactive([
      { id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10), roomId: 1 },
      { id: 2, text: 'Board', startDate: at(28, 11), endDate: at(28, 12), roomId: 2 },
    ]) as Booking[];
    const s = make({
      appointments: list,
      editing: {
        form: {
          columns: 1,
          items: [
            { field: 'text', label: 'Subject', rules: [{ type: 'length', min: 3 }] },
            { group: 'When', items: ['start', 'end'] },
            {
              tabs: [
                { title: 'Where', items: ['roomId', { field: 'ownerIds', visible: (f: { data: Booking }) => f.data.roomId === 2 }] },
                { title: 'Notes', items: [{ field: 'description', readOnly: (f: { isNew: boolean }) => !f.isNew }] },
              ],
            },
          ],
        },
      },
    });
    await tick();
    const opening = s.showAppointmentForm(list[0]);
    await settle();
    expect(labels()).toEqual(['Subject', 'When', 'Start', 'End', 'Room']);
    expect(form().querySelectorAll('.mx-tabs [role="tab"]').length).toBe(2);
    // The Notes page is out of the page while hidden: shown to be read, then back.
    const tabNamed = (text: string) => Array.from(form().querySelectorAll<HTMLElement>('.mx-tabs [role="tab"]')).find((el) => el.textContent === text)!;
    tabNamed('Notes').click();
    await settle();
    expect(form().querySelector('.mx-text-area textarea')!.hasAttribute('readonly')).toBe(true);
    tabNamed('Where').click();
    await settle();
    // The rule given adds to the built-in's: a two-letter subject does not save, and its field gets the focus.
    const title = form().querySelector<HTMLInputElement>('.mx-text-box input')!;
    title.value = 'St';
    title.dispatchEvent(new InputEvent('input', { bubbles: true }));
    button('Save').click();
    await settle();
    expect(form().isConnected).toBe(true);
    button('Cancel').click();
    await opening;
    await settle();
    const second = s.showAppointmentForm(list[1]);
    await settle();
    expect(labels()).toContain('People');
    button('Cancel').click();
    await second;
  });

  it('a component of your own as an editor, by a function or a template; onFormOpening still gets the items and may cancel', async () => {
    const list = reactive([{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10), priority: 2 }]) as Booking[];
    const items: (string | undefined)[][] = [];
    let cancel = true;
    const s = make({
      appointments: list,
      editing: {
        form: {
          items: [
            'text',
            { field: 'priority', label: 'Priority', editor: (p: Record<string, unknown>) => new Slider({ ...p, min: 1, max: 5 }) },
            { field: 'note', template: (f: { data: Record<string, unknown> }, place: { field: string }) => <output class="own-note">{() => `${place.field}: ${String(f.data.text)}`}</output> },
          ],
        },
      },
      onFormOpening: (e: { items: { field?: string }[]; cancel: boolean }) => {
        items.push(e.items.map((i) => i.field));
        e.cancel = cancel;
      },
    });
    await tick();
    await s.showAppointmentForm(list[0]);
    expect(items[0]).toEqual(['text', 'priority', 'note']);
    expect(document.querySelector('.mx-scheduler__form')).toBeNull();
    cancel = false;
    const opening = s.showAppointmentForm(list[0]);
    await settle();
    expect(form().querySelector('.mx-slider')).not.toBeNull();
    expect(form().querySelector('.own-note')!.textContent).toBe('note: Standup');
    button('Cancel').click();
    await opening;
  });

  it('says in the form why a time is not free, and does not save it', async () => {
    const list = reactive([
      { id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10), roomId: 1 },
      { id: 2, text: 'Review', startDate: at(28, 14), endDate: at(28, 15), roomId: 1 },
    ]) as Booking[];
    const s = make({ appointments: list, allowOverlap: false });
    await tick();
    const opening = s.showAppointmentForm(null, { start: at(28, 14, 30), end: at(28, 15), allDay: false, resources: { roomId: 1 } });
    await settle();
    const title = form().querySelector<HTMLInputElement>('.mx-text-box input')!;
    title.value = 'Clash';
    title.dispatchEvent(new InputEvent('input', { bubbles: true }));
    button('Save').click();
    await settle();
    expect(form().textContent).toContain('Not free: Review is at this time.');
    button('Cancel').click();
    await opening;
    expect(list).toHaveLength(2);
  });
});

describe('Scheduler: resources from data', () => {
  it('loads a data source of resources once and follows it; grouped, asks the appointments of the resources shown', async () => {
    const roomSource = new data.DataSource<(typeof rooms)[number], number>({ adapter: new data.ArrayAdapter({ data: rooms.slice(), key: 'id' }), loadMode: 'all' });
    const asked: unknown[] = [];
    class Counting extends data.ArrayAdapter<Booking, number> {
      override load(options: data.LoadOptions = {}) {
        asked.push(options.filter);
        return super.load(options);
      }
    }
    let loads = 0;
    const counted = roomSource.load.bind(roomSource);
    roomSource.load = () => (loads++, counted());
    const source = new data.DataSource<Booking, number>({
      adapter: new Counting({ data: [{ id: 1, text: 'Standup', startDate: at(28, 9), endDate: at(28, 10), roomId: 2 }], key: 'id' }),
      loadMode: 'all',
    });
    sources.push(roomSource as data.DataSource<unknown, unknown>, source as data.DataSource<unknown, unknown>);
    const s = make({ dataSource: source, resources: [{ field: 'roomId', label: 'Room', items: roomSource }], groups: ['roomId'], currentView: 'day' });
    await settle();
    expect(loads).toBe(1);
    expect([...s.element.querySelectorAll('.mx-scheduler__group-head')].map((h) => h.textContent)).toEqual(['Atlas', 'Bosphorus']);
    expect(boxes(s).map((b) => b.style.getPropertyValue('--_column'))).toEqual(['1']);
    expect(JSON.stringify(asked.at(-1))).toContain('"field":"roomId","op":"in","value":[1,2]');
    await roomSource.setFilter({ field: 'id', op: '=', value: 2 });
    await settle();
    expect([...s.element.querySelectorAll('.mx-scheduler__group-head')].map((h) => h.textContent)).toEqual(['Bosphorus']);
    expect(JSON.stringify(asked.at(-1))).toContain('"value":[2]');
    expect(boxes(s).map((b) => b.style.getPropertyValue('--_column'))).toEqual(['0']);
  });

  it('rangeFilter keeps to the resources it is given', () => {
    const fields = { start: 'startDate', end: 'endDate', recurrenceRule: 'recurrenceRule' };
    const rows = [
      { id: 1, startDate: at(28, 9), endDate: at(28, 10), roomId: 1 },
      { id: 2, startDate: at(28, 9), endDate: at(28, 10), roomId: 2 },
      { id: 3, startDate: at(28, 9), endDate: at(28, 10), roomId: 3 },
    ];
    const filter = rangeFilter({ start: at(26, 0), end: new Date(2026, 10, 2) }, fields, { resources: { roomId: [1, 3] } });
    expect(data.queryArray(rows, { filter }).rows.map((r) => r.id)).toEqual([1, 3]);
  });
});
