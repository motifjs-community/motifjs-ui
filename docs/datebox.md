# DateBox

> Editors · @motifx-community/ui 0.1.0-beta.0

A date, a time or both. It is typed in the order of the locale through a mask, or picked from a calendar and a list of times; `min`, `max` and `disabledDates` limit both ways.

## Import

```tsx
import { DateBox } from '@motifx-community/ui';
```

## From JSX and from code

```tsx
import { reactive } from '@motifx/core';
import { Button, DateBox, Stack } from '@motifx-community/ui';

const today = new Date();

/** A date box bound with x-model, and date boxes created with `new`, given a value and added from code. */
export default function FromCode() {
  const order = reactive({ delivery: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3) as Date | null, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const due = new DateBox({ label: `Due ${++added}`, locale: 'tr-TR', clearButton: true });
    due.value = new Date(2026, 9, 25);
    due.onValueChanged((e) => (order.result = `${due.label}: ${e.value ? e.value.toDateString() : '—'}`));
    host?.controls.add(due);
    due.focus();
  };

  return (
    <>
      <DateBox label="&Delivery" x-model={() => order.delivery} clearButton />
      <output class="db-day">{() => (order.delivery ? order.delivery.toDateString() : '—')}</output>
      <Button text="Add a date box from code" variant="outline" onclick={addFromCode} />
      <output class="db-made">{() => order.result}</output>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Locales

The mask follows the locale: day, month and year in its order, with its separators. Month and day names in the calendar, and the first day of the week, come from it too.

```tsx
import { reactive } from '@motifx/core';
import { DateBox } from '@motifx-community/ui';

/** One date in three locales: each types and shows it in its own order and separators. */
export default function Locales() {
  const s = reactive({ trip: null as Date | null });
  return (
    <>
      <DateBox label="Türkçe" locale="tr-TR" x-model={() => s.trip} />
      <DateBox label="English (US)" locale="en-US" x-model={() => s.trip} />
      <DateBox label="日本語" locale="ja-JP" x-model={() => s.trip} />
    </>
  );
}
```

## Time and date with time

```tsx
import { reactive } from '@motifx/core';
import { DateBox } from '@motifx-community/ui';

/** A date with a time in steps of 15 minutes, and a time alone. */
export default function TimeAndDate() {
  const s = reactive({ meeting: null as Date | null, alarm: null as Date | null });
  return (
    <>
      <DateBox label="Meeting" type="datetime" timeStep={15} displayFormat={{ dateStyle: 'medium', timeStyle: 'short' }} x-model={() => s.meeting} stretch />
      <DateBox label="Alarm" type="time" x-model={() => s.alarm} />
    </>
  );
}
```

## Limits and validation

```tsx
import { reactive } from '@motifx/core';
import { Button, DateBox, ValidationGroup } from '@motifx-community/ui';

const today = new Date();
const inDays = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

/** A required weekday in the next 60 days: `min`, `max` and `disabledDates` limit typing and picking, a group checks it. */
export default function Limits() {
  const s = reactive({ result: '' });
  const group = new ValidationGroup();

  const check = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Booked.' : 'Pick a weekday in the next 60 days.';
  };

  return (
    <>
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
      <Button text="Check" variant="outline" onclick={check} />
      <output class="db-check">{() => s.result}</output>
    </>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Digits` | Fill the mask; the separators are skipped. The value changes once the date is whole and real. |
| `Alt + Down, the button` | Open the calendar (or the times); focus goes to the chosen day. |
| `In the calendar` | Arrows, Home, End, Page Up / Down (with Shift: a year), Enter to choose — see Calendar. |
| `In the times` | Up, Down, Home, End, Page Up / Down, Enter. |
| `Escape` | Close the picker; with `clearButton` and the picker closed, empty the value. |

## Accessibility

| Topic | How |
| --- | --- |
| `Field` | A native `<input>` with its label; the format is the mask the user types into. |
| `Button` | `aria-haspopup="dialog"`, `aria-expanded`, named from `uiLocale` ("Choose date" / "Choose time"). |
| `Picker` | A `role="dialog"` with the calendar grid (see Calendar) and a list of times (`role="listbox"`). |
| `Errors` | A date that does not exist, outside `min` / `max` or disabled fails validation with a message from `uiLocale`. |

## Localization

Button names and messages come from `uiLocale.strings`; dates and names from `locale`.

```tsx
import { reactive } from '@motifx/core';
import { Button, enStrings, trStrings, uiLocale } from '@motifx-community/ui';

/** Switches the button names and messages of every date box on the page. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
  };
  return <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />;
}
```

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-date-box` | Added to the field; `data-type="date\|time\|datetime"`. |
| `.mx-date-box__toggle, .mx-date-box__clear` | The picker and clear buttons. |
| `.mx-date-box__popup, .mx-date-box__times` | The picker and its list of times. |
| `date-box.times, date-box.popup-gap, date-box.calendar` | The list of times (a unit: `focus`, `beside`), the space between the field and its popup, and the calendar as it looks in the popup (a place); the rest is `field.*` and `calendar.*`. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<Date \| null>` | `null` | The date. `x-model` binds it two-way. |
| `type` | `Bind<'date' \| 'time' \| 'datetime'>` | `'date'` | A day, a time of day, or both. |
| `locale` | `Bind<string>` | the page's | The order of the parts (`25.10.2026`, `10/25/2026`), month and day names, where weeks start. |
| `min / max` | `Bind<Date \| null>` | — | Limits for typing and picking; checked by validation. |
| `disabledDates` | `Bind<(date) => boolean>` | — | Days that cannot be chosen, e.g. weekends. |
| `displayFormat` | `Bind<Intl.DateTimeFormatOptions \| null>` | — | How the value reads while the field is not edited: `{ dateStyle: 'long' }`. |
| `placeholder` | `Bind<string>` | `''` | Shown while empty and not focused. |
| `clearButton` | `Bind<boolean>` | `false` | Empties the value; Escape too. |
| `showPickerButton` | `Bind<boolean>` | `true` | The button that opens the calendar or the times. |
| `timeStep` | `Bind<number>` | `30` | The minutes between the times offered. |
| `showSeconds` | `Bind<boolean>` | `false` | Seconds in the time. |
| `firstDayOfWeek, showWeekNumbers, showTodayButton` | see Calendar |  | Passed to the calendar. |
| `label, helpText, required, rules, readOnly, size, variant, …` | see TextBox |  | The field props every editor has. |

### Properties, methods, events

| Member | Description |
| --- | --- |
| `unfinished` | The text typed is not a whole, real date yet. |
| `opened, open(), close()` | The picker. |
| `clear()` | Empties the value. |
| `inputElement` | The native `<input>`. |
| `onValueChanged, onOpened, onClosed, onValidated` | As for DropDown and TextBox. |

The date helpers are shared: `datePatternOf(locale, kind)`, `dateToDigits`, `digitsToDate`.
