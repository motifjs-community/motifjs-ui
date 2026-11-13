import { Component } from '@motifx/core';
import { onReState } from '../../../core/on-re-state';
import type { AppointmentTemplateContext } from '../appointment-template-context';
import type { LinePiece } from '../model/line-piece';
import type { StripPiece } from '../model/strip-piece';
import type { TimedPiece } from '../model/timed-piece';
import type { DragMode } from './AppointmentDrag';
import { part } from '../../../core/draw-parts';
import { css, flag, kept, put, text } from '../../../core/part-writes';
import type { SchedulerHost } from './scheduler-host';

type Piece<T> = TimedPiece<T> | StripPiece<T> | LinePiece<T>;

interface Props<T> {
  host: SchedulerHost<T>;
  piece: Piece<T>;
}

const isTimed = <T>(piece: Piece<T>): piece is TimedPiece<T> => 'top' in piece;
const isLine = <T>(piece: Piece<T>): piece is LinePiece<T> => 'from' in piece;

/**
 * One appointment, or the part of it on one day, one week or one row of a timeline: placed by its piece's fields,
 * colored by the appointment's own color (else its resources'), its content the template's or its text and time.
 * An occurrence of a series carries the series mark, one changed apart the exception mark, and a box that may not
 * go where it is being moved the drop mark, where the design language draws them.
 *
 * It follows nothing: it draws itself when it is created, when its view hands it a piece again (`show`), on
 * `reState()` and when an option or a text it shows changes.
 */
export class AppointmentBox<T> extends Component<HTMLDivElement, Props<T>> {
  /** Its parts are created (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
  private piece: Piece<T>;
  private content: Component<HTMLElement> | null = null;
  /** The template the content was filled with: another one (another view, another prop) fills it again. */
  private template: unknown = undefined;
  /** The piece's version a template drew: when its appointment is read again (a refresh, an edit) the template draws again. */
  private filledVersion = -1;
  /** The style properties the box's place was last written with. */
  private placed: string[] = [];
  /** The appointment the box drew last. */
  private drawnItem: T | null = null;
  /** Being taken away (from `onDisposing`, before it leaves the page). */
  private leaving = false;
  private readonly parts: Record<'start' | 'startGrip' | 'end' | 'endGrip' | 'time' | 'text' | 'details' | 'drop' | 'mark', Component<HTMLElement> | null> = {
    start: null,
    startGrip: null,
    end: null,
    endGrip: null,
    time: null,
    text: null,
    details: null,
    drop: null,
    mark: null,
  };

  constructor(props: Props<T>) {
    super('div', props);
    this.piece = props.piece;
  }

  private get host(): SchedulerHost<T> {
    return this.props.host;
  }

  /** The piece again, after the layout: the same appointment's box is drawn where it is now. */
  show(piece: Piece<T>): void {
    this.piece = piece;
    this.draw();
  }

  override onDisposing(): void {
    this.leaving = true;
  }

  override onConfigured(): void {
    this.class.add('mx-scheduler__appointment');
    this.attr.add({ role: 'button' });
    put(this, 'tabindex', '0');
    const host = this.host;
    const move = this.press('move');
    this.motif.on('pointerdown', (_, e) => move(e));
    this.motif.on('click', (_, e) => host.appointmentClick(this.piece, e));
    this.motif.on('dblclick', (_, e) => host.appointmentDblClick(this.piece, e));
    this.motif.on('keydown', (_, e) => host.appointmentKey(this.piece, e));
    // A box taken away while focused loses the focus too: that is not the user leaving it (a move by the keys goes on in
    // the box of its new place).
    this.motif.on('focusout', (_, e) => !this.leaving && this.drawnItem !== null && host.appointmentBlur(this.drawnItem, e));
    const parts = this.parts;
    const start = part(this, 'div', 'mx-scheduler__resize');
    start.attr.add({ 'data-edge': 'start', 'aria-hidden': 'true' });
    const fromStart = this.press('start');
    start.motif.on('pointerdown', (_, e) => fromStart(e));
    parts.start = start;
    parts.startGrip = part(start, 'span', 'mx-scheduler__resize-grip');
    this.content = part(this, 'div', 'mx-scheduler__appointment-content');
    this.fill();
    const drop = part(this, 'span', 'mx-glyph mx-scheduler__drop-mark');
    drop.attr.add({ 'aria-hidden': 'true' });
    parts.drop = drop;
    const mark = part(this, 'span', 'mx-glyph mx-scheduler__mark');
    mark.attr.add({ 'aria-hidden': 'true' });
    parts.mark = mark;
    const end = part(this, 'div', 'mx-scheduler__resize');
    end.attr.add({ 'data-edge': 'end', 'aria-hidden': 'true' });
    const fromEnd = this.press('end');
    end.motif.on('pointerdown', (_, e) => fromEnd(e));
    parts.end = end;
    parts.endGrip = part(end, 'span', 'mx-scheduler__resize-grip');
    this.made = true;
    this.draw();
    onReState(this, () => this.draw());
    this.motif.setDisposable(host.keepDrawn(() => this.draw()));
  }

  /** The content: the template's, else the time and the text, and what is read after them. */
  private fill(): void {
    const content = this.content;
    if (!content) return;
    const parts = this.parts;
    content.controls.clear();
    parts.time = parts.text = null;
    const template = this.host.template();
    this.template = template;
    this.filledVersion = this.piece.version;
    if (template) {
      content.controls.add(template(this.templateContext()));
    } else {
      parts.time = part(content, 'span', 'mx-scheduler__appointment-time');
      parts.text = part(content, 'span', 'mx-scheduler__appointment-text');
    }
    parts.details = part(content, 'span', 'mx-sr-only');
  }

  /** Everything the box shows of its piece, drawn by hand. */
  draw(): void {
    if (this.isDisposed || !this.made) return;
    if (this.host.template() !== this.template || (this.template && this.piece.version !== this.filledVersion)) this.fill();
    const { host, piece, parts } = this;
    const target = this.item();
    this.drawnItem = target;
    const draft = !!piece.draft;
    put(this, 'data-kind', isTimed(piece) ? 'timed' : isLine(piece) ? 'line' : piece.timed ? 'chip' : 'bar');
    put(this, 'data-piece', piece.id);
    flag(this, 'data-before', piece.before);
    flag(this, 'data-after', piece.after);
    flag(this, 'data-short', isTimed(piece) && piece.end.getTime() - piece.start.getTime() <= 30 * 60_000);
    flag(this, 'data-past', host.dimPast() && piece.end.getTime() <= host.model.state.now);
    flag(this, 'data-disabled', piece.disabled);
    flag(this, 'data-draft', draft);
    flag(this, 'data-lifted', draft && host.liftedByTouch());
    flag(this, 'data-selected', !draft && host.touchSelected(target));
    flag(this, 'data-invalid', piece.invalid);
    flag(this, 'data-copy', draft && piece.id.includes('~copy'));
    flag(this, 'data-saving', host.isSaving(target));
    flag(this, 'data-open', host.isOpen(target));
    flag(this, 'data-draggable', host.canDrag(target));
    flag(this, 'data-series', piece.series);
    flag(this, 'data-exception', piece.exception);
    flag(this, 'aria-disabled', piece.disabled);
    const place = this.place();
    for (const name of this.placed) if (!(name in place)) css(this, name, '');
    for (const [name, value] of Object.entries(place)) css(this, name, value);
    this.placed = Object.keys(place);
    kept(this, isTimed(piece) || !piece.hidden);
    const canResize = this.resizable();
    const lifted = host.touchSelected(target);
    kept(parts.start, canResize && !piece.before);
    kept(parts.end, canResize && !piece.after);
    kept(parts.startGrip, lifted);
    kept(parts.endGrip, lifted);
    kept(parts.drop, !!piece.invalid);
    kept(parts.mark, !!(host.recurrenceMarks() && (piece.series || piece.exception)));
    if (parts.mark) put(parts.mark, 'data-mark', piece.exception ? 'exception' : 'series');
    const when = this.time();
    if (parts.time) {
      kept(parts.time, when !== '');
      text(parts.time, when);
    }
    if (parts.text) text(parts.text, piece.text || host.text('schedulerNoTitle'));
    if (parts.details) text(parts.details, this.details());
  }

  /** Its appointment: read again when the piece's version moves on (a refresh, an edit). */
  private item(): T {
    return this.host.model.itemOf(this.piece);
  }

  private allDay(): boolean {
    const piece = this.piece;
    return isLine(piece) ? piece.allDay : !isTimed(piece) && !piece.timed;
  }

  private time(): string {
    const { host, piece } = this;
    if (this.allDay()) return '';
    if (!isTimed(piece) && !isLine(piece)) return host.format.time(piece.start);
    // Along a timeline the box shows its days: two times, not two dates.
    if (isLine(piece) && !host.model.zone.sameDay(piece.start, new Date(Math.max(piece.start.getTime(), piece.end.getTime() - 1))))
      return `${host.format.time(piece.start)} – ${host.format.time(piece.end)}`;
    return host.format.timeRange(piece.start, piece.end);
  }

  /** Read after the text: the day (and the whole time of a part), which the box itself does not write. */
  private details(): string {
    const { host, piece } = this;
    const when = this.allDay()
      ? host.format.range('day', piece.start, piece.end)
      : `${host.format.fullDate(piece.start)} ${host.format.timeRange(piece.start, piece.end)}`;
    const more = piece.before || piece.after ? `, ${host.text('schedulerContinues')}` : '';
    const repeats = piece.series
      ? `, ${host.text('schedulerRepeats', { rule: host.recurrenceText(this.item()) })}`
      : piece.exception
        ? `, ${host.text('schedulerChanged')}`
        : '';
    return `, ${when}${more}${repeats}`;
  }

  private place(): Record<string, string> {
    const piece = this.piece;
    const own = { '--_color': piece.color ?? '' };
    if (isTimed(piece)) {
      return {
        ...own,
        '--_column': String(piece.column),
        '--_left': String(piece.left),
        '--_width': String(piece.width),
        'inset-block-start': `${piece.top * 100}%`,
        'block-size': `${piece.height * 100}%`,
      };
    }
    if (isLine(piece)) return { ...own, '--_from': String(piece.from), '--_span': String(piece.span), '--_lane': String(piece.lane) };
    return { ...own, 'grid-column': `${piece.first + 1} / span ${piece.span}`, 'grid-row': String(piece.lane + 1) };
  }

  private resizable(): boolean {
    const piece = this.piece;
    return !piece.draft && this.host.canResize(this.item()) && (isTimed(piece) || isLine(piece) || !piece.timed);
  }

  private press(mode: DragMode) {
    return (e: PointerEvent) => {
      // A click on an appointment selects no cells.
      e.stopPropagation();
      if (mode !== 'move' || this.host.canDrag(this.item())) this.host.appointmentPointerDown(this.piece, mode, e);
    };
  }

  /** What a template is given: each read reads the piece as it is now. */
  private templateContext(): AppointmentTemplateContext<T> {
    const box = this;
    return {
      get appointment() {
        return box.item();
      },
      get start() {
        return box.piece.start;
      },
      get end() {
        return box.piece.end;
      },
      get text() {
        return box.piece.text || box.host.text('schedulerNoTitle');
      },
      get time() {
        return box.time();
      },
      get allDay() {
        return box.allDay();
      },
      get view() {
        return box.host.model.view.type;
      },
      get group() {
        const group = box.host.model.state.groups[box.piece.group];
        return group ? { ...group.values } : null;
      },
    };
  }
}
