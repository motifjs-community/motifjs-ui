import { Component, untracked, type ComponentBase } from '@motifx/core';
import { onReState } from '../../../core/on-re-state';
import { ResizeWatch } from '../../../core/resize-watch';
import type { CellTemplateContext } from '../cell-template-context';
import type { HeaderCell } from '../model/header-cell';
import type { SchedulerColumn } from '../model/scheduler-column';
import type { StripPiece } from '../model/strip-piece';
import type { StripRow } from '../model/strip-row';
import { AppointmentBox } from './AppointmentBox';
import { cellWords } from './cell-words';
import { css, flag, part, put, shown, text } from '../../../core/draw-parts';
import { GroupHeads } from './GroupHeads';
import { KeyedParts } from './KeyedParts';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
}

type CellTemplate = ((context: CellTemplateContext) => ComponentBase) | null;

/** A weekday head as last drawn, and the template its content was filled with. */
interface NameDrawn {
  cell: HeaderCell;
  template: unknown;
  text: HTMLElement | null;
}

/** A week of the layer: its boxes and its "+N more" buttons. */
interface WeekLayer<T> {
  week: StripRow<T>;
  boxes: KeyedParts<StripPiece<T>, AppointmentBox<T>>;
  mores: KeyedParts<SchedulerColumn, Component<HTMLButtonElement>>;
}

/**
 * The month view: a row per week, a cell per day of each group (one grid, arrows move by a day and by a week), and over
 * each week its appointments as bars and chips in lines. Lines past the room a week has become "+N more" on each day
 * they leave out.
 *
 * It follows nothing. The month is small: whatever the model tells, the view draws itself again (each part only what
 * it shows), as it does on `reState()` and when an option or a text it shows changes.
 */
export class MonthView<T> extends Component<HTMLDivElement, Props<T>> {
  /** Its parts are created (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
  private grid: HTMLElement | null = null;
  private lane: HTMLElement | null = null;
  private date: HTMLElement | null = null;
  private readonly watch = new ResizeWatch(() => this.measure());
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
  private readonly columnOf = new WeakMap<Element, SchedulerColumn>();
  /** The day number of each cell. */
  private readonly numberOf = new WeakMap<Element, HTMLElement>();
  private readonly layerOf = new WeakMap<Component<HTMLDivElement>, WeekLayer<T>>();
  /** The cell template the cells were created with: another one makes them again. */
  private cellTemplate: CellTemplate | undefined = undefined;

  constructor(props: Props<T>) {
    super('div', props);
  }

  private get host(): SchedulerHost<T> {
    return this.props.host;
  }

  override onConfigured() {
    this.class.add('mx-scheduler__month-view');
    this.motif.setDisposable(() => this.watch.disconnect());
    this.makeParts();
    this.motif.setDisposable(this.host.model.onChanged(() => this.draw()));
    this.made = true;
    this.draw();
    onReState(this, () => this.draw());
    this.motif.setDisposable(this.host.keepDrawn(() => this.draw()));
  }

  override onMounted() {
    if (this.grid) this.watch.observe(this.grid);
    this.measure();
    this.host.viewShown();
  }

  /** How many lines of appointments fit in a week, under its day numbers. */
  private measure(): void {
    const host = this.host;
    const weeks = host.model.state.weeks.length;
    if (!this.grid || !this.lane || !this.date || !weeks) return;
    const row = this.grid.clientHeight / weeks;
    const lane = this.lane.offsetHeight;
    if (!(row > 0 && lane > 0)) return;
    host.setMonthRoom(Math.max(1, Math.floor((row - this.date.offsetHeight) / lane)));
  }

  /** All of the view, as the model has it now. */
  draw(): void {
    if (this.isDisposed || !this.made) return;
    const host = this.host;
    const model = host.model;
    const st = model.state;
    const parts = this.parts;
    const t = host.text.bind(host);
    flag(parts.head.element, 'data-by-date', model.datesFirst);
    css(parts.head.element, '--_columns', String(model.perRow));
    css(parts.body.element, '--_weeks', String(st.weeks.length));
    css(parts.body.element, '--_columns', String(model.perRow));
    put(parts.grid.element, 'aria-label', t('schedulerMonth'));
    put(parts.layer.element, 'aria-label', t('schedulerAppointments'));
    parts.heads.draw();
    parts.names.show(st.dates);
    const template = untracked(() => host.cellTemplate());
    if (template !== this.cellTemplate) this.makeWeeks(template);
    parts.weeks?.show(st.weeks);
    parts.layers.show(st.weeks);
  }

  private makeParts(): void {
    const host = this.host;
    const head = part<HTMLDivElement>(this, 'div', 'mx-scheduler__month-head');
    const heads = new GroupHeads<T>({ host, ruler: false });
    head.controls.add(heads);
    const names = part<HTMLDivElement>(head, 'div', 'mx-scheduler__weekdays');
    names.element.setAttribute('aria-hidden', 'true');
    const body = part<HTMLDivElement>(this, 'div', 'mx-scheduler__month-body');
    const grid = part<HTMLDivElement>(body, 'div', 'mx-scheduler__month-grid');
    grid.element.setAttribute('role', 'grid');
    grid.element.addEventListener('keydown', (e) => host.gridKey(e));
    this.grid = grid.element;
    const layer = part<HTMLDivElement>(body, 'div', 'mx-scheduler__month-layer');
    layer.element.setAttribute('role', 'group');
    const probe = part(body, 'div', 'mx-scheduler__probe');
    probe.element.setAttribute('aria-hidden', 'true');
    this.lane = part(probe, 'div', 'mx-scheduler__probe-lane').element;
    this.date = part(probe, 'div', 'mx-scheduler__probe-date').element;
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

  /** The weeks' cells, recreated for another cell template; the template draws into each cell, after its number. */
  private makeWeeks(template: CellTemplate): void {
    const parts = this.parts;
    this.cellTemplate = template;
    parts.grid.controls.clear();
    parts.weeks = new KeyedParts<StripRow<T>, Component<HTMLDivElement>>(
      parts.grid,
      (week) => String(week.index),
      (week) => {
        const row = new Component<HTMLDivElement>('div');
        row.element.className = 'mx-scheduler__week-row';
        row.element.setAttribute('role', 'row');
        this.cellsOf.set(
          row,
          new KeyedParts<SchedulerColumn, Component<HTMLDivElement>>(
            row,
            (column) => String(column.index),
            (column) => this.makeCell(column, template),
            (c, column) => this.drawCell(c, column),
          ),
        );
        this.cellsOf.get(row)!.show(week.columns);
        return row;
      },
      (row, week) => this.cellsOf.get(row)?.show(week.columns),
    );
  }

  private makeCell(column: SchedulerColumn, template: CellTemplate): Component<HTMLDivElement> {
    const host = this.host;
    const c = new Component<HTMLDivElement>('div');
    const el = c.element;
    el.className = 'mx-scheduler__cell mx-scheduler__month-cell';
    el.setAttribute('role', 'gridcell');
    const at = () => ({ column: this.columnOf.get(el)?.index ?? column.index, slot: -1 });
    el.addEventListener('pointerdown', (e) => host.cellPointerDown(at(), e));
    el.addEventListener('click', (e) => host.cellClick(at(), e));
    el.addEventListener('dblclick', (e) => host.cellDblClick(at(), e));
    const number = part(c, 'span', 'mx-scheduler__day-number');
    number.element.setAttribute('aria-hidden', 'true');
    this.numberOf.set(el, number.element);
    this.columnOf.set(el, column);
    if (template) part(c, 'div', 'mx-scheduler__cell-content').controls.add(template(this.cellContext(el, column)));
    this.drawCell(c, column);
    return c;
  }

  private drawCell(c: Component<HTMLDivElement>, column: SchedulerColumn): void {
    const host = this.host;
    const model = host.model;
    const el = c.element;
    this.columnOf.set(el, column);
    put(el, 'data-cell', `${column.index}:-1`);
    flag(el, 'data-today', column.day.today);
    flag(el, 'data-past', column.day.past);
    flag(el, 'data-outside', column.day.outside);
    flag(el, 'data-holiday', column.day.holiday);
    flag(el, 'data-weekend', column.day.weekend);
    put(el, 'data-edge', column.edge || null);
    flag(el, 'data-blocked', column.blocked);
    el.tabIndex = model.state.focus.column === column.index ? 0 : -1;
    put(el, 'aria-selected', String(model.isSelected(column.index, -1)));
    const words = cellWords(host, column, -1);
    put(el, 'aria-label', `${words.group}${host.format.fullDate(column.day.date)}${words.block}`);
    const number = this.numberOf.get(el);
    if (number) text(number, host.format.dayNumber(column.day.date));
  }

  private makeName(cell: HeaderCell): Component<HTMLDivElement> {
    const c = new Component<HTMLDivElement>('div');
    c.element.className = 'mx-scheduler__weekday-name';
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
    else drawn.text = part(c, 'span', '').element;
  }

  private drawName(c: Component<HTMLDivElement>, cell: HeaderCell): void {
    const drawn = this.nameDrawn.get(c)!;
    drawn.cell = cell;
    if (drawn.template !== this.host.dateTemplate()) this.fillName(c);
    put(c.element, 'data-edge', cell.edge || null);
    css(c.element, 'grid-column', `${cell.first + 1} / span ${cell.span}`);
    if (drawn.text) text(drawn.text, cell.day ? this.host.format.weekday(cell.day.date) : '');
  }

  private makeLayer(week: StripRow<T>): Component<HTMLDivElement> {
    const host = this.host;
    const c = new Component<HTMLDivElement>('div');
    c.element.className = 'mx-scheduler__week-layer';
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
    button.element.type = 'button';
    button.element.className = 'mx-scheduler__more';
    button.element.addEventListener('click', (e) => {
      const at = this.columnOf.get(button.element);
      if (at) this.host.openMore(at.day.date, at.group?.index ?? -1, e.currentTarget as HTMLElement);
    });
    this.drawMore(c, button, column);
    return button;
  }

  private drawMore(c: Component<HTMLDivElement>, button: Component<HTMLButtonElement>, column: SchedulerColumn): void {
    const layer = this.layerOf.get(c);
    const week = layer?.week;
    if (!week) return;
    const host = this.host;
    const el = button.element;
    this.columnOf.set(el, column);
    const inWeek = column.index % host.model.perRow;
    const count = week.more[inWeek] ?? 0;
    shown(el, count > 0);
    css(el, 'grid-column', String(inWeek + 1));
    css(el, 'grid-row', String((week.moreAt[inWeek] ?? 0) + 1));
    put(el, 'aria-label', host.text('schedulerMoreLabel', { count, date: `${cellWords(host, column, -1).group}${host.format.fullDate(column.day.date)}` }));
    text(el, host.text('schedulerMore', { count }));
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
  private cellContext(el: HTMLElement, first: SchedulerColumn): CellTemplateContext {
    const model = this.host.model;
    const column = () => this.columnOf.get(el) ?? first;
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
