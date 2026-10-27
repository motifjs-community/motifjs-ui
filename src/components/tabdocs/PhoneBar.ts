import { untracked } from '@motifx/core';
import { dismissMark } from '../../core/glyphs';
import { iconNode } from '../../core/icon-node';
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
  readonly element: HTMLDivElement;
  private readonly title: HTMLButtonElement;
  private readonly label: HTMLSpanElement;
  private readonly icon: HTMLSpanElement;
  private readonly unsaved: HTMLSpanElement;
  private readonly close: Button;
  private readonly count: Button;
  private releaseIcon: () => void = () => {};
  private shown: TabDocument | null = null;
  private swipe: { id: number; x: number; y: number; decided: boolean; taken: boolean; tracker: SwipeTracker } | null = null;

  constructor(
    private readonly manager: TabDocumentManager,
    private readonly presenter: TabPresenter,
  ) {
    const doc = manager.element.ownerDocument;
    const el = (this.element = doc.createElement('div'));
    el.className = 'mx-tabdocs__phone-bar';
    el.setAttribute('role', 'toolbar');
    const title = (this.title = doc.createElement('button'));
    title.type = 'button';
    title.className = 'mx-tabdocs__phone-title';
    title.setAttribute('aria-haspopup', 'dialog');
    this.icon = span(doc, 'mx-tabdocs__icon');
    this.icon.setAttribute('aria-hidden', 'true');
    this.label = span(doc, 'mx-tabdocs__phone-label');
    this.unsaved = span(doc, 'mx-tabdocs__phone-dirty');
    this.unsaved.setAttribute('aria-hidden', 'true');
    title.append(this.icon, this.label, this.unsaved);
    this.close = new Button({ variant: 'ghost', size: 'lg', icon: dismissMark() });
    this.close.element.classList.add('mx-tabdocs__phone-close');
    this.count = new Button({ variant: 'outline', size: 'lg' });
    this.count.element.classList.add('mx-tabdocs__phone-count');
    this.count.element.setAttribute('aria-haspopup', 'dialog');
    // Built here and placed in the bar, not among the manager's children (core would put them back there).
    this.close.build();
    this.count.build();
    el.append(title, this.close.element, this.count.element);
    manager.element.append(el);

    title.addEventListener('click', () => untracked(() => this.openCommands(false)));
    title.addEventListener('keydown', (e) => untracked(() => this.key(e)));
    // The touchmove listener is there before a finger lands: only then can a swipe keep the page still.
    title.addEventListener('touchstart', (e) => this.touchStart(e), { passive: true });
    title.addEventListener('touchmove', (e) => this.touchMove(e), { passive: false });
    title.addEventListener('touchend', (e) => this.touchEnd(e));
    title.addEventListener('touchcancel', (e) => this.touchEnd(e));
    this.close.element.addEventListener('click', () =>
      untracked(() => {
        const group = this.presenter.phoneDocument?.group;
        if (group) this.manager.closeActiveByUser(group);
      }),
    );
    this.count.element.addEventListener('click', () => untracked(() => this.presenter.showList()));
  }

  render(): void {
    const m = this.manager;
    const doc = this.presenter.phoneDocument;
    const docs = this.presenter.listDocuments();
    this.element.setAttribute('aria-label', m.textOf('tabDocsDocuments'));
    if (doc !== this.shown) {
      this.shown = doc;
      this.renderIcon(doc);
    }
    this.label.textContent = doc ? doc.title : m.textOf('tabDocsEmpty');
    this.unsaved.hidden = !doc?.dirty;
    this.title.setAttribute('aria-label', doc ? m.textOf('tabDocsPhoneTitle', { title: doc.title }) : m.textOf('tabDocsEmpty'));
    this.title.disabled = !doc;
    // Not `visible`: the button is built here, outside the component tree, and stays in place.
    this.close.element.hidden = !doc;
    if (doc) {
      this.close.element.setAttribute('aria-label', m.textOf(doc.closable ? 'tabDocsCloseActive' : 'tabDocsHideActive', { title: doc.title }));
      this.close.enabled = m.mayCloseOrHide(doc);
    }
    this.count.text = String(docs.length);
    this.count.element.setAttribute('aria-label', m.textOf('tabDocsPhoneCount', { n: docs.length }));
    this.count.element.setAttribute('aria-expanded', String(this.presenter.listOpen));
  }

  dispose(): void {
    this.releaseIcon();
    for (const button of [this.close, this.count]) if (!button.isDisposed) void button.dispose();
    this.element.remove();
  }

  /** The commands of the document shown, as an action sheet. */
  private openCommands(byKeyboard: boolean): void {
    const doc = this.presenter.phoneDocument;
    if (doc?.group) this.manager.openDocumentSheet(doc, doc.group, byKeyboard, this.title);
  }

  private key(e: KeyboardEvent): void {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const rtl = this.manager.element.ownerDocument.defaultView?.getComputedStyle(this.title).direction === 'rtl';
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
    this.title.focus();
  }

  private renderIcon(doc: TabDocument | null): void {
    this.releaseIcon();
    this.releaseIcon = () => {};
    const icon = doc?.icon;
    this.icon.hidden = !icon;
    if (!icon) {
      this.icon.replaceChildren();
      return;
    }
    const shown = iconNode(icon, this.element.ownerDocument);
    this.icon.replaceChildren(shown.node);
    this.releaseIcon = shown.release;
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
      if (swipe.taken) this.title.toggleAttribute('data-swiping', true);
    }
    if (!swipe.taken) return;
    if (e.cancelable) e.preventDefault();
    this.label.style.translate = `${Math.round(dx)}px 0`;
  }

  private touchEnd(e: TouchEvent): void {
    const swipe = this.swipe;
    if (!swipe || !Array.from(e.changedTouches).some((c) => c.identifier === swipe.id)) return;
    this.swipe = null;
    if (!swipe.taken) return;
    // A swipe is not a tap: the click that may follow does nothing.
    e.preventDefault();
    this.title.removeAttribute('data-swiping');
    this.label.style.translate = '';
    const t = Array.from(e.changedTouches).find((c) => c.identifier === swipe.id)!;
    const dx = t.clientX - swipe.x;
    const speed = swipe.tracker.velocity('x');
    if (e.type === 'touchcancel' || (Math.abs(dx) < 48 && Math.abs(speed) < 0.4)) return;
    const rtl = this.manager.element.ownerDocument.defaultView?.getComputedStyle(this.title).direction === 'rtl';
    // Swiping to the left brings the next document in, as pages turn.
    untracked(() => this.go((dx < 0) !== rtl ? 1 : -1));
  }
}

function span(doc: Document, className: string): HTMLSpanElement {
  const el = doc.createElement('span');
  el.className = className;
  return el;
}
