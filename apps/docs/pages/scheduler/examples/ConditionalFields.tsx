import { Scheduler, type SchedulerForm } from '@motifx-community/ui';
import { bookings, people, rooms, type Booking } from './resource-data';

type Catered = Booking & { catering?: boolean; guests?: number };

/**
 * Fields for one appointment only, each a function of the form: catering shows only for
 * Cappadocia (the big room), the number of guests only with catering; a booking that has begun
 * keeps its room; the people are needed for an interview.
 */
export default function ConditionalFields() {
  const now = new Date();
  const form: SchedulerForm<Catered> = {
    items: [
      'text',
      'start',
      'end',
      { field: 'roomId', readOnly: (f) => !f.isNew && !!f.appointment && f.appointment.startDate < now, helpText: (f) => (!f.isNew && !!f.appointment && f.appointment.startDate < now ? 'It has begun: the room stays.' : '') },
      { field: 'catering', label: 'Catering', editor: 'switch', visible: (f) => f.data.roomId === 3 },
      { field: 'guests', label: 'Guests', editor: 'number', editorProps: { min: 1, max: 40 }, visible: (f) => f.data.roomId === 3 && !!f.data.catering, required: true },
      { field: 'ownerIds', required: (f) => /interview/i.test(String(f.data.text)) },
      'description',
    ],
  };
  return (
    <div class="sched-demo">
      <Scheduler<Catered>
        appointments={bookings()}
        resources={[
          { field: 'roomId', label: 'Room', items: rooms, useColorAsDefault: true },
          { field: 'ownerIds', label: 'People', items: people, allowMultiple: true },
        ]}
        currentView="workWeek"
        startDayHour={8}
        endDayHour={18}
        editing={{ allowRecurrence: false, form }}
      />
    </div>
  );
}
