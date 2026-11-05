import { Component, reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mount } from '../../../tests/helpers';
import { windowStack } from '../../core/window-stack';
import { TimeZone } from '../../parts/dates/time-zone';
import { formatRuleDate } from '../../parts/recurrence/format-rule-date';
import { RecurrenceDraft } from './model/RecurrenceDraft';
import { RecurrenceEditor } from './RecurrenceEditor';
import { Scheduler } from './Scheduler';
import type { SeriesScope } from './model/series-scope';

interface Meeting {
  id?: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  recurrenceRule?: string;
  recurrenceException?: string;
  recurrenceId?: number;
  startDateTimeZone?: string;
  endDateTimeZone?: string;
}

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute);
const tick = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve();
};
const settle = async () => {
  for (let i = 0; i < 4; i++) await tick();
};
const made: Scheduler<Meeting>[] = [];

beforeAll(() => {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
  proto.show = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.showModal = function (this: HTMLDialogElement) {
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
  const scheduler = new Scheduler<Meeting>({ currentDate: at(28, 0), firstDayOfWeek: 1, locale: 'en-GB', ...props });
  made.push(scheduler);
  return mount(scheduler);
}

const series = (): Meeting => ({ id: 1, text: 'Standup', startDate: at(5, 9), endDate: at(5, 10), recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR' });
const boxes = (s: Scheduler<Meeting>) => [...s.element.querySelectorAll<HTMLElement>('.mx-scheduler__appointment')].filter((b) => !b.hidden);
const textOf = (el: Element) => el.querySelector('.mx-scheduler__appointment-text')?.textContent;
const dayOf = (el: HTMLElement) => el.style.getPropertyValue('--_column');
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
/** Answers the series question with `scope` and records what was asked. */
const answer = (scope: SeriesScope, asked: string[] = []) => ({
  onSeriesAsking: (e: { action: string; scope: SeriesScope | null; scopes: SeriesScope[] }) => {
    asked.push(`${e.action}:${e.scopes.join(',')}`);
    e.scope = scope;
  },
});

describe('Scheduler: series', () => {
  it('shows the occurrences of a series with their marks; says how it repeats', async () => {
    const s = make({ appointments: reactive([series()]) });
    await tick();
    const shown = boxes(s);
    expect(shown.map(dayOf)).toEqual(['0', '2', '4']);
    expect(shown.every((b) => b.dataset.series === 'true')).toBe(true);
    expect(shown[0].querySelector('.mx-scheduler__mark')?.getAttribute('data-mark')).toBe('series');
    expect(shown[0].textContent).toContain('Repeats: Every week on Monday, Wednesday and Friday');
    const occurrence = s.shownAppointments[0];
    expect(s.isOccurrence(occurrence)).toBe(true);
    expect(s.seriesOf(occurrence)?.id).toBe(1);
    expect(s.occurrencesOf(s.seriesOf(occurrence)!, at(1, 0), at(31, 0)).length).toBe(12);
    s.recurrenceMarks = false;
    await tick();
    expect(shown[0].querySelector<HTMLElement>('.mx-scheduler__mark')!.hidden).toBe(true);
  });

  it('this occurrence, by the keys: it is asked, the occurrence goes apart and its time is left out of the series', async () => {
    const list = reactive([series()]) as Meeting[];
    const asked: string[] = [];
    const s = make({ appointments: list, ...answer('occurrence', asked) });
    await tick();
    const wednesday = boxes(s)[1];
    key(wednesday, 'ArrowDown');
    key(wednesday, 'Enter');
    await settle();
    expect(asked).toEqual(['update:occurrence,following,series']);
    expect(list).toHaveLength(2);
    expect(list[0].recurrenceException).toBe(formatRuleDate({ time: at(28, 9).getTime(), utc: true, dateOnly: false }));
    expect(list[1]).toMatchObject({ recurrenceId: 1, text: 'Standup', startDate: at(28, 9, 30), endDate: at(28, 10, 30) });
    expect(list[1].recurrenceRule).toBeUndefined();
    const shown = boxes(s).sort((a, b) => Number(dayOf(a)) - Number(dayOf(b)));
    expect(shown.map((b) => [dayOf(b), b.dataset.series ?? '', b.dataset.exception ?? ''])).toEqual([
      ['0', 'true', ''],
      ['2', '', 'true'],
      ['4', 'true', ''],
    ]);
  });

  it('this and following, and the whole series, programmatically', async () => {
    const list = reactive([series()]) as Meeting[];
    const s = make({ appointments: list });
    await tick();
    expect(await s.updateAppointment(s.shownAppointments[1], { text: 'Planning' }, 'following')).toBe(true);
    await tick();
    expect(list).toHaveLength(2);
    expect(list[0].recurrenceRule).toMatch(/^FREQ=WEEKLY;UNTIL=\d{8}T\d{6}Z;BYDAY=MO,WE,FR$/);
    expect(list[1]).toMatchObject({ text: 'Planning', recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR', startDate: at(28, 9) });
    expect(boxes(s).map(textOf)).toEqual(['Standup', 'Planning', 'Planning']);
    const friday = s.shownAppointments.find((a) => a.startDate.getDate() === 30)!;
    expect(await s.updateAppointment(friday, { startDate: at(30, 11), endDate: at(30, 12) }, 'series')).toBe(true);
    await tick();
    expect(list[1]).toMatchObject({ startDate: at(28, 11), endDate: at(28, 12) });
  });

  it('deleting asks the same question; a delete of the whole series takes its changed occurrences too', async () => {
    const list = reactive([series(), { id: 2, text: 'Moved', startDate: at(27, 15), endDate: at(27, 16), recurrenceId: 1 }]) as Meeting[];
    let scope: SeriesScope = 'occurrence';
    const asked: string[] = [];
    const s = make({ appointments: list, editing: { confirmDelete: false }, onSeriesAsking: (e: { action: string; scope: SeriesScope | null }) => {
      asked.push(e.action);
      e.scope = scope;
    } });
    await tick();
    key(boxes(s).find((b) => dayOf(b) === '0')!, 'Delete');
    await settle();
    expect(asked).toEqual(['delete']);
    expect(list[0].recurrenceException).toMatch(/^\d{8}T\d{6}Z$/);
    expect(boxes(s).map(dayOf).sort()).toEqual(['1', '2', '4']);
    scope = 'series';
    key(boxes(s).find((b) => dayOf(b) === '2')!, 'Delete');
    await settle();
    expect(list).toEqual([]);
  });

  it('seriesEdit answers without asking; an event can cancel the question', async () => {
    const list = reactive([series()]) as Meeting[];
    const s = make({ appointments: list, seriesEdit: 'series' });
    await tick();
    const wednesday = boxes(s)[1];
    key(wednesday, 'ArrowDown');
    key(wednesday, 'Enter');
    await settle();
    expect(list).toHaveLength(1);
    expect(list[0].startDate).toEqual(at(5, 9, 30));
    s.seriesEdit = 'ask';
    s.onSeriesAsking((e) => (e.cancel = true));
    key(boxes(s)[1], 'ArrowDown');
    key(boxes(s)[1], 'Enter');
    await settle();
    expect(list[0].startDate).toEqual(at(5, 9, 30));
  });

  it('the question: the choices as radio buttons, OK answers, Cancel drops the change', async () => {
    const list = reactive([series()]) as Meeting[];
    const answers: (SeriesScope | null)[] = [];
    const s = make({ appointments: list, onSeriesAnswered: (e: { scope: SeriesScope | null }) => answers.push(e.scope) });
    await tick();
    const occurrence = s.shownAppointments[1];
    const answered = s.askSeries(occurrence, 'delete');
    await settle();
    const dialog = document.querySelector('.mx-scheduler__question')!;
    expect(dialog.textContent).toContain('"Standup" repeats. Which ones are deleted?');
    const radios = [...dialog.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    expect(radios.length).toBe(3);
    expect(radios[0].checked).toBe(true);
    radios[1].click();
    await tick();
    [...dialog.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent === 'Delete')!.click();
    expect(await answered).toBe('following');
    const again = s.askSeries(occurrence);
    await settle();
    [...document.querySelectorAll<HTMLButtonElement>('.mx-scheduler__question button')].find((b) => b.textContent === 'Cancel')!.click();
    expect(await again).toBeNull();
    expect(answers).toEqual(['following', null]);
  });

  it('writes the same way through a data source', async () => {
    const rows: Meeting[] = [series()];
    let next = 10;
    const adapter = new data.ArrayAdapter<Meeting, number>({ data: rows, key: 'id', createKey: () => next++ });
    const source = new data.DataSource<Meeting, number>({ adapter, loadMode: 'all' });
    const s = make({ dataSource: source, remoteFiltering: false });
    await settle();
    expect(boxes(s)).toHaveLength(3);
    await s.updateAppointment(s.shownAppointments[1], { text: 'Apart' }, 'occurrence');
    await settle();
    expect(source.rows).toHaveLength(2);
    const apart = source.rows.find((r) => r.text === 'Apart')!;
    expect(apart.recurrenceId).toBe(1);
    expect(source.rows.find((r) => r.id === 1)!.recurrenceException).toMatch(/Z$/);
    expect(boxes(s).map(textOf).sort()).toEqual(['Apart', 'Standup', 'Standup']);
    await s.updateAppointment(s.shownAppointments.find((a) => a.startDate.getDate() === 30)!, { text: 'Late' }, 'following');
    await settle();
    expect(source.rows.find((r) => r.id === 1)!.recurrenceRule).toMatch(/UNTIL=/);
    expect(source.rows.some((r) => r.text === 'Late' && r.recurrenceRule === 'FREQ=WEEKLY;BYDAY=MO,WE,FR')).toBe(true);
    await s.deleteAppointment(s.shownAppointments.find((a) => a.startDate.getDate() === 26)!, 'series');
    await settle();
    expect(source.rows.map((r) => r.text).sort()).toEqual(['Late']);
    source.dispose();
  });

  it('asks a data source for the series that began before the days shown', async () => {
    const asked: unknown[] = [];
    const rows: Meeting[] = [series()];
    const adapter = new data.ArrayAdapter<Meeting, number>({ data: rows, key: 'id' });
    const source = new data.DataSource<Meeting, number>({ adapter, loadMode: 'all' });
    source.onChanged(() => asked.push(source.filter));
    const s = make({ dataSource: source });
    await settle();
    expect(JSON.stringify(asked.at(-1))).toContain('isnotblank');
    expect(boxes(s)).toHaveLength(3);
    source.dispose();
  });
});

describe('Scheduler: time zones', () => {
  it('shows the days and hours on its zone’s clock; the form edits a time on its own zone’s', async () => {
    const moment = new Date(Date.UTC(2026, 9, 28, 14));
    const list = reactive([{ id: 1, text: 'Call', startDate: moment, endDate: new Date(moment.getTime() + 3_600_000), startDateTimeZone: 'Europe/Berlin' }]) as Meeting[];
    const opened: { start: Date; startTimeZone: unknown }[] = [];
    const s = make({
      appointments: list,
      timeZone: 'America/New_York',
      editing: { allowTimeZones: true },
      onFormOpening: (e: { data: { start: Date; startTimeZone: unknown }; cancel: boolean }) => {
        opened.push({ start: e.data.start, startTimeZone: e.data.startTimeZone });
        e.cancel = true;
      },
    });
    await tick();
    const box = boxes(s)[0];
    expect(box.style.insetBlockStart).toBe(`${(10 / 24) * 100}%`);
    expect(s.element.querySelector('.mx-scheduler__hour[data-hour-start] span')?.textContent).toBe('00');
    await s.showAppointmentForm(list[0]);
    expect(opened[0].startTimeZone).toBe('Europe/Berlin');
    expect([opened[0].start.getHours(), opened[0].start.getDate()]).toEqual([15, 28]);
    expect(TimeZone.of('Europe/Berlin').fromLocal(opened[0].start).getTime()).toBe(moment.getTime());
  });
});

describe('Scheduler: the form’s time zones', () => {
  const flight = () =>
    reactive([
      {
        id: 1,
        text: 'Flight',
        startDate: new Date(Date.UTC(2026, 9, 28, 8)),
        endDate: new Date(Date.UTC(2026, 9, 28, 17)),
        startDateTimeZone: 'Europe/Berlin',
        endDateTimeZone: 'America/New_York',
      },
    ]) as Meeting[];
  const button = (text: string) => [...document.querySelectorAll<HTMLButtonElement>('.mx-scheduler__form button')].find((b) => b.textContent === text)!;

  it('one zone picker and a box for a separate end zone, an item of the form like any other; checked when the end zone differs', async () => {
    const seen: { items: string[]; separate: unknown }[] = [];
    const s = make({
      appointments: flight(),
      timeZone: 'Europe/Berlin',
      editing: { allowTimeZones: true },
      onFormOpening: (e: { items: { field?: string }[]; data: Record<string, unknown>; cancel: boolean }) => {
        seen.push({ items: e.items.map((i) => i.field ?? ''), separate: e.data.separateEndZone });
        e.cancel = true;
      },
    });
    await tick();
    await s.showAppointmentForm(s.appointments[0]);
    expect(seen[0].items).toEqual(expect.arrayContaining(['startTimeZone', 'separateEndZone', 'endTimeZone']));
    expect(seen[0].separate).toBe(true);
  });

  it('unchecked, the end follows the start’s zone: its own zone is cleared and its time read on the start’s clock', async () => {
    const list = flight();
    const s = make({ appointments: list, timeZone: 'Europe/Berlin', editing: { allowTimeZones: true } });
    await tick();
    const opening = s.showAppointmentForm(list[0]);
    await settle();
    const form = document.querySelector('.mx-scheduler__form')!;
    const box = form.querySelector<HTMLInputElement>('.mx-scheduler__end-zone-switch input')!;
    const pickers = () => [...form.querySelectorAll('.mx-drop-down')].filter((d) => !d.closest('[hidden]') && !d.closest('.mx-recurrence-editor')).length;
    expect(box.checked).toBe(true);
    expect(pickers()).toBe(2);
    box.click();
    await settle();
    expect(pickers()).toBe(1);
    button('Save').click();
    await opening;
    await settle();
    expect(list[0].endDateTimeZone).toBe('');
    expect(list[0].startDateTimeZone).toBe('Europe/Berlin');
    // The end shown (13:00 on New York's clock) is now 13:00 on the start's (Berlin's), as when a zone is changed.
    expect(list[0].endDate).toEqual(new Date(Date.UTC(2026, 9, 28, 12)));
  });
});

describe('RecurrenceEditor', () => {
  const context = { start: new Date(2026, 9, 28, 9), allDay: false, zone: TimeZone.of('UTC'), firstDayOfWeek: 1 };

  it('reads a rule into its choices and writes the same rule back', () => {
    const draft = new RecurrenceDraft();
    for (const rule of [
      '',
      'FREQ=DAILY',
      'FREQ=DAILY;INTERVAL=3;COUNT=5',
      'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR',
      'FREQ=MONTHLY;BYMONTHDAY=15',
      'FREQ=MONTHLY;BYMONTHDAY=-1',
      'FREQ=MONTHLY;COUNT=4;BYDAY=2TU',
      'FREQ=YEARLY;BYMONTH=11;BYDAY=-1FR',
      'FREQ=YEARLY;UNTIL=20301231T235959Z;BYMONTH=5;BYMONTHDAY=12',
    ]) {
      draft.read(rule, context);
      expect(draft.write(context), rule).toBe(rule);
    }
    draft.read('FREQ=WEEKLY', context);
    expect(draft.state.days.filter((d) => d.on).map((d) => d.day)).toEqual([3]);
    expect(draft.state.days.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 0]);
  });

  it('a click on a weekday writes the rule and says it; a rule of its own stays until a choice is changed', async () => {
    const state = reactive({ rule: 'FREQ=WEEKLY;BYDAY=MO' });
    const changes: string[] = [];
    const editor = mount(
      new RecurrenceEditor({
        value: () => state.rule,
        start: new Date(2026, 9, 26, 9),
        firstDayOfWeek: 1,
        locale: 'en-GB',
        onValueChanged: (e) => {
          changes.push(`${e.value} ${e.byUser}`);
          state.rule = e.value;
        },
      }),
    );
    await tick();
    const days = [...editor.element.querySelectorAll<HTMLElement>('.mx-recurrence-editor__day')];
    expect(days.map((d) => d.hasAttribute('data-pressed'))).toEqual([true, false, false, false, false, false, false]);
    days[2].click();
    await tick();
    expect(changes).toEqual(['FREQ=WEEKLY;BYDAY=MO,WE true']);
    expect(editor.element.querySelector('.mx-recurrence-editor__summary')?.textContent).toBe('Every week on Monday and Wednesday');
    state.rule = 'FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1';
    await tick();
    expect(changes).toHaveLength(1);
    expect(editor.summaryText).toBe('Every month, by a rule of its own');
    await editor.dispose();
  });

  it('shows the editors a rule wants when it changes, and keeps a pick of the user', async () => {
    const changes: string[] = [];
    const editor = mount(
      new RecurrenceEditor({ value: 'FREQ=MONTHLY;BYMONTHDAY=15', start: new Date(2026, 9, 26, 9), locale: 'en-GB', onValueChanged: (e) => changes.push(e.value) }),
    );
    await tick();
    const field = editor.element.querySelector<HTMLElement>('.mx-recurrence-editor__days-field')!;
    // A control that is not shown is out of the page.
    const weekdayShown = () => !!editor.element.querySelector('.mx-recurrence-editor__weekday');
    expect(field.hidden).toBe(true);
    editor.value = 'FREQ=WEEKLY;BYDAY=MO';
    await tick();
    expect(field.hidden).toBe(false);
    expect([...field.querySelectorAll('.mx-recurrence-editor__day')].filter((d) => d.hasAttribute('data-pressed'))).toHaveLength(1);
    editor.value = 'FREQ=MONTHLY;BYMONTHDAY=15';
    await tick();
    expect(field.hidden).toBe(true);
    expect(weekdayShown()).toBe(false);
    const byWeekday = editor.element.querySelectorAll<HTMLInputElement>('.mx-recurrence-editor__by input')[1];
    byWeekday.checked = true;
    byWeekday.dispatchEvent(new Event('change', { bubbles: true }));
    await tick();
    expect(changes).toEqual(['FREQ=MONTHLY;BYDAY=4MO']);
    expect(byWeekday.checked).toBe(true);
    expect(weekdayShown()).toBe(true);
    await editor.dispose();
  });

  it('"on a date" stays chosen: it comes with a date three months after the start', async () => {
    const changes: string[] = [];
    const editor = mount(
      new RecurrenceEditor({ value: 'FREQ=DAILY;COUNT=5', start: new Date(2026, 9, 26, 9), allDay: true, locale: 'en-GB', onValueChanged: (e) => changes.push(e.value) }),
    );
    await tick();
    const until = editor.element.querySelectorAll<HTMLInputElement>('.mx-recurrence-editor__end input')[2];
    until.checked = true;
    until.dispatchEvent(new Event('change', { bubbles: true }));
    await tick();
    expect(changes).toEqual(['FREQ=DAILY;UNTIL=20270126']);
    expect(until.checked).toBe(true);
    expect(editor.element.querySelector('.mx-recurrence-editor__until')).not.toBeNull();
    await editor.dispose();
  });

  it('reads a rule over plain data again on reState, and writes a rule set programmatically to x-model', async () => {
    const plain = { rule: 'FREQ=DAILY' };
    const state = reactive({ rule: '' });
    const host = mount(new Component<HTMLDivElement>('div'));
    let editor!: RecurrenceEditor;
    let bound!: RecurrenceEditor;
    host.controls.add(
      <RecurrenceEditor ref={(x: RecurrenceEditor) => (editor = x)} value={() => plain.rule} start={new Date(2026, 9, 26, 9)} locale="en-GB" />,
      <RecurrenceEditor ref={(x: RecurrenceEditor) => (bound = x)} x-model={() => state.rule} start={new Date(2026, 9, 26, 9)} locale="en-GB" />,
    );
    await tick();
    expect(editor.summaryText).toBe('Every day');
    plain.rule = 'FREQ=WEEKLY;BYDAY=MO';
    await tick();
    expect(editor.summaryText).toBe('Every day');
    host.reState();
    await tick();
    expect(editor.summaryText).toBe('Every week on Monday');
    bound.value = 'FREQ=MONTHLY;BYMONTHDAY=15';
    expect(state.rule).toBe('FREQ=MONTHLY;BYMONTHDAY=15');
    await host.dispose();
  });
});
