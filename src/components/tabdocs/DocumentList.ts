import { untracked } from '@motifx/core';
import { MenuList } from '../../parts/menu/MenuList';
import type { MenuItem } from '../../parts/menu/menu-item';
import { Popup } from '../../parts/popup/Popup';
import { TextBox } from '../textbox/TextBox';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';

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
  /** The search and the documents, shown or hidden together. */
  private readonly part: HTMLElement;
  /** The line between the commands and the documents. */
  private readonly line: HTMLElement;
  private documents: readonly TabDocument[] = [];
  /** The documents the menu shows: the ones the search finds. */
  private shown: TabDocument[] = [];
  private active: TabDocument | null = null;
  /** The documents come from several groups: each one says which. */
  private groups = false;
  private commandsFirst = false;
  private held: { ctrl: boolean; alt: boolean; meta: boolean } | null = null;
  private returnFocus: HTMLElement | null = null;

  constructor(
    private readonly manager: TabDocumentManager,
    private readonly kind: 'open' | 'recent',
  ) {
    const popup = this.popup;
    popup.matchWidth = false;
    popup.placement = kind === 'open' ? 'bottom-end' : 'bottom';
    popup.element.classList.add('mx-tabdocs__popup');
    const own = manager.element.ownerDocument;
    const part = (this.part = own.createElement('div'));
    part.className = 'mx-tabdocs__list';
    const line = (this.line = own.createElement('div'));
    line.className = 'mx-menu__separator';
    line.setAttribute('role', 'separator');
    popup.element.append(part);

    if (kind === 'open') {
      const search = (this.search = new TextBox({ type: 'search', size: 'md', stretch: true, autocomplete: 'off' }));
      search.label = () => manager.textOf('search');
      search.placeholder = () => manager.textOf('search');
      search.element.classList.add('mx-tabdocs__search');
      search.onValueChanged((e) => this.showDocuments(e.value ?? ''));
      popup.controls.add(search);
    }
    const documents = this.documentMenu;
    documents.source = manager;
    documents.element.classList.add('mx-tabdocs__documents');
    // The shown document keeps its icon and gets a check beside it: a dot is the unsaved mark here.
    documents.markBesideIcon = true;
    documents.radioMark = 'check';
    documents.onChosen((e) => this.choose(e.item.data as TabDocument));
    popup.controls.add(documents);

    if (kind === 'open') {
      const commands = (this.commandMenu = new MenuList());
      commands.source = manager;
      commands.element.classList.add('mx-tabdocs__commands');
      // The documents have a column for the check and one for icons: the commands' texts line up with theirs.
      commands.markColumn = true;
      commands.markBesideIcon = true;
      commands.onChosen((e) => {
        popup.close('code');
        e.item.click?.(e);
      });
      popup.controls.add(commands);
    }
    popup.element.addEventListener('keydown', (e) => this.onKeyDown(e), true);
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
    anchor: HTMLElement,
    documents: readonly TabDocument[],
    start: number,
    commands: MenuItem[] = [],
    held: KeyboardEvent | null = null,
    options: { commandsFirst?: boolean; list?: boolean; active?: TabDocument | null } = {},
  ): void {
    const popup = this.popup;
    const manager = this.manager;
    if (!popup.parent) manager.controls.add(popup);
    // The popup puts its controls in itself when it is built: the search and the documents go into their part here.
    if (this.search) this.part.append(this.search.element);
    this.part.append(this.documentMenu.element);
    this.documents = documents;
    this.active = options.active ?? null;
    this.groups = new Set(documents.map((d) => d.group)).size > 1;
    this.returnFocus = anchor.ownerDocument.activeElement as HTMLElement | null;
    this.documentMenu.element.setAttribute('aria-label', manager.textOf(this.kind === 'open' ? 'tabDocsOpenList' : 'tabDocsRecent'));
    const showList = options.list !== false;
    this.part.hidden = !showList;
    const search = this.search;
    if (search) search.value = '';
    this.showDocuments('');
    const menu = this.commandMenu;
    if (menu) {
      // Without the documents there is nothing to line up with.
      menu.markColumn = menu.markBesideIcon = showList;
      menu.setItems(commands);
      menu.element.hidden = !commands.length;
      this.commandsFirst = !!options.commandsFirst;
      if (this.commandsFirst) this.part.before(menu.element, this.line);
      else this.part.after(this.line, menu.element);
      this.line.hidden = !commands.length || !showList;
    }
    popup.open(anchor, { returnFocus: this.returnFocus ?? undefined });
    if (!showList && menu) menu.focusItem('first');
    else if (search) {
      search.focus();
      this.keepInSight(this.itemOf(documents[start]));
    } else this.itemOf(documents[start])?.focus();
    this.stopHolding();
    if (held && (held.ctrlKey || held.altKey || held.metaKey)) {
      this.held = { ctrl: held.ctrlKey, alt: held.altKey, meta: held.metaKey };
      anchor.ownerDocument.addEventListener('keyup', this.onKeyUp, true);
    }
  }

  /** The recently used list: the next (or previous) document, around the ends. */
  walk(by: number): void {
    const count = this.shown.length;
    if (!count) return;
    const at = this.shown.indexOf(this.focusedDocument()!);
    this.itemOf(this.shown[(at + by + count) % count])?.focus();
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
    const query = text.trim().toLocaleLowerCase();
    this.shown = query ? this.documents.filter((d) => d.title.toLocaleLowerCase().includes(query)) : [...this.documents];
    const items = this.shown.map((doc) => this.menuItem(doc));
    if (!items.length) items.push({ text: this.manager.textOf('noItems'), enabled: false });
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
    const items = this.documentItems();
    this.shown.forEach((doc, i) => {
      if (!doc.dirty || !items[i]) return;
      const own = items[i].ownerDocument;
      const text = own.createElement('span');
      text.className = 'mx-tabdocs__hidden';
      text.textContent = `, ${this.manager.textOf('tabDocsUnsaved')}`;
      const dot = own.createElement('span');
      dot.className = 'mx-tabdocs__list-dirty';
      items[i].append(text, dot);
    });
  }

  /** Scrolls the documents, and only them, to show `item`. */
  private keepInSight(item: HTMLElement | undefined): void {
    if (!item) return;
    const menu = this.documentMenu.element;
    const box = menu.getBoundingClientRect();
    const at = item.getBoundingClientRect();
    if (at.top < box.top) menu.scrollTop -= box.top - at.top;
    else if (at.bottom > box.bottom) menu.scrollTop += at.bottom - box.bottom;
  }

  private documentItems(): HTMLElement[] {
    return Array.from(this.documentMenu.element.querySelectorAll<HTMLElement>(':scope > .mx-menu__item'));
  }

  private itemOf(doc: TabDocument | undefined): HTMLElement | undefined {
    const at = doc ? this.shown.indexOf(doc) : -1;
    return at < 0 ? undefined : this.documentItems()[at];
  }

  private focusedDocument(): TabDocument | undefined {
    const focused = this.popup.element.ownerDocument.activeElement;
    return this.shown[this.documentItems().findIndex((item) => item === focused)];
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
    const target = e.target as HTMLElement;
    // A submenu's keys are its own.
    if (target.closest('.mx-popup') !== this.popup.element) return;
    const onDocument = this.documentMenu.element.contains(target);
    const search = this.search;
    if (e.key === 'Enter') {
      const doc = onDocument ? this.focusedDocument() : search && target === search.inputElement ? this.shown[0] : undefined;
      if (!doc) return;
      e.preventDefault();
      e.stopPropagation();
      this.choose(doc);
      return;
    }
    if (this.kind !== 'open' || e.ctrlKey || e.metaKey || e.altKey) return;
    let handled = true;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') this.step(e.key === 'ArrowDown' ? 1 : -1);
    else if (e.key === 'Tab') handled = this.tabTo(target, e.shiftKey ? -1 : 1);
    else if (onDocument && search && (e.key === 'Backspace' || (e.key.length === 1 && e.key !== ' '))) this.typeInSearch(e.key);
    else handled = false;
    if (!handled) return;
    e.preventDefault();
    e.stopPropagation();
  }

  /** The parts of the "…" menu that show, top to bottom. */
  private parts(): HTMLElement[] {
    const list = this.part.hidden ? [] : [this.search!.inputElement, this.documentMenu.element];
    const menu = this.commandMenu!.element;
    if (menu.hidden) return list;
    return this.commandsFirst ? [menu, ...list] : [...list, menu];
  }

  private step(by: 1 | -1): void {
    const stops = this.parts().flatMap((part) => (part === this.search?.inputElement ? [part] : Array.from(part.querySelectorAll<HTMLElement>(':scope > .mx-menu__item'))));
    if (!stops.length) return;
    const at = stops.indexOf(this.popup.element.ownerDocument.activeElement as HTMLElement);
    const to = at < 0 ? (by > 0 ? 0 : stops.length - 1) : (at + by + stops.length) % stops.length;
    stops[to].focus();
  }

  /** Tab and Shift+Tab: the next part, or out of the menu (which closes it) from the last one. */
  private tabTo(target: HTMLElement, by: 1 | -1): boolean {
    const parts = this.parts();
    const next = parts[parts.findIndex((part) => part.contains(target)) + by];
    if (!next) return false;
    if (next === this.search?.inputElement) next.focus();
    else if (next === this.commandMenu?.element) this.commandMenu.focusItem(by > 0 ? 'first' : 'last');
    else this.documentMenu.focusItem(by > 0 ? 'first' : 'last');
    return true;
  }

  private typeInSearch(key: string): void {
    const search = this.search!;
    const input = search.inputElement;
    input.focus();
    search.value = key === 'Backspace' ? search.value.slice(0, -1) : search.value + key;
    input.setSelectionRange(input.value.length, input.value.length);
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
    this.manager.element.ownerDocument.removeEventListener('keyup', this.onKeyUp, true);
  }
}
