import { Component } from '@motifx/core';
import type { SchedulerDay } from '../model/scheduler-day';
import type { TimeSlot } from '../model/time-slot';
import { AppointmentBox } from './AppointmentBox';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
}

/**
 * The day, week and work week views: the dates on top, the all-day panel under them, then the
 * hours down with a column per day. The cells are one grid (arrows, Shift to select); the
 * appointments lie over it in their own layer, each placed by its piece. Changing the date fills
 * the same rows and columns in place.
 */
export class TimeView<T> extends Component<HTMLDivElement, Props<T>> {
  private head: HTMLElement | null = null;

  override onConfigured() {
    this.class.add('mx-scheduler__time-view');
  }

  override onMounted() {
    this.props.host.viewShown();
  }

  override onDisposing() {
    this.props.host.setScroller(null);
  }

  override view() {
    const host = this.props.host;
    const model = host.model;
    const st = model.state;
    const format = host.format;
    const t = host.text.bind(host);
    const cellTime = (day: SchedulerDay, slot: TimeSlot) => model.zone.date(day.wall + slot.minutes * 60_000);
    const work = (day: SchedulerDay, slot: TimeSlot) => {
      const hours = host.workHours();
      return day.work && slot.minutes >= hours.start * 60 && slot.minutes < hours.end * 60;
    };
    const focused = (day: number, slot: number) => st.focus.day === day && st.focus.slot === slot;
    const allDayLines = () => Math.max(1, Math.min(st.allDay.lanes, host.allDayLines() + 1));
    const columns = () => ({ '--_days': String(st.days.length) });
    return (
      <>
        <div class="mx-scheduler__head" style={columns} ref={(c) => (this.head = c.element as HTMLElement)}>
          <div class="mx-scheduler__dates" aria-hidden="true">
            <div class="mx-scheduler__corner" />
            {st.days.map((day) => (
              <div
                key={day.index}
                class="mx-scheduler__date"
                data-today={() => day.today || null}
                data-holiday={() => day.holiday || null}
                data-weekend={() => day.weekend || null}
              >
                <span class="mx-scheduler__weekday">{() => format.weekday(day.date)}</span>
                <span class="mx-scheduler__day-number">{() => format.dayNumber(day.date)}</span>
              </div>
            ))}
          </div>
          <div class="mx-scheduler__all-day" x-display={() => model.view.allDayPanel} style={() => ({ '--_lines': String(allDayLines()) })}>
            <div class="mx-scheduler__all-day-label" aria-hidden="true">
              {() => t('schedulerAllDay')}
            </div>
            <div class="mx-scheduler__all-day-area">
              <div class="mx-scheduler__all-day-grid" role="grid" aria-label={() => t('schedulerAllDay')} onkeydown={(e: KeyboardEvent) => host.gridKey(e)}>
                <div class="mx-scheduler__row" role="row">
                  {st.days.map((day) => (
                    <div
                      key={day.index}
                      class="mx-scheduler__cell mx-scheduler__all-day-cell"
                      role="gridcell"
                      data-cell={`${day.index}:-1`}
                      data-today={() => day.today || null}
                      data-past={() => day.past || null}
                      tabindex={() => (focused(day.index, -1) ? 0 : -1)}
                      aria-selected={() => model.isSelected(day.index, -1)}
                      aria-label={() => `${t('schedulerAllDay')}, ${format.fullDate(day.date)}`}
                      onpointerdown={(e: PointerEvent) => host.cellPointerDown({ day: day.index, slot: -1 }, e)}
                      onclick={(e: MouseEvent) => host.cellClick({ day: day.index, slot: -1 }, e)}
                      ondblclick={(e: MouseEvent) => host.cellDblClick({ day: day.index, slot: -1 }, e)}
                    />
                  ))}
                </div>
              </div>
              <div class="mx-scheduler__bars" role="group" aria-label={() => `${t('schedulerAllDay')}, ${t('schedulerAppointments')}`}>
                {st.allDay.pieces.map((piece) => (
                  <AppointmentBox key={piece.id} host={host} piece={piece} />
                ))}
                {st.days.map((day) => (
                  <button
                    key={day.index}
                    type="button"
                    class="mx-scheduler__more"
                    x-display={() => (st.allDay.more[day.index] ?? 0) > 0}
                    style={() => ({
                      gridColumn: String(day.index + 1),
                      gridRow: String((st.allDay.moreAt[day.index] ?? 0) + 1),
                    })}
                    aria-label={() =>
                      t('schedulerMoreLabel', {
                        count: st.allDay.more[day.index] ?? 0,
                        date: format.fullDate(day.date),
                      })
                    }
                    onclick={(e: MouseEvent) => host.openMore(day.date, e.currentTarget as HTMLElement)}
                  >
                    {() =>
                      t('schedulerMore', {
                        count: st.allDay.more[day.index] ?? 0,
                      })
                    }
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div
          class="mx-scheduler__scroll"
          ref={(c) => host.setScroller(c.element as HTMLElement)}
          onscroll={(e: Event) => {
            if (this.head) this.head.scrollLeft = (e.currentTarget as HTMLElement).scrollLeft;
          }}
        >
          <div class="mx-scheduler__body" style={() => ({ ...columns(), '--_rows': String(st.slots.length) })}>
            <div class="mx-scheduler__ruler" aria-hidden="true">
              {st.slots.map((slot) => (
                <div key={slot.index} class="mx-scheduler__hour" data-hour-start={() => slot.hourStart || null}>
                  <span>{() => (slot.hourStart ? format.hour(slot.minutes) : '')}</span>
                </div>
              ))}
            </div>
            <div class="mx-scheduler__cells" role="grid" aria-label={() => t('schedulerTimes')} onkeydown={(e: KeyboardEvent) => host.gridKey(e)}>
              {st.slots.map((slot) => (
                <div key={slot.index} class="mx-scheduler__row" role="row" data-hour-start={() => slot.hourStart || null}>
                  {st.days.map((day) => (
                    <div
                      key={day.index}
                      class="mx-scheduler__cell"
                      role="gridcell"
                      data-cell={`${day.index}:${slot.index}`}
                      data-work={() => work(day, slot) || null}
                      data-holiday={() => day.holiday || null}
                      data-today={() => day.today || null}
                      data-past={() => day.past || null}
                      tabindex={() => (focused(day.index, slot.index) ? 0 : -1)}
                      aria-selected={() => model.isSelected(day.index, slot.index)}
                      aria-label={() => `${format.fullDate(day.date)}, ${format.time(cellTime(day, slot))}`}
                      onpointerdown={(e: PointerEvent) => host.cellPointerDown({ day: day.index, slot: slot.index }, e)}
                      onclick={(e: MouseEvent) => host.cellClick({ day: day.index, slot: slot.index }, e)}
                      ondblclick={(e: MouseEvent) => host.cellDblClick({ day: day.index, slot: slot.index }, e)}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div class="mx-scheduler__layer" role="group" aria-label={() => t('schedulerAppointments')}>
              {st.timed.map((piece) => (
                <AppointmentBox key={piece.id} host={host} piece={piece} />
              ))}
              <div
                class="mx-scheduler__now"
                aria-hidden="true"
                x-display={() => host.showCurrentTime() && model.todayIndex() >= 0 && model.nowAt() !== null}
                style={() => ({
                  '--_day': String(Math.max(0, model.todayIndex())),
                  insetBlockStart: `${(model.nowAt() ?? 0) * 100}%`,
                })}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}
