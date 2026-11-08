import { Component, Emitter, read, type Bind, type ComponentBase, type Event as MotifEvent } from '@motifx/core';
import { follow } from '../../core/follow';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { commands } from '../../core/command-registry';
import { fieldOf, namesCommands, shortcutOf } from '../../core/command-fields';
import { parseAccessKey, renderAccessKey } from '../../core/access-key';
import { checkMark, chevronEnd, radioMark } from '../../core/glyphs';
import { iconNode } from '../../core/icon-node';
import type { IconSource } from '../../core/icon-source';
import { isNode } from '../../core/node-kind';
import { Popup } from '../popup/Popup';
import { hasLineAfter } from './line-after';
import type { MenuItem } from './menu-item';
import type { MenuItemClickEventArgs } from './menu-item-click-event-args';
import { foldText } from '../../core/fold-text';

/** An item's fields as read for one drawing. */
interface ItemLook {
  item: MenuItem;
  visible: boolean;
  beginGroup: boolean;
  text: string;
  hint: string | undefined;
  checked: boolean | undefined;
  radio: boolean;
  enabled: boolean;
  shortcut: string;
  description: string;
  submenu: boolean;
  tone: string;
}

interface Entry {
  item: MenuItem;
  element: HTMLButtonElement;
  enabled: boolean;
  submenu: boolean;
  /** The `&` key, lower case. */
  key: string | null;
  /** The label, lower case, for typing to an item. */
  text: string;
}

interface Submenu {
  popup: Popup;
  list: MenuList;
  /** The item whose submenu is open. */
  entry: Entry | null;
}

/**
 * A list of commands (`role="menu"`). Up and Down move between the items and wrap around, Home
 * and End move to the ends, a letter moves to the next item that starts with it, an item's `&` key
 * selects it, and Enter and Space select the focused item. A disabled item can be reached but not
 * selected. An item with `items` opens a submenu at its side: Right (Left in a right-to-left page),
 * Enter or Space open it, Left closes it again, and pointing at the item opens it after `hoverDelay`.
 */
export class MenuList extends Component<HTMLDivElement> {
  static override elementTag = 'div';

  /** The component the menu belongs to, reported with every selected item. */
  source: ComponentBase | null = null;
  /** Pointing at an item opens its submenu (and pointing elsewhere closes it) after `hoverDelay`. */
  openOnHover = true;
  /** The milliseconds the pointer rests on an item before its submenu opens or closes. */
  hoverDelay = 250;
  /** The menu this one is a submenu of. */
  parentList: MenuList | null = null;
  /** Keeps the column for a mark or an icon when no item has one, so the texts line up with a menu beside it. */
  markColumn = false;
  /** A checked item keeps its icon, and the mark gets its own column before the icons. */
  markBesideIcon = false;
  /** How a selected radio item is marked: a dot, or a check when a dot means something else in the menu. */
  radioMark: 'dot' | 'check' = 'dot';
  /**
   * Lets an item with `items` open its submenu at its side. `false` reports it as selected instead, for an owner
   * that shows the submenu itself.
   */
  openSubmenus = true;

  private given: Bind<readonly MenuItem[]> | undefined;
  private entries: Entry[] = [];
  private releases: (() => void)[] = [];
  private stopDrawing: (() => void) | null = null;
  private sub: Submenu | null = null;
  private hoverTimer: ReturnType<typeof setTimeout> | undefined;
  private hoverEntry: Entry | null = null;
  private pointerFocus = false;
  private readonly chosenEmitter = new Emitter<MenuItemClickEventArgs>();
  /** Some item names a command: the list is drawn again when the commands change. */
  private namesCommands = false;

  /** Occurs when an item is selected, here or in a submenu. The owner closes the menu, then runs the item's `click`. */
  readonly onChosen: MotifEvent<MenuItemClickEventArgs> = this.chosenEmitter.event;

  override onConfigured(): void {
    this.class.add('mx-menu');
    this.attr.add({ role: 'menu', 'aria-orientation': 'vertical' });
    this.element.addEventListener('keydown', (e) => this.onKeyDown(e));
    this.element.addEventListener('click', (e) => this.onClick(e));
    this.element.addEventListener('focusin', (e) => this.onFocusIn(e));
    // The pointer and the keyboard share one highlight: the focused item.
    this.element.addEventListener('pointermove', (e) => this.onPointerMove(e));
    const listening = commands.onChanged(() => this.namesCommands && this.refresh());
    this.motif.setDisposable(() => {
      listening.dispose();
      this.cancelHover();
      this.stopDrawing?.();
      this.clear();
      this.chosenEmitter.dispose();
      const popup = this.sub?.popup;
      if (popup && !popup.isDisposed) void popup.dispose();
    });
  }

  /**
   * Shows the visible entries of `items`, and redraws them when a function in an item reads a value that
   * changes, or on `reState()`. The items and their fields are read as they are. After changing them in place,
   * call `refresh`.
   */
  setItems(items: Bind<readonly MenuItem[]>): void {
    this.stopDrawing?.();
    this.given = items;
    // The getter and the items' own functions are tracked; the list and the fields are not, nor is drawing.
    this.stopDrawing = follow(this, 'items', () => {
      const list = givenList(read(items));
      this.namesCommands = namesCommands(list);
      const from = this.element;
      const looks = list.map((item): ItemLook => {
        const group = givenField<string | undefined>(item, 'group');
        const children = givenList(givenField<readonly MenuItem[] | undefined>(item, 'items'));
        return {
          item,
          visible: fieldOf(item, 'visible', from) !== false,
          beginGroup: !!givenField(item, 'beginGroup'),
          text: fieldOf<string | undefined>(item, 'text', from) ?? '',
          hint: fieldOf<string | undefined>(item, 'hint', from),
          checked: fieldOf<boolean | undefined>(item, 'checked', from),
          radio: !!group,
          enabled: fieldOf(item, 'enabled', from) !== false,
          shortcut: shortcutOf(item, from),
          description: givenField<string | undefined>(item, 'description') ?? '',
          tone: givenField<string | undefined>(item, 'tone') ?? 'standard',
          submenu: children.some((child) => givenField(child, 'visible') !== false),
        };
      });
      return looks;
    }, (looks) => this.draw(looks));
  }

  /** Re-reads the items, and those of an open submenu, after they have been changed in place. */
  refresh(): void {
    if (this.given !== undefined) this.setItems(this.given);
    const sub = this.sub;
    if (!sub?.entry) return;
    sub.list.given = givenValue<Bind<readonly MenuItem[]> | undefined>(sub.entry.item, 'items') ?? [];
    sub.list.refresh();
  }

  get itemCount(): number {
    return this.entries.length;
  }

  /** The list of the open submenu, or `null` if none is open. */
  get submenu(): MenuList | null {
    return this.sub?.entry ? this.sub.list : null;
  }

  /** The item drawn at `target`, an element of this list; `null` when there is none. */
  itemOf(target: EventTarget | null): MenuItem | null {
    return this.entryOf(target)?.item ?? null;
  }

  /** Sets focus on the first item that `test` accepts. Returns `false` if there is none. */
  focusWhere(test: (item: MenuItem) => boolean): boolean {
    const entry = this.entries.find((e) => test(e.item));
    entry?.element.focus();
    return !!entry;
  }

  /** Sets focus on the first or last item. Returns `false` if there is none. */
  focusItem(which: 'first' | 'last'): boolean {
    const entry = which === 'first' ? this.entries[0] : this.entries[this.entries.length - 1];
    entry?.element.focus();
    return !!entry;
  }

  /**
   * Sets focus on the menu itself with no item highlighted, as a menu opened by the pointer does.
   * Down then moves to the first item.
   */
  focusList(): void {
    if (!this.element.hasAttribute('tabindex')) this.element.tabIndex = -1;
    this.element.focus();
  }

  /** Closes the open submenu, and the ones it opened. */
  closeSubmenu(): void {
    this.cancelHover();
    if (this.sub?.entry) this.sub.popup.close('code');
  }

  private draw(looks: readonly ItemLook[]): void {
    // The focused item keeps its place when the items are drawn again.
    const focused = this.entries.findIndex((entry) => entry.element === this.element.ownerDocument.activeElement);
    const openItem = this.sub?.entry?.item;
    this.cancelHover();
    this.clear();
    let checks = false;
    let icons = false;
    let newGroup = false;
    for (const look of looks) {
      if (!look.visible) continue;
      if ((look.beginGroup || newGroup) && this.entries.length) {
        const line = this.element.ownerDocument.createElement('div');
        line.className = 'mx-menu__separator';
        line.setAttribute('role', 'separator');
        this.element.append(line);
      }
      const parsed = parseAccessKey(look.text);
      const element = this.itemElement(look);
      const label = this.element.ownerDocument.createElement('span');
      label.className = 'mx-menu__label';
      renderAccessKey(label, parsed);
      element.querySelector('.mx-menu__icon')!.after(label);
      if (look.description) {
        const description = this.element.ownerDocument.createElement('span');
        description.className = 'mx-menu__description';
        description.textContent = look.description;
        // The space keeps the two words apart in the item's name; a flex row does not draw it.
        label.after(' ', description);
      }
      this.element.append(element);
      newGroup = hasLineAfter(look.item);
      this.entries.push({
        item: look.item,
        element,
        enabled: look.enabled,
        submenu: look.submenu,
        key: parsed.key != null ? foldText(parsed.key) : null,
        text: foldText(parsed.text),
      });
      checks ||= look.checked !== undefined || look.radio;
      icons ||= !!element.querySelector('.mx-menu__icon > *');
    }
    this.element.toggleAttribute('data-checks', checks);
    this.element.toggleAttribute('data-icons', icons || this.markColumn);
    this.element.toggleAttribute('data-marks-apart', this.markBesideIcon);
    if (focused >= 0) this.entries[Math.min(focused, this.entries.length - 1)]?.element.focus();
    if (openItem) {
      // The open submenu stays with its item, or goes with it.
      const entry = this.entries.find((e) => e.item === openItem);
      if (entry?.submenu && entry.enabled) this.showSubmenu(entry);
      else this.closeSubmenu();
    }
  }

  private itemElement(look: ItemLook): HTMLButtonElement {
    const element = this.element.ownerDocument.createElement('button');
    element.type = 'button';
    element.tabIndex = -1;
    element.className = 'mx-menu__item';
    const role = look.radio ? 'menuitemradio' : look.checked === undefined ? 'menuitem' : 'menuitemcheckbox';
    element.setAttribute('role', role);
    if (role !== 'menuitem') element.setAttribute('aria-checked', String(!!look.checked));
    if (!look.enabled) element.setAttribute('aria-disabled', 'true');
    if (look.hint) element.title = look.hint;
    if (look.tone !== 'standard') element.dataset.tone = look.tone;
    if (look.submenu) {
      element.setAttribute('aria-haspopup', 'menu');
      element.setAttribute('aria-expanded', 'false');
    }

    const check = element.appendChild(this.element.ownerDocument.createElement('span'));
    check.className = 'mx-menu__check';
    if (look.checked) check.append(look.radio && this.radioMark === 'dot' ? radioMark() : checkMark());
    const icon = element.appendChild(this.element.ownerDocument.createElement('span'));
    icon.className = 'mx-menu__icon';
    const source = fieldOf<IconSource | null | undefined>(look.item, 'icon', this.element);
    if (source) {
      const shown = iconNode(source);
      icon.append(shown.node);
      this.releases.push(shown.release);
    }
    if (look.shortcut) {
      const shortcut = element.appendChild(this.element.ownerDocument.createElement('span'));
      shortcut.className = 'mx-menu__shortcut';
      shortcut.textContent = look.shortcut;
    }
    if (look.submenu) {
      const arrow = element.appendChild(this.element.ownerDocument.createElement('span'));
      arrow.className = 'mx-menu__arrow';
      arrow.append(chevronEnd());
    }
    return element;
  }

  private clear(): void {
    for (const release of this.releases.splice(0)) release();
    this.entries = [];
    this.element.replaceChildren();
  }

  private entryOf(target: EventTarget | null): Entry | undefined {
    return isNode(target) ? this.entries.find((e) => e.element.contains(target)) : undefined;
  }

  private onClick(e: MouseEvent): void {
    const entry = this.entryOf(e.target);
    if (!entry) return;
    // A click from the keyboard (Enter, Space) moves into the submenu; one from the pointer leaves focus where it is.
    if (entry.submenu && this.openSubmenus) this.openSubmenu(entry, e.detail === 0 ? 'first' : null);
    else this.choose(entry, e);
  }

  private choose(entry: Entry, event: Event): void {
    if (!entry.enabled) return;
    if (entry.submenu && this.openSubmenus) {
      this.openSubmenu(entry, 'first');
      return;
    }
    this.chosenEmitter.fire({ item: entry.item, source: this.source ?? this, event });
  }

  // Submenus.

  private openSubmenu(entry: Entry, focus: 'first' | 'last' | null): void {
    if (!entry.submenu || !entry.enabled || !this.openSubmenus) return;
    this.cancelHover();
    const sub = (this.sub ??= this.createSubmenu());
    if (sub.entry !== entry) {
      if (sub.entry) sub.popup.close('code');
      sub.list.setItems(givenValue<Bind<readonly MenuItem[]> | undefined>(entry.item, 'items') ?? []);
    }
    this.showSubmenu(entry);
    if (focus) sub.list.focusItem(focus);
  }

  private showSubmenu(entry: Entry): void {
    const sub = this.sub!;
    const list = sub.list;
    list.source = this.source ?? this;
    list.openOnHover = this.openOnHover;
    list.hoverDelay = this.hoverDelay;
    sub.entry = entry;
    sub.popup.open(entry.element, { toggle: entry.element, returnFocus: entry.element });
    entry.element.setAttribute('aria-expanded', 'true');
  }

  private createSubmenu(): Submenu {
    const popup = new Popup();
    popup.placement = 'end-start';
    popup.matchWidth = false;
    const list = new MenuList();
    list.parentList = this;
    list.onChosen((e) => this.chosenEmitter.fire(e));
    popup.controls.add(list);
    // Next to this list, inside whatever holds it (the popup it opened in): focus and presses in a
    // submenu stay inside the menus that opened it, and a menu does not hold another menu.
    (this.parent ?? this).controls.add(popup);
    const sub: Submenu = { popup, list, entry: null };
    popup.element.addEventListener('pointermove', () => this.cancelHover());
    popup.onClosed(() => {
      sub.entry?.element.setAttribute('aria-expanded', 'false');
      sub.entry = null;
      list.closeSubmenu();
    });
    const host = this.hostPopup();
    if (host) {
      const listening = host.onClosed(() => this.closeSubmenu());
      this.motif.setDisposable(() => listening.dispose());
    }
    return sub;
  }

  /** The popup this list is shown in. */
  private hostPopup(): Popup | null {
    for (let p = this.parent; p; p = p.parent) if (p instanceof Popup) return p;
    return null;
  }

  private onPointerMove(e: PointerEvent): void {
    const entry = this.entryOf(e.target);
    if (!entry) return;
    if (entry.element !== this.element.ownerDocument.activeElement) {
      this.pointerFocus = true;
      entry.element.focus({ preventScroll: true });
      this.pointerFocus = false;
    }
    if (!this.openOnHover || entry === this.hoverEntry) return;
    this.cancelHover();
    const open = this.sub?.entry;
    if (open === entry || (!open && !entry.submenu)) return;
    this.hoverEntry = entry;
    this.hoverTimer = setTimeout(() => {
      this.hoverEntry = null;
      if (entry.submenu && entry.enabled) this.openSubmenu(entry, null);
      else this.closeSubmenu();
    }, this.hoverDelay);
  }

  private cancelHover(): void {
    clearTimeout(this.hoverTimer);
    this.hoverEntry = null;
  }

  /** The keys move to another item: an open submenu of another one closes (the pointer waits for its delay). */
  private onFocusIn(e: FocusEvent): void {
    const entry = this.entryOf(e.target);
    const open = this.sub?.entry;
    if (!this.pointerFocus && entry && open && open !== entry) this.closeSubmenu();
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (!this.entries.length || e.ctrlKey || e.metaKey || e.altKey) return;
    const at = this.entries.findIndex((entry) => entry.element === this.element.ownerDocument.activeElement);
    const go = (index: number) => this.entries[(index + this.entries.length) % this.entries.length].element.focus();
    const rtl = (this.element.ownerDocument.defaultView ?? window).getComputedStyle(this.element).direction === 'rtl';
    switch (e.key) {
      case 'ArrowDown':
        go(at + 1);
        break;
      case 'ArrowUp':
        go(at < 0 ? -1 : at - 1);
        break;
      case 'Home':
        go(0);
        break;
      case 'End':
        go(-1);
        break;
      case 'ArrowRight':
      case 'ArrowLeft': {
        // Not handled here, the key goes on: a menu bar moves to the next menu.
        if ((e.key === 'ArrowRight') !== rtl) {
          const entry = this.entries[at];
          if (!entry?.submenu || !entry.enabled) return;
          if (this.openSubmenus) this.openSubmenu(entry, 'first');
          else this.choose(entry, e);
        } else {
          if (!this.parentList) return;
          this.parentList.closeSubmenu();
        }
        break;
      }
      default: {
        if (e.key.length !== 1 || e.key === ' ') return;
        const letter = foldText(e.key);
        const keyed = this.entries.find((entry) => entry.key === letter);
        if (keyed) {
          keyed.element.focus();
          this.choose(keyed, e);
          break;
        }
        // The next item starting with the letter, after the focused one.
        for (let step = 1; step <= this.entries.length; step++) {
          const entry = this.entries[(at + step + this.entries.length) % this.entries.length];
          if (entry.text.startsWith(letter)) {
            entry.element.focus();
            break;
          }
        }
      }
    }
    e.preventDefault();
    e.stopPropagation();
  }
}
