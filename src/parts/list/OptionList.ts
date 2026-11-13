import { onLookChanged } from '../../core/look-watch';
import { Component, createSignal, Emitter, untracked, type ComponentBase, type Event as MotifEvent, type Signal } from '@motifx/core';
import { clearParts, glyphPart, loose, part, partBefore, removePart } from '../../core/draw-parts';
import { boxOf, measure, onLayout, reveal } from '../../core/measure';
import { css, flag, mark, put, text as writeText } from '../../core/part-writes';
import { showIcon } from '../../core/show-icon';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { givenList } from '../../core/given-field';
import { uiLocale } from '../../core/ui-locale';
import type { ItemSource } from './item-source';
import type { ListMove } from './list-move';
import type { OptionChosenEventArgs } from './option-chosen-event-args';
import type { OptionParts } from './option-parts';
import { readItemField } from './read-item-field';
import { onLanguage } from '../../core/on-language';
import { foldText } from '../../core/fold-text';

type Row = { header: string } | { index: number };

/** An option, kept while its item is listed (an item not loaded yet: while its index is in view). */
type OptionEntry<T> = { kind: 'option'; item: T | undefined; index: number; at: Signal<number> };
type HeaderEntry = { kind: 'header'; text: string; id: string };
type GroupEntry<T> = { kind: 'group'; text: string; id: string; options: Signal<OptionEntry<T>[]> };
/** What the list shows, a part each: an option, a header (long lists), a group of options (short lists), a block that stands for the rows out of view, or the text of an empty list. */
type SpaceEntry = { kind: 'space'; size: Signal<number> };
type Entry<T> = OptionEntry<T> | HeaderEntry | GroupEntry<T> | SpaceEntry | { kind: 'empty' };
/** The entries on show by what they stand for, so the next rows keep the parts of the same ones. */
type Keys<T> = {
  options: Map<unknown, OptionEntry<T>[]>;
  loading: Map<number, OptionEntry<T>[]>;
  headers: Map<string, HeaderEntry[]>;
  groups: Map<string, GroupEntry<T>[]>;
};

const noKeys = <T>(): Keys<T> => ({ options: new Map(), loading: new Map(), headers: new Map(), groups: new Map() });

/**
 * The options of a drop-down, a combo box or a list box (`role="listbox"`). The owner provides the
 * items and how to read them, sets which are selected, and moves the highlight from its own keys
 * (`handleKey`). The owner's element points to the highlighted option with `aria-activedescendant`.
 * Long lists draw only the rows in view, and with an `ItemSource` rows can load as they come into view.
 * Each option is drawn once for its item: items given again keep the options of the items they keep, and what an
 * option shows (text, selected, active, disabled) changes in place.
 */
export class OptionList<T = unknown> extends Component<HTMLDivElement> {
  static override elementTag = 'div';

  textOf: (item: T) => string = (item) => String(readItemField(item, undefined, 'text') ?? '');
  enabledOf: (item: T) => boolean = (item) => readItemField(item, undefined, 'enabled') !== false;
  iconOf: ((item: T) => IconSource | undefined) | null = null;
  groupOf: ((item: T) => string | undefined) | null = null;
  /**
   * Draws an option's content instead of its text, into `host`. `option` holds the option's parts, for an owner that
   * marks the option itself. It can return a cleanup function.
   */
  draw: ((item: T, host: ComponentBase<HTMLElement>, option: OptionParts) => (() => void) | void) | null = null;
  isSelected: (item: T) => boolean = () => false;
  /** Shows check marks before the options and sets `aria-multiselectable`. */
  multiple = false;
  /** Lists with more rows than this draw only the rows in view. */
  windowFrom = 100;
  /** Rows drawn above and below the visible ones in a long list. */
  extraRows = 6;
  /** The milliseconds within which typed letters join one search. */
  typingDelay = 600;
  /** The text of an empty list. The default is the `uiLocale` string "No items". */
  emptyText: (() => string) | null = null;

  private size = 0;
  private itemAt: (index: number) => T | undefined = () => undefined;
  private ensure: ((first: number, end: number) => void) | null = null;
  /** Whether a row (or, with no index, the whole list) failed to load; a press on it loads it again. */
  private failedAt: (index?: number) => boolean = () => false;
  private retryFailed: () => void = () => {};
  /** With groups: the headers between the items. Without: one row per item. */
  private rows: Row[] | null = null;
  /** The highlighted option's index; each option reads it to mark itself. */
  private readonly activeAt = createSignal(-1);
  /** Changed when the items or their fields may have changed: the options read them again. */
  private readonly state = createSignal(0);
  private stateCount = 0;
  /** What the list shows now, in order. */
  private readonly entries = createSignal<Entry<T>[]>([]);
  private keys: Keys<T> = noKeys();
  private readonly before: SpaceEntry = { kind: 'space', size: createSignal(0) };
  private readonly after: SpaceEntry = { kind: 'space', size: createSignal(0) };
  private readonly emptyEntry: Entry<T> = { kind: 'empty' };
  /** The options on show, in order. */
  private shown: OptionEntry<T>[] = [];
  /** The parts of each option drawn. */
  private readonly partsOf = new Map<OptionEntry<T>, OptionParts>();
  private rowHeight = 0;
  /** How far the list is scrolled and the room in its view, as last read. */
  private viewTop = 0;
  private viewHeight = 0;
  /** The option a long list brings into view with its next reads; -1 for none. */
  private revealing = -1;
  private drawn = { first: 0, end: 0 };
  private typed = '';
  private typedAt = 0;
  private readonly baseId = nextId('list');
  /** The text of an empty list, a part while the list is empty. */
  private empty: Component<HTMLDivElement> | null = null;
  private readonly chosenEmitter = new Emitter<OptionChosenEventArgs<T>>();

  readonly onChosen: MotifEvent<OptionChosenEventArgs<T>> = this.chosenEmitter.event;

  override onConfigured(): void {
    this.class.add('mx-list');
    this.attr.add({ id: this.baseId, role: 'listbox' });
    // Pressing an option keeps focus where it is (the field that owns the list).
    this.motif.on('mousedown', (_, e) => e.preventDefault());
    this.motif.on('click', (_, e) => this.clicked(e));
    this.motif.on('pointermove', (_, e) => {
      const index = this.indexOf(e);
      if (index >= 0 && index !== this.active) this.setActive(index, false);
    });
    this.motif.on('scroll', () => {
      if (this.windowed) this.readLayout();
    });
    // Shown, or another size: the page keys move by what is in view now.
    onLayout(this, 'size', () => this.readLayout());
    // Drawn again with the list; in the kit's language again when it changes.
    const stopEmpty = onLanguage(this, () => this.writeEmpty());
    // Another design language, theme or density: the rows have another height.
    const stopLook = onLookChanged(() => {
      this.rowHeight = 0;
      this.readLayout();
    });
    // Built once: the entries it keeps keep their parts.
    this.bindings.list(() => this.entries.value, (entry: Entry<T>) => this.make(entry));
    this.motif.setDisposable(() => {
      stopLook();
      stopEmpty();
      this.chosenEmitter.dispose();
    });
  }

  private get active(): number {
    return untracked(() => this.activeAt.value);
  }

  private set active(index: number) {
    this.activeAt.value = index;
  }

  /** The options read the items and their fields again. */
  private restate(): void {
    this.state.value = ++this.stateCount;
  }

  /** Sets the items as they are now. Set them again after they change. */
  setItems(given: readonly T[]): void {
    const items = givenList(given);
    this.size = items.length;
    this.itemAt = (index) => items[index];
    this.ensure = null;
    this.failedAt = () => false;
    this.retryFailed = () => {};
    this.rows = null;
    if (this.groupOf) {
      const rows: Row[] = [];
      let group: string | undefined;
      items.forEach((item, index) => {
        const next = this.groupOf!(item);
        if (next !== group && next !== undefined) rows.push({ header: next });
        group = next;
        rows.push({ index });
      });
      if (rows.length > items.length) this.rows = rows;
    }
    if (this.active >= items.length) this.active = -1;
    this.restate();
    this.show();
  }

  /** Sets items that load as they come into view (no groups). */
  setSource(source: ItemSource<T>): void {
    this.size = source.count;
    this.itemAt = (index) => source.at(index);
    this.ensure = source.ensure ? (first, end) => source.ensure!(first, end) : null;
    this.failedAt = (index) => source.failedAt?.(index) ?? false;
    this.retryFailed = () => source.retryFailed?.();
    this.rows = null;
    if (this.active >= this.size) this.active = -1;
    this.restate();
    this.show();
  }

  /** Reads the rows in view again, such as after some have loaded; the options of the same items stay. */
  redraw(): void {
    this.restate();
    if (this.windowed && this.size) {
      this.drawn = { first: 0, end: 0 };
      this.drawLong();
    } else {
      this.show();
    }
  }

  get count(): number {
    return this.size;
  }

  get activeIndex(): number {
    return this.active;
  }

  get activeItem(): T | undefined {
    return this.active < 0 ? undefined : this.itemAt(this.active);
  }

  itemOf(index: number): T | undefined {
    return this.itemAt(index);
  }

  /** The id of the list's element, for the owner's `aria-controls`. */
  get id(): string {
    return this.baseId;
  }

  /** The id of an option's element, for `aria-activedescendant`. */
  idOf(index: number): string {
    return `${this.baseId}-${index}`;
  }

  /** Shows the selection after it changes (and the items' fields after they change in place). */
  refresh(): void {
    this.restate();
  }

  setActive(index: number, scroll = true): void {
    const last = this.active;
    this.active = index >= 0 && index < this.size ? index : -1;
    // The options drawn mark themselves now, as the keys move; one drawn later reads the highlight itself.
    const before = this.partsAt(last);
    if (before) mark(before.row, 'data-active', false);
    const now = this.partsAt(this.active);
    if (now) mark(now.row, 'data-active', true);
    if (this.active >= 0 && scroll) this.scrollTo(this.active);
  }

  /** Moves the highlight over enabled options and returns the new index. */
  move(how: ListMove): number {
    const n = this.size;
    if (!n) return -1;
    const page = Math.max(1, Math.floor(this.viewHeight / (this.rowHeight || 32)) - 1);
    let target: number;
    let step: number;
    if (how === 'first') [target, step] = [0, 1];
    else if (how === 'last') [target, step] = [n - 1, -1];
    else if (how === 'page-down') [target, step] = [Math.min(n - 1, Math.max(this.active, 0) + page), 1];
    else if (how === 'page-up') [target, step] = [Math.max(0, this.active - page), -1];
    else [target, step] = [this.active < 0 ? (how > 0 ? 0 : n - 1) : this.active + how, how > 0 ? 1 : -1];
    target = Math.max(0, Math.min(n - 1, target));
    let found = this.nextEnabled(target, step);
    if (found < 0) found = this.nextEnabled(target, -step);
    if (found >= 0) this.setActive(found);
    return this.active;
  }

  /** The next enabled option whose text starts with what was typed recently, or -1 if there is none. */
  typeAhead(key: string): number {
    const now = Date.now();
    this.typed = now - this.typedAt < this.typingDelay ? this.typed + key : key;
    this.typedAt = now;
    const text = foldText(this.typed);
    const n = this.size;
    // A repeated letter goes on to the next option with it.
    const start = this.typed.length > 1 ? Math.max(this.active, 0) : this.active + 1;
    for (let step = 0; step < n; step++) {
      const index = (start + step + n) % n;
      const item = this.itemAt(index);
      if (item !== undefined && this.enabledOf(item) && foldText(this.textOf(item)).startsWith(text)) return index;
    }
    return -1;
  }

  /** Handles the list keys: arrows, Home, End, Page Up, Page Down and Enter. Returns whether it used the key. */
  handleKey(e: KeyboardEvent): boolean {
    switch (e.key) {
      case 'ArrowDown':
        this.move(1);
        break;
      case 'ArrowUp':
        this.move(-1);
        break;
      case 'Home':
        this.move('first');
        break;
      case 'End':
        this.move('last');
        break;
      case 'PageDown':
        this.move('page-down');
        break;
      case 'PageUp':
        this.move('page-up');
        break;
      case 'Enter': {
        const item = this.activeItem;
        if (item === undefined && this.failedAt(this.size ? this.active : undefined)) {
          this.retryFailed();
          break;
        }
        if (item === undefined || !this.enabledOf(item)) return false;
        this.chosenEmitter.fire({ item, index: this.active, event: e });
        break;
      }
      default:
        return false;
    }
    e.preventDefault();
    return true;
  }

  private get rowCount(): number {
    return this.rows ? this.rows.length : this.size;
  }

  private rowAt(at: number): Row {
    return this.rows ? this.rows[at] : { index: at };
  }

  private get windowed(): boolean {
    return this.rowCount > this.windowFrom || !!this.ensure;
  }

  /** An item not loaded yet can be highlighted; it loads when it comes into view. */
  private nextEnabled(from: number, step: number): number {
    for (let i = from; i >= 0 && i < this.size; i += step) {
      const item = this.itemAt(i);
      if (item === undefined || this.enabledOf(item)) return i;
    }
    return -1;
  }

  /** Lays out what the list shows now; the entries it keeps keep their parts. */
  private show(): void {
    flag(this, 'aria-multiselectable', this.multiple);
    mark(this, 'data-empty', !this.size);
    if (!this.size) {
      this.commit(noKeys(), [this.emptyEntry], []);
      return;
    }
    // A long list keeps its scroll position.
    if (this.windowed) {
      this.drawn = { first: 0, end: 0 };
      this.drawLong();
      return;
    }
    const keys = noKeys<T>();
    const entries: Entry<T>[] = [];
    const shown: OptionEntry<T>[] = [];
    let group: GroupEntry<T> | null = null;
    let options: OptionEntry<T>[] = [];
    for (let at = 0; at < this.rowCount; at++) {
      const row = this.rowAt(at);
      if ('header' in row) {
        if (group) group.options.value = options;
        options = [];
        group = this.keyOf(keys.groups, this.keys.groups, row.header, () => ({
          kind: 'group',
          text: row.header,
          id: nextId('list-group'),
          options: createSignal<OptionEntry<T>[]>([]),
        }));
        entries.push(group);
      } else {
        const option = this.optionAt(keys, row.index);
        shown.push(option);
        (group ? options : entries).push(option);
      }
    }
    if (group) group.options.value = options;
    this.commit(keys, entries, shown);
    if (this.active >= 0) this.setActive(this.active);
    if (!this.rowHeight) this.readLayout();
  }

  private commit(keys: Keys<T>, entries: Entry<T>[], shown: OptionEntry<T>[]): void {
    this.keys = keys;
    this.shown = shown;
    this.entries.value = entries;
  }

  /** The entry for `key` (its next one, for a key listed more than once): the one shown last if there was one. */
  private keyOf<K, E>(next: Map<K, E[]>, last: Map<K, E[]>, key: K, make: () => E): E {
    let list = next.get(key);
    if (!list) next.set(key, (list = []));
    const entry = last.get(key)?.[list.length] ?? make();
    list.push(entry);
    return entry;
  }

  /** The entry of the option at `index`: of its item, or of the index for an item not loaded yet. */
  private optionAt(keys: Keys<T>, index: number): OptionEntry<T> {
    const item = this.itemAt(index);
    const make = (): OptionEntry<T> => ({ kind: 'option', item, index, at: createSignal(index) });
    const entry = item === undefined ? this.keyOf(keys.loading, this.keys.loading, index, make) : this.keyOf(keys.options, this.keys.options, item, make);
    entry.index = index;
    entry.at.value = index;
    return entry;
  }

  /** The parts of the option at `index`, if it is drawn. */
  private partsAt(index: number): OptionParts | undefined {
    const entry = this.shown.find((e) => e.index === index);
    return entry && this.partsOf.get(entry);
  }

  /** Reads the list's view and a row's height with the window's next reads; a long list then draws the rows in view. */
  private readLayout(): void {
    measure(this, this.readView, this.layOut);
  }

  private readonly readView = () => {
    const box = boxOf(this);
    const first = this.shown[0];
    const option = first && this.partsOf.get(first);
    return { top: box.scrollTop, view: box.clientHeight, row: option ? boxOf(option.row).height : 0 };
  };

  private readonly layOut = (read: { top: number; view: number; row: number }) => {
    this.viewTop = read.top;
    this.viewHeight = read.view;
    if (read.row && read.row !== this.rowHeight) {
      this.rowHeight = read.row;
      this.drawn = { first: 0, end: 0 };
    }
    // A short list brings its option into view itself.
    if (!this.windowed || !this.size) return;
    const index = this.revealing;
    this.revealing = -1;
    const height = this.rowHeight || 32;
    // Scrolled first: the rows are drawn where the scroll ends.
    if (index >= 0) reveal(this, { top: this.rowOf(index) * height, height }, { axis: 'y', then: () => this.readLayout() });
    else this.drawWindow(height, read.top, read.view || height * 10);
  };

  /** Draws the rows in view of a long list as last read, then reads again: what changed is drawn in the next round. */
  private drawLong(top = this.viewTop): void {
    const height = this.rowHeight || 32;
    this.drawWindow(height, top, this.viewHeight || height * 10);
    this.readLayout();
  }

  /** In a long list: two empty blocks stand for the rows out of view. */
  private drawWindow(height: number, scrolled: number, view: number): void {
    const count = this.rowCount;
    // Fewer rows than before (a search) cannot stay scrolled past their end: drawn where the view will be, the rows
    // of the items that stay are kept instead of dropped for a moment and made again.
    const top = Math.min(scrolled, Math.max(0, count * height - view));
    const first = Math.max(0, Math.floor(top / height) - this.extraRows);
    const end = Math.min(count, Math.ceil((top + view) / height) + this.extraRows);
    if (first === this.drawn.first && end === this.drawn.end) return;
    this.drawn = { first, end };
    this.ensure?.(first, end);
    const keys = noKeys<T>();
    // Two empty blocks stand for the rows out of view, before and after those drawn.
    const entries: Entry<T>[] = [this.before];
    const shown: OptionEntry<T>[] = [];
    for (let i = first; i < end; i++) {
      const row = this.rowAt(i);
      if ('header' in row) {
        entries.push(this.keyOf(keys.headers, this.keys.headers, row.header, () => ({ kind: 'header', text: row.header, id: nextId('list-group') })));
        continue;
      }
      const option = this.optionAt(keys, row.index);
      entries.push(option);
      shown.push(option);
    }
    entries.push(this.after);
    this.before.size.value = first * height;
    this.after.size.value = (count - end) * height;
    this.commit(keys, entries, shown);
  }

  private rowOf(index: number): number {
    return this.rows ? this.rows.findIndex((row) => !('header' in row) && row.index === index) : index;
  }

  private scrollTo(index: number): void {
    if (this.windowed) {
      // Drawn now where the scroll is expected to end; scrolled with the next reads, then drawn as read.
      const height = this.rowHeight || 32;
      const at = this.rowOf(index) * height;
      if (at < this.viewTop) this.viewTop = at;
      else if (at + height > this.viewTop + this.viewHeight) this.viewTop = at + height - this.viewHeight;
      this.revealing = index;
      this.drawLong();
      return;
    }
    const option = this.partsAt(index);
    // An option not drawn yet is brought into view when it marks itself active.
    if (option) reveal(this, option.row, { axis: 'y' });
    else this.revealing = index;
  }

  /** Writes what `read` gives into the part each time it changes, and only then. */
  private bind<V>(owner: ComponentBase, read: () => V, write: (value: V) => void): void {
    owner.bindings.watch(() => {
      // A part outliving the list (its fields let go) draws nothing more.
      if (this.isDisposed) return;
      const value = read();
      untracked(() => write(value));
    });
  }

  /** The part of an entry, made once: what it shows changes in place. */
  private make(entry: Entry<T>): ComponentBase {
    switch (entry.kind) {
      case 'option':
        return this.makeOption(entry);
      case 'header':
        return this.makeHeader(entry);
      case 'group': {
        const group = loose<HTMLDivElement>('div');
        group.attr.add({ role: 'group', 'aria-labelledby': entry.id });
        group.controls.add(this.makeHeader(entry));
        group.bindings.list(() => entry.options.value, (option: OptionEntry<T>) => this.makeOption(option));
        return group;
      }
      case 'space': {
        const space = loose<HTMLDivElement>('div', 'mx-list__space');
        space.attr.add({ 'aria-hidden': 'true' });
        this.bind(space, () => entry.size.value, (size) => css(space, 'block-size', `${size}px`));
        return space;
      }
      default: {
        const empty = loose<HTMLDivElement>('div', 'mx-list__empty');
        // Seen, not an option: the empty list is named by its owner.
        empty.attr.add({ 'aria-hidden': 'true' });
        this.empty = empty;
        empty.motif.setDisposable(() => {
          if (this.empty === empty) this.empty = null;
        });
        this.bind(empty, () => this.state.value, () => this.writeEmpty());
        return empty;
      }
    }
  }

  private makeHeader(entry: HeaderEntry | GroupEntry<T>): Component<HTMLDivElement> {
    const header = loose<HTMLDivElement>('div', 'mx-list__header');
    header.attr.add({ id: entry.id });
    header.setText(entry.text);
    return header;
  }

  /** An option's row with its parts in order: check, icon, text. Each changes only with what it shows. */
  private makeOption(entry: OptionEntry<T>): Component<HTMLDivElement> {
    const row = loose<HTMLDivElement>('div', 'mx-list__item');
    row.attr.add({ role: 'option' });
    const text = part<HTMLSpanElement>(row, 'span', 'mx-list__text');
    // Given to the owner as `OptionParts`; the check comes and goes with `multiple`.
    const option: { -readonly [K in keyof OptionParts]: OptionParts[K] } = { row, text, check: null };
    this.partsOf.set(entry, option);
    let checkHost: ComponentBase | null = null;
    let iconHost: ComponentBase | null = null;
    let iconShown: IconSource | null = null;
    let releaseIcon: (() => void) | null = null;
    let drawnWith: OptionList<T>['draw'] | undefined;
    let releaseDrawn: (() => void) | null = null;
    let shownText: string | null = null;
    row.motif.setDisposable(() => {
      releaseIcon?.();
      releaseDrawn?.();
      // The list disposed first has let its fields go.
      if (this.partsOf?.get(entry) === option) this.partsOf.delete(entry);
    });
    this.bind(row, () => entry.at.value, (index) => {
      put(row, 'id', this.idOf(index));
      put(row, 'data-index', String(index));
    });
    this.bind(row, () => this.activeAt.value === entry.at.value, (on) => {
      mark(row, 'data-active', on);
      if (on && !this.windowed && this.revealing === entry.index) {
        this.revealing = -1;
        reveal(this, row, { axis: 'y' });
      }
    });
    // A long list says where in the whole list an option is.
    this.bind(row, () => (this.state.value, this.windowed ? [this.size, entry.at.value + 1] : null), (at) => {
      put(row, 'aria-setsize', at && String(at[0]));
      put(row, 'aria-posinset', at && String(at[1]));
    });
    const item = entry.item;
    if (item === undefined) {
      this.bind(row, () => (this.state.value, this.failedAt(entry.at.value)), (failed) => {
        put(row, 'aria-selected', 'false');
        mark(row, 'data-failed', failed);
        put(row, 'aria-busy', failed ? null : 'true');
        mark(row, 'data-loading', !failed);
        writeText(text, failed ? this.failedText() : uiLocale.strings.loading);
      });
      return row;
    }
    this.bind(row, () => (this.state.value, this.enabledOf(item)), (enabled) => put(row, 'aria-disabled', enabled ? null : 'true'));
    this.bind(row, () => (this.state.value, this.isSelected(item)), (selected) => {
      put(row, 'aria-selected', String(selected));
      mark(row, 'data-selected', selected);
    });
    this.bind(row, () => (this.state.value, this.multiple), (multiple) => {
      if (multiple === !!checkHost) return;
      if (multiple) {
        checkHost = partBefore(row, row.controls.items[0] ?? null, 'span', 'mx-list__check');
        option.check = glyphPart(checkHost, 'check');
      } else {
        removePart(checkHost);
        checkHost = null;
        option.check = null;
      }
    });
    this.bind(row, () => (this.state.value, this.iconOf?.(item) ?? null), (source) => {
      if (source === iconShown) return;
      iconShown = source;
      releaseIcon?.();
      releaseIcon = null;
      removePart(iconHost);
      iconHost = null;
      if (source === null) return;
      iconHost = partBefore<HTMLSpanElement>(row, text, 'span', 'mx-list__icon');
      iconHost.attr.add({ 'aria-hidden': 'true' });
      releaseIcon = showIcon(source, iconHost);
    });
    // The owner's drawing goes into the text's part once, and again only when the drawing itself changes; what it
    // shows updates through its own bindings. The row and its other parts stay.
    this.bind(row, () => (this.state.value, { draw: this.draw, value: this.draw ? null : this.textOf(item) }), ({ draw, value }) => {
      if (draw !== drawnWith && (draw || drawnWith)) {
        releaseDrawn?.();
        releaseDrawn = null;
        if (drawnWith) clearParts(text);
        drawnWith = draw;
        shownText = null;
        if (draw) {
          const release = draw(item, text, option);
          releaseDrawn = typeof release === 'function' ? release : null;
        }
      }
      if (value !== null && value !== shownText) {
        shownText = value;
        text.setText(value);
      }
    });
    return row;
  }

  /**
   * Binds an option's text to `read`, read again when the items are given again or refreshed, and written in place.
   * For a `draw` that writes the text itself; the release it gives back stops the binding.
   */
  bindText(option: OptionParts, read: () => string): () => void {
    let live = true;
    this.bind(option.text, () => (live ? (this.state.value, read()) : null), (value) => {
      if (value !== null) writeText(option.text, value);
    });
    return () => {
      live = false;
    };
  }

  /** The index of the option an event started in, asked of the options drawn; -1 for none. */
  private indexOf(e: Event): number {
    for (const entry of this.shown) if (this.partsOf.get(entry)?.row.motif.isEventFrom(e)) return entry.index;
    return -1;
  }

  /** "Could not load. Retry": a row or a list that failed, which a press loads again. */
  private failedText(): string {
    return `${uiLocale.strings.loadFailed} ${uiLocale.strings.retry}`;
  }

  private writeEmpty(): void {
    const empty = this.empty;
    if (!empty) return;
    const failed = this.failedAt();
    mark(empty, 'data-failed', failed);
    writeText(empty, failed ? this.failedText() : (this.emptyText?.() ?? uiLocale.strings.noItems));
  }

  private clicked(e: MouseEvent): void {
    const index = this.indexOf(e);
    const item = index < 0 ? undefined : this.itemAt(index);
    const onEmpty = !this.size && !!this.empty?.motif.isEventFrom(e);
    if ((onEmpty && this.failedAt()) || (index >= 0 && item === undefined && this.failedAt(index))) {
      this.retryFailed();
      return;
    }
    if (index < 0 || item === undefined || !this.enabledOf(item)) return;
    this.setActive(index, false);
    this.chosenEmitter.fire({ item, index, event: e });
  }
}
