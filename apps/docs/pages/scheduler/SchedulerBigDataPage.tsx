import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import BigTimeline from './examples/BigTimeline';
import BigWeek from './examples/BigWeek';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const HOW = [
  ['Rows of a timeline', 'Uses `Virtualization` to render only the visible rows, plus a few on each side. Each row is as tall as its lanes. The model calculates the height (lanes × lane height) and the list reads it. While an appointment is being dragged, its rows grow in place, and the list receives the new heights afterward.'],
  ['Cells along the time', 'The model keeps a window (`setWindow`) of the cells and appointments in the visible area, plus one screen on each side. Scrolling moves the window by a few cells at a time, and the rows render it through a keyed `.map` over that part of the data.'],
  ['Columns of a day or a week', 'The same window applies to columns, so with many groups only the visible columns are rendered, each in its own position.'],
  ['Layout', 'Each timeline row has its own layout, so a drag recalculates only the rows it leaves and enters. Appointments are read once for all layouts until they change.'],
  ['Data source', 'Only the displayed range is requested (`rangeFilter`), along with the displayed resources when grouping by a single-value field.'],
];

const PROPS = [
  ['scrolling', "`Bind<'auto' \| 'standard' \| 'virtual'>`", "`'auto'`", "`'standard'` renders every row and cell, and `'virtual'` renders only the visible ones. `'auto'` switches to virtual above about 2,000 cells (rows × cells along the time, or columns × time rows). A view's own value takes precedence."],
];

export default function SchedulerBigDataPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Handles thousands of resources and appointments. The scheduler renders only what is visible, and recalculates the layout only for what has changed." />
      </p>

      <Section anchor="timeline" title="1,000 resources, 10,000 appointments">
        <p>
          <Rich text="A timeline week with one row for each of 1,000 lines and 10,000 generated tasks. Scroll down and sideways, and the visible rows, cells and tasks are rendered as they appear. The status line below shows the time taken by the first render and the number of elements the scheduler holds." />
        </p>
        <Example files={code('BigTimeline.tsx', 'big-data.ts')}>
          <BigTimeline />
        </Example>
      </Section>

      <Section anchor="groups" title="200 groups in a week">
        <p>
          <Rich text="A week grouped by 200 lines, for 1,400 columns of 48 cells and 4,000 tasks. Only the visible columns, plus one screen on each side, are rendered." />
        </p>
        <Example files={code('BigWeek.tsx', 'big-data.ts')}>
          <BigWeek />
        </Example>
      </Section>

      <Section anchor="how" title="How it stays fast">
        <ApiTable head={['Part', 'Details']} rows={HOW} />
        <Code
          code={`
// A data source is asked for what is shown: the days, and the resources of the groups.
<Scheduler dataSource={source} remoteFiltering groups={['resourceId']} views={['timelineWeek']} />
`}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
      </Section>
    </>
  );
}
