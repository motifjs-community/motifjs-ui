import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { RadioGroup, Scheduler, type SeriesEditMode } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { recurringAppointments, type Booking } from './recurring-appointments';

/**
 * The series come from a data source, as from a server. Drag an occurrence, change it in its form or
 * delete it: the scheduler asks what the change reaches, unless the setting answers, and writes
 * it through the adapter (an occurrence changed apart is a row of its own).
 */
export default function SeriesQuestion() {
  const s = reactive({ mode: 'ask' as SeriesEditMode, log: [] as string[] });
  let next = 100;
  const adapter = new SlowAdapter<Booking, number>({ data: recurringAppointments(), key: 'id', createKey: () => next++ }, 200);
  const source = new data.DataSource<Booking, number>({ adapter, loadMode: 'all' });
  const say = (text: string) => {
    s.log.unshift(text);
    if (s.log.length > 6) s.log.pop();
  };
  return (
    <div class="sched-demo" onDisposing={() => source.dispose()}>
      <RadioGroup
        label="A change to an occurrence reaches"
        orientation="horizontal"
        items={[
          { value: 'ask', text: 'Ask' },
          { value: 'occurrence', text: 'This one' },
          { value: 'following', text: 'This and following' },
          { value: 'series', text: 'The whole series' },
        ]}
        x-model={() => s.mode}
      />
      <Scheduler<Booking>
        dataSource={source}
        startDayHour={8}
        endDayHour={18}
        seriesEdit={() => s.mode}
        onSeriesAnswered={(e) => say(`Asked about ${e.appointment.text} (${e.action}): ${e.scope ?? 'cancelled'}`)}
        onAppointmentUpdated={(e) => say(`Saved ${e.appointment.text}${e.scope ? `, ${e.scope}` : ''}`)}
        onAppointmentDeleted={(e) => say(`Deleted ${e.appointment.text}${e.scope ? `, ${e.scope}` : ''}`)}
        onDataError={(e) => say(`Not saved: ${String(e.error)}${e.undone ? '' : ' (part of it was)'}`)}
      />
      <ol class="sched-events" aria-label="What happened">
        {s.log.map((line, i) => (
          <li key={`${i}-${line}`}>{line}</li>
        ))}
      </ol>
    </div>
  );
}
