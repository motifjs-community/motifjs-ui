import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Scheduler } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** Appointments from a data source that responds with a delay, like a server. Only the displayed days are requested. */
export default function FromSource() {
  const asked = reactive({ text: '' });
  const adapter = new SlowAdapter<Meeting, number>({ data: sampleAppointments(), key: 'id' }, 600);
  const source = new data.DataSource<Meeting, number>({
    adapter,
    // 'all': a view needs every appointment of its days, and the scheduler requests only those days.
    loadMode: 'all',
  });
  source.onChanged((e) => {
    if (e.reason !== 'loading') return;
    const filter = JSON.stringify(source.filter);
    asked.text = `Asked: ${filter.length > 140 ? filter.slice(0, 140) + '…' : filter}`;
  });
  return (
    <div class="sched-demo" onDisposing={() => source.dispose()}>
      <Scheduler<Meeting> dataSource={source} currentView="month" />
      <p class="sched-log">{() => asked.text}</p>
    </div>
  );
}
