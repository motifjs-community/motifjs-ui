import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Agenda from './examples/Agenda';
import AgendaTemplates from './examples/AgendaTemplates';
import GroupedAgenda from './examples/GroupedAgenda';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['agendaDuration', '`Bind<number>`', '7', 'The number of days the agenda shows, starting from the displayed date. A view\'s own value takes precedence. Previous and next move by this number.'],
  ['groups', '`Bind<string[]>`', '`[]`', 'With groups, each group\'s days appear under its name, with that group\'s appointments.'],
  ['agendaRowTemplate', '`Bind<((context: AgendaRowContext) => Component) \\| null>`', '`null`', 'A row\'s content: `{ appointment, start, end, text, time, allDay, date, group }`. The row keeps its color, keys and accessible name.'],
  ['appointmentTooltipTemplate', '`Bind<((context: TooltipTemplateContext) => Component) \\| null>`', '`null`', 'The tooltip\'s content, in every view.'],
  ['texts.schedulerNoAppointments', '`string`', '"No appointments"', 'The message shown when the displayed days have no appointments (`uiLocale`).'],
];

const KEYS = [
  ['Up / Down', 'Moves to the row above or below and selects it.'],
  ['Home / End, PageUp / PageDown', 'Moves to the first or last row, or up or down one screen of rows.'],
  ['Space', 'Shows the tooltip, like a click.'],
  ['Enter', 'Opens the form, like a double-click.'],
  ['Delete', 'Deletes the appointment, after confirmation.'],
  ['T, N / P, A', 'Today, and the next and previous days. `keys.agendaView` (A) shows the agenda.'],
];

export default function SchedulerAgendaPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Displays upcoming days as a list, with each day's appointments in time order. Days without appointments are omitted." />
      </p>

      <Section anchor="agenda" title="Agenda">
        <p>
          <Rich text="`agenda` lists `agendaDuration` days, starting from the displayed date (7 by default). A multi-day appointment appears on each of its days, and an all-day appointment is labeled as such. The list is a list box, so the arrow keys move between rows, and Space and Enter act like a click and a double-click." />
        </p>
        <Example files={code('Agenda.tsx', 'sample-appointments.ts')}>
          <Agenda />
        </Example>
      </Section>

      <Section anchor="groups" title="Grouping by resource">
        <p>
          <Rich text="With `groups`, each group's days appear under its name. As in other views, a data source is asked only for the displayed days." />
        </p>
        <Example files={code('GroupedAgenda.tsx', 'timeline-data.ts')}>
          <GroupedAgenda />
        </Example>
      </Section>

      <Section anchor="templates" title="Templates">
        <p>
          <Rich text="`agendaRowTemplate` customizes a row's content, and `appointmentTooltipTemplate` customizes the tooltip here and in every view." />
        </p>
        <Example files={code('AgendaTemplates.tsx', 'timeline-data.ts')}>
          <AgendaTemplates />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable
          head={['Topic', 'Details']}
          rows={[
            ['List', 'A list box. Each day, within its group, is a group of options named by the day.'],
            ['Rows', 'One option per appointment, with its text, its time, whether it continues and how it repeats. The focused row is the selected row.'],
            ['Empty', 'When there are no appointments, the list is omitted and a message appears instead.'],
          ]}
        />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'Description']}
          rows={[
            ['scheduler.agenda, agenda-group (`first`), agenda-resource', 'Units: the list, a day and the line above it, and a group name.'],
            ['scheduler.agenda-day (`today`), agenda-weekday (`today`), agenda-month, day-number `agenda`', 'Units: a day header and its parts.'],
            ['scheduler.agenda-row (`hover`, `selected`, `open`, `focus`, `past`, `disabled`), agenda-content', 'Units: a row and its side-by-side parts.'],
            ['scheduler.agenda-time, agenda-dot, agenda-text, agenda-empty', 'Units: the time column, the appointment color (hidden unless a design language draws it), the text and the empty message.'],
            ['agenda-time-width', 'Plain token: the width of the time column.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
      </Section>
    </>
  );
}
