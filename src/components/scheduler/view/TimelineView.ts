import { Component, untracked, Virtualization, type ComponentBase } from '@motifx/core';
import { onLookChanged } from '../../../core/look-watch';
import { nextFrame } from '../../../core/next-frame';
import { onReState } from '../../../core/on-re-state';
import { ResizeWatch } from '../../../core/resize-watch';
import type { CellTemplateContext } from '../cell-template-context';
import type { ModelChange } from '../model/SchedulerModel';
import type { TimelineRow } from '../model/timeline-row';
import { css, put } from '../../../core/draw-parts';
import { KeyedParts } from './KeyedParts';
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
 * The timeline views: a row per group of resources (one without groups) with the time running along it, mirrored
 * right to left. One scroll box holds it all: the head with the two tiers of the scale stays at the top, the resource
 * column at the start. A big timeline builds only what is in view: its rows through `Virtualization` (each as tall as
 * its lanes, from the model), its cells and appointments by the model's window along the time. Changing the date fills
 * the same rows and cells in place.
 *
 * It follows nothing: it draws itself when the model tells it what changed, when its sizes are measured, on
 * `reState()` and when an option or a text it shows changes.
 */
export class TimelineView<T> extends Component<HTMLDivElement, Props<T>> {
  /** Its parts are made (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
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
  private readonly size = { tick: 0, head: 0 };
  /** The rows the virtual list keeps off screen, by the row's own number. */
  private readonly away: Record<number, boolean> = {};
  /** The rows' heights the virtual list was last given. */
  private given = '';
  /** The sizes are measured (the rows know their heights): the virtual list asks for them only then. */
  private measured!: () => void;
  private readonly ready = new Promise<void>((done) => (this.measured = done));
  /** A scroll asked for before the sizes were known, made once they are. */
  private pending: { tick: number | null; row: number | null } | null = null;
  private readonly watch = new ResizeWatch(() => this.measure());
  private timeline!: Component<HTMLDivElement>;
  private scale: TimelineScale<T> | null = null;
  /** The rows of a timeline that is not virtual. */
  private lines: KeyedParts<TimelineRow<T>, TimelineLine<T>> | null = null;
  /** The rows the virtual list has made, while they live. */
  private readonly shownLines = new Set<TimelineLine<T>>();
  /** What the rows were made for: virtual or not, and the cell template. */
  private madeFor: { virtual: boolean; cellTemplate: unknown } | null = null;
  private stopFollow: (() => void) | null = null;

  constructor(props: Props<T>) {
    super('div', props);
  }

  override onConfigured() {
    const host = this.props.host;
    this.class.add('mx-scheduler__timeline-view');
    this.motif.setDisposable(() => this.watch.disconnect());
    this.motif.setDisposable(onLookChanged(() => this.measure()));
    host.setTimeline({ scrollTo: (tick, row) => this.scrollTo(tick, row), reveal: (tick, row) => this.reveal(tick, row) });
    this.timeline = new Component<HTMLDivElement>('div');
    this.timeline.element.className = 'mx-scheduler__timeline';
    this.controls.add(this.timeline);
    const probe = new Component<HTMLDivElement>('div');
    probe.element.className = 'mx-scheduler__probe';
    probe.element.setAttribute('aria-hidden', 'true');
    this.controls.add(probe);
    for (const name of ['tick', 'lane', 'gap', 'row', 'head'] as const) {
      const c = new Component<HTMLDivElement>('div');
      c.element.className = `mx-scheduler__probe-${name === 'lane' ? 'line' : name}`;
      probe.controls.add(c);
      this.probe[name] = c.element;
    }
    this.motif.setDisposable(host.model.onChanged((change) => this.changed(change)));
    this.made = true;
    this.draw();
    onReState(this, () => this.draw());
    this.motif.setDisposable(host.keepDrawn(() => this.draw()));
  }

  override onMounted() {
    for (const el of [this.scroller, this.probe.tick, this.probe.lane, this.probe.gap, this.probe.row, this.probe.head]) if (el) this.watch.observe(el);
    this.measure();
    this.props.host.viewShown();
  }

  override onDisposing() {
    this.stopFollow?.();
    this.props.host.setScroller(null);
    this.props.host.setTimeline(null);
  }

  /** What the model tells is drawn: the rows and the scale follow the window and the focus themselves; the rest draws the view again. */
  private changed(change: ModelChange): void {
    if (this.isDisposed || change === 'focus' || change === 'window' || change === 'now') return;
    if (change === 'layout') this.giveChanged();
    this.draw();
  }

  /** All of the view, as the model has it now. */
  draw(): void {
    if (this.isDisposed || !this.made) return;
    const host = this.props.host;
    const model = host.model;
    const st = model.state;
    const el = this.timeline.element;
    css(el, '--_tick', `${this.size.tick}px`);
    css(el, '--_ticks', String(st.ticks.length));
    css(el, '--_levels', String(st.groups[0]?.path.length ?? 0));
    const cellTemplate = untracked(() => host.cellTemplate());
    const was = this.madeFor;
    // Made again only when it turns virtual or back, or another cell template comes.
    if (!was || was.virtual !== model.virtual || was.cellTemplate !== cellTemplate) {
      this.make(model.virtual, cellTemplate);
      return;
    }
    if (this.scroller) put(this.scroller, 'aria-label', host.text('schedulerTimes'));
    this.scale?.draw();
    if (this.lines) this.lines.show(st.rows);
    else {
      const byKey = new Map(st.rows.map((row) => [row.key, row]));
      for (const line of this.shownLines) {
        const row = byKey.get(line.rowKey);
        if (row) line.show(row);
      }
    }
  }

  /** The scroll box with the scale and the rows, virtual or not. */
  private make(virtual: boolean, cellTemplate: ((context: CellTemplateContext) => ComponentBase) | null): void {
    const host = this.props.host;
    const st = host.model.state;
    this.madeFor = { virtual, cellTemplate };
    this.timeline.controls.clear();
    this.shownLines.clear();
    this.lines = null;
    this.rows = null;
    const line = (row: TimelineRow<T>) => new TimelineLine<T>({ host, row, cellTemplate, away: this.away });
    const scroller = (box: Component<HTMLDivElement>) => {
      const el = box.element;
      el.className = 'mx-scheduler__scroll mx-scheduler__line-scroll';
      el.setAttribute('role', 'grid');
      el.setAttribute('aria-label', host.text('schedulerTimes'));
      el.addEventListener('scroll', () => this.followSoon());
      // The cells' keys; an appointment in a row has its own.
      el.addEventListener('keydown', (e) => {
        if ((e.target as HTMLElement | null)?.dataset?.cell !== undefined) host.gridKey(e);
      });
      this.scroller = el;
      host.setScroller(el);
      this.scale = new TimelineScale<T>({ host });
      box.controls.add(this.scale);
    };
    if (!virtual) {
      const box = new Component<HTMLDivElement>('div');
      scroller(box);
      this.timeline.controls.add(box);
      this.lines = new KeyedParts<TimelineRow<T>, TimelineLine<T>>(
        box,
        (row) => row.key,
        line,
        (part, row) => part.show(row),
        () => 1,
      );
      this.lines.show(st.rows);
      this.observeScroller();
      return;
    }
    const shownLines = this.shownLines;
    const list = new Virtualization<TimelineRow<T>>({
      itemHeight: (row) => row.height,
      pageSize: 1_000_000,
      overscan: OVERSCAN_ROWS,
      cacheSize: CACHED_ROWS,
      autoLoad: false,
      autoRefresh: false,
      dataRequest: async () => {
        await this.ready;
        const rows = st.rows.slice();
        this.given = st.rows.map((row) => `${row.key}:${row.height}`).join('|');
        return { items: rows, totalCount: rows.length, hasMore: false };
      },
      itemTemplate: (row) => {
        const made = line(row);
        shownLines.add(made);
        // The list may let go of a row after the view is gone, and a disposed view has no fields: the set is held here.
        made.motif.setDisposable(() => shownLines.delete(made));
        return made;
      },
      mainTemplate: (content) => {
        const box = new Component<HTMLDivElement>('div');
        scroller(box);
        box.controls.add(content);
        return box;
      },
    });
    list.element.classList.add('mx-scheduler__rows');
    this.rows = list;
    this.timeline.controls.add(list);
    this.observeScroller();
  }

  /** A scroll box made after the view was on the page is watched for its size too. */
  private observeScroller(): void {
    if (this.element.isConnected && this.scroller) this.watch.observe(this.scroller);
  }

  /** The virtual list is given the rows again when they or their heights changed; while an appointment is dragged its rows grow in place and are given after. */
  private giveChanged(): void {
    const host = this.props.host;
    if (host.dragging() || !this.rows) return;
    const rows = host.model.state.rows.map((row) => `${row.key}:${row.height}`).join('|');
    if (rows === this.given) return;
    this.given = rows;
    this.give();
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
    const changed = before !== width || this.size.head !== headWidth;
    if (before !== width) {
      this.size.tick = width;
      // Another width (another language, another room): the same time stays at the start.
      const at = before > 0 ? Math.abs(scroller.scrollLeft) / before : 0;
      if (at > 0) queueMicrotask(() => (scroller.scrollLeft = (this.props.host.rtl() ? -1 : 1) * at * width));
    }
    if (this.size.head !== headWidth) this.size.head = headWidth;
    if (changed) this.draw();
    host.setLineMetrics({ lane: lane.offsetHeight, gap: gap.offsetHeight, min: row.offsetHeight });
    // Resolved after the layout has the heights: its flush is queued already.
    this.measured();
    const pending = this.pending;
    this.pending = null;
    // Once the cells have their width on the page (it is written in a microtask): until then there is nothing to scroll.
    if (pending && width > 0) queueMicrotask(() => this.scrollTo(pending.tick, pending.row));
    else this.follow();
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
}
