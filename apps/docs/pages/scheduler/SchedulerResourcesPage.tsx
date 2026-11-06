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
  ['resources', '`Bind<SchedulerResource[]>`', '`[]`', 'The resource types the appointments use. Each one can color them, group the columns and add a picker to the form.'],
  ['groups', '`Bind<string[]>`', '`[]`', 'The resource fields the columns are grouped by, outer first (`[\'roomId\', \'ownerIds\']`). A view\'s own `groups` takes precedence, and `[]` there means none.'],
  ['groupByDate', '`Bind<boolean>`', '`false`', 'Places the groups under each date, instead of the dates under each group. A view\'s own value takes precedence.'],
  ['resourceHeaderTemplate', '`Bind<((context: ResourceHeaderContext) => ComponentBase) \\| null>`', '`null`', 'Customizes a group header in place of its name.'],
  ['blockedTimes', '`Bind<SchedulerBlockedTime[]>`', '`[]`', 'Times when nothing can be scheduled: `{ start, end, text?, allDay?, recurrenceRule?, resources? }`. They are shaded on the visible days, and with `resources` only for those resources.'],
  [
    'allowOverlap',
    '`Bind<boolean \\| ((check: SchedulerTimeCheck) => boolean)>`',
    '`true`',
    'Whether what the user moves, resizes or saves can overlap another appointment in its group, or any appointment without groups. A function makes the whole decision and returns `true` when the time is free.',
  ],
  ['allowOffHours', '`Bind<boolean>`', '`true`', 'Whether the user can place an appointment outside the work hours of its resources, or of the scheduler.'],
  ['keys.previousGroup / nextGroup', '`string[]`', '`Alt+Shift+ArrowLeft` / `…Right`', 'On a focused appointment in a grouped view, moves it to the previous or next group.'],
];

const RESOURCE = [
  ['field', '`string`', '—', 'The appointment field that holds the item value (`roomId`) or a list of values (`ownerIds`).'],
  ['label', '`Bind<string>`', 'The field', 'The form label, and the name of the type in cells and tooltips.'],
  ['items', '`Bind<R[] \\| DataSource<R> \\| null>`', '`[]`', 'The items, in memory or from a data source (loaded once and then tracked). Your data can be plain or reactive, and the component reads it as it is. After changing it in place, call `refreshResources()` or `refresh()`.'],
  ['valueExpr, displayExpr, colorExpr', '`string`', "`'id'`, `'text'`, `'color'`", 'The item fields for its value, name and color.'],
  ['allowMultiple', '`Bind<boolean>`', '`false`', 'Allows several per appointment. The field holds a list, and the form uses a tag box.'],
  ['useColorAsDefault', '`Bind<boolean>`', '`false`', 'Colors appointments by this type, otherwise by the first type with an item color. An appointment\'s own `color` takes precedence.'],
  ['parentExpr', '`string`', '—', 'The item field that references its parent item in the type above it in `groups`. When nested, a group shows only its own children.'],
  ['workStartHourExpr, workEndHourExpr, workDaysExpr', '`string`', "`'workStartHour'`, `'workEndHour'`, `'workDays'`", 'An item\'s own work hours and days, which override the scheduler\'s. In nested groups, the innermost item applies.'],
];

const METHODS = [
  ['checkTime(appointment, start, end, options?)', 'Whether it can be there (`free`) and what conflicts: `overlapping`, `blocked`, `offHours`. `options` accepts `allDay` and `resources`, the values it would have.'],
  ['resourcesOf(appointment)', 'Its items by type: `{ field, label, items: { value, text, color, item }[] }[]`.'],
  ['refreshResources()', 'Re-reads the items after they have been changed in place.'],
  ['rangeFilter(range, fields, { resources })', 'The data layer filter for a range, now also for the visible resources (`{ roomId: [1, 2] }`, for single-value fields).'],
];

const EVENTS = [
  ['onMoving / onResizing', 'These also include `resources`, the values its resource fields would get in another group. `cancel` starts as `true` where the time is not free, and `false` allows the move.'],
  ['onMoveStart / onMoveEnd …', 'This also includes `resources`.'],
  ['onAppointmentClick / DblClick', '`group` provides the resource values of the clicked group.'],
  ['onCellClick / DblClick', '`cell.resources` provides the group of the cell, and a new appointment there receives these values.'],
];

const KEYS = [
  ['Alt + Shift + Left / Right (on an appointment)', 'Moves it to the previous or next group. Enter saves, and Escape reverts. These keys are mirrored on right-to-left pages.'],
  ['Arrows on the cells', 'Above every column, showing the days of each group, or the groups of each day when grouping by date.'],
];

export default function SchedulerResourcesPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Resources such as rooms, people and equipment can color appointments, divide columns into groups (nested or under each date), and define when each resource is available and when time is blocked." />
      </p>

      <Section anchor="resources" title="Resources">
        <p>
          <Rich text="`resources` lists the resource types. An appointment holds an item's value in the type's `field`, or a list with `allowMultiple` (one meeting with two people). The type marked `useColorAsDefault` colors the appointments, otherwise the first type with an item color does, and an appointment's own `color` takes precedence. The tooltip lists the items, and the form has a picker for each type." />
        </p>
        <Example files={code('Resources.tsx', 'resource-data.ts')}>
          <Resources />
        </Example>
      </Section>

      <Section anchor="groups" title="Groups">
        <p>
          <Rich text="`groups` divides the columns by each item of the first type, then each item of the next under it (`parentExpr` keeps a person under their own room). The day, week, work week and month views show a header per level. `groupByDate` reverses this, showing each day with the groups under it. Dragging to another group, or pressing Alt + Shift + arrow, changes the resource. In a list, only the value for that group changes." />
        </p>
        <Example files={code('Grouped.tsx', 'resource-data.ts')}>
          <Grouped />
        </Example>
      </Section>

      <Section anchor="header" title="Custom group headers">
        <p>
          <Rich text="`resourceHeaderTemplate` customizes a group header. It can return any MotifJS component, and it is created for each header with the item, its name, color and level, and the date when grouping by date." />
        </p>
        <Example files={code('HeaderTemplate.tsx', 'resource-data.ts')}>
          <HeaderTemplate />
        </Example>
      </Section>

      <Section anchor="availability" title="Availability">
        <p>
          <Rich text="An item's own work hours and days (`workStartHour`, `workEndHour`, `workDays`) shade its columns. `blockedTimes` blocks a time, once or with a rule, for every resource or for specific ones. `allowOffHours: false` keeps what the user moves or saves within work hours, and `allowOverlap: false` prevents overlap with another appointment in the group. A function there makes the whole decision. A box being moved shows where it cannot go, and the form explains why it cannot save." />
        </p>
        <Example files={code('Availability.tsx', 'resource-data.ts')}>
          <Availability />
        </Example>
      </Section>

      <Section anchor="data" title="From a data source">
        <p>
          <Rich text="A type's `items` can be a data source, which is loaded once and then tracked for changes such as a filter or an added room. Appointments from a data source group the same way. With `remoteFiltering`, when grouping by a single-value field, the visible resources are also requested from the source (`rangeFilter` with `resources`)." />
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
            ['Cells', 'A cell announces its group before its time ("Atlas, Ana Silva, Monday 26 October, 09:00") and any blocked time after it ("not available: Lunch").'],
            ['Heads', 'Group headers are decorative (`aria-hidden`), because every cell names its group.'],
            ['Moving', 'Moving with the keyboard announces the destination, its group and whether it is free.'],
          ]}
        />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['scheduler.group-header (`inner`, `month`), group-swatch', 'Units: a group header at each level, and the item color before the name.'],
            ['scheduler.group-divider (`inner`, `head`)', 'Unit: the line between groups (or between days when grouping by date), across the headers and cells.'],
            ['scheduler.cell `blocked`, scheduler.unavailable', 'A cell in a blocked time, and a hatched layer over it.'],
            ['scheduler.drop-mark', 'Unit: the indicator on a box where it cannot go (with the `invalid` state of the `appointment` unit).'],
            ['scheduler.resource-swatch (`tooltip`), tooltip-resource-label, tooltip-resource-item', 'Units: an item color in the form pickers and tooltip, and the tooltip resource lines.'],
            ['.mx-scheduler__group-head', '`data-level`, `data-edge`. Cells have `data-edge` and `data-blocked`.'],
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
