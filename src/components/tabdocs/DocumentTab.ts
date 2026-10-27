import { Component, effect, untracked, type ComponentBase } from '@motifx/core';
import { setAccessKeyAttribute } from '../../core/access-key';
import { focusableIn, isFocusable } from '../../core/focus';
import { dismissMark, pinMark } from '../../core/glyphs';
import { iconNode } from '../../core/icon-node';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { Tooltip } from '../tooltip/Tooltip';
import type { ContentLifetime } from './content-lifetime';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';

/**
 * An open document in the manager: its tab in a group's strip and its panel. Both move with it from
 * group to group; the content in the panel is never made again for a move.
 */
export class DocumentTab {
  readonly header: HTMLButtonElement;
  readonly panel: Component<HTMLDivElement>;
  group: TabGroup | null = null;
  /** What had focus last in the panel. */
  lastFocus: HTMLElement | null = null;
  private readonly label: HTMLSpanElement;
  private readonly letter: HTMLSpanElement;
  private readonly close: HTMLSpanElement;
  private readonly pin: HTMLSpanElement;
  private readonly unsaved: HTMLSpanElement;
  private readonly status: HTMLSpanElement;
  private description: HTMLSpanElement | null = null;
  private icon: HTMLSpanElement | null = null;
  private releaseIcon: () => void = () => {};
  private badge: HTMLSpanElement | null = null;
  private tooltip: Tooltip | null = null;
  private tipHolder: Component<HTMLDivElement> | null = null;
  private closeKey: string | null = null;
  private content: ComponentBase | null = null;
  private shown = false;
  /** What scrolled in the panel: a hidden element tells no scroll, and a move into another window loses it. */
  private readonly scrolls = new Map<Element, [number, number]>();
  /** The document the panel was in when it was hidden. */
  private hiddenIn: Document | null = null;
  private readonly stops: (() => void)[] = [];

  constructor(
    readonly document: TabDocument,
    private manager: TabDocumentManager,
  ) {
    const owner = manager.element.ownerDocument;
    const header = (this.header = owner.createElement('button'));
    header.type = 'button';
    header.className = 'mx-tabdocs__tab';
    header.id = nextId('tabdoc');
    header.tabIndex = -1;
    header.setAttribute('role', 'tab');
    header.setAttribute('aria-selected', 'false');
    this.letter = append(header, 'mx-tabdocs__letter');
    this.letter.setAttribute('aria-hidden', 'true');
    this.label = append(header, 'mx-tabdocs__title');
    this.unsaved = append(header, 'mx-tabdocs__hidden');
    this.unsaved.hidden = true;
    this.status = append(header, 'mx-tabdocs__hidden');
    this.status.hidden = true;
    // The pin mark unpins under the pointer; the keyboard has the menu and a key for it.
    this.pin = append(header, 'mx-tabdocs__pin');
    this.pin.setAttribute('aria-hidden', 'true');
    this.pin.append(pinMark());
    this.close = append(header, 'mx-tabdocs__close');
    this.close.setAttribute('aria-hidden', 'true');
    this.close.append(dismissMark());
    append(this.close, 'mx-tabdocs__dirty');

    const panel = (this.panel = new Component<HTMLDivElement>('div'));
    const el = panel.element;
    el.className = 'mx-tabdocs__panel';
    el.id = nextId('tabdoc-panel');
    el.hidden = true;
    el.setAttribute('role', 'tabpanel');
    el.setAttribute('aria-labelledby', header.id);
    header.setAttribute('aria-controls', el.id);
    el.addEventListener('scroll', (e) => this.noteScroll(e.target), { capture: true, passive: true });
    this.render();
  }

  /** The content, `null` while it is not built. */
  get contentComponent(): ComponentBase | null {
    return this.content;
  }

  /** Shows or hides the panel; the content is built or let go as its lifetime says. */
  show(on: boolean): void {
    const el = this.panel.element;
    if (!on && !el.hidden) this.hiddenIn = el.ownerDocument;
    this.shown = on;
    this.header.setAttribute('aria-selected', String(on));
    el.hidden = !on;
    if (on) {
      // Moved into another window while hidden: what scrolled in it scrolls back.
      if (this.hiddenIn && this.hiddenIn !== el.ownerDocument) this.restoreScrolls();
      this.hiddenIn = null;
      this.build();
      this.updatePanelFocus();
    } else if (this.lifetime() === 'dispose') {
      this.release();
    }
  }

  /** Builds the content now when its lifetime is `keep`. */
  prepare(): void {
    if (this.lifetime() === 'keep') this.build();
  }

  /** Moves focus into the panel: where it was last, else the first control, else the tab. `still`: the page does not scroll to it (an area sliding out). */
  focusContent(still = false): boolean {
    const options = { preventScroll: still };
    const last = this.lastFocus;
    if (last && this.panel.element.contains(last) && isFocusable(last)) {
      last.focus(options);
      return true;
    }
    const target = focusableIn(this.panel.element)[0] ?? (isFocusable(this.panel.element) ? this.panel.element : null);
    (target ?? this.header).focus(options);
    return true;
  }

  /** A panel with nothing to focus in it takes focus itself, so Tab reaches it. */
  updatePanelFocus(): void {
    const el = this.panel.element;
    if (el.hidden) return;
    if (focusableIn(el).length) el.removeAttribute('tabindex');
    else if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
  }

  /** The tooltip lives next to the strip of the group the tab is in. */
  attachTooltip(holder: Component<HTMLDivElement> | null): void {
    this.tipHolder = holder;
    void this.tooltip?.dispose();
    this.tooltip = null;
    this.renderTooltip(untracked(() => this.tooltipText()));
  }

  /** The tab goes to another manager (dragged there): from now on it follows that manager's settings. */
  moveTo(manager: TabDocumentManager): void {
    for (const stop of this.stops.splice(0)) stop();
    this.manager = manager;
    this.render();
  }

  dispose(): void {
    for (const stop of this.stops.splice(0)) stop();
    this.releaseIcon();
    this.attachTooltip(null);
    this.header.remove();
    if (!this.panel.isDisposed) void this.panel.dispose();
    this.content = null;
  }

  private noteScroll(target: EventTarget | null): void {
    const el = target as Element | null;
    if (!el || typeof el.scrollTop !== 'number') return;
    if (el.scrollTop || el.scrollLeft) this.scrolls.set(el, [el.scrollTop, el.scrollLeft]);
    else this.scrolls.delete(el);
  }

  private restoreScrolls(): void {
    const panel = this.panel.element;
    for (const [el, [top, left]] of this.scrolls) {
      if (!panel.contains(el)) {
        this.scrolls.delete(el);
        continue;
      }
      el.scrollTop = top;
      el.scrollLeft = left;
    }
  }

  private lifetime(): ContentLifetime {
    return untracked(() => this.document.contentLifetime ?? this.manager.contentLifetime);
  }

  private build(): void {
    if (this.content) return;
    const made = untracked(() => this.manager.makeContent(this.document));
    if (!made) return;
    this.content = made;
    this.panel.controls.add(made);
  }

  private release(): void {
    // A component given as it is cannot be made again: it stays.
    if (!this.content || !this.manager.canRemake(this.document)) return;
    const made = this.content;
    this.content = null;
    this.lastFocus = null;
    this.panel.controls.remove(made);
  }

  private tooltipText(): string {
    const doc = this.document;
    if (doc.tooltip) return doc.tooltip;
    return doc.description ? `${doc.title} — ${doc.description}` : '';
  }

  private watch(fn: () => void): void {
    this.stops.push(effect(fn));
  }

  private render(): void {
    const doc = this.document;
    this.watch(() => {
      const title = doc.title;
      untracked(() => {
        this.label.textContent = title;
        this.letter.textContent = Array.from(title.trim())[0]?.toLocaleUpperCase() ?? '';
        this.manager.tabChanged(this);
      });
    });
    this.watch(() => {
      const text = this.manager.showsDescription(doc) ? doc.description : '';
      untracked(() => this.renderDescription(text));
    });
    this.watch(() => {
      const tone = doc.tone;
      untracked(() => {
        if (tone) this.header.dataset.tone = tone;
        else this.header.removeAttribute('data-tone');
      });
    });
    this.watch(() => {
      const pinned = doc.pinned;
      const preview = doc.preview;
      const text = pinned ? this.manager.textOf('tabDocsPinState') : preview ? this.manager.textOf('tabDocsPreviewState') : '';
      const unpin = this.manager.textOf('tabDocsUnpin');
      untracked(() => {
        const header = this.header;
        const was = header.hasAttribute('data-pinned');
        header.toggleAttribute('data-pinned', pinned);
        header.toggleAttribute('data-preview', preview);
        this.status.textContent = text ? `, ${text}` : '';
        this.status.hidden = !text;
        this.pin.title = unpin;
        if (was !== pinned) this.manager.pinChanged(this);
        this.manager.tabChanged(this);
      });
    });
    this.watch(() => {
      const dirty = doc.dirty;
      untracked(() => {
        if (dirty && doc.preview) this.manager.keepByChange(doc);
      });
    });
    this.watch(() => {
      const icon = doc.icon;
      untracked(() => this.renderIcon(icon));
    });
    this.watch(() => {
      const badge = doc.badge;
      untracked(() => this.renderBadge(badge));
    });
    this.watch(() => {
      const dirty = doc.dirty;
      const closable = doc.closable && (!doc.pinned || this.manager.closeButtonOnPinned);
      const mode = this.manager.closeButton;
      const text = this.manager.textOf('tabDocsUnsaved');
      const closeHint = this.manager.textOf('close');
      untracked(() => {
        const header = this.header;
        header.toggleAttribute('data-dirty', dirty);
        this.unsaved.textContent = `, ${text}`;
        this.unsaved.hidden = !dirty;
        if (closable && mode !== 'never') header.dataset.close = mode;
        else header.removeAttribute('data-close');
        this.close.title = closeHint;
        this.manager.tabChanged(this);
      });
    });
    this.watch(() => {
      const key = doc.closable ? this.manager.closeKeyHint() : null;
      untracked(() => {
        setAccessKeyAttribute(this.header, this.closeKey, key);
        this.closeKey = key;
      });
    });
    this.watch(() => {
      const text = this.tooltipText();
      untracked(() => this.renderTooltip(text));
    });
    this.watch(() => {
      const lifetime = doc.contentLifetime ?? this.manager.contentLifetime;
      untracked(() => {
        if (lifetime === 'keep') this.build();
        else if (lifetime === 'dispose' && !this.shown) this.release();
      });
    });
  }

  private renderTooltip(text: string): void {
    if (text && !this.tooltip && this.tipHolder) {
      this.tooltip = new Tooltip({ target: this.header, text: () => this.tooltipText(), placement: 'bottom' });
      this.tipHolder.controls.add(this.tooltip);
    } else if (!text && this.tooltip) {
      void this.tooltip.dispose();
      this.tooltip = null;
    }
  }

  private renderDescription(text: string): void {
    if (text && !this.description) {
      this.description = this.header.ownerDocument.createElement('span');
      this.description.className = 'mx-tabdocs__description';
      this.label.after(this.description);
    } else if (!text && this.description) {
      this.description.remove();
      this.description = null;
    }
    if (this.description) this.description.textContent = text;
    this.manager.tabChanged(this);
  }

  private renderIcon(icon: IconSource | null): void {
    this.releaseIcon();
    this.releaseIcon = () => {};
    if (!icon) {
      this.icon?.remove();
      this.icon = null;
    } else {
      if (!this.icon) {
        this.icon = this.header.ownerDocument.createElement('span');
        this.icon.className = 'mx-tabdocs__icon';
        this.icon.setAttribute('aria-hidden', 'true');
        this.header.prepend(this.icon);
      }
      const shown = iconNode(icon, this.header.ownerDocument);
      this.icon.replaceChildren(shown.node);
      this.releaseIcon = shown.release;
    }
    this.header.toggleAttribute('data-icon', !!icon);
    this.manager.tabChanged(this);
  }

  private renderBadge(badge: string | number | boolean | null): void {
    const dot = badge === true;
    const text = badge === null || badge === undefined || badge === false || dot ? '' : String(badge);
    if ((text || dot) && !this.badge) {
      this.badge = this.header.ownerDocument.createElement('span');
      this.badge.className = 'mx-tabdocs__badge';
      this.unsaved.before(this.badge);
    } else if (!text && !dot && this.badge) {
      this.badge.remove();
      this.badge = null;
    }
    if (this.badge) {
      this.badge.textContent = text;
      this.badge.toggleAttribute('data-dot', dot);
    }
    this.manager.tabChanged(this);
  }
}

function append(parent: HTMLElement, className: string): HTMLSpanElement {
  const span = parent.ownerDocument.createElement('span');
  span.className = className;
  parent.append(span);
  return span;
}
