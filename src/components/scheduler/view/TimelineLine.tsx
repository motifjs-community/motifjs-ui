import { untracked, type ComponentBase } from '@motifx/core';
import type { LinePiece } from '../model/line-piece';
import type { CellTemplateContext } from '../cell-template-context';
import type { SchedulerColumn } from '../model/scheduler-column';
import type { TimeTick } from '../model/time-tick';
import type { TimelineRow } from '../model/timeline-row';
import { dayCells } from '../model/view-kind';
import { AppointmentBox } from './AppointmentBox';
import { CellWriter } from './CellWriter';
import { cellWords } from './cell-words';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
  row: TimelineRow<T>;
  /** Draws each cell's content; decided when the rows are built. */
  cellTemplate: ((context: CellTemplateContext) => ComponentBase) | null;
  /** The rows the virtual list keeps off screen (`true`), by the row's own number. */
  away: Record<number, boolean>;
}

/** Numbers the rows made, for what is kept of each. */
let made = 0;

/**
 * A row of a timeline: its group's names on the start side (staying there while the time scrolls),
 * its cells along the time (only the ones built, each placed at its own cell), and over them its
 * appointments, each on its lane, with "+N more" per day and the line at the time it is now.
 */
export function TimelineLine<T>(props: Props<T>) {
  const { host, row, cellTemplate, away } = props;
  const model = host.model;
  const st = model.state;
  const format = host.format;
  const t = host.text.bind(host);
  const per = () => (dayCells(model.view.type) ? 1 : Math.max(1, st.slots.length));
  const columnOf = (tick: TimeTick): SchedulerColumn | undefined => st.columns[row.first + tick.day.index];
  const place = (tick: TimeTick) => ({ column: row.first + tick.day.index, slot: tick.slot });
  const focused = (tick: TimeTick) => st.focus.column === row.first + tick.day.index && st.focus.slot === tick.slot;
  const time = (tick: TimeTick) => model.zone.date(tick.day.wall + tick.minutes * 60_000);
  const work = (tick: TimeTick) => {
    const column = columnOf(tick);
    if (!column?.work) return false;
    return tick.slot < 0 || (tick.minutes >= column.workStart * 60 && tick.minutes < column.workEnd * 60);
  };
  const label = (tick: TimeTick) => {
    const column = columnOf(tick);
    if (!column) return '';
    const words = cellWords(host, column, tick.slot);
    return tick.slot < 0 ? `${words.group}${format.fullDate(tick.day.date)}${words.block}` : `${words.group}${format.fullDate(tick.day.date)}, ${format.time(time(tick))}${words.block}`;
  };
  const context = (tick: TimeTick): CellTemplateContext => ({
    get start() {
      return tick.slot < 0 ? tick.day.date : time(tick);
    },
    get end() {
      return tick.slot < 0 ? model.zone.addDays(tick.day.date, 1) : model.zone.date(tick.day.wall + (tick.minutes + model.view.cellDuration) * 60_000);
    },
    get allDay() {
      return tick.slot < 0;
    },
    get resources() {
      return row.group ? { ...row.group.values } : null;
    },
    get view() {
      return model.view.type;
    },
    get today() {
      return tick.day.today;
    },
    get work() {
      return work(tick);
    },
    get blocked() {
      return !!model.blockAt(row.first + tick.day.index, tick.slot);
    },
  });
  /** A template draws into a cell once it is made. */
  const fill = (tick: TimeTick, c: ComponentBase) => {
    if (cellTemplate) c.controls.add(<div class="mx-scheduler__cell-content">{cellTemplate(context(tick))}</div>);
  };
  // A row has a cell for each place along the time in view, and many rows are on screen: a cell is written once
  // when it is made, and again only when what it shows changes (the row follows that for all its cells at once).
  const cells = new CellWriter<TimeTick>(
    (tick, cell) =>
      cell
        .put('style', `--_at: ${tick.index}`)
        .put('data-cell', `${row.first + tick.day.index}:${tick.slot}`)
        .flag('data-work', work(tick))
        .flag('data-today', tick.day.today)
        .flag('data-past', tick.day.past)
        .flag('data-holiday', tick.day.holiday)
        .flag('data-weekend', tick.slot < 0 && tick.day.weekend)
        .flag('data-hour-start', tick.hourStart)
        .flag('data-day-start', tick.dayStart)
        .flag('data-blocked', !!model.blockAt(row.first + tick.day.index, tick.slot))
        .put('aria-label', label(tick)),
    (tick, cell) =>
      cell.put('tabindex', focused(tick) ? '0' : '-1').put('aria-selected', String(model.isSelected(row.first + tick.day.index, tick.slot))),
  );
  /** The days, their columns, the time rows or the blocked times were written again, or the words: every cell again. */
  const followLook = () => {
    void st.look, void row.first, void format.time(new Date(0)), void t('schedulerUnavailable');
    cells.writeLook();
  };
  /**
   * The focus or the selection moved: the cells it left and the one it is on; every cell of the row while a range
   * is selected on it (a selection stays in its anchor's row).
   */
  const mine = (column: number) => column >= row.first && column < row.first + untracked(() => st.days.length);
  const idOf = (column: number, slot: number) => untracked(() => (column - row.first) * per() + (dayCells(model.view.type) ? 0 : slot));
  let lit: number[] = [];
  let ranged = false;
  const followFocus = () => {
    const { column, slot } = st.focus;
    const anchor = st.anchor;
    void st.look;
    const now = mine(column) ? [idOf(column, slot)] : [];
    const range = !!anchor && (anchor.column !== column || anchor.slot !== slot) && mine(anchor.column);
    if (range || ranged) cells.writeFocus();
    else cells.writeFocus([...lit, ...now]);
    ranged = range;
    lit = now;
  };
  const cell = (tick: TimeTick) => (
    <div
      key={tick.index}
      ref={(c: ComponentBase) => {
        cells.add(tick.index, tick, c);
        untracked(() => fill(tick, c));
      }}
      class="mx-scheduler__cell"
      role="gridcell"
      onDisposing={() => cells.delete(tick.index)}
    />
  );
  /** The cell an event is on: the row listens once for all its cells. */
  const placeOf = (e: Event) => {
    const tick = cells.placeOf(e, '.mx-scheduler__cell');
    return tick ? place(tick) : null;
  };
  const levels = () => row.group?.path ?? [];
  // A row the virtual list keeps off screen for later stops following the window along the time; back on screen it catches up.
  const id = ++made;
  let ticks: TimeTick[] = [];
  let pieces: LinePiece<T>[] = [];
  const shownTicks = () => (!away[id] ? (ticks = model.shownTicks()) : ticks);
  const shownPieces = () => (!away[id] ? (pieces = row.pieces.filter((piece) => model.ticksShown(piece.from, piece.span))) : pieces);
  return (
    <div
      class="mx-scheduler__line"
      role="row"
      data-edge={() => row.edge || null}
      data-first={() => row.index === 0 || null}
      style={() => ({ blockSize: `${row.height}px` })}
      onConfig={(c: ComponentBase) => {
        c.bindings.watch(followLook);
        c.bindings.watch(followFocus);
      }}
      onActivated={() => (away[id] = false)}
      onDeactivated={() => (away[id] = true)}
      onDisposing={() => delete away[id]}
    >
      <div class="mx-scheduler__line-head" aria-hidden="true">
        {levels().map((resource, level) => (
          <div
            key={`${resource.field}=${String(resource.value)}`}
            class="mx-scheduler__resource"
            data-level={String(level)}
            data-continued={() => !row.starts[level] || null}
          >
            {host.headerTemplate() ? (
              <div class="mx-scheduler__group-content" x-display={() => !!row.starts[level]}>
                {host.headerTemplate()!({
                  field: resource.field,
                  get label() {
                    return host.resources.kind(resource.field)?.label ?? resource.field;
                  },
                  value: resource.value,
                  item: resource.item,
                  text: resource.text,
                  color: resource.color,
                  level,
                  values: Object.fromEntries((row.group?.path ?? []).slice(0, level + 1).map((p) => [p.field, p.value])),
                  date: null,
                })}
              </div>
            ) : (
              <div class="mx-scheduler__group-content" x-display={() => !!row.starts[level]}>
                <span class="mx-scheduler__group-swatch" x-display={() => !!resource.color} style={{ '--_color': resource.color }} />
                <span class="mx-scheduler__group-text">{resource.text}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        class="mx-scheduler__line-track"
        onpointerdown={(e: PointerEvent) => {
          const at = placeOf(e);
          if (at) host.cellPointerDown(at, e);
        }}
        onclick={(e: MouseEvent) => {
          const at = placeOf(e);
          if (at) host.cellClick(at, e);
        }}
        ondblclick={(e: MouseEvent) => {
          const at = placeOf(e);
          if (at) host.cellDblClick(at, e);
        }}
      >
        {shownTicks().map((tick) => cell(tick))}
        <div class="mx-scheduler__line-layer" role="gridcell">
          {shownPieces().map((piece) => (
            <AppointmentBox key={piece.id} host={host} piece={piece} />
          ))}
          {row.more
            .filter((more) => model.ticksShown(more.day * per(), per()))
            .map((more) => (
              <button
                key={more.day}
                type="button"
                class="mx-scheduler__more"
                style={() => ({ '--_from': String(more.day * per()), '--_lane': String(row.moreLane) })}
                aria-label={() => t('schedulerMoreLabel', { count: more.count, date: `${row.label ? `${row.label}, ` : ''}${format.fullDate(st.days[more.day]?.date ?? new Date())}` })}
                onclick={(e: MouseEvent) => host.openMore(st.days[more.day].date, row.group?.index ?? -1, e.currentTarget as HTMLElement)}
              >
                {() => t('schedulerMore', { count: more.count })}
              </button>
            ))}
          <div
            class="mx-scheduler__now"
            aria-hidden="true"
            x-display={() => host.showCurrentTime() && model.nowTick() !== null}
            style={() => ({ '--_at': String(model.nowTick() ?? 0) })}
          />
        </div>
      </div>
    </div>
  );
}
