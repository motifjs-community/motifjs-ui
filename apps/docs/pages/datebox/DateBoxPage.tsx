import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Programmatic from './examples/Programmatic';
import Limits from './examples/Limits';
import Locales from './examples/Locales';
import Localization from './examples/Localization';
import TimeAndDate from './examples/TimeAndDate';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['value', '`Bind<Date | null>`', '`null`', 'The date. `x-model` binds it two-way.'],
  ['type', "`Bind<'date' | 'time' | 'datetime'>`", "`'date'`", 'A day, a time of day, or both.'],
  ['locale', '`Bind<string>`', "From the page", 'The order of the parts (`25.10.2026`, `10/25/2026`), month and day names, where weeks start.'],
  ['min / max', '`Bind<Date | null>`', '—', 'Limits for typing and picking; checked by validation.'],
  ['disabledDates', '`Bind<(date) => boolean>`', '—', 'Days that cannot be chosen, e.g. weekends.'],
  ['displayFormat', '`Bind<Intl.DateTimeFormatOptions | null>`', '—', 'How the value reads while the field is not edited: `{ dateStyle: \'long\' }`.'],
  ['placeholder', '`Bind<string>`', "`''`", 'Shown while empty and not focused.'],
  ['clearButton', '`Bind<boolean>`', '`false`', 'Empties the value; Escape too.'],
  ['showPickerButton', '`Bind<boolean>`', '`true`', 'The button that opens the calendar or the times.'],
  ['timeStep', '`Bind<number>`', '`30`', 'The minutes between the times offered.'],
  ['showSeconds', '`Bind<boolean>`', '`false`', 'Seconds in the time.'],
  ['firstDayOfWeek, showWeekNumbers, showTodayButton', 'see Calendar', '', 'Passed to the calendar.'],
  ['label, helpText, required, rules, readOnly, size, variant, …', 'see TextBox', '', 'Field props shared by all editors.'],
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
  return (
    <>
      <p class="lead">
        <Rich text="A date, a time or both. It is typed in the order of the locale through a mask, or picked from a calendar and a list of times; `min`, `max` and `disabledDates` limit both ways." />
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
          <Rich text="The mask follows the locale: day, month and year in its order, with its separators. Month and day names in the calendar, and the first day of the week, come from it too." />
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
          <Rich text="Button names and messages come from `uiLocale.strings`; dates and names from `locale`." />
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
            ['date-box.times, date-box.popup-gap, date-box.calendar', 'The list of times (a unit: `focus`, `beside`), the space between the field and its popup, and the calendar as it looks in the popup (a place); the rest is `field.*` and `calendar.*`.'],
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
            ['unfinished', 'The text typed is not a whole, real date yet.'],
            ['opened, open(), close()', 'The picker.'],
            ['clear()', 'Clears the value.'],
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
