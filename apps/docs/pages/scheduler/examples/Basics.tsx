import { reactive } from '@motifx/core';
import { Scheduler } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** A week of appointments; double-click an appointment or a time and the log says what you chose. */
export default function Basics() {
  const state = reactive({
    appointments: sampleAppointments(),
    said: 'Double-click an appointment or a time.',
  });
  return (
    <div class="sched-demo">
      <Scheduler<Meeting>
        appointments={state.appointments}
        startDayHour={7}
        endDayHour={21}
        onAppointmentDblClick={(e) => (state.said = `Open: ${e.appointment.text}`)}
        onCellDblClick={(e) => (state.said = `New at ${e.cell.start.toLocaleString()}`)}
      />
      <p class="sched-log" role="status">
        {() => state.said}
      </p>
    </div>
  );
}
