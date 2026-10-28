import { pencilMark, trashMark } from '../../../core/glyphs';
import { Button } from '../../button/Button';
import type { SchedulerHost } from './scheduler-host';

/** The appointment the tooltip shows. */
export interface TooltipState<T> {
  item: T | null;
}

interface Props<T> {
  host: SchedulerHost<T>;
  state: TooltipState<T>;
  canEdit: (item: T) => boolean;
  canDelete: (item: T) => boolean;
  edit: (item: T) => void;
  remove: (item: T) => void;
}

/** What a click on an appointment shows: its colour, text, time and description, with Edit and Delete. */
export function AppointmentTooltip<T>(props: Props<T>) {
  const { host, state } = props;
  const record = () => state.item as Record<string, unknown> | null;
  const text = () => {
    const value = record()?.[host.fields().text];
    return value === undefined || value === null || value === '' ? host.text('schedulerNoTitle') : String(value);
  };
  const when = () => {
    const time = state.item ? host.model.timeOf(state.item) : null;
    if (!time) return '';
    if (time.allDay) return host.format.range('day', time.start, time.end);
    const sameDay = time.start.toDateString() === new Date(Math.max(time.start.getTime(), time.end.getTime() - 1)).toDateString();
    return sameDay
      ? `${host.format.fullDate(time.start)}, ${host.format.timeRange(time.start, time.end)}`
      : `${host.format.fullDate(time.start)} ${host.format.time(time.start)} – ${host.format.fullDate(time.end)} ${host.format.time(time.end)}`;
  };
  const description = () => String(record()?.[host.fields().description] ?? '');
  const color = () => {
    const value = record()?.[host.fields().color];
    return { '--_color': typeof value === 'string' ? value : '' };
  };
  return (
    <div class="mx-scheduler__tooltip" style={color}>
      <div class="mx-scheduler__tooltip-title">{text}</div>
      <div class="mx-scheduler__tooltip-time">{when}</div>
      <div class="mx-scheduler__tooltip-description" x-display={() => description() !== ''}>
        {description}
      </div>
      <div class="mx-scheduler__tooltip-actions">
        <Button
          text={() => host.text('schedulerEdit')}
          icon={pencilMark()}
          visible={() => !!state.item && props.canEdit(state.item)}
          onclick={() => state.item && props.edit(state.item)}
        />
        <Button
          text={() => host.text('schedulerDelete')}
          icon={trashMark()}
          tone="danger"
          visible={() => !!state.item && props.canDelete(state.item)}
          onclick={() => state.item && props.remove(state.item)}
        />
      </div>
    </div>
  );
}
