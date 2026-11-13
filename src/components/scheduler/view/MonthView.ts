import { Component, untracked, type ComponentBase } from '@motifx/core';
import { boxOf, measure, onLayout } from '../../../core/measure';
import { onReState } from '../../../core/on-re-state';
import type { CellTemplateContext } from '../cell-template-context';
import type { CellPlace } from '../model/cell-place';
import type { HeaderCell } from '../model/header-cell';
import type { SchedulerColumn } from '../model/scheduler-column';
import type { StripPiece } from '../model/strip-piece';
import type { StripRow } from '../model/strip-row';
import { AppointmentBox } from './AppointmentBox';
import { cellWords } from './cell-words';
import { part } from '../../../core/draw-parts';
import { css, flag, put, shown, text } from '../../../core/part-writes';
import { GroupHeads } from './GroupHeads';
import { KeyedParts } from './KeyedParts';
import type { SchedulerHost } from './scheduler-host';
import type { ShownView } from './shown-view';

interface Props<T> {
  host: SchedulerHost<T>;
}

type CellTemplate = ((context: CellTemplateContext) => ComponentBase) | null;

/** A weekday head as last drawn, and the template its content was filled with. */
interface NameDrawn {
  cell: HeaderCell;
  template: unknown;
  text: Component<HTMLElement> | null;
}

/** A week of the layer: its boxes and its "+N more" buttons. */
interface WeekLayer<T> {
  week: StripRow<T>;
  boxes: KeyedParts<StripPiece<T>, AppointmentBox<T>>;
  mores: KeyedParts<SchedulerColumn, Component<HTMLButtonElement>>;
}

/** What the room of a week is worked out from, as read: the grid's height, a line's and a day number's. */
interface RoomRead {
  grid: number;
  lane: number;
  date: number;
}

/**
 * The month view: a row per week, a cell per day of each group (one grid, arrows move by a day and by a week), and over
 * each week its appointments as bars and chips in lines. Lines past the room a week has become "+N more" on each day
 * they leave out.
 *
 * It follows nothing. The month is small: whatever the model tells, the view draws itself again (each part only what
 * it shows), as it does on `reState()` and when an option or a text it shows changes.
 */
export class MonthView<T> extends Component<HTMLDivElement, Props<T>> implements ShownView {
  /** Its parts are created (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
  private lane!: Component<HTMLDivElement>;
  private date!: Component<HTMLDivElement>;
  private parts!: {
    head: Component<HTMLDivElement>;
    heads: GroupHeads<T>;
    names: KeyedParts<HeaderCell, Component<HTMLDivElement>>;
    body: Component<HTMLDivElement>;
    grid: Component<HTMLDivElement>;
    weeks: KeyedParts<StripRow<T>, Component<HTMLDivElement>> | null;
    layer: Component<HTMLDivElement>;
    layers: KeyedParts<StripRow<T>, Component<HTMLDivElement>>;
  };
  private readonly nameDrawn = new WeakMap<Component<HTMLDivElement>, NameDrawn>();
  /** The cells of each week row. */
  private readonly cellsOf = new WeakMap<Component<HTMLDivElement>, KeyedParts<SchedulerColumn, Component<HTMLDivElement>>>();
  /** The column each cell and each "+N more" button stands for, as last drawn. */
  private readonly columnOf = new WeakMap<ComponentBase, SchedulerColumn>();
  /** The day number of each cell. */
  private readonly numberOf = new WeakMap<Component<HTMLDivElement>, Component<HTMLElement>>();
  private readonly layerOf = new WeakMap<Component<HTMLDivElement>, WeekLayer<T>>();
  /** The cell template the cells are filled with: another one fills the same cells again. */
  private cellTemplate: CellTemplate | undefined = undefined;
  /** A cell's content made by the cell template. */
  private readonly contentOf = new WeakMap<Component<HTMLDivElement>, Component<HTMLDivElement>>();

  constructor(props: Props<T>) {
    super('div', props);
  }

  private get host(): SchedulerHost<T> {
    return this.props.host;
  }

  override onConfigured() {
    this.class.add('mx-scheduler__month-view');
    this.makeParts();
    onLayout(this.parts.grid, 'size', () => measure(this, this.readRoom, this.fitRoom));
    this.motif.setDisposable(this.host.model.onChanged(() => this.draw()));
    this.made = true;
    this.draw();
    onReState(this, () => this.draw());
    this.motif.setDisposable(this.host.keepDrawn(() => this.draw()));
  }

  override onMounted() {
    this.host.viewShown();
  }

  private readonly readRoom = (): RoomRead => ({
    grid: boxOf(this.parts.grid).clientHeight,
    lane: boxOf(this.lane).offsetHeight,
    date: boxOf(this.date).offsetHeight,
  });

  /** How many lines of appointments fit in a week, under its day numbers. */
  private readonly fitRoom = (seen: RoomRead): void => {
    const host = this.host;
    const weeks = host.model.state.weeks.length;
    if (!weeks) return;
    const row = seen.grid / weeks;
    if (!(row > 0 && seen.lane > 0)) return;
    host.setMonthRoom(Math.max(1, Math.floor((row - seen.date) / seen.lane)));
  };

  /** The cell showing a place: in the month, its day's column. */
  cellAt(place: CellPlace): ComponentBase | null {
    if (!this.made) return null;
    const key = String(place.column);
    for (const row of this.parts.grid.controls.items) {
      const cell = this.cellsOf.get(row as Component<HTMLDivElement>)?.get(key);
      if (cell) return cell;
    }
    return null;
  }

  /** The box of a piece, in the first week that shows it. */
  boxOf(id: string): ComponentBase | null {
    if (!this.made) return null;
    for (const c of this.parts.layer.controls.items) {
      const box = this.layerOf.get(c as Component<HTMLDivElement>)?.boxes.get(id);
      if (box) return box;
    }
    return null;
  }

  /** All of the view, as the model has it now. */
  draw(): void {
    if (this.isDisposed || !this.made) return;
    const host = this.host;
    const model = host.model;
    const st = model.state;
    const parts = this.parts;
    const t = host.text.bind(host);
    flag(parts.head, 'data-by-date', model.datesFirst);
    css(parts.head, '--_columns', String(model.perRow));
    css(parts.body, '--_weeks', String(st.weeks.length));
    css(parts.body, '--_columns', String(model.perRow));
    put(parts.grid, 'aria-label', t('schedulerMonth'));
    put(parts.layer, 'aria-label', t('schedulerAppointments'));
    parts.heads.draw();
    parts.names.show(st.dates);
    if (!parts.weeks) this.makeWeeks();
    const template = untracked(() => host.cellTemplate());
    if (template !== this.cellTemplate) this.fillCells(template);
    parts.weeks?.show(st.weeks);
    parts.layers.show(st.weeks);
  }

  private makeParts(): void {
    const host = this.host;
    const head = part<HTMLDivElement>(this, 'div', 'mx-scheduler__month-head');
    const heads = new GroupHeads<T>({ host, ruler: false });
    head.controls.add(heads);
    const names = part<HTMLDivElement>(head, 'div', 'mx-scheduler__weekdays');
    names.attr.add({ 'aria-hidden': 'true' });
    const body = part<HTMLDivElement>(this, 'div', 'mx-scheduler__month-body');
    const grid = part<HTMLDivElement>(body, 'div', 'mx-scheduler__month-grid');
    grid.attr.add({ role: 'grid' });
    grid.motif.on('keydown', (_, e) => host.gridKey(e));
    const layer = part<HTMLDivElement>(body, 'div', 'mx-scheduler__month-layer');
    layer.attr.add({ role: 'group' });
    const probe = part(body, 'div', 'mx-scheduler__probe');
    probe.attr.add({ 'aria-hidden': 'true' });
    this.lane = part<HTMLDivElement>(probe, 'div', 'mx-scheduler__probe-lane');
    this.date = part<HTMLDivElement>(probe, 'div', 'mx-scheduler__probe-date');
    this.parts = {
      head,
      heads,
      names: new KeyedParts<HeaderCell, Component<HTMLDivElement>>(
        names,
        (cell) => cell.key,
        (cell) => this.makeName(cell),
        (c, cell) => this.drawName(c, cell),
      ),
      body,
      grid,
      weeks: null,
      layer,
      layers: new KeyedParts<StripRow<T>, Component<HTMLDivElement>>(
        layer,
        (week) => String(week.index),
        (week) => this.makeLayer(week),
        (c, week) => this.drawLayer(c, week),
      ),
    };
  }

  /** The weeks' rows, made once: a row and its cells are kept while the week stays. */
  private makeWeeks(): void {
    const parts = this.parts;
    parts.weeks = new KeyedParts<StripRow<T>, Component<HTMLDivElement>>(
      parts.grid,
      (week) => String(week.index),
      (week) => {
        const row = new Component<HTMLDivElement>('div');
        row.class.add('mx-scheduler__week-row');
        row.attr.add({ role: 'row' });
        this.cellsOf.set(
          row,
          new KeyedParts<SchedulerColumn, Component<HTMLDivElement>>(
            row,
            (column) => String(column.index),
            (column) => this.makeCell(column),
            (c, column) => this.drawCell(c, column),
          ),
        );
        this.cellsOf.get(row)!.show(week.columns);
        return row;
      },
      (row, week) => this.cellsOf.get(row)?.show(week.columns),
    );
  }

  /** Another cell template: the same cells, each filled again by it. */
  private fillCells(template: CellTemplate): void {
    this.cellTemplate = template;
    this.parts.weeks?.each((row) => this.cellsOf.get(row)?.each((c) => this.fillCell(c)));
  }

  /** A cell's content, after its number: the cell template's, if there is one. */
  private fillCell(c: Component<HTMLDivElement>): void {
    const was = this.contentOf.get(c);
    if (was) c.controls.remove(was);
    this.contentOf.delete(c);
    const template = this.cellTemplate;
    const column = this.columnOf.get(c);
    if (!template || !column) return;
    const content = part<HTMLDivElement>(c, 'div', 'mx-scheduler__cell-content');
    content.controls.add(template(this.cellContext(c, column)));
    this.contentOf.set(c, content);
  }

  private makeCell(column: SchedulerColumn): Component<HTMLDivElement> {
    const host = this.host;
    const c = new Component<HTMLDivElement>('div');
    c.class.add('mx-scheduler__cell mx-scheduler__month-cell');
    c.attr.add({ role: 'gridcell' });
    const at = () => ({ column: this.columnOf.get(c)?.index ?? column.index, slot: -1 });
    c.motif.on('pointerdown', (_, e) => host.cellPointerDown(at(), e));
    c.motif.on('click', (_, e) => host.cellClick(at(), e));
    c.motif.on('dblclick', (_, e) => host.cellDblClick(at(), e));
    const number = part(c, 'span', 'mx-scheduler__day-number');
    number.attr.add({ 'aria-hidden': 'true' });
    this.numberOf.set(c, number);
    this.columnOf.set(c, column);
    this.fillCell(c);
    this.drawCell(c, column);
    return c;
  }

  private drawCell(c: Component<HTMLDivElement>, column: SchedulerColumn): void {
    const host = this.host;
    const model = host.model;
    this.columnOf.set(c, column);
    put(c, 'data-cell', `${column.index}:-1`);
    flag(c, 'data-today', column.day.today);
    flag(c, 'data-past', column.day.past);
    flag(c, 'data-outside', column.day.outside);
    flag(c, 'data-holiday', column.day.holiday);
    flag(c, 'data-weekend', column.day.weekend);
    put(c, 'data-edge', column.edge || null);
    flag(c, 'data-blocked', column.blocked);
    put(c, 'tabindex', model.state.focus.column === column.index ? '0' : '-1');
    put(c, 'aria-selected', String(model.isSelected(column.index, -1)));
    const words = cellWords(host, column, -1);
    put(c, 'aria-label', `${words.group}${host.format.fullDate(column.day.date)}${words.block}`);
    const number = this.numberOf.get(c);
    if (number) text(number, host.format.dayNumber(column.day.date));
  }

  private makeName(cell: HeaderCell): Component<HTMLDivElement> {
    const c = new Component<HTMLDivElement>('div');
    c.class.add('mx-scheduler__weekday-name');
    this.nameDrawn.set(c, { cell, template: undefined, text: null });
    this.fillName(c);
    this.drawName(c, cell);
    return c;
  }

  /** A weekday head's content: the template's, else the weekday. */
  private fillName(c: Component<HTMLDivElement>): void {
    const drawn = this.nameDrawn.get(c)!;
    c.controls.clear();
    const template = this.host.dateTemplate();
    drawn.template = template;
    drawn.text = null;
    if (template) part(c, 'div', 'mx-scheduler__date-content').controls.add(template(this.dateContext(c)));
    else drawn.text = part(c, 'span', '');
  }

  private drawName(c: Component<HTMLDivElement>, cell: HeaderCell): void {
    const drawn = this.nameDrawn.get(c)!;
    drawn.cell = cell;
    if (drawn.template !== this.host.dateTemplate()) this.fillName(c);
    put(c, 'data-edge', cell.edge || null);
    css(c, 'grid-column', `${cell.first + 1} / span ${cell.span}`);
    if (drawn.text) text(drawn.text, cell.day ? this.host.format.weekday(cell.day.date) : '');
  }

  private makeLayer(week: StripRow<T>): Component<HTMLDivElement> {
    const host = this.host;
    const c = new Component<HTMLDivElement>('div');
    c.class.add('mx-scheduler__week-layer');
    const boxes = new KeyedParts<StripPiece<T>, AppointmentBox<T>>(
      c,
      (piece) => piece.id,
      (piece) => new AppointmentBox<T>({ host, piece }),
      (box, piece) => box.show(piece),
    );
    const layer: WeekLayer<T> = {
      week,
      boxes,
      mores: new KeyedParts<SchedulerColumn, Component<HTMLButtonElement>>(
        c,
        (column) => String(column.index),
        (column) => this.makeMore(c, column),
        (button, column) => this.drawMore(c, button, column),
        () => boxes.size,
      ),
    };
    this.layerOf.set(c, layer);
    this.drawLayer(c, week);
    return c;
  }

  private drawLayer(c: Component<HTMLDivElement>, week: StripRow<T>): void {
    const layer = this.layerOf.get(c);
    if (!layer) return;
    layer.week = week;
    layer.boxes.show(week.pieces);
    layer.mores.show(week.columns);
  }

  private makeMore(c: Component<HTMLDivElement>, column: SchedulerColumn): Component<HTMLButtonElement> {
    const button = new Component<HTMLButtonElement>('button');
    button.attr.add({ type: 'button' });
    button.class.add('mx-scheduler__more');
    button.motif.on('click', () => {
      const at = this.columnOf.get(button);
      if (at) this.host.openMore(at.day.date, at.group?.index ?? -1, button);
    });
    this.drawMore(c, button, column);
    return button;
  }

  private drawMore(c: Component<HTMLDivElement>, button: Component<HTMLButtonElement>, column: SchedulerColumn): void {
    const layer = this.layerOf.get(c);
    const week = layer?.week;
    if (!week) return;
    const host = this.host;
    this.columnOf.set(button, column);
    const inWeek = column.index % host.model.perRow;
    const count = week.more[inWeek] ?? 0;
    shown(button, count > 0);
    css(button, 'grid-column', String(inWeek + 1));
    css(button, 'grid-row', String((week.moreAt[inWeek] ?? 0) + 1));
    put(button, 'aria-label', host.text('schedulerMoreLabel', { count, date: `${cellWords(host, column, -1).group}${host.format.fullDate(column.day.date)}` }));
    text(button, host.text('schedulerMore', { count }));
  }

  /** What a date template is given: each read reads the head as it is now. */
  private dateContext(c: Component<HTMLDivElement>) {
    const drawn = this.nameDrawn.get(c)!;
    const host = this.host;
    return {
      get date() {
        return drawn.cell.day?.date ?? new Date(NaN);
      },
      get weekday() {
        return drawn.cell.day ? host.format.weekday(drawn.cell.day.date) : '';
      },
      number: '',
      get today() {
        return false;
      },
      get view() {
        return host.model.view.type;
      },
      get resources() {
        return Object.keys(drawn.cell.values).length ? { ...drawn.cell.values } : null;
      },
    };
  }

  /** What a cell template is given: each read reads the column the cell shows now. */
  private cellContext(c: Component<HTMLDivElement>, first: SchedulerColumn): CellTemplateContext {
    const model = this.host.model;
    const column = () => this.columnOf.get(c) ?? first;
    return {
      get start() {
        return column().day.date;
      },
      get end() {
        return model.zone.addDays(column().day.date, 1);
      },
      allDay: true,
      get resources() {
        const group = column().group;
        return group ? { ...group.values } : null;
      },
      get view() {
        return model.view.type;
      },
      get today() {
        return column().day.today;
      },
      get work() {
        return column().work;
      },
      get blocked() {
        return column().blocked;
      },
    };
  }
}
