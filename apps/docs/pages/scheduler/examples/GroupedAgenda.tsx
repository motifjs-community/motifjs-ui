import { Scheduler } from '@motifx-community/ui';
import { jobs, members, teams, type Job } from './timeline-data';

/** With `groups`, each team's days under its name, the jobs coloured by their person. */
export default function GroupedAgenda() {
  const resources = [
    { field: 'teamId', label: 'Team', items: teams },
    { field: 'ownerId', label: 'Person', items: members, useColorAsDefault: true },
  ];
  return (
    <div class="sched-demo">
      <Scheduler<Job>
        appointments={jobs()}
        resources={resources}
        views={[{ type: 'agenda', agendaDuration: 3, groups: ['teamId'] }, 'timelineDay']}
        currentView="agenda"
      />
    </div>
  );
}
