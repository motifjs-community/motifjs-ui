# DateRangeBox

> Editors · @motifx-community/ui 0.1.0-beta.3

A start and an end date in one field: typed through two masks, or picked on two months side by side, from ready-made ranges, within the dates and the span allowed. The value is a `[start, end]` pair.

## Import

```tsx
import { DateRangeBox, type DateRange } from '@motifx-community/ui';
```

## Declarative and programmatic

```tsx
import { reactive } from '@motifx/core';
import { Button, DateRangeBox, Stack, type DateRange } from '@motifx-community/ui';

const say = (d: Date | null) => (d ? d.toLocaleDateString('en-GB') : '—');

/** A range bound with x-model, and one made programmatically and read through its properties. */
export default function Programmatic() {
    const s = reactive({ stay: [new Date(2026, 2, 10), new Date(2026, 2, 14)] as DateRange, told: '' });
    const coded = new DateRangeBox({ label: 'Report period', clearButton: true, onValueChanged: e => (s.told = `${say(e.value[0])} to ${say(e.value[1])}`) });

    return (
        <Stack gap="md">
            <Stack orientation="horizontal" wrap align="center">
                <DateRangeBox label="Stay" x-model={() => s.stay} clearButton />
                <output class="dr-stay">{() => `${say(s.stay[0])} to ${say(s.stay[1])}`}</output>
            </Stack>
            <Stack orientation="horizontal" wrap align="center">
                <span onConfig={c => c.controls.add(coded)} />
                <Button text="This week" variant="outline" onclick={() => (coded.value = [new Date(2026, 2, 16), new Date(2026, 2, 22)])} />
                <output class="dr-told">{() => s.told}</output>
            </Stack>
        </Stack>
    );
}
```

## Presets

`presets` puts ready-made ranges beside the calendars: `true` for the kit’s, or your own, each made when it is chosen. `calendars={1}` shows one month.

```tsx
import { reactive } from '@motifx/core';
import { DateRangeBox, Stack, type DateRange, type DateRangePreset } from '@motifx-community/ui';

const day = (offset: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d;
};

// Ranges of our own, made when chosen so they are about today.
const QUARTERS: DateRangePreset[] = [
    { text: 'Next 3 days', range: () => [day(0), day(2)] },
    { text: 'Next week', range: () => [day(1), day(7)] },
    { text: 'Next 90 days', range: () => [day(0), day(89)] }
];

/** The kit's presets beside the calendars, and presets of your own. */
export default function Presets() {
    const s = reactive({ sales: [null, null] as DateRange, plan: [null, null] as DateRange });
    return (
        <Stack orientation="horizontal" wrap align="center">
            <DateRangeBox label="Sales period" presets x-model={() => s.sales} />
            <DateRangeBox label="Planning" presets={QUARTERS} calendars={1} x-model={() => s.plan} />
        </Stack>
    );
}
```

## Limits

`min`, `max` and `disabledDates` bound both ends, typed or picked; `minDays` and `maxDays` bound the span, and the calendars offer only the days within while the end is being picked. A failed rule says which.

```tsx
import { reactive } from '@motifx/core';
import { Button, DateRangeBox, Stack, type DateRange } from '@motifx-community/ui';

const today = new Date();
const inMonths = (n: number) => new Date(today.getFullYear(), today.getMonth() + n, today.getDate());

/** A stay of one to fourteen nights, within the next six months, never starting on a Sunday; the message says which rule failed. */
export default function Limits() {
    const s = reactive({ stay: [null, null] as DateRange, told: '' });
    let box!: DateRangeBox;
    return (
        <Stack orientation="horizontal" wrap align="center">
            <DateRangeBox
                ref={(b: DateRangeBox) => (box = b)}
                label="Stay"
                min={today}
                max={inMonths(6)}
                minDays={1}
                maxDays={14}
                disabledDates={d => d.getDay() === 0}
                required
                x-model={() => s.stay}
            />
            <Button text="Check" variant="outline" onclick={() => void box.validate().then(ok => (s.told = ok ? 'Fine.' : box.validationMessage))} />
            <output class="dr-check">{() => s.told}</output>
        </Stack>
    );
}
```

## With a time, and in another locale

```tsx
import { reactive } from '@motifx/core';
import { DateRangeBox, Stack, type DateRange } from '@motifx-community/ui';

/** Date and time on both ends: the time is typed after the date, the calendars keep it; one box in Turkish. */
export default function DateTime() {
    const s = reactive({ shift: [new Date(2026, 2, 10, 8, 30), new Date(2026, 2, 10, 17, 0)] as DateRange, trip: [null, null] as DateRange });
    return (
        <Stack orientation="horizontal" wrap align="center">
            <DateRangeBox label="Shift" type="datetime" x-model={() => s.shift} displayFormat={{ dateStyle: 'short', timeStyle: 'short' }} />
            <DateRangeBox label="Seyahat" locale="tr-TR" showWeekNumbers x-model={() => s.trip} startPlaceholder="gidiş" endPlaceholder="dönüş" />
        </Stack>
    );
}
```

## Behaviour

| Topic | How |
| --- | --- |
| `Typing` | Each side is a masked input in the locale’s order (`22.11.2006`); a whole, real date is taken as it is finished, an emptied side becomes `null`. Tab moves from the start to the end. |
| `Picking` | On the popup the first pick is the start, the second the end: an earlier second pick becomes the start. With both chosen, the next pick starts a new range. While the end is being picked, the pointer shows the range it would make. |
| `Two months` | The calendars show the start’s month and the next; paging one pages the other with it. |
| `Presets` | A list beside the calendars; a press takes the range and closes. |
| `Keyboard` | Alt+Down opens the popup; in it the calendars take the arrow keys, Enter picks; Escape closes, and clears the field when `clearButton` is on and the popup is closed. |

## Accessibility

| Topic | How |
| --- | --- |
| `Inputs` | Two text boxes named “<label>, Start date” and “<label>, End date” in the kit language; the field’s label marks the start. |
| `Popup` | A dialog named “Choose date”; the calendars are the kit’s grids, the presets a list box. |
| `Messages` | The rules speak in the kit language; a rule of your own in yours. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-date-range-box` | The field. `data-type`. |
| `.mx-date-range-box__start, .mx-date-range-box__end, .mx-date-range-box__separator` | The inputs and the glyph between them. |
| `.mx-date-range-box__toggle, .mx-date-range-box__clear` | The buttons in the box. |
| `.mx-date-range-box__popup, .mx-date-range-box__calendar, .mx-date-range-box__presets` | The popup, each calendar, the presets. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `date-range-box.separator, .presets` | Units: the glyph between the inputs (`icon`, `bg`), the list of presets (`focus`, `beside`). |
| `date-range-box.calendar` | Place: a calendar on the popup. |
| `date-range-box.popup-gap` | Between the calendars and the presets. |
| `calendar.cell range-start, range-end, range-single, range-in` | The calendar’s cells in a range: its ends and the days between, drawn by each language. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<DateRange>` | `[null, null]` | The `[start, end]` pair; either `null` while not chosen. `x-model` binds it two-way. |
| `type` | `Bind<'date' \| 'datetime'>` | `'date'` | With `datetime` the time is typed after the date; the calendars keep it. |
| `min, max, disabledDates` | `Bind<Date \| null>`, `Bind<(d: Date) => boolean>` | — | The dates allowed, on both ends, typed or picked. |
| `minDays, maxDays` | `Bind<number \| null>` | `null` | The least and the most days a range may span, the end counted from the start; while the end is picked the calendars offer only days within. |
| `presets` | `Bind<readonly DateRangePreset[] \| boolean>` | `false` | `true`: the kit’s ready-made ranges beside the calendars (today, yesterday, the last 7 and 30 days, this and last month); your own as `{ text, range: () => DateRange }`. |
| `calendars` | `Bind<1 \| 2>` | `2` | Months side by side on the popup; two stay a month apart as one is paged. |
| `closeOnComplete` | `Bind<boolean>` | `true` | The popup closes once both ends are picked. |
| `locale, displayFormat, firstDayOfWeek, showWeekNumbers, showSeconds` |  |  | As on the `DateBox`. |
| `startPlaceholder, endPlaceholder` | `Bind<string>` | `''` | Shown in an empty box. |
| `clearButton, showPickerButton` | `Bind<boolean>` | `false`, `true` | The clear button; the button that opens the calendars. |
| `label, helpText, required, rules, readOnly, size, variant…` |  |  | The field props, as on every editor. |

### Events, properties and methods

| Member | Kind | Description |
| --- | --- | --- |
| `startDate, endDate` | `Date \| null` | The ends as properties of their own. |
| `inputElement, endInputElement` | read-only | The start’s and the end’s inputs. |
| `open(), close(), opened` | `boolean` / `void` | The popup with the calendars; `onOpened`, `onClosed`. |
| `clear()` | `void` | Empties both ends. |
| `validate(), validationMessage, isValid` |  | As on every field: an unfinished date, a date outside `min`, `max` or `disabledDates`, a start after the end, a span under `minDays` or over `maxDays`. |
| `onValueChanged` | event | The pair changed (`value`, `previousValue`, `byUser`). |
