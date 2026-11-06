import { Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { put } from "../../core/draw-parts";
import { functionValue } from "../../core/function-value";
import { calendarMark } from "../../core/glyphs";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import { addDays } from "../../parts/dates/add-days";
import { addMonths } from "../../parts/dates/add-months";
import type { DateKind } from "../../parts/dates/date-kind";
import { datePatternOf } from "../../parts/dates/date-pattern-of";
import type { DatePattern } from "../../parts/dates/date-pattern";
import { dateToDigits } from "../../parts/dates/date-to-digits";
import { dayStart } from "../../parts/dates/day-start";
import { digitsToDate } from "../../parts/dates/digits-to-date";
import { sameDay } from "../../parts/dates/same-day";
import { Field } from "../../parts/field/Field";
import { OptionList } from "../../parts/list/OptionList";
import { InputMask } from "../../parts/mask/InputMask";
import { Popup } from "../../parts/popup/Popup";
import type { PopupCloseReason } from "../../parts/popup/popup-close-reason";
import type { ValidationRule } from "../../parts/validation/validation-rule";
import { Calendar } from "../calendar/Calendar";
import type { DateRange } from "./date-range";
import type { DateRangeBoxProps } from "./date-range-box-props";
import type { DateRangePreset } from "./date-range-preset";

const OWN = ['type', 'min', 'max', 'minDays', 'maxDays', 'locale', 'displayFormat', 'startPlaceholder', 'endPlaceholder', 'clearButton', 'showSeconds', 'firstDayOfWeek', 'showWeekNumbers', 'showPickerButton', 'calendars', 'presets', 'closeOnComplete'] as const;
const PICKER = ['min', 'max', 'disabledDates', 'locale', 'firstDayOfWeek', 'showWeekNumbers', 'calendars', 'presets', 'minDays', 'maxDays'] as const;

const PARTS = Symbol('mx.daterangebox');

interface Parts {
    startInput: HTMLInputElement;
    endInput: HTMLInputElement;
    separator: HTMLSpanElement;
    startMask: InputMask;
    endMask: InputMask;
    pattern: DatePattern;
    // A side whose text is not a whole, real date yet.
    unfinished: [boolean, boolean];
    toggle: HTMLButtonElement | null;
    popup: Popup | null;
    calendars: Calendar[];
    presetList: OptionList<DateRangePreset> | null;
    // 0: the next pick is the start, 1: the end.
    stage: 0 | 1;
    opened: Emitter<void>;
    closed: Emitter<PopupCloseReason>;
}

const DAY = 24 * 60 * 60 * 1000;

/** Whole days from the start of `a` to the start of `b`. */
function daysBetween(a: Date, b: Date): number {
    return Math.round((+dayStart(b) - +dayStart(a)) / DAY);
}

/**
 * A start and an end date in one field, typed in the locale's order through two masks or picked in the popup from
 * two months side by side (the first pick is the start, the second the end), or from ready-made ranges (`presets`),
 * with `min`, `max`, `disabledDates`, and the minimum and maximum length of a range (`minDays`, `maxDays`). The
 * value is a `[start, end]` pair, and `x-model` provides two-way binding.
 *
 * @example
 * <DateRangeBox label="Stay" x-model={() => this.booking.nights} minDays={1} maxDays={30} presets />
 * <DateRangeBox label="Report" type="datetime" calendars={1} />
 */
export class DateRangeBox extends Field<DateRange, DateRangeBoxProps> {
    constructor(props?: IBaseProp<DateRangeBoxProps>) {
        super(props);
        const own = (this.props ?? {}) as DateRangeBoxProps;
        this.element.classList.add('mx-date-range-box');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.disabledDates !== undefined) this.bindProperty('disabledDates', functionValue(own.disabledDates));

        for (const name of ['type', 'locale', 'showSeconds'] as const) this.observeProperty(name, () => this.renderPattern());
        onLanguage(this, () => {
            this.renderPattern();
            this.renderNames();
        });
        this.observeProperty<string>('text', () => this.renderNames());
        this.observeProperty<string>('startPlaceholder', p => put(this.rangeParts.startInput, 'placeholder', p || null));
        this.observeProperty<string>('endPlaceholder', p => put(this.rangeParts.endInput, 'placeholder', p || null));
        this.observeProperty('clearButton', () => this.renderClear());
        this.observeProperty('showPickerButton', () => this.renderToggle());
        this.observeProperty('displayFormat', () => this.renderValue(this.peekValue()));
        for (const name of PICKER) this.observeProperty(name, () => this.syncPicker());
        this.listen();
        this.motif.setDisposable(() => {
            const parts = this.rangeParts;
            parts.startMask.destroy();
            parts.endMask.destroy();
            parts.opened.dispose();
            parts.closed.dispose();
        });
    }

    // Properties (see DateRangeBoxProps).

    get type(): Exclude<DateKind, 'time'> {
        return this.getProperty<Exclude<DateKind, 'time'> | undefined>('type') ?? 'date';
    }
    set type(value: Bind<Exclude<DateKind, 'time'>>) {
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
    get minDays(): number | null {
        return this.getProperty<number | null | undefined>('minDays') ?? null;
    }
    set minDays(value: Bind<number | null>) {
        this.assignProperty('minDays', value);
    }
    get maxDays(): number | null {
        return this.getProperty<number | null | undefined>('maxDays') ?? null;
    }
    set maxDays(value: Bind<number | null>) {
        this.assignProperty('maxDays', value);
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
    get startPlaceholder(): string {
        return this.getProperty<string | undefined>('startPlaceholder') ?? '';
    }
    set startPlaceholder(value: Bind<string>) {
        this.assignProperty('startPlaceholder', value);
    }
    get endPlaceholder(): string {
        return this.getProperty<string | undefined>('endPlaceholder') ?? '';
    }
    set endPlaceholder(value: Bind<string>) {
        this.assignProperty('endPlaceholder', value);
    }
    get clearButton(): boolean {
        return !!this.getProperty<boolean>('clearButton');
    }
    set clearButton(value: Bind<boolean>) {
        this.assignProperty('clearButton', value, Boolean);
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
    get showPickerButton(): boolean {
        return this.getProperty<boolean | undefined>('showPickerButton') !== false;
    }
    set showPickerButton(value: Bind<boolean>) {
        this.assignProperty('showPickerButton', value);
    }
    get calendars(): 1 | 2 {
        return this.getProperty<1 | 2 | undefined>('calendars') === 1 ? 1 : 2;
    }
    set calendars(value: Bind<1 | 2>) {
        this.assignProperty('calendars', value);
    }
    get presets(): readonly DateRangePreset[] | boolean {
        return this.getProperty<readonly DateRangePreset[] | boolean | undefined>('presets') ?? false;
    }
    set presets(value: Bind<readonly DateRangePreset[] | boolean>) {
        this.assignProperty('presets', value);
    }
    get closeOnComplete(): boolean {
        return this.getProperty<boolean | undefined>('closeOnComplete') !== false;
    }
    set closeOnComplete(value: Bind<boolean>) {
        this.assignProperty('closeOnComplete', value);
    }

    /** The start and end as separate properties. */
    get startDate(): Date | null {
        return this.value[0];
    }
    set startDate(value: Date | null) {
        this.value = [value, this.peekValue()[1]];
    }
    get endDate(): Date | null {
        return this.value[1];
    }
    set endDate(value: Date | null) {
        this.value = [this.peekValue()[0], value];
    }

    /** The start input. The end input is `endInputElement`. */
    get inputElement(): HTMLInputElement {
        return this.rangeParts.startInput;
    }

    get endInputElement(): HTMLInputElement {
        return this.rangeParts.endInput;
    }

    /** Indicates that the text of an end is not yet a complete, valid date. */
    get unfinished(): boolean {
        return this.rangeParts.unfinished.some(Boolean);
    }

    /** Indicates whether the popup is open. Reactive. */
    get opened(): boolean {
        return !!this.getProperty<boolean>('opened');
    }
    set opened(value: boolean) {
        if (value) this.open();
        else this.close();
    }

    get onOpened(): MotifEvent<void> {
        return this.rangeParts.opened.event;
    }

    get onClosed(): MotifEvent<PopupCloseReason> {
        return this.rangeParts.closed.event;
    }

    /** Opens the calendars. Returns `false` when disabled or read-only. */
    open(): boolean {
        if (!this.isEnabled || this.peekProperty('readOnly')) {
            return false;
        }
        const parts = this.rangeParts;
        const popup = (parts.popup ??= this.createPopup());
        if (popup.isOpen) {
            return true;
        }
        this.fillPopup();
        const [start, end] = this.peekValue();
        parts.stage = start && !end ? 1 : 0;
        this.syncPicker();
        popup.open(parts.startInput.parentElement!, { toggle: parts.startInput.parentElement!, returnFocus: parts.startInput });
        this.setProperty('opened', true);
        parts.toggle?.setAttribute('aria-expanded', 'true');
        parts.calendars[0]?.focus();
        parts.opened.fire();
        return true;
    }

    close(): void {
        this.rangeParts.popup?.close('code');
    }

    clear(): void {
        this.rangeParts.unfinished = [false, false];
        this.commit([null, null]);
    }

    protected createControl(): HTMLElement {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'mx-field__input mx-date-range-box__start';
        input.inputMode = 'numeric';
        input.autocomplete = 'off';
        return input;
    }

    protected emptyValue(): DateRange {
        return [null, null];
    }

    protected override normalizeValue(value: DateRange): DateRange {
        const date = (d: unknown) => (d instanceof Date && !isNaN(+d) ? d : null);
        return Array.isArray(value) ? [date(value[0]), date(value[1])] : [null, null];
    }

    protected override sameValue(a: DateRange, b: DateRange): boolean {
        const same = (x: Date | null, y: Date | null) => x === y || (!!x && !!y && +x === +y);
        return same(a[0], b[0]) && same(a[1], b[1]);
    }

    protected override isEmptyValue(value: DateRange): boolean {
        return value[0] === null && value[1] === null && !this.rangeParts.unfinished.some(Boolean);
    }

    protected renderValue(value: DateRange): void {
        const parts = this.rangeParts;
        parts.unfinished = [false, false];
        parts.startMask.setRaw(value[0] ? dateToDigits(value[0], parts.pattern) : '');
        parts.endMask.setRaw(value[1] ? dateToDigits(value[1], parts.pattern) : '');
        this.showDisplayText();
        this.syncPicker();
    }

    protected override builtInRules(): ValidationRule<DateRange>[] {
        const rules = super.builtInRules();
        const strings = () => uiLocale.strings;
        rules.push({ type: 'custom', check: () => !this.rangeParts.unfinished.some(Boolean), ignoreEmpty: false, message: () => strings().invalidDate });
        const min = this.peekProperty<Date | null>('min');
        const max = this.peekProperty<Date | null>('max');
        const disabled = this.peekProperty<((d: Date) => boolean) | null>('disabledDates');
        const inside = (d: Date | null) => !d || ((!min || d >= min) && (!max || d <= max) && !disabled?.(d));
        if (min || max) {
            rules.push({ type: 'custom', check: v => inside(v[0]) && inside(v[1]), message: () => uiLocale.text('outOfRange', { min: this.written(min), max: this.written(max) }) });
        } else if (disabled) {
            rules.push({ type: 'custom', check: v => inside(v[0]) && inside(v[1]), message: () => strings().invalidDate });
        }
        rules.push({ type: 'custom', check: v => !v[0] || !v[1] || v[0] <= v[1], message: () => strings().rangeOrder });
        const least = this.peekProperty<number | null>('minDays');
        const most = this.peekProperty<number | null>('maxDays');
        if (least) rules.push({ type: 'custom', check: v => !v[0] || !v[1] || daysBetween(v[0], v[1]) >= least, message: () => uiLocale.text('rangeTooShort', { count: least }) });
        if (most) rules.push({ type: 'custom', check: v => !v[0] || !v[1] || daysBetween(v[0], v[1]) <= most, message: () => uiLocale.text('rangeTooLong', { count: most }) });
        return rules;
    }

    written(date: Date | null | undefined): string {
        return date ? new Intl.DateTimeFormat(this.peekProperty<string>('locale') || uiLocale.locale, { dateStyle: 'medium' }).format(date) : '';
    }

    get rangeParts(): Parts {
        const self = this as unknown as { [PARTS]?: Parts };
        if (!self[PARTS]) {
            const pattern = datePatternOf(uiLocale.locale, 'date');
            const startInput = this.focusElement as HTMLInputElement;
            const tools = this.area('tools');
            tools.classList.add('mx-date-range-box__tools');
            const separator = document.createElement('span');
            separator.className = 'mx-glyph mx-date-range-box__separator';
            separator.setAttribute('aria-hidden', 'true');
            const endInput = document.createElement('input');
            endInput.type = 'text';
            endInput.className = 'mx-field__input mx-date-range-box__end';
            endInput.inputMode = 'numeric';
            endInput.autocomplete = 'off';
            tools.append(separator, endInput);
            self[PARTS] = {
                startInput,
                endInput,
                separator,
                startMask: new InputMask(startInput, { mask: pattern.mask }),
                endMask: new InputMask(endInput, { mask: pattern.mask }),
                pattern,
                unfinished: [false, false],
                toggle: null,
                popup: null,
                calendars: [],
                presetList: null,
                stage: 0,
                opened: new Emitter(),
                closed: new Emitter()
            };
        }
        return self[PARTS];
    }

    renderPattern(): void {
        const parts = this.rangeParts;
        const kind = this.peekProperty<DateKind>('type') ?? 'date';
        parts.pattern = datePatternOf(this.peekProperty<string>('locale') || uiLocale.locale, kind === 'datetime' ? 'datetime' : 'date', !!this.peekProperty('showSeconds'));
        parts.startMask.update({ mask: parts.pattern.mask });
        parts.endMask.update({ mask: parts.pattern.mask });
        this.element.dataset.type = kind;
        this.renderValue(this.peekValue());
        if (parts.popup) {
            parts.popup.close('code');
            parts.popup.controls.clear();
            parts.calendars = [];
            parts.presetList = null;
        }
    }

    // The two inputs are named by the field's label and their side, so a reader tells them apart.
    renderNames(): void {
        const parts = this.rangeParts;
        const label = this.peekProperty<string>('text') ?? '';
        const strings = uiLocale.strings;
        put(parts.startInput, 'aria-label', label ? `${label}, ${strings.rangeStart}` : strings.rangeStart);
        put(parts.endInput, 'aria-label', label ? `${label}, ${strings.rangeEnd}` : strings.rangeEnd);
        parts.toggle?.setAttribute('aria-label', strings.chooseDate);
        parts.popup?.element.setAttribute('aria-label', strings.chooseDate);
    }

    listen(): void {
        const parts = this.rangeParts;
        parts.startInput.addEventListener('input', e => this.typed(0, e));
        parts.endInput.addEventListener('input', e => this.typed(1, e));
        for (const [side, input] of [[0, parts.startInput], [1, parts.endInput]] as const) {
            input.addEventListener('blur', () => this.showDisplayText());
            input.addEventListener('keydown', e => {
                if (e.key === 'ArrowDown' && e.altKey) {
                    e.preventDefault();
                    this.open();
                } else if (e.key === 'Escape' && this.peekProperty('clearButton') && !this.peekProperty('readOnly') && !this.isEmptyValue(this.peekValue())) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.clear();
                } else if (e.key === 'Enter') {
                    this.typed(side, e);
                }
            });
        }
    }

    // A side typed whole and real is committed; empty text empties that side.
    typed(side: 0 | 1, e: Event): void {
        const parts = this.rangeParts;
        const mask = side === 0 ? parts.startMask : parts.endMask;
        const value = this.peekValue();
        const other = value[side === 0 ? 1 : 0];
        const digits = mask.raw;
        if (!digits) {
            parts.unfinished[side] = false;
            this.commit(side === 0 ? [null, other] : [other, null], e);
            return;
        }
        const date = mask.complete ? digitsToDate(digits, parts.pattern, value[side] ?? dayStart(new Date())) : null;
        parts.unfinished[side] = !date;
        if (date) this.commit(side === 0 ? [date, other] : [other, date], e);
        else if (parts.unfinished[side] && this.isValid === false) void this.validate();
    }

    // Not being edited: the dates in `displayFormat`.
    showDisplayText(): void {
        const parts = this.rangeParts;
        const format = this.peekProperty<Intl.DateTimeFormatOptions | null>('displayFormat');
        if (!format) {
            return;
        }
        const locale = this.peekProperty<string>('locale') || uiLocale.locale;
        const value = this.peekValue();
        const active = document.activeElement;
        for (const [side, input] of [[0, parts.startInput], [1, parts.endInput]] as const) {
            const date = value[side];
            if (date && active !== input && !parts.unfinished[side]) input.value = new Intl.DateTimeFormat(locale, format).format(date);
        }
    }

    renderToggle(): void {
        const parts = this.rangeParts;
        if (this.peekProperty('showPickerButton') === false) {
            parts.toggle?.remove();
            parts.toggle = null;
            return;
        }
        if (!parts.toggle) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'mx-field__button mx-date-range-box__toggle';
            button.setAttribute('aria-haspopup', 'dialog');
            button.setAttribute('aria-expanded', 'false');
            button.addEventListener('click', () => {
                if (parts.popup?.isOpen) this.close();
                else this.open();
            });
            this.area('actions').append(button);
            parts.toggle = button;
        }
        parts.toggle.replaceChildren(calendarMark());
        parts.toggle.setAttribute('aria-label', uiLocale.strings.chooseDate);
    }

    renderClear(): void {
        this.showClearButton(!!this.peekProperty('clearButton'), () => this.clear(), 'mx-date-range-box__clear');
    }

    createPopup(): Popup {
        const parts = this.rangeParts;
        const popup = new Popup();
        popup.matchWidth = false;
        popup.element.classList.add('mx-date-range-box__popup');
        popup.element.setAttribute('role', 'dialog');
        popup.element.setAttribute('aria-label', uiLocale.strings.chooseDate);
        this.controls.add(popup);
        popup.onClosed(reason => {
            this.setProperty('opened', false);
            parts.toggle?.setAttribute('aria-expanded', 'false');
            parts.closed.fire(reason);
        });
        return popup;
    }

    // The calendars (one or two months) and the presets, made the first time they are needed.
    fillPopup(): void {
        const parts = this.rangeParts;
        const popup = parts.popup!;
        const count = this.peekProperty<1 | 2>('calendars') === 1 ? 1 : 2;
        if (parts.calendars.length !== count) {
            for (const calendar of parts.calendars) popup.controls.remove(calendar);
            parts.calendars = [];
            for (let i = 0; i < count; i++) {
                const calendar = new Calendar({ showOtherMonths: count === 1 });
                calendar.element.classList.add('mx-date-range-box__calendar');
                calendar.onValueChanged(e => {
                    if (!e.byUser || !e.value) return;
                    const day = e.value;
                    // The calendar keeps no value of its own: the next pick, the same day too, is told again.
                    calendar.value = null;
                    this.picked(day, e.event);
                });
                calendar.onDayPointed(day => this.pointed(day));
                this.followMonths(calendar, i);
                popup.controls.add(calendar);
                parts.calendars.push(calendar);
            }
            if (parts.presetList) popup.controls.add(parts.presetList);
        }
        const presets = this.presetsNow();
        if (presets.length && !parts.presetList) {
            const list = new OptionList<DateRangePreset>();
            list.textOf = p => p.text;
            list.element.tabIndex = 0;
            list.element.classList.add('mx-date-range-box__presets');
            list.element.addEventListener('keydown', e => {
                if (list.handleKey(e)) list.element.setAttribute('aria-activedescendant', list.idOf(list.activeIndex));
            });
            list.onChosen(e => {
                parts.unfinished = [false, false];
                this.commit(e.item.range(), e.event);
                this.close();
            });
            popup.controls.add(list);
            parts.presetList = list;
        } else if (!presets.length && parts.presetList) {
            popup.controls.remove(parts.presetList);
            parts.presetList = null;
        }
        parts.presetList?.setItems(presets);
    }

    presetsNow(): DateRangePreset[] {
        const given = this.peekProperty<readonly DateRangePreset[] | boolean | undefined>('presets');
        if (!given) {
            return [];
        }
        if (given !== true) {
            return [...given];
        }
        const s = uiLocale.strings;
        const today = () => dayStart(new Date());
        return [
            { text: s.rangeToday, range: () => [today(), today()] },
            { text: s.rangeYesterday, range: () => [addDays(today(), -1), addDays(today(), -1)] },
            { text: s.rangeLast7, range: () => [addDays(today(), -6), today()] },
            { text: s.rangeLast30, range: () => [addDays(today(), -29), today()] },
            { text: s.rangeThisMonth, range: () => [new Date(today().getFullYear(), today().getMonth(), 1), new Date(today().getFullYear(), today().getMonth() + 1, 0)] },
            { text: s.rangeLastMonth, range: () => [new Date(today().getFullYear(), today().getMonth() - 1, 1), new Date(today().getFullYear(), today().getMonth(), 0)] }
        ];
    }

    // Two months stay side by side: when one is paged, the other follows a month apart.
    followMonths(calendar: Calendar, index: number): void {
        const follow = () => {
            const parts = this.rangeParts;
            const other = parts.calendars[index === 0 ? 1 : 0];
            if (!other) return;
            const month = calendar.focusedDate;
            const expected = addMonths(month, index === 0 ? 1 : -1);
            const shown = other.focusedDate;
            if (shown.getFullYear() !== expected.getFullYear() || shown.getMonth() !== expected.getMonth()) other.goTo(expected);
        };
        calendar.element.addEventListener('click', e => {
            if ((e.target as Element).closest('.mx-calendar__nav, .mx-calendar__cell, .mx-calendar__today')) queueMicrotask(follow);
        });
        calendar.element.addEventListener('keydown', () => queueMicrotask(follow));
    }

    // A day picked on a calendar: the start first, then the end (the earlier one the start).
    picked(day: Date, event?: Event): void {
        const parts = this.rangeParts;
        const [start] = this.peekValue();
        const keepTime = (from: Date | null) => (this.peekProperty<DateKind>('type') === 'datetime' && from ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), from.getHours(), from.getMinutes(), from.getSeconds()) : dayStart(day));
        parts.unfinished = [false, false];
        if (parts.stage === 0 || !start) {
            this.commit([keepTime(start), null], event);
            parts.stage = 1;
            return;
        }
        const end = keepTime(this.peekValue()[1]);
        this.commit(dayStart(day) < dayStart(start) ? [dayStart(day), start] : [start, end], event);
        parts.stage = 0;
        if (this.peekProperty<boolean | undefined>('closeOnComplete') !== false) this.close();
    }

    // While the end is being picked, the pointer shows the range it would make.
    pointed(day: Date | null): void {
        const parts = this.rangeParts;
        const [start, end] = this.peekValue();
        if (parts.stage !== 1 || !start) {
            return;
        }
        for (const calendar of parts.calendars) calendar.rangeEnd = day ?? end;
    }

    // The open calendars follow the value and the limits.
    syncPicker(): void {
        const parts = this.rangeParts;
        if (!parts.calendars.length) {
            return;
        }
        const [start, end] = this.peekValue();
        const min = this.peekProperty<Date | null>('min') ?? null;
        const max = this.peekProperty<Date | null>('max') ?? null;
        const disabled = this.peekProperty<((d: Date) => boolean) | null>('disabledDates') ?? null;
        const least = this.peekProperty<number | null>('minDays') ?? null;
        const most = this.peekProperty<number | null>('maxDays') ?? null;
        // Picking the end: only days the span allows.
        const choosing = parts.stage === 1 && start ? start : null;
        const allowed = (d: Date): boolean => {
            if (disabled?.(d)) return false;
            if (!choosing) return true;
            const days = daysBetween(choosing, d);
            return (least === null || days >= least || days <= -least) && (most === null || Math.abs(days) <= most);
        };
        const shown = start ?? min ?? new Date();
        parts.calendars.forEach((calendar, i) => {
            calendar.min = min;
            calendar.max = max;
            calendar.disabledDates = d => !allowed(d);
            calendar.locale = this.peekProperty<string>('locale') ?? '';
            calendar.firstDayOfWeek = this.peekProperty<number | null>('firstDayOfWeek') ?? null;
            calendar.showWeekNumbers = !!this.peekProperty('showWeekNumbers');
            calendar.rangeStart = start;
            calendar.rangeEnd = end;
            if (!parts.popup?.isOpen) calendar.goTo(addMonths(shown, i));
        });
    }
}
