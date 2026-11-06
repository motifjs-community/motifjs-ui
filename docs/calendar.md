# Calendar

> Editors · @motifx-community/ui 0.1.0-beta.5

A month view for selecting a date, with year and decade views for quick navigation. It serves as the DateBox picker and can also be used on its own.

## Import

```tsx
import { Calendar } from '@motifx-community/ui';
```

## Declarative and programmatic

```tsx
import { reactive } from '@motifx/core';
import { Button, Calendar, Stack } from '@motifx-community/ui';

/** A calendar bound with x-model, and calendars created with `new`, added programmatically and moved to a month. */
export default function Programmatic() {
  const form = reactive({ day: new Date() as Date | null, result: '' });
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const calendar = new Calendar({ locale: 'tr-TR' });
    calendar.onValueChanged((e) => (form.result = e.value ? e.value.toDateString() : '—'));
    host?.controls.add(calendar);
    calendar.goTo(new Date(2027, 0, 1));
  };

  return (
    <>
      <Calendar x-model={() => form.day} showWeekNumbers showTodayButton />
      <output class="cal-day">{() => (form.day ? form.day.toDateString() : '—')}</output>
      <Button text="Add a calendar programmatically" variant="outline" onclick={addProgrammatic} />
      <output class="cal-made">{() => form.result}</output>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
```

## Limits

```tsx
import { Calendar } from '@motifx-community/ui';

/** No day before today and no Sunday, in Turkish. */
export default function Limits() {
  return <Calendar min={new Date()} disabledDates={(d: Date) => d.getDay() === 0} locale="tr-TR" />;
}
```

## Views

Clicking the title zooms out to the months of the year and then to twelve years, and making a selection zooms back in. `minView` makes a month or a year the final selection.

```tsx
import { reactive } from '@motifx/core';
import { Button, Calendar, Stack, type CalendarView } from '@motifx-community/ui';

const views: CalendarView[] = ['month', 'year', 'decade'];

/** The view set from state, and a calendar whose choice is a month. */
export default function Views() {
  const s = reactive({ view: 'month' as CalendarView, month: null as Date | null });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="View">
        {views.map((view) => (
          <Button key={view} text={view} size="sm" variant={() => (s.view === view ? 'solid' : 'ghost')} aria-pressed={() => s.view === view} onclick={() => (s.view = view)} />
        ))}
      </Stack>
      <Calendar currentView={() => s.view} />
      <Calendar minView="year" x-model={() => s.month} />
      <output>{() => (s.month ? s.month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '—')}</output>
    </>
  );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Left / Right` | Moves to the previous or next day, mirrored on right-to-left pages. In the other views, moves by month or year. |
| `Up / Down` | Moves to the same day one week earlier or later. In the other views, moves by four months or years. |
| `Home / End` | Moves to the first or last day of the week. In the other views, moves to the start or end of the row. |
| `Page Up / Page Down` | Moves to the previous or next month, or by a year with Shift. In the other views, moves by a year or a decade. |
| `Enter, Space` | Selects the day. In the other views, opens the month or year. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Pattern` | The APG date picker grid: `role="grid"`, one Tab stop on the focused day, and arrow keys inside. |
| `Cells` | Each day has a full name ("Sunday, 25 October 2026"), with `aria-selected`, `aria-current="date"` for today and `aria-disabled`. |
| `Header` | Weekday names carry their full form in `abbr`. The title is a live region, so a new month is announced. |
| `Buttons` | The previous and next buttons get names from `uiLocale` for the current view. |

## Styling

| Hook | Description |
| --- | --- |
| `.mx-calendar` | `data-view="month\|year\|decade"`. |
| `.mx-calendar__header, __previous, __title, __next` | The header. |
| `.mx-calendar__cell` | `aria-selected`, `aria-disabled`, `data-today`, `data-outside`. |
| `calendar.container, header, title, nav, nav-icon, weekday, week, cell, ring, foot, today` | Units: every part in each state (for a cell: `block`, `hover`, `pressed`, `focus`, `outside`, `today`, `selected`, `disabled` …). |
| `calendar.day-size, calendar.view-cell-width-scale, calendar.view-cell-height-scale, calendar.previous-rotate, calendar.next-rotate` | The size of a day, which the grid is built on, the cells of the zoomed-out views, and the arrow rotation. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<Date \| null>` | `null` | The selected date. `x-model` provides two-way binding. |
| `min / max` | `Bind<Date \| null>` | — | Days outside these limits cannot be selected, and the arrow keys stop there. |
| `disabledDates` | `Bind<(date) => boolean>` | — | Days that cannot be selected. |
| `locale` | `Bind<string>` | From the page | Sets the month and day names and the first day of the week. |
| `firstDayOfWeek` | `Bind<number \| null>` | From the locale | 0 (Sunday) through 6 (Saturday). |
| `showWeekNumbers` | `Bind<boolean>` | `false` | Shows ISO week numbers before each week. |
| `showOtherMonths` | `Bind<boolean>` | `true` | Shows days from the previous and next months. |
| `showTodayButton` | `Bind<boolean>` | `false` | Shows a Today button below the grid. |
| `currentView` | `Bind<'month' \| 'year' \| 'decade'>` | `'month'` | The current view. The title zooms out, and a selection zooms in. |
| `minView` | `Bind<CalendarView>` | `'month'` | The view a selection is made in: `year` selects a month, and `decade` selects a year. |

### Properties, methods, events

| Member | Description |
| --- | --- |
| `focusedDate` | The day with the Tab stop, whose month is on screen. |
| `goTo(date)` | Shows the month of a date. |
| `canChoose(date)` | Indicates whether a day can be selected. |
| `focus()` | Sets focus on the day with the Tab stop. |
| `onValueChanged(e)` | `{ value, previousValue, byUser, source, event? }`. |

## Feedback

Loading issues…
