import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import DateTime from './examples/DateTime';
import Programmatic from './examples/Programmatic';
import Limits from './examples/Limits';
import Presets from './examples/Presets';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['value', '`Bind<DateRange>`', '`[null, null]`', 'The `[start, end]` pair, where either value can be `null` until selected. `x-model` provides two-way binding.'],
    ['type', "`Bind<'date' | 'datetime'>`", "`'date'`", 'With `datetime`, the time is typed after the date and the calendars preserve it.'],
    ['min, max, disabledDates', '`Bind<Date | null>`, `Bind<(d: Date) => boolean>`', '—', 'The dates allowed at both ends, typed or picked.'],
    ['minDays, maxDays', '`Bind<number | null>`', '`null`', 'The minimum and maximum length of a range in days, counted from the start. While the end is being picked, the calendars only offer days within this limit.'],
    ['presets', '`Bind<readonly DateRangePreset[] | boolean>`', '`false`', '`true` shows the built-in ranges next to the calendars (today, yesterday, the last 7 and 30 days, this month and last month). Custom presets use `{ text, range: () => DateRange }`.'],
    ['calendars', '`Bind<1 | 2>`', '`2`', 'The number of months side by side in the popup. Two months stay one month apart when paging.'],
    ['closeOnComplete', '`Bind<boolean>`', '`true`', 'Closes the popup once both ends are selected.'],
    ['locale, displayFormat, firstDayOfWeek, showWeekNumbers, showSeconds', '', '', 'These work the same way as in `DateBox`.'],
    ['startPlaceholder, endPlaceholder', '`Bind<string>`', "`''`", 'Displayed in an empty box.'],
    ['clearButton, showPickerButton', '`Bind<boolean>`', '`false`, `true`', 'The clear button and the button that opens the calendars.'],
    ['label, helpText, required, rules, readOnly, size, variant…', '', '', 'Field props shared by all editors.']
];

const MEMBERS = [
    ['startDate, endDate', '`Date | null`', 'The start and end as separate properties.'],
    ['inputElement, endInputElement', 'read-only', 'The start and end inputs.'],
    ['open(), close(), opened', '`boolean` / `void`', 'The popup with the calendars, along with `onOpened` and `onClosed`.'],
    ['clear()', '`void`', 'Clears both ends.'],
    ['validate(), validationMessage, isValid', '', 'Works the same way as on all fields. Validation covers incomplete dates, dates outside `min`, `max` or `disabledDates`, a start after the end, and ranges shorter than `minDays` or longer than `maxDays`.'],
    ['onValueChanged', 'event', 'Occurs when the pair changes (`value`, `previousValue`, `byUser`).']
];

const BEHAVIOUR = [
    ['Typing', 'Each side is a masked input in the locale\'s order (`22.11.2006`). A complete, valid date is accepted as soon as it is finished, and a cleared side becomes `null`. Tab moves from the start date to the end date.'],
    ['Picking', 'In the popup, the first pick sets the start and the second sets the end. If the second pick is earlier, it becomes the start. With both dates selected, the next pick starts a new range. While the end is being picked, hovering shows the resulting range.'],
    ['Two months', 'The calendars show the month of the start date and the next month, and they page together.'],
    ['Presets', 'A list next to the calendars. Selecting a preset applies the range and closes the popup.'],
    ['Keyboard', 'Alt+Down opens the popup. Inside it, the calendars handle the arrow keys and Enter selects. Escape closes the popup, and clears the field if `clearButton` is on and the popup is already closed.']
];

const A11Y = [
    ['Inputs', 'Two text inputs named “<label>, Start date” and “<label>, End date” in the kit language. The field label is associated with the start input.'],
    ['Popup', 'A dialog named “Choose date”. The calendars are kit grids, and the presets are a list box.'],
    ['Messages', 'Rule messages use the kit language. Custom rules use your own text.']
];

const HOOKS = [
    ['.mx-date-range-box', 'The field. `data-type`.'],
    ['.mx-date-range-box__start, .mx-date-range-box__end, .mx-date-range-box__separator', 'The inputs and the glyph between them.'],
    ['.mx-date-range-box__toggle, .mx-date-range-box__clear', 'Buttons inside the box.'],
    ['.mx-date-range-box__popup, .mx-date-range-box__calendar, .mx-date-range-box__presets', 'The popup, each calendar and the presets.']
];

const TOKENS = [
    ['date-range-box.separator, .presets', 'Units: the glyph between the inputs (`icon`, `bg`) and the preset list (`focus`, `beside`).'],
    ['date-range-box.calendar', 'Place: a calendar in the popup.'],
    ['date-range-box.popup-gap', 'The gap between the calendars and the presets.'],
    ['calendar.cell range-start, range-end, range-single, range-in', 'The calendar cells in a range: its ends and the days between them, drawn by each design language.']
];

export default function DateRangeBoxPage() {
    return (
        <>
            <p class="lead">
              <Rich text="A single field for a start date and an end date. Users can type through two masks, or pick from two side-by-side months and a list of presets, within the allowed dates and range length. The value is a `[start, end]` pair." />
            </p>

            <Section anchor="import" title="Import">
                <Code
                    code={`
import { DateRangeBox, type DateRange } from '@motifx-community/ui';
`}
                />
            </Section>

            <Section anchor="ways" title="Declarative and programmatic">
                <Example files={code('Programmatic.tsx')}>
                    <Programmatic />
                </Example>
            </Section>

            <Section anchor="presets" title="Presets">
                <p>
                    <Rich text="`presets` adds ready-made ranges next to the calendars. Use `true` for the built-in presets, or provide your own, each calculated when selected. `calendars={1}` shows a single month." />
                </p>
                <Example files={code('Presets.tsx')}>
                    <Presets />
                </Example>
            </Section>

            <Section anchor="limits" title="Limits">
                <p>
                    <Rich text="`min`, `max` and `disabledDates` limit both ends, whether typed or picked. `minDays` and `maxDays` limit the length of the range, and while the end date is being picked, the calendars only offer days within that limit. When a rule fails, the message says which one." />
                </p>
                <Example files={code('Limits.tsx')}>
                    <Limits />
                </Example>
            </Section>

            <Section anchor="datetime" title="Time and other locales">
                <Example files={code('DateTime.tsx')}>
                    <DateTime />
                </Example>
            </Section>

            <Section anchor="behaviour" title="Behavior">
                <ApiTable head={['Topic', 'Details']} rows={BEHAVIOUR} />
            </Section>

            <Section anchor="a11y" title="Accessibility">
                <ApiTable head={['Topic', 'Details']} rows={A11Y} />
            </Section>

            <Section anchor="styling" title="Styling">
                <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
                <h3>
                  <Rich text="Component tokens" />
                </h3>
                <ApiTable head={['Token', 'Description']} rows={TOKENS} />
            </Section>

            <Section anchor="api" title="API reference">
                <h3>
                  <Rich text="Props" />
                </h3>
                <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
                <h3>
                  <Rich text="Events, properties and methods" />
                </h3>
                <ApiTable head={['Member', 'Type', 'Description']} rows={MEMBERS} />
            </Section>
        </>
    );
}
