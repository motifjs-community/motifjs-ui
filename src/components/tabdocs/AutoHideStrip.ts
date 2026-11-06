import { untracked } from '@motifx/core';
import { follow } from '../../core/follow';
import { iconNode } from '../../core/icon-node';
import { isChord } from '../../core/keyboard';
import { nextId } from '../../core/next-id';
import { isElement } from '../../core/node-kind';
import type { UiStrings } from '../../core/ui-strings';
import type { TabDockArea } from './TabDockArea';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';

const AREA_TEXTS = { left: 'tabDocsHiddenLeft', right: 'tabDocsHiddenRight', top: 'tabDocsHiddenTop', bottom: 'tabDocsHiddenBottom' } as const satisfies Record<string, keyof UiStrings>;

/**
 * The tab titles of a folded dock area, along the manager's edge (a toolbar). Choosing one (a
 * click, Enter or Space, or resting the pointer on it when `autoHideHover` is on) slides the area
 * out over the documents with that document shown; the arrow keys go along the titles.
 */
export class AutoHideStrip {
  readonly element: HTMLDivElement;
  private readonly buttons = new Map<TabDocument, HTMLButtonElement>();
  /** What lets go of each title's icon. */
  private readonly icons = new Map<TabDocument, () => void>();
  private readonly stops: (() => void)[] = [];
  private hoverTimer: ReturnType<typeof setTimeout> | undefined;
  private leaveTimer: ReturnType<typeof setTimeout> | undefined;
  private current: TabDocument | null = null;

  constructor(
    private readonly manager: TabDocumentManager,
    private readonly area: TabDockArea,
  ) {
    const el = (this.element = manager.element.ownerDocument.createElement('div'));
    el.className = 'mx-tabdocs__autohide';
    el.dataset.side = area.side;
    el.setAttribute('role', 'toolbar');
    el.setAttribute('aria-orientation', area.orientation === 'horizontal' ? 'vertical' : 'horizontal');
    el.hidden = true;
    el.addEventListener('click', (e) => {
      const doc = this.documentAt(e.target);
      if (doc) manager.slideByUser(doc, false);
    });
    el.addEventListener('keydown', (e) => untracked(() => this.key(e)));
    el.addEventListener('mousedown', (e) => {
      // A click slides the area out; focus goes into it from there.
      if (this.documentAt(e.target)) e.preventDefault();
    });
    el.addEventListener('pointerover', (e) => untracked(() => this.hoverOn(this.documentAt(e.target))));
    el.addEventListener('pointerleave', () => untracked(() => this.hoverOff()));
    area.element.addEventListener('pointerenter', () => clearTimeout(this.leaveTimer));
    area.element.addEventListener('pointerleave', () => untracked(() => this.hoverOff()));
    this.stops.push(
      follow(
        manager,
        'strip',
        () => {
          // On a tablet every dock area shows this way, in a drawer or a sheet; on a phone none does.
          const presentation = manager.currentPresentation;
          const folded = presentation === 'tablet' ? manager.toolStripShown(area) : presentation === 'desktop' && area.autoHidden;
          const groups = area.groups.map((g) => ({ docs: g.documents, active: g.activeDocument }));
          for (const g of groups) for (const d of g.docs) void d.title, void d.icon;
          return { folded, groups, open: area.isOpen, label: manager.textOf(AREA_TEXTS[area.side]) };
        },
        ({ folded, groups, open, label }) => this.render(folded, groups, open, label),
      ),
    );
  }

  /** Focuses the title of the document shown last (the one slid out), else the first. */
  focusActive(): boolean {
    const button = (this.current && this.buttons.get(this.current)) ?? this.element.querySelector<HTMLButtonElement>('button');
    if (!button || this.element.hidden) return false;
    button.focus();
    return true;
  }

  dispose(): void {
    clearTimeout(this.hoverTimer);
    clearTimeout(this.leaveTimer);
    for (const stop of this.stops.splice(0)) stop();
    for (const release of this.icons.values()) release();
    this.icons.clear();
    this.element.remove();
  }

  private render(folded: boolean, groups: { docs: readonly TabDocument[]; active: TabDocument | null }[], open: boolean, label: string): void {
    const el = this.element;
    el.hidden = !folded;
    el.setAttribute('aria-label', label);
    if (!folded) return;
    const shown = open ? (groups.find((g) => g.active?.group?.isActive)?.active ?? groups[0]?.active ?? null) : null;
    if (shown) this.current = shown;
    const wanted: HTMLButtonElement[] = [];
    const docs = groups.flatMap((g) => g.docs);
    for (const [doc, button] of this.buttons) {
      if (!docs.includes(doc)) {
        button.remove();
        this.buttons.delete(doc);
        this.icons.get(doc)?.();
        this.icons.delete(doc);
      }
    }
    groups.forEach((g, i) =>
      g.docs.forEach((doc, j) => {
        const button = this.buttonOf(doc);
        button.toggleAttribute('data-group-start', i > 0 && j === 0);
        const on = open && g.active === doc;
        button.setAttribute('aria-expanded', String(on));
        button.toggleAttribute('data-open', on);
        wanted.push(button);
      }),
    );
    wanted.forEach((button, i) => {
      if (el.children[i] !== button) el.insertBefore(button, el.children[i] ?? null);
    });
    // A roving tab stop: the document shown last, else the first.
    const stop = (this.current && this.buttons.get(this.current)) ?? wanted[0];
    for (const button of wanted) button.tabIndex = button === stop ? 0 : -1;
  }

  private buttonOf(doc: TabDocument): HTMLButtonElement {
    let button = this.buttons.get(doc);
    const owner = this.element.ownerDocument;
    if (!button) {
      button = owner.createElement('button');
      button.type = 'button';
      button.className = 'mx-tabdocs__autohide-tab';
      button.id = nextId('tabdocs-hidden');
      button.setAttribute('aria-controls', this.area.element.id);
      this.buttons.set(doc, button);
    }
    const icon = doc.icon;
    const title = owner.createElement('span');
    title.className = 'mx-tabdocs__autohide-title';
    title.textContent = doc.title;
    const parts: Node[] = [];
    this.icons.get(doc)?.();
    this.icons.delete(doc);
    if (icon) {
      const holder = owner.createElement('span');
      holder.className = 'mx-tabdocs__icon';
      holder.setAttribute('aria-hidden', 'true');
      const shown = iconNode(icon);
      holder.append(shown.node);
      this.icons.set(doc, shown.release);
      parts.push(holder);
    }
    button.replaceChildren(...parts, title);
    return button;
  }

  private documentAt(target: EventTarget | null): TabDocument | null {
    const button = isElement(target) ? target.closest('.mx-tabdocs__autohide-tab') : null;
    for (const [doc, b] of this.buttons) if (b === button) return doc;
    return null;
  }

  private key(e: KeyboardEvent): void {
    const keys = this.manager.keys;
    const buttons = [...this.element.querySelectorAll<HTMLButtonElement>('.mx-tabdocs__autohide-tab')];
    const at = buttons.indexOf(e.target as HTMLButtonElement);
    if (at < 0) return;
    let next = -1;
    if (isChord(keys.autoHideNext, e)) next = (at + 1) % buttons.length;
    else if (isChord(keys.autoHidePrevious, e)) next = (at - 1 + buttons.length) % buttons.length;
    else if (isChord(keys.stripFirst, e)) next = 0;
    else if (isChord(keys.stripLast, e)) next = buttons.length - 1;
    else if (e.key === 'Escape' && this.manager.slidArea === this.area) {
      e.preventDefault();
      this.manager.hideAutoHidden();
      return;
    }
    if (next < 0) return;
    e.preventDefault();
    e.stopPropagation();
    for (const button of buttons) button.tabIndex = -1;
    buttons[next].tabIndex = 0;
    buttons[next].focus();
  }

  /** Resting on a title slides the area out after `autoHideDelay`. */
  private hoverOn(doc: TabDocument | null): void {
    clearTimeout(this.leaveTimer);
    clearTimeout(this.hoverTimer);
    const m = this.manager;
    if (!doc || !m.autoHideHover || (m.slidArea === this.area && doc.group?.activeDocument === doc)) return;
    this.hoverTimer = setTimeout(() => untracked(() => m.slideByUser(doc, true)), m.autoHideDelay);
  }

  /** The pointer left the titles and the area: one slid out by resting on a title slides back. */
  private hoverOff(): void {
    clearTimeout(this.hoverTimer);
    clearTimeout(this.leaveTimer);
    const m = this.manager;
    this.leaveTimer = setTimeout(() => m.slideHoverEnded(this.area), m.autoHideDelay);
  }
}
