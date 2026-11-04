import { Component } from '@motifx/core';
import { onReState } from '../../../core/on-re-state';
import type { AgendaDay } from '../model/agenda-day';
import type { AgendaPiece } from '../model/agenda-piece';
import { css, flag, part, put, shown, text } from '../../../core/draw-parts';
import { KeyedParts } from './KeyedParts';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
  /** The row with the keyboard's focus (the selected one), by its piece's id. */
  focus: { id: string; drawn: () => void };
}

/** A day of the list as last drawn: its parts and its rows. */
interface DayDrawn<T> {
  day: AgendaDay<T>;
  resource: HTMLElement;
  head: HTMLElement;
  number: HTMLElement;
  weekday: HTMLElement;
  month: HTMLElement;
  rows: KeyedParts<AgendaPiece<T>, Component<HTMLDivElement>>;
}

/** A row as last drawn: its piece and day, and the template (and the piece's version) its content was filled with. */
interface RowDrawn<T> {
  piece: AgendaPiece<T>;
  day: AgendaDay<T>;
  content: Component<HTMLDivElement>;
  template: unknown;
  version: number;
  time: HTMLElement | null;
  text: HTMLElement | null;
  details: HTMLElement | null;
  mark: HTMLElement | null;
}

/**
 * The agenda: the coming days (in each group, with groups) with their appointments in time order, a day with none
 * left out. It is a list: the arrows move over its rows (the focused one is the selected one), Space shows the tooltip,
 * Enter opens the form, as a click and a double click do.
 *
 * It follows nothing: whatever the model tells, and when the focus moves, it draws itself again (each part only what
 * it shows), as it does on `reState()` and when an option or a text it shows changes.
 */
export class AgendaView<T> extends Component<HTMLDivElement, Props<T>> {
  /** Its parts are made (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
  private list!: Component<HTMLDivElement>;
  private empty!: Component<HTMLDivElement>;
  private days!: KeyedParts<AgendaDay<T>, Component<HTMLDivElement>>;
  private readonly dayDrawn = new WeakMap<Component<HTMLDivElement>, DayDrawn<T>>();
  private readonly rowDrawn = new WeakMap<Component<HTMLDivElement>, RowDrawn<T>>();

  constructor(props: Props<T>) {
    super('div', props);
  }

  private get host(): SchedulerHost<T> {
    return this.props.host;
  }

  override onConfigured() {
    const host = this.host;
    this.class.add('mx-scheduler__agenda-view');
    const scroll = part<HTMLDivElement>(this, 'div', 'mx-scheduler__scroll mx-scheduler__agenda');
    host.setScroller(scroll.element);
    this.list = part<HTMLDivElement>(scroll, 'div', 'mx-scheduler__agenda-list');
    this.list.element.setAttribute('role', 'listbox');
    this.list.element.addEventListener('keydown', (e) => host.agendaKey(e));
    this.empty = part<HTMLDivElement>(scroll, 'div', 'mx-scheduler__agenda-empty');
    this.days = new KeyedParts<AgendaDay<T>, Component<HTMLDivElement>>(
      this.list,
      (day) => day.key,
      (day) => this.makeDay(day),
      (c, day) => this.drawDay(c, day),
    );
    this.props.focus.drawn = () => this.draw();
    this.motif.setDisposable(host.model.onChanged(() => this.draw()));
    this.made = true;
    this.draw();
    onReState(this, () => this.draw());
    this.motif.setDisposable(host.keepDrawn(() => this.draw()));
  }

  override onConfig() {
    this.host.viewShown();
  }

  override onDisposing() {
    this.host.setScroller(null);
  }

  /** All of the list, as the model has it now. */
  draw(): void {
    if (this.isDisposed || !this.made) return;
    const host = this.host;
    const agenda = host.model.state.agenda;
    put(this.list.element, 'aria-label', host.text('schedulerAgenda'));
    shown(this.list.element, agenda.length > 0);
    shown(this.empty.element, agenda.length === 0);
    text(this.empty.element, host.text('schedulerNoAppointments'));
    this.days.show(agenda);
  }

  /** The row the keys are on (selected once one is chosen); before that the first takes the focus. */
  private focused(piece: AgendaPiece<T>): boolean {
    const focus = this.props.focus;
    return focus.id === piece.id || (!focus.id && this.host.model.state.agenda[0]?.items[0] === piece);
  }

  private choose(id: string): void {
    const focus = this.props.focus;
    if (focus.id === id) return;
    focus.id = id;
    this.draw();
  }

  private makeDay(day: AgendaDay<T>): Component<HTMLDivElement> {
    const c = new Component<HTMLDivElement>('div');
    c.element.className = 'mx-scheduler__agenda-group';
    c.element.setAttribute('role', 'group');
    const resource = part(c, 'div', 'mx-scheduler__agenda-resource');
    resource.element.setAttribute('aria-hidden', 'true');
    const head = part(c, 'div', 'mx-scheduler__agenda-day');
    head.element.setAttribute('aria-hidden', 'true');
    const number = part(head, 'span', 'mx-scheduler__day-number');
    const date = part(head, 'span', 'mx-scheduler__agenda-date');
    const weekday = part(date, 'span', 'mx-scheduler__agenda-weekday');
    const month = part(date, 'span', 'mx-scheduler__agenda-month');
    this.dayDrawn.set(c, {
      day,
      resource: resource.element,
      head: head.element,
      number: number.element,
      weekday: weekday.element,
      month: month.element,
      rows: new KeyedParts<AgendaPiece<T>, Component<HTMLDivElement>>(
        c,
        (piece) => piece.id,
        (piece) => this.makeRow(piece, this.dayDrawn.get(c)!.day),
        (row, piece) => this.drawRow(row, piece, this.dayDrawn.get(c)!.day),
        () => 2,
      ),
    });
    this.drawDay(c, day);
    return c;
  }

  private drawDay(c: Component<HTMLDivElement>, day: AgendaDay<T>): void {
    const drawn = this.dayDrawn.get(c)!;
    drawn.day = day;
    const format = this.host.format;
    put(c.element, 'aria-label', `${day.label ? `${day.label}, ` : ''}${format.fullDate(day.day.date)}`);
    flag(c.element, 'data-today', day.day.today);
    shown(drawn.resource, day.first && !!day.group);
    text(drawn.resource, day.label);
    flag(drawn.head, 'data-today', day.day.today);
    text(drawn.number, format.dayNumber(day.day.date));
    text(drawn.weekday, format.weekdayLong(day.day.date));
    text(drawn.month, format.monthYear(day.day.date));
    drawn.rows.show(day.items);
  }

  private makeRow(piece: AgendaPiece<T>, day: AgendaDay<T>): Component<HTMLDivElement> {
    const host = this.host;
    const c = new Component<HTMLDivElement>('div');
    const el = c.element;
    el.className = 'mx-scheduler__agenda-row';
    el.setAttribute('role', 'option');
    const now = () => this.rowDrawn.get(c)!.piece;
    el.addEventListener('focus', () => this.choose(now().id));
    el.addEventListener('click', (e) => {
      this.choose(now().id);
      host.appointmentClick(now(), e);
    });
    el.addEventListener('dblclick', (e) => host.appointmentDblClick(now(), e));
    const content = part<HTMLDivElement>(c, 'div', 'mx-scheduler__agenda-content');
    this.rowDrawn.set(c, { piece, day, content, template: undefined, version: -1, time: null, text: null, details: null, mark: null });
    this.fillRow(c);
    this.drawRow(c, piece, day);
    return c;
  }

  /** A row's content: the template's, else the time, the dot, the text and the mark; what is read after them. */
  private fillRow(c: Component<HTMLDivElement>): void {
    const drawn = this.rowDrawn.get(c)!;
    const content = drawn.content;
    content.controls.clear();
    const template = this.host.agendaTemplate();
    drawn.template = template;
    drawn.version = drawn.piece.version;
    drawn.time = drawn.text = drawn.mark = null;
    if (template) {
      content.controls.add(template(this.rowContext(c)));
      drawn.details = part(content, 'span', 'mx-sr-only').element;
      return;
    }
    drawn.time = part(content, 'span', 'mx-scheduler__agenda-time').element;
    part(content, 'span', 'mx-scheduler__agenda-dot').element.setAttribute('aria-hidden', 'true');
    drawn.text = part(content, 'span', 'mx-scheduler__agenda-text').element;
    drawn.details = part(content, 'span', 'mx-sr-only').element;
    const mark = part(content, 'span', 'mx-glyph mx-scheduler__mark');
    mark.element.setAttribute('aria-hidden', 'true');
    drawn.mark = mark.element;
  }

  private drawRow(c: Component<HTMLDivElement>, piece: AgendaPiece<T>, day: AgendaDay<T>): void {
    const host = this.host;
    const model = host.model;
    const drawn = this.rowDrawn.get(c)!;
    drawn.piece = piece;
    drawn.day = day;
    const template = host.agendaTemplate();
    if (template !== drawn.template || (template && piece.version !== drawn.version)) this.fillRow(c);
    const el = c.element;
    put(el, 'data-piece', piece.id);
    flag(el, 'data-past', host.dimPast() && piece.end.getTime() <= model.state.now);
    flag(el, 'data-disabled', piece.disabled);
    flag(el, 'data-open', host.isOpen(model.itemOf(piece)));
    flag(el, 'data-series', piece.series);
    flag(el, 'data-exception', piece.exception);
    put(el, 'aria-selected', String(this.props.focus.id === piece.id));
    flag(el, 'aria-disabled', piece.disabled);
    el.tabIndex = this.focused(piece) ? 0 : -1;
    css(el, '--_color', piece.color ?? '');
    if (drawn.time) text(drawn.time, this.time(piece));
    if (drawn.text) text(drawn.text, this.text(piece));
    if (drawn.details) text(drawn.details, this.details(piece));
    if (drawn.mark) {
      put(drawn.mark, 'data-mark', piece.exception ? 'exception' : 'series');
      shown(drawn.mark, !!(host.recurrenceMarks() && (piece.series || piece.exception)));
    }
  }

  // A part of one that goes on over days runs to (or from) the day's end: written as two times, not two dates.
  private time(piece: AgendaPiece<T>): string {
    const { format } = this.host;
    if (piece.whole) return this.host.text('schedulerAllDay');
    return piece.before || piece.after ? `${format.time(piece.start)} – ${format.time(piece.end)}` : format.timeRange(piece.start, piece.end);
  }

  private text(piece: AgendaPiece<T>): string {
    return piece.text || this.host.text('schedulerNoTitle');
  }

  /** Read after what the row writes: whether it goes on, how it repeats. */
  private details(piece: AgendaPiece<T>): string {
    const host = this.host;
    const more = piece.before || piece.after ? `, ${host.text('schedulerContinues')}` : '';
    const repeats = piece.series
      ? `, ${host.text('schedulerRepeats', { rule: host.recurrenceText(host.model.itemOf(piece)) })}`
      : piece.exception
        ? `, ${host.text('schedulerChanged')}`
        : '';
    return more || repeats ? `${more}${repeats}` : '';
  }

  /** What an agenda template is given: each read reads the row as it is now. */
  private rowContext(c: Component<HTMLDivElement>) {
    const drawn = this.rowDrawn.get(c)!;
    const view = this;
    const model = this.host.model;
    return {
      get appointment() {
        return model.itemOf(drawn.piece);
      },
      get start() {
        return drawn.piece.start;
      },
      get end() {
        return drawn.piece.end;
      },
      get text() {
        return view.text(drawn.piece);
      },
      get time() {
        return view.time(drawn.piece);
      },
      get allDay() {
        return drawn.piece.whole;
      },
      get date() {
        return drawn.day.day.date;
      },
      get group() {
        return drawn.day.group ? { ...drawn.day.group.values } : null;
      },
    };
  }
}
