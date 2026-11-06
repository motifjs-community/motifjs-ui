import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import PhoneFrame from './examples/PhoneFrame';
import Presentations from './examples/Presentations';
import Touch from './examples/Touch';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const WAYS = [
  ['Desktop', 'The default layout: a toolbar with Today, previous and next, the date, and a button for each view. The tooltip appears next to the appointment, and the form opens in a window.'],
  ['Tablet', 'The same layout, keeping its current view (a week, which is how tablet calendars usually open). On a touch screen, everything that can be tapped is larger.'],
  ['Phone', 'The agenda, or a day view when the views have no agenda. The toolbar shows Today as an icon, the month (which opens the calendar) and one menu for the views, and swiping moves between days. The tooltip is an action sheet, and the form is a bottom sheet. The time ruler, resource column and time column are narrower so that a week still fits on the screen, and every view works.'],
];

const GESTURES = [
  ['Tap an appointment', 'Shows its tooltip (an action sheet on a phone) with Edit and Delete.'],
  ['Hold an appointment, then drag', 'Lifts it after a moment so that it can be moved. The page does not scroll while it is lifted. Release it at a valid position to drop it.'],
  ['Let go of a lifted appointment', 'Keeps it selected, with a handle at the middle of its start and end. Drag a handle to resize it, or tap elsewhere to release it.'],
  ['Swipe sideways over the view', 'Moves to the next or previous days. A view that can still scroll in that direction (a wide week or a timeline) scrolls first, and the swipe advances the view at its end.'],
  ['Pinch', 'Zooms the hours of the day views and the cells of a timeline (`timeZoom`, 0.5 to 4).'],
  ['Tap a free cell, then tap it again', 'Selects it, and then opens the form for a new appointment there.'],
  ['Scroll', 'Scrolls natively, like the rest of the page.'],
];

const PROPS = [
  ['presentation', "`Bind<'auto' | 'desktop' | 'tablet' | 'phone'>`", "`'auto'`", 'The presentation: based on its own width, or always the same one. The appointments, views and date do not change.'],
  ['phoneWidth', '`Bind<number>`', '`560`', 'Below this width (of the scheduler, not the screen), `auto` uses the phone presentation regardless of the pointer type.'],
  ['tabletWidth', '`Bind<number>`', '`1024`', 'Below this width, `auto` uses the tablet presentation on touch screens (see `tabletWhen`).'],
  ['tabletWhen', "`Bind<'touch' | 'width'>`", "`'touch'`", "With `'touch'`, the tablet presentation applies only when the device's pointer is a finger (`(pointer: coarse)`, tracked live). With `'width'`, only the width is considered."],
  ['phoneView', '`Bind<string | null>`', "`'agenda'`", 'The view (by name or type) shown in the phone presentation, or a day view if the views do not include it. When leaving this presentation, the previous view returns, unless the user chose another. `null` keeps the current view.'],
  ['tabletView', '`Bind<string | null>`', '`null`', 'The same for the tablet presentation. `null` keeps the current view.'],
  ['swipeNavigation', '`Bind<boolean>`', '`true`', 'Swiping sideways moves to the next or previous days.'],
  ['pinchZoom', '`Bind<boolean>`', '`true`', 'Pinching zooms the time scale.'],
  ['timeZoom', '`Bind<number>`', '`1`', 'The zoom level of the time scale, from 0.5 to 4. At 1, it uses the sizes set by the design language.'],
  ['onPresentationChanging', '`(e: SchedulerPresentationChangingEventArgs) => void`', '—', '`{ from, to, width, cancel }`. If canceled, the presentation stays the same until the width or the setting changes again.'],
  ['onPresentationChanged', '`(e: SchedulerPresentationChangedEventArgs) => void`', '—', '`{ from, to, width }`.'],
  ['onTimeZoomChanging', '`(e: TimeZoomChangingEventArgs) => void`', '—', '`{ from, to, cancel }`, raised when a pinch starts. If canceled, the page zooms instead.'],
  ['onTimeZoomChanged', '`(e: TimeZoomChangedEventArgs) => void`', '—', '`{ from, to }`, raised when the pinch ends.'],
  ['onFormOpening', '`(e: FormOpeningEventArgs) => void`', '—', '`e.form` is the window, or on a phone the `BottomSheet` that contains the form.'],
];

const MEMBERS = [['currentPresentation', 'read-only, reactive', "The current presentation: `'desktop'`, `'tablet'` or `'phone'`."]];

export default function SchedulerMobilePage() {
  return (
    <>
      <p class="lead">
        <Rich text="On tablets and phones, the scheduler keeps its appointments, views and date, and changes how it presents them. On a phone, it shows the agenda, a compact toolbar and bottom sheets. Touch gestures can lift and resize appointments, swipe between days, and pinch to zoom." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Scheduler, type SchedulerPresentation } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="Three presentations of one scheduler">
        <ApiTable head={['Presentation', 'Displayed content']} rows={WAYS} />
        <Example files={code('Presentations.tsx', 'sample-appointments.ts')}>
          <Presentations />
        </Example>
      </Section>

      <Section anchor="width" title="Based on its own width">
        <p>
          <Rich text="With `presentation: 'auto'` (the default), the scheduler monitors its own width and the device's pointer type, in the same way as the [TabDocumentManager](/tabdocs/mobile). Below `phoneWidth` (560), it uses the phone presentation, and below `tabletWidth` (1024), it uses the tablet presentation on touch screens. Phones are typically 360 to 430 pixels wide." />
        </p>
        <Example files={code('PhoneFrame.tsx', 'sample-appointments.ts')}>
          <PhoneFrame />
        </Example>
      </Section>

      <Section anchor="touch" title="Touch">
        <p>
          <Rich text="Listeners are attached before a finger lands, so lifting an appointment, swiping and pinching keep the page still, and any other movement scrolls natively. No click follows a drag, and no hover state remains after a touch. To try this, open this page on a phone or use your browser's touch emulation." />
        </p>
        <ApiTable head={['Gesture', 'Description']} rows={GESTURES} />
        <Example files={code('Touch.tsx', 'sample-appointments.ts')}>
          <Touch />
        </Example>
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable
          head={['Topic', 'Details']}
          rows={[
            ['Without gestures', 'Every gesture has a button or key equivalent. The month opens the calendar, the arrow keys move the focused appointment (with Shift, its end), and N and P change the days.'],
            ['Sheets', 'The tooltip and form are dialogs. Focus moves into them and returns afterward, and Escape and the Back button close them.'],
            ['Sizes', 'On touch screens, the toolbar, agenda rows and month lines use the design language\'s large control height.'],
          ]}
        />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['scheduler.bar `phone`', 'Unit: the toolbar in the phone presentation.'],
            ['scheduler.appointment `lifted`, `selected`', 'Unit states: an appointment held by a finger, and one that has been released (with its handles).'],
            ['scheduler.resize-grip (`active`)', 'Unit: a resize handle, at the middle of an edge. On the side of a bar, it is rotated.'],
            ['scheduler.swipe-edge (`ready`), swipe-icon (`previous`, `ready`)', 'Units: the indicator on the side the next days come from while swiping.'],
            ['touch-target, touch-lane-size, phone-ruler-width, phone-column-min-width, phone-timeline-resource-width, phone-bar-size, swipe-inset, grip-ring, grip-ring-mix', 'Plain tokens.'],
            ['today-icon-button, view-menu-button, tooltip-sheet, form-sheet', 'Places: the kit buttons and sheets inside.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Members" />
        </h3>
        <ApiTable head={['Member', 'Returns', 'Description']} rows={MEMBERS} />
        <p>
          <Rich text="The sheets are the kit's [BottomSheet](/bottomsheet) and [ActionSheet](/actionsheet)." />
        </p>
      </Section>
    </>
  );
}
