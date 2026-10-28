import { Button, Scheduler, type AgendaRowContext, type TooltipTemplateContext } from '@motifx-community/ui';
import { jobs, members, type Job } from './timeline-data';

/**
 * An agenda row drawn by `agendaRowTemplate` (the person's name after the job), and a tooltip of
 * its own (`appointmentTooltipTemplate`) with the time and a button to open the form. The row
 * keeps its colour, keys and name.
 */
export default function AgendaTemplates() {
  const resources = [{ field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true }];
  const person = (job: Job) => members.find((m) => m.id === job.ownerId)?.text ?? '';
  const row = (c: AgendaRowContext<Job>) => (
    <span class="sched-agenda-row">
      <strong>{c.time}</strong>
      <span>{c.text}</span>
      <small>{person(c.appointment)}</small>
    </span>
  );
  const tip = (c: TooltipTemplateContext<Job>) => (
    <div class="sched-tip">
      <strong>{() => c.text}</strong>
      <span>{() => c.time}</span>
      <span>{() => (c.appointment ? person(c.appointment) : '')}</span>
      <Button text="Open" visible={() => c.canEdit} onclick={() => c.edit()} />
    </div>
  );
  return (
    <div class="sched-demo">
      <Scheduler<Job>
        appointments={jobs()}
        resources={resources}
        views={[{ type: 'agenda', agendaDuration: 2 }, 'week']}
        currentView="agenda"
        agendaRowTemplate={row}
        appointmentTooltipTemplate={tip}
      />
    </div>
  );
}
