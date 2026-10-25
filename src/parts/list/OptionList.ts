import { Component, effect, Emitter, type Event as MotifEvent } from '@motifx/core';
import { checkMark } from '../../core/glyphs';
import { iconNode } from '../../core/icon-node';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import type { ItemSource } from './item-source';
import type { ListMove } from './list-move';
import type { OptionChosenEventArgs } from './option-chosen-event-args';
import { readItemField } from './read-item-field';

type Row = { header: string } | { index: number };

/**
 * The options of a drop-down, a combo box or a list box (`role="listbox"`). The owner gives the
 * items and how to read them, says which are selected, and moves the highlight from its own keys
 * (`handleKey`); the owner's element points to the highlighted option with `aria-activedescendant`.
 * Long lists draw only the rows in view; with an `ItemSource` rows may load while they come into view.
 */
export class OptionList<T = unknown> extends Component<HTMLDivElement> {
  static override elementTag = 'div';

  textOf: (item: T) => string = (item) => String(readItemField(item, undefined, 'text') ?? '');
  enabledOf: (item: T) => boolean = (item) => readItemField(item, undefined, 'enabled') !== false;
  iconOf: ((item: T) => IconSource | undefined) | null = null;
  groupOf: ((item: T) => string | undefined) | null = null;
  /** Draws an option's content instead of its text; may return a cleanup. */
  draw: ((item: T, host: HTMLElement) => (() => void) | void) | null = null;
  isSelected: (item: T) => boolean = () => false;
  /** Check marks in front of the options and `aria-multiselectable`. */
  multiple = false;
  /** Lists with more rows than this draw only the ones in view. */
  windowFrom = 100;
  /** Rows drawn above and below the visible ones in a long list. */
  extraRows = 6;
  /** Milliseconds within which typed letters join one search. */
  typingDelay = 600;
  /** What an empty list says; `uiLocale`'s "No items" by default. */
  emptyText: (() => string) | null = null;

  private size = 0;
  private itemAt: (index: number) => T | undefined = () => undefined;
  private ensure: ((first: number, end: number) => void) | null = null;
  /** With groups: the headers between the items. Without: one row per item. */
  private rows: Row[] | null = null;
  private active = -1;
  private rowHeight = 0;
  private drawn = { first: 0, end: 0 };
  private releases: (() => void)[] = [];
  private typed = '';
  private typedAt = 0;
  private frame = 0;
  private readonly baseId = nextId('list');
  private readonly empty = document.createElement('div');
  private readonly chosenEmitter = new Emitter<OptionChosenEventArgs<T>>();

  readonly onChosen: MotifEvent<OptionChosenEventArgs<T>> = this.chosenEmitter.event;

  override onConfigured(): void {
    this.class.add('mx-list');
    this.element.id = this.baseId;
    this.element.setAttribute('role', 'listbox');
    this.empty.className = 'mx-list__empty';
    // Seen, not an option: the empty list is named by its owner.
    this.empty.setAttribute('aria-hidden', 'true');
    // Pressing an option keeps focus where it is (the field that owns the list).
    this.element.addEventListener('mousedown', (e) => e.preventDefault());
    this.element.addEventListener('click', (e) => this.clicked(e));
    this.element.addEventListener('pointermove', (e) => {
      const index = this.indexOf(e.target);
      if (index >= 0 && index !== this.active) this.setActive(index, false);
    });
    this.element.addEventListener('scroll', () => {
      if (!this.windowed) return;
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => this.drawWindow());
    });
    const stopEmpty = effect(() => (this.empty.textContent = this.emptyText?.() ?? uiLocale.strings.noItems));
    this.motif.setDisposable(() => {
      stopEmpty();
      cancelAnimationFrame(this.frame);
      this.release();
      this.chosenEmitter.dispose();
    });
  }

  setItems(items: readonly T[]): void {
    this.size = items.length;
    this.itemAt = (index) => items[index];
    this.ensure = null;
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
    this.drawAll();
  }

  /** Items that load while they come into view (no groups). */
  setSource(source: ItemSource<T>): void {
    this.size = source.count;
    this.itemAt = (index) => source.at(index);
    this.ensure = source.ensure ? (first, end) => source.ensure!(first, end) : null;
    this.rows = null;
    if (this.active >= this.size) this.active = -1;
    this.drawAll();
  }

  /** Draws the rows in view again, e.g. after some loaded. */
  redraw(): void {
    if (this.windowed) {
      this.drawn = { first: 0, end: 0 };
      this.drawWindow();
    } else {
      this.drawAll();
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

  /** The id of an option's element, for `aria-activedescendant`. */
  idOf(index: number): string {
    return `${this.baseId}-${index}`;
  }

  /** Draws the selection again, after it changed. */
  refresh(): void {
    for (const el of this.element.querySelectorAll<HTMLElement>('[role="option"]')) {
      const item = this.itemAt(Number(el.dataset.index));
      if (item !== undefined) this.markSelected(el, item);
    }
  }

  setActive(index: number, scroll = true): void {
    this.active = index >= 0 && index < this.size ? index : -1;
    for (const el of this.element.querySelectorAll('[data-active]')) el.removeAttribute('data-active');
    if (this.active < 0) return;
    if (scroll) this.scrollTo(this.active);
    const el = this.optionElement(this.active);
    el?.setAttribute('data-active', '');
  }

  /** Moves the highlight over enabled options; returns the new index. */
  move(how: ListMove): number {
    const n = this.size;
    if (!n) return -1;
    if (!this.rowHeight) this.rowHeight = this.measure();
    const page = Math.max(1, Math.floor(this.element.clientHeight / this.rowHeight) - 1);
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

  /** The next enabled option whose text starts with what was typed lately; -1 when none. */
  typeAhead(key: string): number {
    const now = Date.now();
    this.typed = now - this.typedAt < this.typingDelay ? this.typed + key : key;
    this.typedAt = now;
    const text = this.typed.toLocaleLowerCase();
    const n = this.size;
    // A repeated letter goes on to the next option with it.
    const start = this.typed.length > 1 ? Math.max(this.active, 0) : this.active + 1;
    for (let step = 0; step < n; step++) {
      const index = (start + step + n) % n;
      const item = this.itemAt(index);
      if (item !== undefined && this.enabledOf(item) && this.textOf(item).toLocaleLowerCase().startsWith(text)) return index;
    }
    return -1;
  }

  /** The list keys: arrows, Home, End, Page Up, Page Down, Enter. Returns whether it used the key. */
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

  private drawAll(): void {
    this.release();
    // A long list draws over what is there, so its scroll position stays.
    if (this.size && this.windowed) {
      if (this.multiple) this.element.setAttribute('aria-multiselectable', 'true');
      else this.element.removeAttribute('aria-multiselectable');
      this.element.removeAttribute('data-empty');
      this.drawn = { first: 0, end: 0 };
      this.drawWindow();
      return;
    }
    this.element.replaceChildren();
    if (this.multiple) this.element.setAttribute('aria-multiselectable', 'true');
    else this.element.removeAttribute('aria-multiselectable');
    this.element.toggleAttribute('data-empty', !this.size);
    if (!this.size) {
      this.empty.textContent = this.emptyText?.() ?? uiLocale.strings.noItems;
      this.element.append(this.empty);
      return;
    }
    if (this.windowed) {
      this.drawn = { first: 0, end: 0 };
      this.drawWindow();
      return;
    }
    let group: HTMLElement | null = null;
    for (let at = 0; at < this.rowCount; at++) {
      const row = this.rowAt(at);
      if ('header' in row) {
        group = document.createElement('div');
        group.setAttribute('role', 'group');
        const header = group.appendChild(this.headerElement(row.header));
        header.id = nextId('list-group');
        group.setAttribute('aria-labelledby', header.id);
        this.element.append(group);
      } else {
        (group ?? this.element).append(this.itemElement(row.index));
      }
    }
    if (this.active >= 0) this.setActive(this.active);
  }

  /** In a long list: two empty blocks stand for the rows out of view. */
  private drawWindow(): void {
    if (!this.rowHeight) this.rowHeight = this.measure();
    const height = this.rowHeight;
    const top = this.element.scrollTop;
    const view = this.element.clientHeight || height * 10;
    const first = Math.max(0, Math.floor(top / height) - this.extraRows);
    const count = this.rowCount;
    const end = Math.min(count, Math.ceil((top + view) / height) + this.extraRows);
    if (first === this.drawn.first && end === this.drawn.end) return;
    this.drawn = { first, end };
    this.ensure?.(first, end);
    this.release();
    const nodes: Node[] = [];
    for (let i = first; i < end; i++) {
      const row = this.rowAt(i);
      const el = 'header' in row ? this.headerElement(row.header) : this.itemElement(row.index);
      if (!('header' in row)) {
        el.setAttribute('aria-setsize', String(this.size));
        el.setAttribute('aria-posinset', String(row.index + 1));
      }
      nodes.push(el);
    }
    this.element.replaceChildren(this.space(first * height), ...nodes, this.space((count - end) * height));
    if (this.active >= 0) this.optionElement(this.active)?.setAttribute('data-active', '');
  }

  private space(size: number): HTMLElement {
    const space = document.createElement('div');
    space.className = 'mx-list__space';
    space.setAttribute('aria-hidden', 'true');
    space.style.blockSize = `${size}px`;
    return space;
  }

  private measure(): number {
    const probe = this.itemElement(0);
    this.element.append(probe);
    const height = probe.getBoundingClientRect().height;
    probe.remove();
    return height || 32;
  }

  private rowOf(index: number): number {
    return this.rows ? this.rows.findIndex((row) => !('header' in row) && row.index === index) : index;
  }

  private scrollTo(index: number): void {
    if (this.windowed) {
      const height = this.rowHeight || this.measure();
      const at = this.rowOf(index) * height;
      const view = this.element.clientHeight;
      if (at < this.element.scrollTop) this.element.scrollTop = at;
      else if (at + height > this.element.scrollTop + view) this.element.scrollTop = at + height - view;
      this.drawWindow();
      return;
    }
    const el = this.optionElement(index);
    if (!el) return;
    const row = el.getBoundingClientRect();
    const view = this.element.getBoundingClientRect();
    if (row.top < view.top) this.element.scrollTop -= view.top - row.top;
    else if (row.bottom > view.bottom) this.element.scrollTop += row.bottom - view.bottom;
  }

  private optionElement(index: number): HTMLElement | null {
    return this.element.querySelector<HTMLElement>(`[data-index="${index}"]`);
  }

  private headerElement(text: string): HTMLElement {
    const header = document.createElement('div');
    header.className = 'mx-list__header';
    header.textContent = text;
    return header;
  }

  private itemElement(index: number): HTMLElement {
    const el = document.createElement('div');
    el.className = 'mx-list__item';
    el.id = this.idOf(index);
    el.dataset.index = String(index);
    el.setAttribute('role', 'option');
    const item = this.itemAt(index);
    if (item === undefined) {
      el.setAttribute('aria-busy', 'true');
      el.setAttribute('aria-selected', 'false');
      el.setAttribute('data-loading', '');
      const text = el.appendChild(document.createElement('span'));
      text.className = 'mx-list__text';
      text.textContent = uiLocale.strings.loading;
      return el;
    }
    if (!this.enabledOf(item)) el.setAttribute('aria-disabled', 'true');
    this.markSelected(el, item);
    if (this.multiple) {
      const check = el.appendChild(document.createElement('span'));
      check.className = 'mx-list__check';
      check.append(checkMark());
    }
    const icon = this.iconOf?.(item);
    if (icon !== undefined && icon !== null) {
      const host = el.appendChild(document.createElement('span'));
      host.className = 'mx-list__icon';
      host.setAttribute('aria-hidden', 'true');
      const shown = iconNode(icon);
      host.append(shown.node);
      this.releases.push(shown.release);
    }
    const text = el.appendChild(document.createElement('span'));
    text.className = 'mx-list__text';
    const release = this.draw?.(item, text);
    if (release) this.releases.push(release);
    else if (!this.draw) text.textContent = this.textOf(item);
    return el;
  }

  private markSelected(el: HTMLElement, item: T): void {
    const selected = this.isSelected(item);
    el.setAttribute('aria-selected', String(selected));
    el.toggleAttribute('data-selected', selected);
  }

  private indexOf(target: EventTarget | null): number {
    const el = target instanceof Element ? target.closest<HTMLElement>('[role="option"]') : null;
    return el && this.element.contains(el) ? Number(el.dataset.index) : -1;
  }

  private clicked(e: MouseEvent): void {
    const index = this.indexOf(e.target);
    const item = index < 0 ? undefined : this.itemAt(index);
    if (index < 0 || item === undefined || !this.enabledOf(item)) return;
    this.setActive(index, false);
    this.chosenEmitter.fire({ item, index, event: e });
  }

  private release(): void {
    for (const release of this.releases.splice(0)) release();
  }
}
