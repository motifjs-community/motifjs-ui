# DateRangeBox

> Editors · @motifx-community/ui 0.1.0-beta.8

A single field for a start date and an end date. Users can type through two masks, or pick from two side-by-side months and a list of presets, within the allowed dates and range length. The value is a `[start, end]` pair.

## Import

```tsx
import { DateRangeBox, type DateRange } from '@motifx-community/ui';
```

## Declarative and programmatic

```tsx
import { reactive } from '@motifx/core';
import { Button, DateRangeBox, Stack, type DateRange } from '@motifx-community/ui';

const say = (d: Date | null) => (d ? d.toLocaleDateString('en-GB') : '—');

/** A range bound with x-model, and one created programmatically and read through its properties. */
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

`presets` adds ready-made ranges next to the calendars. Use `true` for the built-in presets, or provide your own, each calculated when selected. `calendars={1}` shows a single month.

```tsx
import { reactive } from '@motifx/core';
import { DateRangeBox, Stack, type DateRange, type DateRangePreset } from '@motifx-community/ui';

const day = (offset: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d;
};

// Custom ranges, calculated when selected so that they are relative to today.
const QUARTERS: DateRangePreset[] = [
    { text: 'Next 3 days', range: () => [day(0), day(2)] },
    { text: 'Next week', range: () => [day(1), day(7)] },
    { text: 'Next 90 days', range: () => [day(0), day(89)] }
];

/** The kit's presets beside the calendars, and custom presets. */
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

`min`, `max` and `disabledDates` limit both ends, whether typed or picked. `minDays` and `maxDays` limit the length of the range, and while the end date is being picked, the calendars only offer days within that limit. When a rule fails, the message says which one.

```tsx
import { reactive } from '@motifx/core';
import { Button, DateRangeBox, Stack, type DateRange } from '@motifx-community/ui';

const today = new Date();
const inMonths = (n: number) => new Date(today.getFullYear(), today.getMonth() + n, today.getDate());

/** A stay of one to fourteen nights, within the next six months, never starting on a Sunday. The message identifies the rule that failed. */
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

## Time and other locales

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

## Behavior

| Topic | Details |
| --- | --- |
| `Typing` | Each side is a masked input in the locale's order (`22.11.2006`). A complete, valid date is accepted as soon as it is finished, and a cleared side becomes `null`. Tab moves from the start date to the end date. |
| `Picking` | In the popup, the first pick sets the start and the second sets the end. If the second pick is earlier, it becomes the start. With both dates selected, the next pick starts a new range. While the end is being picked, hovering shows the resulting range. |
| `Two months` | The calendars show the month of the start date and the next month, and they page together. |
| `Presets` | A list next to the calendars. Selecting a preset applies the range and closes the popup. |
| `Keyboard` | Alt+Down opens the popup. Inside it, the calendars handle the arrow keys and Enter selects. Escape closes the popup, and clears the field if `clearButton` is on and the popup is already closed. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Inputs` | Two text inputs named “<label>, Start date” and “<label>, End date” in the kit language. The field label is associated with the start input. |
| `Popup` | A dialog named “Choose date”. The calendars are kit grids, and the presets are a list box. |
| `Messages` | Rule messages use the kit language. Custom rules use your own text. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-date-range-box` | The field. `data-type`. |
| `.mx-date-range-box__start, .mx-date-range-box__end, .mx-date-range-box__separator` | The inputs and the glyph between them. |
| `.mx-date-range-box__toggle, .mx-date-range-box__clear` | Buttons inside the box. |
| `.mx-date-range-box__popup, .mx-date-range-box__calendar, .mx-date-range-box__presets` | The popup, each calendar and the presets. |

### Component tokens

| Token | Description |
| --- | --- |
| `date-range-box.separator, .presets` | Units: the glyph between the inputs (`icon`, `bg`) and the preset list (`focus`, `beside`). |
| `date-range-box.calendar` | Place: a calendar in the popup. |
| `date-range-box.popup-gap` | The gap between the calendars and the presets. |
| `calendar.cell range-start, range-end, range-single, range-in` | The calendar cells in a range: its ends and the days between them, drawn by each design language. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<DateRange>` | `[null, null]` | The `[start, end]` pair, where either value can be `null` until selected. `x-model` provides two-way binding. |
| `type` | `Bind<'date' \| 'datetime'>` | `'date'` | With `datetime`, the time is typed after the date and the calendars preserve it. |
| `min, max, disabledDates` | `Bind<Date \| null>`, `Bind<(d: Date) => boolean>` | — | The dates allowed at both ends, typed or picked. |
| `minDays, maxDays` | `Bind<number \| null>` | `null` | The minimum and maximum length of a range in days, counted from the start. While the end is being picked, the calendars only offer days within this limit. |
| `presets` | `Bind<readonly DateRangePreset[] \| boolean>` | `false` | `true` shows the built-in ranges next to the calendars (today, yesterday, the last 7 and 30 days, this month and last month). Custom presets use `{ text, range: () => DateRange }`. |
| `calendars` | `Bind<1 \| 2>` | `2` | The number of months side by side in the popup. Two months stay one month apart when paging. |
| `closeOnComplete` | `Bind<boolean>` | `true` | Closes the popup once both ends are selected. |
| `locale, displayFormat, firstDayOfWeek, showWeekNumbers, showSeconds` |  |  | These work the same way as in `DateBox`. |
| `startPlaceholder, endPlaceholder` | `Bind<string>` | `''` | Displayed in an empty box. |
| `clearButton, showPickerButton` | `Bind<boolean>` | `false`, `true` | The clear button and the button that opens the calendars. |
| `label, helpText, required, rules, readOnly, size, variant…` |  |  | Field props shared by all editors. |

### Events, properties and methods

| Member | Type | Description |
| --- | --- | --- |
| `startDate, endDate` | `Date \| null` | The start and end as separate properties. |
| `inputPart, endInputPart` | read-only | The start and end inputs. |
| `open(), close(), opened` | `boolean` / `void` | The popup with the calendars, along with `onOpened` and `onClosed`. |
| `clear()` | `void` | Clears both ends. |
| `validate(), validationMessage, isValid` |  | Works the same way as on all fields. Validation covers incomplete dates, dates outside `min`, `max` or `disabledDates`, a start after the end, and ranges shorter than `minDays` or longer than `maxDays`. |
| `onValueChanged` | event | Occurs when the pair changes (`value`, `previousValue`, `byUser`). |

## Feedback

Loading issues…
