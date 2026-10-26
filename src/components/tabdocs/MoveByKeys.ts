import { untracked } from '@motifx/core';
import { isChord } from '../../core/keyboard';
import type { UiStrings } from '../../core/ui-strings';
import type { SplitDirection } from './split-direction';
import type { TabDockSide } from './tab-dock-side';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDrag } from './TabDrag';
import type { TabDragSubject } from './tab-drag-subject';
import type { TabDropPlace } from './tab-drop-place';
import type { TabDropSide } from './tab-drop-side';
import type { TabGroup } from './TabGroup';

/**
 * Where "Move to…" points: a group and a side of it, or (`group: null`) an edge of a manager's
 * layout, one of its dock areas (`dock`), or a floating window of its own (`float`).
 */
interface Where {
  manager: TabDocumentManager;
  group: TabGroup | null;
  side: TabDropSide;
  /** Along an edge: the group it came from, where the opposite arrow goes back to. */
  from?: TabGroup;
  dock?: TabDockSide;
  float?: boolean;
}

const DOCK_OF: Record<SplitDirection, TabDockSide> = { left: 'left', right: 'right', up: 'top', down: 'bottom' };
const DIRECTION_OF: Record<TabDockSide, SplitDirection> = { left: 'left', right: 'right', top: 'up', bottom: 'down' };

const DOCK_TEXTS: Record<TabDockSide, keyof UiStrings> = {
  left: 'tabDocsPlaceDockLeft',
  right: 'tabDocsPlaceDockRight',
  top: 'tabDocsPlaceDockTop',
  bottom: 'tabDocsPlaceDockBottom',
};

const OPPOSITE: Record<SplitDirection, SplitDirection> = { left: 'right', right: 'left', up: 'down', down: 'up' };

const PLACE_TEXTS: Record<TabDropSide, keyof UiStrings> = {
  center: 'tabDocsPlaceInto',
  left: 'tabDocsPlaceLeft',
  right: 'tabDocsPlaceRight',
  up: 'tabDocsPlaceUp',
  down: 'tabDocsPlaceDown',
};

const EDGE_TEXTS: Record<SplitDirection, keyof UiStrings> = {
  left: 'tabDocsEdgeLeft',
  right: 'tabDocsEdgeRight',
  up: 'tabDocsEdgeUp',
  down: 'tabDocsEdgeDown',
};

/**
 * "Move to…": a tab or a group moved from the keyboard, through the same drag session as the
 * pointer, with the same drop areas shown. The arrows pick a side of a group; an arrow towards the
 * side already chosen goes on to the next group that way, then to the edge of the layout, the dock
 * area of that side and a floating window of its own, and the other way back. Tab goes to the next
 * group, Enter drops, Escape puts everything back. Each place is announced.
 */
export class MoveByKeys {
  private where: Where | null = null;
  private stop: (() => void) | null = null;

  constructor(
    private readonly manager: TabDocumentManager,
    private readonly drag: TabDrag,
  ) {}

  get isOn(): boolean {
    return !!this.stop;
  }

  /** Starts it for a document (its tab is `source`) or a group. */
  start(subject: TabDragSubject, source: HTMLElement | null): boolean {
    const m = this.manager;
    if (this.stop || !this.drag.begin(subject, 'keyboard', source)) return false;
    const view = m.element.ownerDocument.defaultView ?? window;
    const key = (e: KeyboardEvent) => untracked(() => this.key(e));
    // A press anywhere, or the window losing focus, ends it.
    const away = () => untracked(() => this.end(false));
    view.addEventListener('keydown', key, true);
    view.addEventListener('pointerdown', away, true);
    view.addEventListener('blur', away);
    this.stop = () => {
      view.removeEventListener('keydown', key, true);
      view.removeEventListener('pointerdown', away, true);
      view.removeEventListener('blur', away);
    };
    // It starts at the next group, or beside its own when there is none.
    const own = subject.group;
    const groups = this.groups();
    const next = groups[(groups.indexOf(own) + 1) % groups.length];
    this.where = next && next !== own ? { manager: next.manager, group: next, side: 'center' } : { manager: m, group: own, side: 'right' };
    const intro = subject.document ? m.textOf('tabDocsMoveStart', { title: subject.document.title }) : m.textOf('tabDocsMoveGroupStart', { n: m.groups.indexOf(own) + 1 });
    this.show(intro);
    return true;
  }

  /** Drops where it points (`drop`), or puts everything back. */
  end(drop: boolean): boolean {
    if (!this.stop) return false;
    this.stop();
    this.stop = null;
    const where = this.where;
    this.where = null;
    const dropped = this.drag.finish(drop);
    if (dropped && where) where.manager.focusGroup(where.manager.activeGroup ?? 0);
    return dropped;
  }

  private key(e: KeyboardEvent): void {
    const keys = this.manager.keys;
    const rtl = this.rtl();
    let handled = true;
    if (isChord(keys.targetLeft, e)) this.go(rtl ? 'right' : 'left');
    else if (isChord(keys.targetRight, e)) this.go(rtl ? 'left' : 'right');
    else if (isChord(keys.targetUp, e)) this.go('up');
    else if (isChord(keys.targetDown, e)) this.go('down');
    else if (isChord(keys.targetNextGroup, e)) this.cycle(1);
    else if (isChord(keys.targetPreviousGroup, e)) this.cycle(-1);
    else if (isChord(keys.targetDrop, e)) this.end(true);
    else if (isChord(keys.targetCancel, e)) this.end(false);
    else handled = false;
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  /** An arrow: a side, the next group that way (or the layout's edge), or back to the centre. */
  private go(to: SplitDirection): void {
    const w = this.where;
    if (!w) return;
    if (w.float) {
      // Floating: the arrow back comes to the dock area it went out from.
      if (w.dock && to === OPPOSITE[DIRECTION_OF[w.dock]]) this.where = { ...w, float: false };
    } else if (w.dock) {
      // In a dock area: on outwards, a floating window; back in, the edge of the layout; across, another area.
      const out = DIRECTION_OF[w.dock];
      if (to === out) this.where = { ...w, float: true };
      else if (to === OPPOSITE[out]) this.where = { manager: w.manager, group: null, side: out, from: w.from };
      else this.where = { ...w, side: to, dock: DOCK_OF[to] };
    } else if (!w.group) {
      // Along an edge: back in, to the group nearest that edge; on outwards, the dock area there; or along another edge.
      const back = w.from && w.manager.groups.includes(w.from) ? w.from : w.manager.edgeGroup(w.side as SplitDirection);
      if (to === OPPOSITE[w.side as SplitDirection]) this.where = { manager: w.manager, group: back, side: 'center' };
      else if (to === w.side && w.manager === this.manager) this.where = { ...w, dock: DOCK_OF[to] };
      else this.where = { ...w, side: to };
    } else if (w.side === 'center' || (w.side !== to && w.side !== OPPOSITE[to])) {
      this.where = { ...w, side: to };
    } else if (w.side === to) {
      const next = w.manager.neighbourOf(w.group, to);
      this.where = next ? { manager: w.manager, group: next, side: 'center' } : { manager: w.manager, group: null, side: to, from: w.group };
    } else {
      this.where = { ...w, side: 'center' };
    }
    this.show('');
  }

  private cycle(by: 1 | -1): void {
    const w = this.where;
    const groups = this.groups();
    if (!w || !groups.length) return;
    const at = w.group ? groups.indexOf(w.group) : by === 1 ? -1 : 0;
    const group = groups[(at + by + groups.length) % groups.length];
    this.where = { manager: group.manager, group, side: 'center' };
    this.show('');
  }

  private rtl(): boolean {
    const el = this.manager.element;
    return el.ownerDocument.defaultView?.getComputedStyle(el).direction === 'rtl';
  }

  /** Every group it can go to: this manager's, then those of the managers of its `dragGroup`. */
  private groups(): TabGroup[] {
    return this.manager.dragPeers().flatMap((m) => [...m.groups]);
  }

  /** Aims the drag where it points, shows the areas and says where that is. */
  private show(intro: string): void {
    const w = this.where;
    const subject = this.drag.subject;
    if (!w || !subject) return;
    const target = w.manager.layoutTarget;
    const dock = w.manager.dockDropTarget;
    let place: TabDropPlace | null;
    if (w.float) place = w.manager.floatPlace(subject);
    else if (w.dock) place = dock.areaPlace(w.dock, subject);
    else place = w.group ? target.groupPlace(w.group, w.side, subject) : target.edgePlace(w.side as SplitDirection, subject);
    const ok = this.drag.aim(place, place ? (w.float || w.dock ? dock : target) : null);
    const m = this.manager;
    // Said as it looks: right to left, a group's start is on the right.
    const side = this.rtl() && (w.side === 'left' || w.side === 'right') ? OPPOSITE[w.side] : w.side;
    const named = w.float
      ? m.textOf('tabDocsPlaceFloat')
      : w.dock
        ? w.manager.textOf(DOCK_TEXTS[w.dock])
        : w.group
          ? w.manager.textOf(PLACE_TEXTS[side], { n: w.manager.groups.indexOf(w.group) + 1 })
          : w.manager.textOf(EDGE_TEXTS[side as SplitDirection]);
    const text = ok ? named : m.textOf('tabDocsPlaceRefused', { place: named });
    m.sayText(intro ? `${intro} ${text}` : text);
  }
}
