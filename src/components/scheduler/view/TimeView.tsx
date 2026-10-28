import { Component } from '@motifx/core';
import type { SchedulerColumn } from '../model/scheduler-column';
import type { TimeSlot } from '../model/time-slot';
import { AppointmentBox } from './AppointmentBox';
import { cellWords } from './cell-words';
import { GroupHeads } from './GroupHeads';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
}

/**
 * The day, week and work week views: the dates on top (with the heads of the groups over them, or
 * under them by date), the all-day panel under them, then the hours down with a column per day of
 * each group. The cells are one grid (arrows, Shift to select); the appointments lie over it in
 * their own layer, each placed by its piece. Changing the date fills the same rows and columns in
 * place.
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
    const cellTime = (column: SchedulerColumn, slot: TimeSlot) => model.zone.date(column.day.wall + slot.minutes * 60_000);
    const work = (column: SchedulerColumn, slot: TimeSlot) => column.work && slot.minutes >= column.workStart * 60 && slot.minutes < column.workEnd * 60;
    const focused = (column: number, slot: number) => st.focus.column === column && st.focus.slot === slot;
    const allDayLines = () => Math.max(1, Math.min(st.allDay.lanes, host.allDayLines() + 1));
    const columns = () => ({ '--_columns': String(st.columns.length) });
    const where = (column: SchedulerColumn, slot: number) => cellWords(host, column, slot);
    return (
      <>
        <div class="mx-scheduler__head" data-by-date={() => model.datesFirst || null} style={columns} ref={(c) => (this.head = c.element as HTMLElement)}>
          <GroupHeads host={host} ruler />
          <div class="mx-scheduler__dates" aria-hidden="true">
            <div class="mx-scheduler__corner" />
            {st.dates.map((cell) => (
              <div
                key={cell.key}
                class="mx-scheduler__date"
                data-today={() => cell.day?.today || null}
                data-holiday={() => cell.day?.holiday || null}
                data-weekend={() => cell.day?.weekend || null}
                data-edge={() => cell.edge || null}
                style={() => ({ gridColumn: `${cell.first + 2} / span ${cell.span}` })}
              >
                <span class="mx-scheduler__weekday">{() => (cell.day ? format.weekday(cell.day.date) : '')}</span>
                <span class="mx-scheduler__day-number">{() => (cell.day ? format.dayNumber(cell.day.date) : '')}</span>
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
                  {st.columns.map((column) => (
                    <div
                      key={column.index}
                      class="mx-scheduler__cell mx-scheduler__all-day-cell"
                      role="gridcell"
                      data-cell={`${column.index}:-1`}
                      data-today={() => column.day.today || null}
                      data-past={() => column.day.past || null}
                      data-edge={() => column.edge || null}
                      data-blocked={() => column.blocked || null}
                      tabindex={() => (focused(column.index, -1) ? 0 : -1)}
                      aria-selected={() => model.isSelected(column.index, -1)}
                      aria-label={() => `${where(column, -1).group}${t('schedulerAllDay')}, ${format.fullDate(column.day.date)}${where(column, -1).block}`}
                      onpointerdown={(e: PointerEvent) => host.cellPointerDown({ column: column.index, slot: -1 }, e)}
                      onclick={(e: MouseEvent) => host.cellClick({ column: column.index, slot: -1 }, e)}
                      ondblclick={(e: MouseEvent) => host.cellDblClick({ column: column.index, slot: -1 }, e)}
                    />
                  ))}
                </div>
              </div>
              <div class="mx-scheduler__bars" role="group" aria-label={() => `${t('schedulerAllDay')}, ${t('schedulerAppointments')}`}>
                {st.allDay.pieces.map((piece) => (
                  <AppointmentBox key={piece.id} host={host} piece={piece} />
                ))}
                {st.columns.map((column) => (
                  <button
                    key={column.index}
                    type="button"
                    class="mx-scheduler__more"
                    x-display={() => (st.allDay.more[column.index] ?? 0) > 0}
                    style={() => ({
                      gridColumn: String(column.index + 1),
                      gridRow: String((st.allDay.moreAt[column.index] ?? 0) + 1),
                    })}
                    aria-label={() =>
                      t('schedulerMoreLabel', {
                        count: st.allDay.more[column.index] ?? 0,
                        date: `${where(column, -1).group}${format.fullDate(column.day.date)}`,
                      })
                    }
                    onclick={(e: MouseEvent) => host.openMore(column.day.date, column.group?.index ?? -1, e.currentTarget as HTMLElement)}
                  >
                    {() =>
                      t('schedulerMore', {
                        count: st.allDay.more[column.index] ?? 0,
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
                  {st.columns.map((column) => (
                    <div
                      key={column.index}
                      class="mx-scheduler__cell"
                      role="gridcell"
                      data-cell={`${column.index}:${slot.index}`}
                      data-work={() => work(column, slot) || null}
                      data-holiday={() => column.day.holiday || null}
                      data-today={() => column.day.today || null}
                      data-past={() => column.day.past || null}
                      data-edge={() => column.edge || null}
                      data-blocked={() => !!model.blockAt(column.index, slot.index) || null}
                      tabindex={() => (focused(column.index, slot.index) ? 0 : -1)}
                      aria-selected={() => model.isSelected(column.index, slot.index)}
                      aria-label={() => `${where(column, slot.index).group}${format.fullDate(column.day.date)}, ${format.time(cellTime(column, slot))}${where(column, slot.index).block}`}
                      onpointerdown={(e: PointerEvent) => host.cellPointerDown({ column: column.index, slot: slot.index }, e)}
                      onclick={(e: MouseEvent) => host.cellClick({ column: column.index, slot: slot.index }, e)}
                      ondblclick={(e: MouseEvent) => host.cellDblClick({ column: column.index, slot: slot.index }, e)}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div class="mx-scheduler__layer" role="group" aria-label={() => t('schedulerAppointments')}>
              {st.timed.map((piece) => (
                <AppointmentBox key={piece.id} host={host} piece={piece} />
              ))}
              {model.todayColumns().map((column) => (
                <div
                  key={column.index}
                  class="mx-scheduler__now"
                  aria-hidden="true"
                  x-display={() => host.showCurrentTime() && model.nowAt() !== null}
                  style={() => ({
                    '--_column': String(column.index),
                    insetBlockStart: `${(model.nowAt() ?? 0) * 100}%`,
                  })}
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }
}
