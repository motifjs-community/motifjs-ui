import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import NestedTimeline from './examples/NestedTimeline';
import Timeline from './examples/Timeline';
import TimelineSettings from './examples/TimelineSettings';
import TimelineTemplates from './examples/TimelineTemplates';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const VIEW = [
  ['type', "`'timelineDay' \\| 'timelineWeek' \\| 'timelineWorkWeek' \\| 'timelineMonth'`", '—', 'A row per group, the time along it: hours of a day, of a week, of a work week; the days of a month.'],
  ['intervalCount', '`Bind<number>`', '1', 'How many days, weeks or months it shows.'],
  ['startDate', '`Bind<Date \\| null>`', '`null`', 'With `intervalCount` over 1: the date its intervals are counted from, so they stay put when the date moves.'],
  ['cellDuration', '`Bind<number>`', "the scheduler's", 'Minutes in a cell along the time (the timeline month: a day).'],
  ['startDayHour / endDayHour', '`Bind<number>`', "the scheduler's", 'The hours of each day shown; the time before and after is left out.'],
  ['groups', '`Bind<string[]>`', "the scheduler's", 'The resource fields the rows are grouped by, outer first; nested groups stand in levels of the resource column.'],
  ['maxAppointmentsPerCell', "`Bind<number \\| 'auto'>`", "`'auto'`", "Lanes a row has before \"+N more\" (per day); `'auto'`: the row grows to fit them all."],
  ['scrolling', "`Bind<'auto' \\| 'standard' \\| 'virtual'>`", "`'auto'`", 'Every row and cell built, or only what is in view (see Big data).'],
  ['name, text', '`string`, `Bind<string>`', 'the type', 'Its name for `currentView` and its caption in the bar.'],
  ['…Template', 'see Templates', "the scheduler's", 'A view’s own template wins; `null` turns one off there.'],
];

const TEMPLATES = [
  ['appointmentTemplate', '`(context: AppointmentTemplateContext) => Component`', 'An appointment’s content: `{ appointment, start, end, text, time, allDay, view, group }`.'],
  ['appointmentTooltipTemplate', '`(context: TooltipTemplateContext) => Component`', 'The tooltip’s content: `{ appointment, text, time, canEdit, canDelete, edit(), remove(), close() }`.'],
  ['dataCellTemplate', '`(context: CellTemplateContext) => Component`', 'A cell’s content: `{ start, end, allDay, resources, view, today, work, blocked }`; the cell keeps its look, keys and name.'],
  ['dateCellTemplate', '`(context: DateTemplateContext) => Component`', 'A day’s head (the dates, the month’s weekdays, a timeline’s days): `{ date, weekday, number, today, view, resources }`.'],
  ['timeCellTemplate', '`(context: TimeTemplateContext) => Component`', 'An hour of the ruler and of a timeline’s scale: `{ date, minutes, text, view }`.'],
  ['resourceHeaderTemplate', '`(context: ResourceHeaderContext) => Component`', 'A group’s head: in a timeline, the resource column’s cell.'],
  ['agendaRowTemplate', '`(context: AgendaRowContext) => Component`', 'An agenda row’s content (see Agenda).'],
  ['moreListTemplate', '`(context: MoreListContext) => Component`', 'The list "+N more" opens: `{ date, appointments, choose(appointment, event) }`.'],
];

const METHODS = [
  ['scrollToTime(hour, minute?)', 'In a timeline: along to that time on the date shown (else the first day).'],
  ['scrollTo(date, resources?)', 'Brings a time into view: its cell along the time and the row of `resources` (the group’s values); in the day views its hour and its column.'],
];

const KEYS = [
  ['Left / Right (cells)', 'Along the time, mirrored right to left; past the first or the last cell the view moves on.'],
  ['Up / Down (cells)', 'To the row above or below.'],
  ['Home / End, Ctrl + Home / End', 'The row’s first and last cell; with Ctrl, of the first and the last row.'],
  ['PageUp / PageDown', 'A screen of rows.'],
  ['Shift + arrows', 'Selects cells along the row.'],
  ['Left / Right (appointment)', 'Moves it a snap step along the time (a day in the timeline month); Shift: its end.'],
  ['Up / Down (appointment)', 'Moves it to the row above or below (its group changes); Enter saves, Escape takes it back.'],
];

export default function SchedulerTimelinePage() {
  return (
    <>
      <p class="lead">
        A row per resource with the time running along it: a day, a week, a work week or a month. Appointments at the same time stack in their row,
        and the row grows to fit them.
      </p>

      <Section anchor="views" title="Timeline views">
        <p>
          <Rich text="`timelineDay`, `timelineWeek`, `timelineWorkWeek` and `timelineMonth` show the groups as rows (one row without `groups`). The scale over the cells has two tiers: the days over their hours (the months over their days). It stays at the top while the rows scroll, the resource column at the start while the time scrolls. The line at the current time, blocked times and the hours outside work carry over; a drag moves an appointment along its row or to another one, and its ends change its time." />
        </p>
        <Example files={code('Timeline.tsx', 'timeline-data.ts')}>
          <Timeline />
        </Example>
      </Section>

      <Section anchor="nested" title="Nested groups">
        <p>
          <Rich text="With two kinds in `groups`, each row is an item of the inner kind under its item of the outer kind: the resource column has a level per kind, the outer name on the first of its rows. The time runs right to left in a right-to-left page." />
        </p>
        <Example files={code('NestedTimeline.tsx', 'timeline-data.ts')}>
          <NestedTimeline />
        </Example>
      </Section>

      <Section anchor="settings" title="Settings per view">
        <p>
          <Rich text="Each view may have its own `intervalCount`, `startDate`, `cellDuration`, hours, `groups`, `maxAppointmentsPerCell` and templates; what it leaves out is the scheduler's." />
        </p>
        <Example files={code('TimelineSettings.tsx', 'timeline-data.ts')}>
          <TimelineSettings />
        </Example>
      </Section>

      <Section anchor="templates" title="Templates">
        <p>
          <Rich text="Every template can be given to the scheduler and to a view; the view's own wins. A template is made once for the element it draws and gets a context whose fields follow it." />
        </p>
        <Example files={code('TimelineTemplates.tsx', 'timeline-data.ts')}>
          <TimelineTemplates />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable
          head={['Topic', 'How']}
          rows={[
            ['Rows', 'The rows are a grid’s rows; each cell reads its group, its date and its time, and a blocked time after them.'],
            ['Resource column, scale', 'Drawn only (`aria-hidden`): every cell names its group and its time.'],
            ['Appointments', 'Each row’s appointments are in a cell of their own, named by the row; an appointment reads its text, its time and whether it goes on.'],
          ]}
        />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'What it is']}
          rows={[
            ['scheduler.scale, scale-upper (`today`), scale-lower (`day-start`, `day`, `weekend`, `today`)', 'Units: the head over the cells and its two tiers.'],
            ['scheduler.timeline-corner, timeline-corner-label', 'Units: the corner over the resource column, the names of the kinds.'],
            ['scheduler.resource-cell (`inner`, `first`, `continued`)', 'Unit: a level of the resource column.'],
            ['scheduler.timeline-row (`first`), timeline-divider (`inner`)', 'Units: a row along the time and the line over it; the line where an outer group starts.'],
            ['scheduler.cell `line`, `line-hour`, `line-day`', 'The cells along the time: the line before each, stronger where an hour and a day start.'],
            ['scheduler.appointment `line`, `line-before`, `line-after`', 'An appointment on a lane, and its cut ends.'],
            ['timeline-cell-width, timeline-resource-width, timeline-lane-size, timeline-row-min-height', 'Plain tokens: a cell’s least width (cells stretch to fill the room when they are few), a level of the resource column, a lane, an empty row.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Timeline views</h3>
        <ApiTable head={['Setting', 'Type', 'Default', 'Description']} rows={VIEW} />
        <h3>Templates</h3>
        <ApiTable head={['Prop (and view setting)', 'Type', 'Description']} rows={TEMPLATES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Description']} rows={METHODS} />
      </Section>
    </>
  );
}
