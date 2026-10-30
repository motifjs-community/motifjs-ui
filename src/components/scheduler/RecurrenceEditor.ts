import { Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { fillTemplate } from '../../core/fill-template';
import { follow } from '../../core/follow';
import { nextId } from '../../core/next-id';
import { pageLocale } from '../../core/page-locale';
import { uiLocale } from '../../core/ui-locale';
import type { UiStrings } from '../../core/ui-strings';
import { firstDayOfWeek as localeFirstDay } from '../../parts/dates/first-day-of-week';
import { TimeZone } from '../../parts/dates/time-zone';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import { describeRecurrence } from '../../parts/recurrence/describe-recurrence';
import { parseRecurrenceRule } from '../../parts/recurrence/parse-recurrence-rule';
import type { RecurrenceFrequency } from '../../parts/recurrence/recurrence-frequency';
import type { RecurrenceRule } from '../../parts/recurrence/recurrence-rule';
import { Button } from '../button/Button';
import { DateBox } from '../datebox/DateBox';
import { DropDown } from '../dropdown/DropDown';
import { NumberBox } from '../numberbox/NumberBox';
import type { RadioItem } from '../radiogroup/radio-item';
import { RadioGroup } from '../radiogroup/RadioGroup';
import { RecurrenceDraft, type DraftContext, type DraftState } from './model/RecurrenceDraft';
import type { RecurrenceEditorProps } from './recurrence-editor-props';
import { part, shown } from './view/draw-parts';

const OWN = ['value', 'start', 'allDay', 'timeZone', 'frequencies', 'firstDayOfWeek', 'summary', 'readOnly', 'locale', 'texts'] as const;

const FREQUENCIES: readonly ('never' | RecurrenceFrequency)[] = ['never', 'daily', 'weekly', 'monthly', 'yearly'];

const FREQUENCY_TEXTS: Record<'never' | RecurrenceFrequency, keyof UiStrings> = {
  never: 'recurrenceNever',
  daily: 'recurrenceDaily',
  weekly: 'recurrenceWeekly',
  monthly: 'recurrenceMonthly',
  yearly: 'recurrenceYearly',
};

/** The unit of "every n": one and more. */
const UNITS: Record<RecurrenceFrequency, [keyof UiStrings, keyof UiStrings]> = {
  daily: ['recurrenceDayOne', 'recurrenceDayOther'],
  weekly: ['recurrenceWeekOne', 'recurrenceWeekOther'],
  monthly: ['recurrenceMonthOne', 'recurrenceMonthOther'],
  yearly: ['recurrenceYearOne', 'recurrenceYearOther'],
};

const ORDINALS: [number, keyof UiStrings][] = [
  [1, 'recurrenceFirst'],
  [2, 'recurrenceSecond'],
  [3, 'recurrenceThird'],
  [4, 'recurrenceFourth'],
  [-1, 'recurrenceLast'],
];

const PARTS = Symbol('mx.recurrenceEditor');

/** An item of a list or of a radio group. */
interface Item<V> {
  value: V;
  text: string;
}

/** The editors of the choices. */
interface Editors {
  frequency: DropDown<Item<'never' | RecurrenceFrequency>, 'never' | RecurrenceFrequency>;
  interval: NumberBox;
  daysField: HTMLElement;
  daysLabel: HTMLElement;
  /** A button per day of the draft, in its order. */
  days: Button[];
  by: RadioGroup<DraftState['by']>;
  month: DropDown<Item<number>, number>;
  monthDay: NumberBox;
  nth: DropDown<Item<number>, number>;
  weekday: DropDown<Item<number>, number>;
  end: RadioGroup<DraftState['end']>;
  count: NumberBox;
  until: DateBox;
  summary: HTMLElement;
}

interface Parts {
  draft: RecurrenceDraft;
  /** The choices as they were last read or written: a change from it is the user's. */
  seen: string;
  valueChanged: Emitter<ValueChangedEventArgs<string>>;
  labelId: string;
  /** The editors of the choices, once made. */
  editors: Editors | null;
  /** The items each list was last given, as text. */
  listed: WeakMap<object, string>;
}

/**
 * How something repeats, edited: the repeat list (never, daily, weekly, monthly, yearly), every how
 * many, the weekdays of a week, a day of the month or a weekday by its place (the second Tuesday,
 * the last Friday), the month of a year, and the end (never, after a number of times, on a date).
 * It reads and writes an RFC 5545 rule (`value`, two-way with `x-model`) and says it in plain words
 * under it. The scheduler's appointment form holds one; it works on its own anywhere else, and in
 * a `FormLayout` (`FormLayout.editors.set('recurrence', (p) => new RecurrenceEditor(p))`). Its editors
 * are made once and written by hand when a choice, a property or the language changes.
 *
 * @example
 * <RecurrenceEditor x-model={() => state.rule} start={() => state.start} />
 */
export class RecurrenceEditor extends Control<HTMLDivElement, RecurrenceEditorProps> {
  constructor(props?: IBaseProp<RecurrenceEditorProps>) {
    super(props);
    const own = (this.props ?? {}) as RecurrenceEditorProps;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    if (own.onValueChanged) this.parts.valueChanged.event(own.onValueChanged);
    this.motif.setDisposable(() => this.parts.valueChanged.dispose());
  }

  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  /** The rule as RFC 5545 text; empty when it does not repeat. */
  get value(): string {
    return this.getProperty<string | undefined>('value') ?? '';
  }
  set value(value: Bind<string>) {
    const before = this.peekProperty<string>('value') ?? '';
    this.assignProperty('value', value, (v) => (typeof v === 'string' ? v : ''));
    // A rule set from code shows in `x-model` too, so the model and the editor never differ.
    const now = this.peekProperty<string>('value') ?? '';
    if (typeof value !== 'function' && now !== before) this.bindings.writeModel(now);
  }
  get start(): Date | null {
    const value = this.getProperty<Date | null | undefined>('start');
    return value instanceof Date && !Number.isNaN(value.getTime()) ? value : null;
  }
  set start(value: Bind<Date | null>) {
    this.assignProperty('start', value);
  }
  get allDay(): boolean {
    return !!this.getProperty<boolean>('allDay');
  }
  set allDay(value: Bind<boolean>) {
    this.assignProperty('allDay', value, Boolean);
  }
  get timeZone(): string | null {
    return this.getProperty<string | null | undefined>('timeZone') || null;
  }
  set timeZone(value: Bind<string | null>) {
    this.assignProperty('timeZone', value);
  }
  get frequencies(): readonly ('never' | RecurrenceFrequency)[] {
    return this.getProperty<readonly ('never' | RecurrenceFrequency)[] | undefined>('frequencies') ?? FREQUENCIES;
  }
  set frequencies(value: Bind<readonly ('never' | RecurrenceFrequency)[]>) {
    this.assignProperty('frequencies', value);
  }
  get firstDayOfWeek(): number {
    const value = this.getProperty<number | null | undefined>('firstDayOfWeek');
    return typeof value === 'number' ? ((Math.round(value) % 7) + 7) % 7 : localeFirstDay(this.locale);
  }
  set firstDayOfWeek(value: Bind<number | null>) {
    this.assignProperty('firstDayOfWeek', value);
  }
  get summary(): boolean {
    return this.getProperty<boolean | undefined>('summary') ?? true;
  }
  set summary(value: Bind<boolean>) {
    this.assignProperty('summary', value, Boolean);
  }
  get readOnly(): boolean {
    return !!this.getProperty<boolean>('readOnly');
  }
  set readOnly(value: Bind<boolean>) {
    this.assignProperty('readOnly', value, Boolean);
  }
  get locale(): string {
    return this.getProperty<string | undefined>('locale') || pageLocale();
  }
  set locale(value: Bind<string>) {
    this.assignProperty('locale', value);
  }
  get texts(): Partial<UiStrings> {
    return this.getProperty<Partial<UiStrings> | undefined>('texts') ?? {};
  }
  set texts(value: Bind<Partial<UiStrings>>) {
    this.assignProperty('texts', value);
  }

  /** The rule read from `value`; `null` when it does not repeat (or the text is not a rule). Reactive. */
  get rule(): RecurrenceRule | null {
    return parseRecurrenceRule(this.value);
  }
  /** How it repeats, in plain words. Reactive. */
  get summaryText(): string {
    return describeRecurrence(this.rule, this.start, { locale: this.locale, strings: this.strings(), timeZone: this.timeZone ?? undefined });
  }

  get onValueChanged(): MotifEvent<ValueChangedEventArgs<string>> {
    return this.parts.valueChanged.event;
  }

  override onConfigured() {
    this.class.add('mx-recurrence-editor');
    this.attr.add({ role: 'group' });
  }

  override onConfig() {
    // A rule, a start or a clock given: the choices show it. What only changes how they look: drawn again.
    for (const name of ['value', 'start', 'allDay', 'timeZone', 'firstDayOfWeek', 'locale'] as const) this.observeProperty(name, () => this.readValue());
    for (const name of ['text', 'summary', 'texts', 'readOnly', 'frequencies'] as const) this.observeProperty(name, () => this.show());
    this.parts.editors = this.makeEditors();
    follow(this, 'uiTexts', () => uiLocale.strings, () => this.show());
    this.show();
  }

  // Inside.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= { draft: new RecurrenceDraft(), seen: '', valueChanged: new Emitter(), labelId: nextId('recurrence-days'), editors: null, listed: new WeakMap() });
  }

  /** The editors of the choices, made once; `show` writes them. Each tells a choice of the user's to `chosen`. */
  private makeEditors(): Editors {
    const s = this.parts.draft.state;
    /** The user changed a choice in `c`: it is written to the draft, then the rule from it. */
    const picked = <V>(c: { onValueChanged: MotifEvent<ValueChangedEventArgs<V>> }, write: (value: V) => void) => {
      c.onValueChanged((e) => {
        if (!e.byUser) return;
        write(e.value);
        this.chosen();
      });
    };
    const add = <C extends ComponentBase>(c: C, className: string, all = false): C => {
      c.element.classList.add(className);
      if (all) c.element.setAttribute('data-span', 'all');
      this.controls.add(c);
      return c;
    };
    const frequency = add(new DropDown<Item<'never' | RecurrenceFrequency>, 'never' | RecurrenceFrequency>({ stretch: true }), 'mx-recurrence-editor__frequency');
    picked(frequency, (v) => (s.frequency = v ?? 'never'));
    const interval = add(new NumberBox({ min: 1, max: 999, allowEmpty: false, stretch: true }), 'mx-recurrence-editor__interval');
    picked(interval, (v) => (s.interval = v ?? s.interval));

    const daysField = part(this, 'div', 'mx-recurrence-editor__days-field');
    daysField.element.setAttribute('data-span', 'all');
    daysField.element.setAttribute('role', 'group');
    daysField.element.setAttribute('aria-labelledby', this.parts.labelId);
    const daysLabel = part(daysField, 'span', 'mx-recurrence-editor__days-label').element;
    daysLabel.id = this.parts.labelId;
    const dayList = part(daysField, 'div', 'mx-recurrence-editor__days');
    // The draft keeps its seven days (their order follows the first day of the week): a button each.
    const days = s.days.map((day) => {
      const button = new Button({ toggle: true });
      button.element.classList.add('mx-recurrence-editor__day');
      button.motif.on('click', () => {
        day.on = button.pressed;
        this.chosen();
      });
      dayList.controls.add(button);
      return button;
    });

    const by = add(new RadioGroup<DraftState['by']>({ orientation: 'horizontal' }), 'mx-recurrence-editor__by', true);
    picked(by, (v) => (s.by = v ?? s.by));
    const month = add(new DropDown<Item<number>, number>({ stretch: true }), 'mx-recurrence-editor__month');
    picked(month, (v) => (s.month = v ?? s.month));
    const monthDay = add(new NumberBox({ min: 1, max: 31, allowEmpty: false, stretch: true }), 'mx-recurrence-editor__month-day');
    picked(monthDay, (v) => (s.monthDay = v ?? s.monthDay));
    const nth = add(new DropDown<Item<number>, number>({ stretch: true }), 'mx-recurrence-editor__nth');
    picked(nth, (v) => (s.nth = v ?? s.nth));
    const weekday = add(new DropDown<Item<number>, number>({ stretch: true }), 'mx-recurrence-editor__weekday');
    picked(weekday, (v) => (s.weekday = v ?? s.weekday));
    const end = add(new RadioGroup<DraftState['end']>({ orientation: 'horizontal' }), 'mx-recurrence-editor__end', true);
    picked(end, (v) => (s.end = v ?? s.end));
    const count = add(new NumberBox({ min: 1, max: 999, allowEmpty: false, stretch: true }), 'mx-recurrence-editor__count');
    picked(count, (v) => (s.count = v ?? s.count));
    const until = add(new DateBox({ stretch: true }), 'mx-recurrence-editor__until');
    picked(until, (v) => (s.until = v));

    const summary = part(this, 'p', 'mx-recurrence-editor__summary').element;
    summary.setAttribute('data-span', 'all');
    summary.setAttribute('aria-live', 'polite');
    return { frequency, interval, daysField: daysField.element, daysLabel, days, by, month, monthDay, nth, weekday, end, count, until, summary };
  }

  /** The rule (or what it is read for) changed: the choices show it. */
  private readValue(): void {
    const parts = this.parts;
    parts.draft.read(this.value, this.draftContext());
    parts.seen = parts.draft.key();
    this.show();
  }

  /** The user changed a choice: the rule is written from the choices. */
  private chosen(): void {
    const parts = this.parts;
    const key = parts.draft.key();
    if (key !== parts.seen) {
      parts.seen = key;
      const previous = this.value;
      const next = parts.draft.write(this.draftContext());
      if (next !== previous) {
        // Stored, the rule is read again (`readValue`), as one given would be.
        this.changeProperty('value', next);
        this.bindings.writeModel(next);
        parts.valueChanged.fire({ value: next, previousValue: previous, byUser: true, source: this });
        return;
      }
    }
    this.show();
  }

  /** Every editor shows its choice, its texts and whether the choices want it. */
  private show(): void {
    const e = this.parts.editors;
    if (!e || this.isDisposed) return;
    const s = this.parts.draft.state;
    const t = (key: keyof UiStrings) => this.textOf(key);
    const readOnly = this.readOnly;
    const repeats = s.frequency !== 'never';
    const byMonth = s.frequency === 'monthly' || s.frequency === 'yearly';
    const byWeekday = byMonth && s.by === 'weekday';
    const weekdayName = (day: number, style: 'long' | 'short') =>
      new Intl.DateTimeFormat(this.locale, { weekday: style, timeZone: 'UTC' }).format(Date.UTC(2026, 0, 4 + day));
    const monthName = (month: number) => new Intl.DateTimeFormat(this.locale, { month: 'long', timeZone: 'UTC' }).format(Date.UTC(2026, month - 1, 1));
    /** A field's label, value, whether it is shown, and read-only. */
    const field = <V>(c: { label: Bind<string>; value: V; visible: Bind<boolean>; readOnly: Bind<boolean> }, label: string, value: V, visible: boolean) => {
      c.label = label;
      if (!Object.is(c.value, value)) c.value = value;
      c.visible = visible;
      c.readOnly = readOnly;
    };
    this.element.setAttribute('aria-label', this.text || t('recurrenceRepeat'));

    this.list(e.frequency, this.frequencies.map((f) => ({ value: f, text: t(FREQUENCY_TEXTS[f]) })));
    field(e.frequency, t('recurrenceRepeat'), s.frequency, true);

    field(e.interval, t('recurrenceEvery'), s.interval, repeats);
    const units = repeats ? UNITS[s.frequency as RecurrenceFrequency] : null;
    e.interval.suffix = units ? t(new Intl.PluralRules(this.locale).select(s.interval) === 'one' ? units[0] : units[1]) : '';

    shown(e.daysField, s.frequency === 'weekly');
    e.daysLabel.textContent = t('recurrenceOn');
    e.days.forEach((button, i) => {
      const day = s.days[i];
      button.pressed = day.on;
      button.text = weekdayName(day.day, 'short');
      button.hint = weekdayName(day.day, 'long');
      button.enabled = !readOnly;
    });

    this.list<RadioItem<DraftState['by']> | DraftState['by']>(e.by, [
      { value: 'monthDay', text: t('recurrenceByMonthDay') },
      { value: 'weekday', text: t('recurrenceByWeekday') },
    ]);
    field(e.by, t('recurrenceBy'), s.by, byMonth);

    this.list(e.month, Array.from({ length: 12 }, (_, i) => ({ value: i + 1, text: monthName(i + 1) })));
    field(e.month, t('recurrenceMonth'), s.month, s.frequency === 'yearly');

    field(e.monthDay, t('recurrenceMonthDay'), s.monthDay, byMonth && s.by === 'monthDay');

    this.list(e.nth, ORDINALS.map(([n, key]) => ({ value: n, text: t(key) })));
    field(e.nth, t('recurrenceNth'), s.nth, byWeekday);

    this.list(e.weekday, s.days.map((d) => ({ value: d.day, text: weekdayName(d.day, 'long') })));
    field(e.weekday, t('recurrenceWeekday'), s.weekday, byWeekday);

    this.list<RadioItem<DraftState['end']> | DraftState['end']>(e.end, [
      { value: 'never', text: t('recurrenceEndNever') },
      { value: 'count', text: t('recurrenceEndCount') },
      { value: 'until', text: t('recurrenceEndUntil') },
    ]);
    field(e.end, t('recurrenceEnds'), s.end, repeats);

    field(e.count, t('recurrenceCount'), s.count, repeats && s.end === 'count');

    e.until.locale = this.locale;
    // The draft makes its date again on each read: the same day is not given again.
    const sameDay = e.until.value?.getTime() === s.until?.getTime();
    field(e.until, t('recurrenceUntil'), sameDay ? e.until.value : s.until, repeats && s.end === 'until');

    shown(e.summary, this.summary && repeats);
    e.summary.textContent = this.summaryText;
  }

  /** A list's items, given again only when they changed (another language, another first day of the week). */
  private list<I>(c: { items: Bind<readonly I[]> }, items: I[]): void {
    const key = JSON.stringify(items);
    if (this.parts.listed.get(c) === key) return;
    this.parts.listed.set(c, key);
    c.items = items;
  }

  private draftContext(): DraftContext {
    return { start: this.start, allDay: this.allDay, zone: TimeZone.of(this.timeZone), firstDayOfWeek: this.firstDayOfWeek };
  }

  private strings(): UiStrings {
    return { ...uiLocale.strings, ...this.texts };
  }

  private textOf(key: keyof UiStrings, values?: Record<string, unknown>): string {
    const text = this.texts[key] ?? uiLocale.strings[key];
    return values ? fillTemplate(text, values) : text;
  }
}
