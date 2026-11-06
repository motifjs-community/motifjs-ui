import { reactive } from '@motifx/core';
import { Scheduler, Slider, type AppointmentFormContext, type FormTemplateContext, type SchedulerForm } from '@motifx-community/ui';
import { bookings, people, rooms, type Booking } from './resource-data';

type Rated = Booking & { priority?: number };

const COLORS = ['#1565c0', '#2e7d32', '#ad1457', '#ef6c00', '#455a64'];

/** A custom component as an editor: a row of colors bound to the form's data. */
function ColorChoice(form: AppointmentFormContext<Rated>, place: FormTemplateContext) {
  const data = form.data as Record<string, unknown>;
  return (
    <div class="sched-colors" role="group" aria-label="Colour">
      <span class="sched-colors__label">Colour</span>
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          class="sched-colors__swatch"
          style={{ background: color }}
          aria-label={color}
          aria-pressed={() => data[place.field] === color}
          onclick={() => (data[place.field] = data[place.field] === color ? '' : color)}
        />
      ))}
    </div>
  );
}

/**
 * Editors of your own: a slider made by a function (it takes the props a named editor gets, so it
 * is checked with the form), and a row of colours from a template. A rule of the form's own: an
 * interview needs two people.
 */
export default function CustomEditors() {
  const form: SchedulerForm<Rated> = {
    items: [
      'text',
      'start',
      'end',
      { field: 'priority', label: 'Priority', editor: (props) => new Slider({ ...props, min: 1, max: 5, step: 1 }), colSpan: 'all' },
      { field: 'color', colSpan: 'all', template: ColorChoice },
      'roomId',
      {
        field: 'ownerIds',
        rules: (f) => [
          {
            type: 'custom',
            ignoreEmpty: false,
            check: (value: unknown) => !/interview/i.test(String(f.data.text)) || (Array.isArray(value) && value.length >= 2) || 'An interview needs two people.',
          },
        ],
      },
      'description',
    ],
  };
  const appointments = reactive(bookings().map((b) => ({ ...b, priority: 3 }))) as Rated[];
  return (
    <div class="sched-demo">
      <Scheduler<Rated>
        appointments={appointments}
        resources={[
          { field: 'roomId', label: 'Room', items: rooms },
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
