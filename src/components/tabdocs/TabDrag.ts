import { ComponentBase, untracked } from '@motifx/core';
import { windowOfEvent } from '../../core/focus';
import { boxOf, isRendered, measure, rectOf, scrollTo, whenMeasured, type Rect } from '../../core/measure';
import { windowOf } from '../../core/page-documents';
import { onWindow } from '../../core/window-events';
import { isApplePlatform } from '../../core/platform';
import { mark, put } from '../../core/part-writes';
import { windowStack } from '../../core/window-stack';
import { autoScroll } from '../../parts/drag/auto-scroll';
import { DragGhost } from '../../parts/drag/DragGhost';
import type { DocumentTab } from './DocumentTab';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDragSubject } from './tab-drag-subject';
import type { TabDropEventArgs } from './tab-drop-event-args';
import type { TabDropMarks } from './tab-drop-marks';
import type { TabDropPlace } from './tab-drop-place';
import type { TabDropTarget } from './tab-drop-target';
import type { TabGroup } from './TabGroup';
import type { TabRect } from './tab-rect';
import type { TabWindow } from './TabWindow';
import { inViewport, noteOffset, offsetOf } from './screen-offsets';

/** A click on a tab or on a group's empty bar that may become a drag. */
interface Press {
  pointerId: number;
  pointerType: string;
  x: number;
  y: number;
  /** The document pressed in: the main window's, or a new window's. */
  space: Document;
  subject: TabDragSubject;
  /** The part pressed: the tab, or the group's bar. */
  source: ComponentBase;
  /** Touch and pen: the long press that starts the drag. */
  timer: ReturnType<typeof setTimeout> | undefined;
}

interface Session {
  subject: TabDragSubject;
  /** The part the pointer pressed: the tab, or the group's bar; `null` for "Move to…". */
  source: ComponentBase | null;
  /** What shows it is dragged: the tab, or the group; `null` for a window moved, which shows it itself. */
  dragged: ComponentBase | null;
  pointerId: number;
  pointerType: string;
  byKeyboard: boolean;
  /** The pointer, in the viewport of the window the drag started in (`space`). */
  x: number;
  y: number;
  space: Document;
  /** Where it aims: a point of the viewport of `space` (another window's when the pointer went past the edge into it). */
  aim: { space: Document; x: number; y: number };
  start: { x: number; y: number };
  /** The pointer went past the threshold since the drag started (a long press may not). */
  moved: boolean;
  place: TabDropPlace | null;
  target: TabDropTarget | null;
  /** The manager showing the marks now, and in which window. */
  shownIn: TabDocumentManager | null;
  shownSpace: Document | null;
  hover: { tab: DocumentTab; timer: ReturnType<typeof setTimeout> } | null;
  /** What was active in the groups hovering changed, and the active group: Escape puts them back. */
  was: Map<TabGroup, TabDocument | null>;
  wasGroup: TabGroup | null;
  /** The rows the strips scrolled on, and where each one started. */
  scrolls: Map<ComponentBase, number>;
  /** The row near whose end the pointer is, read at the last frame, and how far it was scrolled. */
  edge: { row: ComponentBase; start: number } | null;
  /** What stops the strips scrolling near their ends. */
  stopEdge: (() => void) | null;
  /** The aim asked for the next frame and not made yet: what takes it back. */
  asked: (() => void) | null;
  /** A window moved: where it was. */
  windowStart: TabRect | null;
  /** The managers whose targets were told where the pointer is. */
  followed: Set<TabDocumentManager>;
  modifiers: { ctrlKey: boolean; altKey: boolean; shiftKey: boolean; metaKey: boolean };
}

/** What a frame read for the drag: the place under the pointer, and the tab it rests on. */
interface AimRead {
  session: Session;
  place: TabDropPlace | null;
  target: TabDropTarget | null;
  tab: DocumentTab | null;
  marks: TabDropMarks | null;
}

interface MarksRead {
  session: Session;
  place: TabDropPlace | null;
  marks: TabDropMarks | null;
}

const OUTSIDE: TabDropPlace = { target: 'outside', manager: null, group: null, index: -1, side: null };

/**
 * Dragging in a manager: a tab, or a whole group by its empty bar, with the mouse, or after a long
 * press on a touch screen or with a pen. A copy of the tab follows the pointer; the manager under it
 * (this one, or one of the same `dragGroup`) shows where a drop would land. "Move to…" uses the same
 * session from the keyboard. Inside a new browser window it works the same; the pointer stays with
 * a drag that leaves its window, and the window under it there (its place on the screen says which)
 * takes the drop, or past every window a new one opens there.
 */
export class TabDrag {
  private press: Press | null = null;
  private session: Session | null = null;
  private readonly ghost: DragGhost;
  private readonly stops: (() => void)[] = [];

  constructor(private readonly manager: TabDocumentManager) {
    this.ghost = new DragGhost(() => (this.session ? manager.hostIn(this.session.space) : manager), () => manager.dragGhost, 'mx-tabdocs__ghost');
    this.listen(manager);
  }

  /** Drags start from the strips under `root`: the manager, or a new window's part. Returns the function that stops it. */
  listen(root: ComponentBase): () => void {
    const down = (_: ComponentBase, e: PointerEvent) => untracked(() => this.pointerDown(e));
    // A long press on a touch screen drags; the context menu opens when it is let go unmoved.
    const menu = (_: ComponentBase, e: MouseEvent) => {
      const s = this.session;
      if ((this.press && this.press.pointerType !== 'mouse') || (s && !s.byKeyboard)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    void root.motif.on('pointerdown', down);
    void root.motif.on('contextmenu:capture', menu);
    return () => {
      void root.motif.off('pointerdown', down);
      void root.motif.off('contextmenu:capture', menu);
    };
  }

  /** A touchmove in a bar: once a long press drags, the finger moves the tab, not the strip or the page. */
  holdTouch(e: TouchEvent): void {
    if (this.session && !this.session.byKeyboard && e.cancelable) e.preventDefault();
  }

  /** What is being dragged now. */
  get subject(): TabDragSubject | null {
    return this.session?.subject ?? null;
  }

  // The session, for the pointer and the keys.

  /** Starts a drag: `onDragStarting` may cancel it. From the keys, `from` is the tab's part or the group: the window the move starts in. */
  begin(subject: TabDragSubject, pointerType: string, from: ComponentBase | null, x = 0, y = 0, pointerId = -1, space?: Document): boolean {
    const m = this.manager;
    if (this.session) return false;
    space ??= spaceOf(from ?? m);
    const byKeyboard = pointerType === 'keyboard';
    const e = { document: subject.document, group: subject.group, pointerType, byKeyboard, cancel: false, source: m };
    m.dragStarting(e);
    if (e.cancel) return false;
    const w = subject.window ?? null;
    if (w && !m.windowChanging('moveWindow', w, !byKeyboard)) return false;
    const dragged = subject.document ? (subject.group.tabs.find((t) => t.document === subject.document)?.headerPart ?? null) : w ? null : subject.group;
    this.session = {
      subject,
      source: null,
      dragged,
      pointerId,
      pointerType,
      byKeyboard,
      x,
      y,
      space,
      aim: { space, x, y },
      start: { x, y },
      moved: false,
      place: null,
      target: null,
      shownIn: null,
      shownSpace: null,
      hover: null,
      was: new Map(),
      wasGroup: m.activeGroup,
      scrolls: new Map(),
      edge: null,
      stopEdge: null,
      asked: null,
      modifiers: { ctrlKey: false, altKey: false, shiftKey: false, metaKey: false },
      windowStart: w ? { ...w.rect } : null,
      followed: new Set(),
    };
    m.dragStarted(subject);
    if (dragged) mark(dragged, 'data-dragging', true);
    w?.markMoving(true);
    return true;
  }

  /**
   * Aims at a place (from a target, or chosen by the keys): `onDragOver` may change or refuse it. `marks` are the
   * place's marks read in the read of a measure; without them they are read here, where the keys aim.
   */
  aim(place: TabDropPlace | null, target: TabDropTarget | null, marks?: TabDropMarks | null): boolean {
    const s = this.session;
    if (!s) return false;
    const m = this.manager;
    s.place = null;
    s.target = null;
    let known = marks;
    if (place) {
      const e = this.args(place, place.target === 'outside');
      m.dragOver(e);
      s.subject.copy = e.copy && m.mayCopyDocument(s.subject.document);
      const chosen: TabDropPlace = { target: e.target, manager: e.manager, group: e.group, index: e.index, side: e.side, dockSide: e.dockSide ?? null, rect: e.rect ?? null };
      // Outside is only reported, for now.
      if (!e.cancel && chosen.target !== 'outside') {
        s.place = chosen;
        s.target = chosen.target === place.target && chosen.manager === place.manager ? target : this.targetFor(chosen);
      }
      // A place `onDragOver` changed has other marks: in a write they come with the next round.
      if (known !== undefined && s.place && !samePlace(s.place, place)) {
        known = null;
        measure(this.ownerOf(s), this.readMarks, this.drawMarks);
      }
    }
    this.paint(known);
    return !!s.place;
  }

  /** Ends the drag: drops where it aims (`onDropping` may stop it), or puts everything back. */
  finish(drop: boolean, quiet = false): boolean {
    const s = this.session;
    if (!s) return false;
    const m = this.manager;
    // A drop moves the page: focus leaves before the drag's own marks go, while the page is as drawn, and comes back
    // once it is drawn again (into a new window or the main one, that window takes it).
    const toWindow = s.place?.target === 'new-window' || s.place?.target === 'main-window';
    if (drop && s.place && s.target && !toWindow) m.parkFocus();
    this.session = null;
    this.release();
    clearTimeout(s.hover?.timer);
    s.asked?.();
    s.stopEdge?.();
    this.ghost.hide();
    if (s.shownIn && s.shownSpace) s.shownIn.marksIn(s.shownSpace).hide();
    for (const peer of s.followed) for (const t of peer.dropTargets) t.follow?.(null, s.subject);
    s.subject.window?.markMoving(false);
    if (s.dragged && !s.dragged.isDisposed) mark(s.dragged, 'data-dragging', false);
    for (const peer of m.dragPeers()) {
      for (const host of peer.hostParts()) put(host, 'data-dragging', null);
      peer.dragSpace = null;
    }
    let dropped = false;
    if (drop && s.place && s.target) {
      const e = this.args(s.place, false, s);
      m.dropping(e);
      const place: TabDropPlace = { target: e.target, manager: e.manager, group: e.group, index: e.index, side: e.side, dockSide: e.dockSide ?? null, rect: e.rect ?? null };
      const target = place.target === s.place.target && place.manager === s.place.manager ? s.target : this.targetFor(place);
      s.subject.copy = e.copy && m.mayCopyDocument(s.subject.document);
      if (!e.cancel && target) dropped = untracked(() => target.drop(place, s.subject));
      if (dropped) m.dropped(place, s.subject, s.byKeyboard);
    }
    if (!dropped) {
      this.putBack(s);
      if (!quiet) m.announceCanceled();
    }
    m.dragEnded({ document: s.subject.document, from: s.subject.group, dropped, byKeyboard: s.byKeyboard, source: m });
    m.settleFocus();
    return dropped;
  }

  /** Stops a drag (or a click that may become one); `quiet` says nothing. */
  cancel(quiet = false): void {
    this.press = null;
    this.release();
    this.finish(false, quiet);
  }

  // The pointer.

  private pointerDown(e: PointerEvent): void {
    const m = this.manager;
    if (this.press || this.session || !m.isEnabled) return;
    const pointerType = e.pointerType || 'mouse';
    if ((pointerType === 'mouse' && e.button !== 0) || e.isPrimary === false) return;
    const found = this.subjectAt(e);
    if (!found) return;
    // The window pressed in: a new window has its own events.
    const view = windowOfEvent(e) ?? window;
    const space = view.document;
    noteOffset(view, e);
    const press: Press = { pointerId: e.pointerId, pointerType, x: e.clientX, y: e.clientY, space, subject: found.subject, source: found.source, timer: undefined };
    this.press = press;
    if (pointerType !== 'mouse') press.timer = setTimeout(() => untracked(() => this.longPress(press)), m.longPressDelay);
    const move = (ev: PointerEvent) => untracked(() => this.pointerMove(ev, view));
    const up = (ev: PointerEvent) => untracked(() => this.pointerUp(ev, view));
    const key = (ev: KeyboardEvent) => untracked(() => this.key(ev));
    // The drag goes on past its window: the window of the part pressed is listened to while it runs.
    const from = found.source;
    const listening = [
      onWindow(from, 'pointermove', move),
      onWindow(from, 'pointerup', up),
      onWindow(from, 'pointercancel', up),
      onWindow(from, 'keydown', key, true),
      onWindow(from, 'keyup', key, true),
    ];
    this.stops.push(() => {
      clearTimeout(press.timer);
      for (const stop of listening) stop();
    });
  }

  /** The document of a tab, or the group of an empty bar, that a press there would drag, and the part pressed. */
  private subjectAt(e: PointerEvent): { subject: TabDragSubject; source: ComponentBase } | null {
    const m = this.manager;
    const group = m.groups.find((g) => g.motif.isEventFrom(e));
    if (!group || group.isScrollButtonEvent(e)) return null;
    // A tab's pin and close marks are buttons of their own.
    const strip = group.stripTabOfEvent(e);
    if (strip && (strip.isCloseEvent(e) || strip.isPinEvent(e))) return null;
    const tab = group.tabOfEvent(e);
    if (tab) return m.mayDrag(tab.document) ? { subject: { document: tab.document, group, manager: m, copy: false }, source: tab.headerPart } : null;
    if (!group.isStripSpaceEvent(e) && !group.isGripEvent(e)) return null;
    // A floating window's strips are its title: the window moves with everything in it.
    const w = group.window;
    if (w) return w.isMaximized ? null : { subject: { document: null, group, manager: m, copy: false, window: w }, source: group.barPart };
    return m.allowDragGroups ? { subject: { document: null, group, manager: m, copy: false }, source: group.barPart } : null;
  }

  private longPress(press: Press): void {
    if (this.press === press) this.start(press, null);
  }

  /** The press became a drag: by moving past the threshold (`e`), or by a long press. */
  private start(press: Press, e: PointerEvent | null): void {
    this.press = null;
    clearTimeout(press.timer);
    if (!this.begin(press.subject, press.pointerType, null, press.x, press.y, press.pointerId, press.space)) {
      this.release();
      return;
    }
    const s = this.session!;
    s.source = press.source;
    if (e) {
      s.x = e.clientX;
      s.y = e.clientY;
      s.modifiers = e;
      s.moved = true;
    }
    // A pointer that is gone already is skipped: the window listeners still follow it.
    press.source.attr.add({ setPointerCapture: press.pointerId });
    // A window moved is its own picture.
    if (!press.subject.window) {
      const source = press.subject.document ? press.source : press.subject.group.listPart;
      this.ghost.show(source, s.x, s.y, press.subject.document ? 'tab' : 'group');
    }
    // Near the ends of a strip that does not fit, the strip scrolls, faster the nearer the end.
    s.stopEdge = autoScroll(this.ownerOf(s), () => this.edgeRow(s), () => (this.session === s ? s.aim : null), () => this.scrolled(s), {
      axis: 'x',
      zone: (room) => Math.min(48, room / 4),
      speed: 12,
    });
    this.track();
  }

  private pointerMove(e: PointerEvent, view: Window): void {
    noteOffset(view, e);
    const s = this.session;
    if (s) {
      if (s.byKeyboard || e.pointerId !== s.pointerId) return;
      s.x = e.clientX;
      s.y = e.clientY;
      s.modifiers = e;
      if (Math.max(Math.abs(s.x - s.start.x), Math.abs(s.y - s.start.y)) >= this.manager.dragThreshold) s.moved = true;
      this.track();
      return;
    }
    const press = this.press;
    if (!press || e.pointerId !== press.pointerId) return;
    if (Math.max(Math.abs(e.clientX - press.x), Math.abs(e.clientY - press.y)) < this.manager.dragThreshold) return;
    // A finger that moves before the long press is over scrolls the strip.
    if (press.pointerType !== 'mouse') {
      this.press = null;
      this.release();
      return;
    }
    this.start(press, e);
  }

  private pointerUp(e: PointerEvent, view: Window): void {
    noteOffset(view, e);
    const s = this.session;
    if (s && !s.byKeyboard) {
      if (e.pointerId !== s.pointerId) return;
      if (e.type === 'pointercancel') {
        this.finish(false);
        return;
      }
      if (s.pointerType !== 'mouse' && !s.moved) {
        // Held still and let go: the tab's menu, as a long press does elsewhere.
        const { x, y, source, subject } = s;
        this.finish(false, true);
        if (source) this.manager.openMenuAt(subject, x, y, source);
        return;
      }
      this.swallowClick();
      // Let go somewhere else, or with the copy key now held or not: aim there first.
      const copy = this.copyHeld(e) && this.manager.mayCopyDocument(s.subject.document);
      if (e.clientX !== s.x || e.clientY !== s.y || copy !== s.subject.copy) {
        s.x = e.clientX;
        s.y = e.clientY;
        s.modifiers = e;
        this.track();
      }
      if (!s.asked) {
        this.finish(true);
        return;
      }
      // The place under the last point is read with the next frame: the drop waits for it.
      this.release();
      s.stopEdge?.();
      void whenMeasured(this.ownerOf(s)).then(() =>
        untracked(() => {
          if (this.session === s) this.finish(true);
        }),
      );
      return;
    }
    if (this.press && e.pointerId === this.press.pointerId) {
      this.press = null;
      this.release();
    }
  }

  private key(e: KeyboardEvent): void {
    const s = this.session;
    if (!s || s.byKeyboard) {
      if (e.key === 'Escape' && this.press) {
        this.press = null;
        this.release();
      }
      return;
    }
    if (e.type === 'keydown' && e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.finish(false);
      return;
    }
    // The copy key pressed or let go while dragging.
    s.modifiers = e;
    this.track();
  }

  /** The pointer moved, or the copy key changed: a window moved follows at once; the aim and the hover come with the next frame. */
  private track(): void {
    const s = this.session;
    if (!s || s.byKeyboard) return;
    const m = this.manager;
    s.subject.copy = this.copyHeld(s.modifiers) && m.mayCopyDocument(s.subject.document);
    const w = s.subject.window;
    if (w && s.windowStart) {
      w.place({ ...s.windowStart, x: s.windowStart.x + s.x - s.start.x, y: s.windowStart.y + s.y - s.start.y });
      m.keepWindowInView(w);
    }
    s.asked = measure(this.ownerOf(s), this.readAim, this.drawAim);
  }

  private readonly readAim = (): AimRead | null => {
    const s = this.session;
    if (!s || s.byKeyboard) return null;
    const { place, target } = this.find(s.x, s.y);
    const marks = place && target && place.target !== 'outside' ? target.marks(place, s.subject) : null;
    return { session: s, place, target, tab: this.tabAt(place, s.aim.x, s.aim.y), marks };
  };

  private readonly drawAim = (read: AimRead | null): void => {
    if (!read || this.session !== read.session) return;
    read.session.asked = null;
    this.aim(read.place, read.target, read.marks);
    this.hover(read.tab);
  };

  /** The marks of a place `onDragOver` chose in a write, read with the next round's reads. */
  private readonly readMarks = (): MarksRead | null => {
    const s = this.session;
    if (!s) return null;
    const place = s.place;
    return { session: s, place, marks: place && s.target ? s.target.marks(place, s.subject) : null };
  };

  private readonly drawMarks = (read: MarksRead | null): void => {
    if (!read || this.session !== read.session || read.session.place !== read.place) return;
    this.paint(read.marks);
  };

  /** Where the drag's frames are read: the window it started in. */
  private ownerOf(s: Session): ComponentBase {
    return this.manager.hostIn(s.space);
  }

  /**
   * The place under the pointer: the targets of the manager it is over (or of the manager of the
   * floating window it is over: windows lie above everything), else floating, else outside. Past
   * the edge of its window, the point is looked for in the other windows, by its place on the
   * screen; past every one, it is a new window there (or, from a new window, the main window).
   */
  private find(px: number, py: number): { place: TabDropPlace | null; target: TabDropTarget | null } {
    const s = this.session!;
    const m = this.manager;
    let space = s.space;
    let x = px;
    let y = py;
    const view = space.defaultView;
    if (view && !s.byKeyboard && !s.subject.window && !inViewport(view, x, y)) {
      const at = offsetOf(view);
      const other = this.windowAt(x + at.x, y + at.y, space);
      if (other) ({ space, x, y } = other);
      else {
        s.aim = { space, x, y };
        const out = this.outPlace(x + at.x, y + at.y);
        if (out) return { place: out, target: this.targetFor(out) };
      }
    }
    s.aim = { space, x, y };
    for (const peer of this.peers()) peer.dragSpace = space;
    const over = this.managerAt(x, y, space);
    for (const peer of this.peers()) {
      if (peer !== over && !s.followed.has(peer)) continue;
      for (const t of peer.dropTargets) t.follow?.(peer === over ? { x, y } : null, s.subject);
      if (peer === over) s.followed.add(peer);
      else s.followed.delete(peer);
    }
    if (over) {
      for (const target of over.dropTargets) {
        const place = target.placeAt(x, y, s.subject);
        if (place) return { place, target };
      }
      return { place: null, target: null };
    }
    const main = space === spaceOf(m);
    const float =!main || m.foreignAt(x, y) ? null : m.floatPlace(s.subject, x, y);
    return float ? { place: float, target: this.targetFor(float) } : { place: OUTSIDE, target: null };
  }

  /** The window whose viewport holds a point of the screen (the one focused last, where they lie on each other), and the point in it. */
  private windowAt(sx: number, sy: number, except: Document): { space: Document; x: number; y: number } | null {
    for (const { doc } of this.manager.spaces()) {
      const view = doc.defaultView;
      if (doc === except || !view || view.closed) continue;
      const at = offsetOf(view);
      if (inViewport(view, sx - at.x, sy - at.y)) return { space: doc, x: sx - at.x, y: sy - at.y };
    }
    return null;
  }

  /** Past the edge of every window: into a new window there, or from a new window back to the main window. */
  private outPlace(sx: number, sy: number): TabDropPlace | null {
    const s = this.session!;
    const m = this.manager;
    if (!untracked(() => m.dragOutToNewWindow) || s.subject.manager !== m) return null;
    const base = { manager: m, group: null, index: -1, side: null } as const;
    if (s.space !== spaceOf(m)) return { ...base, target: 'main-window' };
    if (!m.mayNewWindow(s.subject)) return null;
    const box = rectOf(s.subject.group);
    const size = untracked(() => m.newWindowSize);
    const width = Math.round(size?.width ?? (box.width > 0 ? box.width : 640));
    const height = Math.round(size?.height ?? (box.height > 0 ? box.height : 480));
    return { ...base, target: 'new-window', rect: { x: Math.round(sx - Math.min(48, width / 4)), y: Math.round(sy - 16), width, height } };
  }

  /** The managers a drag may drop in: those of its `dragGroup`; a window moved stays with its own. */
  private peers(): TabDocumentManager[] {
    return this.session?.subject.window ? [this.manager] : this.manager.dragPeers();
  }

  /** The manager under a point: the one of the front window there, else the one whose box holds it; in a new window, its manager. */
  private managerAt(x: number, y: number, space: Document): TabDocumentManager | null {
    const s = this.session!;
    const peers = this.peers();
    if (space !== spaceOf(this.manager)) return peers.find((m) => m.hostIn(space) !== m) ?? null;
    const windows = peers.flatMap((m) => m.windowsFrontFirst()).filter((w) => w !== s.subject.window);
    // A window not in the stack counts as the back one.
    const order = (w: TabWindow) => Math.max(0, windowStack.orderOf(w.part));
    windows.sort((a, b) => order(b) - order(a));
    const front = windows.find((w) => contains(rectOf(w.part), x, y));
    if (front) return front.manager;
    return peers.find((m) => isRendered(m) && contains(rectOf(m), x, y)) ?? null;
  }

  private targetFor(place: TabDropPlace): TabDropTarget | null {
    const owner = place.manager ?? this.manager;
    return owner.dropTargets.find((t) => t.kinds.includes(place.target)) ?? null;
  }

  private args(place: TabDropPlace, cancel: boolean, s: Session = this.session!): TabDropEventArgs {
    return { ...place, document: s.subject.document, from: s.subject.group, copy: s.subject.copy, byKeyboard: s.byKeyboard, cancel, source: this.manager };
  }

  /** Shows the marks where the drag aims, in the manager it aims at, and what a drop would do. */
  private paint(known?: TabDropMarks | null): void {
    const s = this.session!;
    const place = s.place;
    const owner = place?.manager ?? null;
    const marks = !place || !s.target ? null : known !== undefined ? known : s.target.marks(place, s.subject);
    // The marks show in the window the place is in.
    const space = place?.group ? spaceOf(place.group) : place?.browserWindow ? place.browserWindow.window.document : s.aim.space;
    if (s.shownIn && s.shownSpace && (s.shownIn !== owner || s.shownSpace !== space)) s.shownIn.marksIn(s.shownSpace).hide();
    if (owner) owner.marksIn(space).show(marks?.area ?? null, marks?.mark ?? null);
    s.shownIn = owner;
    s.shownSpace = owner ? space : null;
    // The cursor says it over every manager the drag can reach.
    const state = !place ? 'none' : s.subject.copy ? 'copy' : 'move';
    if (!s.byKeyboard) {
      for (const peer of this.manager.dragPeers()) for (const host of peer.hostParts()) put(host, 'data-dragging', state);
    }
    this.ghost.move(s.x, s.y, state);
  }

  /** The tab of a strip under a point, read with the frame's reads. */
  private tabAt(place: TabDropPlace | null, x: number, y: number): DocumentTab | null {
    if (place?.target !== 'strip' || !place.group) return null;
    return place.group.tabs.find((t) => contains(rectOf(t.headerPart), x, y)) ?? null;
  }

  /** Resting on a tab of another group (`under`, as the frame read it) activates it after `dragHoverDelay`. */
  private hover(under: DocumentTab | null): void {
    const s = this.session!;
    const place = s.place;
    const group = place?.target === 'strip' ? place.group : null;
    const tab = under && group && under.group === group && group !== s.subject.group && group.manager.dragHoverActivate && under !== group.activeTab && under.document !== s.subject.document ? under : null;
    if (s.hover?.tab === tab) return;
    clearTimeout(s.hover?.timer);
    s.hover = null;
    if (!tab || !group) return;
    const delay = group.manager.dragHoverDelay;
    const hovered = tab;
    s.hover = {
      tab,
      timer: setTimeout(() => untracked(() => this.hoverActivate(s, hovered)), delay),
    };
  }

  private hoverActivate(s: Session, tab: DocumentTab): void {
    const group = tab.group;
    if (this.session !== s || !group) return;
    s.hover = null;
    if (!s.was.has(group)) s.was.set(group, group.activeDocument);
    group.manager.activateFromDrag(tab.document);
    this.track();
  }

  /** The row of the strip under the pointer, read with the frame's reads: the one that scrolls near its ends. */
  private edgeRow(s: Session): ComponentBase | null {
    s.edge = null;
    if (this.session !== s || !untracked(() => this.manager.dragAutoScroll)) return null;
    const { x, y } = s.aim;
    for (const m of this.peers()) {
      const group = m.groupAt(x, y, s.subject.window ?? null);
      if (!group || !contains(rectOf(group.barPart), x, y)) continue;
      const row = group.rowPart;
      s.edge = { row, start: boxOf(row).scrollStart };
      return row;
    }
    return null;
  }

  /** A strip scrolled on: where it started is kept for a cancel, and the drag aims again. */
  private scrolled(s: Session): void {
    if (this.session !== s) return;
    if (s.edge && !s.scrolls.has(s.edge.row)) s.scrolls.set(s.edge.row, s.edge.start);
    this.track();
  }

  /** Canceled: what hovering activated and the strips scrolling moved go back, and a window moved. */
  private putBack(s: Session): void {
    if (s.subject.window && s.windowStart) s.subject.window.place(s.windowStart);
    for (const [row, start] of s.scrolls) if (!row.isDisposed) scrollTo(row, { start });
    for (const [group, doc] of s.was) if (doc && doc.group === group) group.manager.activateFromDrag(doc);
    if (s.wasGroup && s.was.size) s.wasGroup.manager.useGroupFromDrag(s.wasGroup);
  }

  private copyHeld(e: { ctrlKey: boolean; altKey: boolean; shiftKey: boolean; metaKey: boolean }): boolean {
    switch (this.manager.copyModifier) {
      case 'ctrl':
        return e.ctrlKey;
      case 'alt':
        return e.altKey;
      case 'shift':
        return e.shiftKey;
      case 'meta':
        return e.metaKey;
      case 'none':
        return false;
      default:
        return isApplePlatform() ? e.altKey : e.ctrlKey;
    }
  }

  /** The click that follows a drop is not a click on the tab; the next press is a click again. */
  private swallowClick(): void {
    const m = this.manager;
    const from = this.session ? m.hostIn(this.session.space) : m;
    const swallow = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      stop();
    };
    const listening = [onWindow(from, 'click', swallow, true), onWindow(from, 'pointerdown', () => stop(), true)];
    const stop = () => {
      for (const s of listening) s();
    };
    setTimeout(stop, 0);
  }

  private release(): void {
    for (const stop of this.stops.splice(0)) stop();
  }
}

/** Whether `onDragOver` left the place as the target found it. */
function samePlace(a: TabDropPlace, b: TabDropPlace): boolean {
  return a.target === b.target && a.manager === b.manager && a.group === b.group && a.index === b.index && a.side === b.side && (a.dockSide ?? null) === (b.dockSide ?? null) && (a.rect ?? null) === (b.rect ?? null);
}

function contains(box: Rect, x: number, y: number): boolean {
  return x >= box.left && x < box.right && y >= box.top && y < box.bottom;
}

/** The document a part is in: the main window's, or a new window's. */
function spaceOf(part: ComponentBase): Document {
  return (windowOf(part) ?? window).document;
}
