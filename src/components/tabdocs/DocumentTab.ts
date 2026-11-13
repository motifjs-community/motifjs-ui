import { Component, untracked, type ComponentBase } from '@motifx/core';
import { setAccessKeyAttribute } from '../../core/access-key';
import { follow } from '../../core/follow';
import { canTakeFocus, focusFirstIn, focusOn, hasFocusableIn, isFocused, rememberFocus } from '../../core/focus';
import type { FocusMark } from '../../core/focus-mark';
import { clearParts, glyphPart, loose, part, partBefore, removePart } from '../../core/draw-parts';
import { keepScroll } from '../../core/measure';
import { kept, mark, put, text as writeText } from '../../core/part-writes';
import { showIcon } from '../../core/show-icon';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { Tooltip } from '../tooltip/Tooltip';
import type { ContentLifetime } from './content-lifetime';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabGroup } from './TabGroup';
import { uiLocale } from '../../core/ui-locale';

/**
 * An open document in the manager: its tab in a group's strip and its panel. Both move with it from
 * group to group; the content in the panel is never recreated for a move.
 */
export class DocumentTab {
  /** The tab's component; its group puts it in its strip. */
  readonly headerPart: Component<HTMLButtonElement>;
  readonly panel: Component<HTMLDivElement>;
  group: TabGroup | null = null;
  /** Where focus was last in the panel. */
  private lastFocus: FocusMark | null = null;
  /** Drawn as pinned: the manager hears when that changes. */
  private pinned = false;
  private readonly label: Component<HTMLSpanElement>;
  private readonly letter: Component<HTMLSpanElement>;
  private readonly close: Component<HTMLSpanElement>;
  private readonly pin: Component<HTMLSpanElement>;
  private readonly unsaved: Component<HTMLSpanElement>;
  private readonly status: Component<HTMLSpanElement>;
  private description: Component<HTMLSpanElement> | null = null;
  private icon: Component<HTMLSpanElement> | null = null;
  private releaseIcon: () => void = () => {};
  private badge: Component<HTMLSpanElement> | null = null;
  private tooltip: Tooltip | null = null;
  private tipHolder: Component<HTMLDivElement> | null = null;
  private closeKey: string | null = null;
  private content: ComponentBase | null = null;
  private shown = false;
  /** Scrolls back what scrolled in the panel when it was hidden: a move into another window while hidden loses it. */
  private restoreScroll: (() => void) | null = null;
  private readonly stops: (() => void)[] = [];

  constructor(
    readonly document: TabDocument,
    private manager: TabDocumentManager,
  ) {
    const headerPart = (this.headerPart = loose<HTMLButtonElement>('button', 'mx-tabdocs__tab'));
    const headerId = nextId('tabdoc');
    headerPart.attr.add({ type: 'button', id: headerId });
    put(headerPart, 'tabindex', '-1');
    headerPart.attr.add({ role: 'tab', 'aria-selected': 'false' });
    this.letter = part<HTMLSpanElement>(headerPart, 'span', 'mx-tabdocs__letter');
    this.letter.attr.add({ 'aria-hidden': 'true' });
    this.label = part<HTMLSpanElement>(headerPart, 'span', 'mx-tabdocs__title');
    this.unsaved = part<HTMLSpanElement>(headerPart, 'span', 'mx-tabdocs__hidden');
    mark(this.unsaved, 'hidden', true);
    this.status = part<HTMLSpanElement>(headerPart, 'span', 'mx-tabdocs__hidden');
    mark(this.status, 'hidden', true);
    // The pin mark unpins under the pointer; the keyboard has the menu and a key for it.
    const pin = part<HTMLSpanElement>(headerPart, 'span', 'mx-tabdocs__pin');
    this.pin = pin;
    pin.attr.add({ 'aria-hidden': 'true' });
    glyphPart(pin, 'pin');
    const close = part<HTMLSpanElement>(headerPart, 'span', 'mx-tabdocs__close');
    this.close = close;
    close.attr.add({ 'aria-hidden': 'true' });
    glyphPart(close, 'dismiss');
    part(close, 'span', 'mx-tabdocs__dirty');

    const panel = (this.panel = loose<HTMLDivElement>('div', 'mx-tabdocs__panel'));
    const panelId = nextId('tabdoc-panel');
    panel.attr.add({ id: panelId, role: 'tabpanel', 'aria-labelledby': headerId });
    // Hidden until the document is shown: out of the page, kept whole.
    kept(panel, false);
    // Where focus goes in the panel, to come back to; the panel itself does not count.
    panel.motif.on('focusin', (_, e) => {
      if (!isFocused(panel)) this.lastFocus = rememberFocus(e);
    });
    this.render();
  }

  /** The content, `null` while it is not built. */
  get contentComponent(): ComponentBase | null {
    return this.content;
  }

  /** Shows or hides the panel; the content is built or let go as its lifetime says. */
  show(on: boolean): void {
    // Noted before the panel hides, while it still tells its scroll.
    if (!on && this.shown) this.restoreScroll = keepScroll(this.panel);
    this.shown = on;
    put(this.headerPart, 'aria-selected', String(on));
    // A hidden panel is out of the page, so only the shown document's tab names its panel.
    put(this.headerPart, 'aria-controls', on ? this.panel.attr.get('id') : null);
    kept(this.panel, on);
    if (on) {
      // In the next frame, once the panel shows again, wherever it was moved meanwhile.
      this.restoreScroll?.();
      this.restoreScroll = null;
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
    if (last?.isIn(this.panel) && last.restore(options)) return true;
    if (focusFirstIn(this.panel, 'any', options)) return true;
    focusOn(canTakeFocus(this.panel) ? this.panel : this.headerPart, options);
    return true;
  }

  /** A panel with nothing to focus in it takes focus itself, so Tab reaches it. */
  updatePanelFocus(): void {
    if (this.shown) put(this.panel, 'tabindex', hasFocusableIn(this.panel) ? null : '0');
  }

  /** Whether an event started on the tab's close button. */
  isCloseEvent(e: Event): boolean {
    return this.close.motif.isEventFrom(e);
  }

  /** Whether an event started on the tab's pin mark. */
  isPinEvent(e: Event): boolean {
    return this.pin.motif.isEventFrom(e);
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
    removePart(this.headerPart);
    if (!this.panel.isDisposed) void this.panel.dispose();
    this.content = null;
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
    // Once the content is in the page, the panel knows whether it still needs a tab stop of its own.
    void made.motif.on('x:mounted', () => this.updatePanelFocus());
  }

  private release(): void {
    // A component given as it is cannot be recreated: it stays.
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

  /** Follows `read` with a binding of the manager: a `reState()` of the manager or the page reads it again. */
  private watch<V>(read: () => V, write: (value: V) => void): void {
    this.stops.push(follow(this.manager, 'tab', read, write));
  }

  private render(): void {
    const doc = this.document;
    this.watch(
      () => doc.title,
      (title) => {
        writeText(this.label, title);
        writeText(this.letter, Array.from(title.trim())[0]?.toLocaleUpperCase(uiLocale.locale) ?? '');
        this.manager.tabChanged(this);
      },
    );
    this.watch(
      () => (this.manager.showsDescription(doc) ? doc.description : ''),
      (text) => this.renderDescription(text),
    );
    this.watch(
      () => doc.tone,
      (tone) => {
        if (tone) put(this.headerPart, 'data-tone', tone);
        else put(this.headerPart, 'data-tone', null);
      },
    );
    this.watch(
      () => {
        const pinned = doc.pinned;
        const preview = doc.preview;
        const text = pinned ? this.manager.textOf('tabDocsPinState') : preview ? this.manager.textOf('tabDocsPreviewState') : '';
        return { pinned, preview, text, unpin: this.manager.textOf('tabDocsUnpin') };
      },
      ({ pinned, preview, text, unpin }) => {
        const was = this.pinned;
        this.pinned = pinned;
        mark(this.headerPart, 'data-pinned', pinned);
        mark(this.headerPart, 'data-preview', preview);
        writeText(this.status, text ? `, ${text}` : '');
        mark(this.status, 'hidden', !text);
        put(this.pin, 'title', unpin);
        if (was !== pinned) this.manager.pinChanged(this);
        this.manager.tabChanged(this);
      },
    );
    this.watch(
      () => doc.dirty,
      (dirty) => {
        if (dirty && doc.preview) this.manager.keepByChange(doc);
      },
    );
    this.watch(
      () => doc.icon,
      (icon) => this.renderIcon(icon),
    );
    this.watch(
      () => doc.badge,
      (badge) => this.renderBadge(badge),
    );
    this.watch(
      () => ({
        dirty: doc.dirty,
        closable: doc.closable && (!doc.pinned || this.manager.closeButtonOnPinned),
        mode: this.manager.closeButton,
        text: this.manager.textOf('tabDocsUnsaved'),
        closeHint: this.manager.textOf('close'),
      }),
      ({ dirty, closable, mode, text, closeHint }) => {
        mark(this.headerPart, 'data-dirty', dirty);
        writeText(this.unsaved, `, ${text}`);
        mark(this.unsaved, 'hidden', !dirty);
        if (closable && mode !== 'never') put(this.headerPart, 'data-close', mode);
        else put(this.headerPart, 'data-close', null);
        put(this.close, 'title', closeHint);
        this.manager.tabChanged(this);
      },
    );
    this.watch(
      () => (doc.closable ? this.manager.closeKeyHint() : null),
      (key) => {
        setAccessKeyAttribute(this.headerPart, this.closeKey, key);
        this.closeKey = key;
      },
    );
    this.watch(
      () => this.tooltipText(),
      (text) => this.renderTooltip(text),
    );
    this.watch(
      () => doc.contentLifetime ?? this.manager.contentLifetime,
      (lifetime) => {
        if (lifetime === 'keep') this.build();
        else if (lifetime === 'dispose' && !this.shown) this.release();
      },
    );
  }

  private renderTooltip(text: string): void {
    if (text && !this.tooltip && this.tipHolder) {
      this.tooltip = new Tooltip({ target: this.headerPart, text: () => this.tooltipText(), placement: 'bottom' });
      this.tipHolder.controls.add(this.tooltip);
    } else if (!text && this.tooltip) {
      void this.tooltip.dispose();
      this.tooltip = null;
    }
  }

  private renderDescription(text: string): void {
    const items = this.headerPart.controls.items;
    if (text && !this.description) {
      this.description = partBefore<HTMLSpanElement>(this.headerPart, items[items.indexOf(this.label) + 1] ?? null, 'span', 'mx-tabdocs__description');
    } else if (!text && this.description) {
      removePart(this.description);
      this.description = null;
    }
    if (this.description) writeText(this.description, text);
    this.manager.tabChanged(this);
  }

  private renderIcon(icon: IconSource | null): void {
    this.releaseIcon();
    this.releaseIcon = () => {};
    if (!icon) {
      removePart(this.icon);
      this.icon = null;
    } else {
      let host = this.icon;
      if (!host) {
        host = partBefore<HTMLSpanElement>(this.headerPart, this.headerPart.controls.items[0] ?? null, 'span', 'mx-tabdocs__icon');
        host.attr.add({ 'aria-hidden': 'true' });
        this.icon = host;
      }
      clearParts(host);
      this.releaseIcon = showIcon(icon, host);
    }
    mark(this.headerPart, 'data-icon', !!icon);
    this.manager.tabChanged(this);
  }

  private renderBadge(badge: string | number | boolean | null): void {
    const dot = badge === true;
    const text = badge === null || badge === undefined || badge === false || dot ? '' : String(badge);
    if ((text || dot) && !this.badge) {
      this.badge = partBefore<HTMLSpanElement>(this.headerPart, this.unsaved, 'span', 'mx-tabdocs__badge');
    } else if (!text && !dot && this.badge) {
      removePart(this.badge);
      this.badge = null;
    }
    if (this.badge) {
      writeText(this.badge, text);
      mark(this.badge, 'data-dot', dot);
    }
    this.manager.tabChanged(this);
  }
}
