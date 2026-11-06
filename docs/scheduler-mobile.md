# Scheduler: Tablet and phone

> Scheduler · @motifx-community/ui 0.1.0-beta.3

On tablets and phones, the scheduler keeps its appointments, views and date, and changes how it presents them. On a phone, it shows the agenda, a compact toolbar and bottom sheets. Touch gestures can lift and resize appointments, swipe between days, and pinch to zoom.

## Import

```tsx
import { Scheduler, type SchedulerPresentation } from '@motifx-community/ui';
```

## Three presentations of one scheduler

| Presentation | Displayed content |
| --- | --- |
| `Desktop` | The default layout: a toolbar with Today, previous and next, the date, and a button for each view. The tooltip appears next to the appointment, and the form opens in a window. |
| `Tablet` | The same layout, keeping its current view (a week, which is how tablet calendars usually open). On a touch screen, everything that can be tapped is larger. |
| `Phone` | The agenda, or a day view when the views have no agenda. The toolbar shows Today as an icon, the month (which opens the calendar) and one menu for the views, and swiping moves between days. The tooltip is an action sheet, and the form is a bottom sheet. The time ruler, resource column and time column are narrower so that a week still fits on the screen, and every view works. |

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

## Based on its own width

With `presentation: 'auto'` (the default), the scheduler monitors its own width and the device's pointer type, in the same way as the [TabDocumentManager](tabdocs-mobile.md). Below `phoneWidth` (560), it uses the phone presentation, and below `tabletWidth` (1024), it uses the tablet presentation on touch screens. Phones are typically 360 to 430 pixels wide.

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

## Touch

Listeners are attached before a finger lands, so lifting an appointment, swiping and pinching keep the page still, and any other movement scrolls natively. No click follows a drag, and no hover state remains after a touch. To try this, open this page on a phone or use your browser's touch emulation.

| Gesture | Description |
| --- | --- |
| `Tap an appointment` | Shows its tooltip (an action sheet on a phone) with Edit and Delete. |
| `Hold an appointment, then drag` | Lifts it after a moment so that it can be moved. The page does not scroll while it is lifted. Release it at a valid position to drop it. |
| `Let go of a lifted appointment` | Keeps it selected, with a handle at the middle of its start and end. Drag a handle to resize it, or tap elsewhere to release it. |
| `Swipe sideways over the view` | Moves to the next or previous days. A view that can still scroll in that direction (a wide week or a timeline) scrolls first, and the swipe advances the view at its end. |
| `Pinch` | Zooms the hours of the day views and the cells of a timeline (`timeZoom`, 0.5 to 4). |
| `Tap a free cell, then tap it again` | Selects it, and then opens the form for a new appointment there. |
| `Scroll` | Scrolls natively, like the rest of the page. |

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

| Topic | Details |
| --- | --- |
| `Without gestures` | Every gesture has a button or key equivalent. The month opens the calendar, the arrow keys move the focused appointment (with Shift, its end), and N and P change the days. |
| `Sheets` | The tooltip and form are dialogs. Focus moves into them and returns afterward, and Escape and the Back button close them. |
| `Sizes` | On touch screens, the toolbar, agenda rows and month lines use the design language's large control height. |

## Styling

| Hook | Description |
| --- | --- |
| `scheduler.bar `phone`` | Unit: the toolbar in the phone presentation. |
| `scheduler.appointment `lifted`, `selected`` | Unit states: an appointment held by a finger, and one that has been released (with its handles). |
| `scheduler.resize-grip (`active`)` | Unit: a resize handle, at the middle of an edge. On the side of a bar, it is rotated. |
| `scheduler.swipe-edge (`ready`), swipe-icon (`previous`, `ready`)` | Units: the indicator on the side the next days come from while swiping. |
| `touch-target, touch-lane-size, phone-ruler-width, phone-column-min-width, phone-timeline-resource-width, phone-bar-size, swipe-inset, grip-ring, grip-ring-mix` | Plain tokens. |
| `today-icon-button, view-menu-button, tooltip-sheet, form-sheet` | Places: the kit buttons and sheets inside. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `presentation` | `Bind<'auto' \| 'desktop' \| 'tablet' \| 'phone'>` | `'auto'` | The presentation: based on its own width, or always the same one. The appointments, views and date do not change. |
| `phoneWidth` | `Bind<number>` | `560` | Below this width (of the scheduler, not the screen), `auto` uses the phone presentation regardless of the pointer type. |
| `tabletWidth` | `Bind<number>` | `1024` | Below this width, `auto` uses the tablet presentation on touch screens (see `tabletWhen`). |
| `tabletWhen` | `Bind<'touch' \| 'width'>` | `'touch'` | With `'touch'`, the tablet presentation applies only when the device's pointer is a finger (`(pointer: coarse)`, tracked live). With `'width'`, only the width is considered. |
| `phoneView` | `Bind<string \| null>` | `'agenda'` | The view (by name or type) shown in the phone presentation, or a day view if the views do not include it. When leaving this presentation, the previous view returns, unless the user chose another. `null` keeps the current view. |
| `tabletView` | `Bind<string \| null>` | `null` | The same for the tablet presentation. `null` keeps the current view. |
| `swipeNavigation` | `Bind<boolean>` | `true` | Swiping sideways moves to the next or previous days. |
| `pinchZoom` | `Bind<boolean>` | `true` | Pinching zooms the time scale. |
| `timeZoom` | `Bind<number>` | `1` | The zoom level of the time scale, from 0.5 to 4. At 1, it uses the sizes set by the design language. |
| `onPresentationChanging` | `(e: SchedulerPresentationChangingEventArgs) => void` | — | `{ from, to, width, cancel }`. If canceled, the presentation stays the same until the width or the setting changes again. |
| `onPresentationChanged` | `(e: SchedulerPresentationChangedEventArgs) => void` | — | `{ from, to, width }`. |
| `onTimeZoomChanging` | `(e: TimeZoomChangingEventArgs) => void` | — | `{ from, to, cancel }`, raised when a pinch starts. If canceled, the page zooms instead. |
| `onTimeZoomChanged` | `(e: TimeZoomChangedEventArgs) => void` | — | `{ from, to }`, raised when the pinch ends. |
| `onFormOpening` | `(e: FormOpeningEventArgs) => void` | — | `e.form` is the window, or on a phone the `BottomSheet` that contains the form. |

### Members

| Member | Returns | Description |
| --- | --- | --- |
| `currentPresentation` | read-only, reactive | The current presentation: `'desktop'`, `'tablet'` or `'phone'`. |

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
