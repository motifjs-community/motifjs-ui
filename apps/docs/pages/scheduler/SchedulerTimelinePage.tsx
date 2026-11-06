import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import NestedTimeline from './examples/NestedTimeline';
import Timeline from './examples/Timeline';
import TimelineSettings from './examples/TimelineSettings';
import TimelineTemplates from './examples/TimelineTemplates';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const VIEW = [
  ['type', "`'timelineDay' \\| 'timelineWeek' \\| 'timelineWorkWeek' \\| 'timelineMonth'`", '—', 'One row per group, with time along it: the hours of a day, a week or a work week, or the days of a month.'],
  ['intervalCount', '`Bind<number>`', '1', 'The number of days, weeks or months shown.'],
  ['startDate', '`Bind<Date \\| null>`', '`null`', 'With an `intervalCount` greater than 1, the date intervals are counted from, so that they stay in place when the date changes.'],
  ['cellDuration', '`Bind<number>`', "The scheduler's value", 'The minutes in a cell along the time. In the timeline month, a cell is a day.'],
  ['startDayHour / endDayHour', '`Bind<number>`', "The scheduler's value", 'The hours shown for each day. Time before and after them is omitted.'],
  ['groups', '`Bind<string[]>`', "The scheduler's value", 'The resource fields the rows are grouped by, outer first. Nested groups appear as levels of the resource column.'],
  ['maxAppointmentsPerCell', "`Bind<number \\| 'auto'>`", "`'auto'`", "The number of lanes a row has before \"+N more\" (per day). With `'auto'`, the row grows to fit them all."],
  ['scrolling', "`Bind<'auto' \\| 'standard' \\| 'virtual'>`", "`'auto'`", 'Whether every row and cell is rendered, or only the visible ones (see Big data).'],
  ['name, text', '`string`, `Bind<string>`', 'The type', 'Its name for `currentView`, and its caption in the toolbar.'],
  ['…Template', 'See Templates', "The scheduler's value", 'A view\'s own template takes precedence, and `null` disables a template for that view.'],
];

const TEMPLATES = [
  ['appointmentTemplate', '`(context: AppointmentTemplateContext) => Component`', 'An appointment\'s content: `{ appointment, start, end, text, time, allDay, view, group }`.'],
  ['appointmentTooltipTemplate', '`(context: TooltipTemplateContext) => Component`', 'The tooltip\'s content: `{ appointment, text, time, canEdit, canDelete, edit(), remove(), close() }`.'],
  ['dataCellTemplate', '`(context: CellTemplateContext) => Component`', 'A cell\'s content: `{ start, end, allDay, resources, view, today, work, blocked }`. The cell keeps its appearance, keys and accessible name.'],
  ['dateCellTemplate', '`(context: DateTemplateContext) => Component`', 'A day header (dates, weekdays of a month, days of a timeline): `{ date, weekday, number, today, view, resources }`.'],
  ['timeCellTemplate', '`(context: TimeTemplateContext) => Component`', 'An hour of the time ruler or of a timeline scale: `{ date, minutes, text, view }`.'],
  ['resourceHeaderTemplate', '`(context: ResourceHeaderContext) => Component`', 'A group header. In a timeline, this is the cell in the resource column.'],
  ['agendaRowTemplate', '`(context: AgendaRowContext) => Component`', 'An agenda row\'s content (see Agenda).'],
  ['moreListTemplate', '`(context: MoreListContext) => Component`', 'The list opened by "+N more": `{ date, appointments, choose(appointment, event) }`.'],
];

const METHODS = [
  ['scrollToTime(hour, minute?)', 'In a timeline, scrolls along to that time on the displayed date, or on the first day if none is given.'],
  ['scrollTo(date, resources?)', 'Scrolls a time into view: its cell along the time and the row of `resources` (the group\'s values). In the day views, this is its hour and column.'],
];

const KEYS = [
  ['Left / Right (cells)', 'Moves along the time, mirrored on right-to-left pages. Moving past the first or last cell advances the view.'],
  ['Up / Down (cells)', 'Moves to the row above or below.'],
  ['Home / End, Ctrl + Home / End', 'Moves to the first or last cell of the row. With Ctrl, moves to the first or last cell of the first or last row.'],
  ['PageUp / PageDown', 'Moves up or down one screen of rows.'],
  ['Shift + arrows', 'Selects cells along the row.'],
  ['Left / Right (appointment)', 'Moves it along the time by a snap step, or by a day in the timeline month. With Shift, changes its end.'],
  ['Up / Down (appointment)', 'Moves it to the row above or below, which changes its group. Enter saves, and Escape reverts.'],
];

export default function SchedulerTimelinePage() {
  return (
    <>
      <p class="lead">
        <Rich text="Displays one row per resource, with time running along the row, for a day, a week, a work week or a month. Appointments at the same time stack within a row, and the row grows to fit them." />
      </p>

      <Section anchor="views" title="Timeline views">
        <p>
          <Rich text="`timelineDay`, `timelineWeek`, `timelineWorkWeek` and `timelineMonth` show the groups as rows, or a single row without `groups`. The scale above the cells has two tiers: days over hours, or months over days. It stays at the top while the rows scroll, and the resource column stays at the start while the time scrolls. The current time indicator, blocked times and off-hours shading all apply. Dragging moves an appointment along its row or to another row, and dragging its ends changes its time." />
        </p>
        <Example files={code('Timeline.tsx', 'timeline-data.ts')}>
          <Timeline />
        </Example>
      </Section>

      <Section anchor="nested" title="Nested groups">
        <p>
          <Rich text="With two types in `groups`, each row is an item of the inner type under an item of the outer type. The resource column has one level per type, with the outer name on the first of its rows. On right-to-left pages, time runs from right to left." />
        </p>
        <Example files={code('NestedTimeline.tsx', 'timeline-data.ts')}>
          <NestedTimeline />
        </Example>
      </Section>

      <Section anchor="settings" title="Settings per view">
        <p>
          <Rich text="Each view can have its own `intervalCount`, `startDate`, `cellDuration`, hours, `groups`, `maxAppointmentsPerCell` and templates. Anything it leaves out comes from the scheduler." />
        </p>
        <Example files={code('TimelineSettings.tsx', 'timeline-data.ts')}>
          <TimelineSettings />
        </Example>
      </Section>

      <Section anchor="templates" title="Templates">
        <p>
          <Rich text="Every template can be set on the scheduler and on a view, and the view's template takes precedence. A template is created once for the element it renders, and receives a context whose fields stay up to date." />
        </p>
        <Example files={code('TimelineTemplates.tsx', 'timeline-data.ts')}>
          <TimelineTemplates />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable
          head={['Topic', 'Details']}
          rows={[
            ['Rows', 'The rows are grid rows. Each cell announces its group, date and time, followed by any blocked time.'],
            ['Resource column, scale', 'Decorative (`aria-hidden`), because every cell names its group and time.'],
            ['Appointments', 'The appointments of each row are in their own cell, named by the row. An appointment announces its text, its time and whether it continues.'],
          ]}
        />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['scheduler.scale, scale-upper (`today`), scale-lower (`day-start`, `day`, `weekend`, `today`)', 'Units: the header above the cells and its two tiers.'],
            ['scheduler.timeline-corner, timeline-corner-label', 'Units: the corner above the resource column, and the type names.'],
            ['scheduler.resource-cell (`inner`, `first`, `continued`)', 'Unit: a level of the resource column.'],
            ['scheduler.timeline-row (`first`), timeline-divider (`inner`)', 'Units: a row along the time and the line above it, and the line where an outer group starts.'],
            ['scheduler.cell `line`, `line-hour`, `line-day`', 'The cells along the time: the line before each cell, which is stronger where an hour or a day starts.'],
            ['scheduler.appointment `line`, `line-before`, `line-after`', 'An appointment on a lane, and its cut ends.'],
            ['timeline-cell-width, timeline-resource-width, timeline-lane-size, timeline-row-min-height', 'Plain tokens: the minimum cell width (cells stretch to fill the space when there are few), a level of the resource column, a lane, and an empty row.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Timeline views" />
        </h3>
        <ApiTable head={['Setting', 'Type', 'Default', 'Description']} rows={VIEW} />
        <h3>
          <Rich text="Templates" />
        </h3>
        <ApiTable head={['Prop (and view setting)', 'Type', 'Description']} rows={TEMPLATES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Description']} rows={METHODS} />
      </Section>
    </>
  );
}
