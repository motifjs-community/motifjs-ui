import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { CheckBox, Scheduler } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';
import { bookings, rooms, type Booking, type Room } from './resource-data';

/**
 * The rooms and the bookings both come from data sources that answer late. The rooms load once and
 * are followed: filter them and the groups change. Grouped by room, the bookings are asked for the
 * days and the rooms shown only.
 */
export default function ResourcesFromSource() {
  const s = reactive({ two: false, asked: '' });
  const roomSource = new data.DataSource<Room, number>({ adapter: new SlowAdapter<Room, number>({ data: rooms, key: 'id' }, 400), loadMode: 'all' });
  const source = new data.DataSource<Booking, number>({ adapter: new SlowAdapter<Booking, number>({ data: bookings(), key: 'id' }, 600), loadMode: 'all' });
  source.onChanged((e) => {
    if (e.reason !== 'loading') return;
    const rooms = JSON.stringify((source.filter as { and?: unknown[] } | null)?.and?.slice(2) ?? []);
    s.asked = `Asked for the rooms: ${rooms}`;
  });
  const onlyTwo = (on: boolean) => void roomSource.setFilter(on ? { field: 'id', op: 'in', value: [1, 2] } : null);
  return (
    <div
      class="sched-demo"
      onDisposing={() => {
        source.dispose();
        roomSource.dispose();
      }}
    >
      <CheckBox
        label="Only Atlas and Bosphorus"
        x-model={() => s.two}
        onValueChanged={(e: { value: boolean | null }) => onlyTwo(!!e.value)}
      />
      <Scheduler<Booking>
        dataSource={source}
        resources={[{ field: 'roomId', label: 'Room', items: roomSource }]}
        groups={['roomId']}
        currentView="workWeek"
        startDayHour={8}
        endDayHour={18}
      />
      <p class="sched-log">{() => s.asked}</p>
    </div>
  );
}
