import { Component, untracked, type ComponentBase } from '@motifx/core';
import type { CellTemplateContext } from '../cell-template-context';
import type { HeaderCell } from '../model/header-cell';
import type { SchedulerColumn } from '../model/scheduler-column';
import type { TimeSlot } from '../model/time-slot';
import { AppointmentBox } from './AppointmentBox';
import { cellWords } from './cell-words';
import { GroupHeads } from './GroupHeads';
import type { SchedulerHost } from './scheduler-host';

/** The cells a big view's window moves on by at least: small steps, so each builds little. */
const STEP = 2;

interface Props<T> {
  host: SchedulerHost<T>;
}

/**
 * The day, week and work week views: the dates on top (with the heads of the groups over them, or
 * under them by date), the all-day panel under them, then the hours down with a column per day of
 * each group. The cells are one grid (arrows, Shift to select); the appointments lie over it in
 * their own layer, each placed by its piece. Changing the date fills the same rows and columns in
 * place. With many groups only the columns in view (and a screen on each side) are built, each
 * at its own column of the grid.
 */
export class TimeView<T> extends Component<HTMLDivElement, Props<T>> {
  private head: HTMLElement | null = null;
  private scroller: HTMLElement | null = null;
  private cells: HTMLElement | null = null;

  override onConfigured() {
    this.class.add('mx-scheduler__time-view');
    // A big view lays its rows of cells out by place, not as grids of every column.
    this.bindings.watch(() => {
      const virtual = this.props.host.model.virtual;
      untracked(() => this.element.toggleAttribute('data-virtual', virtual));
    });
  }

  override onMounted() {
    this.follow();
    this.props.host.viewShown();
  }

  override onDisposing() {
    cancelAnimationFrame(this.frame);
    this.props.host.setScroller(null);
  }

  private frame = 0;

  /** After a scroll, the window follows at the next frame (once however many scroll events come). */
  private followSoon(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      if (!this.isDisposed) this.follow();
    });
  }

  /** In a big view: builds the columns in view and a screen's worth on each side, and moves on when the view nears their edge. */
  private follow(): void {
    const model = this.props.host.model;
    const scroller = this.scroller;
    const cells = this.cells;
    const count = model.state.columns.length;
    if (!scroller || !cells || !count || !untracked(() => model.virtual)) return;
    const width = cells.offsetWidth / count;
    if (!(width > 0)) return;
    const visible = Math.max(1, Math.ceil((scroller.clientWidth - cells.offsetLeft) / width) + 1);
    const first = Math.floor(Math.abs(scroller.scrollLeft) / width);
    const now = model.state.window;
    const want = first - visible;
    if (now.count !== visible * 3 || Math.abs(now.first - Math.max(0, want)) >= STEP) model.setWindow(want, visible * 3);
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
    const dateContext = (cell: HeaderCell) => ({
      get date() {
        return cell.day?.date ?? new Date(NaN);
      },
      get weekday() {
        return cell.day ? format.weekday(cell.day.date) : '';
      },
      get number() {
        return cell.day ? format.dayNumber(cell.day.date) : '';
      },
      get today() {
        return !!cell.day?.today;
      },
      get view() {
        return model.view.type;
      },
      get resources() {
        return Object.keys(cell.values).length ? { ...cell.values } : null;
      },
    });
    const timeContext = (slot: TimeSlot) => ({
      get date() {
        return model.zone.date((st.days[0]?.wall ?? 0) + slot.minutes * 60_000);
      },
      get minutes() {
        return slot.minutes;
      },
      get text() {
        return format.hour(slot.minutes);
      },
      get view() {
        return model.view.type;
      },
    });
    const cellContext = (column: SchedulerColumn, slot: TimeSlot | null): CellTemplateContext => ({
      get start() {
        return slot ? cellTime(column, slot) : column.day.date;
      },
      get end() {
        return slot ? model.zone.date(column.day.wall + (slot.minutes + model.view.cellDuration) * 60_000) : model.zone.addDays(column.day.date, 1);
      },
      get allDay() {
        return !slot;
      },
      get resources() {
        return column.group ? { ...column.group.values } : null;
      },
      get view() {
        return model.view.type;
      },
      get today() {
        return column.day.today;
      },
      get work() {
        return slot ? work(column, slot) : column.work;
      },
      get blocked() {
        return !!model.blockAt(column.index, slot ? slot.index : -1);
      },
    });
    /** The cells' rows; a cell template draws into each cell once it is made. */
    const rows = (template: ((context: CellTemplateContext) => ComponentBase) | null) => {
      const fill = (c: ComponentBase, column: SchedulerColumn, slot: TimeSlot) => {
        if (template) c.controls.add(<div class="mx-scheduler__cell-content">{template(cellContext(column, slot))}</div>);
      };
      return (
        <>
          {st.slots.map((slot) => (
            <div key={slot.index} class="mx-scheduler__row" role="row" data-hour-start={() => slot.hourStart || null}>
              {model.shownColumns().map((column) => (
                <div
                  key={column.index}
                  ref={(c: ComponentBase) => fill(c, column, slot)}
                  class="mx-scheduler__cell"
                  role="gridcell"
                  style={`grid-column: ${column.index + 1}; --_at: ${column.index}`}
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
        </>
      );
    };
    const allDayCells = (template: ((context: CellTemplateContext) => ComponentBase) | null) => {
      const fill = (c: ComponentBase, column: SchedulerColumn) => {
        if (template) c.controls.add(<div class="mx-scheduler__cell-content">{template(cellContext(column, null))}</div>);
      };
      return (
        <div class="mx-scheduler__row" role="row">
          {model.shownColumns().map((column) => (
            <div
              key={column.index}
              ref={(c: ComponentBase) => fill(c, column)}
              class="mx-scheduler__cell mx-scheduler__all-day-cell"
              role="gridcell"
              style={`grid-column: ${column.index + 1}`}
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
      );
    };
    return (
      <>
        <div class="mx-scheduler__head" data-by-date={() => model.datesFirst || null} style={columns} ref={(c) => (this.head = c.element as HTMLElement)}>
          <GroupHeads host={host} ruler />
          <div class="mx-scheduler__dates" aria-hidden="true">
            <div class="mx-scheduler__corner" />
            {model.shownHeads(st.dates).map((cell) => (
              <div
                key={cell.key}
                class="mx-scheduler__date"
                data-today={() => cell.day?.today || null}
                data-holiday={() => cell.day?.holiday || null}
                data-weekend={() => cell.day?.weekend || null}
                data-edge={() => cell.edge || null}
                style={() => ({ gridColumn: `${cell.first + 2} / span ${cell.span}` })}
              >
                {host.dateTemplate() ? (
                  <div class="mx-scheduler__date-content">{host.dateTemplate()!(dateContext(cell))}</div>
                ) : (
                  <>
                    <span class="mx-scheduler__weekday">{() => (cell.day ? format.weekday(cell.day.date) : '')}</span>
                    <span class="mx-scheduler__day-number">{() => (cell.day ? format.dayNumber(cell.day.date) : '')}</span>
                  </>
                )}
              </div>
            ))}
          </div>
          <div class="mx-scheduler__all-day" x-display={() => model.view.allDayPanel} style={() => ({ '--_lines': String(allDayLines()) })}>
            <div class="mx-scheduler__all-day-label" aria-hidden="true">
              {() => t('schedulerAllDay')}
            </div>
            <div class="mx-scheduler__all-day-area">
              <div class="mx-scheduler__all-day-grid" role="grid" aria-label={() => t('schedulerAllDay')} onkeydown={(e: KeyboardEvent) => host.gridKey(e)}>
                {() => {
                  switch (host.cellTemplate() ? 'template' : 'plain') {
                    case 'template':
                      return allDayCells(untracked(() => host.cellTemplate()));
                    default:
                      return allDayCells(null);
                  }
                }}
              </div>
              <div class="mx-scheduler__bars" role="group" aria-label={() => `${t('schedulerAllDay')}, ${t('schedulerAppointments')}`}>
                {st.allDay.pieces
                  .filter((piece) => model.columnsShown(piece.first, piece.span))
                  .map((piece) => (
                    <AppointmentBox key={piece.id} host={host} piece={piece} />
                  ))}
                {model.shownColumns().map((column) => (
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
          ref={(c) => {
            this.scroller = c.element as HTMLElement;
            host.setScroller(this.scroller);
          }}
          onscroll={(e: Event) => {
            if (this.head) this.head.scrollLeft = (e.currentTarget as HTMLElement).scrollLeft;
            this.followSoon();
          }}
        >
          <div class="mx-scheduler__body" style={() => ({ ...columns(), '--_rows': String(st.slots.length) })}>
            <div class="mx-scheduler__ruler" aria-hidden="true">
              {st.slots.map((slot) => (
                <div key={slot.index} class="mx-scheduler__hour" data-hour-start={() => slot.hourStart || null}>
                  {host.timeTemplate() ? (
                    <span>{host.timeTemplate()!(timeContext(slot))}</span>
                  ) : (
                    <span>{() => (slot.hourStart ? format.hour(slot.minutes) : '')}</span>
                  )}
                </div>
              ))}
            </div>
            <div
              class="mx-scheduler__cells"
              role="grid"
              aria-label={() => t('schedulerTimes')}
              ref={(c) => (this.cells = c.element as HTMLElement)}
              onkeydown={(e: KeyboardEvent) => host.gridKey(e)}
            >
              {() => {
                switch (host.cellTemplate() ? 'template' : 'plain') {
                  case 'template':
                    return rows(untracked(() => host.cellTemplate()));
                  default:
                    return rows(null);
                }
              }}
            </div>
            <div class="mx-scheduler__layer" role="group" aria-label={() => t('schedulerAppointments')}>
              {model.shownTimed().map((piece) => (
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
