import { reactive } from '@motifx/core';
import { Scheduler, Switch, type MoreListContext } from '@motifx-community/ui';
import { jobs, members, type Job } from './timeline-data';

/** A short list of its own for "+N more": the day and each job's name. */
function Jobs(context: MoreListContext<Job>) {
  return (
    <div class="sched-more">
      <strong>{() => context.date?.toLocaleDateString() ?? ''}</strong>
      {context.appointments.map((job) => (
        <button key={job.id} type="button" class="sched-more__item" onclick={(e: MouseEvent) => context.choose(job, e)}>
          {job.text}
        </button>
      ))}
    </div>
  );
}

/**
 * Views with settings of their own: a working day in half hours, a fortnight in four-hour cells
 * counted from a fixed Monday (`startDate`), and a month of days with at most two lanes a row
 * ("+N more" opens a list of its own). A setting not given is the scheduler's.
 */
export default function TimelineSettings() {
  const s = reactive({ dim: true });
  const resources = [{ field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true }];
  const monday = new Date(2026, 0, 5);
  return (
    <div class="sched-demo">
      <Switch label="Ended ones quieter" x-model={() => s.dim} />
      <Scheduler<Job>
        appointments={jobs()}
        resources={resources}
        groups={['ownerId']}
        views={[
          { type: 'timelineDay', name: 'workday', text: 'Workday', startDayHour: 8, endDayHour: 18, cellDuration: 30 },
          { type: 'timelineWeek', name: 'fortnight', text: 'Fortnight', intervalCount: 2, startDate: monday, cellDuration: 240 },
          { type: 'timelineMonth', name: 'month', text: 'Month', maxAppointmentsPerCell: 2, moreListTemplate: Jobs },
        ]}
        currentView="fortnight"
        dimPast={() => s.dim}
      />
    </div>
  );
}
