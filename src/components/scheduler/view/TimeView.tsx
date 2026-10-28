import { Component, reactive, untracked, type ComponentBase } from '@motifx/core';
import type { CellTemplateContext } from '../cell-template-context';
import type { HeaderCell } from '../model/header-cell';
import type { SchedulerColumn } from '../model/scheduler-column';
import type { TimeSlot } from '../model/time-slot';
import { AppointmentBox } from './AppointmentBox';
import { CellWriter } from './CellWriter';
import type { CellSpot } from './cell-spot';
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
    const cellContext = (spot: CellSpot): CellTemplateContext => ({
      get start() {
        const column = spot.column!;
        return spot.slot ? cellTime(column, spot.slot) : column.day.date;
      },
      get end() {
        const column = spot.column!;
        return spot.slot ? model.zone.date(column.day.wall + (spot.slot.minutes + model.view.cellDuration) * 60_000) : model.zone.addDays(column.day.date, 1);
      },
      get allDay() {
        return !spot.slot;
      },
      get resources() {
        const group = spot.column?.group;
        return group ? { ...group.values } : null;
      },
      get view() {
        return model.view.type;
      },
      get today() {
        return !!spot.column?.day.today;
      },
      get work() {
        const column = spot.column!;
        return spot.slot ? work(column, spot.slot) : column.work;
      },
      get blocked() {
        return !!model.blockAt(spot.column!.index, spot.slot ? spot.slot.index : -1);
      },
    });
    // Many columns of many rows. A row's cells stand in places, as many as the columns built, and each place shows
    // the column the window puts there: as the view scrolls a place shows another column and is written again, and
    // no cell is made or dropped. A cell is written when it is made and again only when what it shows changes
    // (followed here once for all of them); the rows listen for their cells.
    let places: number[] = [];
    const shownPlaces = () => {
      const count = model.virtual ? Math.min(st.window.count, st.columns.length) : st.columns.length;
      if (places.length !== count) places = Array.from({ length: count }, (_, place) => place);
      return places;
    };
    /** What decides the column of each place: read once for all of them. */
    const windowNow = () => ({ virtual: model.virtual, first: st.window.first, columns: st.columns, count: places.length });
    /** The column a place shows: in a big view the window's column that falls on it, else its own. */
    const columnAt = (place: number, now = windowNow()): SchedulerColumn | undefined => {
      if (!now.virtual || !now.count) return now.columns[place];
      return now.columns[now.first + ((((place - now.first) % now.count) + now.count) % now.count)];
    };
    const placeOf = (column: number) => {
      const count = places.length;
      return model.virtual && count ? ((column % count) + count) % count : column;
    };
    const idOf = (place: number, slot: number) => place * 1000 + slot + 1;
    const writer = new CellWriter<CellSpot>(
      ({ column, slot }, cell) => {
        cell.flag('hidden', !column);
        if (!column) return;
        cell
          .put('style', slot ? `grid-column: ${column.index + 1}; --_at: ${column.index}` : `grid-column: ${column.index + 1}`)
          .put('data-cell', `${column.index}:${slot ? slot.index : -1}`)
          .flag('data-work', !!slot && work(column, slot))
          .flag('data-holiday', !!slot && column.day.holiday)
          .flag('data-today', column.day.today)
          .flag('data-past', column.day.past)
          .put('data-edge', column.edge || null)
          .flag('data-blocked', slot ? !!model.blockAt(column.index, slot.index) : column.blocked)
          .put(
            'aria-label',
            slot
              ? `${where(column, slot.index).group}${format.fullDate(column.day.date)}, ${format.time(cellTime(column, slot))}${where(column, slot.index).block}`
              : `${where(column, -1).group}${t('schedulerAllDay')}, ${format.fullDate(column.day.date)}${where(column, -1).block}`,
          );
      },
      ({ column, slot }, cell) => {
        if (!column) return;
        const at = slot ? slot.index : -1;
        cell.put('tabindex', focused(column.index, at) ? '0' : '-1').put('aria-selected', String(model.isSelected(column.index, at)));
      },
    );
    this.bindings.watch(() => {
      void st.look, void format.time(new Date(0)), void t('schedulerAllDay'), void t('schedulerUnavailable');
      writer.writeLook();
    });
    // The window moved, or the columns changed: the places that show another column now.
    this.bindings.watch(() => {
      void st.window.count, void st.columns.length;
      const now = windowNow();
      writer.forEach((spot, id) => {
        const column = untracked(() => columnAt(spot.place, now));
        if (column === spot.column) return;
        spot.column = column;
        writer.write(id);
      });
    });
    // The cells the focus left and the one it is on; every cell while a range is selected.
    let lit: number[] = [];
    let ranged = false;
    this.bindings.watch(() => {
      const { column, slot } = st.focus;
      const anchor = st.anchor;
      void st.look;
      const now = [idOf(untracked(() => placeOf(column)), slot)];
      const range = !!anchor && (anchor.column !== column || anchor.slot !== slot);
      if (range || ranged) writer.writeFocus();
      else writer.writeFocus([...lit, ...now]);
      ranged = range;
      lit = now;
    });
    const cellAt = (e: Event) => {
      const spot = writer.placeOf(e, '.mx-scheduler__cell');
      return spot?.column ? { column: spot.column.index, slot: spot.slot ? spot.slot.index : -1 } : null;
    };
    const listen = {
      onpointerdown: (e: PointerEvent) => {
        const at = cellAt(e);
        if (at) host.cellPointerDown(at, e);
      },
      onclick: (e: MouseEvent) => {
        const at = cellAt(e);
        if (at) host.cellClick(at, e);
      },
      ondblclick: (e: MouseEvent) => {
        const at = cellAt(e);
        if (at) host.cellDblClick(at, e);
      },
    };
    /** A place's cell; a cell template draws into it once it is made, and follows the column shown there. */
    const cell = (place: number, slot: TimeSlot | null, template: ((context: CellTemplateContext) => ComponentBase) | null) => (
      <div
        key={place}
        ref={(c: ComponentBase) => {
          const spot = reactive({ place, column: untracked(() => columnAt(place)), slot }) as CellSpot;
          writer.add(idOf(place, slot ? slot.index : -1), spot, c);
          if (template) untracked(() => c.controls.add(<div class="mx-scheduler__cell-content">{template(cellContext(spot))}</div>));
        }}
        class={slot ? 'mx-scheduler__cell' : 'mx-scheduler__cell mx-scheduler__all-day-cell'}
        role="gridcell"
        onDisposing={() => writer.delete(idOf(place, slot ? slot.index : -1))}
      />
    );
    /** The cells' rows. */
    const rows = (template: ((context: CellTemplateContext) => ComponentBase) | null) => (
      <>
        {st.slots.map((slot) => (
          <div key={slot.index} class="mx-scheduler__row" role="row" data-hour-start={() => slot.hourStart || null} {...listen}>
            {shownPlaces().map((place) => cell(place, slot, template))}
          </div>
        ))}
      </>
    );
    const allDayCells = (template: ((context: CellTemplateContext) => ComponentBase) | null) => (
      <div class="mx-scheduler__row" role="row" {...listen}>
        {shownPlaces().map((place) => cell(place, null, template))}
      </div>
    );
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
