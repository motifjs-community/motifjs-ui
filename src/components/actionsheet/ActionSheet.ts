import { Component, Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { chevronDown } from '../../core/glyphs';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { kept, put, text as writeText } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { lineAfter } from '../../parts/menu/line-after';
import { MenuList } from '../../parts/menu/MenuList';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import type { FormHost } from '../form/form-host';
import { Button } from '../button/Button';
import type { BottomSheetDetent } from '../sheet/bottom-sheet-detent';
import { BottomSheet } from '../sheet/BottomSheet';
import type { ActionSheetProps } from './action-sheet-props';
import { onLanguage } from '../../core/on-language';
import { runItem } from '../../core/command-fields';

const OWN = ['items', 'message', 'showCancel', 'cancelText'] as const;

const NO_ITEMS: readonly MenuItem[] = [];
const FIT: readonly BottomSheetDetent[] = ['fit'];

interface Parts {
  message: Component<HTMLDivElement>;
  list: MenuList;
  cancelRow: Component<HTMLDivElement>;
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
 * A list of commands that slides up from the bottom. It shows the kit's menu items at a touch-friendly
 * size, with a title, a message and a separate Cancel button. A submenu replaces the list, with a Back
 * item. Selecting an item closes the sheet and runs the item. `choose()` resolves with the item, or with
 * `null` if the sheet closes without a selection. It is a `BottomSheet`, as tall as its items by default,
 * so it can be dragged down and is closed by Escape, the scrim and the browser's back action. A
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
      writeText(parts.message, text ?? '');
      kept(parts.message, !!text);
    });
    this.observeProperty<boolean | undefined>('showCancel', (on) => kept(parts.cancelRow, on !== false));
    this.observeProperty('items', () => {
      if (this.isOpen && parts.levels.length <= 1) this.showLevel([this.peekProperty<readonly MenuItem[]>('items') ?? NO_ITEMS]);
    });
    // The kit's language, or another cancel text: the texts are written again.
    const drawTexts = () => {
      const strings = uiLocale.strings;
      parts.cancel.text = (this.peekProperty<string | undefined>('cancelText') || strings.cancel).replace(/&/g, '&&');
      if (!this.peekProperty<string>('text') && !this.peekProperty<string>('label')) put(this.panelPart, 'aria-label', strings.actionSheetLabel);
    };
    parts.stopTexts = onLanguage(this, drawTexts);
    this.observeProperty('cancelText', drawTexts);
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
  /** The heights the sheet stops at. Without a value, it is as tall as its items. */
  override get detents(): readonly BottomSheetDetent[] {
    const own = this.getProperty<readonly BottomSheetDetent[] | undefined>('detents');
    return own?.length ? own : FIT;
  }
  override set detents(value: Bind<readonly BottomSheetDetent[]>) {
    this.assignProperty('detents', value);
  }
  /** Focus moves in when the sheet opens: to the list, or to the first item when opened from the keyboard. */
  override get focusOnOpen(): boolean {
    return false;
  }
  override set focusOnOpen(_value: Bind<boolean>) {}

  /** The item selected the last time the sheet was open, or `null` if there was none. */
  get chosenItem(): MenuItem | null {
    return this.actions.chosen;
  }

  /** The list of items, for code that reads or focuses it. */
  get menu(): MenuList {
    return this.actions.list;
  }

  /** Occurs when an item is selected, after the sheet closes and the item's own `click` runs. */
  get onItemClick(): MotifEvent<MenuItemClickEventArgs> {
    return this.actions.itemClick.event;
  }

  /**
   * Re-reads the items, including the visible level, after they have been changed in place. Your items can be
   * plain or reactive, and the sheet reads them as they are.
   */
  refresh(): void {
    const parts = this.actions;
    if (!this.isOpen) return;
    const levels = parts.levels.length ? parts.levels.slice() : [NO_ITEMS];
    levels[0] = this.peekProperty<readonly MenuItem[]>('items') ?? NO_ITEMS;
    this.showLevel(levels);
  }

  /** Opens the sheet. `byKeyboard` moves focus to the first item. Otherwise, focus moves to the list. */
  override open(byKeyboard = false): boolean {
    this.actions.byKeyboard = byKeyboard;
    return super.open();
  }

  /**
   * Opens the sheet with `items`, or with its own, and resolves with the selected item, or with `null` if it
   * closes without a selection. `host` gives it a place if it has none. Otherwise, it opens at the end of the page.
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
    this.class.add('mx-action-sheet');
    // The message above the list, in the content area.
    const message = part<HTMLDivElement>(this.contentPart, 'div', 'mx-action-sheet__message');
    kept(message, false);
    const list = new MenuList();
    list.source = this;
    list.openSubmenus = false;
    list.openOnHover = false;
    list.class.add('mx-action-sheet__list');
    list.onChosen((e) => this.chosen(e));
    const cancelRowPart = new Component<HTMLDivElement>('div');
    cancelRowPart.class.add('mx-action-sheet__cancel');
    const cancel = new Button({ stretch: true });
    cancel.motif.on('click', () => this.close('button'));
    this.placeIn(cancelRowPart, this.panelPart);
    this.placeIn(list, this.contentPart);
    this.placeIn(cancel, cancelRowPart);
    return { message, list, cancelRow: cancelRowPart, cancel, levels: [], byKeyboard: false, chosen: null, waiters: [], stopTexts: null, itemClick: new Emitter() };
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
    const back = lineAfter<MenuItem>({ text: uiLocale.strings.back, icon: () => backMark(), data: BACK });
    parts.list.setItems([back, ...givenList(items)]);
  }

  private chosen(e: MenuItemClickEventArgs): void {
    const parts = this.actions;
    const item = e.item;
    if (givenValue(item, 'data') === BACK) {
      this.showLevel(parts.levels.slice(0, -1));
      parts.list.focusItem('first');
      return;
    }
    const children = givenField<readonly MenuItem[] | undefined>(item, 'items') ?? NO_ITEMS;
    if (givenList(children).some((child) => givenField(child, 'visible') !== false)) {
      this.showLevel([...parts.levels, children]);
      parts.list.focusItem('first');
      return;
    }
    parts.chosen = item;
    this.close('code');
    runItem(item, { ...e, source: this }, this, e.event, this);
    parts.itemClick.fire({ ...e, source: this });
  }
}

const BACK = Symbol('back');

/** The way back out of a submenu: an arrow pointing to the start. */
function backMark(): Component<HTMLSpanElement> {
  const mark = chevronDown();
  mark.class.add('mx-action-sheet__back');
  return mark;
}
