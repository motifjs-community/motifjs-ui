import { Component, untracked, type ComponentBase } from '@motifx/core';
import type { CellTemplateContext } from '../cell-template-context';
import type { HeaderCell } from '../model/header-cell';
import type { SchedulerColumn } from '../model/scheduler-column';
import type { StripRow } from '../model/strip-row';
import { ResizeWatch } from '../../../core/resize-watch';
import { AppointmentBox } from './AppointmentBox';
import { cellWords } from './cell-words';
import { GroupHeads } from './GroupHeads';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
}

/**
 * The month view: a row per week, a cell per day of each group (one grid, arrows move by a day
 * and by a week), and over each week its appointments as bars and chips in lines. Lines past the
 * room a week has become "+N more" on each day they leave out.
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
    const focused = (column: number) => st.focus.column === column;
    /** A column's place in its week. */
    const inWeek = (column: number) => column % model.perRow;
    const dateContext = (cell: HeaderCell) => ({
      get date() {
        return cell.day?.date ?? new Date(NaN);
      },
      get weekday() {
        return cell.day ? format.weekday(cell.day.date) : '';
      },
      number: '',
      get today() {
        return false;
      },
      get view() {
        return model.view.type;
      },
      get resources() {
        return Object.keys(cell.values).length ? { ...cell.values } : null;
      },
    });
    const cellContext = (column: SchedulerColumn): CellTemplateContext => ({
      get start() {
        return column.day.date;
      },
      get end() {
        return model.zone.addDays(column.day.date, 1);
      },
      allDay: true,
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
        return column.work;
      },
      get blocked() {
        return column.blocked;
      },
    });
    /** The weeks' cells; a cell template draws into each cell, after its number, once it is made. */
    const weeks = (template: ((context: CellTemplateContext) => ComponentBase) | null) => {
      const fill = (c: ComponentBase, column: SchedulerColumn) => {
        if (template) c.controls.add(<div class="mx-scheduler__cell-content">{template(cellContext(column))}</div>);
      };
      return (
        <>
          {st.weeks.map((week: StripRow<T>) => (
            <div key={week.index} class="mx-scheduler__week-row" role="row">
              {week.columns.map((column) => (
                <div
                  key={column.index}
                  ref={(c: ComponentBase) => fill(c, column)}
                  class="mx-scheduler__cell mx-scheduler__month-cell"
                  role="gridcell"
                  data-cell={`${column.index}:-1`}
                  data-today={() => column.day.today || null}
                  data-past={() => column.day.past || null}
                  data-outside={() => column.day.outside || null}
                  data-holiday={() => column.day.holiday || null}
                  data-weekend={() => column.day.weekend || null}
                  data-edge={() => column.edge || null}
                  data-blocked={() => column.blocked || null}
                  tabindex={() => (focused(column.index) ? 0 : -1)}
                  aria-selected={() => model.isSelected(column.index, -1)}
                  aria-label={() => `${cellWords(host, column, -1).group}${format.fullDate(column.day.date)}${cellWords(host, column, -1).block}`}
                  onpointerdown={(e: PointerEvent) => host.cellPointerDown({ column: column.index, slot: -1 }, e)}
                  onclick={(e: MouseEvent) => host.cellClick({ column: column.index, slot: -1 }, e)}
                  ondblclick={(e: MouseEvent) => host.cellDblClick({ column: column.index, slot: -1 }, e)}
                >
                  <span class="mx-scheduler__day-number" aria-hidden="true">
                    {() => format.dayNumber(column.day.date)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </>
      );
    };
    return (
      <>
        <div class="mx-scheduler__month-head" data-by-date={() => model.datesFirst || null} style={() => ({ '--_columns': String(model.perRow) })}>
          <GroupHeads host={host} ruler={false} />
          <div class="mx-scheduler__weekdays" aria-hidden="true">
            {st.dates.map((cell) => (
              <div
                key={cell.key}
                class="mx-scheduler__weekday-name"
                data-edge={() => cell.edge || null}
                style={() => ({ gridColumn: `${cell.first + 1} / span ${cell.span}` })}
              >
                {host.dateTemplate() ? (
                  <div class="mx-scheduler__date-content">{host.dateTemplate()!(dateContext(cell))}</div>
                ) : (
                  <span>{() => (cell.day ? format.weekday(cell.day.date) : '')}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div class="mx-scheduler__month-body" style={() => ({ '--_weeks': String(st.weeks.length), '--_columns': String(model.perRow) })}>
          <div
            class="mx-scheduler__month-grid"
            role="grid"
            aria-label={() => t('schedulerMonth')}
            ref={(c) => (this.grid = c.element as HTMLElement)}
            onkeydown={(e: KeyboardEvent) => host.gridKey(e)}
          >
            {() => {
              switch (host.cellTemplate() ? 'template' : 'plain') {
                case 'template':
                  return weeks(untracked(() => host.cellTemplate()));
                default:
                  return weeks(null);
              }
            }}
          </div>
          <div class="mx-scheduler__month-layer" role="group" aria-label={() => t('schedulerAppointments')}>
            {st.weeks.map((week) => (
              <div key={week.index} class="mx-scheduler__week-layer">
                {week.pieces.map((piece) => (
                  <AppointmentBox key={piece.id} host={host} piece={piece} />
                ))}
                {week.columns.map((column) => (
                  <button
                    key={column.index}
                    type="button"
                    class="mx-scheduler__more"
                    x-display={() => (week.more[inWeek(column.index)] ?? 0) > 0}
                    style={() => ({
                      gridColumn: String(inWeek(column.index) + 1),
                      gridRow: String((week.moreAt[inWeek(column.index)] ?? 0) + 1),
                    })}
                    aria-label={() =>
                      t('schedulerMoreLabel', {
                        count: week.more[inWeek(column.index)] ?? 0,
                        date: `${cellWords(host, column, -1).group}${format.fullDate(column.day.date)}`,
                      })
                    }
                    onclick={(e: MouseEvent) => host.openMore(column.day.date, column.group?.index ?? -1, e.currentTarget as HTMLElement)}
                  >
                    {() =>
                      t('schedulerMore', {
                        count: week.more[inWeek(column.index)] ?? 0,
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
