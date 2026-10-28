import { reactive } from '@motifx/core';
import { RadioGroup, Scheduler } from '@motifx-community/ui';
import { bookings, people, rooms, type Booking } from './resource-data';

/**
 * Two kinds of resources: a booking has one room and one or more people. Their colours paint the
 * bookings; the choice says which kind does (`useColorAsDefault`, a function, so it follows).
 * Click a booking: the tooltip names its room and its people.
 */
export default function Resources() {
  const s = reactive({ by: 'room' });
  const resources = [
    { field: 'roomId', label: 'Room', items: rooms, useColorAsDefault: () => s.by === 'room' },
    { field: 'ownerIds', label: 'People', items: people, allowMultiple: true, useColorAsDefault: () => s.by === 'people' },
  ];
  return (
    <div class="sched-demo">
      <RadioGroup
        label="Colour by"
        orientation="horizontal"
        items={[
          { value: 'room', text: 'Room' },
          { value: 'people', text: 'People' },
        ]}
        itemText="text"
        itemValue="value"
        x-model={() => s.by}
      />
      <Scheduler<Booking> appointments={bookings()} resources={resources} currentView="week" startDayHour={8} endDayHour={18} />
    </div>
  );
}
