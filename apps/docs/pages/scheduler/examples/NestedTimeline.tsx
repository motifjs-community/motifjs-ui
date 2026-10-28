import { reactive } from '@motifx/core';
import { Scheduler, Switch } from '@motifx-community/ui';
import { jobs, members, teams, type Job } from './timeline-data';

/**
 * Rows grouped by team, then by the people of each team (`parentExpr`). Up and Down on a job move it
 * to the row above or below; Left and Right move it along the time. "Right to left" mirrors the
 * time and the resource column.
 */
export default function NestedTimeline() {
  const s = reactive({ rtl: false });
  const resources = [
    { field: 'teamId', label: 'Team', items: teams },
    { field: 'ownerId', label: 'Person', items: members, parentExpr: 'teamId', useColorAsDefault: true },
  ];
  return (
    <div class="sched-demo" dir={() => (s.rtl ? 'rtl' : 'ltr')}>
      <Switch label="Right to left" x-model={() => s.rtl} />
      <Scheduler<Job>
        appointments={jobs()}
        resources={resources}
        groups={['teamId', 'ownerId']}
        views={['timelineDay', 'timelineWorkWeek']}
        currentView="timelineDay"
        startDayHour={7}
        endDayHour={21}
      />
    </div>
  );
}
