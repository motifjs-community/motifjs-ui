import { reactive } from '@motifx/core';
import { Scheduler, Switch } from '@motifx-community/ui';
import { bookings, people, rooms, type Booking } from './resource-data';

/**
 * Columns grouped by room, then by the people of each room (`parentExpr`: a person's room). Drag a
 * booking to another person: only that person changes, the others stay on it. "Group by date" puts
 * the people under each day.
 */
export default function Grouped() {
  const s = reactive({ byDate: false });
  const resources = [
    { field: 'roomId', label: 'Room', items: rooms },
    { field: 'ownerIds', label: 'People', items: people, allowMultiple: true, parentExpr: 'roomId', useColorAsDefault: true },
  ];
  return (
    <div class="sched-demo">
      <Switch label="Group by date" x-model={() => s.byDate} />
      <Scheduler<Booking>
        appointments={bookings()}
        resources={resources}
        groups={['roomId', 'ownerIds']}
        groupByDate={() => s.byDate}
        views={['day', { type: 'workWeek', name: 'workWeek' }, 'month']}
        currentView="day"
        startDayHour={8}
        endDayHour={18}
      />
    </div>
  );
}
