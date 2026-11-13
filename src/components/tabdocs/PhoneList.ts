import { untracked, type Component, type ComponentBase } from '@motifx/core';
import { glyphPart, loose, part, partBefore, removePart } from '../../core/draw-parts';
import { focusOn, isFocused } from '../../core/focus';
import { nextId } from '../../core/next-id';
import { orderControls } from '../../core/order-controls';
import { css, flag, kept, mark, put, text as writeText } from '../../core/part-writes';
import { showIcon } from '../../core/show-icon';
import { SwipeTracker } from '../../parts/overlay/swipe-tracker';
import { BottomSheet } from '../sheet/BottomSheet';
import { TextBox } from '../textbox/TextBox';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabPresenter } from './TabPresenter';
import { foldText } from '../../core/fold-text';
import { boxOf, measure, reveal, shareAlong, whenMeasured, type Point } from '../../core/measure';
import { autoScroll } from '../../parts/drag/auto-scroll';
import { DragBoxes } from '../../parts/drag/drag-boxes';

/** How far, in pixels, a finger moves before it is a swipe or a scroll. */
const SLOP = 8;

interface Row {
  part: Component<HTMLLIElement>;
  open: Component<HTMLButtonElement>;
  close: Component<HTMLButtonElement>;
  release: () => void;
  /** What it was written from, to write it again only when that changes. */
  look: string;
  /** Whether the search shows it. */
  shown: boolean;
  /** The parts in the open button, made once (the optional ones the first time they show) and written in place. */
  text: Component<HTMLSpanElement>;
  title: Component<HTMLSpanElement>;
  gap: Component<HTMLSpanElement> | null;
  description: Component<HTMLSpanElement> | null;
  iconHolder: Component<HTMLSpanElement> | null;
  icon: unknown;
  pin: Component<HTMLSpanElement> | null;
  dirty: Component<HTMLSpanElement> | null;
  states: Component<HTMLSpanElement> | null;
}

/** A finger on a row: a swipe to close it, or, after a long press, a drag to another place. */
interface Gesture {
  id: number;
  doc: TabDocument;
  row: Row;
  x: number;
  y: number;
  mode: 'wait' | 'swipe' | 'drag' | 'scroll';
  timer: ReturnType<typeof setTimeout> | undefined;
  tracker: SwipeTracker;
  /** Where the dragged row was before, to tell a drag that moved it from one that did not. */
  from: { list: ComponentBase; next: ComponentBase | null } | null;
  /** The finger's last point while it drags, `null` before it moves. */
  point: Point | null;
  /** The rows and sections the drag aims at, kept while it lasts. */
  boxes: DragBoxes | null;
  /** Ends the scrolling near the list's ends. */
  stopScroll: (() => void) | null;
}

/** Where the lifted row goes for the finger's point: next to a row, or into a section's list. */
interface Aim {
  gesture: Gesture;
  row: Row | null;
  after: boolean;
  list: Component<HTMLUListElement> | null;
}

/** A group's section: its heading and the list of its rows. */
interface Section {
  section: Component<HTMLElement>;
  head: Component<HTMLDivElement>;
  list: Component<HTMLUListElement>;
  /** Whether it shows: the search shows a row of it. */
  shown: boolean;
}

/** The part after `c` among its parent's, `null` at the end. */
function nextOf(c: ComponentBase): ComponentBase | null {
  const items = c.parent?.controls.items ?? [];
  return items[items.indexOf(c) + 1] ?? null;
}

/** Puts `c` into `list` before `before` (at the end for `null`), moving it alive. */
function placeBefore(list: ComponentBase, c: ComponentBase, before: ComponentBase | null): void {
  if (c.parent === list) {
    list.controls.move(c, before);
    return;
  }
  const at = before ? list.controls.items.indexOf(before) : -1;
  if (at >= 0) list.controls.insert(at, c);
  else list.controls.add(c);
}

/**
 * The full-screen list of a phone's open documents, in a sheet: a search, the groups as sections
 * (the floating windows' too), pinned documents first. A tap opens a document, a swipe sideways
 * closes it, a long press lifts it to drag it elsewhere in its group or into another, and a long
 * press let go where it was opens its commands. The keys: up and down, Enter, Delete, Alt with up
 * or down to move it, the Menu key for its commands.
 */
export class PhoneList {
  private readonly sheet: BottomSheet;
  private readonly search: TextBox;
  private readonly sectionsPart: Component<HTMLDivElement>;
  private readonly empty: Component<HTMLDivElement>;
  private readonly rows = new Map<TabDocument, Row>();
  private readonly lists = new Map<TabGroup, Section>();
  private query = '';
  private gesture: Gesture | null = null;
  /** The lifted row's gesture, from the lift until it is let go and dropped. */
  private dragged: Gesture | null = null;

  constructor(
    private readonly manager: TabDocumentManager,
    private readonly presenter: TabPresenter,
  ) {
    this.sheet = new BottomSheet({
      container: manager,
      title: () => manager.textOf('tabDocsPhoneList'),
      showClose: true,
      detents: ['full'],
      topGap: 0,
      dragContent: false,
      focusOnOpen: false,
      onOpened: () => untracked(() => {
        manager.listShown(true);
        presenter.render();
      }),
      onClosed: (e) => untracked(() => {
        // Closed as it is disposed: the manager is going away with it.
        if (e.reason === 'owner') return;
        manager.listShown(false);
        presenter.render();
      }),
    });
    this.sheet.class.add('mx-tabdocs__phone-list');
    const search = (this.search = new TextBox({ type: 'search', stretch: true, autocomplete: 'off' }));
    search.label = () => manager.textOf('tabDocsPhoneSearch');
    search.placeholder = () => manager.textOf('tabDocsPhoneSearch');
    search.class.add('mx-tabdocs__list-search');
    search.onValueChanged((e) => {
      this.query = foldText((e.value ?? '').trim());
      this.filter();
    });
    const sections = (this.sectionsPart = loose<HTMLDivElement>('div', 'mx-tabdocs__list-sections'));
    const empty = loose<HTMLDivElement>('div', 'mx-tabdocs__list-empty');
    this.empty = empty;
    mark(this.empty, 'hidden', true);
    // The sheet's children, in this order, go to its content area.
    this.sheet.controls.add(search, sections, empty);
    manager.controls.add(this.sheet);
    this.listen();
  }

  get isOpen(): boolean {
    return this.sheet.isOpen;
  }

  open(): boolean {
    // Outside the component tree the search is never mounted: on the page, it reads its look from the list's place.
    this.search.readLook();
    this.render();
    if (!this.sheet.open()) return false;
    const active = this.presenter.phoneDocument;
    const row = (active && this.rows.get(active)) ?? [...this.rows.values()][0];
    if (row) {
      focusOn(row.open, { preventScroll: true });
      reveal(this.sheet.contentPart, row.part, { axis: 'y' });
    }
    return true;
  }

  close(): boolean {
    return this.sheet.close('code');
  }

  dispose(): void {
    this.endGesture();
    this.dragged?.boxes?.stop();
    this.dragged = null;
    for (const row of this.rows.values()) row.release();
    this.rows.clear();
    if (!this.search.isDisposed) void this.search.dispose();
    if (!this.sheet.isDisposed) void this.sheet.dispose();
  }

  /** Draws the sections and rows again for the documents open now. */
  render(): void {
    if (this.dragged) return;
    const m = this.manager;
    const groups = this.presenter.listGroups();
    const active = this.presenter.phoneDocument;
    const single = groups.length < 2;
    const seen = new Set<TabDocument>();
    const sections = groups.map((group, i) => {
      const part = this.listOf(group);
      writeText(part.head, group.window ? m.textOf('tabDocsWindow', { n: group.window.index + 1 }) : m.textOf('tabDocsGroup', { n: i + 1 }));
      mark(part.head, 'hidden', single);
      const rows = group.documents.map((doc) => {
        seen.add(doc);
        const row = this.rowOf(doc);
        flag(row.part, 'aria-current', doc === active);
        return row.part;
      });
      // A row no longer in this group is taken out alive: it goes into its new group's list, or away below.
      for (const c of [...part.list.controls.items]) if (!rows.includes(c as Component<HTMLLIElement>)) part.list.controls.silentDetach(c);
      orderControls(part.list, rows);
      return part.section;
    });
    orderControls(this.sectionsPart, sections);
    for (const [group, part] of this.lists) {
      if (groups.includes(group)) continue;
      removePart(part.section);
      this.lists.delete(group);
    }
    for (const [doc, row] of this.rows) {
      if (seen.has(doc)) continue;
      row.release();
      removePart(row.part);
      this.rows.delete(doc);
    }
    writeText(this.empty, m.textOf('noItems'));
    this.filter();
    this.renderRoving();
  }

  /** A group's section, made the first time (and placed by `render`). */
  private listOf(group: TabGroup): Section {
    const known = this.lists.get(group);
    if (known) return known;
    const section = loose<HTMLElement>('section', 'mx-tabdocs__list-section');
    const head = part<HTMLDivElement>(section, 'div', 'mx-tabdocs__list-head');
    const id = nextId('tabdocs-list');
    head.attr.add({ role: 'heading', 'aria-level': '3', id });
    const list = part<HTMLUListElement>(section, 'ul', 'mx-tabdocs__list-rows');
    list.attr.add({ 'aria-labelledby': id });
    const made: Section = { section, head, list, shown: true };
    this.lists.set(group, made);
    return made;
  }

  /** A document's row, made the first time (and placed by `render`); its parts written in place when the document changes. */
  private rowOf(doc: TabDocument): Row {
    const m = this.manager;
    const look = [doc.title, doc.description, doc.dirty, doc.pinned, doc.preview, doc.closable, String(doc.icon ?? '')].join('|');
    const row = this.rows.get(doc) ?? this.makeRow(doc);
    if (row.look === look) return row;
    row.look = look;
    mark(row.part, 'data-pinned', doc.pinned);
    mark(row.part, 'data-preview', doc.preview);
    // The icon is shown again only when it is another one.
    if (row.icon !== doc.icon) {
      row.release();
      row.release = () => {};
      if (doc.icon && !row.iconHolder) {
        row.iconHolder = partBefore<HTMLSpanElement>(row.open, row.text, 'span', 'mx-tabdocs__icon');
        row.iconHolder.attr.add({ 'aria-hidden': 'true' });
      }
      if (doc.icon && row.iconHolder) row.release = showIcon(doc.icon, row.iconHolder);
      row.icon = doc.icon;
    }
    if (row.iconHolder) kept(row.iconHolder, !!doc.icon);
    writeText(row.title, doc.title);
    if (doc.description && !row.description) {
      row.gap = part<HTMLSpanElement>(row.text, 'span', '');
      writeText(row.gap, ' ');
      row.description = part<HTMLSpanElement>(row.text, 'span', 'mx-tabdocs__list-description');
    }
    if (row.description && row.gap) {
      if (doc.description) writeText(row.description, doc.description);
      kept(row.gap, !!doc.description);
      kept(row.description, !!doc.description);
    }
    const states: string[] = [];
    if (doc.pinned && !row.pin) {
      row.pin = partBefore<HTMLSpanElement>(row.open, row.dirty ?? row.states, 'span', 'mx-tabdocs__list-pin');
      row.pin.attr.add({ 'aria-hidden': 'true' });
      glyphPart(row.pin, 'pin');
    }
    if (row.pin) kept(row.pin, doc.pinned);
    if (doc.pinned) states.push(m.textOf('tabDocsPinState'));
    if (doc.dirty && !row.dirty) {
      row.dirty = partBefore<HTMLSpanElement>(row.open, row.states, 'span', 'mx-tabdocs__list-dirty');
      row.dirty.attr.add({ 'aria-hidden': 'true' });
    }
    if (row.dirty) kept(row.dirty, doc.dirty);
    if (doc.dirty) states.push(m.textOf('tabDocsUnsaved'));
    if (states.length && !row.states) row.states = part<HTMLSpanElement>(row.open, 'span', 'mx-tabdocs__hidden');
    if (row.states) {
      if (states.length) writeText(row.states, `, ${states.join(', ')}`);
      kept(row.states, states.length > 0);
    }
    put(row.close, 'aria-label', m.textOf(doc.closable ? 'tabDocsCloseActive' : 'tabDocsHideActive', { title: doc.title }));
    mark(row.close, 'disabled', !m.mayCloseOrHide(doc));
    return row;
  }

  /** A document's row with the parts every row has; `rowOf` writes them. */
  private makeRow(doc: TabDocument): Row {
    const rowPart = loose<HTMLLIElement>('li', 'mx-tabdocs__list-row');
    const openPart = part<HTMLButtonElement>(rowPart, 'button', 'mx-tabdocs__list-open');
    openPart.attr.add({ type: 'button' });
    const text = part<HTMLSpanElement>(openPart, 'span', 'mx-tabdocs__list-text');
    const title = part<HTMLSpanElement>(text, 'span', 'mx-tabdocs__list-title');
    const closePart = part<HTMLButtonElement>(rowPart, 'button', 'mx-tabdocs__list-close');
    closePart.attr.add({ type: 'button' });
    glyphPart(closePart, 'dismiss');
    const row: Row = {
      part: rowPart,
      open: openPart,
      close: closePart,
      release: () => {},
      look: '',
      shown: true,
      text,
      title,
      gap: null,
      description: null,
      iconHolder: null,
      icon: undefined,
      pin: null,
      dirty: null,
      states: null,
    };
    this.rows.set(doc, row);
    return row;
  }

  private filter(): void {
    const q = this.query;
    let any = false;
    for (const [group, part] of this.lists) {
      let shown = 0;
      for (const doc of group.documents) {
        const row = this.rows.get(doc);
        if (!row) continue;
        const hit = !q || foldText(doc.title).includes(q) || foldText(doc.description ?? '').includes(q);
        row.shown = hit;
        mark(row.part, 'hidden', !hit);
        if (hit) shown++;
      }
      part.shown = shown > 0;
      mark(part.section, 'hidden', !part.shown);
      any ||= part.shown;
    }
    mark(this.empty, 'hidden', any);
  }

  /** One row is a Tab stop: the active document's, else the first shown. */
  private renderRoving(): void {
    const rows = this.visibleRows();
    const active = this.presenter.phoneDocument;
    const stop = rows.find((row) => isFocused(row.open)) ?? (active && this.rows.get(active)) ?? rows[0];
    for (const row of this.rows.values()) put(row.open, 'tabindex', row === stop ? '0' : '-1');
  }

  /** The rows the search shows, in their order on the screen. */
  private visibleRows(): Row[] {
    const sections = [...this.lists.values()];
    const rows = [...this.rows.values()];
    const visible: Row[] = [];
    for (const c of this.sectionsPart.controls.items) {
      const section = sections.find((s) => s.section === c);
      if (!section?.shown) continue;
      for (const item of section.list.controls.items) {
        const row = rows.find((r) => r.part === item);
        if (row?.shown) visible.push(row);
      }
    }
    return visible;
  }

  /** The document whose row an event started in, `null` when none. */
  private docOf(e: Event): TabDocument | null {
    for (const [doc, row] of this.rows) if (row.part.motif.isEventFrom(e)) return doc;
    return null;
  }

  private listen(): void {
    const s = this.sectionsPart;
    s.motif.on('click', (_, e) => {
      const doc = this.docOf(e);
      if (!doc) return;
      if (this.rows.get(doc)?.close.motif.isEventFrom(e)) untracked(() => void this.closeDocument(doc));
      else untracked(() => this.choose(doc));
    });
    s.motif.on('keydown', (_, e) => untracked(() => this.key(e)));
    s.motif.on('contextmenu', (_, e) => {
      const doc = this.docOf(e);
      if (!doc || !doc.group) return;
      e.preventDefault();
      // A finger's long press: the lift and its drop handle it.
      if (this.gesture || this.dragged) return;
      untracked(() => this.manager.openDocumentSheet(doc, doc.group!, e.button !== 2 && e.clientX === 0 && e.clientY === 0, this.rows.get(doc)?.open ?? null));
    });
    // The touchmove listener is there before a finger lands: only then can a swipe or a drag keep the list still.
    s.motif.on('touchstart:passive', (_, e: TouchEvent | undefined) => e && this.touchStart(e));
    s.motif.on('touchmove', (_, e: TouchEvent | undefined) => e && this.touchMove(e));
    s.motif.on('touchend', (_, e: TouchEvent | undefined) => e && this.touchEnd(e));
    s.motif.on('touchcancel', (_, e: TouchEvent | undefined) => e && this.touchEnd(e));
  }

  /** A document chosen: the list closes and the phone shows it. */
  private choose(doc: TabDocument): void {
    this.sheet.close('code');
    this.manager.activateFromList(doc);
  }

  private async closeDocument(doc: TabDocument): Promise<void> {
    const row = this.rows.get(doc);
    const next = row ? this.neighbour(row, 1) ?? this.neighbour(row, -1) : null;
    const closed = await this.manager.closeOrHideFromList(doc);
    if (!closed && row) css(row.part, 'translate', '');
    if (closed && next) focusOn(next.open, { preventScroll: true });
  }

  private neighbour(row: Row, by: 1 | -1): Row | null {
    const rows = this.visibleRows();
    return rows[rows.indexOf(row) + by] ?? null;
  }

  private key(e: KeyboardEvent): void {
    const doc = this.docOf(e);
    const row = doc ? this.rows.get(doc) : undefined;
    if (!doc || !row || e.ctrlKey || e.metaKey) return;
    const rows = this.visibleRows();
    const at = rows.indexOf(row);
    const go = (i: number) => {
      const next = rows[Math.max(0, Math.min(rows.length - 1, i))];
      if (!next) return;
      for (const r of this.rows.values()) put(r.open, 'tabindex', '-1');
      put(next.open, 'tabindex', '0');
      focusOn(next.open);
    };
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      this.moveBy(doc, e.key === 'ArrowUp' ? -1 : 1);
      const moved = this.rows.get(doc);
      if (moved) focusOn(moved.open);
      return;
    }
    if (e.altKey) return;
    switch (e.key) {
      case 'ArrowDown':
        go(at + 1);
        break;
      case 'ArrowUp':
        go(at - 1);
        break;
      case 'Home':
        go(0);
        break;
      case 'End':
        go(rows.length - 1);
        break;
      case 'Delete':
        void this.closeDocument(doc);
        break;
      case 'ContextMenu':
        if (doc.group) this.manager.openDocumentSheet(doc, doc.group, true, row.open);
        break;
      case 'F10':
        if (!e.shiftKey) return;
        if (doc.group) this.manager.openDocumentSheet(doc, doc.group, true, row.open);
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  /** Moves a document one place up or down its group; past an end, into the group before or after. */
  private moveBy(doc: TabDocument, by: 1 | -1): void {
    const group = doc.group;
    if (!group) return;
    const groups = this.presenter.listGroups();
    const at = group.documents.indexOf(doc);
    const to = at + by;
    if (to >= 0 && to < group.documents.length) {
      this.manager.moveFromList(doc, group, to);
      return;
    }
    const other = groups[groups.indexOf(group) + by];
    if (other) this.manager.moveFromList(doc, other, by > 0 ? 0 : other.documents.length);
  }

  // The finger.

  private touchStart(e: TouchEvent): void {
    if (e.touches.length !== 1 || this.gesture || this.dragged) return;
    const doc = this.docOf(e);
    const row = doc ? this.rows.get(doc) : undefined;
    if (!doc || !row || row.close.motif.isEventFrom(e)) return;
    const t = e.touches[0];
    const tracker = new SwipeTracker();
    tracker.start(t.clientX, t.clientY);
    const gesture: Gesture = { id: t.identifier, doc, row, x: t.clientX, y: t.clientY, mode: 'wait', timer: undefined, tracker, from: null, point: null, boxes: null, stopScroll: null };
    gesture.timer = setTimeout(() => untracked(() => this.lift(gesture)), this.manager.longPressDelay);
    this.gesture = gesture;
  }

  /** The long press: the row lifts and follows the finger up and down. */
  private lift(gesture: Gesture): void {
    if (this.gesture !== gesture || gesture.mode !== 'wait') return;
    if (!this.manager.mayMoveFromList(gesture.doc)) {
      // A document that may not move: the long press opens its commands.
      this.endGesture();
      if (gesture.doc.group) this.manager.openDocumentSheet(gesture.doc, gesture.doc.group, false, gesture.row.open);
      return;
    }
    gesture.mode = 'drag';
    gesture.from = { list: gesture.row.part.parent!, next: nextOf(gesture.row.part) };
    this.dragged = gesture;
    const owner = this.sectionsPart;
    gesture.boxes = new DragBoxes(owner, () => this.aimParts(gesture));
    // Near an end of the list, it scrolls; the row under the finger may change then.
    const moved = () => {
      gesture.boxes?.moved();
      measure(owner, this.readAim, this.drawAim);
    };
    gesture.stopScroll = autoScroll(owner, this.sheet.contentPart, () => (this.dragged === gesture ? gesture.point : null), moved, { axis: 'y', zone: 48, speed: 12 });
    if (!gesture.row.part.isDisposed) mark(gesture.row.part, 'data-lifted', true);
    if (!this.sectionsPart.isDisposed) mark(this.sectionsPart, 'data-dragging', true);
  }

  private touchMove(e: TouchEvent): void {
    const g = this.gesture;
    const t = g && Array.from(e.changedTouches).find((c) => c.identifier === g.id);
    if (!g || !t) return;
    g.tracker.move(t.clientX, t.clientY);
    const dx = t.clientX - g.x;
    const dy = t.clientY - g.y;
    if (g.mode === 'wait') {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      clearTimeout(g.timer);
      g.mode = Math.abs(dx) > Math.abs(dy) && this.manager.mayCloseOrHide(g.doc) ? 'swipe' : 'scroll';
      if (g.mode === 'swipe' && !g.row.part.isDisposed) mark(g.row.part, 'data-swiping', true);
    }
    if (g.mode === 'scroll') return;
    if (e.cancelable) e.preventDefault();
    if (g.mode === 'swipe') {
      css(g.row.part, 'translate', `${Math.round(dx)}px 0`);
      return;
    }
    g.point = { x: t.clientX, y: t.clientY };
    measure(this.sectionsPart, this.readAim, this.drawAim);
  }

  /** What a drag can aim at, front first: the other rows the search shows, then the sections. */
  private aimParts(g: Gesture): ComponentBase[] {
    const rows = [...this.rows.values()].filter((row) => row !== g.row && row.shown).map((row) => row.part);
    const sections = [...this.lists.values()].filter((s) => s.shown).map((s) => s.section);
    return [...rows, ...sections];
  }

  /** The row or the section under the finger: the lifted row goes before or after that row, or into that section. */
  private readonly readAim = (): Aim | null => {
    const g = this.dragged;
    if (!g?.point || !g.boxes) return null;
    const hit = g.boxes.at(g.point);
    const row = [...this.rows.values()].find((r) => r.part === hit) ?? null;
    if (row) return { gesture: g, row, after: shareAlong(row.part, g.point, 'y') > 0.5, list: null };
    const list = [...this.lists.values()].find((s) => s.section === hit)?.list ?? null;
    return { gesture: g, row: null, after: false, list };
  };

  private readonly drawAim = (aim: Aim | null): void => {
    const g = this.dragged;
    if (!aim || aim.gesture !== g || g.row.part.isDisposed) return;
    const lifted = g.row.part;
    css(lifted, 'translate', '');
    const list = lifted.parent;
    const next = nextOf(lifted);
    const target = aim.row?.part;
    if (target?.parent) placeBefore(target.parent, lifted, aim.after ? nextOf(target) : target);
    else if (aim.list && list !== aim.list) aim.list.controls.add(lifted);
    if (lifted.parent !== list || nextOf(lifted) !== next) g.boxes?.moved();
  };

  private touchEnd(e: TouchEvent): void {
    const g = this.gesture;
    const t = g && Array.from(e.changedTouches).find((c) => c.identifier === g.id);
    if (!g || !t) return;
    const canceled = e.type === 'touchcancel';
    // Read before anything is written.
    const width = g.mode === 'swipe' ? boxOf(g.row.part).width : 0;
    this.endGesture();
    if (g.mode === 'swipe') {
      e.preventDefault();
      if (!g.row.part.isDisposed) mark(g.row.part, 'data-swiping', false);
      const dx = t.clientX - g.x;
      const speed = g.tracker.velocity('x');
      const far = Math.abs(dx) > width * 0.35 || Math.abs(speed) > 0.5;
      if (!canceled && far) {
        css(g.row.part, 'translate', `${dx < 0 ? -100 : 100}% 0`);
        untracked(() => void this.closeDocument(g.doc));
      } else {
        css(g.row.part, 'translate', '');
      }
      return;
    }
    if (g.mode === 'drag') {
      e.preventDefault();
      // The finger's last move is placed first.
      void whenMeasured(this.sectionsPart).then(() => untracked(() => this.drop(g, canceled)));
    }
    // Let go before the long press: a tap, which the click that follows handles.
  }

  private endGesture(): void {
    const g = this.gesture;
    if (!g) return;
    clearTimeout(g.timer);
    this.gesture = null;
    g.stopScroll?.();
    if (!g.row.part.isDisposed) mark(g.row.part, 'data-lifted', false);
    if (!this.sectionsPart.isDisposed) mark(this.sectionsPart, 'data-dragging', false);
  }

  /** The lifted row let go: where it is now is where the document goes; not moved, its commands open. */
  private drop(g: Gesture, canceled: boolean): void {
    if (this.dragged !== g) return;
    this.dragged = null;
    g.boxes?.stop();
    const row = g.row.part;
    const from = g.from;
    const moved = !!from && (row.parent !== from.list || nextOf(row) !== from.next);
    if (canceled || !moved) {
      if (from && moved) placeBefore(from.list, row, from.next);
      this.render();
      if (!canceled && g.doc.group) this.manager.openDocumentSheet(g.doc, g.doc.group, false, g.row.open);
      return;
    }
    const list = row.parent;
    const group = [...this.lists].find(([, section]) => section.list === list)?.[0];
    const index = list ? list.controls.items.indexOf(row) : -1;
    if (group) this.manager.moveFromList(g.doc, group, index);
    this.render();
    const dropped = this.rows.get(g.doc);
    if (dropped) focusOn(dropped.open, { preventScroll: true });
  }
}
