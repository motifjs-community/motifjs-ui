import { Scheduler, type SchedulerForm } from '@motifx-community/ui';
import { bookings, people, rooms, type Booking } from './resource-data';

/**
 * The form set up by `editing.form` alone: the title on top with a rule of its own, then three tabs.
 * Built-in items and resources are named by their fields; the time zone row (`timeZone`) and the
 * recurrence editor are items like the others. Double-click a booking.
 */
export default function DeclaredForm() {
  const form: SchedulerForm<Booking> = {
    columns: 2,
    items: [
      { field: 'text', label: 'Subject', rules: [{ type: 'length', min: 3, message: 'At least three letters.' }] },
      {
        tabs: [
          { title: 'When', items: ['start', 'end', 'timeZone', 'allDay', 'recurrenceRule'] },
          { title: 'Where and who', columns: 1, items: ['roomId', 'ownerIds'] },
          { title: 'Notes', columns: 1, items: [{ field: 'description', label: 'Agenda' }] },
        ],
      },
    ],
  };
  return (
    <div class="sched-demo">
      <Scheduler<Booking>
        appointments={bookings()}
        resources={[
          { field: 'roomId', label: 'Room', items: rooms, useColorAsDefault: true },
          { field: 'ownerIds', label: 'People', items: people, allowMultiple: true },
        ]}
        currentView="workWeek"
        startDayHour={8}
        endDayHour={18}
        editing={{ allowTimeZones: true, form }}
      />
    </div>
  );
}
