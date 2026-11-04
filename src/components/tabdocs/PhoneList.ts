import { untracked } from '@motifx/core';
import { deepActiveElement } from '../../core/focus';
import { dismissMark, pinMark } from '../../core/glyphs';
import { iconNode } from '../../core/icon-node';
import { isElement } from '../../core/node-kind';
import { SwipeTracker } from '../../parts/overlay/swipe-tracker';
import { BottomSheet } from '../sheet/BottomSheet';
import { TextBox } from '../textbox/TextBox';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import type { TabPresenter } from './TabPresenter';
import { foldText } from '../../core/fold-text';

/** How far, in pixels, a finger moves before it is a swipe or a scroll. */
const SLOP = 8;

interface Row {
  element: HTMLLIElement;
  open: HTMLButtonElement;
  close: HTMLButtonElement;
  release: () => void;
  /** What it was drawn from, to draw it again only when that changes. */
  look: string;
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
  from: { list: Element; next: Element | null } | null;
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
  private readonly sections: HTMLDivElement;
  private readonly empty: HTMLDivElement;
  private readonly rows = new Map<TabDocument, Row>();
  private readonly lists = new Map<TabGroup, { section: HTMLElement; head: HTMLElement; list: HTMLUListElement }>();
  private query = '';
  private gesture: Gesture | null = null;

  constructor(
    private readonly manager: TabDocumentManager,
    private readonly presenter: TabPresenter,
  ) {
    const doc = manager.element.ownerDocument;
    this.sheet = new BottomSheet({
      container: manager.element,
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
      onClosed: () => untracked(() => {
        manager.listShown(false);
        presenter.render();
      }),
    });
    this.sheet.element.classList.add('mx-tabdocs__phone-list');
    const search = (this.search = new TextBox({ type: 'search', stretch: true, autocomplete: 'off' }));
    search.label = () => manager.textOf('tabDocsPhoneSearch');
    search.placeholder = () => manager.textOf('tabDocsPhoneSearch');
    search.element.classList.add('mx-tabdocs__list-search');
    search.onValueChanged((e) => {
      this.query = foldText((e.value ?? '').trim());
      this.filter();
    });
    this.sections = doc.createElement('div');
    this.sections.className = 'mx-tabdocs__list-sections';
    this.empty = doc.createElement('div');
    this.empty.className = 'mx-tabdocs__list-empty';
    this.empty.hidden = true;
    // Built here and placed above the rows (among the sheet's children core would put it after them).
    search.build();
    this.sheet.contentElement.append(search.element, this.sections, this.empty);
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
    row?.open.focus({ preventScroll: true });
    row?.element.scrollIntoView?.({ block: 'nearest' });
    return true;
  }

  close(): boolean {
    return this.sheet.close('code');
  }

  dispose(): void {
    this.endGesture();
    for (const row of this.rows.values()) row.release();
    this.rows.clear();
    if (!this.search.isDisposed) void this.search.dispose();
    if (!this.sheet.isDisposed) void this.sheet.dispose();
  }

  /** Draws the sections and rows again for the documents open now. */
  render(): void {
    if (this.gesture?.mode === 'drag') return;
    const m = this.manager;
    const groups = this.presenter.listGroups();
    const active = this.presenter.phoneDocument;
    const single = groups.length < 2;
    const seen = new Set<TabDocument>();
    groups.forEach((group, i) => {
      const part = this.listOf(group);
      part.head.textContent = group.window ? m.textOf('tabDocsWindow', { n: group.window.index + 1 }) : m.textOf('tabDocsGroup', { n: i + 1 });
      part.head.hidden = single;
      if (this.sections.children[i] !== part.section) this.sections.insertBefore(part.section, this.sections.children[i] ?? null);
      group.documents.forEach((doc, j) => {
        seen.add(doc);
        const row = this.rowOf(doc);
        if (doc === active) row.element.setAttribute('aria-current', 'true');
        else row.element.removeAttribute('aria-current');
        if (part.list.children[j] !== row.element) part.list.insertBefore(row.element, part.list.children[j] ?? null);
      });
      while (part.list.children.length > group.documents.length) part.list.lastElementChild!.remove();
    });
    for (const [group, part] of this.lists) {
      if (groups.includes(group)) continue;
      part.section.remove();
      this.lists.delete(group);
    }
    for (const [doc, row] of this.rows) {
      if (seen.has(doc)) continue;
      row.release();
      row.element.remove();
      this.rows.delete(doc);
    }
    this.empty.textContent = m.textOf('noItems');
    this.filter();
    this.renderRoving();
  }

  private listOf(group: TabGroup): { section: HTMLElement; head: HTMLElement; list: HTMLUListElement } {
    let part = this.lists.get(group);
    if (part) return part;
    const doc = this.manager.element.ownerDocument;
    const section = doc.createElement('section');
    section.className = 'mx-tabdocs__list-section';
    const head = doc.createElement('div');
    head.className = 'mx-tabdocs__list-head';
    head.setAttribute('role', 'heading');
    head.setAttribute('aria-level', '3');
    head.id = `${group.element.id}-list`;
    const list = doc.createElement('ul');
    list.className = 'mx-tabdocs__list-rows';
    list.setAttribute('aria-labelledby', head.id);
    section.append(head, list);
    part = { section, head, list };
    this.lists.set(group, part);
    return part;
  }

  private rowOf(doc: TabDocument): Row {
    const m = this.manager;
    const look = [doc.title, doc.description, doc.dirty, doc.pinned, doc.preview, doc.closable, String(doc.icon ?? '')].join('|');
    const known = this.rows.get(doc);
    if (known && known.look === look) return known;
    const owner = m.element.ownerDocument;
    const element = known?.element ?? owner.createElement('li');
    known?.release();
    element.className = 'mx-tabdocs__list-row';
    element.toggleAttribute('data-pinned', doc.pinned);
    element.toggleAttribute('data-preview', doc.preview);
    const open = owner.createElement('button');
    open.type = 'button';
    open.className = 'mx-tabdocs__list-open';
    let release = () => {};
    if (doc.icon) {
      const icon = owner.createElement('span');
      icon.className = 'mx-tabdocs__icon';
      icon.setAttribute('aria-hidden', 'true');
      const shown = iconNode(doc.icon, owner);
      icon.append(shown.node);
      release = shown.release;
      open.append(icon);
    }
    const text = owner.createElement('span');
    text.className = 'mx-tabdocs__list-text';
    const title = owner.createElement('span');
    title.className = 'mx-tabdocs__list-title';
    title.textContent = doc.title;
    text.append(title);
    if (doc.description) {
      const description = owner.createElement('span');
      description.className = 'mx-tabdocs__list-description';
      description.textContent = doc.description;
      text.append(' ', description);
    }
    open.append(text);
    const states: string[] = [];
    if (doc.pinned) {
      const pin = owner.createElement('span');
      pin.className = 'mx-tabdocs__list-pin';
      pin.setAttribute('aria-hidden', 'true');
      pin.append(pinMark());
      open.append(pin);
      states.push(m.textOf('tabDocsPinState'));
    }
    if (doc.dirty) {
      const dirty = owner.createElement('span');
      dirty.className = 'mx-tabdocs__list-dirty';
      dirty.setAttribute('aria-hidden', 'true');
      open.append(dirty);
      states.push(m.textOf('tabDocsUnsaved'));
    }
    if (states.length) {
      const said = owner.createElement('span');
      said.className = 'mx-tabdocs__hidden';
      said.textContent = `, ${states.join(', ')}`;
      open.append(said);
    }
    const close = owner.createElement('button');
    close.type = 'button';
    close.className = 'mx-tabdocs__list-close';
    close.setAttribute('aria-label', m.textOf(doc.closable ? 'tabDocsCloseActive' : 'tabDocsHideActive', { title: doc.title }));
    close.disabled = !m.mayCloseOrHide(doc);
    close.append(dismissMark());
    element.replaceChildren(open, close);
    const row: Row = { element, open, close, release, look };
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
        row.element.hidden = !hit;
        if (hit) shown++;
      }
      part.section.hidden = !shown;
      any ||= shown > 0;
    }
    this.empty.hidden = any;
  }

  /** One row is a Tab stop: the active document's, else the first shown. */
  private renderRoving(): void {
    const opens = this.visibleRows().map((r) => r.open);
    const focus = deepActiveElement(this.sections);
    const active = this.presenter.phoneDocument;
    const stop = opens.find((b) => b === focus) ?? (active && this.rows.get(active)?.open) ?? opens[0];
    for (const row of this.rows.values()) row.open.tabIndex = row.open === stop ? 0 : -1;
  }

  private visibleRows(): Row[] {
    return [...this.sections.querySelectorAll<HTMLLIElement>('.mx-tabdocs__list-row')].filter((el) => !el.hidden && !el.closest('[hidden]')).map((el) => this.rowByElement(el)!).filter(Boolean);
  }

  private rowByElement(el: Element | null): Row | undefined {
    for (const row of this.rows.values()) if (row.element === el) return row;
    return undefined;
  }

  private docOf(target: EventTarget | null): TabDocument | null {
    const el = isElement(target) ? target.closest('.mx-tabdocs__list-row') : null;
    for (const [doc, row] of this.rows) if (row.element === el) return doc;
    return null;
  }

  private listen(): void {
    const s = this.sections;
    s.addEventListener('click', (e) => {
      const doc = this.docOf(e.target);
      if (!doc) return;
      if ((e.target as Element).closest('.mx-tabdocs__list-close')) untracked(() => void this.closeDocument(doc));
      else untracked(() => this.choose(doc));
    });
    s.addEventListener('keydown', (e) => untracked(() => this.key(e)));
    s.addEventListener('contextmenu', (e) => {
      const doc = this.docOf(e.target);
      if (!doc || !doc.group) return;
      e.preventDefault();
      // A finger's long press: the lift and its drop handle it.
      if (this.gesture) return;
      untracked(() => this.manager.openDocumentSheet(doc, doc.group!, e.button !== 2 && e.clientX === 0 && e.clientY === 0, this.rows.get(doc)?.open ?? null));
    });
    // The touchmove listener is there before a finger lands: only then can a swipe or a drag keep the list still.
    s.addEventListener('touchstart', (e) => this.touchStart(e), { passive: true });
    s.addEventListener('touchmove', (e) => this.touchMove(e), { passive: false });
    s.addEventListener('touchend', (e) => this.touchEnd(e));
    s.addEventListener('touchcancel', (e) => this.touchEnd(e));
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
    if (!closed && row) row.element.style.translate = '';
    if (closed && next) next.open.focus({ preventScroll: true });
  }

  private neighbour(row: Row, by: 1 | -1): Row | null {
    const rows = this.visibleRows();
    return rows[rows.indexOf(row) + by] ?? null;
  }

  private key(e: KeyboardEvent): void {
    const doc = this.docOf(e.target);
    const row = doc ? this.rows.get(doc) : undefined;
    if (!doc || !row || e.ctrlKey || e.metaKey) return;
    const rows = this.visibleRows();
    const at = rows.indexOf(row);
    const go = (i: number) => {
      const next = rows[Math.max(0, Math.min(rows.length - 1, i))];
      if (!next) return;
      for (const r of this.rows.values()) r.open.tabIndex = -1;
      next.open.tabIndex = 0;
      next.open.focus();
    };
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      this.moveBy(doc, e.key === 'ArrowUp' ? -1 : 1);
      this.rows.get(doc)?.open.focus();
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
    if (e.touches.length !== 1 || this.gesture) return;
    const doc = this.docOf(e.target);
    const row = doc ? this.rows.get(doc) : undefined;
    if (!doc || !row || (e.target as Element).closest('.mx-tabdocs__list-close')) return;
    const t = e.touches[0];
    const tracker = new SwipeTracker();
    tracker.start(t.clientX, t.clientY);
    const gesture: Gesture = { id: t.identifier, doc, row, x: t.clientX, y: t.clientY, mode: 'wait', timer: undefined, tracker, from: null };
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
    const el = gesture.row.element;
    gesture.from = { list: el.parentElement!, next: el.nextElementSibling };
    el.toggleAttribute('data-lifted', true);
    this.sections.toggleAttribute('data-dragging', true);
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
      if (g.mode === 'swipe') g.row.element.toggleAttribute('data-swiping', true);
    }
    if (g.mode === 'scroll') return;
    if (e.cancelable) e.preventDefault();
    if (g.mode === 'swipe') {
      g.row.element.style.translate = `${Math.round(dx)}px 0`;
      return;
    }
    this.dragTo(g, t.clientX, t.clientY);
  }

  /** The lifted row goes where the finger is: before or after the row under it, or into an empty section. */
  private dragTo(g: Gesture, x: number, y: number): void {
    const el = g.row.element;
    el.style.translate = '';
    const doc = this.sections.ownerDocument;
    const under = doc.elementsFromPoint(x, y).find((n) => n !== el && !el.contains(n) && this.sections.contains(n));
    const row = under?.closest('.mx-tabdocs__list-row');
    if (row && row !== el) {
      const box = row.getBoundingClientRect();
      const after = y > box.top + box.height / 2;
      row.parentElement!.insertBefore(el, after ? row.nextElementSibling : row);
    } else {
      const section = under?.closest('.mx-tabdocs__list-section');
      const list = section?.querySelector('.mx-tabdocs__list-rows');
      if (list && !list.contains(el)) list.append(el);
    }
    // Near an end of the list, it scrolls.
    const scroller = this.sheet.contentElement;
    const box = scroller.getBoundingClientRect();
    if (y < box.top + 48) scroller.scrollTop -= 12;
    else if (y > box.bottom - 48) scroller.scrollTop += 12;
  }

  private touchEnd(e: TouchEvent): void {
    const g = this.gesture;
    const t = g && Array.from(e.changedTouches).find((c) => c.identifier === g.id);
    if (!g || !t) return;
    const canceled = e.type === 'touchcancel';
    this.endGesture();
    if (g.mode === 'swipe') {
      e.preventDefault();
      const el = g.row.element;
      el.removeAttribute('data-swiping');
      const dx = t.clientX - g.x;
      const speed = g.tracker.velocity('x');
      const far = Math.abs(dx) > el.getBoundingClientRect().width * 0.35 || Math.abs(speed) > 0.5;
      if (!canceled && far) {
        el.style.translate = `${dx < 0 ? -100 : 100}% 0`;
        untracked(() => void this.closeDocument(g.doc));
      } else {
        el.style.translate = '';
      }
      return;
    }
    if (g.mode === 'drag') {
      e.preventDefault();
      untracked(() => this.drop(g, canceled));
    }
    // Let go before the long press: a tap, which the click that follows handles.
  }

  private endGesture(): void {
    const g = this.gesture;
    if (!g) return;
    clearTimeout(g.timer);
    this.gesture = null;
    g.row.element.removeAttribute('data-lifted');
    this.sections.removeAttribute('data-dragging');
  }

  /** The lifted row let go: where it is now is where the document goes; not moved, its commands open. */
  private drop(g: Gesture, canceled: boolean): void {
    const el = g.row.element;
    const from = g.from;
    const moved = !!from && (el.parentElement !== from.list || el.nextElementSibling !== from.next);
    if (canceled || !moved) {
      if (from && moved) from.list.insertBefore(el, from.next);
      this.render();
      if (!canceled && g.doc.group) this.manager.openDocumentSheet(g.doc, g.doc.group, false, g.row.open);
      return;
    }
    const list = el.parentElement;
    const group = [...this.lists].find(([, part]) => part.list === list)?.[0];
    const rows = [...(list?.children ?? [])].filter((r) => r !== el);
    const index = rows.indexOf(el.previousElementSibling as Element) + 1;
    if (group) this.manager.moveFromList(g.doc, group, index);
    this.render();
    this.rows.get(g.doc)?.open.focus({ preventScroll: true });
  }
}
