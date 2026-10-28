import { Emitter, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { fillTemplate } from '../../core/fill-template';
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
import { RadioGroup } from '../radiogroup/RadioGroup';
import { RecurrenceDraft, type DraftContext } from './model/RecurrenceDraft';
import type { RecurrenceEditorProps } from './recurrence-editor-props';

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

interface Parts {
  draft: RecurrenceDraft;
  /** The choices as they were last read or written: a change from it is the user's. */
  seen: string;
  valueChanged: Emitter<ValueChangedEventArgs<string>>;
  labelId: string;
}

/**
 * How something repeats, edited: the repeat list (never, daily, weekly, monthly, yearly), every how
 * many, the weekdays of a week, a day of the month or a weekday by its place (the second Tuesday,
 * the last Friday), the month of a year, and the end (never, after a number of times, on a date).
 * It reads and writes an RFC 5545 rule (`value`, two-way with `x-model`) and says it in plain words
 * under it. The scheduler's appointment form holds one; it works on its own anywhere else, and in
 * a `FormLayout` (`FormLayout.editors.set('recurrence', (p) => new RecurrenceEditor(p))`).
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
    this.assignProperty('value', value, (v) => (typeof v === 'string' ? v : ''));
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
    this.bindings.watch(() => this.element.setAttribute('aria-label', this.text || this.textOf('recurrenceRepeat')));
  }

  override onConfig() {
    const parts = this.parts;
    // The rule (or the start) changed: the choices show it.
    this.bindings.watch(() => {
      const value = this.value;
      const context = this.draftContext();
      untracked(() => {
        parts.draft.read(value, context);
        parts.seen = parts.draft.key();
      });
    });
    // A choice changed: the rule is written from them.
    this.bindings.watch(() => {
      const key = parts.draft.key();
      untracked(() => {
        if (key === parts.seen) return;
        parts.seen = key;
        const previous = this.value;
        const next = parts.draft.write(this.draftContext());
        if (next === previous) return;
        this.changeProperty('value', next);
        this.bindings.writeModel(next);
        parts.valueChanged.fire({ value: next, previousValue: previous, byUser: true, source: this });
      });
    });
  }

  override view() {
    const parts = this.parts;
    const s = parts.draft.state;
    const t = (key: keyof UiStrings) => this.textOf(key);
    const repeats = () => s.frequency !== 'never';
    const byMonth = () => s.frequency === 'monthly' || s.frequency === 'yearly';
    const weekdayName = (day: number, style: 'long' | 'short') =>
      new Intl.DateTimeFormat(this.locale, { weekday: style, timeZone: 'UTC' }).format(Date.UTC(2026, 0, 4 + day));
    const monthName = (month: number) => new Intl.DateTimeFormat(this.locale, { month: 'long', timeZone: 'UTC' }).format(Date.UTC(2026, month - 1, 1));
    const unit = () => {
      if (s.frequency === 'never') return '';
      const [one, many] = UNITS[s.frequency];
      return t(new Intl.PluralRules(this.locale).select(s.interval) === 'one' ? one : many);
    };
    return (
      <>
        <DropDown
          class="mx-recurrence-editor__frequency"
          label={() => t('recurrenceRepeat')}
          items={() => this.frequencies.map((f) => ({ value: f, text: () => t(FREQUENCY_TEXTS[f]) }))}
          x-model={() => s.frequency}
          readOnly={() => this.readOnly}
          stretch
        />
        <NumberBox
          class="mx-recurrence-editor__interval"
          label={() => t('recurrenceEvery')}
          suffix={unit}
          min={1}
          max={999}
          allowEmpty={false}
          x-model={() => s.interval}
          visible={repeats}
          readOnly={() => this.readOnly}
          stretch
        />
        <div class="mx-recurrence-editor__days-field" data-span="all" role="group" aria-labelledby={parts.labelId} x-display={() => s.frequency === 'weekly'}>
          <span class="mx-recurrence-editor__days-label" id={parts.labelId}>
            {() => t('recurrenceOn')}
          </span>
          <div class="mx-recurrence-editor__days">
            {s.days.map((day) => (
              <Button
                key={day.day}
                class="mx-recurrence-editor__day"
                toggle
                x-model={() => day.on}
                text={() => weekdayName(day.day, 'short')}
                hint={() => weekdayName(day.day, 'long')}
                enabled={() => !this.readOnly}
              />
            ))}
          </div>
        </div>
        <RadioGroup
          class="mx-recurrence-editor__by"
          data-span="all"
          label={() => t('recurrenceBy')}
          orientation="horizontal"
          items={[
            { value: 'monthDay', text: () => t('recurrenceByMonthDay') },
            { value: 'weekday', text: () => t('recurrenceByWeekday') },
          ]}
          x-model={() => s.by}
          visible={byMonth}
          readOnly={() => this.readOnly}
        />
        <DropDown
          class="mx-recurrence-editor__month"
          label={() => t('recurrenceMonth')}
          items={() => Array.from({ length: 12 }, (_, i) => ({ value: i + 1, text: monthName(i + 1) }))}
          x-model={() => s.month}
          visible={() => s.frequency === 'yearly'}
          readOnly={() => this.readOnly}
          stretch
        />
        <NumberBox
          class="mx-recurrence-editor__month-day"
          label={() => t('recurrenceMonthDay')}
          min={1}
          max={31}
          allowEmpty={false}
          x-model={() => s.monthDay}
          visible={() => byMonth() && s.by === 'monthDay'}
          readOnly={() => this.readOnly}
          stretch
        />
        <DropDown
          class="mx-recurrence-editor__nth"
          label={() => t('recurrenceNth')}
          items={() => ORDINALS.map(([n, key]) => ({ value: n, text: () => t(key) }))}
          x-model={() => s.nth}
          visible={() => byMonth() && s.by === 'weekday'}
          readOnly={() => this.readOnly}
          stretch
        />
        <DropDown
          class="mx-recurrence-editor__weekday"
          label={() => t('recurrenceWeekday')}
          items={() => s.days.map((d) => ({ value: d.day, text: weekdayName(d.day, 'long') }))}
          x-model={() => s.weekday}
          visible={() => byMonth() && s.by === 'weekday'}
          readOnly={() => this.readOnly}
          stretch
        />
        <RadioGroup
          class="mx-recurrence-editor__end"
          data-span="all"
          label={() => t('recurrenceEnds')}
          orientation="horizontal"
          items={[
            { value: 'never', text: () => t('recurrenceEndNever') },
            { value: 'count', text: () => t('recurrenceEndCount') },
            { value: 'until', text: () => t('recurrenceEndUntil') },
          ]}
          x-model={() => s.end}
          visible={repeats}
          readOnly={() => this.readOnly}
        />
        <NumberBox
          class="mx-recurrence-editor__count"
          label={() => t('recurrenceCount')}
          min={1}
          max={999}
          allowEmpty={false}
          x-model={() => s.count}
          visible={() => repeats() && s.end === 'count'}
          readOnly={() => this.readOnly}
          stretch
        />
        <DateBox
          class="mx-recurrence-editor__until"
          label={() => t('recurrenceUntil')}
          locale={() => this.locale}
          x-model={() => s.until}
          visible={() => repeats() && s.end === 'until'}
          readOnly={() => this.readOnly}
          stretch
        />
        <p class="mx-recurrence-editor__summary" data-span="all" aria-live="polite" x-display={() => this.summary && repeats()}>
          {() => this.summaryText}
        </p>
      </>
    );
  }

  // Inside.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= { draft: new RecurrenceDraft(), seen: '', valueChanged: new Emitter(), labelId: nextId('recurrence-days') });
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
