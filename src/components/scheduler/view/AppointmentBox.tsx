import type { StripPiece } from '../model/strip-piece';
import type { TimedPiece } from '../model/timed-piece';
import type { DragMode } from './AppointmentDrag';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
  piece: TimedPiece<T> | StripPiece<T>;
}

const isTimed = <T,>(piece: TimedPiece<T> | StripPiece<T>): piece is TimedPiece<T> => 'top' in piece;

/**
 * One appointment, or the part of it on one day or one week: placed by its piece's fields (bound,
 * so a change in the layout moves it without building it again), coloured by the appointment's
 * own colour (else its resources'), its content the template's or its text and time. An
 * occurrence of a series carries the series mark, one changed apart the exception mark, and a box
 * that may not go where it is being moved the drop mark, where the design language draws them.
 */
export function AppointmentBox<T>(props: Props<T>) {
  const { host, piece } = props;
  const text = () => piece.text || host.text('schedulerNoTitle');
  const allDay = () => !isTimed(piece) && !piece.timed;
  const time = () => {
    if (allDay()) return '';
    if (!isTimed(piece)) return host.format.time(piece.start);
    return host.format.timeRange(piece.start, piece.end);
  };
  /** Read after the text: the day (and the whole time of a part), which the box itself does not write. */
  const details = () => {
    const when = allDay()
      ? host.format.range('day', piece.start, piece.end)
      : `${host.format.fullDate(piece.start)} ${host.format.timeRange(piece.start, piece.end)}`;
    const more = piece.before || piece.after ? `, ${host.text('schedulerContinues')}` : '';
    const repeats = piece.series
      ? `, ${host.text('schedulerRepeats', { rule: host.recurrenceText(piece.item) })}`
      : piece.exception
        ? `, ${host.text('schedulerChanged')}`
        : '';
    return `, ${when}${more}${repeats}`;
  };
  const style = () => {
    const own = { '--_color': piece.color };
    if (isTimed(piece)) {
      return {
        ...own,
        '--_column': String(piece.column),
        '--_left': String(piece.left),
        '--_width': String(piece.width),
        insetBlockStart: `${piece.top * 100}%`,
        blockSize: `${piece.height * 100}%`,
      };
    }
    return {
      ...own,
      gridColumn: `${piece.first + 1} / span ${piece.span}`,
      gridRow: String(piece.lane + 1),
    };
  };
  const context = () => ({
    appointment: piece.item,
    start: piece.start,
    end: piece.end,
    text: text(),
    time: time(),
    allDay: allDay(),
    view: host.model.view.type,
    group: groupValues(),
  });
  const groupValues = () => {
    const group = host.model.state.groups[piece.group];
    return group ? { ...group.values } : null;
  };
  const resizable = () => !piece.draft && host.canResize(piece.item) && (isTimed(piece) || !piece.timed);
  const press = (mode: DragMode) => (e: PointerEvent) => {
    // A press on an appointment selects no cells.
    e.stopPropagation();
    if (mode !== 'move' || host.canDrag(piece.item)) host.appointmentPointerDown(piece, mode, e);
  };
  return (
    <div
      class="mx-scheduler__appointment"
      role="button"
      tabindex="0"
      data-kind={isTimed(piece) ? 'timed' : piece.timed ? 'chip' : 'bar'}
      data-piece={piece.id}
      data-before={() => piece.before || null}
      data-after={() => piece.after || null}
      data-short={() => (isTimed(piece) && piece.end.getTime() - piece.start.getTime() <= 30 * 60_000) || null}
      data-past={() => (host.dimPast() && piece.end.getTime() <= host.model.state.now) || null}
      data-disabled={() => piece.disabled || null}
      data-draft={() => piece.draft || null}
      data-invalid={() => piece.invalid || null}
      data-copy={() => (piece.draft && piece.id.includes('~copy')) || null}
      data-saving={() => host.isSaving(piece.item) || null}
      data-open={() => host.isOpen(piece.item) || null}
      data-draggable={() => host.canDrag(piece.item) || null}
      data-series={() => piece.series || null}
      data-exception={() => piece.exception || null}
      aria-disabled={() => (piece.disabled ? 'true' : null)}
      style={style}
      x-display={() => isTimed(piece) || !piece.hidden}
      onpointerdown={press('move')}
      onclick={(e: MouseEvent) => host.appointmentClick(piece, e)}
      ondblclick={(e: MouseEvent) => host.appointmentDblClick(piece, e)}
      onkeydown={(e: KeyboardEvent) => host.appointmentKey(piece, e)}
      onfocusout={() => host.appointmentBlur()}
    >
      <div class="mx-scheduler__resize" data-edge="start" aria-hidden="true" x-display={() => resizable() && !piece.before} onpointerdown={press('start')} />
      {host.template() ? (
        <div class="mx-scheduler__appointment-content">
          {host.template()!(context())}
          <span class="mx-sr-only">{details}</span>
        </div>
      ) : (
        <div class="mx-scheduler__appointment-content">
          <span class="mx-scheduler__appointment-time" x-display={() => time() !== ''}>
            {time}
          </span>
          <span class="mx-scheduler__appointment-text">{text}</span>
          <span class="mx-sr-only">{details}</span>
        </div>
      )}
      <span class="mx-glyph mx-scheduler__drop-mark" aria-hidden="true" x-display={() => piece.invalid} />
      <span
        class="mx-glyph mx-scheduler__mark"
        aria-hidden="true"
        data-mark={() => (piece.exception ? 'exception' : 'series')}
        x-display={() => host.recurrenceMarks() && (piece.series || piece.exception)}
      />
      <div class="mx-scheduler__resize" data-edge="end" aria-hidden="true" x-display={() => resizable() && !piece.after} onpointerdown={press('end')} />
    </div>
  );
}
