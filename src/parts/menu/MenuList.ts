import { Component, createSignal, Emitter, read, untracked, type Bind, type ComponentBase, type Event as MotifEvent } from '@motifx/core';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { commands } from '../../core/command-registry';
import { fieldOf, namesCommands, shortcutOf } from '../../core/command-fields';
import { parseAccessKey, renderAccessKey } from '../../core/access-key';
import { glyphPart, loose, part, partBefore, removePart, textPart } from '../../core/draw-parts';
import { focusOn, isFocused } from '../../core/focus';
import { isRtl } from '../../core/measure';
import { mark, put, text } from '../../core/part-writes';
import { showIcon } from '../../core/show-icon';
import type { IconSource } from '../../core/icon-source';
import { Popup } from '../popup/Popup';
import { hasLineAfter } from './line-after';
import type { MenuItem } from './menu-item';
import type { MenuItemClickEventArgs } from './menu-item-click-event-args';
import { foldText } from '../../core/fold-text';

/** The line before an item: one per item, so the list keeps it while the item keeps its place. */
class MenuLine {
  constructor(readonly item: MenuItem) {}
}

interface Entry {
  item: MenuItem;
  button: Component<HTMLButtonElement>;
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

  private readonly given = createSignal<{ items: Bind<readonly MenuItem[]> } | null>(null);
  private listed = false;
  /** The buttons of the items, while they are shown. */
  private readonly built = new Map<MenuItem, Entry>();
  private readonly lines = new WeakMap<MenuItem, MenuLine>();
  /** The visible items in order, as the list shows them, and as it showed them before. */
  private visible: readonly MenuItem[] = [];
  private former: readonly MenuItem[] = [];
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
    this.motif.on('keydown', (_, e) => this.onKeyDown(e));
    this.motif.on('click', (_, e) => this.onClick(e));
    this.motif.on('focusin', (_, e) => this.onFocusIn(e));
    // The pointer and the keyboard share one highlight: the focused item.
    this.motif.on('pointermove', (_, e) => this.onPointerMove(e));
    const listening = commands.onChanged(() => this.namesCommands && this.refresh());
    this.motif.setDisposable(() => {
      listening.dispose();
      this.cancelHover();
      this.chosenEmitter.dispose();
      const popup = this.sub?.popup;
      if (popup && !popup.isDisposed) void popup.dispose();
    });
  }

  /**
   * Shows the visible entries of `items`. Built once: when a function in an item reads a value that changes, or on
   * `reState()`, only what shows that value changes, and the list keeps the buttons of the items it keeps. The items
   * and their fields are read as they are. After changing them in place, call `refresh`.
   */
  setItems(items: Bind<readonly MenuItem[]>): void {
    this.given.value = { items };
    // Given again: the list and the settings read now (`markColumn`, `radioMark`...), the buttons it keeps stay.
    if (this.listed) {
      if (this.isBuilt) this.reState();
      return;
    }
    this.listed = true;
    this.bindings.list(() => this.rows(), (row: MenuItem | MenuLine) => (row instanceof MenuLine ? this.makeLine() : this.makeButton(row)));
    this.bindings.watch(() => {
      let checks = false;
      let icons = false;
      for (const item of this.visibleItems()) {
        checks ||= fieldOf(item, 'checked', this) !== undefined || !!givenField(item, 'group');
        icons ||= !!fieldOf(item, 'icon', this);
      }
      const column = this.markColumn;
      const apart = this.markBesideIcon;
      untracked(() => {
        mark(this, 'data-checks', checks);
        mark(this, 'data-icons', icons || column);
        mark(this, 'data-marks-apart', apart);
      });
    });
  }

  /** Re-reads the items, and those of an open submenu, after they have been changed in place. */
  refresh(): void {
    this.reState();
    const sub = this.sub;
    if (!sub?.entry) return;
    sub.list.setItems(givenValue<Bind<readonly MenuItem[]> | undefined>(sub.entry.item, 'items') ?? []);
    sub.list.refresh();
  }

  private visibleItems(): MenuItem[] {
    const given = this.given.value;
    const list = given ? givenList(read(given.items)) : [];
    this.namesCommands = namesCommands(list);
    return list.filter((item) => fieldOf(item, 'visible', this) !== false);
  }

  /** The visible items, with a line before an item that begins a group or follows one marked `lineAfter`. */
  private rows(): (MenuItem | MenuLine)[] {
    const visible = this.visibleItems();
    const rows: (MenuItem | MenuLine)[] = [];
    visible.forEach((item, i) => {
      if (i > 0 && (givenField(item, 'beginGroup') || hasLineAfter(visible[i - 1]))) {
        let line = this.lines.get(item);
        if (!line) this.lines.set(item, (line = new MenuLine(item)));
        rows.push(line);
      }
      rows.push(item);
    });
    this.former = this.visible;
    this.visible = visible;
    return rows;
  }

  private get entries(): Entry[] {
    const entries: Entry[] = [];
    for (const item of this.visible) {
      const entry = this.built.get(item);
      if (entry) entries.push(entry);
    }
    return entries;
  }

  get itemCount(): number {
    return this.entries.length;
  }

  /** The list of the open submenu, or `null` if none is open. */
  get submenu(): MenuList | null {
    return this.sub?.entry ? this.sub.list : null;
  }

  /** The item that has focus; `null` when none has. */
  get focusedItem(): MenuItem | null {
    return this.entries[this.focusedIndex()]?.item ?? null;
  }

  /** The item an event started on; `null` when it started elsewhere. */
  itemFrom(e: Event): MenuItem | null {
    return this.entryFrom(e)?.item ?? null;
  }

  /** The button `item` is drawn as; `null` when it is not shown. */
  buttonOf(item: MenuItem): Component<HTMLButtonElement> | null {
    return this.entries.find((e) => e.item === item)?.button ?? null;
  }

  /** Sets focus on the first item that `test` accepts. Returns `false` if there is none. */
  focusWhere(test: (item: MenuItem) => boolean): boolean {
    const entry = this.entries.find((e) => test(e.item));
    if (entry) focusOn(entry.button);
    return !!entry;
  }

  /** Sets focus on the first or last item. Returns `false` if there is none. */
  focusItem(which: 'first' | 'last'): boolean {
    const entry = which === 'first' ? this.entries[0] : this.entries[this.entries.length - 1];
    if (entry) focusOn(entry.button);
    return !!entry;
  }

  /**
   * Sets focus on the menu itself with no item highlighted, as a menu opened by the pointer does.
   * Down then moves to the first item.
   */
  focusList(): void {
    put(this, 'tabindex', '-1');
    focusOn(this);
  }

  /** Closes the open submenu, and the ones it opened. */
  closeSubmenu(): void {
    this.cancelHover();
    if (this.sub?.entry) this.sub.popup.close('code');
  }

  private makeLine(): Component<HTMLDivElement> {
    const line = loose<HTMLDivElement>('div', 'mx-menu__separator');
    line.attr.add({ role: 'separator' });
    return line;
  }

  /**
   * An item's button with its parts in order: mark, icon, label, description, shortcut, arrow. Built once: each field
   * changes only what shows it; a part for a field with no value is there only while it has one.
   */
  private makeButton(item: MenuItem): Component<HTMLButtonElement> {
    const button = loose<HTMLButtonElement>('button', 'mx-menu__item');
    button.attr.add({ type: 'button' });
    put(button, 'tabindex', '-1');
    const entry: Entry = { item, button, enabled: true, submenu: false, key: null, text: '' };
    this.built.set(item, entry);
    const check = part(button, 'span', 'mx-menu__check');
    const icon = part<HTMLSpanElement>(button, 'span', 'mx-menu__icon');
    const label = part<HTMLSpanElement>(button, 'span', 'mx-menu__label');
    let glyph: Component<HTMLSpanElement> | null = null;
    let gap: ComponentBase | null = null;
    let description: Component | null = null;
    let shortcut: Component | null = null;
    let arrow: Component | null = null;
    let release: (() => void) | null = null;
    let source: IconSource | null | undefined = null;
    let caption: string | null = null;
    const bind = <T>(read: () => T, write: (value: T) => void) =>
      button.bindings.watch(() => {
        const value = read();
        untracked(() => write(value));
      });

    bind(() => fieldOf<string | undefined>(item, 'text', this) ?? '', (value) => {
      if (value === caption) return;
      caption = value;
      const parsed = parseAccessKey(value);
      renderAccessKey(label, parsed);
      entry.key = parsed.key != null ? foldText(parsed.key) : null;
      entry.text = foldText(parsed.text);
    });
    bind(() => fieldOf<string | undefined>(item, 'hint', this), (hint) => put(button, 'title', hint));
    bind(() => givenField<string | undefined>(item, 'tone') ?? 'standard', (tone) => put(button, 'data-tone', tone === 'standard' ? null : tone));
    bind(() => ({ checked: fieldOf<boolean | undefined>(item, 'checked', this), radio: !!givenField(item, 'group'), dot: this.radioMark === 'dot' }), ({ checked, radio, dot }) => {
      const role = radio ? 'menuitemradio' : checked === undefined ? 'menuitem' : 'menuitemcheckbox';
      put(button, 'role', role);
      put(button, 'aria-checked', role === 'menuitem' ? null : String(!!checked));
      const name = radio && dot ? 'radio' : 'check';
      if (checked && glyph) put(glyph, 'data-icon', name);
      else if (checked) glyph = glyphPart(check, name);
      else if (glyph) {
        removePart(glyph);
        glyph = null;
      }
    });
    bind(() => fieldOf<IconSource | null | undefined>(item, 'icon', this), (next) => {
      if (Object.is(next, source)) return;
      source = next;
      release?.();
      release = next ? showIcon(next, icon) : null;
    });
    bind(() => givenField<string | undefined>(item, 'description') ?? '', (value) => {
      if (!value) {
        removePart(gap);
        removePart(description);
        gap = description = null;
        return;
      }
      if (!description) {
        description = partBefore(button, shortcut ?? arrow, 'span', 'mx-menu__description');
        // The space keeps the two words apart in the item's name; a flex row does not draw it.
        gap = textPart(button, ' ', description);
      }
      text(description, value);
    });
    bind(() => shortcutOf(item, this), (value) => {
      if (!value) {
        removePart(shortcut);
        shortcut = null;
        return;
      }
      shortcut ??= partBefore(button, arrow, 'span', 'mx-menu__shortcut');
      text(shortcut, value);
    });
    bind(() => fieldOf(item, 'enabled', this) !== false, (enabled) => {
      entry.enabled = enabled;
      put(button, 'aria-disabled', enabled ? null : 'true');
      this.keepSubmenu(entry);
    });
    bind(() => givenList(givenField<readonly MenuItem[] | undefined>(item, 'items')).some((child) => givenField(child, 'visible') !== false), (submenu) => {
      entry.submenu = submenu;
      put(button, 'aria-haspopup', submenu ? 'menu' : null);
      if (!submenu) {
        put(button, 'aria-expanded', null);
        removePart(arrow);
        arrow = null;
      } else if (!arrow) {
        if (!button.attr.has('aria-expanded')) put(button, 'aria-expanded', 'false');
        arrow = part(button, 'span', 'mx-menu__arrow');
        glyphPart(arrow, 'chevron-end');
      }
      this.keepSubmenu(entry);
    });

    button.motif.setDisposable(() => {
      release?.();
      // The menu going takes its fields with it.
      if (this.isDisposed || !this.built) return;
      if (this.built.get(item) === entry) this.built.delete(item);
      if (this.hoverEntry === entry) this.cancelHover();
      if (this.sub?.entry === entry) this.closeSubmenu();
      // The focused item went: focus goes to the one in its place.
      if (isFocused(button)) {
        const at = Math.max(0, this.former.indexOf(item));
        queueMicrotask(() => {
          const entries = this.entries;
          if (!this.isDisposed && entries.length && this.focusedIndex() < 0) focusOn(entries[Math.min(at, entries.length - 1)].button);
        });
      }
    });
    return button;
  }

  /** The open submenu stays with its item while the item has one and is enabled. */
  private keepSubmenu(entry: Entry): void {
    if (this.sub?.entry === entry && !(entry.submenu && entry.enabled)) this.closeSubmenu();
  }

  private entryFrom(e: Event): Entry | undefined {
    return this.entries.find((entry) => entry.button.motif.isEventFrom(e));
  }

  private focusedIndex(): number {
    return this.entries.findIndex((entry) => isFocused(entry.button));
  }

  private onClick(e: MouseEvent): void {
    const entry = this.entryFrom(e);
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
    sub.popup.open(entry.button);
    put(entry.button, 'aria-expanded', 'true');
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
    popup.motif.on('pointermove', () => this.cancelHover());
    popup.onClosed(() => {
      if (sub.entry) put(sub.entry.button, 'aria-expanded', 'false');
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
    const entry = this.entryFrom(e);
    if (!entry) return;
    if (!isFocused(entry.button)) {
      this.pointerFocus = true;
      focusOn(entry.button, { preventScroll: true });
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
    const entry = this.entryFrom(e);
    const open = this.sub?.entry;
    if (!this.pointerFocus && entry && open && open !== entry) this.closeSubmenu();
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (!this.entries.length || e.ctrlKey || e.metaKey || e.altKey) return;
    const rtl = isRtl(this);
    const at = this.focusedIndex();
    const go = (index: number) => focusOn(this.entries[(index + this.entries.length) % this.entries.length].button);
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
          focusOn(keyed.button);
          this.choose(keyed, e);
          break;
        }
        // The next item starting with the letter, after the focused one.
        for (let step = 1; step <= this.entries.length; step++) {
          const entry = this.entries[(at + step + this.entries.length) % this.entries.length];
          if (entry.text.startsWith(letter)) {
            focusOn(entry.button);
            break;
          }
        }
      }
    }
    e.preventDefault();
    e.stopPropagation();
  }
}
