import { Component, untracked, type ComponentBase } from '@motifx/core';
import { part } from '../../core/draw-parts';
import { focusOn, holdsFocus, rememberFocus } from '../../core/focus';
import { orderControls } from '../../core/order-controls';
import { kept, put, text } from '../../core/part-writes';
import { reveal } from '../../core/measure';
import { onDocument } from '../../core/window-events';
import { MenuList } from '../../parts/menu/MenuList';
import type { MenuItem } from '../../parts/menu/menu-item';
import { Popup } from '../../parts/popup/Popup';
import { TextBox } from '../textbox/TextBox';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';
import { foldText } from '../../core/fold-text';

/**
 * A menu of documents, for the group's "…" button (a search above the documents, a few commands
 * with them) and for the recently used list (walked with the keys while a modifier is held). The
 * documents are items of the kit's menu, so they look like the commands. The manager holds one of each.
 */
export class DocumentList {
  readonly popup = new Popup();
  readonly documentMenu = new MenuList();
  /** The commands of the "…" menu; `null` in the recently used list. */
  readonly commandMenu: MenuList | null = null;
  readonly search: TextBox | null = null;
  /** The search and the documents, shown or hidden together: a component of the popup holding them. */
  private readonly partBox: Component<HTMLDivElement>;
  /** The search and the documents show (`list` of `open`). */
  private listShown = true;
  /** The line between the commands and the documents, a component of the popup. */
  private readonly lineBox: Component<HTMLDivElement>;
  private documents: readonly TabDocument[] = [];
  /** The documents the menu shows: the ones the search finds. */
  private shown: TabDocument[] = [];
  /** What the documents' menu was given: an item for each shown document, in the same order, or the "No items" one. */
  private documentItems: MenuItem[] = [];
  /** What the commands' menu was given. */
  private commandItems: MenuItem[] = [];
  private active: TabDocument | null = null;
  /** The documents come from several groups: each one says which. */
  private groups = false;
  private commandsFirst = false;
  private held: { ctrl: boolean; alt: boolean; meta: boolean } | null = null;
  /** Stops listening for the held modifiers to be let go. */
  private stopKeyUp: (() => void) | null = null;

  constructor(
    private readonly manager: TabDocumentManager,
    private readonly kind: 'open' | 'recent',
  ) {
    const popup = this.popup;
    popup.matchWidth = false;
    popup.placement = kind === 'open' ? 'bottom-end' : 'bottom';
    popup.class.add('mx-tabdocs__popup');
    const partBox = (this.partBox = new Component<HTMLDivElement>('div'));
    partBox.class.add('mx-tabdocs__list');
    const lineBox = (this.lineBox = new Component<HTMLDivElement>('div'));
    lineBox.class.add('mx-menu__separator');
    lineBox.attr.add({ role: 'separator' });
    popup.controls.add(partBox);

    if (kind === 'open') {
      const search = (this.search = new TextBox({ type: 'search', size: 'md', stretch: true, autocomplete: 'off' }));
      search.label = () => manager.textOf('search');
      search.placeholder = () => manager.textOf('search');
      search.class.add('mx-tabdocs__search');
      search.onValueChanged((e) => this.showDocuments(e.value ?? ''));
      partBox.controls.add(search);
    }
    const documents = this.documentMenu;
    documents.source = manager;
    documents.class.add('mx-tabdocs__documents');
    // The shown document keeps its icon and gets a check beside it: a dot is the unsaved mark here.
    documents.markBesideIcon = true;
    documents.radioMark = 'check';
    documents.onChosen((e) => this.choose(e.item.data as TabDocument));
    partBox.controls.add(documents);

    if (kind === 'open') {
      const commands = (this.commandMenu = new MenuList());
      commands.source = manager;
      commands.class.add('mx-tabdocs__commands');
      // The documents have a column for the check and one for icons: the commands' texts line up with theirs.
      commands.markColumn = true;
      commands.markBesideIcon = true;
      commands.onChosen((e) => {
        popup.close('code');
        e.item.click?.(e);
      });
      popup.controls.add(lineBox, commands);
    }
    popup.motif.on('keydown:capture', (_, e) => this.onKeyDown(e));
    popup.onClosed(() => this.stopHolding());
  }

  get isOpen(): boolean {
    return this.popup.isOpen;
  }

  /**
   * Opens next to `anchor` with `documents`, `start` focused (or, under the search, in sight).
   * `held`: the modifiers that opened it; letting go of them opens the focused document.
   * `active`: the document marked as the one shown. `commandsFirst`: the commands above the
   * documents; `list: false` shows only the commands.
   */
  open(
    anchor: ComponentBase,
    documents: readonly TabDocument[],
    start: number,
    commands: MenuItem[] = [],
    held: KeyboardEvent | null = null,
    options: { commandsFirst?: boolean; list?: boolean; active?: TabDocument | null } = {},
  ): void {
    const popup = this.popup;
    const manager = this.manager;
    if (!popup.parent) manager.controls.add(popup);
    this.documents = documents;
    this.active = options.active ?? null;
    this.groups = new Set(documents.map((d) => d.group)).size > 1;
    // Where focus is now: it goes back there when the menu closes with focus in it.
    const returnTo = rememberFocus(held ?? undefined);
    put(this.documentMenu, 'aria-label', manager.textOf(this.kind === 'open' ? 'tabDocsOpenList' : 'tabDocsRecent'));
    const showList = options.list !== false;
    this.listShown = showList;
    kept(this.partBox, showList);
    const search = this.search;
    if (search) search.value = '';
    this.showDocuments('');
    const menu = this.commandMenu;
    if (menu) {
      // Without the documents there is nothing to line up with.
      menu.markColumn = menu.markBesideIcon = showList;
      this.commandItems = commands;
      menu.setItems(commands);
      kept(menu, commands.length > 0);
      this.commandsFirst = !!options.commandsFirst;
      orderControls(popup, this.commandsFirst ? [menu, this.lineBox, this.partBox] : [this.partBox, this.lineBox, menu]);
      kept(this.lineBox, commands.length > 0 && showList);
    }
    popup.open(anchor, { returnFocus: returnTo ?? undefined });
    if (!showList && menu) menu.focusItem('first');
    else if (search) {
      search.focus();
      this.keepInSight(this.itemOf(documents[start]));
    } else this.focusDocument(documents[start]);
    this.stopHolding();
    if (held && (held.ctrlKey || held.altKey || held.metaKey)) {
      this.held = { ctrl: held.ctrlKey, alt: held.altKey, meta: held.metaKey };
      // In the document the menu opened in, its anchor's.
      this.stopKeyUp = onDocument(popup, 'keyup', this.onKeyUp, true);
    }
  }

  /** The recently used list: the next (or previous) document, around the ends. */
  walk(by: number): void {
    const count = this.shown.length;
    if (!count) return;
    const at = this.shown.indexOf(this.focusedDocument()!);
    this.focusDocument(this.shown[(at + by + count) % count]);
  }

  close(): void {
    this.popup.close('code');
  }

  dispose(): void {
    this.stopHolding();
    if (!this.popup.isDisposed) void this.popup.dispose();
  }

  /** Draws the documents whose title has `text`, or a dimmed "No items" when none has. */
  private showDocuments(text: string): void {
    const query = foldText(text.trim());
    this.shown = query ? this.documents.filter((d) => foldText(d.title).includes(query)) : [...this.documents];
    const items = this.shown.map((doc) => this.menuItem(doc));
    if (!items.length) items.push({ text: this.manager.textOf('noItems'), enabled: false });
    this.documentItems = items;
    this.documentMenu.setItems(items);
    this.markUnsaved();
  }

  /** A document as a menu item: its title, then what tells it apart (its description, its group when the menu has every group's). */
  private menuItem(doc: TabDocument): MenuItem {
    const manager = this.manager;
    const notes: string[] = [];
    if (doc.description) notes.push(doc.description);
    if (this.groups) notes.push(manager.textOf('tabDocsInGroup', { n: manager.groups.indexOf(doc.group!) + 1 }));
    return {
      text: doc.title.replace(/&/g, '&&'),
      description: notes.join(' · '),
      icon: doc.icon,
      hint: doc.tooltip || (doc.description ? `${doc.title} — ${doc.description}` : ''),
      group: 'documents',
      checked: doc === this.active,
      data: doc,
    };
  }

  /** The unsaved mark at the end of a document's item, and the words for it in its name. */
  private markUnsaved(): void {
    this.shown.forEach((doc, i) => {
      const item = doc.dirty ? this.documentMenu.buttonOf(this.documentItems[i]) : null;
      if (!item) return;
      // The menu's item is a part of the menu: the mark and the words are parts of it.
      text(part(item, 'span', 'mx-tabdocs__hidden'), `, ${this.manager.textOf('tabDocsUnsaved')}`);
      part(item, 'span', 'mx-tabdocs__list-dirty');
    });
  }

  /** Scrolls the documents, and only them, to show `item`. */
  private keepInSight(item: Component<HTMLButtonElement> | null): void {
    if (item) reveal(this.documentMenu, item, { axis: 'y' });
  }

  /** The item a shown document is drawn as. */
  private itemOf(doc: TabDocument | undefined): Component<HTMLButtonElement> | null {
    const at = doc ? this.shown.indexOf(doc) : -1;
    return at < 0 ? null : this.documentMenu.buttonOf(this.documentItems[at]);
  }

  private focusDocument(doc: TabDocument | undefined): void {
    const item = this.itemOf(doc);
    if (item) focusOn(item);
  }

  /** The shown document whose item has focus. */
  private focusedDocument(): TabDocument | undefined {
    const item = this.documentMenu.focusedItem;
    return item ? this.shown[this.documentItems.indexOf(item)] : undefined;
  }

  private choose(doc: TabDocument): void {
    this.popup.close('code');
    untracked(() => this.manager.activateFromList(doc));
  }

  /**
   * Enter opens the focused document, also with the modifier still held. In the "…" menu Up and
   * Down go on from the search to the documents and the commands and around, Tab goes from one
   * part to the next, and typing on a document goes back to the search with what was typed.
   */
  private onKeyDown(e: KeyboardEvent): void {
    // A submenu's keys are its own.
    if (this.popup.controls.items.some((c) => c instanceof Popup && c.motif.isEventFrom(e))) return;
    const onDocument = this.documentMenu.motif.isEventFrom(e);
    const search = this.search;
    if (e.key === 'Enter') {
      const doc = onDocument ? this.focusedDocument() : search?.motif.isEventFrom(e) ? this.shown[0] : undefined;
      if (!doc) return;
      e.preventDefault();
      e.stopPropagation();
      this.choose(doc);
      return;
    }
    if (this.kind !== 'open' || e.ctrlKey || e.metaKey || e.altKey) return;
    let handled = true;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') this.step(e.key === 'ArrowDown' ? 1 : -1);
    else if (e.key === 'Tab') handled = this.tabTo(e, e.shiftKey ? -1 : 1);
    else if (onDocument && search && (e.key === 'Backspace' || (e.key.length === 1 && e.key !== ' '))) this.typeInSearch(e.key);
    else handled = false;
    if (!handled) return;
    e.preventDefault();
    e.stopPropagation();
  }

  /** The parts of the "…" menu that show, top to bottom. */
  private parts(): (TextBox | MenuList)[] {
    const list: (TextBox | MenuList)[] = this.listShown ? [this.search!, this.documentMenu] : [];
    const menu = this.commandMenu!;
    if (!this.commandItems.length) return list;
    return this.commandsFirst ? [menu, ...list] : [...list, menu];
  }

  /** The items a menu shows, in order. */
  private itemsOf(menu: MenuList): ComponentBase[] {
    const given = menu === this.documentMenu ? this.documentItems : this.commandItems;
    return given.flatMap((item) => menu.buttonOf(item) ?? []);
  }

  private step(by: 1 | -1): void {
    const stops = this.parts().flatMap((part): ComponentBase[] => (part instanceof MenuList ? this.itemsOf(part) : [part]));
    if (!stops.length) return;
    const at = stops.findIndex((stop) => holdsFocus(stop));
    const to = at < 0 ? (by > 0 ? 0 : stops.length - 1) : (at + by + stops.length) % stops.length;
    const next = stops[to];
    if (next === this.search) this.search.focus();
    else focusOn(next);
  }

  /** Tab and Shift+Tab: the next part, or out of the menu (which closes it) from the last one. */
  private tabTo(e: KeyboardEvent, by: 1 | -1): boolean {
    const parts = this.parts();
    const next = parts[parts.findIndex((part) => part.motif.isEventFrom(e)) + by];
    if (!next) return false;
    if (next instanceof MenuList) next.focusItem(by > 0 ? 'first' : 'last');
    else next.focus();
    return true;
  }

  private typeInSearch(key: string): void {
    const search = this.search!;
    search.focus();
    // A new value puts the caret at its end.
    search.value = key === 'Backspace' ? search.value.slice(0, -1) : search.value + key;
  }

  private readonly onKeyUp = (e: KeyboardEvent) => {
    const held = this.held;
    if (!held) return;
    if ((held.ctrl && e.ctrlKey) || (held.alt && e.altKey) || (held.meta && e.metaKey)) return;
    const doc = this.focusedDocument();
    this.stopHolding();
    if (doc) this.choose(doc);
  };

  private stopHolding(): void {
    this.held = null;
    this.stopKeyUp?.();
    this.stopKeyUp = null;
  }
}
