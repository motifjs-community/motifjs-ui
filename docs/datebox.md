# DateBox

> Editors · @motifx-community/ui 0.1.0-beta.8

An input for a date, a time or both. Users can type through a mask in the locale's order, or pick from a calendar and a list of times. `min`, `max` and `disabledDates` apply to both methods.

## Import

```tsx
import { DateBox } from '@motifx-community/ui';
```

## Declarative and programmatic

```tsx
import { reactive } from '@motifx/core';
import { Button, DateBox, Stack } from '@motifx-community/ui';

const today = new Date();

/** A date box bound with x-model, and date boxes created with `new`, given a value and added programmatically. */
export default function Programmatic() {
  const order = reactive({ delivery: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3) as Date | null, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addProgrammatic = () => {
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
      <Button text="Add a date box programmatically" variant="outline" onclick={addProgrammatic} />
      <output class="db-made">{() => order.result}</output>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Locales

The mask follows the locale, including the order of day, month and year and the separators. Month and day names in the calendar and the first day of the week also come from the locale.

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

| Key | Description |
| --- | --- |
| `Digits` | Fills in the mask and skips separators. The value changes once the date is complete and valid. |
| `Alt + Down, the button` | Opens the calendar or the list of times, with focus on the selected day. |
| `In the calendar` | Arrow keys, Home, End, Page Up and Page Down (with Shift, a year), and Enter to select. See Calendar. |
| `In the times` | Up, Down, Home, End, Page Up, Page Down and Enter. |
| `Escape` | Closes the picker. With `clearButton` and the picker closed, clears the value. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Field` | A native `<input>` with its label. The format is the mask the user types into. |
| `Button` | `aria-haspopup="dialog"` and `aria-expanded`, named from `uiLocale` ("Choose date" or "Choose time"). |
| `Picker` | A `role="dialog"` containing the calendar grid (see Calendar) and a list of times (`role="listbox"`). |
| `Errors` | A date that does not exist, falls outside `min` and `max`, or is disabled fails validation with a message from `uiLocale`. |

## Localization

Button names and messages come from `uiLocale.strings`. Dates and names come from `locale`.

```tsx
import { reactive } from '@motifx/core';
import { Button, uiLocale } from '@motifx-community/ui';

/** Switches the button names and messages of every date box on the page. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />;
}
```

## Styling

| Hook | Description |
| --- | --- |
| `.mx-date-box` | Added to the field; `data-type="date\|time\|datetime"`. |
| `.mx-date-box__toggle, .mx-date-box__clear` | The picker and clear buttons. |
| `.mx-date-box__popup, .mx-date-box__times` | The picker and its list of times. |
| `date-box.times, date-box.popup-gap, date-box.calendar` | The list of times (a unit: `focus`, `beside`), the space between the field and its popup, and the calendar as it appears in the popup (a place). Everything else comes from `field.*` and `calendar.*`. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<Date \| null>` | `null` | The date. `x-model` provides two-way binding. |
| `type` | `Bind<'date' \| 'time' \| 'datetime'>` | `'date'` | A date, a time of day, or both. |
| `locale` | `Bind<string>` | From the page | Sets the order of the parts (`25.10.2026`, `10/25/2026`), the month and day names, and the first day of the week. |
| `min / max` | `Bind<Date \| null>` | — | Limits for typing and picking, enforced by validation. |
| `disabledDates` | `Bind<(date) => boolean>` | — | Days that cannot be selected, such as weekends. |
| `displayFormat` | `Bind<Intl.DateTimeFormatOptions \| null>` | — | How the value is displayed while the field is not being edited: `{ dateStyle: 'long' }`. |
| `placeholder` | `Bind<string>` | `''` | Displayed when the field is empty and has no focus. |
| `clearButton` | `Bind<boolean>` | `false` | Clears the value. Escape does the same. |
| `showPickerButton` | `Bind<boolean>` | `true` | The button that opens the calendar or the list of times. |
| `timeStep` | `Bind<number>` | `30` | The interval between the times offered, in minutes. |
| `showSeconds` | `Bind<boolean>` | `false` | Includes seconds in the time. |
| `firstDayOfWeek, showWeekNumbers, showTodayButton` | See Calendar |  | Passed to the calendar. |
| `label, helpText, required, rules, readOnly, size, variant, …` | see TextBox |  | Field props shared by all editors. |

### Properties, methods, events

| Member | Description |
| --- | --- |
| `unfinished` | Indicates that the typed text is not yet a complete, valid date. |
| `opened, open(), close()` | The picker. |
| `clear()` | Clears the value. |
| `inputPart` | The native `<input>`. |
| `onValueChanged, onOpened, onClosed, onValidated` | These work the same way as in DropDown and TextBox. |

The date helpers are shared: `datePatternOf(locale, kind)`, `dateToDigits`, `digitsToDate`.

## Feedback

Loading issues…
