import type { ScaleCell } from '../model/scale-cell';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
}

/**
 * The head of a timeline, standing at the top while the rows scroll: over the resource column the
 * names of the kinds grouped by, over the cells two tiers (the days over their hours; the months
 * over their days). Only the heads over the cells built are built; a template may draw a day or an
 * hour.
 */
export function TimelineScale<T>(props: Props<T>) {
  const { host } = props;
  const model = host.model;
  const st = model.state;
  const format = host.format;
  const kinds = () => st.groups[0]?.path.map((p) => ({ field: p.field, label: host.resources.kind(p.field)?.label ?? p.field })) ?? [];
  const place = (cell: ScaleCell) => ({ gridColumn: `${cell.first + 1} / span ${cell.span}` });
  const upperText = (cell: ScaleCell) => (cell.kind === 'month' ? format.monthYear(cell.day.date) : format.fullDate(cell.day.date));
  const dateContext = (cell: ScaleCell) => ({
    get date() {
      return cell.day.date;
    },
    get weekday() {
      return format.weekday(cell.day.date);
    },
    get number() {
      return format.dayNumber(cell.day.date);
    },
    get today() {
      return cell.day.today;
    },
    get view() {
      return model.view.type;
    },
    resources: null,
  });
  const timeContext = (cell: ScaleCell) => ({
    get date() {
      return model.zone.date(cell.day.wall + cell.minutes * 60_000);
    },
    get minutes() {
      return cell.minutes;
    },
    get text() {
      return format.hour(cell.minutes);
    },
    get view() {
      return model.view.type;
    },
  });
  /** A day of the lower tier (the timeline month's), as a day's head of the day views is. */
  const day = (cell: ScaleCell) =>
    host.dateTemplate() ? (
      <div class="mx-scheduler__scale-content">{host.dateTemplate()!(dateContext(cell))}</div>
    ) : (
      <div class="mx-scheduler__scale-content">
        <span class="mx-scheduler__weekday">{() => format.weekday(cell.day.date)}</span>
        <span class="mx-scheduler__day-number">{() => format.dayNumber(cell.day.date)}</span>
      </div>
    );
  const hour = (cell: ScaleCell) =>
    host.timeTemplate() ? (
      <div class="mx-scheduler__scale-content">{host.timeTemplate()!(timeContext(cell))}</div>
    ) : (
      <div class="mx-scheduler__scale-content">{() => format.hour(cell.minutes)}</div>
    );
  return (
    <div class="mx-scheduler__scale" aria-hidden="true">
      <div class="mx-scheduler__corner">
        {kinds().map((kind) => (
          <div key={kind.field} class="mx-scheduler__corner-label">
            {kind.label}
          </div>
        ))}
      </div>
      <div class="mx-scheduler__scale-area">
        <div class="mx-scheduler__scale-tier" data-tier="upper">
          {st.upper
            .filter((cell) => model.ticksShown(cell.first, cell.span))
            .map((cell) => (
              <div
                key={cell.key}
                class="mx-scheduler__scale-cell"
                data-tier="upper"
                data-today={() => (cell.kind === 'day' && cell.day.today) || null}
                style={() => place(cell)}
              >
                {cell.kind === 'day' && host.dateTemplate() ? (
                  <div class="mx-scheduler__scale-content">{host.dateTemplate()!(dateContext(cell))}</div>
                ) : (
                  <div class="mx-scheduler__scale-content">{() => upperText(cell)}</div>
                )}
              </div>
            ))}
        </div>
        <div class="mx-scheduler__scale-tier" data-tier="lower">
          {st.lower
            .filter((cell) => model.ticksShown(cell.first, cell.span))
            .map((cell) => (
              <div
                key={cell.key}
                class="mx-scheduler__scale-cell"
                data-tier="lower"
                data-kind={cell.kind}
                data-today={() => cell.day.today || null}
                data-weekend={() => (cell.kind === 'day' && cell.day.weekend) || null}
                data-day-start={() => (cell.kind === 'hour' && cell.dayStart) || null}
                style={() => place(cell)}
              >
                {() => {
                  switch (cell.kind) {
                    case 'day':
                      return day(cell);
                    default:
                      return hour(cell);
                  }
                }}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
