import { untracked } from '@motifx/core';
import { MenuList } from '../../parts/menu/MenuList';
import type { MenuItem } from '../../parts/menu/menu-item';
import { Popup } from '../../parts/popup/Popup';
import { ListBox } from '../listbox/ListBox';
import type { TabDocument } from './TabDocument';
import type { TabDocumentManager } from './TabDocumentManager';

/**
 * A popup with a list of documents, for the group's "…" button (searchable, with a few commands
 * under it) and for the recently used list (walked with the keys while a modifier is held). The
 * manager holds one of each.
 */
export class DocumentList {
  readonly popup = new Popup();
  readonly list: ListBox<TabDocument, TabDocument>;
  readonly menu: MenuList | null;
  private documents: readonly TabDocument[] = [];
  private current = -1;
  /** The documents come from several groups: each one says which. */
  private groups = false;
  private held: { ctrl: boolean; alt: boolean; meta: boolean } | null = null;
  private returnFocus: HTMLElement | null = null;

  constructor(
    private readonly manager: TabDocumentManager,
    kind: 'open' | 'recent',
  ) {
    const popup = this.popup;
    popup.matchWidth = false;
    popup.placement = kind === 'open' ? 'bottom-end' : 'bottom';
    popup.element.classList.add('mx-tabdocs__popup');
    const list = (this.list = new ListBox<TabDocument, TabDocument>({
      labelMode: 'hidden',
      label: () => manager.textOf(kind === 'open' ? 'tabDocsOpenList' : 'tabDocsRecent'),
      searchEnabled: kind === 'open',
      selectionFollowsFocus: false,
      stretch: true,
      size: 'sm',
      textField: (doc: TabDocument) => doc.title,
      iconField: (doc: TabDocument) => doc.icon,
      itemTemplate: (doc: TabDocument, host: HTMLElement) => this.draw(doc, host),
    }));
    list.element.classList.add('mx-tabdocs__list');
    list.onValueChanged((e) => {
      if (e.byUser && e.value && !Array.isArray(e.value)) this.choose(e.value);
    });
    popup.controls.add(list);
    this.menu = null;
    if (kind === 'open') {
      const menu = (this.menu = new MenuList());
      menu.source = manager;
      menu.onChosen((e) => {
        popup.close('code');
        e.item.click?.(e);
      });
      popup.controls.add(menu);
    } else {
      popup.element.addEventListener('keydown', (e) => this.walkKey(e), true);
    }
    popup.onClosed(() => this.stopHolding());
  }

  get isOpen(): boolean {
    return this.popup.isOpen;
  }

  /**
   * Opens next to `anchor` with `documents`, `start` highlighted. `held`: the modifiers that opened
   * it; letting go of them opens the highlighted document.
   */
  open(anchor: HTMLElement, documents: readonly TabDocument[], start: number, commands: MenuItem[] = [], held: KeyboardEvent | null = null): void {
    const popup = this.popup;
    if (!popup.parent) this.manager.controls.add(popup);
    this.documents = documents;
    this.groups = new Set(documents.map((d) => d.group)).size > 1;
    this.returnFocus = anchor.ownerDocument.activeElement as HTMLElement | null;
    this.list.value = null;
    this.list.items = documents;
    this.menu?.setItems(commands);
    if (this.menu) this.menu.element.hidden = !commands.length;
    popup.open(anchor, { returnFocus: this.returnFocus ?? undefined });
    if (this.list.searchBox) {
      this.list.searchBox.value = '';
      this.list.searchBox.focus();
    } else {
      this.list.focus();
    }
    // The list draws its new items on the next microtask.
    queueMicrotask(() => this.highlight(start));
    this.stopHolding();
    if (held && (held.ctrlKey || held.altKey || held.metaKey)) {
      this.held = { ctrl: held.ctrlKey, alt: held.altKey, meta: held.metaKey };
      anchor.ownerDocument.addEventListener('keyup', this.onKeyUp, true);
    }
  }

  /** The recently used list: the next (or previous) document, around the ends. */
  walk(by: number): void {
    const count = this.documents.length;
    if (count) this.highlight((this.current + by + count) % count);
  }

  close(): void {
    this.popup.close('code');
  }

  dispose(): void {
    this.stopHolding();
    if (!this.popup.isDisposed) void this.popup.dispose();
  }

  private highlight(index: number): void {
    const doc = this.documents[index];
    if (!doc) return;
    this.current = index;
    this.list.scrollToItem(doc);
  }

  private choose(doc: TabDocument): void {
    this.popup.close('code');
    untracked(() => this.manager.activateFromList(doc));
  }

  private walkKey(e: KeyboardEvent): void {
    if (e.ctrlKey && e.key !== 'Enter') return;
    const count = this.documents.length;
    let to = -1;
    if (e.key === 'ArrowDown') to = (this.current + 1) % count;
    else if (e.key === 'ArrowUp') to = (this.current - 1 + count) % count;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = count - 1;
    else if (e.key === 'Enter' && this.documents[this.current]) {
      e.preventDefault();
      e.stopPropagation();
      this.choose(this.documents[this.current]);
      return;
    } else return;
    e.preventDefault();
    e.stopPropagation();
    if (count) this.highlight(to);
  }

  private readonly onKeyUp = (e: KeyboardEvent) => {
    const held = this.held;
    if (!held) return;
    if ((held.ctrl && e.ctrlKey) || (held.alt && e.altKey) || (held.meta && e.metaKey)) return;
    const doc = this.documents[this.current];
    this.stopHolding();
    if (doc) this.choose(doc);
  };

  private stopHolding(): void {
    this.held = null;
    this.manager.element.ownerDocument.removeEventListener('keyup', this.onKeyUp, true);
  }

  /** The title, then what tells it apart: its description, its group when the list has every group's, unsaved changes. */
  private draw(doc: TabDocument, host: HTMLElement): void {
    const manager = this.manager;
    const own = host.ownerDocument;
    const title = own.createElement('span');
    title.className = 'mx-tabdocs__list-title';
    title.textContent = doc.title;
    host.append(title);
    const notes: string[] = [];
    if (doc.description) notes.push(doc.description);
    if (this.groups) notes.push(manager.textOf('tabDocsInGroup', { n: manager.groups.indexOf(doc.group!) + 1 }));
    if (notes.length) {
      const note = own.createElement('span');
      note.className = 'mx-tabdocs__list-note';
      note.textContent = notes.join(' · ');
      host.append(' ', note);
    }
    if (doc.dirty) {
      const dot = own.createElement('span');
      dot.className = 'mx-tabdocs__list-dirty';
      const text = own.createElement('span');
      text.className = 'mx-tabdocs__hidden';
      text.textContent = `, ${manager.textOf('tabDocsUnsaved')}`;
      host.append(dot, text);
    }
  }
}
