import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import BigTimeline from './examples/BigTimeline';
import BigWeek from './examples/BigWeek';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const HOW = [
  ['Rows of a timeline', 'Through `Virtualization`: only the rows in view (and a few on each side) are built. Each row is as tall as its lanes; the model works the height out (lanes × lane height), the list reads it. While an appointment is dragged its rows grow in place and the list is given the heights after.'],
  ['Cells along the time', 'A window kept by the model (`setWindow`): the cells and appointments of the part in view and a screen on each side. Scrolling moves the window on by a few cells at a time; the rows show it through a keyed `.map` over the window’s slice.'],
  ['Columns of a day or a week', 'The same window over the columns: with many groups only the columns in view are built, each at its own place.'],
  ['Layout', 'Each row of a timeline is laid out on its own; a drag lays out only the rows it was and is in. The appointments are read once for every layout until they change.'],
  ['Data source', 'The range shown is what is asked for (`rangeFilter`), with the resources shown when grouped by a field of one value.'],
];

const PROPS = [
  ['scrolling', "`Bind<'auto' \| 'standard' \| 'virtual'>`", "`'auto'`", "Every row and cell built (`'standard'`), or only what is in view (`'virtual'`); `'auto'`: virtual past about 2,000 cells (rows × cells along the time, columns × time rows). A view’s own wins."],
];

export default function SchedulerBigDataPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Thousands of resources and appointments: the scheduler builds only what is in view, and lays out only what changed." />
      </p>

      <Section anchor="timeline" title="1,000 resources, 10,000 appointments">
        <p>
          <Rich text="A timeline week with a row for each of 1,000 lines and 10,000 tasks over them (generated). Scroll down and sideways: the rows, cells and tasks in view are built as they come. The line under it says how long the first show took and how many elements the scheduler holds." />
        </p>
        <Example files={code('BigTimeline.tsx', 'big-data.ts')}>
          <BigTimeline />
        </Example>
      </Section>

      <Section anchor="groups" title="200 groups in a week">
        <p>
          <Rich text="A week grouped by 200 lines: 1,400 columns of 48 cells and 4,000 tasks. Only the columns in view (and a screen on each side) are built." />
        </p>
        <Example files={code('BigWeek.tsx', 'big-data.ts')}>
          <BigWeek />
        </Example>
      </Section>

      <Section anchor="how" title="How it stays fast">
        <ApiTable head={['Part', 'How']} rows={HOW} />
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
