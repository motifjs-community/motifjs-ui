import { Component, createSignal, untracked } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import { loose, part } from '../../core/draw-parts';
import { focusOn } from '../../core/focus';
import { follow } from '../../core/follow';
import { kept, mark, put, text } from '../../core/part-writes';
import { showIcon } from '../../core/show-icon';
import { isChord } from '../../core/keyboard';
import { nextId } from '../../core/next-id';
import type { UiStrings } from '../../core/ui-strings';
import type { TabDockArea } from './TabDockArea';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import { dropPart, layoutPart } from './place-node';

const AREA_TEXTS = { left: 'tabDocsHiddenLeft', right: 'tabDocsHiddenRight', top: 'tabDocsHiddenTop', bottom: 'tabDocsHiddenBottom' } as const satisfies Record<string, keyof UiStrings>;

/**
 * The tab titles of a folded dock area, along the manager's edge (a toolbar). Choosing one (a
 * click, Enter or Space, or resting the pointer on it when `autoHideHover` is on) slides the area
 * out over the documents with that document shown; the arrow keys go along the titles.
 */
export class AutoHideStrip {
  /** As a component of the layout. */
  readonly part: Component<HTMLDivElement>;
  private readonly buttons = new Map<TabDocument, Component<HTMLButtonElement>>();
  /** The documents whose titles the strip holds, in order: a title is made when its document comes and kept while it stays. */
  private readonly docs = createSignal<readonly TabDocument[]>([]);
  private readonly stops: (() => void)[] = [];
  private hoverTimer: ReturnType<typeof setTimeout> | undefined;
  private leaveTimer: ReturnType<typeof setTimeout> | undefined;
  private current: TabDocument | null = null;
  /** Shown along the edge: the area is folded. */
  private folded = false;

  constructor(
    private readonly manager: TabDocumentManager,
    private readonly area: TabDockArea,
  ) {
    this.part = new Component<HTMLDivElement>('div');
    layoutPart(this.part);
    this.part.class.add('mx-tabdocs__autohide');
    this.part.attr.add({ 'data-side': area.side, role: 'toolbar', 'aria-orientation': area.orientation === 'horizontal' ? 'vertical' : 'horizontal' });
    kept(this.part, false);
    const strip = this.part;
    strip.bindings.list(() => this.docs.value, (doc: TabDocument) => this.buttonOf(doc));
    strip.motif.on('click', (_, e) => {
      const doc = this.documentFrom(e);
      if (doc) manager.slideByUser(doc, false);
    });
    strip.motif.on('keydown', (_, e) => untracked(() => this.key(e)));
    strip.motif.on('mousedown', (_, e) => {
      // A click slides the area out; focus goes into it from there.
      if (this.documentFrom(e)) e.preventDefault();
    });
    strip.motif.on('pointerover', (_, e) => untracked(() => this.hoverOn(this.documentFrom(e))));
    strip.motif.on('pointerleave', () => untracked(() => this.hoverOff()));
    // The area slid out keeps it open while the pointer is over it; the strip stops listening when it goes.
    const enter = () => clearTimeout(this.leaveTimer);
    const leave = () => untracked(() => this.hoverOff());
    void area.part.motif.on('pointerenter', enter);
    void area.part.motif.on('pointerleave', leave);
    this.stops.push(() => {
      void area.part.motif.off('pointerenter', enter);
      void area.part.motif.off('pointerleave', leave);
    });
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
    const first = untracked(() => this.docs.value[0]);
    const button = (this.current && this.buttons.get(this.current)) ?? (first && this.buttons.get(first));
    if (!button || !this.folded) return false;
    focusOn(button);
    return true;
  }

  dispose(): void {
    clearTimeout(this.hoverTimer);
    clearTimeout(this.leaveTimer);
    for (const stop of this.stops.splice(0)) stop();
    dropPart(this.part);
  }

  private render(folded: boolean, groups: { docs: readonly TabDocument[]; active: TabDocument | null }[], open: boolean, label: string): void {
    this.folded = folded;
    kept(this.part, folded);
    put(this.part, 'aria-label', label);
    if (!folded) return;
    const shown = open ? (groups.find((g) => g.active?.group?.isActive)?.active ?? groups[0]?.active ?? null) : null;
    if (shown) this.current = shown;
    const wanted: Component<HTMLButtonElement>[] = [];
    const docs = groups.flatMap((g) => g.docs);
    // The titles come and go with the documents; the ones that stay keep their buttons.
    const before = untracked(() => this.docs.value);
    if (before.length !== docs.length || docs.some((d, i) => d !== before[i])) this.docs.value = docs;
    groups.forEach((g, i) =>
      g.docs.forEach((doc, j) => {
        const button = this.buttonOf(doc);
        mark(button, 'data-group-start', i > 0 && j === 0);
        const on = open && g.active === doc;
        put(button, 'aria-expanded', String(on));
        mark(button, 'data-open', on);
        wanted.push(button);
      }),
    );
    // A roving tab stop: the document shown last, else the first.
    const stop = (this.current && this.buttons.get(this.current)) ?? wanted[0];
    for (const button of wanted) put(button, 'tabindex', button === stop ? '0' : '-1');
  }

  /** The title of a document, made once (and placed by the strip's list): its icon and its text follow the document. */
  private buttonOf(doc: TabDocument): Component<HTMLButtonElement> {
    const made = this.buttons.get(doc);
    if (made && !made.isDisposed) return made;
    const button = loose<HTMLButtonElement>('button', 'mx-tabdocs__autohide-tab');
    button.attr.add({ type: 'button', id: nextId('tabdocs-hidden') });
    put(button, 'aria-controls', this.area.id);
    this.buttons.set(doc, button);
    // The icon's part comes and goes with the icon; it lets go of the icon when it goes.
    button.bindings.list(
      () => {
        const icon = doc.icon;
        return icon ? [icon] : [];
      },
      (icon: IconSource) => {
        const holder = loose<HTMLSpanElement>('span', 'mx-tabdocs__icon');
        holder.attr.add({ 'aria-hidden': 'true' });
        holder.motif.setDisposable(showIcon(icon, holder));
        return holder;
      },
    );
    const title = part<HTMLSpanElement>(button, 'span', 'mx-tabdocs__autohide-title');
    button.bindings.watch(() => {
      const now = doc.title;
      untracked(() => text(title, now));
    });
    button.motif.setDisposable(() => {
      if (this.buttons.get(doc) === button) this.buttons.delete(doc);
    });
    return button;
  }

  /** The document whose title an event started on. */
  private documentFrom(e: Event): TabDocument | null {
    for (const [doc, button] of this.buttons) if (button.motif.isEventFrom(e)) return doc;
    return null;
  }

  private key(e: KeyboardEvent): void {
    const keys = this.manager.keys;
    // The titles, in the strip's order.
    const buttons = this.docs.value.map((doc) => this.buttons.get(doc)).filter((b): b is Component<HTMLButtonElement> => !!b);
    const at = buttons.findIndex((button) => button.motif.isEventFrom(e));
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
    const to = buttons[next];
    for (const button of buttons) put(button, 'tabindex', button === to ? '0' : '-1');
    focusOn(to);
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
