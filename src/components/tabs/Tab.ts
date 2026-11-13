import { read, type Bind, type Component, type ComponentBase, type IBaseProp } from '@motifx/core';
import { parseAccessKey, renderAccessKey, setAccessKeyAttribute } from '../../core/access-key';
import { Control } from '../../core/control';
import { clearParts, glyphPart, loose, part, partBefore, removePart } from '../../core/draw-parts';
import { hasFocusableIn, standFor } from '../../core/focus';
import { keepScroll } from '../../core/measure';
import { kept, mark, put, text as writeText } from '../../core/part-writes';
import { showIcon } from '../../core/show-icon';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import { PanelContent } from './PanelContent';
import type { TabProps } from './tab-props';
import type { Tabs } from './Tabs';
import { onLanguage } from '../../core/on-language';

const OWN = ['key', 'icon', 'badge', 'hint', 'closable', 'lazy', 'keepAlive'] as const;

/** The parts of a tab. On one object made on first use: the base constructor already asks for the focus element. */
interface Parts {
  /** The tab's button as a component: the Tabs puts it in its strip; its parts are its children. */
  headerPart: Component<HTMLButtonElement>;
  label: Component<HTMLSpanElement>;
  icon: Component<HTMLSpanElement> | null;
  releaseIcon: () => void;
  badge: Component<HTMLSpanElement> | null;
  close: Component<HTMLSpanElement> | null;
  stopCloseHint: (() => void) | null;
  owner: Tabs | null;
  content: PanelContent | null;
  /** The panel is shown: the Tabs selected the tab. */
  shown: boolean;
  /** Scrolls back what scrolled in the panel when it was hidden: out of the page, it loses it. */
  restoreScroll: (() => void) | null;
}

const PARTS = Symbol('mx.tab');

/**
 * One tab of {@link Tabs}: its button in the tab strip and its panel. The JSX children are the
 * panel content, created when the tab is first shown (see `lazy`).
 *
 * @example
 * <Tabs>
 *   <Tab title="&General"><TextBox label="Name" /></Tab>
 *   <Tab title="Log" badge={() => this.log.length} closable>…</Tab>
 * </Tabs>
 *
 * tabs.add(new Tab({ title: 'Report', content: () => new ReportView() }));
 */
export class Tab extends Control<HTMLDivElement, TabProps> {
  constructor(props?: IBaseProp<TabProps>) {
    super('div', props);
    const own = (this.props ?? {}) as TabProps;
    const parts = this.parts;
    parts.content = new PanelContent(this, this.childs ?? [], own.content);
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.title !== undefined) this.bindProperty('text', own.title);

    this.observeProperty<string>('text', (text) => this.renderTitle(text));
    this.observeProperty('icon', () => this.renderIcon());
    this.observeProperty<string | number | null | undefined>('badge', (badge) => this.renderBadge(badge));
    this.observeProperty<string>('hint', (hint) => {
      if (hint) put(parts.headerPart, 'title', hint);
      else put(parts.headerPart, 'title', null);
    });
    this.observeProperty('closable', () => this.renderClose());
    this.observeProperty('key', () => parts.owner?.tabChanged(this));
    this.observeProperty('lazy', () => parts.owner?.tabChanged(this));

    this.motif.setDisposable(() => {
      parts.releaseIcon();
      parts.stopCloseHint?.();
      removePart(parts.headerPart);
      parts.owner?.tabGone(this);
    });
    // Hidden until its tab is selected: built with the Tabs, so what is bound to it is followed, and out of the page.
    kept(this, false);
  }

  // Properties (see TabProps).

  get title(): string {
    return this.text;
  }
  set title(value: Bind<string>) {
    this.text = value;
  }
  /** The `key` prop, also when written as the JSX `key`, or `''` if there is none. */
  get key(): string {
    const own = this.getProperty<string | undefined>('key');
    if (own !== undefined) return own;
    const jsx = (this.props as { indexkey?: unknown } | undefined)?.indexkey;
    const key = read(jsx as Bind<unknown>);
    return key === undefined || key === null ? '' : String(key);
  }
  set key(value: Bind<string>) {
    this.assignProperty('key', value, (v) => v ?? '');
  }
  get icon(): IconSource | null {
    return this.getProperty<IconSource | null | undefined>('icon') ?? null;
  }
  set icon(value: Bind<IconSource | null>) {
    this.assignProperty('icon', value);
  }
  get badge(): string | number | null {
    return this.getProperty<string | number | null | undefined>('badge') ?? null;
  }
  set badge(value: Bind<string | number | null>) {
    this.assignProperty('badge', value);
  }
  get hint(): string {
    return this.getProperty<string | undefined>('hint') ?? '';
  }
  set hint(value: Bind<string>) {
    this.assignProperty('hint', value);
  }
  /** This tab's own setting. `undefined` inherits from the `Tabs`. */
  get closable(): boolean | undefined {
    return this.getProperty<boolean | undefined>('closable');
  }
  set closable(value: Bind<boolean | undefined>) {
    this.assignProperty('closable', value);
  }
  get lazy(): boolean | undefined {
    return this.getProperty<boolean | undefined>('lazy');
  }
  set lazy(value: Bind<boolean | undefined>) {
    this.assignProperty('lazy', value);
  }
  get keepAlive(): boolean | undefined {
    return this.getProperty<boolean | undefined>('keepAlive');
  }
  set keepAlive(value: Bind<boolean | undefined>) {
    this.assignProperty('keepAlive', value);
  }

  /** Indicates whether the tab shows a close button: its own `closable`, otherwise that of the `Tabs`. Reactive. */
  get isClosable(): boolean {
    return this.closable ?? this.parts.owner?.closable ?? false;
  }

  /** The `Tabs` that owns the tab. */
  get owner(): Tabs | null {
    return this.parts.owner;
  }

  /** Indicates whether it is the selected tab. Reactive. */
  get isSelected(): boolean {
    return !!this.parts.owner && this.parts.owner.selectedTab === this;
  }

  /** Indicates whether its panel content has been created (see `lazy`). */
  get contentBuilt(): boolean {
    return !!this.parts.content?.isBuilt;
  }

  /** The tab's button in the strip (`role="tab"`) as a component. The tab's own element is its panel. */
  get headerPart(): Component<HTMLButtonElement> {
    return this.parts.headerPart;
  }

  /** Selects the tab. Returns `false` if it is hidden or not in a `Tabs`. */
  select(): boolean {
    return this.parts.owner?.select(this) ?? false;
  }

  /** Closes the tab as its close button does, so `onClose` can cancel it. */
  close(): boolean {
    return this.parts.owner?.close(this) ?? false;
  }

  override get focusPart(): ComponentBase {
    return this.parts.headerPart;
  }
  /** The access key selects the tab and sets focus on it. */
  override onAccessKey(): boolean {
    return this.parts.owner?.activate(this) ?? false;
  }

  protected override applyProperty(name: string, value: unknown): void {
    if (name === 'visible') {
      mark(this.parts.headerPart, 'hidden', !value);
      this.parts.owner?.tabChanged(this);
      return;
    }
    // The Tabs keeps one tab in the Tab order.
    if (name === 'tabStop') return;
    // Disabled while its button has focus: focus stays in the strip, on the tab Tab reaches now.
    if (name === 'enabled' && !value && this.focused) this.parts.owner?.focus();
    super.applyProperty(name, value);
    if (name === 'enabled') {
      mark(this.parts.headerPart, 'data-disabled', !value);
      if (value) put(this.parts.headerPart, 'aria-disabled', null);
      else put(this.parts.headerPart, 'aria-disabled', 'true');
      this.parts.owner?.tabChanged(this);
    }
  }

  /** @internal Joins or leaves a `Tabs`. */
  attachTo(owner: Tabs | null): void {
    const parts = this.parts;
    parts.owner = owner;
    if (!owner) {
      // Out of the strip, kept for another Tabs.
      parts.headerPart.parent?.controls.silentDetach(parts.headerPart);
      this.showPanel(false, true);
    }
    this.renderClose();
  }

  /** @internal Shows or hides the panel; the Tabs decides. */
  showPanel(on: boolean, keepAlive: boolean): void {
    const parts = this.parts;
    // Noted before the panel hides, while it still tells its scroll.
    if (!on && parts.shown) parts.restoreScroll = keepScroll(this);
    parts.shown = on;
    put(parts.headerPart, 'aria-selected', String(on));
    // A hidden panel is out of the page, so only the selected tab names its panel.
    put(parts.headerPart, 'aria-controls', on ? this.attr.get('id') : null);
    kept(this, on);
    if (on) {
      // In the next frame, once the panel is back in the page.
      parts.restoreScroll?.();
      parts.restoreScroll = null;
      parts.content?.build();
      this.updatePanelFocus();
    } else if (!keepAlive) {
      parts.content?.release();
    }
  }

  /** @internal Builds the panel content now. */
  buildContent(): void {
    this.parts.content?.build();
  }

  /** @internal A panel with nothing focusable in it takes focus itself, so Tab reaches it. */
  updatePanelFocus(): void {
    if (this.parts.shown) put(this, 'tabindex', hasFocusableIn(this) ? null : '0');
  }

  /** @internal The `Tabs` closable setting changed. */
  renderClose(): void {
    const parts = this.parts;
    const on = this.peekProperty<boolean>('closable') ?? parts.owner?.peekClosable() ?? false;
    if (on && !parts.close) {
      const close = part<HTMLSpanElement>(parts.headerPart, 'span', 'mx-tabs__close');
      close.attr.add({ 'aria-hidden': 'true' });
      glyphPart(close, 'dismiss');
      // Pressing it does not move focus to the tab it closes.
      close.motif.on('mousedown', (_, e) => e.preventDefault());
      close.motif.on('click', (_, e) => {
        e.stopPropagation();
        parts.owner?.close(this, true, e);
      });
      parts.stopCloseHint = onLanguage(this, () => put(close, 'title', uiLocale.strings.close));
      parts.close = close;
      setAccessKeyAttribute(parts.headerPart, null, 'Delete');
    } else if (!on && parts.close) {
      parts.stopCloseHint?.();
      removePart(parts.close);
      parts.close = parts.stopCloseHint = null;
      setAccessKeyAttribute(parts.headerPart, 'Delete', null);
    }
    mark(this, 'data-closable', on);
    mark(parts.headerPart, 'data-closable', on);
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    // Placed in the strip by the Tabs (not a child of the tab: the tab's own element is its panel).
    const headerPart = loose<HTMLButtonElement>('button', 'mx-tabs__tab');
    const headerId = nextId('tab');
    headerPart.attr.add({ type: 'button', id: headerId });
    put(headerPart, 'tabindex', '-1');
    headerPart.attr.add({ role: 'tab', 'aria-selected': 'false' });
    const label = part<HTMLSpanElement>(headerPart, 'span', 'mx-tabs__label');
    // Focus on the button counts as focus in the tab.
    standFor(headerPart, this);

    const panelId = nextId('tab-panel');
    this.class.add('mx-tabs__panel');
    this.attr.add({ id: panelId, role: 'tabpanel', 'aria-labelledby': headerId });
    return { headerPart, label, icon: null, releaseIcon: () => {}, badge: null, close: null, stopCloseHint: null, owner: null, content: null, shown: false, restoreScroll: null };
  }

  private renderTitle(text: string): void {
    const parsed = parseAccessKey(text ?? '');
    renderAccessKey(this.parts.label, parsed);
    this.setAccessKey(parsed.key);
    this.parts.owner?.tabResized();
  }

  private renderIcon(): void {
    const parts = this.parts;
    const icon = this.peekProperty<IconSource | null>('icon');
    parts.releaseIcon();
    parts.releaseIcon = () => {};
    if (!icon) {
      removePart(parts.icon);
      parts.icon = null;
    } else {
      if (!parts.icon) {
        // First in the button.
        parts.icon = partBefore<HTMLSpanElement>(parts.headerPart, parts.headerPart.controls.items[0] ?? null, 'span', 'mx-tabs__icon');
        parts.icon.attr.add({ 'aria-hidden': 'true' });
      }
      clearParts(parts.icon);
      parts.releaseIcon = showIcon(icon, parts.icon);
    }
    parts.owner?.tabResized();
  }

  private renderBadge(badge: string | number | null | undefined): void {
    const parts = this.parts;
    const text = badge === null || badge === undefined ? '' : String(badge);
    if (text && !parts.badge) {
      // Right after the label.
      const items = parts.headerPart.controls.items;
      parts.badge = partBefore<HTMLSpanElement>(parts.headerPart, items[items.indexOf(parts.label) + 1] ?? null, 'span', 'mx-tabs__badge');
    } else if (!text && parts.badge) {
      removePart(parts.badge);
      parts.badge = null;
    }
    if (parts.badge) writeText(parts.badge, text);
    parts.owner?.tabResized();
  }
}

