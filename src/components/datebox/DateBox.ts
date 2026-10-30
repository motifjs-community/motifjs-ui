import { Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { functionValue } from '../../core/function-value';
import { calendarMark, clockMark } from '../../core/glyphs';
import { uiLocale } from '../../core/ui-locale';
import type { DateKind } from '../../parts/dates/date-kind';
import { datePatternOf } from '../../parts/dates/date-pattern-of';
import type { DatePattern } from '../../parts/dates/date-pattern';
import { dateToDigits } from '../../parts/dates/date-to-digits';
import { dayStart } from '../../parts/dates/day-start';
import { digitsToDate } from '../../parts/dates/digits-to-date';
import { Field } from '../../parts/field/Field';
import { OptionList } from '../../parts/list/OptionList';
import { InputMask } from '../../parts/mask/InputMask';
import { Popup } from '../../parts/popup/Popup';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import { Calendar } from '../calendar/Calendar';
import type { DateBoxProps } from './date-box-props';
import { onLanguage } from '../../core/on-language';

const OWN = [
  'type',
  'min',
  'max',
  'locale',
  'displayFormat',
  'placeholder',
  'clearButton',
  'timeStep',
  'showSeconds',
  'firstDayOfWeek',
  'showWeekNumbers',
  'showTodayButton',
  'showPickerButton',
] as const;

const PICKER = ['min', 'max', 'disabledDates', 'locale', 'firstDayOfWeek', 'showWeekNumbers', 'showTodayButton'] as const;

const PARTS = Symbol('mx.datebox');

interface Parts {
  mask: InputMask;
  pattern: DatePattern;
  /** The text is not a whole, real date yet. */
  unfinished: boolean;
  toggle: HTMLButtonElement | null;
  stopLabels: (() => void) | null;
  popup: Popup | null;
  calendar: Calendar | null;
  times: OptionList<Date> | null;
  opened: Emitter<void>;
  closed: Emitter<PopupCloseReason>;
}

/**
 * A date, a time or both, typed in the locale's order through a mask (`22.11.2006`) or picked from
 * a calendar and a list of times. `min`, `max` and `disabledDates` limit both ways.
 *
 * @example
 * <DateBox label="&Birthday" max={new Date()} x-model={() => this.form.birthday} />
 * <DateBox label="Meeting" type="datetime" timeStep={15} displayFormat={{ dateStyle: 'medium', timeStyle: 'short' }} />
 */
export class DateBox extends Field<Date | null, DateBoxProps> {
  constructor(props?: IBaseProp<DateBoxProps>) {
    super(props);
    const own = (this.props ?? {}) as DateBoxProps;
    this.element.classList.add('mx-date-box');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.disabledDates !== undefined) this.bindProperty('disabledDates', functionValue(own.disabledDates));

    for (const name of ['type', 'locale', 'showSeconds'] as const) this.observeProperty(name, () => this.renderPattern());
    // The kit's language: the date's pattern and how it is written.
    onLanguage(this, () => this.renderPattern());
    this.observeProperty<string>('placeholder', (text) => {
      if (text) this.inputElement.placeholder = text;
      else this.inputElement.removeAttribute('placeholder');
    });
    this.observeProperty('clearButton', () => this.renderClear());
    this.observeProperty('showPickerButton', () => this.renderToggle());
    this.observeProperty('displayFormat', () => this.renderValue(this.peekValue()));
    for (const name of PICKER) this.observeProperty(name, () => this.syncPicker());
    this.observeProperty('disabledDates', () => this.syncPicker());
    this.listen();
    const parts = this.dateParts;
    // The kit's language, or another kind of box: the button and the popup are named again.
    const drawLabels = () => {
      const label = this.peekProperty<DateKind | undefined>('type') === 'time' ? uiLocale.strings.chooseTime : uiLocale.strings.chooseDate;
      parts.toggle?.setAttribute('aria-label', label);
      parts.popup?.element.setAttribute('aria-label', label);
    };
    parts.stopLabels = onLanguage(this, drawLabels);
    this.observeProperty('type', drawLabels);
    this.motif.setDisposable(() => {
      parts.mask.destroy();
      parts.stopLabels?.();
      parts.opened.dispose();
      parts.closed.dispose();
    });
  }

  get type(): DateKind {
    return this.getProperty<DateKind | undefined>('type') ?? 'date';
  }
  set type(value: Bind<DateKind>) {
    this.assignProperty('type', value);
  }
  get min(): Date | null {
    return this.getProperty<Date | null | undefined>('min') ?? null;
  }
  set min(value: Bind<Date | null>) {
    this.assignProperty('min', value);
  }
  get max(): Date | null {
    return this.getProperty<Date | null | undefined>('max') ?? null;
  }
  set max(value: Bind<Date | null>) {
    this.assignProperty('max', value);
  }
  get disabledDates(): ((date: Date) => boolean) | null {
    return this.getProperty<((date: Date) => boolean) | null | undefined>('disabledDates') ?? null;
  }
  set disabledDates(value: Bind<((date: Date) => boolean) | null>) {
    this.assignProperty('disabledDates', functionValue(value));
  }
  get locale(): string {
    return this.getProperty<string | undefined>('locale') || uiLocale.locale;
  }
  set locale(value: Bind<string>) {
    this.assignProperty('locale', value);
  }
  get displayFormat(): Intl.DateTimeFormatOptions | null {
    return this.getProperty<Intl.DateTimeFormatOptions | null | undefined>('displayFormat') ?? null;
  }
  set displayFormat(value: Bind<Intl.DateTimeFormatOptions | null>) {
    this.assignProperty('displayFormat', value);
  }
  get placeholder(): string {
    return this.getProperty<string | undefined>('placeholder') ?? '';
  }
  set placeholder(value: Bind<string>) {
    this.assignProperty('placeholder', value);
  }
  get clearButton(): boolean {
    return !!this.getProperty<boolean>('clearButton');
  }
  set clearButton(value: Bind<boolean>) {
    this.assignProperty('clearButton', value, Boolean);
  }
  get timeStep(): number {
    return this.getProperty<number | undefined>('timeStep') ?? 30;
  }
  set timeStep(value: Bind<number>) {
    this.assignProperty('timeStep', value, (v) => Math.max(1, Number(v) || 30));
  }
  get showSeconds(): boolean {
    return !!this.getProperty<boolean>('showSeconds');
  }
  set showSeconds(value: Bind<boolean>) {
    this.assignProperty('showSeconds', value, Boolean);
  }
  get firstDayOfWeek(): number | null {
    return this.getProperty<number | null | undefined>('firstDayOfWeek') ?? null;
  }
  set firstDayOfWeek(value: Bind<number | null>) {
    this.assignProperty('firstDayOfWeek', value);
  }
  get showWeekNumbers(): boolean {
    return !!this.getProperty<boolean>('showWeekNumbers');
  }
  set showWeekNumbers(value: Bind<boolean>) {
    this.assignProperty('showWeekNumbers', value, Boolean);
  }
  get showTodayButton(): boolean {
    return !!this.getProperty<boolean>('showTodayButton');
  }
  set showTodayButton(value: Bind<boolean>) {
    this.assignProperty('showTodayButton', value, Boolean);
  }
  get showPickerButton(): boolean {
    return this.getProperty<boolean | undefined>('showPickerButton') !== false;
  }
  set showPickerButton(value: Bind<boolean>) {
    this.assignProperty('showPickerButton', value, Boolean);
  }

  get inputElement(): HTMLInputElement {
    return this.focusElement as HTMLInputElement;
  }

  /** The text typed so far is not a whole, real date. */
  get unfinished(): boolean {
    return this.dateParts.unfinished;
  }

  get opened(): boolean {
    return !!this.getProperty<boolean>('opened');
  }
  set opened(value: boolean) {
    if (value) this.open();
    else this.close();
  }

  get onOpened(): MotifEvent<void> {
    return this.dateParts.opened.event;
  }

  get onClosed(): MotifEvent<PopupCloseReason> {
    return this.dateParts.closed.event;
  }

  /** Opens the calendar (or the times); `false` when it cannot be used now. */
  open(): boolean {
    if (!this.isEnabled || this.peekProperty('readOnly')) return false;
    const parts = this.dateParts;
    const popup = (parts.popup ??= this.createPopup());
    if (popup.isOpen) return true;
    this.fillPopup();
    popup.open(this.inputElement.parentElement!, { toggle: this.inputElement.parentElement!, returnFocus: this.inputElement });
    this.setProperty('opened', true);
    parts.toggle?.setAttribute('aria-expanded', 'true');
    // The times scroll to the chosen one now that they can be seen.
    if (parts.times && parts.times.activeIndex >= 0) parts.times.setActive(parts.times.activeIndex);
    if (parts.calendar) parts.calendar.focus();
    else parts.times?.element.focus();
    parts.opened.fire();
    return true;
  }

  close(): void {
    this.dateParts.popup?.close('code');
  }

  clear(): void {
    this.dateParts.unfinished = false;
    this.commit(null);
  }

  protected createControl(): HTMLElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mx-field__input';
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    return input;
  }

  protected emptyValue(): Date | null {
    return null;
  }

  protected override normalizeValue(value: Date | null): Date | null {
    return value instanceof Date && !isNaN(+value) ? value : null;
  }

  protected override sameValue(a: Date | null, b: Date | null): boolean {
    return a === b || (!!a && !!b && +a === +b);
  }

  protected renderValue(value: Date | null): void {
    const parts = this.dateParts;
    parts.unfinished = false;
    parts.mask.setRaw(value ? dateToDigits(value, parts.pattern) : '');
    this.showDisplayText();
    this.syncPicker();
  }

  protected override builtInRules(): ValidationRule<Date | null>[] {
    const rules = super.builtInRules();
    const time = this.peekProperty<DateKind>('type') === 'time';
    const message = () => (time ? uiLocale.strings.invalidTime : uiLocale.strings.invalidDate);
    rules.push({ type: 'custom', check: () => !this.dateParts.unfinished, ignoreEmpty: false, message });
    const min = this.peekProperty<Date | null>('min');
    const max = this.peekProperty<Date | null>('max');
    if (min || max) rules.push({ type: 'range', min: min ?? undefined, max: max ?? undefined });
    const disabled = this.peekProperty<((d: Date) => boolean) | null>('disabledDates');
    if (disabled) rules.push({ type: 'custom', check: (v) => !v || !disabled(v), message });
    return rules;
  }

  protected override isEmptyValue(value: Date | null): boolean {
    return value === null && !this.dateParts.unfinished;
  }

  private get dateParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    if (!self[PARTS]) {
      const pattern = datePatternOf(uiLocale.locale, 'date');
      self[PARTS] = {
        mask: new InputMask(this.focusElement as HTMLInputElement, { mask: pattern.mask }),
        pattern,
        unfinished: false,
        toggle: null,
        stopLabels: null,
        popup: null,
        calendar: null,
        times: null,
        opened: new Emitter(),
        closed: new Emitter(),
      };
    }
    return self[PARTS]!;
  }

  private renderPattern(): void {
    const parts = this.dateParts;
    const kind = this.peekProperty<DateKind>('type') ?? 'date';
    parts.pattern = datePatternOf(this.peekProperty<string>('locale') || uiLocale.locale, kind, !!this.peekProperty('showSeconds'));
    parts.mask.update({ mask: parts.pattern.mask });
    this.element.dataset.type = kind;
    this.renderToggle();
    this.renderValue(this.peekValue());
    if (parts.popup) {
      parts.popup.close('code');
      parts.popup.controls.clear();
      parts.calendar = parts.times = null;
    }
  }

  private listen(): void {
    const input = this.inputElement;
    input.addEventListener('input', (e) => this.typed(e));
    input.addEventListener('blur', () => this.showDisplayText());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Escape' && this.peekProperty('clearButton') && !this.peekProperty('readOnly') && (this.peekValue() || this.dateParts.unfinished)) {
        e.preventDefault();
        e.stopPropagation();
        this.dateParts.unfinished = false;
        this.commit(null, e);
        this.dateParts.mask.setRaw('');
      } else if (e.key === 'Enter') {
        this.typed(e);
      }
    });
  }

  /** Commits what is typed when it is a whole, real date; empty text empties the value. */
  private typed(e: Event): void {
    const parts = this.dateParts;
    const digits = parts.mask.raw;
    if (!digits) {
      parts.unfinished = false;
      this.commit(null, e);
      return;
    }
    const date = parts.mask.complete ? digitsToDate(digits, parts.pattern, this.peekValue() ?? dayStart(new Date())) : null;
    parts.unfinished = !date;
    if (date) this.commit(date, e);
    else if (parts.unfinished && this.isValid === false) void this.validate();
  }

  /** Not being edited: the value in `displayFormat`. */
  private showDisplayText(): void {
    const value = this.peekValue();
    const format = this.peekProperty<Intl.DateTimeFormatOptions | null>('displayFormat');
    const input = this.inputElement;
    if (!value || !format || document.activeElement === input || this.dateParts.unfinished) return;
    input.value = new Intl.DateTimeFormat(this.peekProperty<string>('locale') || uiLocale.locale, format).format(value);
  }

  private renderToggle(): void {
    const parts = this.dateParts;
    const on = this.peekProperty('showPickerButton') !== false;
    if (!on) {
      parts.toggle?.remove();
      parts.toggle = null;
      return;
    }
    const time = this.peekProperty<DateKind>('type') === 'time';
    if (!parts.toggle) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mx-field__button mx-date-box__toggle';
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('click', () => {
        if (this.dateParts.popup?.isOpen) this.close();
        else this.open();
      });
      this.area('actions').append(button);
      parts.toggle = button;
    }
    parts.toggle.replaceChildren(time ? clockMark() : calendarMark());
    parts.toggle.setAttribute('aria-label', time ? uiLocale.strings.chooseTime : uiLocale.strings.chooseDate);
  }

  private renderClear(): void {
    const parts = this.dateParts;
    this.showClearButton(
      !!this.peekProperty('clearButton'),
      (e) => {
        parts.unfinished = false;
        this.commit(null, e);
        parts.mask.setRaw('');
      },
      'mx-date-box__clear',
    );
  }

  private createPopup(): Popup {
    const parts = this.dateParts;
    const popup = new Popup();
    popup.matchWidth = false;
    popup.element.classList.add('mx-date-box__popup');
    popup.element.setAttribute('role', 'dialog');
    popup.element.setAttribute('aria-label', this.peekProperty('type') === 'time' ? uiLocale.strings.chooseTime : uiLocale.strings.chooseDate);
    this.controls.add(popup);
    popup.onClosed((reason) => {
      this.setProperty('opened', false);
      parts.toggle?.setAttribute('aria-expanded', 'false');
      parts.closed.fire(reason);
    });
    return popup;
  }

  /** The calendar and the times, made the first time they are needed. */
  private fillPopup(): void {
    const parts = this.dateParts;
    const popup = parts.popup!;
    const kind = this.peekProperty<DateKind>('type') ?? 'date';
    if (kind !== 'time' && !parts.calendar) {
      const calendar = new Calendar();
      calendar.onValueChanged((e) => {
        if (!e.byUser || !e.value) return;
        const previous = this.peekValue();
        const day = e.value;
        const date = kind === 'datetime' && previous ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), previous.getHours(), previous.getMinutes(), previous.getSeconds()) : dayStart(day);
        parts.unfinished = false;
        this.commit(date, e.event);
        if (kind === 'date') this.close();
      });
      popup.controls.add(calendar);
      parts.calendar = calendar;
    }
    if (kind !== 'date' && !parts.times) {
      const times = new OptionList<Date>();
      const format = new Intl.DateTimeFormat(this.peekProperty<string>('locale') || uiLocale.locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
      times.textOf = (time) => format.format(time);
      times.isSelected = (time) => {
        const value = this.peekValue();
        return !!value && value.getHours() === time.getHours() && value.getMinutes() === time.getMinutes();
      };
      times.element.tabIndex = 0;
      times.element.classList.add('mx-date-box__times');
      times.element.addEventListener('keydown', (e) => {
        if (times.handleKey(e)) times.element.setAttribute('aria-activedescendant', times.idOf(times.activeIndex));
      });
      times.onChosen((e) => {
        const base = this.peekValue() ?? dayStart(new Date());
        const date = new Date(base.getFullYear(), base.getMonth(), base.getDate(), e.item.getHours(), e.item.getMinutes());
        parts.unfinished = false;
        this.commit(date, e.event);
        this.close();
      });
      popup.controls.add(times);
      parts.times = times;
    }
    this.syncPicker();
  }

  /** The open picker follows the value and the limits. */
  private syncPicker(): void {
    const parts = this.dateParts;
    const value = this.peekValue();
    const calendar = parts.calendar;
    if (calendar) {
      calendar.min = this.peekProperty<Date | null>('min') ?? null;
      calendar.max = this.peekProperty<Date | null>('max') ?? null;
      calendar.disabledDates = this.peekProperty<((d: Date) => boolean) | null>('disabledDates') ?? null;
      calendar.locale = this.peekProperty<string>('locale') ?? '';
      calendar.firstDayOfWeek = this.peekProperty<number | null>('firstDayOfWeek') ?? null;
      calendar.showWeekNumbers = !!this.peekProperty('showWeekNumbers');
      calendar.showTodayButton = !!this.peekProperty('showTodayButton');
      calendar.value = value;
      if (!value) calendar.goTo(this.peekProperty<Date | null>('min') ?? new Date());
    }
    const times = parts.times;
    if (times) {
      const step = this.peekProperty<number>('timeStep') ?? 30;
      const list: Date[] = [];
      for (let minute = 0; minute < 24 * 60; minute += step) list.push(new Date(2000, 0, 1, Math.floor(minute / 60), minute % 60));
      times.setItems(list);
      const at = value ? list.findIndex((t) => t.getHours() * 60 + t.getMinutes() >= value.getHours() * 60 + value.getMinutes()) : list.findIndex((t) => t.getHours() >= 9);
      if (at >= 0) {
        times.setActive(at);
        times.element.setAttribute('aria-activedescendant', times.idOf(at));
      }
    }
  }
}
