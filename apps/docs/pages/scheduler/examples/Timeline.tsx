import { Scheduler } from '@motifx-community/ui';
import { jobs, members, type Job } from './timeline-data';

/**
 * The four timeline views, a row per person. Jobs at the same time stack in their row, and the row
 * grows. Drag one along its row or to another person; drag its ends to change its time.
 */
export default function Timeline() {
  const resources = [{ field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true }];
  return (
    <div class="sched-demo">
      <Scheduler<Job>
        appointments={jobs()}
        resources={resources}
        groups={['ownerId']}
        views={['timelineDay', 'timelineWeek', 'timelineWorkWeek', 'timelineMonth']}
        currentView="timelineWeek"
        startDayHour={7}
        endDayHour={20}
        cellDuration={60}
      />
    </div>
  );
}
