import { Scheduler, type FormOpeningEventArgs } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

type Booking = Meeting & { room?: string };

const rooms = [
  { value: 'blue', text: 'Blue room' },
  { value: 'green', text: 'Green room' },
  { value: 'online', text: 'Online' },
];

/** The form gets a field of its own (a room) and loses the description; the room is written to the appointment's `room` field. */
export default function CustomForm() {
  const opening = (e: FormOpeningEventArgs<Booking>) => {
    e.data.room = e.appointment?.room ?? 'online';
    e.items.splice(
      e.items.findIndex((item) => item.field === 'description'),
      1,
    );
    e.items.push({ field: 'room', label: 'Room', editor: 'dropdown', editorProps: { items: rooms }, colSpan: 'all' });
    e.form.title = e.appointment ? `Edit ${e.appointment.text}` : 'Book a room';
  };
  return (
    <div class="sched-demo">
      <Scheduler<Booking> appointments={sampleAppointments()} currentView="day" startDayHour={8} endDayHour={18} onFormOpening={opening} />
    </div>
  );
}
