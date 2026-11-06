import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import DateTime from './examples/DateTime';
import Programmatic from './examples/Programmatic';
import Limits from './examples/Limits';
import Presets from './examples/Presets';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
    ['value', '`Bind<DateRange>`', '`[null, null]`', 'The `[start, end]` pair; either `null` while not chosen. `x-model` binds it two-way.'],
    ['type', "`Bind<'date' | 'datetime'>`", "`'date'`", 'With `datetime` the time is typed after the date; the calendars keep it.'],
    ['min, max, disabledDates', '`Bind<Date | null>`, `Bind<(d: Date) => boolean>`', '—', 'The dates allowed, on both ends, typed or picked.'],
    ['minDays, maxDays', '`Bind<number | null>`', '`null`', 'The least and the most days a range may span, the end counted from the start; while the end is picked the calendars offer only days within.'],
    ['presets', '`Bind<readonly DateRangePreset[] | boolean>`', '`false`', '`true`: the kit’s ready-made ranges beside the calendars (today, yesterday, the last 7 and 30 days, this and last month); your own as `{ text, range: () => DateRange }`.'],
    ['calendars', '`Bind<1 | 2>`', '`2`', 'Months side by side on the popup; two stay a month apart as one is paged.'],
    ['closeOnComplete', '`Bind<boolean>`', '`true`', 'The popup closes once both ends are picked.'],
    ['locale, displayFormat, firstDayOfWeek, showWeekNumbers, showSeconds', '', '', 'As on the `DateBox`.'],
    ['startPlaceholder, endPlaceholder', '`Bind<string>`', "`''`", 'Shown in an empty box.'],
    ['clearButton, showPickerButton', '`Bind<boolean>`', '`false`, `true`', 'The clear button; the button that opens the calendars.'],
    ['label, helpText, required, rules, readOnly, size, variant…', '', '', 'Field props shared by all editors.']
];

const MEMBERS = [
    ['startDate, endDate', '`Date | null`', 'The ends as properties of their own.'],
    ['inputElement, endInputElement', 'read-only', 'The start’s and the end’s inputs.'],
    ['open(), close(), opened', '`boolean` / `void`', 'The popup with the calendars; `onOpened`, `onClosed`.'],
    ['clear()', '`void`', 'Empties both ends.'],
    ['validate(), validationMessage, isValid', '', 'As on every field: an unfinished date, a date outside `min`, `max` or `disabledDates`, a start after the end, a span under `minDays` or over `maxDays`.'],
    ['onValueChanged', 'event', 'The pair changed (`value`, `previousValue`, `byUser`).']
];

const BEHAVIOUR = [
    ['Typing', 'Each side is a masked input in the locale’s order (`22.11.2006`); a whole, real date is taken as it is finished, an emptied side becomes `null`. Tab moves from the start to the end.'],
    ['Picking', 'On the popup the first pick is the start, the second the end: an earlier second pick becomes the start. With both chosen, the next pick starts a new range. While the end is being picked, the pointer shows the range it would make.'],
    ['Two months', 'The calendars show the start’s month and the next; paging one pages the other with it.'],
    ['Presets', 'A list beside the calendars; a press takes the range and closes.'],
    ['Keyboard', 'Alt+Down opens the popup; in it the calendars take the arrow keys, Enter picks; Escape closes, and clears the field when `clearButton` is on and the popup is closed.']
];

const A11Y = [
    ['Inputs', 'Two text boxes named “<label>, Start date” and “<label>, End date” in the kit language; the field’s label marks the start.'],
    ['Popup', 'A dialog named “Choose date”; the calendars are the kit’s grids, the presets a list box.'],
    ['Messages', 'The rules speak in the kit language; a rule of your own in yours.']
];

const HOOKS = [
    ['.mx-date-range-box', 'The field. `data-type`.'],
    ['.mx-date-range-box__start, .mx-date-range-box__end, .mx-date-range-box__separator', 'The inputs and the glyph between them.'],
    ['.mx-date-range-box__toggle, .mx-date-range-box__clear', 'Buttons inside the box.'],
    ['.mx-date-range-box__popup, .mx-date-range-box__calendar, .mx-date-range-box__presets', 'The popup, each calendar, the presets.']
];

const TOKENS = [
    ['date-range-box.separator, .presets', 'Units: the glyph between the inputs (`icon`, `bg`), the list of presets (`focus`, `beside`).'],
    ['date-range-box.calendar', 'Place: a calendar on the popup.'],
    ['date-range-box.popup-gap', 'Between the calendars and the presets.'],
    ['calendar.cell range-start, range-end, range-single, range-in', 'The calendar’s cells in a range: its ends and the days between, drawn by each language.']
];

export default function DateRangeBoxPage() {
    return (
        <>
            <p class="lead">
              <Rich text="A start and an end date in one field: typed through two masks, or picked on two months side by side, from ready-made ranges, within the dates and the span allowed. The value is a `[start, end]` pair." />
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
                    <Rich text="`presets` puts ready-made ranges beside the calendars: `true` for the kit’s, or your own, each made when it is chosen. `calendars={1}` shows one month." />
                </p>
                <Example files={code('Presets.tsx')}>
                    <Presets />
                </Example>
            </Section>

            <Section anchor="limits" title="Limits">
                <p>
                    <Rich text="`min`, `max` and `disabledDates` bound both ends, typed or picked; `minDays` and `maxDays` bound the span, and the calendars offer only the days within while the end is being picked. A failed rule says which." />
                </p>
                <Example files={code('Limits.tsx')}>
                    <Limits />
                </Example>
            </Section>

            <Section anchor="datetime" title="With a time, and in another locale">
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
