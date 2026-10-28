import { Scheduler, type ResourceHeaderContext } from '@motifx-community/ui';
import { bookings, people, rooms, type Booking, type Person } from './resource-data';

/** A person's head drawn by a template: their initials in their colour, their name and their room. */
function PersonHead(context: ResourceHeaderContext) {
  const person = context.item as Person;
  const initials = context.text
    .split(' ')
    .map((part) => part[0])
    .join('');
  const room = rooms.find((r) => r.id === person.roomId)?.text ?? '';
  return (
    <div class="sched-person">
      <span class="sched-person__avatar" style={{ '--person-color': context.color }} aria-hidden="true">
        {initials}
      </span>
      <span class="sched-person__name">
        <strong>{context.text}</strong>
        <small>{room}</small>
      </span>
    </div>
  );
}

/** Grouped by person, each head made by `resourceHeaderTemplate`. */
export default function HeaderTemplate() {
  const resources = [{ field: 'ownerIds', label: 'People', items: people, allowMultiple: true, useColorAsDefault: true }];
  return (
    <div class="sched-demo">
      <Scheduler<Booking>
        appointments={bookings()}
        resources={resources}
        groups={['ownerIds']}
        currentView="day"
        startDayHour={8}
        endDayHour={18}
        resourceHeaderTemplate={(context: ResourceHeaderContext) => PersonHead(context)}
      />
    </div>
  );
}
