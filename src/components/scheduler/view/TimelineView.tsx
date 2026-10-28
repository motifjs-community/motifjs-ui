import { Component, reactive, untracked, Virtualization } from '@motifx/core';
import { onLookChanged } from '../../../core/look-watch';
import { ResizeWatch } from '../../../core/resize-watch';
import type { TimelineRow } from '../model/timeline-row';
import type { SchedulerHost } from './scheduler-host';
import { TimelineLine } from './TimelineLine';
import { TimelineScale } from './TimelineScale';

interface Props<T> {
  host: SchedulerHost<T>;
}

/** The cells a big view's window moves on by at least: small steps, so each builds little. */
const STEP = 2;

/** Rows a big timeline builds above and below the ones in view, and the rows off screen it keeps for coming back. */
const OVERSCAN_ROWS = 6;
const CACHED_ROWS = 60;

/**
 * The timeline views: a row per group of resources (one without groups) with the time running
 * along it, mirrored right to left. One scroll box holds it all: the head with the two tiers of the
 * scale stays at the top, the resource column at the start. A big timeline builds only what is in
 * view: its rows through `Virtualization` (each as tall as its lanes, from the model), its cells
 * and appointments by the model's window along the time. Changing the date fills the same rows
 * and cells in place.
 */
export class TimelineView<T> extends Component<HTMLDivElement, Props<T>> {
  private scroller: HTMLElement | null = null;
  private rows: Virtualization<TimelineRow<T>> | null = null;
  private probe: { tick: HTMLElement | null; lane: HTMLElement | null; gap: HTMLElement | null; row: HTMLElement | null; head: HTMLElement | null } = {
    tick: null,
    lane: null,
    gap: null,
    row: null,
    head: null,
  };
  /** A cell's width and the resource column's, in pixels (measured). */
  private readonly size = reactive({ tick: 0, head: 0 });
  /** The rows the virtual list keeps off screen (one object for them all: a row's own would be a store each). */
  private readonly away = reactive({} as Record<number, boolean>);
  /** The rows' heights the virtual list was last given. */
  private given = '';
  /** The sizes are measured (the rows know their heights): the virtual list asks for them only then. */
  private measured!: () => void;
  private readonly ready = new Promise<void>((done) => (this.measured = done));
  /** A scroll asked for before the sizes were known, made once they are. */
  private pending: { tick: number | null; row: number | null } | null = null;
  private readonly watch = new ResizeWatch(() => this.measure());

  override onConfigured() {
    this.class.add('mx-scheduler__timeline-view');
    this.motif.setDisposable(() => this.watch.disconnect());
    this.motif.setDisposable(onLookChanged(() => this.measure()));
    this.props.host.setTimeline({ scrollTo: (tick, row) => this.scrollTo(tick, row), reveal: (tick, row) => this.reveal(tick, row) });
  }

  override onConfig() {
    const host = this.props.host;
    const st = host.model.state;
    // The virtual list is given the rows again when they or their heights change; while an appointment is dragged its rows grow in place and are given after.
    this.bindings.watch(() => {
      const rows = st.rows.map((row) => `${row.key}:${row.height}`).join('|');
      const dragging = host.dragging();
      untracked(() => {
        if (dragging || rows === this.given || !this.rows) return;
        this.given = rows;
        this.give();
      });
    });
  }

  override onMounted() {
    for (const el of [this.scroller, this.probe.tick, this.probe.lane, this.probe.gap, this.probe.row, this.probe.head]) if (el) this.watch.observe(el);
    this.measure();
    this.props.host.viewShown();
  }

  override onDisposing() {
    cancelAnimationFrame(this.frame);
    this.props.host.setScroller(null);
    this.props.host.setTimeline(null);
  }

  /** Reads the sizes the design language gives (a cell, a lane, the gap, a row, the resource column) and lays the window out again. */
  private measure(): void {
    const { tick, lane, gap, row, head } = this.probe;
    const scroller = this.scroller;
    if (!tick || !lane || !gap || !row || !head || !scroller) return;
    const host = this.props.host;
    const levels = host.model.state.groups[0]?.path.length ?? 0;
    const headWidth = head.offsetWidth * levels;
    const count = Math.max(1, host.model.state.ticks.length);
    // The cells take at least their width, and stretch to fill the room when they are few.
    const room = scroller.clientWidth - headWidth;
    const width = Math.max(tick.offsetWidth, room > 0 ? room / count : 0);
    const before = this.size.tick;
    if (before !== width) {
      this.size.tick = width;
      // Another width (another language, another room): the same time stays at the start.
      const at = before > 0 ? Math.abs(scroller.scrollLeft) / before : 0;
      if (at > 0) queueMicrotask(() => (scroller.scrollLeft = (this.props.host.rtl() ? -1 : 1) * at * width));
    }
    if (this.size.head !== headWidth) this.size.head = headWidth;
    host.setLineMetrics({ lane: lane.offsetHeight, gap: gap.offsetHeight, min: row.offsetHeight });
    // Resolved after the layout has the heights: its flush is queued already.
    this.measured();
    const pending = this.pending;
    this.pending = null;
    // Once the cells have their width on the page (it is written in a microtask): until then there is nothing to scroll.
    if (pending && width > 0) queueMicrotask(() => this.scrollTo(pending.tick, pending.row));
    else this.follow();
  }

  private frame = 0;

  /** After a scroll, the window follows at the next frame (once however many scroll events come). */
  private followSoon(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      if (!this.isDisposed) this.follow();
    });
  }

  /** Builds the cells in view (and a screen's worth on each side), and moves the window on when the view nears its edge. */
  private follow(): void {
    const scroller = this.scroller;
    const tick = this.size.tick;
    const model = this.props.host.model;
    if (!scroller || !(tick > 0)) return;
    const left = Math.abs(scroller.scrollLeft);
    const visible = Math.max(1, Math.ceil((scroller.clientWidth - this.size.head) / tick) + 1);
    const first = Math.floor(left / tick);
    const want = first - visible;
    const now = model.state.window;
    if (now.count !== visible * 3 || Math.abs(now.first - Math.max(0, want)) >= STEP) model.setWindow(want, visible * 3);
  }

  /** Gives the virtual list the rows (and their heights); focus stays on the cell or appointment it was on. */
  private give(): void {
    const list = this.rows;
    if (!list) return;
    const active = this.element.ownerDocument.activeElement as HTMLElement | null;
    const inside = !!active && this.element.contains(active);
    const cell = inside ? active.dataset.cell : undefined;
    const piece = inside ? active.dataset.piece : undefined;
    list.setData(this.props.host.model.state.rows.slice());
    if (!inside) return;
    const again = cell
      ? this.element.querySelector<HTMLElement>(`[data-cell="${cell}"]`)
      : piece
        ? // The same piece, or (moved to another row) a box of the same appointment.
          [...this.element.querySelectorAll<HTMLElement>('.mx-scheduler__appointment')].find(
            (el) => el.dataset.piece === piece || (el.dataset.piece ?? '').startsWith(`${piece.slice(0, piece.lastIndexOf('@'))}@`),
          )
        : null;
    again?.focus({ preventScroll: true });
  }

  /** Scrolls so that a cell along the time (at its start) and a row are at the start of the view. */
  private scrollTo(tick: number | null, row: number | null): void {
    const scroller = this.scroller;
    if (!scroller || !(this.size.tick > 0)) {
      this.pending = { tick, row };
      return;
    }
    if (tick !== null) {
      const at = Math.max(0, tick * this.size.tick);
      scroller.scrollLeft = this.props.host.rtl() ? -at : at;
    }
    if (row !== null) scroller.scrollTop = this.rowTop(row);
    this.follow();
  }

  /** Scrolls a cell (along the time) and a row into view only when they are not in it, and builds them. */
  private reveal(tick: number | null, row: number | null): void {
    const scroller = this.scroller;
    if (!scroller) return;
    const size = this.size.tick;
    if (tick !== null && size > 0) {
      const left = Math.abs(scroller.scrollLeft);
      const room = scroller.clientWidth - this.size.head;
      const start = tick * size;
      if (start < left || start + size > left + room) {
        const at = start < left ? start : start + size - room;
        scroller.scrollLeft = this.props.host.rtl() ? -Math.max(0, at) : Math.max(0, at);
      }
    }
    if (row !== null) {
      const top = this.rowTop(row);
      const height = this.props.host.model.state.rows[row]?.height ?? 0;
      const head = scroller.querySelector<HTMLElement>('.mx-scheduler__scale')?.offsetHeight ?? 0;
      if (top < scroller.scrollTop) scroller.scrollTop = top;
      else if (top + height + head > scroller.scrollTop + scroller.clientHeight) scroller.scrollTop = top + height + head - scroller.clientHeight;
      if (this.rows && (top < scroller.scrollTop - head || top > scroller.scrollTop + scroller.clientHeight)) this.rows.scrollToIndex(row);
    }
    this.follow();
  }

  /** Where a row starts in the scroll box, under the head. */
  private rowTop(row: number): number {
    const rows = this.props.host.model.state.rows;
    let top = 0;
    for (let i = 0; i < row && i < rows.length; i++) top += rows[i].height;
    return top;
  }

  override view() {
    const host = this.props.host;
    const model = host.model;
    const st = model.state;
    const t = host.text.bind(host);
    const scroll = (e: Event) => {
      void e;
      this.followSoon();
    };
    // The cells' keys; an appointment in a row has its own.
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.dataset?.cell !== undefined) host.gridKey(e);
    };
    const keep = (el: HTMLElement) => {
      this.scroller = el;
      host.setScroller(el);
    };
    const lines = (virtual: boolean) => {
      const cellTemplate = untracked(() => host.cellTemplate());
      if (!virtual) {
        return (
          <div
            class="mx-scheduler__scroll mx-scheduler__line-scroll"
            role="grid"
            aria-label={() => t('schedulerTimes')}
            ref={(c) => keep(c.element as HTMLElement)}
            onscroll={scroll}
            onkeydown={key}
          >
            <TimelineScale host={host} />
            {st.rows.map((row) => (
              <TimelineLine key={row.index} host={host} row={row} cellTemplate={cellTemplate} away={this.away} />
            ))}
          </div>
        );
      }
      return (
        <Virtualization<TimelineRow<T>>
          class="mx-scheduler__rows"
          itemHeight={(row) => row.height}
          pageSize={1_000_000}
          overscan={OVERSCAN_ROWS}
          cacheSize={CACHED_ROWS}
          autoLoad={false}
          autoRefresh={false}
          dataRequest={async () => {
            await this.ready;
            const rows = untracked(() => st.rows.slice());
            this.given = untracked(() => st.rows.map((row) => `${row.key}:${row.height}`).join('|'));
            return { items: rows, totalCount: rows.length, hasMore: false };
          }}
          itemTemplate={(row) => <TimelineLine host={host} row={row} cellTemplate={cellTemplate} away={this.away} />}
          mainTemplate={(content) => (
            <div
              class="mx-scheduler__scroll mx-scheduler__line-scroll"
              role="grid"
              aria-label={() => t('schedulerTimes')}
              ref={(c) => keep(c.element as HTMLElement)}
              onscroll={scroll}
              onkeydown={key}
            >
              <TimelineScale host={host} />
              <content></content>
            </div>
          )}
          ref={(v: Virtualization<TimelineRow<T>>) => (this.rows = v)}
        />
      );
    };
    return (
      <>
        <div
          class="mx-scheduler__timeline"
          style={() => ({
            '--_tick': `${this.size.tick}px`,
            '--_ticks': String(st.ticks.length),
            '--_levels': String(st.groups[0]?.path.length ?? 0),
          })}
        >
          {() => {
            // Built again only when it turns virtual or back, or a cell template comes or goes.
            switch (`${model.virtual ? 'virtual' : 'standard'}${host.cellTemplate() ? '+cells' : ''}`) {
              case 'virtual':
                return lines(true);
              case 'virtual+cells':
                return lines(true);
              case 'standard+cells':
                return lines(false);
              default:
                return lines(false);
            }
          }}
        </div>
        <div class="mx-scheduler__probe" aria-hidden="true">
          <div class="mx-scheduler__probe-tick" ref={(c) => (this.probe.tick = c.element as HTMLElement)} />
          <div class="mx-scheduler__probe-line" ref={(c) => (this.probe.lane = c.element as HTMLElement)} />
          <div class="mx-scheduler__probe-gap" ref={(c) => (this.probe.gap = c.element as HTMLElement)} />
          <div class="mx-scheduler__probe-row" ref={(c) => (this.probe.row = c.element as HTMLElement)} />
          <div class="mx-scheduler__probe-head" ref={(c) => (this.probe.head = c.element as HTMLElement)} />
        </div>
      </>
    );
  }
}
