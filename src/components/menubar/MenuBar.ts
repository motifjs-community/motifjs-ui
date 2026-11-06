import { Emitter, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { accessKeyToken, parseAccessKey, renderAccessKey, setAccessKeyAttribute } from '../../core/access-key';
import { Control } from '../../core/control';
import { follow } from '../../core/follow';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { iconNode } from '../../core/icon-node';
import type { IconSource } from '../../core/icon-source';
import { addShortcut, installKeyboard } from '../../core/keyboard';
import { isNode } from '../../core/node-kind';
import { MenuList } from '../../parts/menu/MenuList';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import { Popup } from '../../parts/popup/Popup';
import type { MenuBarProps } from './menu-bar-props';
import { foldText } from '../../core/fold-text';

const OWN = ['items', 'focusOnF10', 'openOnHover'] as const;

/** A top item's fields as read for one drawing. */
interface ItemLook {
  item: MenuItem;
  visible: boolean;
  text: string;
  hint: string | undefined;
  enabled: boolean;
  submenu: boolean;
}

interface Entry {
  item: MenuItem;
  element: HTMLButtonElement;
  enabled: boolean;
  submenu: boolean;
  /** The label, lower case, for typing to an item. */
  text: string;
}

interface Parts {
  bar: HTMLDivElement;
  entries: Entry[];
  releases: (() => void)[];
  /** The item Tab reaches. */
  current: MenuItem | null;
  open: Entry | null;
  popup: Popup | null;
  list: MenuList | null;
  stopDrawing: (() => void) | null;
  removeF10: (() => void) | null;
  itemClick: Emitter<MenuItemClickEventArgs>;
}

const PARTS = Symbol('mx.menubar');

/**
 * A bar of menus (`role="menubar"`), as at the top of an app: File, Edit, View. Left and Right
 * move along the bar and, while a menu is open, open the next one; Down, Enter and Space open a
 * menu; Escape closes it back to the bar; a letter goes to the item that starts with it; `&File`
 * makes Alt+F open File. Menus hold submenus, check and radio items and shortcuts (`MenuItem`).
 *
 * @example
 * <MenuBar label="Main" items={[{ text: '&File', items: [{ text: '&New', shortcut: 'Ctrl+N', click: () => this.create() }] }]} />
 *
 * const bar = new MenuBar({ items: this.menus, focusOnF10: true });
 * bar.onItemClick((e) => console.log(e.item.text));
 */
export class MenuBar extends Control<HTMLDivElement, MenuBarProps> {
  constructor(props?: IBaseProp<MenuBarProps>) {
    super(props);
    const own = (this.props ?? {}) as MenuBarProps;
    const parts = this.parts;
    this.observeProperty<string>('text', (text) => {
      const label = parseAccessKey(text ?? '').text;
      if (label) parts.bar.setAttribute('aria-label', label);
      else parts.bar.removeAttribute('aria-label');
    });
    this.observeProperty('items', () => this.followItems());
    this.observeProperty<boolean>('focusOnF10', (on) => this.renderF10(!!on));
    this.observeProperty<boolean>('openOnHover', (on) => {
      if (parts.list) parts.list.openOnHover = on !== false;
    });
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    if (own.onItemClick) this.onItemClick(own.onItemClick);
    this.listen();
    this.motif.setDisposable(() => {
      parts.stopDrawing?.();
      parts.removeF10?.();
      for (const release of parts.releases.splice(0)) release();
      parts.itemClick.dispose();
    });
  }

  // Properties (see MenuBarProps).

  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  get items(): readonly MenuItem[] {
    return this.getProperty<readonly MenuItem[] | undefined>('items') ?? [];
  }
  set items(value: Bind<readonly MenuItem[]>) {
    this.assignProperty('items', value);
  }
  get focusOnF10(): boolean {
    return !!this.getProperty<boolean>('focusOnF10');
  }
  set focusOnF10(value: Bind<boolean>) {
    this.assignProperty('focusOnF10', value, Boolean);
  }
  get openOnHover(): boolean {
    return this.getProperty<boolean | undefined>('openOnHover') !== false;
  }
  set openOnHover(value: Bind<boolean>) {
    this.assignProperty('openOnHover', value, Boolean);
  }

  /** The top item whose menu is open, `null` while none is. Reactive. */
  get openItem(): MenuItem | null {
    return this.getProperty<MenuItem | null | undefined>('openItem') ?? null;
  }

  /** An item was chosen (a top item without a menu, or an item in a menu), after the item's own `click`. */
  get onItemClick(): MotifEvent<MenuItemClickEventArgs> {
    return this.parts.itemClick.event;
  }

  /** Opens the menu of a top item (or the item at an index) with focus on its first item; `false` when it has none or cannot be used. */
  open(item: MenuItem | number): boolean {
    const parts = this.parts;
    const entry = typeof item === 'number' ? parts.entries[item] : parts.entries.find((e) => e.item === item);
    if (!entry?.submenu || !entry.enabled || !this.isEnabled) return false;
    this.openMenu(entry, 'first');
    return true;
  }

  close(): void {
    this.parts.popup?.close('code');
  }

  /**
   * Reads the items again after they were changed in place: the bar, the open menu and its submenus. Your items
   * may be plain or reactive; the bar reads them as they are.
   */
  refresh(): void {
    this.followItems();
    if (this.parts.popup?.isOpen) this.parts.list?.refresh();
  }

  /** The top item Tab reaches. */
  protected override get focusElement(): HTMLElement {
    return this.stop()?.element ?? this.parts.bar;
  }

  protected override applyProperty(name: string, value: unknown): void {
    if (name === 'tabStop') {
      this.renderRoving();
      return;
    }
    super.applyProperty(name, value);
    if (name === 'enabled' && value === false) this.close();
  }

  // Drawing the bar.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.element.classList.add('mx-menubar');
    const bar = document.createElement('div');
    bar.className = 'mx-menubar__bar';
    bar.setAttribute('role', 'menubar');
    this.element.prepend(bar);
    return {
      bar,
      entries: [],
      releases: [],
      current: null,
      open: null,
      popup: null,
      list: null,
      stopDrawing: null,
      removeF10: null,
      itemClick: new Emitter(),
    };
  }

  /** Draws the items again whenever a function in one of them reads something that changes, or on `reState()`. */
  private followItems(): void {
    const parts = this.parts;
    parts.stopDrawing?.();
    const items = this.peekProperty<readonly MenuItem[]>('items') ?? [];
    // The items' own functions are tracked; the list and the fields are not.
    parts.stopDrawing = follow(this, 'items', () => {
      const looks = givenList(items).map((item): ItemLook => {
        const children = givenList(givenField<readonly MenuItem[] | undefined>(item, 'items'));
        return {
          item,
          visible: givenField(item, 'visible') !== false,
          text: givenField<string | undefined>(item, 'text') ?? '',
          hint: givenField<string | undefined>(item, 'hint'),
          enabled: givenField(item, 'enabled') !== false,
          submenu: children.some((child) => givenField(child, 'visible') !== false),
        };
      });
      return looks;
    }, (looks) => this.draw(looks));
  }

  private draw(looks: readonly ItemLook[]): void {
    const parts = this.parts;
    const focused = parts.entries.findIndex((entry) => entry.element === document.activeElement);
    const openItem = parts.open?.item;
    for (const release of parts.releases.splice(0)) release();
    parts.bar.replaceChildren();
    parts.entries = [];
    for (const look of looks) {
      if (!look.visible) continue;
      const parsed = parseAccessKey(look.text);
      const element = document.createElement('button');
      element.type = 'button';
      element.tabIndex = -1;
      element.className = 'mx-menubar__item';
      element.setAttribute('role', 'menuitem');
      if (look.submenu) {
        element.setAttribute('aria-haspopup', 'menu');
        element.setAttribute('aria-expanded', 'false');
      }
      if (!look.enabled) element.setAttribute('aria-disabled', 'true');
      if (look.hint) element.title = look.hint;
      const source = givenField<IconSource | null | undefined>(look.item, 'icon');
      if (source) {
        const icon = element.appendChild(document.createElement('span'));
        icon.className = 'mx-menubar__icon';
        icon.setAttribute('aria-hidden', 'true');
        const shown = iconNode(source);
        icon.append(shown.node);
        parts.releases.push(shown.release);
      }
      const label = element.appendChild(document.createElement('span'));
      label.className = 'mx-menubar__label';
      renderAccessKey(label, parsed);
      if (parsed.key) {
        setAccessKeyAttribute(element, null, accessKeyToken(parsed.key));
        installKeyboard();
      }
      parts.bar.append(element);
      parts.entries.push({ item: look.item, element, enabled: look.enabled, submenu: look.submenu, text: foldText(parsed.text) });
    }
    this.renderRoving();
    if (focused >= 0) parts.entries[Math.min(focused, parts.entries.length - 1)]?.element.focus();
    if (openItem) {
      const entry = parts.entries.find((e) => e.item === openItem);
      if (entry?.submenu && entry.enabled) this.openMenu(entry, null);
      else this.close();
    }
  }

  /** The item Tab reaches: the last one focused, else the first. */
  private stop(): Entry | undefined {
    const entries = this.parts.entries;
    return entries.find((e) => e.item === this.parts.current) ?? entries[0];
  }

  private renderRoving(): void {
    const stop = this.peekProperty('tabStop') === false ? undefined : this.stop();
    for (const entry of this.parts.entries) entry.element.tabIndex = entry === stop ? 0 : -1;
  }

  private renderF10(on: boolean): void {
    const parts = this.parts;
    if (on && !parts.removeF10) {
      // Page-wide on purpose: the key reaches the bar from wherever focus is.
      parts.removeF10 = addShortcut('F10', () => this.focus());
    } else if (!on && parts.removeF10) {
      parts.removeF10();
      parts.removeF10 = null;
    }
  }

  // The menus.

  private openMenu(entry: Entry, focus: 'first' | 'last' | 'list' | null): void {
    const parts = this.parts;
    const popup = (parts.popup ??= this.createPopup());
    const list = parts.list!;
    if (parts.open !== entry) {
      list.closeSubmenu();
      parts.open?.element.setAttribute('aria-expanded', 'false');
      list.setItems(givenValue<Bind<readonly MenuItem[]> | undefined>(entry.item, 'items') ?? []);
    }
    parts.open = entry;
    parts.current = entry.item;
    this.renderRoving();
    popup.open(entry.element, { toggle: entry.element });
    entry.element.setAttribute('aria-expanded', 'true');
    this.setProperty('openItem', entry.item);
    if (focus === 'list') list.focusList();
    else if (focus) list.focusItem(focus);
  }

  private createPopup(): Popup {
    const parts = this.parts;
    const popup = new Popup();
    popup.placement = 'bottom-start';
    popup.matchWidth = false;
    const list = new MenuList();
    list.source = this;
    list.openOnHover = this.peekProperty('openOnHover') !== false;
    list.onChosen((e) => this.chosen(e));
    popup.controls.add(list);
    this.controls.add(popup);
    popup.onClosed(() => {
      parts.open?.element.setAttribute('aria-expanded', 'false');
      parts.open = null;
      this.setProperty('openItem', null);
    });
    parts.list = list;
    return popup;
  }

  private chosen(e: MenuItemClickEventArgs): void {
    this.close();
    givenValue<MenuItem['click']>(e.item, 'click')?.(e);
    this.parts.itemClick.fire(e);
  }

  // Pointer and keys.

  private entryOf(target: EventTarget | null): Entry | undefined {
    return isNode(target) ? this.parts.entries.find((e) => e.element.contains(target)) : undefined;
  }

  private listen(): void {
    const parts = this.parts;
    parts.bar.addEventListener('click', (e) => untracked(() => this.onClick(e)));
    parts.bar.addEventListener('focusin', (e) => {
      const entry = this.entryOf(e.target);
      if (!entry || parts.current === entry.item) return;
      parts.current = entry.item;
      this.renderRoving();
    });
    parts.bar.addEventListener('pointerover', (e) => {
      const entry = this.entryOf(e.target);
      if (!entry || !parts.open || parts.open === entry || this.peekProperty('openOnHover') === false) return;
      if (entry.submenu && entry.enabled) this.openMenu(entry, 'list');
      else {
        this.close();
        entry.element.focus();
      }
    });
    this.element.addEventListener('keydown', (e) => untracked(() => this.onKeyDown(e)));
  }

  private onClick(e: MouseEvent): void {
    const entry = this.entryOf(e.target);
    if (!entry?.enabled) return;
    if (entry.submenu) {
      if (this.parts.open === entry) this.close();
      // From the keyboard (Enter, Space, the access key) focus goes to the first item.
      else this.openMenu(entry, e.detail === 0 ? 'first' : 'list');
      return;
    }
    this.close();
    const args: MenuItemClickEventArgs = { item: entry.item, source: this, event: e };
    givenValue<MenuItem['click']>(entry.item, 'click')?.(args);
    this.parts.itemClick.fire(args);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const parts = this.parts;
    const entries = parts.entries;
    const entry = this.entryOf(e.target);
    const inMenu = !entry && !!parts.open && !!parts.popup?.element.contains(e.target as Node);
    if ((!entry && !inMenu) || !entries.length) return;
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        const from = entry ?? parts.open!;
        const step = (e.key === 'ArrowRight') !== rtl ? 1 : -1;
        const next = entries[(entries.indexOf(from) + step + entries.length) % entries.length];
        if (inMenu && next.submenu && next.enabled) {
          this.openMenu(next, 'first');
        } else {
          this.close();
          next.element.focus();
        }
        break;
      }
      case 'ArrowDown':
      case 'ArrowUp':
        if (!entry?.submenu || !entry.enabled) return;
        this.openMenu(entry, e.key === 'ArrowUp' ? 'last' : 'first');
        break;
      case 'Home':
      case 'End':
        if (!entry) return;
        entries[e.key === 'Home' ? 0 : entries.length - 1].element.focus();
        break;
      default: {
        if (!entry || e.key.length !== 1 || e.key === ' ') return;
        const letter = foldText(e.key);
        const at = entries.indexOf(entry);
        for (let step = 1; step <= entries.length; step++) {
          const candidate = entries[(at + step) % entries.length];
          if (candidate.text.startsWith(letter)) {
            candidate.element.focus();
            break;
          }
        }
      }
    }
    e.preventDefault();
  }
}
