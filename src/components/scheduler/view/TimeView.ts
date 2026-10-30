import { Component, untracked, type ComponentBase } from '@motifx/core';
import { later } from '../../../core/later';
import { nextFrame } from '../../../core/next-frame';
import { onReState } from '../../../core/on-re-state';
import type { CellTemplateContext } from '../cell-template-context';
import type { HeaderCell } from '../model/header-cell';
import type { ModelChange } from '../model/SchedulerModel';
import type { SchedulerColumn } from '../model/scheduler-column';
import type { StripPiece } from '../model/strip-piece';
import type { TimeSlot } from '../model/time-slot';
import type { TimedPiece } from '../model/timed-piece';
import { AppointmentBox } from './AppointmentBox';
import { CellWriter } from './CellWriter';
import type { CellSpot } from './cell-spot';
import { cellWords } from './cell-words';
import { css, flag, part, put, shown, text } from '../../../core/draw-parts';
import { GroupHeads } from './GroupHeads';
import { KeyedParts } from './KeyedParts';
import type { SchedulerHost } from './scheduler-host';

/** The cells a big view's window moves on by at least: small steps, so each builds little. */
const STEP = 2;

interface Props<T> {
  host: SchedulerHost<T>;
}

type CellTemplate = ((context: CellTemplateContext) => ComponentBase) | null;

/** A date head as last drawn, and the template its content was filled with. */
interface DateDrawn {
  cell: HeaderCell;
  template: unknown;
  weekday: HTMLElement | null;
  number: HTMLElement | null;
}

/** An hour of the ruler as last drawn. */
interface HourDrawn {
  slot: TimeSlot;
  template: unknown;
  text: HTMLElement | null;
}

/**
 * The day, week and work week views: the dates on top (with the heads of the groups over them, or under them by date),
 * the all-day panel under them, then the hours down with a column per day of each group. The cells are one grid
 * (arrows, Shift to select); the appointments lie over it in their own layer, each placed by its piece. Changing the
 * date fills the same rows and columns in place. With many groups only the columns in view (and a screen on each side)
 * are built, each at its own column of the grid.
 *
 * It follows nothing: it draws what the model says changed (the focus its cells, the window the parts it shows, the
 * clock the layer, anything else all of it), on `reState()` and when an option or a text it shows changes.
 */
export class TimeView<T> extends Component<HTMLDivElement, Props<T>> {
  /** Its parts are made (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
  private headEl: HTMLElement | null = null;
  private scroller: HTMLElement | null = null;
  private cellsEl: HTMLElement | null = null;
  private stopFollow: (() => void) | null = null;
  /** How many columns are built on each side of the ones in view: none at first, more each frame up to a screen. */
  private side = 0;
  private stopGrow: (() => void) | null = null;

  // Many columns of many rows. A row's cells stand in places, as many as the columns built, and each place shows the
  // column the window puts there: as the view scrolls a place shows another column and is written again, and no cell
  // is made or dropped. A cell is written when it is made and again only when what it shows changes.
  private places: number[] = [];
  private writer!: CellWriter<CellSpot>;
  private lit: number[] = [];
  private ranged = false;

  private parts!: {
    head: Component<HTMLDivElement>;
    heads: GroupHeads<T>;
    dates: KeyedParts<HeaderCell, Component<HTMLDivElement>>;
    allDay: Component<HTMLDivElement>;
    allDayLabel: HTMLElement;
    allDayGrid: Component<HTMLDivElement>;
    allDayRow: Component<HTMLDivElement> | null;
    allDayCells: KeyedParts<number, Component<HTMLDivElement>> | null;
    bars: Component<HTMLDivElement>;
    barBoxes: KeyedParts<StripPiece<T>, AppointmentBox<T>>;
    mores: KeyedParts<SchedulerColumn, Component<HTMLButtonElement>>;
    body: Component<HTMLDivElement>;
    hours: KeyedParts<TimeSlot, Component<HTMLDivElement>>;
    cells: Component<HTMLDivElement>;
    rows: KeyedParts<TimeSlot, Component<HTMLDivElement>> | null;
    rowCells: WeakMap<Component<HTMLDivElement>, KeyedParts<number, Component<HTMLDivElement>>>;
    layer: Component<HTMLDivElement>;
    boxes: KeyedParts<TimedPiece<T>, AppointmentBox<T>>;
    nows: KeyedParts<SchedulerColumn, Component<HTMLDivElement>>;
  };
  private readonly dateDrawn = new WeakMap<Component<HTMLDivElement>, DateDrawn>();
  private readonly hourDrawn = new WeakMap<Component<HTMLDivElement>, HourDrawn>();
  /** The column each "+N more" button stands for, as last drawn. */
  private readonly moreOf = new WeakMap<Element, SchedulerColumn>();
  /** The cell template the cells were made with: another one makes them again. */
  private cellTemplate: CellTemplate | undefined = undefined;

  constructor(props: Props<T>) {
    super('div', props);
  }

  private get host(): SchedulerHost<T> {
    return this.props.host;
  }

  override onConfigured() {
    this.class.add('mx-scheduler__time-view');
    const host = this.host;
    const model = host.model;
    this.writer = new CellWriter<CellSpot>(
      (spot, cell) => this.writeLook(spot, cell),
      ({ column, slot }, cell) => {
        if (!column) return;
        const at = slot ? slot.index : -1;
        cell.put('tabindex', this.focused(column.index, at) ? '0' : '-1').put('aria-selected', String(model.isSelected(column.index, at)));
      },
    );
    this.makeParts();
    this.motif.setDisposable(model.onChanged((change) => this.changed(change)));
    this.made = true;
    this.draw();
    onReState(this, () => this.draw());
    this.motif.setDisposable(host.keepDrawn(() => this.draw()));
  }

  override onMounted() {
    this.follow();
    this.host.viewShown();
  }

  override onDisposing() {
    this.stopFollow?.();
    this.stopGrow?.();
    this.host.setScroller(null);
  }

  // Only what changed is drawn: the layout all of it; the window the lists of what it shows (a box that stays is only
  // drawn again, one that comes in is made); the clock what is in the layer; the focus its cells.
  private changed(change: ModelChange): void {
    if (this.isDisposed) return;
    if (change === 'focus') return this.writeFocus(false);
    if (change === 'now') return this.drawLayer();
    if (change === 'window') return this.drawWindow();
    this.draw();
  }

  /** All of the view, as the model has it now. */
  draw(): void {
    if (this.isDisposed || !this.made) return;
    const host = this.host;
    const model = host.model;
    const st = model.state;
    const parts = this.parts;
    const t = host.text.bind(host);
    // A big view lays its rows of cells out by place, not as grids of every column.
    this.element.toggleAttribute('data-virtual', model.virtual);
    const columns = String(st.columns.length);
    flag(parts.head.element, 'data-by-date', model.datesFirst);
    css(parts.head.element, '--_columns', columns);
    css(parts.body.element, '--_columns', columns);
    css(parts.body.element, '--_rows', String(st.slots.length));
    shown(parts.allDay.element, model.view.allDayPanel);
    css(parts.allDay.element, '--_lines', String(Math.max(1, Math.min(st.allDay.lanes, host.allDayLines() + 1))));
    text(parts.allDayLabel, t('schedulerAllDay'));
    put(parts.allDayGrid.element, 'aria-label', t('schedulerAllDay'));
    put(parts.bars.element, 'aria-label', `${t('schedulerAllDay')}, ${t('schedulerAppointments')}`);
    put(parts.cells.element, 'aria-label', t('schedulerTimes'));
    put(parts.layer.element, 'aria-label', t('schedulerAppointments'));
    parts.hours.show(st.slots);
    const template = untracked(() => host.cellTemplate());
    if (template !== this.cellTemplate) this.makeCells(template);
    this.drawCells();
    parts.heads.draw();
    this.drawShown();
    this.writer.writeLook();
    this.movePlaces();
    this.writeFocus(true);
  }

  /** The window moved along the columns: the places that show another column, and the parts it shows. */
  private drawWindow(): void {
    this.movePlaces();
    this.drawCells();
    this.parts.heads.draw();
    this.drawShown();
  }

  /** What the window shows of the heads, the all-day bars and the layer. */
  private drawShown(): void {
    const model = this.host.model;
    const st = model.state;
    const parts = this.parts;
    parts.dates.show(model.shownHeads(st.dates));
    parts.barBoxes.show(st.allDay.pieces.filter((piece) => model.columnsShown(piece.first, piece.span)));
    parts.mores.show(model.shownColumns());
    this.drawLayer();
  }

  /** The appointments over the cells, and the line at the time it is now. */
  private drawLayer(): void {
    const model = this.host.model;
    this.parts.boxes.show(model.shownTimed());
    this.parts.nows.show(model.todayColumns());
  }

  /** The places of the rows' cells, as many as the columns built. */
  private shownPlaces(): number[] {
    const model = this.host.model;
    const st = model.state;
    const count = model.virtual ? Math.min(st.window.count, st.columns.length) : st.columns.length;
    if (this.places.length !== count) this.places = Array.from({ length: count }, (_, place) => place);
    return this.places;
  }

  /** The rows' cells, made again for another cell template. */
  private makeCells(template: CellTemplate): void {
    const parts = this.parts;
    this.cellTemplate = template;
    parts.allDayRow && parts.allDayGrid.controls.remove(parts.allDayRow);
    parts.cells.controls.clear();
    this.writer.clear();
    const listen = (row: HTMLElement) => {
      const at = (e: Event) => {
        const spot = this.writer.placeOf(e, '.mx-scheduler__cell');
        return spot?.column ? { column: spot.column.index, slot: spot.slot ? spot.slot.index : -1 } : null;
      };
      const host = this.host;
      row.addEventListener('pointerdown', (e) => {
        const place = at(e);
        if (place) host.cellPointerDown(place, e);
      });
      row.addEventListener('click', (e) => {
        const place = at(e);
        if (place) host.cellClick(place, e);
      });
      row.addEventListener('dblclick', (e) => {
        const place = at(e);
        if (place) host.cellDblClick(place, e);
      });
    };
    const placesIn = (row: Component<HTMLDivElement>, slot: TimeSlot | null) =>
      new KeyedParts<number, Component<HTMLDivElement>>(
        row,
        (place) => String(place),
        (place) => this.makeCell(place, slot, template),
        () => {},
        () => 0,
        (cell, key) => this.writer.delete(this.idOf(Number(key), slot ? slot.index : -1), cell),
      );
    const allDayRow = new Component<HTMLDivElement>('div');
    allDayRow.element.className = 'mx-scheduler__row';
    allDayRow.element.setAttribute('role', 'row');
    listen(allDayRow.element);
    parts.allDayGrid.controls.add(allDayRow);
    parts.allDayRow = allDayRow;
    parts.allDayCells = placesIn(allDayRow, null);
    parts.rows = new KeyedParts<TimeSlot, Component<HTMLDivElement>>(
      parts.cells,
      (slot) => String(slot.index),
      (slot) => {
        const row = new Component<HTMLDivElement>('div');
        row.element.className = 'mx-scheduler__row';
        row.element.setAttribute('role', 'row');
        listen(row.element);
        parts.rowCells.set(row, placesIn(row, slot));
        return row;
      },
      () => {},
      () => 0,
      // A row going takes its cells: the writer lets go of them first.
      (row) => parts.rowCells.get(row)?.clear(),
    );
  }

  /** The rows of cells and the cells in each, one per place. */
  private drawCells(): void {
    const parts = this.parts;
    const st = this.host.model.state;
    const places = this.shownPlaces();
    parts.allDayCells?.show(places);
    parts.rows?.show(st.slots);
    for (const slot of st.slots) {
      const row = parts.rows?.get(String(slot.index));
      if (!row) continue;
      flag(row.element, 'data-hour-start', slot.hourStart);
      parts.rowCells.get(row)?.show(places);
    }
  }

  /** A place's cell; a cell template draws into it once it is made, and follows the column shown there. */
  private makeCell(place: number, slot: TimeSlot | null, template: CellTemplate): Component<HTMLDivElement> {
    const c = new Component<HTMLDivElement>('div');
    c.element.className = slot ? 'mx-scheduler__cell' : 'mx-scheduler__cell mx-scheduler__all-day-cell';
    c.element.setAttribute('role', 'gridcell');
    const spot: CellSpot = { place, column: this.columnAt(place), slot };
    this.writer.add(this.idOf(place, slot ? slot.index : -1), spot, c);
    if (template) part(c, 'div', 'mx-scheduler__cell-content').controls.add(template(this.cellContext(spot)));
    return c;
  }

  private writeLook({ column, slot }: CellSpot, cell: import('./CellAttributes').CellAttributes): void {
    const host = this.host;
    const model = host.model;
    const format = host.format;
    const t = host.text.bind(host);
    cell.flag('hidden', !column);
    if (!column) return;
    const where = (index: number) => cellWords(host, column, index);
    cell
      .put('style', slot ? `grid-column: ${column.index + 1}; --_at: ${column.index}` : `grid-column: ${column.index + 1}`)
      .put('data-cell', `${column.index}:${slot ? slot.index : -1}`)
      .flag('data-work', !!slot && this.work(column, slot))
      .flag('data-holiday', !!slot && column.day.holiday)
      .flag('data-today', column.day.today)
      .flag('data-past', column.day.past)
      .put('data-edge', column.edge || null)
      .flag('data-blocked', slot ? !!model.blockAt(column.index, slot.index) : column.blocked)
      .put(
        'aria-label',
        slot
          ? `${where(slot.index).group}${format.fullDate(column.day.date)}, ${format.time(this.cellTime(column, slot))}${where(slot.index).block}`
          : `${where(-1).group}${t('schedulerAllDay')}, ${format.fullDate(column.day.date)}${where(-1).block}`,
      );
  }

  /** What decides the column of each place: read once for all of them. */
  private windowNow() {
    const model = this.host.model;
    const st = model.state;
    return { virtual: model.virtual, first: st.window.first, columns: st.columns, count: this.places.length };
  }

  /** The column a place shows: in a big view the window's column that falls on it, else its own. */
  private columnAt(place: number, now = this.windowNow()): SchedulerColumn | undefined {
    if (!now.virtual || !now.count) return now.columns[place];
    return now.columns[now.first + ((((place - now.first) % now.count) + now.count) % now.count)];
  }

  private placeOf(column: number): number {
    const count = this.places.length;
    return this.host.model.virtual && count ? ((column % count) + count) % count : column;
  }

  private idOf(place: number, slot: number): number {
    return place * 1000 + slot + 1;
  }

  /** The window moved, or the columns changed: the places that show another column now. */
  private movePlaces(): void {
    const now = this.windowNow();
    this.writer.forEach((spot, id) => {
      const column = this.columnAt(spot.place, now);
      if (column === spot.column) return;
      spot.column = column;
      this.writer.write(id);
    });
  }

  /** The cells the focus left and the one it is on; every cell while a range is selected. */
  private writeFocus(all: boolean): void {
    const st = this.host.model.state;
    const { column, slot } = st.focus;
    const anchor = st.anchor;
    const now = [this.idOf(this.placeOf(column), slot)];
    const range = !!anchor && (anchor.column !== column || anchor.slot !== slot);
    if (all || range || this.ranged) this.writer.writeFocus();
    else this.writer.writeFocus([...this.lit, ...now]);
    this.ranged = range;
    this.lit = now;
  }

  private focused(column: number, slot: number): boolean {
    const focus = this.host.model.state.focus;
    return focus.column === column && focus.slot === slot;
  }

  private cellTime(column: SchedulerColumn, slot: TimeSlot): Date {
    return this.host.model.zone.date(column.day.wall + slot.minutes * 60_000);
  }

  private work(column: SchedulerColumn, slot: TimeSlot): boolean {
    return column.work && slot.minutes >= column.workStart * 60 && slot.minutes < column.workEnd * 60;
  }

  /** After a scroll, the window follows at the next frame (once however many scroll events come). */
  private followSoon(): void {
    // A scroll can still come after the view is gone (its scroll box is the page's until it is taken away).
    if (this.isDisposed || this.stopFollow) return;
    this.stopFollow = nextFrame(() => {
      this.stopFollow = null;
      if (!this.isDisposed) this.follow();
    }, this.element.ownerDocument.defaultView);
  }

  /**
   * In a big view: builds the columns in view and a screen's worth on each side, and moves on when the view nears their
   * edge. The first frame builds only the columns in view; the ones on each side come in the frames after it.
   */
  private follow(): void {
    const model = this.host.model;
    const scroller = this.scroller;
    const cells = this.cellsEl;
    const count = model.state.columns.length;
    if (!scroller || !cells || !count || !untracked(() => model.virtual)) return;
    const width = cells.offsetWidth / count;
    if (!(width > 0)) return;
    const visible = Math.max(1, Math.ceil((scroller.clientWidth - cells.offsetLeft) / width) + 1);
    const first = Math.floor(Math.abs(scroller.scrollLeft) / width);
    const now = model.state.window;
    const side = Math.min(this.side, visible);
    const want = first - side;
    const built = visible + 2 * side;
    // Until a screen is built on each side, the window keeps up with every column the view moves.
    if (now.count !== built || Math.abs(now.first - Math.max(0, want)) >= (side < visible ? 1 : STEP)) model.setWindow(want, built);
    if (side < visible) this.growSoon(visible);
  }

  /** After the frame is drawn: half a screen more on each side. */
  private growSoon(visible: number): void {
    if (this.isDisposed || this.stopGrow) return;
    let stopLater = () => {};
    const stopFrame = nextFrame(() => {
      stopLater = later(() => {
        this.stopGrow = null;
        if (this.isDisposed) return;
        this.side += Math.max(1, Math.ceil(visible / 2));
        this.follow();
      });
    }, this.element.ownerDocument.defaultView);
    this.stopGrow = () => {
      stopFrame();
      stopLater();
    };
  }

  /** The parts that stay for the life of the view; the lists in them are drawn by `draw`. */
  private makeParts(): void {
    const host = this.host;
    const model = host.model;
    const head = part<HTMLDivElement>(this, 'div', 'mx-scheduler__head');
    this.headEl = head.element;
    const heads = new GroupHeads<T>({ host, ruler: true });
    head.controls.add(heads);
    const dates = part<HTMLDivElement>(head, 'div', 'mx-scheduler__dates');
    dates.element.setAttribute('aria-hidden', 'true');
    part(dates, 'div', 'mx-scheduler__corner');
    const allDay = part<HTMLDivElement>(head, 'div', 'mx-scheduler__all-day');
    const label = part(allDay, 'div', 'mx-scheduler__all-day-label');
    label.element.setAttribute('aria-hidden', 'true');
    const area = part(allDay, 'div', 'mx-scheduler__all-day-area');
    const allDayGrid = part<HTMLDivElement>(area, 'div', 'mx-scheduler__all-day-grid');
    allDayGrid.element.setAttribute('role', 'grid');
    allDayGrid.element.addEventListener('keydown', (e) => host.gridKey(e));
    const bars = part<HTMLDivElement>(area, 'div', 'mx-scheduler__bars');
    bars.element.setAttribute('role', 'group');
    const scroll = part<HTMLDivElement>(this, 'div', 'mx-scheduler__scroll');
    this.scroller = scroll.element;
    host.setScroller(this.scroller);
    scroll.element.addEventListener('scroll', (e) => {
      if (this.headEl) this.headEl.scrollLeft = (e.currentTarget as HTMLElement).scrollLeft;
      this.followSoon();
    });
    const body = part<HTMLDivElement>(scroll, 'div', 'mx-scheduler__body');
    const ruler = part(body, 'div', 'mx-scheduler__ruler');
    ruler.element.setAttribute('aria-hidden', 'true');
    const cells = part<HTMLDivElement>(body, 'div', 'mx-scheduler__cells');
    cells.element.setAttribute('role', 'grid');
    cells.element.addEventListener('keydown', (e) => host.gridKey(e));
    this.cellsEl = cells.element;
    const layer = part<HTMLDivElement>(body, 'div', 'mx-scheduler__layer');
    layer.element.setAttribute('role', 'group');
    const box = <P extends TimedPiece<T> | StripPiece<T>>(piece: P) => new AppointmentBox<T>({ host, piece });
    let barBoxes!: KeyedParts<StripPiece<T>, AppointmentBox<T>>;
    barBoxes = new KeyedParts<StripPiece<T>, AppointmentBox<T>>(bars, (piece) => piece.id, box, (b, piece) => b.show(piece));
    let boxes!: KeyedParts<TimedPiece<T>, AppointmentBox<T>>;
    boxes = new KeyedParts<TimedPiece<T>, AppointmentBox<T>>(layer, (piece) => piece.id, box, (b, piece) => b.show(piece));
    this.parts = {
      head,
      heads,
      dates: new KeyedParts<HeaderCell, Component<HTMLDivElement>>(
        dates,
        (cell) => cell.key,
        (cell) => this.makeDate(cell),
        (c, cell) => this.drawDate(c, cell),
        () => 1,
      ),
      allDay,
      allDayLabel: label.element,
      allDayGrid,
      allDayRow: null,
      allDayCells: null,
      bars,
      barBoxes,
      mores: new KeyedParts<SchedulerColumn, Component<HTMLButtonElement>>(
        bars,
        (column) => String(column.index),
        (column) => this.makeMore(column),
        (button, column) => this.drawMore(button, column),
        () => barBoxes.size,
      ),
      body,
      hours: new KeyedParts<TimeSlot, Component<HTMLDivElement>>(
        ruler,
        (slot) => String(slot.index),
        (slot) => this.makeHour(slot),
        (c, slot) => this.drawHour(c, slot),
      ),
      cells,
      rows: null,
      rowCells: new WeakMap(),
      layer,
      boxes,
      nows: new KeyedParts<SchedulerColumn, Component<HTMLDivElement>>(
        layer,
        (column) => String(column.index),
        () => {
          const now = new Component<HTMLDivElement>('div');
          now.element.className = 'mx-scheduler__now';
          now.element.setAttribute('aria-hidden', 'true');
          return now;
        },
        (now, column) => {
          shown(now.element, host.showCurrentTime() && model.nowAt() !== null);
          css(now.element, '--_column', String(column.index));
          css(now.element, 'inset-block-start', `${(model.nowAt() ?? 0) * 100}%`);
        },
        () => boxes.size,
      ),
    };
  }

  private makeDate(cell: HeaderCell): Component<HTMLDivElement> {
    const c = new Component<HTMLDivElement>('div');
    c.element.className = 'mx-scheduler__date';
    this.dateDrawn.set(c, { cell, template: undefined, weekday: null, number: null });
    this.fillDate(c);
    this.drawDate(c, cell);
    return c;
  }

  /** A date head's content: the template's, else the weekday and the number. */
  private fillDate(c: Component<HTMLDivElement>): void {
    const drawn = this.dateDrawn.get(c)!;
    c.controls.clear();
    const template = this.host.dateTemplate();
    drawn.template = template;
    drawn.weekday = drawn.number = null;
    if (template) {
      part(c, 'div', 'mx-scheduler__date-content').controls.add(template(this.dateContext(c)));
      return;
    }
    drawn.weekday = part(c, 'span', 'mx-scheduler__weekday').element;
    drawn.number = part(c, 'span', 'mx-scheduler__day-number').element;
  }

  private drawDate(c: Component<HTMLDivElement>, cell: HeaderCell): void {
    const drawn = this.dateDrawn.get(c)!;
    drawn.cell = cell;
    if (drawn.template !== this.host.dateTemplate()) this.fillDate(c);
    const el = c.element;
    const format = this.host.format;
    flag(el, 'data-today', cell.day?.today);
    flag(el, 'data-holiday', cell.day?.holiday);
    flag(el, 'data-weekend', cell.day?.weekend);
    put(el, 'data-edge', cell.edge || null);
    css(el, 'grid-column', `${cell.first + 2} / span ${cell.span}`);
    if (drawn.weekday) text(drawn.weekday, cell.day ? format.weekday(cell.day.date) : '');
    if (drawn.number) text(drawn.number, cell.day ? format.dayNumber(cell.day.date) : '');
  }

  private makeHour(slot: TimeSlot): Component<HTMLDivElement> {
    const c = new Component<HTMLDivElement>('div');
    c.element.className = 'mx-scheduler__hour';
    this.hourDrawn.set(c, { slot, template: undefined, text: null });
    this.fillHour(c);
    this.drawHour(c, slot);
    return c;
  }

  /** An hour's content: the template's, else its text. */
  private fillHour(c: Component<HTMLDivElement>): void {
    const drawn = this.hourDrawn.get(c)!;
    c.controls.clear();
    const template = this.host.timeTemplate();
    drawn.template = template;
    const span = part(c, 'span', '');
    drawn.text = null;
    if (template) span.controls.add(template(this.timeContext(c)));
    else drawn.text = span.element;
  }

  private drawHour(c: Component<HTMLDivElement>, slot: TimeSlot): void {
    const drawn = this.hourDrawn.get(c)!;
    drawn.slot = slot;
    if (drawn.template !== this.host.timeTemplate()) this.fillHour(c);
    flag(c.element, 'data-hour-start', slot.hourStart);
    if (drawn.text) text(drawn.text, slot.hourStart ? this.host.format.hour(slot.minutes) : '');
  }

  private makeMore(column: SchedulerColumn): Component<HTMLButtonElement> {
    const button = new Component<HTMLButtonElement>('button');
    button.element.type = 'button';
    button.element.className = 'mx-scheduler__more';
    button.element.addEventListener('click', (e) => {
      const at = this.moreOf.get(button.element);
      if (at) this.host.openMore(at.day.date, at.group?.index ?? -1, e.currentTarget as HTMLElement);
    });
    this.drawMore(button, column);
    return button;
  }

  private drawMore(button: Component<HTMLButtonElement>, column: SchedulerColumn): void {
    const host = this.host;
    const st = host.model.state;
    const el = button.element;
    this.moreOf.set(el, column);
    const count = st.allDay.more[column.index] ?? 0;
    shown(el, count > 0);
    css(el, 'grid-column', String(column.index + 1));
    css(el, 'grid-row', String((st.allDay.moreAt[column.index] ?? 0) + 1));
    put(el, 'aria-label', host.text('schedulerMoreLabel', { count, date: `${cellWords(host, column, -1).group}${host.format.fullDate(column.day.date)}` }));
    text(el, host.text('schedulerMore', { count }));
  }

  /** What a date template is given: each read reads the head as it is now. */
  private dateContext(c: Component<HTMLDivElement>) {
    const drawn = this.dateDrawn.get(c)!;
    const host = this.host;
    return {
      get date() {
        return drawn.cell.day?.date ?? new Date(NaN);
      },
      get weekday() {
        return drawn.cell.day ? host.format.weekday(drawn.cell.day.date) : '';
      },
      get number() {
        return drawn.cell.day ? host.format.dayNumber(drawn.cell.day.date) : '';
      },
      get today() {
        return !!drawn.cell.day?.today;
      },
      get view() {
        return host.model.view.type;
      },
      get resources() {
        return Object.keys(drawn.cell.values).length ? { ...drawn.cell.values } : null;
      },
    };
  }

  /** What a time template is given. */
  private timeContext(c: Component<HTMLDivElement>) {
    const drawn = this.hourDrawn.get(c)!;
    const host = this.host;
    return {
      get date() {
        return host.model.zone.date((host.model.state.days[0]?.wall ?? 0) + drawn.slot.minutes * 60_000);
      },
      get minutes() {
        return drawn.slot.minutes;
      },
      get text() {
        return host.format.hour(drawn.slot.minutes);
      },
      get view() {
        return host.model.view.type;
      },
    };
  }

  /** What a cell template is given: each read reads the column shown at the cell's place now. */
  private cellContext(spot: CellSpot): CellTemplateContext {
    const view = this;
    const model = this.host.model;
    return {
      get start() {
        const column = spot.column!;
        return spot.slot ? view.cellTime(column, spot.slot) : column.day.date;
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
        return spot.slot ? view.work(column, spot.slot) : column.work;
      },
      get blocked() {
        return !!model.blockAt(spot.column!.index, spot.slot ? spot.slot.index : -1);
      },
    };
  }
}
