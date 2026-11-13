import { untracked, type Component } from '@motifx/core';
import { clearParts, loose, part } from '../../core/draw-parts';
import { focusOn } from '../../core/focus';
import { dismissMark } from '../../core/glyphs';
import { isRtl } from '../../core/measure';
import { css, mark, put, text } from '../../core/part-writes';
import { showIcon } from '../../core/show-icon';
import { SwipeTracker } from '../../parts/overlay/swipe-tracker';
import { Button } from '../button/Button';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabPresenter } from './TabPresenter';

/** How far, in pixels, a finger moves on the title before it is a swipe. */
const SLOP = 8;

/**
 * The bar above the document a phone shows: its title (a swipe on it goes to the document beside,
 * a tap opens its commands), its close button, and the number of open documents, which opens the
 * list of them.
 */
export class PhoneBar {
  /** The bar as a component of the manager: its buttons are its children. */
  private readonly part: Component<HTMLDivElement>;
  private readonly title: Component<HTMLButtonElement>;
  private readonly label: Component<HTMLSpanElement>;
  private readonly icon: Component<HTMLSpanElement>;
  private readonly unsaved: Component<HTMLSpanElement>;
  private readonly close: Button;
  private readonly count: Button;
  private releaseIcon: () => void = () => {};
  private shown: TabDocument | null = null;
  private swipe: { id: number; x: number; y: number; decided: boolean; taken: boolean; tracker: SwipeTracker } | null = null;

  constructor(
    private readonly manager: TabDocumentManager,
    private readonly presenter: TabPresenter,
  ) {
    this.part = loose<HTMLDivElement>('div', 'mx-tabdocs__phone-bar');
    this.part.attr.add({ role: 'toolbar' });
    const titlePart = (this.title = part<HTMLButtonElement>(this.part, 'button', 'mx-tabdocs__phone-title'));
    titlePart.attr.add({ type: 'button', 'aria-haspopup': 'dialog' });
    this.icon = part<HTMLSpanElement>(titlePart, 'span', 'mx-tabdocs__icon');
    this.icon.attr.add({ 'aria-hidden': 'true' });
    this.label = part<HTMLSpanElement>(titlePart, 'span', 'mx-tabdocs__phone-label');
    this.unsaved = part<HTMLSpanElement>(titlePart, 'span', 'mx-tabdocs__phone-dirty');
    this.unsaved.attr.add({ 'aria-hidden': 'true' });
    this.close = new Button({ icon: dismissMark() });
    this.close.class.add('mx-tabdocs__phone-close');
    this.count = new Button();
    this.count.class.add('mx-tabdocs__phone-count');
    this.count.attr.add({ 'aria-haspopup': 'dialog' });
    this.part.controls.add(this.close, this.count);
    manager.controls.add(this.part);

    titlePart.motif.on('click', () => untracked(() => this.openCommands(false)));
    titlePart.motif.on('keydown', (_, e) => untracked(() => this.key(e)));
    // The touchmove listener is there before a finger lands: only then can a swipe keep the page still.
    titlePart.motif.on('touchstart:passive', (_, e: TouchEvent | undefined) => e && this.touchStart(e));
    titlePart.motif.on('touchmove', (_, e: TouchEvent | undefined) => e && this.touchMove(e));
    titlePart.motif.on('touchend', (_, e: TouchEvent | undefined) => e && this.touchEnd(e));
    titlePart.motif.on('touchcancel', (_, e: TouchEvent | undefined) => e && this.touchEnd(e));
    this.close.motif.on('click', () =>
      untracked(() => {
        const group = this.presenter.phoneDocument?.group;
        if (group) this.manager.closeActiveByUser(group);
      }),
    );
    this.count.motif.on('click', () => untracked(() => this.presenter.showList()));
  }

  render(): void {
    const m = this.manager;
    const doc = this.presenter.phoneDocument;
    const docs = this.presenter.listDocuments();
    put(this.part, 'aria-label', m.textOf('tabDocsDocuments'));
    if (doc !== this.shown) {
      this.shown = doc;
      this.renderIcon(doc);
    }
    text(this.label, doc ? doc.title : m.textOf('tabDocsEmpty'));
    mark(this.unsaved, 'hidden', !doc?.dirty);
    put(this.title, 'aria-label', doc ? m.textOf('tabDocsPhoneTitle', { title: doc.title }) : m.textOf('tabDocsEmpty'));
    mark(this.title, 'disabled', !doc);
    // Not `visible`: the button is built here, outside the component tree, and stays in place.
    mark(this.close, 'hidden', !doc);
    if (doc) {
      put(this.close, 'aria-label', m.textOf(doc.closable ? 'tabDocsCloseActive' : 'tabDocsHideActive', { title: doc.title }));
      this.close.enabled = m.mayCloseOrHide(doc);
    }
    this.count.text = String(docs.length);
    put(this.count, 'aria-label', m.textOf('tabDocsPhoneCount', { n: docs.length }));
    put(this.count, 'aria-expanded', String(this.presenter.listOpen));
    // Outside the component tree the buttons are never mounted: on the page, they read their look from the bar's places.
    this.close.readLook();
    this.count.readLook();
  }

  dispose(): void {
    this.releaseIcon();
    // Its buttons go with it.
    if (this.part.parent) this.part.parent.controls.remove(this.part);
    else if (!this.part.isDisposed) void this.part.dispose();
  }

  /** The commands of the document shown, as an action sheet. */
  private openCommands(byKeyboard: boolean): void {
    const doc = this.presenter.phoneDocument;
    if (doc?.group) this.manager.openDocumentSheet(doc, doc.group, byKeyboard, this.title);
  }

  private key(e: KeyboardEvent): void {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const rtl = isRtl(this.title);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      this.go((e.key === 'ArrowRight') !== rtl ? 1 : -1);
    } else if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
      e.preventDefault();
      this.openCommands(true);
    }
  }

  /** To the document beside the one shown, round at the ends. */
  private go(by: 1 | -1): void {
    const docs = this.presenter.listDocuments();
    const at = this.shown ? docs.indexOf(this.shown) : -1;
    if (docs.length < 2) return;
    const next = docs[(at + by + docs.length) % docs.length];
    this.manager.activateFromList(next);
    focusOn(this.title);
  }

  private renderIcon(doc: TabDocument | null): void {
    this.releaseIcon();
    this.releaseIcon = () => {};
    const icon = doc?.icon;
    mark(this.icon, 'hidden', !icon);
    clearParts(this.icon);
    if (icon) this.releaseIcon = showIcon(icon, this.icon);
  }

  private touchStart(e: TouchEvent): void {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    const tracker = new SwipeTracker();
    tracker.start(t.clientX, t.clientY);
    this.swipe = { id: t.identifier, x: t.clientX, y: t.clientY, decided: false, taken: false, tracker };
  }

  private touchMove(e: TouchEvent): void {
    const swipe = this.swipe;
    const t = swipe && Array.from(e.changedTouches).find((c) => c.identifier === swipe.id);
    if (!swipe || !t) return;
    swipe.tracker.move(t.clientX, t.clientY);
    const dx = t.clientX - swipe.x;
    const dy = t.clientY - swipe.y;
    if (!swipe.decided) {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      swipe.decided = true;
      swipe.taken = Math.abs(dx) > Math.abs(dy) && this.presenter.listDocuments().length > 1;
      if (swipe.taken) mark(this.title, 'data-swiping', true);
    }
    if (!swipe.taken) return;
    if (e.cancelable) e.preventDefault();
    css(this.label, 'translate', `${Math.round(dx)}px 0`);
  }

  private touchEnd(e: TouchEvent): void {
    const swipe = this.swipe;
    if (!swipe || !Array.from(e.changedTouches).some((c) => c.identifier === swipe.id)) return;
    this.swipe = null;
    if (!swipe.taken) return;
    // A swipe is not a tap: the click that may follow does nothing.
    e.preventDefault();
    mark(this.title, 'data-swiping', false);
    css(this.label, 'translate', '');
    const t = Array.from(e.changedTouches).find((c) => c.identifier === swipe.id)!;
    const dx = t.clientX - swipe.x;
    const speed = swipe.tracker.velocity('x');
    if (e.type === 'touchcancel' || (Math.abs(dx) < 48 && Math.abs(speed) < 0.4)) return;
    const rtl = isRtl(this.title);
    // Swiping to the left brings the next document in, as pages turn.
    untracked(() => this.go((dx < 0) !== rtl ? 1 : -1));
  }
}
