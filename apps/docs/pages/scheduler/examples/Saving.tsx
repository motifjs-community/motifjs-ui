import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Scheduler } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** A service that saves late and refuses every third change. */
class PickyService extends SlowAdapter<Meeting, number> {
  private changes = 0;

  protected override async updateRow(key: number, changes: Partial<Meeting>): Promise<Partial<Meeting>> {
    await new Promise((done) => setTimeout(done, 700));
    if (++this.changes % 3 === 0) throw new Error('The server said no.');
    return super.updateRow(key, changes);
  }
}

/** Move an appointment: it waits where it was put while the server saves, and goes back when saving fails. */
export default function Saving() {
  const s = reactive({ said: 'Move an appointment: it waits for the server; every third change fails.' });
  const source = new data.DataSource<Meeting, number>({ adapter: new PickyService({ data: sampleAppointments(), key: 'id' }, 300), loadMode: 'all' });
  return (
    <div class="sched-demo" onDisposing={() => source.dispose()}>
      <Scheduler<Meeting>
        dataSource={source}
        currentView="workWeek"
        startDayHour={8}
        endDayHour={19}
        onAppointmentUpdated={(e) => (s.said = `Saved: ${e.appointment.text}`)}
        onDataError={(e) => (s.said = `Not saved (${(e.error as Error).message}); it is back where it was.`)}
      />
      <p class="sched-log" role="status">
        {() => s.said}
      </p>
    </div>
  );
}
