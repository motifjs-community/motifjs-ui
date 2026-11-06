import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { sources } from '../../shared/sources';
import Availability from './examples/Availability';
import Grouped from './examples/Grouped';
import HeaderTemplate from './examples/HeaderTemplate';
import Resources from './examples/Resources';
import ResourcesFromSource from './examples/ResourcesFromSource';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['resources', '`Bind<SchedulerResource[]>`', '`[]`', 'The kinds of resources the appointments use. Each colours them, may group the columns and gets a picker in the form.'],
  ['groups', '`Bind<string[]>`', '`[]`', 'The resource fields the columns are grouped by, outer first (`[\'roomId\', \'ownerIds\']`). A view’s own `groups` wins; `[]` there for none.'],
  ['groupByDate', '`Bind<boolean>`', '`false`', 'The groups stand under each date, not the dates under each group. A view’s own wins.'],
  ['resourceHeaderTemplate', '`Bind<((context: ResourceHeaderContext) => ComponentBase) \\| null>`', '`null`', 'Draws a group’s head in place of its name.'],
  ['blockedTimes', '`Bind<SchedulerBlockedTime[]>`', '`[]`', 'Times nothing may be put in: `{ start, end, text?, allDay?, recurrenceRule?, resources? }`. Shaded on the days shown; with `resources`, only for those.'],
  [
    'allowOverlap',
    '`Bind<boolean \\| ((check: SchedulerTimeCheck) => boolean)>`',
    '`true`',
    'Whether what the user moves, resizes or saves may overlap another appointment of its group (any one, without groups). A function decides the whole check: `true` when the time is free.',
  ],
  ['allowOffHours', '`Bind<boolean>`', '`true`', 'Whether the user may put an appointment outside the work hours (of its resources, else the scheduler’s).'],
  ['keys.previousGroup / nextGroup', '`string[]`', '`Alt+Shift+ArrowLeft` / `…Right`', 'On a focused appointment, grouped: moves it to the group before or after.'],
];

const RESOURCE = [
  ['field', '`string`', '—', 'The appointment field that holds the item’s value (`roomId`), or a list of them (`ownerIds`).'],
  ['label', '`Bind<string>`', 'the field', 'The form’s label; how the cells and the tooltip name the kind.'],
  ['items', '`Bind<R[] \\| DataSource<R> \\| null>`', '`[]`', 'The items, in memory or from a data source (loaded once, then followed). Your data may be plain or reactive; the component reads it as it is. After changing it in place, call `refreshResources()` (or `refresh()`).'],
  ['valueExpr, displayExpr, colorExpr', '`string`', "`'id'`, `'text'`, `'color'`", 'The item fields of its value, its name and its colour.'],
  ['allowMultiple', '`Bind<boolean>`', '`false`', 'An appointment may have several: the field holds a list, the form has a tag box.'],
  ['useColorAsDefault', '`Bind<boolean>`', '`false`', 'Appointments take this kind’s colour (else the first kind whose item has one). Their own `color` wins.'],
  ['parentExpr', '`string`', '—', 'The item field naming its item of the kind above it in `groups`: nested, a group shows only its own.'],
  ['workStartHourExpr, workEndHourExpr, workDaysExpr', '`string`', "`'workStartHour'`, `'workEndHour'`, `'workDays'`", 'An item’s own work hours and days; they win over the scheduler’s (the innermost item’s, in nested groups).'],
];

const METHODS = [
  ['checkTime(appointment, start, end, options?)', 'Whether it may be there (`free`) and what is there: `overlapping`, `blocked`, `offHours`. `options`: `allDay`, `resources` (the values it would have).'],
  ['resourcesOf(appointment)', 'Its items by kind: `{ field, label, items: { value, text, color, item }[] }[]`.'],
  ['refreshResources()', 'Reads the items again, after you changed them in place.'],
  ['rangeFilter(range, fields, { resources })', 'The data layer’s filter for a range, now also for the resources shown (`{ roomId: [1, 2] }`, fields of one value).'],
];

const EVENTS = [
  ['onMoving / onResizing', 'Now also `resources`: the values its resource fields would get in another group. `cancel` starts `true` where the time is not free; `false` lets it go there.'],
  ['onMoveStart / onMoveEnd …', '`resources` too.'],
  ['onAppointmentClick / DblClick', '`group`: the resource values of the group it was clicked in.'],
  ['onCellClick / DblClick', '`cell.resources`: the cell’s group; a new appointment there gets them.'],
];

const KEYS = [
  ['Alt + Shift + Left / Right (on an appointment)', 'Moves it to the group before or after; Enter saves, Escape takes it back. Mirrored right to left.'],
  ['Arrows on the cells', 'Over every column: the days of each group (by date, the groups of each day).'],
];

export default function SchedulerResourcesPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Rooms, people and any other kind of resource: they colour the appointments, split the columns into groups (nested, or under each date), say when each one works and when nothing may be put in." />
      </p>

      <Section anchor="resources" title="Resources">
        <p>
          <Rich text="`resources` lists the kinds. An appointment holds an item's value in the kind's `field`; with `allowMultiple`, a list (one meeting, two people). The kind marked `useColorAsDefault` colours the appointments (else the first kind whose item has a colour); an appointment's own `color` wins. The tooltip names its items, and the form has a picker for each kind." />
        </p>
        <Example files={code('Resources.tsx', 'resource-data.ts')}>
          <Resources />
        </Example>
      </Section>

      <Section anchor="groups" title="Groups">
        <p>
          <Rich text="`groups` splits the columns: each item of the first kind, then each of the next under it (`parentExpr` keeps a person under their own room). The day, week, work week and month views show a head per level. `groupByDate` turns it round: each day, with the groups under it. A drag (or Alt + Shift + arrows) to another group changes the resource: in a list, only the group's own value changes." />
        </p>
        <Example files={code('Grouped.tsx', 'resource-data.ts')}>
          <Grouped />
        </Example>
      </Section>

      <Section anchor="header" title="A head of your own">
        <p>
          <Rich text="`resourceHeaderTemplate` draws a group's head: any MotifJS component, made for each head with the item, its name, colour, level and (by date) the date." />
        </p>
        <Example files={code('HeaderTemplate.tsx', 'resource-data.ts')}>
          <HeaderTemplate />
        </Example>
      </Section>

      <Section anchor="availability" title="Availability">
        <p>
          <Rich text="An item's own work hours and days (`workStartHour`, `workEndHour`, `workDays`) shade its columns. `blockedTimes` blocks a time, once or by a rule, for every resource or the ones named. `allowOffHours: false` keeps what the user moves or saves inside the work hours, `allowOverlap: false` keeps it off another appointment of its group; a function there decides it all. A box being moved shows where it may not go, and the form says why it cannot save." />
        </p>
        <Example files={code('Availability.tsx', 'resource-data.ts')}>
          <Availability />
        </Example>
      </Section>

      <Section anchor="data" title="From a data source">
        <p>
          <Rich text="A kind's `items` may be a data source: it is loaded once and followed (a filter, an added room). Appointments from a data source group the same way; with `remoteFiltering`, grouped by a field of one value, the source is asked for the resources shown too (`rangeFilter` with `resources`)." />
        </p>
        <Example files={[...code('ResourcesFromSource.tsx', 'resource-data.ts'), slowAdapterFile]}>
          <ResourcesFromSource />
        </Example>
        <Code
          code={`
// The same filter for a request of your own:
source.setFilter(rangeFilter(scheduler.visibleRange, scheduler.fields, { resources: { roomId: [1, 2] } }));
`}
        />
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable
          head={['Topic', 'Details']}
          rows={[
            ['Cells', 'A cell reads its group before its time ("Atlas, Ana Silva, Monday 26 October, 09:00") and a blocked time after it ("not available: Lunch").'],
            ['Heads', 'The heads of the groups are drawn only (`aria-hidden`): every cell names its group.'],
            ['Moving', 'Moving by the keys says where it would go, its group, and whether it is free there.'],
          ]}
        />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['scheduler.group-header (`inner`, `month`), group-swatch', 'Units: a group’s head at each level, and its item’s colour before the name.'],
            ['scheduler.group-divider (`inner`, `head`)', 'Unit: the line between groups (by date, between days), down the heads and the cells.'],
            ['scheduler.cell `blocked`, scheduler.unavailable', 'A cell in a blocked time, and a layer over it (a hatch).'],
            ['scheduler.drop-mark', 'Unit: the mark on a box where it may not go (with the `appointment` unit’s `invalid` state).'],
            ['scheduler.resource-swatch (`tooltip`), tooltip-resource-label, tooltip-resource-item', 'Units: an item’s colour in the form’s pickers and the tooltip; the tooltip’s lines of resources.'],
            ['.mx-scheduler__group-head', '`data-level`, `data-edge`; cells `data-edge`, `data-blocked`.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="SchedulerResource" />
        </h3>
        <ApiTable head={['Member', 'Type', 'Default', 'Description']} rows={RESOURCE} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'Arguments']} rows={EVENTS} />
      </Section>
    </>
  );
}
