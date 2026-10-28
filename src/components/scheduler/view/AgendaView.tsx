import { Component } from '@motifx/core';
import type { AgendaDay } from '../model/agenda-day';
import type { AgendaPiece } from '../model/agenda-piece';
import type { SchedulerHost } from './scheduler-host';

interface Props<T> {
  host: SchedulerHost<T>;
  /** The row with the keyboard's focus (the selected one), by its piece's id. */
  focus: { id: string };
}

/**
 * The agenda: the coming days (in each group, with groups) with their appointments in time order,
 * a day with none left out. It is a list: the arrows move over its rows (the focused one is the
 * selected one), Space shows the tooltip, Enter opens the form, as a click and a double click do.
 */
export class AgendaView<T> extends Component<HTMLDivElement, Props<T>> {
  override onConfigured() {
    this.class.add('mx-scheduler__agenda-view');
  }

  override onMounted() {
    this.props.host.viewShown();
  }

  override onDisposing() {
    this.props.host.setScroller(null);
  }

  override view() {
    const { host, focus } = this.props;
    const model = host.model;
    const st = model.state;
    const format = host.format;
    const t = host.text.bind(host);
    const groupLabel = (day: AgendaDay<T>) => `${day.label ? `${day.label}, ` : ''}${format.fullDate(day.day.date)}`;
    // A part of one that goes on over days runs to (or from) the day's end: written as two times, not two dates.
    const time = (piece: AgendaPiece<T>) =>
      piece.whole ? t('schedulerAllDay') : piece.before || piece.after ? `${format.time(piece.start)} – ${format.time(piece.end)}` : format.timeRange(piece.start, piece.end);
    const text = (piece: AgendaPiece<T>) => piece.text || t('schedulerNoTitle');
    /** Read after what the row writes: whether it goes on, how it repeats. */
    const details = (piece: AgendaPiece<T>) => {
      const more = piece.before || piece.after ? `, ${t('schedulerContinues')}` : '';
      const repeats = piece.series ? `, ${t('schedulerRepeats', { rule: host.recurrenceText(piece.item) })}` : piece.exception ? `, ${t('schedulerChanged')}` : '';
      return more || repeats ? `${more}${repeats}` : '';
    };
    /** The row the keys are on (selected once one is chosen); before that the first takes the focus. */
    const focused = (piece: AgendaPiece<T>) => focus.id === piece.id || (!focus.id && st.agenda[0]?.items[0] === piece);
    const selected = (piece: AgendaPiece<T>) => focus.id === piece.id;
    const context = (piece: AgendaPiece<T>, day: AgendaDay<T>) => ({
      appointment: piece.item,
      get start() {
        return piece.start;
      },
      get end() {
        return piece.end;
      },
      get text() {
        return text(piece);
      },
      get time() {
        return time(piece);
      },
      get allDay() {
        return piece.whole;
      },
      get date() {
        return day.day.date;
      },
      get group() {
        return day.group ? { ...day.group.values } : null;
      },
    });
    const row = (piece: AgendaPiece<T>, day: AgendaDay<T>) => (
      <div
        key={piece.id}
        class="mx-scheduler__agenda-row"
        role="option"
        data-piece={piece.id}
        data-past={() => (host.dimPast() && piece.end.getTime() <= st.now) || null}
        data-disabled={() => piece.disabled || null}
        data-open={() => host.isOpen(piece.item) || null}
        data-series={() => piece.series || null}
        data-exception={() => piece.exception || null}
        aria-selected={() => selected(piece)}
        aria-disabled={() => (piece.disabled ? 'true' : null)}
        tabindex={() => (focused(piece) ? 0 : -1)}
        style={() => ({ '--_color': piece.color })}
        onfocus={() => (focus.id = piece.id)}
        onclick={(e: MouseEvent) => {
          focus.id = piece.id;
          host.appointmentClick(piece, e);
        }}
        ondblclick={(e: MouseEvent) => host.appointmentDblClick(piece, e)}
      >
        {host.agendaTemplate() ? (
          <div class="mx-scheduler__agenda-content">
            {host.agendaTemplate()!(context(piece, day))}
            <span class="mx-sr-only">{() => details(piece)}</span>
          </div>
        ) : (
          <div class="mx-scheduler__agenda-content">
            <span class="mx-scheduler__agenda-time">{() => time(piece)}</span>
            <span class="mx-scheduler__agenda-dot" aria-hidden="true" />
            <span class="mx-scheduler__agenda-text">{() => text(piece)}</span>
            <span class="mx-sr-only">{() => details(piece)}</span>
            <span
              class="mx-glyph mx-scheduler__mark"
              aria-hidden="true"
              data-mark={() => (piece.exception ? 'exception' : 'series')}
              x-display={() => host.recurrenceMarks() && (piece.series || piece.exception)}
            />
          </div>
        )}
      </div>
    );
    return (
      <div class="mx-scheduler__scroll mx-scheduler__agenda" ref={(c) => host.setScroller(c.element as HTMLElement)}>
        <div
          class="mx-scheduler__agenda-list"
          role="listbox"
          aria-label={() => t('schedulerAgenda')}
          x-display={() => st.agenda.length > 0}
          onkeydown={(e: KeyboardEvent) => host.agendaKey(e)}
        >
          {st.agenda.map((day) => (
            <div key={day.key} class="mx-scheduler__agenda-group" role="group" aria-label={() => groupLabel(day)} data-today={() => day.day.today || null}>
              <div class="mx-scheduler__agenda-resource" aria-hidden="true" x-display={() => day.first && !!day.group}>
                {() => day.label}
              </div>
              <div class="mx-scheduler__agenda-day" aria-hidden="true" data-today={() => day.day.today || null}>
                <span class="mx-scheduler__day-number">{() => format.dayNumber(day.day.date)}</span>
                <span class="mx-scheduler__agenda-date">
                  <span class="mx-scheduler__agenda-weekday">{() => format.weekdayLong(day.day.date)}</span>
                  <span class="mx-scheduler__agenda-month">{() => format.monthYear(day.day.date)}</span>
                </span>
              </div>
              {day.items.map((piece) => row(piece, day))}
            </div>
          ))}
        </div>
        <div class="mx-scheduler__agenda-empty" x-display={() => st.agenda.length === 0}>
          {() => t('schedulerNoAppointments')}
        </div>
      </div>
    );
  }
}
