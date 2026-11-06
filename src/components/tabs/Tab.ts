import { read, type Bind, type IBaseProp } from '@motifx/core';
import { parseAccessKey, renderAccessKey, setAccessKeyAttribute } from '../../core/access-key';
import { Control } from '../../core/control';
import { registerControl } from '../../core/control-map';
import { dismissMark } from '../../core/glyphs';
import { iconNode } from '../../core/icon-node';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import { PanelContent } from './PanelContent';
import type { TabProps } from './tab-props';
import type { Tabs } from './Tabs';
import { onLanguage } from '../../core/on-language';

const OWN = ['key', 'icon', 'badge', 'hint', 'closable', 'lazy', 'keepAlive'] as const;

const FOCUSABLE_INSIDE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"])';

/** The parts of a tab. On one object made on first use: the base constructor already asks for the focus element. */
interface Parts {
  header: HTMLButtonElement;
  label: HTMLSpanElement;
  icon: HTMLSpanElement | null;
  releaseIcon: () => void;
  badge: HTMLSpanElement | null;
  close: HTMLSpanElement | null;
  stopCloseHint: (() => void) | null;
  owner: Tabs | null;
  content: PanelContent | null;
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
      if (hint) parts.header.title = hint;
      else parts.header.removeAttribute('title');
    });
    this.observeProperty('closable', () => this.renderClose());
    this.observeProperty('key', () => parts.owner?.tabChanged(this));
    this.observeProperty('lazy', () => parts.owner?.tabChanged(this));

    this.motif.setDisposable(() => {
      parts.releaseIcon();
      parts.stopCloseHint?.();
      parts.header.remove();
      parts.owner?.tabGone(this);
    });
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

  /** The tab's button in the strip (`role="tab"`). The tab's own element is its panel. */
  get headerElement(): HTMLButtonElement {
    return this.parts.header;
  }

  /** Selects the tab. Returns `false` if it is hidden or not in a `Tabs`. */
  select(): boolean {
    return this.parts.owner?.select(this) ?? false;
  }

  /** Closes the tab as its close button does, so `onClose` can cancel it. */
  close(): boolean {
    return this.parts.owner?.close(this) ?? false;
  }

  protected override get focusElement(): HTMLElement {
    return this.parts.header;
  }

  /** The access key selects the tab and sets focus on it. */
  override onAccessKey(): boolean {
    return this.parts.owner?.activate(this) ?? false;
  }

  protected override applyProperty(name: string, value: unknown): void {
    if (name === 'visible') {
      this.parts.header.hidden = !value;
      this.parts.owner?.tabChanged(this);
      return;
    }
    // The Tabs keeps one tab in the Tab order.
    if (name === 'tabStop') return;
    super.applyProperty(name, value);
    if (name === 'enabled') {
      this.parts.header.toggleAttribute('data-disabled', !value);
      if (value) this.parts.header.removeAttribute('aria-disabled');
      else this.parts.header.setAttribute('aria-disabled', 'true');
      this.parts.owner?.tabChanged(this);
    }
  }

  /** @internal Joins or leaves a `Tabs`. */
  attachTo(owner: Tabs | null): void {
    const parts = this.parts;
    parts.owner = owner;
    if (!owner) {
      parts.header.remove();
      this.showPanel(false, true);
    }
    this.renderClose();
  }

  /** @internal Shows or hides the panel; the Tabs decides. */
  showPanel(on: boolean, keepAlive: boolean): void {
    const parts = this.parts;
    parts.header.setAttribute('aria-selected', String(on));
    this.element.hidden = !on;
    if (on) {
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
    if (this.element.hidden) return;
    if (this.element.querySelector(FOCUSABLE_INSIDE)) this.element.removeAttribute('tabindex');
    else if (!this.element.hasAttribute('tabindex')) this.element.tabIndex = 0;
  }

  /** @internal The `Tabs` closable setting changed. */
  renderClose(): void {
    const parts = this.parts;
    const on = this.peekProperty<boolean>('closable') ?? parts.owner?.peekClosable() ?? false;
    if (on && !parts.close) {
      const close = document.createElement('span');
      close.className = 'mx-tabs__close';
      close.setAttribute('aria-hidden', 'true');
      close.append(dismissMark());
      // Pressing it does not move focus to the tab it closes.
      close.addEventListener('mousedown', (e) => e.preventDefault());
      close.addEventListener('click', (e) => {
        e.stopPropagation();
        parts.owner?.close(this, true, e);
      });
      parts.header.append(close);
      parts.stopCloseHint = onLanguage(this, () => (close.title = uiLocale.strings.close));
      parts.close = close;
      setAccessKeyAttribute(parts.header, null, 'Delete');
    } else if (!on && parts.close) {
      parts.stopCloseHint?.();
      parts.close.remove();
      parts.close = parts.stopCloseHint = null;
      setAccessKeyAttribute(parts.header, 'Delete', null);
    }
    this.element.toggleAttribute('data-closable', on);
    parts.header.toggleAttribute('data-closable', on);
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'mx-tabs__tab';
    header.id = nextId('tab');
    header.tabIndex = -1;
    header.setAttribute('role', 'tab');
    header.setAttribute('aria-selected', 'false');
    const label = header.appendChild(document.createElement('span'));
    label.className = 'mx-tabs__label';
    registerControl(header, this);

    const panel = this.element;
    panel.classList.add('mx-tabs__panel');
    panel.id = nextId('tab-panel');
    panel.hidden = true;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', header.id);
    header.setAttribute('aria-controls', panel.id);
    return { header, label, icon: null, releaseIcon: () => {}, badge: null, close: null, stopCloseHint: null, owner: null, content: null };
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
      parts.icon?.remove();
      parts.icon = null;
    } else {
      if (!parts.icon) {
        parts.icon = document.createElement('span');
        parts.icon.className = 'mx-tabs__icon';
        parts.icon.setAttribute('aria-hidden', 'true');
        parts.header.prepend(parts.icon);
      }
      const shown = iconNode(icon);
      parts.icon.replaceChildren(shown.node);
      parts.releaseIcon = shown.release;
    }
    parts.owner?.tabResized();
  }

  private renderBadge(badge: string | number | null | undefined): void {
    const parts = this.parts;
    const text = badge === null || badge === undefined ? '' : String(badge);
    if (text && !parts.badge) {
      parts.badge = document.createElement('span');
      parts.badge.className = 'mx-tabs__badge';
      parts.label.after(parts.badge);
    } else if (!text && parts.badge) {
      parts.badge.remove();
      parts.badge = null;
    }
    if (parts.badge) parts.badge.textContent = text;
    parts.owner?.tabResized();
  }
}

