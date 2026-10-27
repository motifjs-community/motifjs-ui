import { Component } from '@motifx/core';
import { ResizeWatch } from '../../../core/resize-watch';
import { AppointmentBox } from './AppointmentBox';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
}

/**
 * The month view: a row per week, a cell per day (one grid, arrows move by a day and by a week),
 * and over each week its appointments as bars and chips in lines. Lines past the room a week has
 * become "+N more" on each day they leave out.
 */
export class MonthView<T> extends Component<HTMLDivElement, Props<T>> {
  private grid: HTMLElement | null = null;
  private lane: HTMLElement | null = null;
  private date: HTMLElement | null = null;
  private readonly watch = new ResizeWatch(() => this.measure());

  override onConfigured() {
    this.class.add('mx-scheduler__month-view');
    this.motif.setDisposable(() => this.watch.disconnect());
  }

  override onMounted() {
    if (this.grid) this.watch.observe(this.grid);
    this.measure();
    this.props.host.viewShown();
  }

  /** How many lines of appointments fit in a week, under its day numbers. */
  private measure(): void {
    const host = this.props.host;
    const weeks = host.model.state.weeks.length;
    if (!this.grid || !this.lane || !this.date || !weeks) return;
    const row = this.grid.clientHeight / weeks;
    const lane = this.lane.offsetHeight;
    if (!(row > 0 && lane > 0)) return;
    host.setMonthRoom(Math.max(1, Math.floor((row - this.date.offsetHeight) / lane)));
  }

  override view() {
    const host = this.props.host;
    const model = host.model;
    const st = model.state;
    const format = host.format;
    const t = host.text.bind(host);
    const focused = (day: number) => st.focus.day === day;
    return (
      <>
        <div class="mx-scheduler__weekdays" aria-hidden="true">
          {(st.weeks[0]?.days ?? []).map((day) => (
            <div key={day.index} class="mx-scheduler__weekday-name">
              {() => format.weekday(day.date)}
            </div>
          ))}
        </div>
        <div class="mx-scheduler__month-body" style={() => ({ '--_weeks': String(st.weeks.length) })}>
          <div
            class="mx-scheduler__month-grid"
            role="grid"
            aria-label={() => t('schedulerMonth')}
            ref={(c) => (this.grid = c.element as HTMLElement)}
            onkeydown={(e: KeyboardEvent) => host.gridKey(e)}
          >
            {st.weeks.map((week) => (
              <div key={week.index} class="mx-scheduler__week-row" role="row">
                {week.days.map((day) => (
                  <div
                    key={day.index}
                    class="mx-scheduler__cell mx-scheduler__month-cell"
                    role="gridcell"
                    data-cell={`${day.index}:-1`}
                    data-today={() => day.today || null}
                    data-outside={() => day.outside || null}
                    data-holiday={() => day.holiday || null}
                    data-weekend={() => day.weekend || null}
                    tabindex={() => (focused(day.index) ? 0 : -1)}
                    aria-selected={() => model.isSelected(day.index, -1)}
                    aria-label={() => format.fullDate(day.date)}
                    onpointerdown={(e: PointerEvent) => host.cellPointerDown({ day: day.index, slot: -1 }, e)}
                    onclick={(e: MouseEvent) => host.cellClick({ day: day.index, slot: -1 }, e)}
                    ondblclick={(e: MouseEvent) => host.cellDblClick({ day: day.index, slot: -1 }, e)}
                  >
                    <span class="mx-scheduler__day-number" aria-hidden="true">
                      {() => format.dayNumber(day.date)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div class="mx-scheduler__month-layer" role="group" aria-label={() => t('schedulerAppointments')}>
            {st.weeks.map((week) => (
              <div key={week.index} class="mx-scheduler__week-layer">
                {week.pieces.map((piece) => (
                  <AppointmentBox key={piece.id} host={host} piece={piece} />
                ))}
                {week.days.map((day) => (
                  <button
                    key={day.index}
                    type="button"
                    class="mx-scheduler__more"
                    x-display={() => (week.more[day.index - week.index * 7] ?? 0) > 0}
                    style={() => ({
                      gridColumn: String(day.index - week.index * 7 + 1),
                      gridRow: String((week.moreAt[day.index - week.index * 7] ?? 0) + 1),
                    })}
                    aria-label={() =>
                      t('schedulerMoreLabel', {
                        count: week.more[day.index - week.index * 7] ?? 0,
                        date: format.fullDate(day.date),
                      })
                    }
                    onclick={(e: MouseEvent) => host.openMore(day.date, e.currentTarget as HTMLElement)}
                  >
                    {() =>
                      t('schedulerMore', {
                        count: week.more[day.index - week.index * 7] ?? 0,
                      })
                    }
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div class="mx-scheduler__probe" aria-hidden="true">
            <div class="mx-scheduler__probe-lane" ref={(c) => (this.lane = c.element as HTMLElement)} />
            <div class="mx-scheduler__probe-date" ref={(c) => (this.date = c.element as HTMLElement)} />
          </div>
        </div>
      </>
    );
  }
}
