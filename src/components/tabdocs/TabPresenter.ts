import { createSignal, untracked } from '@motifx/core';
import { holdBackButton, type BackButtonHold } from '../../core/back-button';
import { deepActiveElement } from '../../core/focus';
import { Drawer } from '../drawer/Drawer';
import { BottomSheet } from '../sheet/BottomSheet';
import type { DocumentTab } from './DocumentTab';
import type { LayoutItem } from './layout-item';
import { PhoneBar } from './PhoneBar';
import { PhoneList } from './PhoneList';
import { PhoneTools } from './PhoneTools';
import { placeNode } from './place-node';
import type { TabDockArea } from './TabDockArea';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabPresentationKind } from './tab-presentation-kind';
import { TabSplit } from './TabSplit';
import type { TabWindow } from './TabWindow';

/** Where a dock area or a floating window is shown on a tablet or a phone. */
interface Overlay {
  panel: Drawer | BottomSheet;
  mode: 'sheet' | 'drawer';
}

/** The main groups shown side by side on a tablet: each shows its own tabs and those of the groups folded into it. */
interface Slot {
  shown: TabGroup;
  groups: TabGroup[];
}

/**
 * How a manager shows its layout on a tablet and a phone; on a desktop it does nothing. The layout
 * (groups, splits, dock areas, windows) stays as it is and saves the same: only where things are
 * shown changes, and content is moved, never recreated.
 *
 * - Tablet: at most two groups side by side, the others folded as tabs into the group beside them;
 *   dock areas in drawers from their edge (the bottom one in a sheet), opened from the titles along
 *   that edge; floating windows in large sheets.
 * - Phone: one document, full screen, with its title, its close button and the number of open
 *   documents above it (a full-screen list of them); dock tools in a bar at the bottom that opens
 *   them in sheets; floating windows in full-screen sheets; the browser's back closes what is open,
 *   then goes back through the documents.
 */
export class TabPresenter {
  kind: TabPresentationKind = 'desktop';
  private slots: Slot[] = [];
  /** For each group shown on a tablet: the headers of the groups folded into it, before and after its own. */
  private guests = new Map<TabGroup, { before: HTMLElement[]; after: HTMLElement[] }>();
  private readonly overlays = new Map<TabDockArea | TabWindow, Overlay>();
  private bar: PhoneBar | null = null;
  private tools: PhoneTools | null = null;
  private list: PhoneList | null = null;
  /** The browser's back going back through the documents, on a phone. */
  private releaseBack: BackButtonHold | null = null;
  /** The manager's events this presentation follows while it is not a desktop. */
  private listening: { dispose(): void }[] = [];
  private rendering = false;
  /** Going back through the documents: the tools passed on the way do not come up. */
  private travelling = false;
  /** A drawing asked for, or under way: more asks are not needed. */
  busy = false;
  /** Counts the changes of the folded groups, for readers that follow them. */
  private readonly folding = createSignal(0);

  constructor(private readonly manager: TabDocumentManager) {}

  /** The document a phone shows: the active one among the documents, else the last one used there. */
  get phoneDocument(): TabDocument | null {
    const m = this.manager;
    const active = m.activeDocument;
    if (active && isMain(active.group)) return active;
    return m.recentGroupsNow().find(isMain)?.activeDocument ?? m.groups.find(isMain)?.activeDocument ?? null;
  }

  /** The documents a phone's list and title swipes go through, in layout order: the documents' groups, then each window's. */
  listDocuments(): TabDocument[] {
    return this.listGroups().flatMap((g) => g.documents);
  }

  /** The groups of the phone's list: the documents' first, then the floating windows'. */
  listGroups(): TabGroup[] {
    const m = this.manager;
    return [...m.groups.filter(isMain), ...m.floatingWindows.flatMap((w) => w.groups)];
  }

  /** Shows the layout the way `kind` says; what the one before had moved goes back first. */
  apply(kind: TabPresentationKind): void {
    if (kind === this.kind) return;
    const focus = deepActiveElement(this.manager.element);
    this.takeDown();
    this.kind = kind;
    const el = this.manager.element;
    if (kind === 'desktop') el.removeAttribute('data-presentation');
    else el.dataset.presentation = kind;
    if (kind !== 'desktop') this.listen();
    this.render();
    if (focus?.isConnected && deepActiveElement(focus) !== focus) focus.focus({ preventScroll: true });
  }

  /** Puts everything where this presentation shows it; called whenever the layout or the active document changes. */
  render(): void {
    if (this.kind === 'desktop' || this.rendering) return;
    this.rendering = true;
    const asked = this.busy;
    this.busy = true;
    try {
      untracked(() => {
        const focus = deepActiveElement(this.manager.element);
        this.renderMain();
        this.renderAreas();
        this.renderWindows();
        if (this.kind === 'phone') this.renderPhone();
        if (focus?.isConnected && deepActiveElement(focus) !== focus) focus.focus({ preventScroll: true });
      });
    } finally {
      this.rendering = false;
      this.busy = asked;
    }
  }

  /** Whether a group's strip shows the tabs of groups folded into it. Reactive. */
  hasGuests(group: TabGroup): boolean {
    void this.folding.value;
    return this.guests.has(group);
  }

  /** Whether a group is folded into the one shown beside it on a tablet. */
  isFolded(group: TabGroup): boolean {
    if (this.kind !== 'tablet') return false;
    for (const [shown, g] of this.guests) if (shown !== group && this.slots.some((s) => s.shown === shown && s.groups.includes(group))) return g !== null;
    return false;
  }

  /** Draws again once what is going on now is over (a microtask later); asks made meanwhile make one drawing. */
  renderSoon(): void {
    if (this.kind === 'desktop' || this.busy) return;
    this.busy = true;
    queueMicrotask(() => {
      this.busy = false;
      this.render();
    });
  }

  /** Every change of documents and layout draws the presentation again. */
  private listen(): void {
    const m = this.manager;
    const again = () => this.renderSoon();
    this.listening = [
      m.onOpened(again),
      m.onClosed(again),
      m.onMoved(again),
      m.onPinned(again),
      m.onUnpinned(again),
      m.onKept(again),
      m.onHidden(again),
      m.onShown(again),
      m.onLayoutChanged(again),
      m.onDocumentActivated(again),
    ];
  }

  /** The headers shown in a group's strip besides its own, on a tablet. */
  guestsOf(group: TabGroup): { before: HTMLElement[]; after: HTMLElement[] } | null {
    return this.guests.get(group) ?? null;
  }

  /** The tabs of the strip `tab` is shown in, in their order there (on a tablet, with those folded in). */
  stripOrder(tab: DocumentTab): DocumentTab[] {
    const group = tab.group;
    if (!group) return [];
    const slot = this.slots.find((s) => s.groups.includes(group));
    if (this.kind !== 'tablet' || !slot) return [...group.tabs];
    return slot.groups.flatMap((g) => g.tabs);
  }

  /** A document was activated: on a tablet or a phone, the drawer, the sheet or the window it is in opens. */
  reveal(doc: TabDocument): boolean {
    if (this.kind === 'desktop' || this.travelling) return true;
    // Of several managers on a page, the back button goes back in the one used last.
    this.releaseBack?.raise();
    const group = doc.group;
    const holder = group?.dockArea ?? group?.window ?? null;
    if (holder && (!isArea(holder) || this.dockMode(holder) !== 'hidden')) this.overlayOf(holder)?.panel.open();
    this.render();
    return true;
  }

  /** The drawer or sheet a dock area or a floating window is shown in now (made when it is first needed). */
  private overlayOf(holder: TabDockArea | TabWindow): Overlay | null {
    if (this.kind === 'desktop') return null;
    if (!this.overlays.has(holder)) this.render();
    return this.overlays.get(holder) ?? null;
  }

  /** Opens a dock area's tool (from its title on a tablet's edge, from the phone's tool bar). */
  showTool(doc: TabDocument): boolean {
    const area = doc.group?.dockArea;
    const overlay = area ? this.overlayOf(area) : null;
    if (!area || !overlay) return false;
    this.manager.activateFromList(doc);
    overlay.panel.open();
    return true;
  }

  /** Closes a dock area's drawer or sheet. */
  hideTool(area: TabDockArea): boolean {
    const overlay = this.overlays.get(area);
    return !!overlay && overlay.panel.close('code');
  }

  /** Whether a dock area's drawer or sheet is open now. */
  isToolOpen(area: TabDockArea): boolean {
    return !!this.overlays.get(area)?.panel.isOpen;
  }

  /** How a dock area shows in this presentation. */
  dockMode(area: TabDockArea): 'sheet' | 'drawer' | 'hidden' {
    return this.dockModeFor(area, this.kind === 'phone' ? 'phone' : 'tablet');
  }

  /** How a dock area shows on a tablet or a phone: its own setting, else the manager's. */
  dockModeFor(area: TabDockArea, kind: 'tablet' | 'phone'): 'sheet' | 'drawer' | 'hidden' {
    const m = this.manager;
    const own = kind === 'phone' ? (area.phoneDockMode ?? m.phoneDockMode) : (area.tabletDockMode ?? m.tabletDockMode);
    if (own !== 'auto') return own;
    return kind === 'tablet' && area.side !== 'bottom' ? 'drawer' : 'sheet';
  }

  /** Opens the phone's list of documents. */
  showList(): boolean {
    if (this.kind !== 'phone') return false;
    this.list ??= new PhoneList(this.manager, this);
    return this.list.open();
  }

  hideList(): boolean {
    return !!this.list?.close();
  }

  get listOpen(): boolean {
    return !!this.list?.isOpen;
  }

  /** The manager is going away: what this presentation made goes too; nothing is put back. */
  dispose(): void {
    for (const overlay of this.overlays.values()) if (!overlay.panel.isDisposed) void overlay.panel.dispose();
    this.overlays.clear();
    this.list?.dispose();
    this.list = null;
    this.bar?.dispose();
    this.bar = null;
    this.tools?.dispose();
    this.tools = null;
    for (const listening of this.listening.splice(0)) listening.dispose();
    const release = this.releaseBack;
    this.releaseBack = null;
    release?.();
    this.kind = 'desktop';
  }

  // Tablet and phone: the documents' groups.

  private renderMain(): void {
    const m = this.manager;
    const root = m.mainRoot;
    const groups = m.groups.filter(isMain);
    const recent = m.recentGroupsNow();
    const first = (list: TabGroup[]) => recent.find((g) => list.includes(g)) ?? list[0];
    let slots: Slot[];
    if (this.kind === 'phone') {
      const doc = this.phoneDocument;
      const shown = doc?.group && isMain(doc.group) ? doc.group : first(groups);
      slots = shown ? [{ shown, groups: [shown] }] : [];
    } else {
      const maximized = m.maximizedGroup;
      const width = m.element.getBoundingClientRect().width;
      const columns = maximized || !(root instanceof TabSplit) || width < 2 * m.minGroupWidth ? [groups] : [groupsIn(root.children[0]), root.children.slice(1).flatMap(groupsIn)];
      slots = columns.filter((c) => c.length).map((c) => ({ shown: maximized && c.includes(maximized) ? maximized : first(c), groups: c }));
      // The share of each column, from the layout's own sizes.
      const style = m.element.style;
      if (slots.length === 2 && root instanceof TabSplit) {
        const a = root.sizes[0] ?? 0.5;
        style.setProperty('--_share-a', `${Math.max(0.2, a).toFixed(3)}fr`);
        style.setProperty('--_share-b', `${Math.max(0.2, 1 - a).toFixed(3)}fr`);
      } else {
        style.removeProperty('--_share-a');
        style.removeProperty('--_share-b');
      }
    }
    this.slots = slots;
    const guests = new Map<TabGroup, { before: HTMLElement[]; after: HTMLElement[] }>();
    for (const slot of slots) {
      if (this.kind !== 'tablet' || slot.groups.length < 2) continue;
      const at = slot.groups.indexOf(slot.shown);
      guests.set(slot.shown, {
        before: slot.groups.slice(0, at).flatMap((g) => g.tabs.map((t) => t.header)),
        after: slot.groups.slice(at + 1).flatMap((g) => g.tabs.map((t) => t.header)),
      });
    }
    const changed = guests.size !== this.guests.size || [...guests.keys()].some((g) => !this.guests.has(g));
    this.guests = guests;
    if (changed) this.folding.value = this.folding.peek() + 1;
    for (const group of groups) {
      const index = slots.findIndex((s) => s.shown === group);
      group.element.dataset.slot = index < 0 ? 'none' : slots.length === 1 ? 'solo' : String(index + 1);
    }
    // Folded groups give their headers to the one shown first, then the shown ones take them.
    for (const group of groups) if (!guests.has(group)) group.placeHeaders();
    for (const group of guests.keys()) group.placeHeaders();
  }

  // Dock areas and windows in drawers and sheets.

  private renderAreas(): void {
    const m = this.manager;
    for (const area of m.dockAreas) {
      const mode = this.dockMode(area);
      const overlay = this.overlays.get(area);
      if (mode === 'hidden') {
        if (overlay) this.dropOverlay(area);
        this.home(area);
        area.element.dataset.presented = 'hidden';
        continue;
      }
      const wanted = overlay && overlay.mode === mode ? overlay : this.makeAreaOverlay(area, mode);
      if (!area.element.isConnected || area.element.parentElement !== wanted.panel.contentElement) {
        placeNode(wanted.panel.contentElement, area.element, null);
      }
      area.element.dataset.presented = mode;
    }
    for (const holder of [...this.overlays.keys()]) {
      if (isArea(holder) && !m.dockAreas.includes(holder)) this.dropOverlay(holder);
    }
  }

  private makeAreaOverlay(area: TabDockArea, mode: 'sheet' | 'drawer'): Overlay {
    this.dropOverlay(area);
    const m = this.manager;
    const label = () => m.textOf(AREA_NAMES[area.side]);
    const common = {
      container: m.element,
      label,
      onOpened: () => untracked(() => area.markOpen(true)),
      onClosed: () => untracked(() => area.markOpen(false)),
    };
    const panel =
      mode === 'drawer'
        ? new Drawer({ ...common, side: area.side === 'left' ? 'start' : area.side === 'right' ? 'end' : area.side, edgeSwipe: () => m.edgeSwipe && this.kind !== 'desktop' })
        : new BottomSheet({ ...common, modal: false, detents: ['peek', 'half', 'full'], detent: 'half' });
    panel.element.classList.add('mx-tabdocs__tool-panel');
    panel.element.dataset.side = area.side;
    m.controls.add(panel);
    const overlay: Overlay = { panel, mode };
    this.overlays.set(area, overlay);
    return overlay;
  }

  private renderWindows(): void {
    const m = this.manager;
    for (const w of m.floatingWindows) {
      let overlay = this.overlays.get(w);
      if (!overlay) {
        const sheet = new BottomSheet({
          container: m.element,
          label: () => w.groups[0]?.activeDocument?.title ?? m.textOf('tabDocsWindow', { n: w.index + 1 }),
          detents: ['full'],
          topGap: () => (this.kind === 'phone' ? 0 : null),
          modal: true,
        });
        sheet.element.classList.add('mx-tabdocs__window-sheet');
        m.controls.add(sheet);
        overlay = { panel: sheet, mode: 'sheet' };
        this.overlays.set(w, overlay);
      }
      if (w.body.parentElement !== overlay.panel.contentElement) placeNode(overlay.panel.contentElement, w.body, null);
      w.body.dataset.presented = 'sheet';
    }
    for (const holder of [...this.overlays.keys()]) {
      if (!isArea(holder) && !m.floatingWindows.includes(holder)) this.dropOverlay(holder);
    }
  }

  private dropOverlay(holder: TabDockArea | TabWindow): void {
    const overlay = this.overlays.get(holder);
    if (!overlay) return;
    this.overlays.delete(holder);
    if (isArea(holder)) this.home(holder);
    else this.homeWindow(holder);
    if (!overlay.panel.isDisposed) void overlay.panel.dispose();
  }

  /** A dock area back among the manager's parts. */
  private home(area: TabDockArea): void {
    const m = this.manager;
    delete area.element.dataset.presented;
    if (area.element.parentElement !== m.element) placeNode(m.element, area.element, area.sash.element.isConnected && area.sash.element.parentElement === m.element ? area.sash.element : null);
    area.markOpen(false);
  }

  private homeWindow(w: TabWindow): void {
    delete w.body.dataset.presented;
    if (w.body.parentElement !== w.element) placeNode(w.element, w.body, w.element.firstChild);
  }

  // Phone.

  private renderPhone(): void {
    const m = this.manager;
    this.bar ??= new PhoneBar(m, this);
    this.tools ??= new PhoneTools(m, this);
    this.bar.render();
    this.tools.render();
    // A tool's sheet opens above the bar of tools, which stays in reach.
    const tools = this.tools.element;
    m.element.style.setProperty('--_tools-height', `${tools.hidden ? 0 : Math.round(tools.getBoundingClientRect().height)}px`);
    this.list?.render();
    this.holdBack();
  }

  /** While there is a document to go back to, the browser's back goes back to it. */
  holdBack(): void {
    const m = this.manager;
    const want = this.kind === 'phone' && m.backButton && m.canGoBack;
    if (want && !this.releaseBack) {
      this.releaseBack = holdBackButton(m.element.ownerDocument.defaultView, () => {
        this.releaseBack = null;
        untracked(() => this.goBack());
        this.holdBack();
      }, 0);
    } else if (!want && this.releaseBack) {
      const release = this.releaseBack;
      this.releaseBack = null;
      release();
    }
  }

  /**
   * The back button with nothing open: back to the document shown before, past the tools used in
   * between (they are in sheets of their own, not what the phone shows).
   */
  private goBack(): void {
    const m = this.manager;
    const shown = this.phoneDocument;
    this.travelling = true;
    try {
      while (m.goBack()) {
        const now = m.activeDocument;
        if (now && now !== shown && this.listDocuments().includes(now)) break;
      }
    } finally {
      this.travelling = false;
    }
    const now = m.activeDocument;
    if (now) this.reveal(now);
  }

  /** Takes down what this presentation put up: everything goes back where the desktop has it. */
  private takeDown(): void {
    const m = this.manager;
    for (const holder of [...this.overlays.keys()]) {
      const overlay = this.overlays.get(holder)!;
      if (overlay.panel.isOpen) overlay.panel.close('code');
      this.dropOverlay(holder);
    }
    for (const area of m.dockAreas) {
      this.home(area);
    }
    this.list?.dispose();
    this.list = null;
    this.bar?.dispose();
    this.bar = null;
    this.tools?.dispose();
    this.tools = null;
    const release = this.releaseBack;
    this.releaseBack = null;
    release?.();
    for (const listening of this.listening.splice(0)) listening.dispose();
    const groups = m.groups;
    if (this.guests.size) this.folding.value = this.folding.peek() + 1;
    this.guests = new Map();
    this.slots = [];
    for (const group of groups) {
      delete group.element.dataset.slot;
      group.placeHeaders();
    }
    m.element.style.removeProperty('--_share-a');
    m.element.style.removeProperty('--_share-b');
    m.element.style.removeProperty('--_tools-height');
  }
}

const AREA_NAMES = { left: 'tabDocsAreaLeft', right: 'tabDocsAreaRight', top: 'tabDocsAreaTop', bottom: 'tabDocsAreaBottom' } as const;

/** Whether a group is among the documents: not in a dock area, a floating window or a new window. */
function isMain(group: TabGroup | null | undefined): group is TabGroup {
  return !!group && !group.window && !group.dockArea && !group.browserWindow;
}

function isArea(holder: TabDockArea | TabWindow): holder is TabDockArea {
  return 'side' in holder;
}

function groupsIn(item: LayoutItem | undefined): TabGroup[] {
  if (!item) return [];
  return item instanceof TabSplit ? item.children.flatMap(groupsIn) : [item];
}
