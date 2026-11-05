# Scheduler: Tablet and phone

> Scheduler · @motifx-community/ui 0.1.0-beta.2

On a tablet and a phone the scheduler keeps its appointments, views and date and shows them another way: a phone gets the agenda, a compact bar and sheets from the bottom; a finger lifts, resizes, swipes and pinches.

## Import

```tsx
import { Scheduler, type SchedulerPresentation } from '@motifx-community/ui';
```

## Three ways to show one scheduler

| Presentation | What shows |
| --- | --- |
| `Desktop` | As it is: the bar with Today, the steps, the date and a button per view; the tooltip next to the appointment, the form in a window. |
| `Tablet` | As on a desktop, its view kept (a week, as tablet calendars open); on a touch screen everything a finger taps is larger. |
| `Phone` | The agenda (a day when the views have no agenda). The bar holds Today as an icon, the month (opening the calendar) and one menu of the views; a swipe moves between days. The tooltip is an action sheet, the form a sheet from the bottom. A narrower ruler, resource column and time column, so a week still fits the screen; every view works. |

```tsx
import { reactive } from '@motifx/core';

export interface Meeting {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
}

/** A week of appointments around today, so the examples always show something. */
export function sampleAppointments(): Meeting[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return reactive([
    {
      id: 1,
      text: 'Team standup',
      startDate: day(0, 9),
      endDate: day(0, 9, 15),
    },
    {
      id: 2,
      text: 'Design review',
      startDate: day(0, 10),
      endDate: day(0, 11, 30),
      color: '#7c4dff',
    },
    {
      id: 3,
      text: 'Lunch with Ana',
      startDate: day(0, 12, 30),
      endDate: day(0, 13, 30),
      color: '#2e7d32',
    },
    {
      id: 4,
      text: 'Release planning',
      startDate: day(0, 10, 30),
      endDate: day(0, 12),
    },
    {
      id: 5,
      text: 'Customer call',
      startDate: day(1, 14),
      endDate: day(1, 15),
      color: '#c62828',
    },
    {
      id: 6,
      text: 'Conference',
      startDate: day(-1, 0),
      endDate: day(1, 0),
      allDay: true,
      color: '#ef6c00',
    },
    {
      id: 7,
      text: 'Code freeze',
      startDate: day(2, 0),
      endDate: day(2, 0),
      allDay: true,
    },
    {
      id: 8,
      text: 'Night deploy',
      startDate: day(2, 22),
      endDate: day(3, 1, 30),
      color: '#455a64',
    },
    {
      id: 9,
      text: 'One-on-one',
      startDate: day(-2, 16),
      endDate: day(-2, 16, 30),
    },
    {
      id: 10,
      text: 'Workshop',
      startDate: day(3, 9),
      endDate: day(3, 12),
      color: '#00838f',
    },
    { id: 11, text: 'Interview', startDate: day(3, 10), endDate: day(3, 11) },
    { id: 12, text: 'Retro', startDate: day(4, 15), endDate: day(4, 16) },
    {
      id: 13,
      text: 'Board meeting',
      startDate: day(7, 9),
      endDate: day(7, 11),
    },
    {
      id: 14,
      text: 'Trip to Izmir',
      startDate: day(8, 0),
      endDate: day(11, 0),
      allDay: true,
      color: '#ad1457',
    },
    {
      id: 15,
      text: 'Dentist',
      startDate: day(-5, 8, 30),
      endDate: day(-5, 9, 15),
    },
  ]) as Meeting[];
}
```

## By its own width

With `presentation: 'auto'` (the default) it watches its own width and the screen's pointer, as the [TabDocumentManager](tabdocs-mobile.md) does: under `phoneWidth` (560) as on a phone, under `tabletWidth` (1024) as on a tablet on a touch screen. Phones are 360 to 430 pixels wide.

```tsx
import { reactive } from '@motifx/core';

export interface Meeting {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
}

/** A week of appointments around today, so the examples always show something. */
export function sampleAppointments(): Meeting[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return reactive([
    {
      id: 1,
      text: 'Team standup',
      startDate: day(0, 9),
      endDate: day(0, 9, 15),
    },
    {
      id: 2,
      text: 'Design review',
      startDate: day(0, 10),
      endDate: day(0, 11, 30),
      color: '#7c4dff',
    },
    {
      id: 3,
      text: 'Lunch with Ana',
      startDate: day(0, 12, 30),
      endDate: day(0, 13, 30),
      color: '#2e7d32',
    },
    {
      id: 4,
      text: 'Release planning',
      startDate: day(0, 10, 30),
      endDate: day(0, 12),
    },
    {
      id: 5,
      text: 'Customer call',
      startDate: day(1, 14),
      endDate: day(1, 15),
      color: '#c62828',
    },
    {
      id: 6,
      text: 'Conference',
      startDate: day(-1, 0),
      endDate: day(1, 0),
      allDay: true,
      color: '#ef6c00',
    },
    {
      id: 7,
      text: 'Code freeze',
      startDate: day(2, 0),
      endDate: day(2, 0),
      allDay: true,
    },
    {
      id: 8,
      text: 'Night deploy',
      startDate: day(2, 22),
      endDate: day(3, 1, 30),
      color: '#455a64',
    },
    {
      id: 9,
      text: 'One-on-one',
      startDate: day(-2, 16),
      endDate: day(-2, 16, 30),
    },
    {
      id: 10,
      text: 'Workshop',
      startDate: day(3, 9),
      endDate: day(3, 12),
      color: '#00838f',
    },
    { id: 11, text: 'Interview', startDate: day(3, 10), endDate: day(3, 11) },
    { id: 12, text: 'Retro', startDate: day(4, 15), endDate: day(4, 16) },
    {
      id: 13,
      text: 'Board meeting',
      startDate: day(7, 9),
      endDate: day(7, 11),
    },
    {
      id: 14,
      text: 'Trip to Izmir',
      startDate: day(8, 0),
      endDate: day(11, 0),
      allDay: true,
      color: '#ad1457',
    },
    {
      id: 15,
      text: 'Dentist',
      startDate: day(-5, 8, 30),
      endDate: day(-5, 9, 15),
    },
  ]) as Meeting[];
}
```

## A finger

The listeners are on the scheduler before a finger lands, so a lifted appointment, a swipe and a pinch keep the page still; anything else scrolls natively. After a drag no click follows, and nothing a finger touched stays looking hovered. Open this page on a phone, or with the browser's touch emulation.

| Gesture | What it does |
| --- | --- |
| `Tap an appointment` | Its tooltip (an action sheet on a phone): Edit, Delete. |
| `Hold an appointment, then drag` | Lifts it after a moment and moves it; the page does not scroll while it is lifted. Let go where it may go. |
| `Let go of a lifted appointment` | It stays selected with a handle in the middle of its start and its end; drag a handle to resize it. A tap elsewhere puts it down. |
| `Swipe sideways over the view` | The next or the previous days. A view that can still scroll that way (a wide week, a timeline) scrolls first; at its end the swipe moves on. |
| `Pinch` | Zooms the hours of the day views and the cells of a timeline (`timeZoom`, 0.5 to 4). |
| `Tap a free cell, then tap it again` | Selects it, then opens the form for a new appointment there. |
| `Scroll` | Native scrolling, as everywhere on the page. |

```tsx
import { reactive } from '@motifx/core';

export interface Meeting {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
}

/** A week of appointments around today, so the examples always show something. */
export function sampleAppointments(): Meeting[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return reactive([
    {
      id: 1,
      text: 'Team standup',
      startDate: day(0, 9),
      endDate: day(0, 9, 15),
    },
    {
      id: 2,
      text: 'Design review',
      startDate: day(0, 10),
      endDate: day(0, 11, 30),
      color: '#7c4dff',
    },
    {
      id: 3,
      text: 'Lunch with Ana',
      startDate: day(0, 12, 30),
      endDate: day(0, 13, 30),
      color: '#2e7d32',
    },
    {
      id: 4,
      text: 'Release planning',
      startDate: day(0, 10, 30),
      endDate: day(0, 12),
    },
    {
      id: 5,
      text: 'Customer call',
      startDate: day(1, 14),
      endDate: day(1, 15),
      color: '#c62828',
    },
    {
      id: 6,
      text: 'Conference',
      startDate: day(-1, 0),
      endDate: day(1, 0),
      allDay: true,
      color: '#ef6c00',
    },
    {
      id: 7,
      text: 'Code freeze',
      startDate: day(2, 0),
      endDate: day(2, 0),
      allDay: true,
    },
    {
      id: 8,
      text: 'Night deploy',
      startDate: day(2, 22),
      endDate: day(3, 1, 30),
      color: '#455a64',
    },
    {
      id: 9,
      text: 'One-on-one',
      startDate: day(-2, 16),
      endDate: day(-2, 16, 30),
    },
    {
      id: 10,
      text: 'Workshop',
      startDate: day(3, 9),
      endDate: day(3, 12),
      color: '#00838f',
    },
    { id: 11, text: 'Interview', startDate: day(3, 10), endDate: day(3, 11) },
    { id: 12, text: 'Retro', startDate: day(4, 15), endDate: day(4, 16) },
    {
      id: 13,
      text: 'Board meeting',
      startDate: day(7, 9),
      endDate: day(7, 11),
    },
    {
      id: 14,
      text: 'Trip to Izmir',
      startDate: day(8, 0),
      endDate: day(11, 0),
      allDay: true,
      color: '#ad1457',
    },
    {
      id: 15,
      text: 'Dentist',
      startDate: day(-5, 8, 30),
      endDate: day(-5, 9, 15),
    },
  ]) as Meeting[];
}
```

## Accessibility

| Topic | How |
| --- | --- |
| `Without gestures` | Everything a gesture does has a button or a key: the month opens the calendar, the arrows move the focused appointment (Shift: its end), N and P the days. |
| `Sheets` | The tooltip and the form are dialogs: focus moves in and back, Escape and the back button close them. |
| `Sizes` | On a touch screen the bar, the agenda rows and the lines of the month take the language’s large control height. |

## Styling

| Hook | What it is |
| --- | --- |
| `scheduler.bar `phone`` | Unit: the bar as on a phone. |
| `scheduler.appointment `lifted`, `selected`` | Unit states: the appointment a finger holds, and the one it let go (with its handles). |
| `scheduler.resize-grip (`active`)` | Unit: a handle, in the middle of an edge; down the side of a bar it is turned. |
| `scheduler.swipe-edge (`ready`), swipe-icon (`previous`, `ready`)` | Units: the mark at the side the next days come from while swiping. |
| `touch-target, touch-lane-size, phone-ruler-width, phone-column-min-width, phone-timeline-resource-width, phone-bar-size, swipe-inset, grip-ring, grip-ring-mix` | Plain tokens. |
| `today-icon-button, view-menu-button, tooltip-sheet, form-sheet` | Places: the kit’s buttons and sheets inside. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `presentation` | `Bind<'auto' \| 'desktop' \| 'tablet' \| 'phone'>` | `'auto'` | How it shows itself: by its own width, or always one way. The appointments, the views and the date stay the same. |
| `phoneWidth` | `Bind<number>` | `560` | Under this width (of the scheduler, not of the screen) `auto` shows it as on a phone, whatever the pointer. |
| `tabletWidth` | `Bind<number>` | `1024` | Under this width `auto` shows it as on a tablet, on a touch screen (see `tabletWhen`). |
| `tabletWhen` | `Bind<'touch' \| 'width'>` | `'touch'` | `'touch'`: as on a tablet only when the screen's pointer is a finger (`(pointer: coarse)`, followed live); `'width'`: the width alone. |
| `phoneView` | `Bind<string \| null>` | `'agenda'` | The view (by name or type) it shows as on a phone; a day when the views have none of it. Going back, it shows the view it had, unless the user chose another. `null` keeps the view. |
| `tabletView` | `Bind<string \| null>` | `null` | The same, as on a tablet; `null` keeps the view. |
| `swipeNavigation` | `Bind<boolean>` | `true` | A finger swiping sideways goes to the next or the previous days. |
| `pinchZoom` | `Bind<boolean>` | `true` | Two fingers zoom the time scale. |
| `timeZoom` | `Bind<number>` | `1` | How far the time scale is zoomed: 1 as the design language sizes it, 0.5 to 4. |
| `onPresentationChanging` | `(e: SchedulerPresentationChangingEventArgs) => void` | — | `{ from, to, width, cancel }`: refused, it keeps showing as it does until the width or the setting changes again. |
| `onPresentationChanged` | `(e: SchedulerPresentationChangedEventArgs) => void` | — | `{ from, to, width }`. |
| `onTimeZoomChanging` | `(e: TimeZoomChangingEventArgs) => void` | — | `{ from, to, cancel }`, as two fingers start to zoom; refused, the page zooms instead. |
| `onTimeZoomChanged` | `(e: TimeZoomChangedEventArgs) => void` | — | `{ from, to }`, when the fingers let go. |
| `onFormOpening` | `(e: FormOpeningEventArgs) => void` | — | `e.form` is the window, or on a phone the `BottomSheet` the form comes up in. |

### Members

| Member | Returns | Description |
| --- | --- | --- |
| `currentPresentation` | read-only, reactive | How it shows itself now: `'desktop'`, `'tablet'` or `'phone'`. |

The sheets are the kit's [BottomSheet](bottomsheet.md) and [ActionSheet](actionsheet.md).

## Example files

`Presentations.tsx`

```tsx
import { reactive } from '@motifx/core';
import { RadioGroup, Scheduler, Stack, type SchedulerPresentation } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/**
 * One scheduler shown three ways. As on a phone it shows the agenda (a day where it has none), the
 * bar holds the month, Today and a menu of the views, the tooltip and the form come up from the
 * bottom. Going back, it shows the view it had. The appointments and the date stay the same.
 */
export default function Presentations() {
  const s = reactive({ presentation: 'phone' as SchedulerPresentation, said: '' });
  const scheduler = (
    <Scheduler<Meeting>
      appointments={sampleAppointments()}
      views={['day', 'week', 'month', 'agenda']}
      presentation={() => s.presentation}
      startDayHour={7}
      onPresentationChanged={(e) => (s.said = `${e.from} → ${e.to}${e.width ? ` (${e.width} px wide)` : ''}`)}
    />
  ) as Scheduler<Meeting>;
  return (
    <div class="sched-demo">
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Presentation"
          orientation="horizontal"
          items={[
            { value: 'auto', text: 'By its width' },
            { value: 'desktop', text: 'Desktop' },
            { value: 'tablet', text: 'Tablet' },
            { value: 'phone', text: 'Phone' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.presentation}
        />
        <output class="sched-log">{() => (s.said ? `Shown: ${s.said}` : `Shown as: ${scheduler.currentPresentation}`)}</output>
      </Stack>
      {scheduler}
    </div>
  );
}
```

`sample-appointments.ts`

```tsx
import { reactive } from '@motifx/core';

export interface Meeting {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
}

/** A week of appointments around today, so the examples always show something. */
export function sampleAppointments(): Meeting[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return reactive([
    {
      id: 1,
      text: 'Team standup',
      startDate: day(0, 9),
      endDate: day(0, 9, 15),
    },
    {
      id: 2,
      text: 'Design review',
      startDate: day(0, 10),
      endDate: day(0, 11, 30),
      color: '#7c4dff',
    },
    {
      id: 3,
      text: 'Lunch with Ana',
      startDate: day(0, 12, 30),
      endDate: day(0, 13, 30),
      color: '#2e7d32',
    },
    {
      id: 4,
      text: 'Release planning',
      startDate: day(0, 10, 30),
      endDate: day(0, 12),
    },
    {
      id: 5,
      text: 'Customer call',
      startDate: day(1, 14),
      endDate: day(1, 15),
      color: '#c62828',
    },
    {
      id: 6,
      text: 'Conference',
      startDate: day(-1, 0),
      endDate: day(1, 0),
      allDay: true,
      color: '#ef6c00',
    },
    {
      id: 7,
      text: 'Code freeze',
      startDate: day(2, 0),
      endDate: day(2, 0),
      allDay: true,
    },
    {
      id: 8,
      text: 'Night deploy',
      startDate: day(2, 22),
      endDate: day(3, 1, 30),
      color: '#455a64',
    },
    {
      id: 9,
      text: 'One-on-one',
      startDate: day(-2, 16),
      endDate: day(-2, 16, 30),
    },
    {
      id: 10,
      text: 'Workshop',
      startDate: day(3, 9),
      endDate: day(3, 12),
      color: '#00838f',
    },
    { id: 11, text: 'Interview', startDate: day(3, 10), endDate: day(3, 11) },
    { id: 12, text: 'Retro', startDate: day(4, 15), endDate: day(4, 16) },
    {
      id: 13,
      text: 'Board meeting',
      startDate: day(7, 9),
      endDate: day(7, 11),
    },
    {
      id: 14,
      text: 'Trip to Izmir',
      startDate: day(8, 0),
      endDate: day(11, 0),
      allDay: true,
      color: '#ad1457',
    },
    {
      id: 15,
      text: 'Dentist',
      startDate: day(-5, 8, 30),
      endDate: day(-5, 9, 15),
    },
  ]) as Meeting[];
}
```

`PhoneFrame.tsx`

```tsx
import { reactive, type Component } from '@motifx/core';
import { Button, Scheduler, Stack } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/**
 * A scheduler that goes by its own width (`presentation: 'auto'`), in a frame the size of a phone:
 * under 560 pixels it shows as on a phone, under 1024 as on a tablet (here by the width alone,
 * `tabletWhen: 'width'`, so a mouse shows it too). Drag the frame's corner, or pick a width.
 */
export default function PhoneFrame() {
  const s = reactive({ shown: '' });
  let frame!: Component<HTMLDivElement>;
  const width = (px: string) => (frame.element.style.inlineSize = px);
  return (
    <div class="sched-demo">
      <Stack orientation="horizontal" wrap align="center">
        <Button text="390 px" variant="outline" onclick={() => width('390px')} />
        <Button text="820 px" variant="outline" onclick={() => width('820px')} />
        <Button text="Full width" variant="outline" onclick={() => width('100%')} />
        <output class="sched-log">{() => s.shown}</output>
      </Stack>
      <div ref={(c: Component<HTMLDivElement>) => (frame = c)} class="sched-phone-frame">
        <Scheduler<Meeting>
          appointments={sampleAppointments()}
          views={['day', 'week', 'month', 'agenda']}
          tabletWhen="width"
          startDayHour={7}
          onPresentationChanged={(e) => (s.shown = `${e.to} at ${e.width} px`)}
        />
      </div>
    </div>
  );
}
```

`Touch.tsx`

```tsx
import { reactive } from '@motifx/core';
import { NumberBox, Scheduler, Stack, Switch } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/**
 * A finger: hold an appointment to lift it and drag it; let go and its handles stay, drag one to
 * resize. Swipe sideways for the next or the previous days; pinch to zoom the hours. Tap a free
 * cell, then tap it again for a new appointment.
 */
export default function Touch() {
  const s = reactive({ swipe: true, pinch: true, zoom: 1, said: '' });
  return (
    <div class="sched-demo">
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Swipe between days" x-model={() => s.swipe} />
        <Switch label="Pinch to zoom" x-model={() => s.pinch} />
        <NumberBox label="Zoom" labelMode="side" min={0.5} max={4} step={0.25} x-model={() => s.zoom} />
        <output class="sched-log">{() => s.said}</output>
      </Stack>
      <Scheduler<Meeting>
        appointments={sampleAppointments()}
        views={['day', 'week', 'timelineDay']}
        currentView="week"
        presentation="tablet"
        swipeNavigation={() => s.swipe}
        pinchZoom={() => s.pinch}
        timeZoom={() => s.zoom}
        onTimeZoomChanged={(e) => {
          s.zoom = e.to;
          s.said = `Zoomed from ${e.from.toFixed(2)} to ${e.to.toFixed(2)}`;
        }}
        onMoveEnd={(e) => (s.said = `${e.appointment.text} moved`)}
        onDateChanged={(e) => (s.said = e.byUser ? `Moved to ${e.to.toDateString()}` : s.said)}
      />
    </div>
  );
}
```
