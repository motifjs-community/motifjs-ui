import { Component, untracked, Virtualization, type ComponentBase } from '@motifx/core';
import { focusOn, holdsFocus } from '../../../core/focus';
import { boxOf, measure, onLayout, scrollTo, type Box, type ScrollPlace } from '../../../core/measure';
import { onReState } from '../../../core/on-re-state';
import type { CellTemplateContext } from '../cell-template-context';
import type { CellPlace } from '../model/cell-place';
import type { ModelChange } from '../model/SchedulerModel';
import type { TimelineRow } from '../model/timeline-row';
import { css, put } from '../../../core/part-writes';
import { KeyedParts } from './KeyedParts';
import type { SchedulerHost } from './scheduler-host';
import type { ShownView } from './shown-view';
import { TimelineLine } from './TimelineLine';
import { TimelineScale } from './TimelineScale';

interface Props<T> {
  host: SchedulerHost<T>;
}

/** The sizes the design language gives, and the room and scroll of the scroll box, read together. */
interface Sizes {
  tick: number;
  head: number;
  lane: number;
  gap: number;
  min: number;
  room: number;
  start: number;
}

/** The scroll box as read, and the height of the head that stays at its top. */
interface ScrollerRead {
  box: Box;
  head: number;
}

/** A scroll the scheduler asked for: to a cell along the time and a row, or only as far as it takes to show them. */
interface Wanted {
  tick: number | null;
  row: number | null;
  reveal: boolean;
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
export class TimelineView<T> extends Component<HTMLDivElement, Props<T>> implements ShownView {
  /** Its parts are created (in `onConfigured`): until then a draw has nothing to draw on. */
  private made = false;
  private scroller: Component<HTMLDivElement> | null = null;
  private rows: Virtualization<TimelineRow<T>> | null = null;
  private readonly probe: Record<'tick' | 'lane' | 'gap' | 'row' | 'head', Component<HTMLDivElement> | null> = {
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
  /** A scroll asked for and not made yet: made with the next reads, once the cells have their width. */
  private wanted: Wanted | null = null;
  /** A row brought into view, checked once the scroll is made. */
  private revealed: { row: number; top: number; head: number } | null = null;
  private timeline!: Component<HTMLDivElement>;
  private scale: TimelineScale<T> | null = null;
  /** The rows of a timeline that is not virtual. */
  private lines: KeyedParts<TimelineRow<T>, TimelineLine<T>> | null = null;
  /** The rows made (virtual or not), while they live: a virtual list keeps some off the page for coming back. */
  private readonly shownLines = new Set<TimelineLine<T>>();
  /** What the rows were created for: virtual or not, and the cell template. */
  private madeFor: { virtual: boolean; cellTemplate: ((context: CellTemplateContext) => ComponentBase) | null } | null = null;

  private readonly readSizes = (): Sizes | null => {
    const { tick, lane, gap, row, head } = this.probe;
    const scroller = this.scroller;
    if (!tick || !lane || !gap || !row || !head || !scroller) return null;
    const box = boxOf(scroller);
    return {
      tick: boxOf(tick).offsetWidth,
      head: boxOf(head).offsetWidth,
      lane: boxOf(lane).offsetHeight,
      gap: boxOf(gap).offsetHeight,
      min: boxOf(row).offsetHeight,
      room: box.clientWidth,
      start: box.scrollStart,
    };
  };

  private readonly readView = (): Box | null => (this.scroller ? boxOf(this.scroller) : null);

  private readonly readScroller = (): ScrollerRead | null => {
    if (!this.scroller) return null;
    return { box: boxOf(this.scroller), head: this.scale ? boxOf(this.scale).offsetHeight : 0 };
  };

  constructor(props: Props<T>) {
    super('div', props);
  }

  override onConfigured() {
    const host = this.props.host;
    this.class.add('mx-scheduler__timeline-view');
    onLayout(this, 'look', () => this.measureSizes());
    host.setTimeline({ scrollTo: (tick, row) => this.scrollTo(tick, row), reveal: (tick, row) => this.reveal(tick, row) });
    this.timeline = new Component<HTMLDivElement>('div');
    this.timeline.class.add('mx-scheduler__timeline');
    this.controls.add(this.timeline);
    const probe = new Component<HTMLDivElement>('div');
    probe.class.add('mx-scheduler__probe');
    probe.attr.add({ 'aria-hidden': 'true' });
    this.controls.add(probe);
    for (const name of ['tick', 'lane', 'gap', 'row', 'head'] as const) {
      const c = new Component<HTMLDivElement>('div');
      c.class.add(`mx-scheduler__probe-${name === 'lane' ? 'line' : name}`);
      probe.controls.add(c);
      this.probe[name] = c;
      onLayout(c, 'size', () => this.measureSizes());
    }
    this.motif.setDisposable(host.model.onChanged((change) => this.changed(change)));
    this.made = true;
    this.draw();
    onReState(this, () => this.draw());
    this.motif.setDisposable(host.keepDrawn(() => this.draw()));
  }

  override onMounted() {
    this.measureSizes();
    this.props.host.viewShown();
  }

  override onDisposing() {
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
    css(this.timeline, '--_tick', `${this.size.tick}px`);
    css(this.timeline, '--_ticks', String(st.ticks.length));
    css(this.timeline, '--_levels', String(st.groups[0]?.path.length ?? 0));
    const cellTemplate = untracked(() => host.cellTemplate());
    const was = this.madeFor;
    // Made again only when it turns virtual or back; another cell template fills the same cells again.
    if (!was || was.virtual !== model.virtual) {
      this.make(model.virtual, cellTemplate);
      return;
    }
    if (was.cellTemplate !== cellTemplate) {
      was.cellTemplate = cellTemplate;
      for (const line of this.shownLines) line.fillCells(cellTemplate);
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

  /** The cell showing a place, while it is built: a big timeline builds only the cells and rows in view. */
  cellAt(place: CellPlace): ComponentBase | null {
    for (const line of this.onPage()) {
      const cell = line.cellAt(place);
      if (cell) return cell;
    }
    return null;
  }

  /** The box of a piece, while it is built. */
  boxOf(id: string): ComponentBase | null {
    for (const line of this.onPage()) {
      const box = line.boxOf(id);
      if (box) return box;
    }
    return null;
  }

  /** The rows on the page: a row the virtual list keeps off it for coming back, or lets go of, has no parent. */
  private onPage(): TimelineLine<T>[] {
    return [...this.shownLines].filter((line) => line.parent !== null);
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
    const shownLines = this.shownLines;
    const madeFor = this.madeFor;
    const line = (row: TimelineRow<T>) => {
      const made = new TimelineLine<T>({ host, row, cellTemplate: madeFor.cellTemplate, away: this.away });
      shownLines.add(made);
      // A list may let go of a row after the view is gone, and a disposed view has no fields: the set is held here.
      made.motif.setDisposable(() => shownLines.delete(made));
      return made;
    };
    const scroller = (box: Component<HTMLDivElement>) => {
      box.class.add('mx-scheduler__scroll mx-scheduler__line-scroll');
      box.attr.add({ role: 'grid', 'aria-label': host.text('schedulerTimes') });
      box.motif.on('scroll', () => this.follow());
      onLayout(box, 'size', () => this.measureSizes());
      this.scroller = box;
      host.setScroller(box);
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
      return;
    }
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
      itemTemplate: (row) => line(row),
      mainTemplate: (content) => {
        const box = new Component<HTMLDivElement>('div');
        scroller(box);
        box.controls.add(content);
        return box;
      },
    });
    list.class.add('mx-scheduler__rows');
    this.rows = list;
    this.timeline.controls.add(list);
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

  /** Reads the sizes the design language gives (a cell, a lane, the gap, a row, the resource column) with the next reads, and lays the window out again. */
  private measureSizes(): void {
    measure(this, this.readSizes, this.takeSizes);
  }

  private readonly takeSizes = (sizes: Sizes | null): void => {
    if (!sizes) return;
    const host = this.props.host;
    const levels = host.model.state.groups[0]?.path.length ?? 0;
    const headWidth = sizes.head * levels;
    const count = Math.max(1, host.model.state.ticks.length);
    // The cells take at least their width, and stretch to fill the room when they are few.
    const room = sizes.room - headWidth;
    const width = Math.max(sizes.tick, room > 0 ? room / count : 0);
    const before = this.size.tick;
    const changed = before !== width || this.size.head !== headWidth;
    if (before !== width) {
      this.size.tick = width;
      // Another width (another language, another room): the same time stays at the start, unless a scroll is asked for.
      const at = before > 0 ? sizes.start / before : 0;
      if (at > 0 && !this.wanted) this.wanted = { tick: at, row: null, reveal: false };
    }
    this.size.head = headWidth;
    if (changed) this.draw();
    host.setLineMetrics({ lane: sizes.lane, gap: sizes.gap, min: sizes.min });
    // Resolved after the layout has the heights: its flush is queued already.
    this.measured();
    // Scrolled in the next round, once the cells have their width on the page.
    if (this.wanted) measure(this, this.readScroller, this.scrollWanted);
    else this.follow();
  };

  /** Builds the cells in view (and a screen's worth on each side) with the next reads, and moves the window on when the view nears its edge. */
  private follow(): void {
    measure(this, this.readView, this.followView);
  }

  private readonly followView = (box: Box | null): void => {
    const tick = this.size.tick;
    const model = this.props.host.model;
    const revealed = this.revealed;
    this.revealed = null;
    // A row the scroll could not reach (the virtual list is not that tall yet) is built by the list itself.
    if (box && revealed && this.rows && (revealed.top < box.scrollTop - revealed.head || revealed.top > box.scrollTop + box.clientHeight)) this.rows.scrollToIndex(revealed.row);
    if (!box || !(tick > 0)) return;
    const visible = Math.max(1, Math.ceil((box.clientWidth - this.size.head) / tick) + 1);
    const first = Math.floor(box.scrollStart / tick);
    const want = first - visible;
    const now = model.state.window;
    if (now.count !== visible * 3 || Math.abs(now.first - Math.max(0, want)) >= STEP) model.setWindow(want, visible * 3);
  };

  /** Gives the virtual list the rows (and their heights); focus stays on the cell or appointment it was on. */
  private give(): void {
    const list = this.rows;
    if (!list) return;
    const line = holdsFocus(this) ? this.onPage().find((one) => holdsFocus(one)) : undefined;
    const cell = line?.cellWithFocus() ?? null;
    const piece = cell ? null : (line?.pieceWithFocus() ?? null);
    list.setData(this.props.host.model.state.rows.slice());
    let again = cell ? this.cellAt(cell) : null;
    if (piece) {
      // The same piece, or (moved to another row) a box of the same appointment.
      const appointment = `${piece.slice(0, piece.lastIndexOf('@'))}@`;
      const others = this.props.host.model.state.rows.flatMap((row) => row.pieces.map((p) => p.id).filter((id) => id !== piece && id.startsWith(appointment)));
      for (const id of [piece, ...others]) {
        again = this.boxOf(id);
        if (again) break;
      }
    }
    if (again) focusOn(again, { preventScroll: true });
  }

  /** Scrolls so that a cell along the time (at its start) and a row are at the start of the view, once the cells have their width. */
  private scrollTo(tick: number | null, row: number | null): void {
    this.wanted = { tick, row, reveal: false };
    measure(this, this.readScroller, this.scrollWanted);
  }

  /** Scrolls a cell (along the time) and a row into view only when they are not in it, and builds them. */
  private reveal(tick: number | null, row: number | null): void {
    this.wanted = { tick, row, reveal: true };
    measure(this, this.readScroller, this.scrollWanted);
  }

  /** Makes the scroll asked for, from the scroll box as read; one to a place waits until the cells have their width. */
  private readonly scrollWanted = (read: ScrollerRead | null): void => {
    const wanted = this.wanted;
    const scroller = this.scroller;
    const size = this.size.tick;
    if (!wanted || !read || !scroller || (!wanted.reveal && !(size > 0))) return;
    this.wanted = null;
    const { tick, row } = wanted;
    const { box, head } = read;
    const place: ScrollPlace = {};
    if (!wanted.reveal) {
      if (tick !== null) place.start = Math.max(0, tick * size);
      if (row !== null) place.top = this.rowTop(row);
      scrollTo(scroller, place);
      this.follow();
      return;
    }
    if (tick !== null && size > 0) {
      const left = box.scrollStart;
      const room = box.clientWidth - this.size.head;
      const start = tick * size;
      if (start < left || start + size > left + room) place.start = Math.max(0, start < left ? start : start + size - room);
    }
    if (row !== null) {
      const top = this.rowTop(row);
      const height = this.props.host.model.state.rows[row]?.height ?? 0;
      if (top < box.scrollTop) place.top = top;
      else if (top + height + head > box.scrollTop + box.clientHeight) place.top = top + height + head - box.clientHeight;
      if (this.rows) this.revealed = { row, top, head };
    }
    scrollTo(scroller, place);
    this.follow();
  };

  /** Where a row starts in the scroll box, under the head. */
  private rowTop(row: number): number {
    const rows = this.props.host.model.state.rows;
    let top = 0;
    for (let i = 0; i < row && i < rows.length; i++) top += rows[i].height;
    return top;
  }
}
