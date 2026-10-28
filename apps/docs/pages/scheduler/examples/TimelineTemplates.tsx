import { Scheduler, type AppointmentTemplateContext, type CellTemplateContext, type DateTemplateContext, type ResourceHeaderContext, type TimeTemplateContext } from '@motifx-community/ui';
import { jobs, members, type Job, type Member } from './timeline-data';

/**
 * Templates, for the scheduler and for one view: the person's head with their hours, each day's
 * head, the hours, a mark on the cells outside the work hours (in the week only: a view's own
 * template wins) and the job's content.
 */
export default function TimelineTemplates() {
  const resources = [{ field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true }];
  const head = (c: ResourceHeaderContext) => {
    const person = c.item as Member;
    return (
      <div class="sched-person">
        <span class="sched-person__avatar" style={{ '--person-color': c.color }} aria-hidden="true">
          {c.text
            .split(' ')
            .map((p) => p[0])
            .join('')}
        </span>
        <span class="sched-person__name">
          <strong>{c.text}</strong>
          <small>{`${person.workStartHour ?? 9}:00–${person.workEndHour ?? 17}:00`}</small>
        </span>
      </div>
    );
  };
  const date = (c: DateTemplateContext) => <span class="sched-date">{`${c.weekday} ${c.number}`}</span>;
  const time = (c: TimeTemplateContext) => <span class="sched-time">{c.text}</span>;
  const cell = (c: CellTemplateContext) => <span class="sched-off" data-off={() => (!c.work ? '' : null)} aria-hidden="true" />;
  const job = (c: AppointmentTemplateContext<Job>) => (
    <span class="sched-job">
      <strong>{c.text}</strong> <span>{c.time}</span>
    </span>
  );
  return (
    <div class="sched-demo">
      <Scheduler<Job>
        appointments={jobs()}
        resources={resources}
        groups={['ownerId']}
        views={['timelineDay', { type: 'timelineWeek', dataCellTemplate: cell }]}
        currentView="timelineWeek"
        startDayHour={7}
        endDayHour={20}
        cellDuration={60}
        resourceHeaderTemplate={head}
        dateCellTemplate={date}
        timeCellTemplate={time}
        appointmentTemplate={job}
      />
    </div>
  );
}
