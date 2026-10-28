import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import Agenda from './examples/Agenda';
import AgendaTemplates from './examples/AgendaTemplates';
import GroupedAgenda from './examples/GroupedAgenda';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['agendaDuration', '`Bind<number>`', '7', 'The days the agenda shows, from the date shown; a view’s own wins. Previous and next move by them.'],
  ['groups', '`Bind<string[]>`', '`[]`', 'With groups, each group’s days stand under its name (the group’s own appointments).'],
  ['agendaRowTemplate', '`Bind<((context: AgendaRowContext) => Component) \\| null>`', '`null`', 'A row’s content: `{ appointment, start, end, text, time, allDay, date, group }`; the row keeps its colour, keys and name.'],
  ['appointmentTooltipTemplate', '`Bind<((context: TooltipTemplateContext) => Component) \\| null>`', '`null`', 'The tooltip’s content, in every view.'],
  ['texts.schedulerNoAppointments', '`string`', '"No appointments"', 'What it says when its days have none (`uiLocale`).'],
];

const KEYS = [
  ['Up / Down', 'The row above or below (it is the selected one).'],
  ['Home / End, PageUp / PageDown', 'The first and the last row; a screen of rows.'],
  ['Space', 'Shows the tooltip, as a click does.'],
  ['Enter', 'Opens the form, as a double click does.'],
  ['Delete', 'Deletes the appointment (asking first).'],
  ['T, N / P, A', 'Today, the next and the previous days; `keys.agendaView` (A) shows the agenda.'],
];

export default function SchedulerAgendaPage() {
  return (
    <>
      <p class="lead">The coming days as a list: each day with its appointments in time order, a day with none left out.</p>

      <Section anchor="agenda" title="Agenda">
        <p>
          <Rich text="`agenda` lists `agendaDuration` days from the date shown (7 by default). An appointment that lasts days is on each of them; one that takes the day says so. The list is a list box: the arrows move over its rows, and Space and Enter do what a click and a double click do." />
        </p>
        <Example files={code('Agenda.tsx', 'sample-appointments.ts')}>
          <Agenda />
        </Example>
      </Section>

      <Section anchor="groups" title="By resource">
        <p>
          <Rich text="With `groups`, each group's days stand under its name. A data source is asked for the days shown, as in the other views." />
        </p>
        <Example files={code('GroupedAgenda.tsx', 'timeline-data.ts')}>
          <GroupedAgenda />
        </Example>
      </Section>

      <Section anchor="templates" title="Templates">
        <p>
          <Rich text="`agendaRowTemplate` draws a row's content; `appointmentTooltipTemplate` the tooltip's, here and in every view." />
        </p>
        <Example files={code('AgendaTemplates.tsx', 'timeline-data.ts')}>
          <AgendaTemplates />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable
          head={['Topic', 'How']}
          rows={[
            ['List', 'A list box; each day (in its group) is a group of options named by the day.'],
            ['Rows', 'An option per appointment: its text, its time, whether it goes on and how it repeats. The focused row is the selected one.'],
            ['Empty', 'With no appointments the list is left out and the text says so.'],
          ]}
        />
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable
          head={['Hook', 'What it is']}
          rows={[
            ['scheduler.agenda, agenda-group (`first`), agenda-resource', 'Units: the list, a day (and the line over it), a group’s name.'],
            ['scheduler.agenda-day (`today`), agenda-weekday (`today`), agenda-month, day-number `agenda`', 'Units: a day’s head and its parts.'],
            ['scheduler.agenda-row (`hover`, `selected`, `open`, `focus`, `past`, `disabled`), agenda-content', 'Units: a row and its parts side by side.'],
            ['scheduler.agenda-time, agenda-dot, agenda-text, agenda-empty', 'Units: the time column, the appointment’s colour (none unless a language draws it), the text, the empty text.'],
            ['agenda-time-width', 'Plain token: the time column’s width.'],
          ]}
        />
      </Section>

      <Section anchor="api" title="API reference">
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
      </Section>
    </>
  );
}
