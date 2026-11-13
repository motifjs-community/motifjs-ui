import { Component, type ComponentBase } from '@motifx/core';
import { onReState } from '../../../core/on-re-state';
import type { CellTemplateContext } from '../cell-template-context';
import type { CellPlace } from '../model/cell-place';
import type { LinePiece } from '../model/line-piece';
import type { SchedulerColumn } from '../model/scheduler-column';
import type { GroupResource } from '../model/group-resource';
import type { TimeTick } from '../model/time-tick';
import type { TimelineRow } from '../model/timeline-row';
import { dayCells } from '../model/view-kind';
import { AppointmentBox } from './AppointmentBox';
import { CellWriter } from './CellWriter';
import { cellWords } from './cell-words';
import { part } from '../../../core/draw-parts';
import { isFocused } from '../../../core/focus';
import { css, flag, kept, put, text } from '../../../core/part-writes';
import { KeyedParts } from './KeyedParts';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
  row: TimelineRow<T>;
  /** Draws each cell's content; decided when the rows are created. */
  cellTemplate: ((context: CellTemplateContext) => ComponentBase) | null;
  /** The rows the virtual list keeps off screen (`true`), by the row's own number. */
  away: Record<number, boolean>;
}

type More = TimelineRow<unknown>['more'][number];

/** Numbers the rows made, for what is kept of each. */
let made = 0;

/**
 * A row of a timeline: its group's names on the start side (staying there while the time scrolls), its cells along
 * the time (only the ones built, each placed at its own cell), and over them its appointments, each on its lane, with
 * "+N more" per day and the line at the time it is now.
 *
 * It follows nothing. It draws itself when it is created, when its view tells it to (`draw`), on `reState()`, and as the
 * model says: the focus and the selection move, the window moves along the time, the time it is now moves on. A row
 * the virtual list keeps off screen draws what it missed when it is back.
 */
export class TimelineLine<T> extends Component<HTMLDivElement, Props<T>> {
  /** Its parts are created (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
  private readonly id = ++made;
  /** Something changed while the row was off screen. */
  private stale = false;
  private ticks: TimeTick[] = [];
  private pieces: LinePiece<T>[] = [];
  private lit: number[] = [];
  private ranged = false;
  private cells!: CellWriter<TimeTick>;
  private cellParts!: KeyedParts<TimeTick, Component<HTMLDivElement>>;
  private boxes!: KeyedParts<LinePiece<T>, AppointmentBox<T>>;
  private mores!: KeyedParts<More, Component<HTMLButtonElement>>;
  private heads!: KeyedParts<{ level: number; resource: GroupResource }, Component<HTMLDivElement>>;
  private now!: Component<HTMLDivElement>;
  /** The day each "+N more" button stands for, as last drawn. */
  private readonly moreOf = new WeakMap<Component<HTMLButtonElement>, More>();
  /** Each head's content and the header template it was filled with: another one (another view, another prop) fills it again. */
  private readonly filled = new WeakMap<Component<HTMLDivElement>, { template: unknown; content: Component<HTMLDivElement> }>();

  private row: TimelineRow<T>;
  /** The cell template the cells are filled with: another one fills the same cells again (`fillCells`). */
  private cellTemplate: Props<T>['cellTemplate'];
  /** A cell's content made by the cell template. */
  private readonly contentOf = new WeakMap<Component<HTMLDivElement>, Component<HTMLDivElement>>();

  constructor(props: Props<T>) {
    super('div', props);
    this.row = props.row;
    this.cellTemplate = props.cellTemplate;
  }

  /** Another cell template: the same cells, each filled again by it. */
  fillCells(template: Props<T>['cellTemplate']): void {
    if (template === this.cellTemplate) return;
    this.cellTemplate = template;
    this.cells?.each((tick, c) => this.fillCell(c as Component<HTMLDivElement>, tick));
  }

  /** A cell's content: the cell template's, if there is one. */
  private fillCell(c: Component<HTMLDivElement>, tick: TimeTick): void {
    const was = this.contentOf.get(c);
    if (was) c.controls.remove(was);
    this.contentOf.delete(c);
    const template = this.cellTemplate;
    if (!template) return;
    const content = part<HTMLDivElement>(c, 'div', 'mx-scheduler__cell-content');
    content.controls.add(template(this.cellContext(tick)));
    this.contentOf.set(c, content);
  }

  private get host(): SchedulerHost<T> {
    return this.props.host;
  }

  /** The key of the row it draws. */
  get rowKey(): string {
    return this.row.key;
  }

  /** The row again, after the layout: its place in the model may be another object of the same key. */
  show(row: TimelineRow<T>): void {
    this.row = row;
    this.draw();
  }

  override onConfigured(): void {
    const { host } = this;
    const model = host.model;
    this.class.add('mx-scheduler__line');
    this.attr.add({ role: 'row' });

    const head = part<HTMLDivElement>(this, 'div', 'mx-scheduler__line-head');
    head.attr.add({ 'aria-hidden': 'true' });
    this.heads = new KeyedParts(
      head,
      ({ resource }) => `${resource.field}=${String(resource.value)}`,
      ({ level, resource }) => this.makeHead(level, resource),
      (c, { level, resource }) => this.drawHead(c, level, resource),
    );

    const track = part<HTMLDivElement>(this, 'div', 'mx-scheduler__line-track');
    const placeOf = (e: Event) => {
      const tick = this.cells.placeOf(e);
      return tick ? { column: this.row.first + tick.day.index, slot: tick.slot } : null;
    };
    track.motif.on('pointerdown', (_, e) => {
      const at = placeOf(e);
      if (at) host.cellPointerDown(at, e);
    });
    track.motif.on('click', (_, e) => {
      const at = placeOf(e);
      if (at) host.cellClick(at, e);
    });
    track.motif.on('dblclick', (_, e) => {
      const at = placeOf(e);
      if (at) host.cellDblClick(at, e);
    });
    // The cells' keys, on the cell itself: an appointment has its own, and so has what a cell template put in a cell.
    track.motif.on('keydown', (_, e) => {
      const onCell = this.cells.find((cell) => cell.motif.isEventFrom(e) && !cell.controls.items.some((inside) => inside.motif.isEventFrom(e)));
      if (onCell) host.gridKey(e);
    });
    // A row has a cell for each place along the time in view, and many rows are on screen: a cell is written once
    // when it is created, and again only when what it shows changes (the row writes all its cells at once).
    this.cells = new CellWriter<TimeTick>(
      (tick, cell) =>
        cell
          .put('style', `--_at: ${tick.index}`)
          .put('data-cell', `${this.row.first + tick.day.index}:${tick.slot}`)
          .flag('data-work', this.work(tick))
          .flag('data-today', tick.day.today)
          .flag('data-past', tick.day.past)
          .flag('data-holiday', tick.day.holiday)
          .flag('data-weekend', tick.slot < 0 && tick.day.weekend)
          .flag('data-hour-start', tick.hourStart)
          .flag('data-day-start', tick.dayStart)
          .flag('data-blocked', !!model.blockAt(this.row.first + tick.day.index, tick.slot))
          .put('aria-label', this.label(tick)),
      (tick, cell) =>
        cell.put('tabindex', this.focused(tick) ? '0' : '-1').put('aria-selected', String(model.isSelected(this.row.first + tick.day.index, tick.slot))),
    );
    this.cellParts = new KeyedParts<TimeTick, Component<HTMLDivElement>>(
      track,
      (tick) => String(tick.index),
      (tick) => this.makeCell(tick),
      (c, tick) => this.cells.add(tick.index, tick, c),
      () => 0,
      (c, key) => this.cells.delete(Number(key), c),
    );

    const layer = part<HTMLDivElement>(track, 'div', 'mx-scheduler__line-layer');
    layer.attr.add({ role: 'gridcell' });
    this.boxes = new KeyedParts<LinePiece<T>, AppointmentBox<T>>(
      layer,
      (piece) => piece.id,
      (piece) => new AppointmentBox<T>({ host, piece }),
      (box, piece) => box.show(piece),
    );
    this.mores = new KeyedParts<More, Component<HTMLButtonElement>>(
      layer,
      (more) => String(more.day),
      (more) => this.makeMore(more),
      (button, more) => this.drawMore(button, more),
      () => this.boxes.size,
    );
    this.now = part<HTMLDivElement>(layer, 'div', 'mx-scheduler__now');
    this.now.attr.add({ 'aria-hidden': 'true' });

    this.motif.setDisposable(
      model.onChanged((change) => {
        if (this.props.away[this.id]) {
          this.stale = true;
          return;
        }
        if (change === 'focus') this.writeFocus(false);
        else if (change === 'window') this.drawWindow();
        else if (change === 'now') this.drawNow();
      }),
    );
    this.motif.setDisposable(() => delete this.props.away[this.id]);
    this.made = true;
    this.draw();
    onReState(this, () => this.draw());
  }

  override onActivated(): void {
    this.props.away[this.id] = false;
    if (!this.stale) return;
    this.stale = false;
    this.draw();
  }

  override onDeactivated(): void {
    this.props.away[this.id] = true;
  }

  /** All of the row, as the model has it now. */
  draw(): void {
    if (this.isDisposed || !this.made) return;
    const row = this.row;
    put(this, 'data-edge', row.edge || null);
    flag(this, 'data-first', row.index === 0);
    css(this, 'block-size', `${row.height}px`);
    this.heads.show((row.group?.path ?? []).map((resource, level) => ({ level, resource })));
    this.drawWindow();
    this.cells.writeLook();
    this.writeFocus(true);
  }

  /** Its cell showing a place, while it is built (only the cells in the window are). */
  cellAt(place: CellPlace): ComponentBase | null {
    const tick = this.ticks.find((one) => this.row.first + one.day.index === place.column && one.slot === place.slot);
    return tick ? (this.cellParts.get(String(tick.index)) ?? null) : null;
  }

  /** Its box of a piece, while the row shows it. */
  boxOf(id: string): ComponentBase | null {
    if (!this.made) return null;
    return this.boxes.get(id) ?? null;
  }

  /** The place of its cell that has focus, if one has. */
  cellWithFocus(): CellPlace | null {
    const tick = this.made ? this.cells.find(isFocused) : undefined;
    return tick ? { column: this.row.first + tick.day.index, slot: tick.slot } : null;
  }

  /** The piece of its box that has focus, if one has. */
  pieceWithFocus(): string | null {
    const piece = this.pieces.find((one) => {
      const box = this.boxOf(one.id);
      return !!box && isFocused(box);
    });
    return piece?.id ?? null;
  }

  /** What the window shows along the time: the cells, the boxes, "+N more", the line at the time it is now. */
  private drawWindow(): void {
    const { host, row } = this;
    const model = host.model;
    this.ticks = model.shownTicks();
    this.pieces = row.pieces.filter((piece) => model.ticksShown(piece.from, piece.span));
    this.cellParts.show(this.ticks);
    this.boxes.show(this.pieces);
    const per = this.per();
    this.mores.show(row.more.filter((more) => model.ticksShown(more.day * per, per)));
    this.drawNow();
  }

  private drawNow(): void {
    const { host } = this;
    const at = host.model.nowTick();
    kept(this.now, host.showCurrentTime() && at !== null);
    css(this.now, '--_at', String(at ?? 0));
  }

  private per(): number {
    const model = this.host.model;
    return dayCells(model.view.type) ? 1 : Math.max(1, model.state.slots.length);
  }

  private columnOf(tick: TimeTick): SchedulerColumn | undefined {
    return this.host.model.state.columns[this.row.first + tick.day.index];
  }

  private focused(tick: TimeTick): boolean {
    const focus = this.host.model.state.focus;
    return focus.column === this.row.first + tick.day.index && focus.slot === tick.slot;
  }

  private time(tick: TimeTick): Date {
    return this.host.model.zone.date(tick.day.wall + tick.minutes * 60_000);
  }

  private work(tick: TimeTick): boolean {
    const column = this.columnOf(tick);
    if (!column?.work) return false;
    return tick.slot < 0 || (tick.minutes >= column.workStart * 60 && tick.minutes < column.workEnd * 60);
  }

  private label(tick: TimeTick): string {
    const column = this.columnOf(tick);
    if (!column) return '';
    const host = this.host;
    const words = cellWords(host, column, tick.slot);
    const date = host.format.fullDate(tick.day.date);
    return tick.slot < 0 ? `${words.group}${date}${words.block}` : `${words.group}${date}, ${host.format.time(this.time(tick))}${words.block}`;
  }

  /**
   * The focus or the selection moved: the cells it left and the one it is on; every cell of the row while a range is
   * selected on it (a selection stays in its anchor's row).
   */
  private writeFocus(all: boolean): void {
    const st = this.host.model.state;
    const row = this.row;
    const mine = (column: number) => column >= row.first && column < row.first + st.days.length;
    const idOf = (column: number, slot: number) => (column - row.first) * this.per() + (dayCells(this.host.model.view.type) ? 0 : slot);
    const { column, slot } = st.focus;
    const anchor = st.anchor;
    const now = mine(column) ? [idOf(column, slot)] : [];
    const range = !!anchor && (anchor.column !== column || anchor.slot !== slot) && mine(anchor.column);
    if (all || range || this.ranged) this.cells.writeFocus();
    else this.cells.writeFocus([...this.lit, ...now]);
    this.ranged = range;
    this.lit = now;
  }

  private makeCell(tick: TimeTick): Component<HTMLDivElement> {
    const c = new Component<HTMLDivElement>('div');
    c.class.add('mx-scheduler__cell');
    c.attr.add({ role: 'gridcell' });
    this.cells.add(tick.index, tick, c);
    this.fillCell(c, tick);
    return c;
  }

  /** What a cell template is given: each read reads the cell as it is now. */
  private cellContext(tick: TimeTick): CellTemplateContext {
    const line = this;
    const model = this.host.model;
    return {
      get start() {
        return tick.slot < 0 ? tick.day.date : line.time(tick);
      },
      get end() {
        return tick.slot < 0 ? model.zone.addDays(tick.day.date, 1) : model.zone.date(tick.day.wall + (tick.minutes + model.view.cellDuration) * 60_000);
      },
      get allDay() {
        return tick.slot < 0;
      },
      get resources() {
        return line.row.group ? { ...line.row.group.values } : null;
      },
      get view() {
        return model.view.type;
      },
      get today() {
        return tick.day.today;
      },
      get work() {
        return line.work(tick);
      },
      get blocked() {
        return !!model.blockAt(line.row.first + tick.day.index, tick.slot);
      },
    };
  }

  private makeHead(level: number, resource: GroupResource): Component<HTMLDivElement> {
    const c = new Component<HTMLDivElement>('div');
    c.class.add('mx-scheduler__resource');
    put(c, 'data-level', String(level));
    this.fillHead(c, level, resource);
    this.drawHead(c, level, resource);
    return c;
  }

  private fillHead(c: Component<HTMLDivElement>, level: number, resource: GroupResource): void {
    const host = this.host;
    c.controls.clear();
    const content = part<HTMLDivElement>(c, 'div', 'mx-scheduler__group-content');
    const template = host.headerTemplate();
    this.filled.set(c, { template, content });
    if (template) {
      const row = this.row;
      content.controls.add(
        template({
          field: resource.field,
          get label() {
            return host.resources.kind(resource.field)?.label ?? resource.field;
          },
          value: resource.value,
          get item() {
            return host.resources.kind(resource.field)?.find(resource.value);
          },
          text: resource.text,
          color: resource.color,
          level,
          values: Object.fromEntries((row.group?.path ?? []).slice(0, level + 1).map((p) => [p.field, p.value])),
          date: null,
        }),
      );
    } else {
      const swatch = part<HTMLSpanElement>(content, 'span', 'mx-scheduler__group-swatch');
      kept(swatch, !!resource.color);
      css(swatch, '--_color', resource.color ?? '');
      text(part<HTMLSpanElement>(content, 'span', 'mx-scheduler__group-text'), resource.text);
    }
  }

  private drawHead(c: Component<HTMLDivElement>, level: number, resource: GroupResource): void {
    if (this.filled.get(c)?.template !== this.host.headerTemplate()) this.fillHead(c, level, resource);
    const starts = !!this.row.starts[level];
    flag(c, 'data-continued', !starts);
    kept(this.filled.get(c)?.content ?? null, starts);
  }

  private makeMore(more: More): Component<HTMLButtonElement> {
    const button = new Component<HTMLButtonElement>('button');
    button.attr.add({ type: 'button' });
    button.class.add('mx-scheduler__more');
    button.motif.on('click', () => {
      const at = this.moreOf.get(button);
      if (!at) return;
      const st = this.host.model.state;
      this.host.openMore(st.days[at.day].date, this.row.group?.index ?? -1, button);
    });
    this.drawMore(button, more);
    return button;
  }

  private drawMore(button: Component<HTMLButtonElement>, more: More): void {
    const { host, row } = this;
    const st = host.model.state;
    this.moreOf.set(button, more);
    css(button, '--_from', String(more.day * this.per()));
    css(button, '--_lane', String(row.moreLane));
    put(button, 'aria-label', host.text('schedulerMoreLabel', { count: more.count, date: `${row.label ? `${row.label}, ` : ''}${host.format.fullDate(st.days[more.day]?.date ?? new Date())}` }));
    text(button, host.text('schedulerMore', { count: more.count }));
  }
}
