import { Scheduler, type AppointmentTemplateContext } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** The content of each appointment drawn by a template; the scheduler still places, colours and names it. */
export default function Templates() {
  const template = (c: AppointmentTemplateContext<Meeting>) =>
    c.allDay ? (
      <strong>{c.text}</strong>
    ) : (
      <div class="sched-card">
        <strong>{c.text}</strong>
        <span>{c.allDay ? 'All day' : c.time}</span>
        {c.appointment.color ? <span class="sched-tag">{c.appointment.color === '#c62828' ? 'urgent' : 'team'}</span> : <span class="sched-tag">personal</span>}
      </div>
    );
  return (
    <div class="sched-demo">
      <Scheduler<Meeting> appointments={sampleAppointments()} currentView="day" startDayHour={8} endDayHour={18} appointmentTemplate={template} />
    </div>
  );
}
