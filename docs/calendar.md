# Calendar

> Editors · @motifx-community/ui 0.1.0-beta.2

A month of days to pick a date from, with a year and a decade view to get far quickly. It is the picker of DateBox, and it works on its own.

## Import

```tsx
import { Calendar } from '@motifx-community/ui';
```

## From JSX and from code

```tsx
import { reactive } from '@motifx/core';
import { Button, Calendar, Stack } from '@motifx-community/ui';

/** A calendar bound with x-model, and calendars created with `new`, added from code and moved to a month. */
export default function FromCode() {
  const form = reactive({ day: new Date() as Date | null, result: '' });
  let host: Stack | null = null;

  const addFromCode = () => {
    const calendar = new Calendar({ locale: 'tr-TR' });
    calendar.onValueChanged((e) => (form.result = e.value ? e.value.toDateString() : '—'));
    host?.controls.add(calendar);
    calendar.goTo(new Date(2027, 0, 1));
  };

  return (
    <>
      <Calendar x-model={() => form.day} showWeekNumbers showTodayButton />
      <output class="cal-day">{() => (form.day ? form.day.toDateString() : '—')}</output>
      <Button text="Add a calendar from code" variant="outline" onclick={addFromCode} />
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

The title zooms out to the months of the year and to twelve years; a choice there zooms back in. `minView` makes a month or a year the choice itself.

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

| Key | What it does |
| --- | --- |
| `Left / Right` | The day before / after (mirrored right to left); a month or a year in the other views. |
| `Up / Down` | The same day a week before / after; four months or years in the other views. |
| `Home / End` | The first / last day of the week; the start / end of the row in the other views. |
| `Page Up / Page Down` | The month before / after; with Shift, the year. A year, a decade in the other views. |
| `Enter, Space` | Choose the day; in the other views, open the month or the year. |

## Accessibility

| Topic | How |
| --- | --- |
| `Pattern` | The APG date picker grid: `role="grid"`, one Tab stop on the focused day, the arrows inside. |
| `Cells` | Each day is named in full ("Sunday, 25 October 2026"); `aria-selected`, `aria-current="date"` for today, `aria-disabled`. |
| `Header` | Weekday names have their full form in `abbr`; the title is a live region, so a new month is read out. |
| `Buttons` | Previous / next are named from `uiLocale` for the view on screen. |

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-calendar` | `data-view="month\|year\|decade"`. |
| `.mx-calendar__header, __previous, __title, __next` | The header. |
| `.mx-calendar__cell` | `aria-selected`, `aria-disabled`, `data-today`, `data-outside`. |
| `calendar.container, header, title, nav, nav-icon, weekday, week, cell, ring, foot, today` | Units: every piece in its states (a cell: `block`, `hover`, `pressed`, `focus`, `outside`, `today`, `selected`, `disabled` …). |
| `calendar.day-size, calendar.view-cell-width-scale, calendar.view-cell-height-scale, calendar.previous-rotate, calendar.next-rotate` | A day's size (the grid is built on it), the zoomed-out views' cells, the arrows' turns. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Bind<Date \| null>` | `null` | The chosen date. `x-model` binds it two-way. |
| `min / max` | `Bind<Date \| null>` | — | Days outside cannot be chosen; the arrows stop there. |
| `disabledDates` | `Bind<(date) => boolean>` | — | Days that cannot be chosen. |
| `locale` | `Bind<string>` | the page's | Month and day names, and where weeks start. |
| `firstDayOfWeek` | `Bind<number \| null>` | the locale’s | 0 Sunday … 6 Saturday. |
| `showWeekNumbers` | `Bind<boolean>` | `false` | ISO week numbers before each week. |
| `showOtherMonths` | `Bind<boolean>` | `true` | Days of the months before and after. |
| `showTodayButton` | `Bind<boolean>` | `false` | A Today button under the grid. |
| `currentView` | `Bind<'month' \| 'year' \| 'decade'>` | `'month'` | The view on screen; the title zooms out, a choice zooms in. |
| `minView` | `Bind<CalendarView>` | `'month'` | The view a choice is made in: `year` picks a month, `decade` a year. |

### Properties, methods, events

| Member | Description |
| --- | --- |
| `focusedDate` | The day with the Tab stop; its month is on screen. |
| `goTo(date)` | Shows the month of a date. |
| `canChoose(date)` | Whether a day can be chosen. |
| `focus()` | Focuses the day with the Tab stop. |
| `onValueChanged(e)` | `{ value, previousValue, byUser, source, event? }`. |
