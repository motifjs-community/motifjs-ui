import { effect, Emitter, read, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { chevronDown } from '../../core/glyphs';
import { uiLocale } from '../../core/ui-locale';
import { MenuList } from '../../parts/menu/MenuList';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import type { FormHost } from '../form/form-host';
import { Button } from '../button/Button';
import type { BottomSheetDetent } from '../sheet/bottom-sheet-detent';
import { BottomSheet } from '../sheet/BottomSheet';
import type { ActionSheetProps } from './action-sheet-props';

const OWN = ['items', 'message', 'showCancel', 'cancelText'] as const;

const NO_ITEMS: readonly MenuItem[] = [];
const FIT: readonly BottomSheetDetent[] = ['fit'];

interface Parts {
  message: HTMLDivElement;
  list: MenuList;
  cancelRow: HTMLDivElement;
  cancel: Button;
  /** The menus gone into, the outermost first: a submenu shows in place of its menu, with a way back. */
  levels: (readonly MenuItem[])[];
  /** Opened from the keyboard: focus goes to the first item. */
  byKeyboard: boolean;
  /** The item chosen since it opened. */
  chosen: MenuItem | null;
  waiters: ((item: MenuItem | null) => void)[];
  stopTexts: (() => void) | null;
  itemClick: Emitter<MenuItemClickEventArgs>;
}

const PARTS = Symbol('mx.action-sheet');

/**
 * A list of commands that comes up from the bottom: the kit's menu items, large enough for a
 * finger, with a title, a message and a cancel button apart. A submenu opens in its place, with a
 * way back. Choosing an item closes the sheet and runs it; `choose()` resolves with the item, or
 * `null` when the sheet was closed without one. It is a `BottomSheet` (as tall as its items by
 * default): it is dragged down, closed by Escape, the scrim and the browser's back. A
 * `ContextMenu` with `presentation: 'sheet'` (or `'auto'` on a touch screen) opens its items here.
 *
 * @example
 * const item = await new ActionSheet({ title: 'report.pdf', items: [{ text: 'Share' }, { text: 'Delete', tone: 'danger' }] }).choose();
 */
export class ActionSheet extends BottomSheet {
  constructor(props?: IBaseProp<ActionSheetProps>) {
    super(props);
    const own = (this.props ?? {}) as ActionSheetProps;
    const parts = this.actions;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onItemClick) this.onItemClick(own.onItemClick);
    this.observeProperty<string>('message', (text) => {
      parts.message.textContent = text ?? '';
      parts.message.hidden = !text;
    });
    this.observeProperty<boolean | undefined>('showCancel', (on) => (parts.cancelRow.hidden = on === false));
    this.observeProperty('items', () => {
      if (this.isOpen && parts.levels.length <= 1) this.showLevel([this.peekProperty<readonly MenuItem[]>('items') ?? NO_ITEMS]);
    });
    parts.stopTexts = effect(() => {
      const strings = uiLocale.strings;
      const own = this.getProperty<string | undefined>('cancelText');
      untracked(() => {
        parts.cancel.text = (own || strings.cancel).replace(/&/g, '&&');
        if (!this.peekProperty<string>('text') && !this.peekProperty<string>('label')) this.panelElement.setAttribute('aria-label', strings.actionSheetLabel);
      });
    });
    this.motif.setDisposable(() => {
      parts.stopTexts?.();
      for (const resolve of parts.waiters.splice(0)) resolve(null);
      parts.itemClick.dispose();
    });
  }

  // Properties (see ActionSheetProps).

  get items(): readonly MenuItem[] {
    return this.getProperty<readonly MenuItem[] | undefined>('items') ?? NO_ITEMS;
  }
  set items(value: Bind<readonly MenuItem[]>) {
    this.assignProperty('items', value);
  }
  get message(): string {
    return this.getProperty<string | undefined>('message') ?? '';
  }
  set message(value: Bind<string>) {
    this.assignProperty('message', value);
  }
  get showCancel(): boolean {
    return this.getProperty<boolean | undefined>('showCancel') !== false;
  }
  set showCancel(value: Bind<boolean>) {
    this.assignProperty('showCancel', value, Boolean);
  }
  get cancelText(): string {
    return this.getProperty<string | undefined>('cancelText') ?? '';
  }
  set cancelText(value: Bind<string>) {
    this.assignProperty('cancelText', value);
  }
  /** As tall as its items unless set. */
  override get detents(): readonly BottomSheetDetent[] {
    const own = this.getProperty<readonly BottomSheetDetent[] | undefined>('detents');
    return own?.length ? own : FIT;
  }
  override set detents(value: Bind<readonly BottomSheetDetent[]>) {
    this.assignProperty('detents', value);
  }
  /** Focus moves in as it opens: to the list, or to its first item when a key opened it. */
  override get focusOnOpen(): boolean {
    return false;
  }
  override set focusOnOpen(_value: Bind<boolean>) {}

  /** The item chosen the last time it was open, `null` when none was. */
  get chosenItem(): MenuItem | null {
    return this.actions.chosen;
  }

  /** The list of items, for code that reads or focuses it. */
  get menu(): MenuList {
    return this.actions.list;
  }

  /** An item was chosen, after the sheet closed and the item's own `click` ran. */
  get onItemClick(): MotifEvent<MenuItemClickEventArgs> {
    return this.actions.itemClick.event;
  }

  /** Opens it; `byKeyboard` puts focus on the first item (else on the list, as a menu opened by the pointer does). */
  override open(byKeyboard = false): boolean {
    this.actions.byKeyboard = byKeyboard;
    return super.open();
  }

  /**
   * Opens it with `items` (else its own) and resolves with the item chosen, or `null` when it is
   * closed without one. `host` gives it a place when it has none (else the end of the page).
   */
  choose(items?: readonly MenuItem[], host?: FormHost): Promise<MenuItem | null> {
    const parts = this.actions;
    if (items) this.items = items;
    const done = new Promise<MenuItem | null>((resolve) => parts.waiters.push(resolve));
    const opened = host && !this.parent ? this.show(host) : this.open();
    if (!opened) for (const resolve of parts.waiters.splice(0)) resolve(null);
    return done;
  }

  protected override openBy(): boolean {
    const parts = this.actions;
    parts.chosen = null;
    this.showLevel([this.peekProperty<readonly MenuItem[]>('items') ?? NO_ITEMS]);
    const opened = super.openBy();
    if (opened) {
      if (parts.byKeyboard) parts.list.focusItem('first');
      else parts.list.focusList();
    }
    parts.byKeyboard = false;
    return opened;
  }

  protected override panelClosed(): void {
    super.panelClosed();
    const parts = this.actions;
    parts.levels = [];
    for (const resolve of parts.waiters.splice(0)) resolve(parts.chosen);
  }

  private get actions(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createActions());
  }

  private createActions(): Parts {
    this.element.classList.add('mx-action-sheet');
    const doc = this.element.ownerDocument;
    const message = doc.createElement('div');
    message.className = 'mx-action-sheet__message';
    message.hidden = true;
    const list = new MenuList();
    list.source = this;
    list.openSubmenus = false;
    list.openOnHover = false;
    list.element.classList.add('mx-action-sheet__list');
    list.onChosen((e) => this.chosen(e));
    const cancelRow = doc.createElement('div');
    cancelRow.className = 'mx-action-sheet__cancel';
    const cancel = new Button({ stretch: true });
    cancel.element.addEventListener('click', () => this.close('button'));
    this.contentElement.append(message);
    this.panelElement.append(cancelRow);
    this.placeIn(list, this.contentElement);
    this.placeIn(cancel, cancelRow);
    return { message, list, cancelRow, cancel, levels: [], byKeyboard: false, chosen: null, waiters: [], stopTexts: null, itemClick: new Emitter() };
  }

  /** Shows the innermost of `levels`; inside a submenu the first item goes back. */
  private showLevel(levels: (readonly MenuItem[])[]): void {
    const parts = this.actions;
    parts.levels = levels;
    const items = levels[levels.length - 1] ?? NO_ITEMS;
    if (levels.length < 2) {
      parts.list.setItems(items);
      return;
    }
    const back: MenuItem = { text: () => uiLocale.strings.back, icon: () => backMark(), data: BACK };
    parts.list.setItems([back, ...items.map((item, i) => (i === 0 ? { ...item, beginGroup: true } : item))]);
  }

  private chosen(e: MenuItemClickEventArgs): void {
    const parts = this.actions;
    const item = e.item;
    if (item.data === BACK) {
      this.showLevel(parts.levels.slice(0, -1));
      parts.list.focusItem('first');
      return;
    }
    const children = read(item.items);
    if (children?.some((child) => read(child.visible) !== false)) {
      this.showLevel([...parts.levels, children]);
      parts.list.focusItem('first');
      return;
    }
    parts.chosen = item;
    this.close('code');
    item.click?.({ ...e, source: this });
    parts.itemClick.fire({ ...e, source: this });
  }
}

const BACK = Symbol('back');

/** The way back out of a submenu: an arrow pointing to the start. */
function backMark(): HTMLSpanElement {
  const mark = chevronDown();
  mark.classList.add('mx-action-sheet__back');
  return mark;
}
