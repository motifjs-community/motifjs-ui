import { untracked } from '@motifx/core';
import { isApplePlatform } from '../../core/platform';
import { DragGhost } from '../../parts/drag/DragGhost';
import { scrollStep } from '../../parts/drag/scroll-step';
import type { DocumentTab } from './DocumentTab';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDragSubject } from './tab-drag-subject';
import type { TabDropEventArgs } from './tab-drop-event-args';
import type { TabDropPlace } from './tab-drop-place';
import type { TabDropTarget } from './tab-drop-target';
import type { TabGroup } from './TabGroup';
import type { TabRect } from './tab-rect';

/** A press on a tab or on a group's empty bar that may become a drag. */
interface Press {
  pointerId: number;
  pointerType: string;
  x: number;
  y: number;
  subject: TabDragSubject;
  source: HTMLElement;
  /** Touch and pen: the long press that starts the drag. */
  timer: ReturnType<typeof setTimeout> | undefined;
}

interface Session {
  subject: TabDragSubject;
  /** The tab or the bar dragged; `null` for "Move to…". */
  source: HTMLElement | null;
  pointerId: number;
  pointerType: string;
  byKeyboard: boolean;
  x: number;
  y: number;
  start: { x: number; y: number };
  /** The pointer went past the threshold since the drag started (a long press may not). */
  moved: boolean;
  place: TabDropPlace | null;
  target: TabDropTarget | null;
  /** The manager showing the marks now. */
  shownIn: TabDocumentManager | null;
  hover: { tab: DocumentTab; timer: ReturnType<typeof setTimeout> } | null;
  /** What was active in the groups hovering changed, and the active group: Escape puts them back. */
  was: Map<TabGroup, TabDocument | null>;
  wasGroup: TabGroup | null;
  scrolls: Map<HTMLElement, number>;
  frame: number;
  /** A window moved: where it was. */
  windowStart: TabRect | null;
  /** The managers whose targets were told where the pointer is. */
  followed: Set<TabDocumentManager>;
  modifiers: { ctrlKey: boolean; altKey: boolean; shiftKey: boolean; metaKey: boolean };
}

const OUTSIDE: TabDropPlace = { target: 'outside', manager: null, group: null, index: -1, side: null };

/**
 * Dragging in a manager: a tab, or a whole group by its empty bar, with the mouse, or after a long
 * press on a touch screen or with a pen. A copy of the tab follows the pointer; the manager under it
 * (this one, or one of the same `dragGroup`) shows where a drop would land. "Move to…" uses the same
 * session from the keyboard.
 */
export class TabDrag {
  private press: Press | null = null;
  private session: Session | null = null;
  private readonly ghost: DragGhost;
  private readonly stops: (() => void)[] = [];

  constructor(private readonly manager: TabDocumentManager) {
    this.ghost = new DragGhost(() => manager.element, () => manager.dragGhost, 'mx-tabdocs__ghost');
    const el = manager.element;
    el.addEventListener('pointerdown', (e) => untracked(() => this.pointerDown(e)));
    // A long press on a touch screen drags; the context menu opens when it is let go unmoved.
    el.addEventListener(
      'contextmenu',
      (e) => {
        const s = this.session;
        if ((this.press && this.press.pointerType !== 'mouse') || (s && !s.byKeyboard)) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true,
    );
  }

  /** What is being dragged now. */
  get subject(): TabDragSubject | null {
    return this.session?.subject ?? null;
  }

  // The session, for the pointer and the keys.

  /** Starts a drag: `onDragStarting` may cancel it. */
  begin(subject: TabDragSubject, pointerType: string, source: HTMLElement | null, x = 0, y = 0, pointerId = -1): boolean {
    const m = this.manager;
    if (this.session) return false;
    const byKeyboard = pointerType === 'keyboard';
    const e = { document: subject.document, group: subject.group, pointerType, byKeyboard, cancel: false, source: m };
    m.dragStarting(e);
    if (e.cancel) return false;
    const w = subject.window ?? null;
    if (w && !m.windowChanging('moveWindow', w, !byKeyboard)) return false;
    this.session = {
      subject,
      source,
      pointerId,
      pointerType,
      byKeyboard,
      x,
      y,
      start: { x, y },
      moved: false,
      place: null,
      target: null,
      shownIn: null,
      hover: null,
      was: new Map(),
      wasGroup: m.activeGroup,
      scrolls: new Map(),
      frame: 0,
      modifiers: { ctrlKey: false, altKey: false, shiftKey: false, metaKey: false },
      windowStart: w ? { ...w.rect } : null,
      followed: new Set(),
    };
    m.dragStarted(subject);
    const dragged = subject.document ? source : w ? null : subject.group.element;
    dragged?.toggleAttribute('data-dragging', true);
    w?.markMoving(true);
    return true;
  }

  /** Aims at a place (from a target, or chosen by the keys): `onDragOver` may change or refuse it. */
  aim(place: TabDropPlace | null, target: TabDropTarget | null): boolean {
    const s = this.session;
    if (!s) return false;
    const m = this.manager;
    s.place = null;
    s.target = null;
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
    }
    this.paint();
    return !!s.place;
  }

  /** Ends the drag: drops where it aims (`onDropping` may stop it), or puts everything back. */
  finish(drop: boolean, quiet = false): boolean {
    const s = this.session;
    if (!s) return false;
    const m = this.manager;
    this.session = null;
    this.release();
    clearTimeout(s.hover?.timer);
    cancelFrame(m, s.frame);
    this.ghost.hide();
    s.shownIn?.dropMarks.hide();
    for (const peer of s.followed) for (const t of peer.dropTargets) t.follow?.(null, s.subject);
    s.subject.window?.markMoving(false);
    (s.subject.document ? s.source : s.subject.group.element)?.removeAttribute('data-dragging');
    for (const peer of m.dragPeers()) delete peer.element.dataset.dragging;
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
    return dropped;
  }

  /** Stops a drag (or a press that may become one); `quiet` says nothing. */
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
    const found = this.subjectAt(e.target);
    if (!found) return;
    const press: Press = { pointerId: e.pointerId, pointerType, x: e.clientX, y: e.clientY, subject: found.subject, source: found.source, timer: undefined };
    this.press = press;
    if (pointerType !== 'mouse') press.timer = setTimeout(() => untracked(() => this.longPress(press)), m.longPressDelay);
    const view = m.element.ownerDocument.defaultView ?? window;
    const move = (ev: PointerEvent) => untracked(() => this.pointerMove(ev));
    const up = (ev: PointerEvent) => untracked(() => this.pointerUp(ev));
    const key = (ev: KeyboardEvent) => untracked(() => this.key(ev));
    // Once a long press has started the drag the finger moves the tab, not the strip.
    const touch = (ev: TouchEvent) => {
      if (this.session && !this.session.byKeyboard) ev.preventDefault();
    };
    view.addEventListener('pointermove', move);
    view.addEventListener('pointerup', up);
    view.addEventListener('pointercancel', up);
    view.addEventListener('keydown', key, true);
    view.addEventListener('keyup', key, true);
    found.source.addEventListener('touchmove', touch, { passive: false });
    this.stops.push(() => {
      clearTimeout(press.timer);
      view.removeEventListener('pointermove', move);
      view.removeEventListener('pointerup', up);
      view.removeEventListener('pointercancel', up);
      view.removeEventListener('keydown', key, true);
      view.removeEventListener('keyup', key, true);
      found.source.removeEventListener('touchmove', touch);
    });
  }

  /** The document of a tab, or the group of an empty bar, that a press there would drag. */
  private subjectAt(target: EventTarget | null): { subject: TabDragSubject; source: HTMLElement } | null {
    const m = this.manager;
    const el = target instanceof Element ? target : null;
    if (!el || el.closest('.mx-tabdocs__close, .mx-tabdocs__pin, .mx-tabdocs__scroll')) return null;
    const holder = el.closest('.mx-tabdocs__group');
    const group = m.groups.find((g) => g.element === holder);
    if (!group) return null;
    const tab = group.tabOf(el);
    if (tab) return m.mayDrag(tab.document) ? { subject: { document: tab.document, group, manager: m, copy: false }, source: tab.header } : null;
    // A floating window's strips are its title: the window moves with everything in it.
    const w = group.window;
    if (w && (group.isStripSpace(el) || group.isGrip(el))) return w.isMaximized ? null : { subject: { document: null, group, manager: m, copy: false, window: w }, source: group.barElement };
    if ((group.isStripSpace(el) || group.isGrip(el)) && m.allowDragGroups) return { subject: { document: null, group, manager: m, copy: false }, source: group.barElement };
    return null;
  }

  private longPress(press: Press): void {
    if (this.press === press) this.start(press, null);
  }

  /** The press became a drag: by moving past the threshold (`e`), or by a long press. */
  private start(press: Press, e: PointerEvent | null): void {
    this.press = null;
    clearTimeout(press.timer);
    if (!this.begin(press.subject, press.pointerType, press.source, press.x, press.y, press.pointerId)) {
      this.release();
      return;
    }
    const s = this.session!;
    if (e) {
      s.x = e.clientX;
      s.y = e.clientY;
      s.modifiers = e;
      s.moved = true;
    }
    try {
      press.source.setPointerCapture?.(press.pointerId);
    } catch {
      // A pointer that is gone already: the window listeners still follow it.
    }
    // A window moved is its own picture.
    if (!press.subject.window) {
      const source = press.subject.document ? press.source : press.subject.group.listElement;
      this.ghost.show(source, s.x, s.y, press.subject.document ? 'tab' : 'group');
    }
    this.track();
  }

  private pointerMove(e: PointerEvent): void {
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

  private pointerUp(e: PointerEvent): void {
    const s = this.session;
    if (s && !s.byKeyboard) {
      if (e.pointerId !== s.pointerId) return;
      if (e.type === 'pointercancel') {
        this.finish(false);
        return;
      }
      if (s.pointerType !== 'mouse' && !s.moved) {
        // Held still and let go: the tab's menu, as a long press does elsewhere.
        const { x, y, source } = s;
        this.finish(false, true);
        if (source) this.manager.openContextMenuAt(source, x, y);
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
      this.finish(true);
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

  /** The pointer moved, or the copy key changed: aim again, hover, scroll the strip. */
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
    const found = this.find(s.x, s.y);
    this.aim(found.place, found.target);
    this.hover();
    this.autoScroll();
  }

  /**
   * The place under the pointer: the targets of the manager it is over (or of the manager of the
   * floating window it is over: windows lie above everything), else floating, else outside.
   */
  private find(x: number, y: number): { place: TabDropPlace | null; target: TabDropTarget | null } {
    const s = this.session!;
    const over = this.managerAt(x, y);
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
    const float = this.manager.foreignAt(x, y) ? null : this.manager.floatPlace(s.subject, x, y);
    return float ? { place: float, target: this.targetFor(float) } : { place: OUTSIDE, target: null };
  }

  /** The managers a drag may drop in: those of its `dragGroup`; a window moved stays with its own. */
  private peers(): TabDocumentManager[] {
    return this.session?.subject.window ? [this.manager] : this.manager.dragPeers();
  }

  /** The manager under a point: the one of the front window there, else the one whose box holds it. */
  private managerAt(x: number, y: number): TabDocumentManager | null {
    const s = this.session!;
    const peers = this.peers();
    const windows = peers.flatMap((m) => m.windowsFrontFirst()).filter((w) => w !== s.subject.window);
    windows.sort((a, b) => Number(b.element.style.getPropertyValue('--_mx-z')) - Number(a.element.style.getPropertyValue('--_mx-z')));
    const front = windows.find((w) => contains(w.element.getBoundingClientRect(), x, y));
    if (front) return front.manager;
    return peers.find((m) => !m.element.closest('[hidden]') && contains(m.element.getBoundingClientRect(), x, y)) ?? null;
  }

  private targetFor(place: TabDropPlace): TabDropTarget | null {
    const owner = place.manager ?? this.manager;
    return owner.dropTargets.find((t) => t.kinds.includes(place.target)) ?? null;
  }

  private args(place: TabDropPlace, cancel: boolean, s: Session = this.session!): TabDropEventArgs {
    return { ...place, document: s.subject.document, from: s.subject.group, copy: s.subject.copy, byKeyboard: s.byKeyboard, cancel, source: this.manager };
  }

  /** Shows the marks where the drag aims, in the manager it aims at, and what a drop would do. */
  private paint(): void {
    const s = this.session!;
    const place = s.place;
    const owner = place?.manager ?? null;
    const marks = place && s.target ? s.target.marks(place, s.subject) : null;
    if (s.shownIn && s.shownIn !== owner) s.shownIn.dropMarks.hide();
    if (owner) owner.dropMarks.show(marks?.area ?? null, marks?.mark ?? null);
    s.shownIn = owner;
    // The cursor says it over every manager the drag can reach.
    const state = !place ? 'none' : s.subject.copy ? 'copy' : 'move';
    if (!s.byKeyboard) for (const peer of this.manager.dragPeers()) if (peer.element.dataset.dragging !== state) peer.element.dataset.dragging = state;
    this.ghost.move(s.x, s.y, state);
  }

  /** Resting on a tab of another group activates it after `dragHoverDelay`. */
  private hover(): void {
    const s = this.session!;
    const place = s.place;
    let tab: DocumentTab | null = null;
    if (place?.target === 'strip' && place.group && place.group !== s.subject.group && place.group.manager.dragHoverActivate) {
      tab = place.group.tabs.find((t) => t !== place.group!.activeTab && t.document !== s.subject.document && contains(t.header.getBoundingClientRect(), s.x, s.y)) ?? null;
    }
    if (s.hover?.tab === tab) return;
    clearTimeout(s.hover?.timer);
    s.hover = null;
    if (!tab) return;
    const delay = place!.group!.manager.dragHoverDelay;
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

  /** Near the ends of a strip that does not fit, the strip scrolls, faster the nearer the end. */
  private autoScroll(): void {
    const s = this.session!;
    const m = this.manager;
    cancelFrame(m, s.frame);
    if (!m.dragAutoScroll) return;
    const row = this.rowAt(s.x, s.y);
    if (!row || row.scrollWidth <= row.clientWidth) return;
    const box = row.getBoundingClientRect();
    const step = scrollStep(s.x, box.left, box.right, Math.min(48, box.width / 4), 12);
    if (!step) return;
    if (!s.scrolls.has(row)) s.scrolls.set(row, row.scrollLeft);
    const view = m.element.ownerDocument.defaultView;
    if (!view) return;
    s.frame = view.requestAnimationFrame(() =>
      untracked(() => {
        if (this.session !== s) return;
        const before = row.scrollLeft;
        row.scrollLeft += step;
        if (row.scrollLeft !== before) this.track();
      }),
    );
  }

  private rowAt(x: number, y: number): HTMLElement | null {
    const s = this.session;
    for (const m of this.peers()) {
      const group = m.groupAt(x, y, s?.subject.window ?? null);
      if (group && contains(group.barElement.getBoundingClientRect(), x, y)) return group.rowElement;
    }
    return null;
  }

  /** Canceled: what hovering activated and the strips scrolling moved go back, and a window moved. */
  private putBack(s: Session): void {
    if (s.subject.window && s.windowStart) s.subject.window.place(s.windowStart);
    for (const [row, left] of s.scrolls) row.scrollLeft = left;
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

  /** The click that follows a drop is not a click on the tab; the next press is a press again. */
  private swallowClick(): void {
    const view = this.manager.element.ownerDocument.defaultView;
    if (!view) return;
    const stop = () => {
      view.removeEventListener('click', swallow, true);
      view.removeEventListener('pointerdown', stop, true);
    };
    const swallow = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      stop();
    };
    view.addEventListener('click', swallow, true);
    view.addEventListener('pointerdown', stop, true);
    setTimeout(stop, 0);
  }

  private release(): void {
    for (const stop of this.stops.splice(0)) stop();
  }
}

function contains(box: DOMRect, x: number, y: number): boolean {
  return x >= box.left && x < box.right && y >= box.top && y < box.bottom;
}

function cancelFrame(manager: TabDocumentManager, frame: number): void {
  if (frame) manager.element.ownerDocument.defaultView?.cancelAnimationFrame(frame);
}
