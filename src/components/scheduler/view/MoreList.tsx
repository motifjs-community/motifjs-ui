import type { SchedulerHost } from './scheduler-host';

/** What the "+N more" list shows: a day and all of its appointments. */
export interface MoreListState<T> {
  date: Date | null;
  items: T[];
}

interface Props<T> {
  host: SchedulerHost<T>;
  state: MoreListState<T>;
  choose: (item: T, e: MouseEvent) => void;
}

/** The list that "+N more" opens: the day, then each appointment of it with its time. */
export function MoreList<T>(props: Props<T>) {
  const { host, state, choose } = props;
  const format = host.format;
  const text = (item: T) => {
    const value = (item as Record<string, unknown>)?.[host.fields().text];
    return value === undefined || value === null || value === '' ? host.text('schedulerNoTitle') : String(value);
  };
  const time = (item: T) => {
    const when = host.model.timeOf(item);
    return !when || when.allDay ? host.text('schedulerAllDay') : format.timeRange(when.start, when.end);
  };
  const color = (item: T) => {
    const value = (item as Record<string, unknown>)?.[host.fields().color];
    return { '--_color': typeof value === 'string' ? value : '' };
  };
  return (
    <div class="mx-scheduler__more-list">
      <div class="mx-scheduler__more-title">{() => (state.date ? format.fullDate(state.date) : '')}</div>
      <div class="mx-scheduler__more-items" role="list">
        {state.items.map((item) => (
          <div key={host.model.idOf(item)} role="listitem">
            <button type="button" class="mx-scheduler__more-item" style={() => color(item)} onclick={(e: MouseEvent) => choose(item, e)}>
              <span class="mx-scheduler__more-time">{() => time(item)}</span>
              <span class="mx-scheduler__more-text">{() => text(item)}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
