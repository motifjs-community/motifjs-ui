import { reactive } from '@motifx/core';
import { Button, DateBox, ValidationGroup, enStrings, trStrings, uiLocale } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

const today = new Date();
const inDays = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

const PROPS = [
  ['value', '`Bind<Date | null>`', '`null`', 'The date. `x-model` binds it two-way.'],
  ['type', "`Bind<'date' | 'time' | 'datetime'>`", "`'date'`", 'A day, a time of day, or both.'],
  ['locale', '`Bind<string>`', "the page's", 'The order of the parts (`25.10.2026`, `10/25/2026`), month and day names, where weeks start.'],
  ['min / max', '`Bind<Date | null>`', '—', 'Limits for typing and picking; checked by validation.'],
  ['disabledDates', '`Bind<(date) => boolean>`', '—', 'Days that cannot be chosen, e.g. weekends.'],
  ['displayFormat', '`Bind<Intl.DateTimeFormatOptions | null>`', '—', 'How the value reads while the field is not edited: `{ dateStyle: \'long\' }`.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Shown while empty and not focused.'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'Empties the value; Escape too.'],
  ['showPickerButton', '`Bind<boolean>`', '`true`', 'The button that opens the calendar or the times.'],
  ['timeStep', '`Bind<number>`', '`30`', 'The minutes between the times offered.'],
  ['showSeconds', '`Bind<boolean>`', '`false`', 'Seconds in the time.'],
  ['firstDayOfWeek, showWeekNumbers, showTodayButton', 'see Calendar', '', 'Passed to the calendar.'],
  ['label, helpText, required, rules, readOnly, size, variant, …', 'see TextBox', '', 'The field props every editor has.'],
];

const KEYS = [
  ['Digits', 'Fill the mask; the separators are skipped. The value changes once the date is whole and real.'],
  ['Alt + Down, the button', 'Open the calendar (or the times); focus goes to the chosen day.'],
  ['In the calendar', 'Arrows, Home, End, Page Up / Down (with Shift: a year), Enter to choose — see Calendar.'],
  ['In the times', 'Up, Down, Home, End, Page Up / Down, Enter.'],
  ['Escape', 'Close the picker; with `clearButton` and the picker closed, empty the value.'],
];

const A11Y = [
  ['Field', 'A native `<input>` with its label; the format is the mask the user types into.'],
  ['Button', '`aria-haspopup="dialog"`, `aria-expanded`, named from `uiLocale` ("Choose date" / "Choose time").'],
  ['Picker', 'A `role="dialog"` with the calendar grid (see Calendar) and a list of times (`role="listbox"`).'],
  ['Errors', 'A date that does not exist, outside `min` / `max` or disabled fails validation with a message from `uiLocale`.'],
];

export default function DateBoxPage() {
  const s = reactive({
    day: inDays(3) as Date | null,
    meeting: null as Date | null,
    alarm: null as Date | null,
    trip: null as Date | null,
    lang: 'en',
    result: '',
  });
  const group = new ValidationGroup();

  return (
    <>
      <p class="lead">
        A date, a time or both. It is typed in the order of the locale through a mask, or picked from a calendar and a
        list of times; <code>min</code>, <code>max</code> and <code>disabledDates</code> limit both ways.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { DateBox } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <Example
          code={`
<DateBox label="&Delivery" x-model={() => this.order.delivery} />

const due = new DateBox({ label: 'Due', locale: 'tr-TR', clearButton: true });
due.value = new Date(2026, 9, 25);
this.panel.controls.add(due);
`}
        >
          <DateBox label="&Delivery" x-model={() => s.day} clearButton />
          <output class="db-day">{() => (s.day ? s.day.toDateString() : '—')}</output>
        </Example>
      </Section>

      <Section anchor="locale" title="Locales">
        <p>
          <Rich text="The mask follows the locale: day, month and year in its order, with its separators. Month and day names in the calendar, and the first day of the week, come from it too." />
        </p>
        <Example
          code={`
<DateBox label="Türkçe" locale="tr-TR" />
<DateBox label="English (US)" locale="en-US" />
<DateBox label="日本語" locale="ja-JP" />
`}
        >
          <DateBox label="Türkçe" locale="tr-TR" x-model={() => s.trip} />
          <DateBox label="English (US)" locale="en-US" x-model={() => s.trip} />
          <DateBox label="日本語" locale="ja-JP" x-model={() => s.trip} />
        </Example>
      </Section>

      <Section anchor="types" title="Time and date with time">
        <Example
          code={`
<DateBox label="Meeting" type="datetime" timeStep={15} displayFormat={{ dateStyle: 'medium', timeStyle: 'short' }} />
<DateBox label="Alarm" type="time" />
`}
        >
          <DateBox label="Meeting" type="datetime" timeStep={15} displayFormat={{ dateStyle: 'medium', timeStyle: 'short' }} x-model={() => s.meeting} stretch />
          <DateBox label="Alarm" type="time" x-model={() => s.alarm} />
        </Example>
      </Section>

      <Section anchor="limits" title="Limits and validation">
        <Example
          code={`
<DateBox
  label="Appointment"
  required
  min={new Date()}
  max={inDays(60)}
  disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
  validationGroup={group}
/>
`}
        >
          <DateBox
            label="Appointment"
            required
            min={today}
            max={inDays(60)}
            disabledDates={(d: Date) => d.getDay() === 0 || d.getDay() === 6}
            helpText="A weekday in the next 60 days."
            validationGroup={group}
            showTodayButton
          />
          <Button
            text="Check"
            variant="outline"
            onclick={async () => {
              const result = await group.validate();
              s.result = result.valid ? 'Booked.' : 'Pick a weekday in the next 60 days.';
            }}
          />
          <output class="db-check">{() => s.result}</output>
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Button names and messages come from `uiLocale.strings`; dates and names from `locale`." />
        </p>
        <Example
          code={`
uiLocale.strings = trStrings;
`}
        >
          <Button
            text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')}
            variant="outline"
            onclick={() => {
              s.lang = s.lang === 'en' ? 'tr' : 'en';
              uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
            }}
          />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'What it is']}
          rows={[
            ['.mx-date-box', 'Added to the field; `data-type="date|time|datetime"`.'],
            ['.mx-date-box__toggle, .mx-date-box__clear', 'The picker and clear buttons.'],
            ['.mx-date-box__popup, .mx-date-box__times', 'The picker and its list of times.'],
            ['date-box.times-width, date-box.times-height', 'Component tokens of the list of times; the rest is `field.*` and `calendar.*`.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties, methods, events</h3>
        <ApiTable
          head={['Member', 'Description']}
          rows={[
            ['unfinished', 'The text typed is not a whole, real date yet.'],
            ['opened, open(), close()', 'The picker.'],
            ['clear()', 'Empties the value.'],
            ['inputElement', 'The native `<input>`.'],
            ['onValueChanged, onOpened, onClosed, onValidated', 'As for DropDown and TextBox.'],
          ]}
        />
        <p>
          <Rich text="The date helpers are shared: `datePatternOf(locale, kind)`, `dateToDigits`, `digitsToDate`." />
        </p>
      </Section>
    </>
  );
}
