import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Limits from './examples/Limits';
import Locales from './examples/Locales';
import Localization from './examples/Localization';
import TimeAndDate from './examples/TimeAndDate';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<Date | null>`', '`null`', 'The date. `x-model` provides two-way binding.'],
  ['type', "`Bind<'date' | 'time' | 'datetime'>`", "`'date'`", 'A date, a time of day, or both.'],
  ['locale', '`Bind<string>`', "From the page", 'Sets the order of the parts (`25.10.2026`, `10/25/2026`), the month and day names, and the first day of the week.'],
  ['min / max', '`Bind<Date | null>`', '—', 'Limits for typing and picking, enforced by validation.'],
  ['disabledDates', '`Bind<(date) => boolean>`', '—', 'Days that cannot be selected, such as weekends.'],
  ['displayFormat', '`Bind<Intl.DateTimeFormatOptions | null>`', '—', 'How the value is displayed while the field is not being edited: `{ dateStyle: \'long\' }`.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Displayed when the field is empty and has no focus.'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'Clears the value. Escape does the same.'],
  ['showPickerButton', '`Bind<boolean>`', '`true`', 'The button that opens the calendar or the list of times.'],
  ['timeStep', '`Bind<number>`', '`30`', 'The interval between the times offered, in minutes.'],
  ['showSeconds', '`Bind<boolean>`', '`false`', 'Includes seconds in the time.'],
  ['firstDayOfWeek, showWeekNumbers, showTodayButton', 'See Calendar', '', 'Passed to the calendar.'],
  ['label, helpText, required, rules, readOnly, size, variant, …', 'see TextBox', '', 'Field props shared by all editors.'],
];

const KEYS = [
  ['Digits', 'Fills in the mask and skips separators. The value changes once the date is complete and valid.'],
  ['Alt + Down, the button', 'Opens the calendar or the list of times, with focus on the selected day.'],
  ['In the calendar', 'Arrow keys, Home, End, Page Up and Page Down (with Shift, a year), and Enter to select. See Calendar.'],
  ['In the times', 'Up, Down, Home, End, Page Up, Page Down and Enter.'],
  ['Escape', 'Closes the picker. With `clearButton` and the picker closed, clears the value.'],
];

const A11Y = [
  ['Field', 'A native `<input>` with its label. The format is the mask the user types into.'],
  ['Button', '`aria-haspopup="dialog"` and `aria-expanded`, named from `uiLocale` ("Choose date" or "Choose time").'],
  ['Picker', 'A `role="dialog"` containing the calendar grid (see Calendar) and a list of times (`role="listbox"`).'],
  ['Errors', 'A date that does not exist, falls outside `min` and `max`, or is disabled fails validation with a message from `uiLocale`.'],
];

export default function DateBoxPage() {
  return (
    <>
      <p class="lead">
        <Rich text="An input for a date, a time or both. Users can type through a mask in the locale's order, or pick from a calendar and a list of times. `min`, `max` and `disabledDates` apply to both methods." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { DateBox } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <Example files={code('Programmatic.tsx')}>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="locale" title="Locales">
        <p>
          <Rich text="The mask follows the locale, including the order of day, month and year and the separators. Month and day names in the calendar and the first day of the week also come from the locale." />
        </p>
        <Example files={code('Locales.tsx')}>
          <Locales />
        </Example>
      </Section>

      <Section anchor="types" title="Time and date with time">
        <Example files={code('TimeAndDate.tsx')}>
          <TimeAndDate />
        </Example>
      </Section>

      <Section anchor="limits" title="Limits and validation">
        <Example files={code('Limits.tsx')}>
          <Limits />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Button names and messages come from `uiLocale.strings`. Dates and names come from `locale`." />
        </p>
        <Example files={code('Localization.tsx')}>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['.mx-date-box', 'Added to the field; `data-type="date|time|datetime"`.'],
            ['.mx-date-box__toggle, .mx-date-box__clear', 'The picker and clear buttons.'],
            ['.mx-date-box__popup, .mx-date-box__times', 'The picker and its list of times.'],
            ['date-box.times, date-box.popup-gap, date-box.calendar', 'The list of times (a unit: `focus`, `beside`), the space between the field and its popup, and the calendar as it appears in the popup (a place). Everything else comes from `field.*` and `calendar.*`.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Properties, methods, events" />
        </h3>
        <ApiTable
          head={['Member', 'Description']}
          rows={[
            ['unfinished', 'Indicates that the typed text is not yet a complete, valid date.'],
            ['opened, open(), close()', 'The picker.'],
            ['clear()', 'Clears the value.'],
            ['inputPart', 'The native `<input>`.'],
            ['onValueChanged, onOpened, onClosed, onValidated', 'These work the same way as in DropDown and TextBox.'],
          ]}
        />
        <p>
          <Rich text="The date helpers are shared: `datePatternOf(locale, kind)`, `dateToDigits`, `digitsToDate`." />
        </p>
      </Section>
    </>
  );
}
