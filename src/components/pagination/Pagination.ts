import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { handOver, kept, part, put, text } from '../../core/draw-parts';
import { fillTemplate } from '../../core/fill-template';
import { chevronEnd, chevronStart } from '../../core/glyphs';
import { LanguageLook } from '../../core/language-look';
import { onLanguage } from '../../core/on-language';
import { ResizeWatch } from '../../core/resize-watch';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import type { ButtonSize } from '../button/button-size';
import type { ButtonTone } from '../button/button-tone';
import type { ButtonVariant } from '../button/button-variant';
import { DropDown } from '../dropdown/DropDown';
import { NumberBox } from '../numberbox/NumberBox';
import type { PageChangedEventArgs } from './page-changed-event-args';
import type { PaginationMode } from './pagination-mode';
import type { PaginationProps } from './pagination-props';

const OWN = ['page', 'total', 'pageSize', 'pageCount', 'pageSizes', 'showInfo', 'showNavigation', 'neighbors', 'mode', 'infoText', 'label'] as const;

/** A page button, or a gap between page buttons. */
type PageItem = { key: string; page: number; gap: boolean };
/** A page size of the drop-down. */
type SizeItem = { key: string; value: number; text: string };

/** The buttons' look, the design language's. */
const LOOK = {
  size: '--_pagination-button-size',
  step: '--_pagination-step-variant',
  page: '--_pagination-page-variant',
  pageTone: '--_pagination-page-tone',
  current: '--_pagination-current-variant',
  currentTone: '--_pagination-current-tone',
} as const;

/**
 * Moving through pages of items: the page sizes, where the page stands ("Page 3 of 12 (250 items)"), the first,
 * previous, next and last steps and a button per page around the current one, with gaps. The compact look has a box for
 * the page number and a drop-down of the sizes instead; `adaptive` is compact while the full one does not fit. Its
 * buttons stay while their page does, so focus stays on a button pressed.
 *
 * @example
 * <Pagination total={() => this.orders.total} pageSizes={[10, 25, 50]} pageSize={() => this.orders.pageSize}
 *   x-model={() => this.orders.page} onPageChanged={(e) => this.orders.load(e.page, e.pageSize)} />
 */
export class Pagination extends Control<HTMLElement, PaginationProps> {
  private readonly changed = new Emitter<PageChangedEventArgs>();
  private readonly look = new LanguageLook(this.element, LOOK, () => this.draw());
  private readonly sizeGroup: Component<HTMLDivElement>;
  private readonly sizeList: DropDown<SizeItem, number>;
  private readonly info: Component<HTMLSpanElement>;
  private readonly steps: { first: Button; previous: Button; next: Button; last: Button };
  private readonly pagesPart: Component<HTMLSpanElement>;
  private readonly jump: Component<HTMLSpanElement>;
  private readonly pageText: Component<HTMLSpanElement>;
  private readonly pageBox: NumberBox;
  private readonly countText: Component<HTMLSpanElement>;
  private readonly pageParts = new Map<string, ComponentBase>();
  private readonly sizeButtons = new Map<number, Button>();
  private readonly sizes = new Map<number, SizeItem>();
  /** The full look does not fit (adaptive), and the room it did not fit in. */
  private narrow = false;
  private narrowRoom = 0;
  private readonly watch = new ResizeWatch(() => this.fit());
  private ready = false;

  constructor(props?: IBaseProp<PaginationProps>) {
    super('nav', props);
    const own = (this.props ?? {}) as PaginationProps;
    this.element.classList.add('mx-pagination');
    this.sizeGroup = part(this, 'div', 'mx-pagination__sizes');
    this.sizeGroup.element.setAttribute('role', 'group');
    this.sizeList = new DropDown<SizeItem, number>({ size: 'sm', labelMode: 'hidden', onValueChanged: (e) => e.byUser && typeof e.value === 'number' && this.setSize(e.value) });
    this.sizeList.element.classList.add('mx-pagination__size-list');
    this.controls.add(this.sizeList);
    this.info = part(this, 'span', 'mx-pagination__info');
    const step = (name: string, twice: boolean, to: () => number) => {
      const glyphs = document.createElement('span');
      glyphs.className = 'mx-pagination__step-icon';
      const back = name === 'first' || name === 'previous';
      glyphs.append(back ? chevronStart() : chevronEnd());
      if (twice) glyphs.append(back ? chevronStart() : chevronEnd());
      const b = new Button({ icon: glyphs, onclick: () => this.goTo(to(), true) });
      b.element.classList.add('mx-pagination__step');
      b.element.dataset.step = name;
      return b;
    };
    this.steps = {
      first: step('first', true, () => 1),
      previous: step('previous', false, () => this.current - 1),
      next: step('next', false, () => this.current + 1),
      last: step('last', true, () => this.count),
    };
    this.controls.add(this.steps.first, this.steps.previous);
    this.pagesPart = part(this, 'span', 'mx-pagination__pages');
    this.jump = part(this, 'span', 'mx-pagination__jump');
    this.pageText = part(this.jump, 'span', '');
    this.pageText.element.setAttribute('aria-hidden', 'true');
    this.pageBox = new NumberBox({ size: 'sm', labelMode: 'hidden', min: 1, decimals: 0, showSpinButtons: false, updateOn: 'change', selectOnFocus: true, onValueChanged: (e) => e.byUser && typeof e.value === 'number' && this.goTo(e.value, true) });
    this.pageBox.element.classList.add('mx-pagination__number');
    this.jump.controls.add(this.pageBox);
    this.countText = part(this.jump, 'span', '');
    this.countText.element.setAttribute('aria-hidden', 'true');
    this.controls.add(this.steps.next, this.steps.last);

    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.value !== undefined) this.bindProperty('page', own.value);
    if (own.onPageChanged) this.onPageChanged(own.onPageChanged);
    for (const name of OWN) this.observeProperty(name, () => this.draw());
    for (const name of ['page', 'pageSize'] as const) {
      this.observeProperty(name, () => {
        if (this.ready) this.changed.fire({ page: this.current, pageSize: this.size, byUser: false, source: this });
      });
    }
    // Its texts and numbers are the kit's language's.
    onLanguage(this, () => this.draw());
    this.motif.setDisposable(this.look.watch());
    this.motif.setDisposable(() => {
      this.watch.disconnect();
      this.changed.dispose();
    });
    this.ready = true;
  }

  // Properties (see PaginationProps).

  get page(): number {
    return this.getProperty<number | undefined>('page') ?? 1;
  }
  set page(value: Bind<number>) {
    this.assignProperty('page', value);
  }
  /** The page, as `x-model` binds it: the same as `page`. */
  get value(): number {
    return this.page;
  }
  set value(value: Bind<number>) {
    this.page = value;
  }
  get total(): number {
    return Number(this.getProperty('total')) || 0;
  }
  set total(value: Bind<number>) {
    this.assignProperty('total', value);
  }
  get pageSize(): number {
    return this.getProperty<number | undefined>('pageSize') ?? 10;
  }
  set pageSize(value: Bind<number>) {
    this.assignProperty('pageSize', value);
  }
  get pageCount(): number {
    return this.count;
  }
  set pageCount(value: Bind<number | null>) {
    this.assignProperty('pageCount', value);
  }
  get pageSizes(): readonly number[] {
    return this.getProperty<readonly number[] | undefined>('pageSizes') ?? [];
  }
  set pageSizes(value: Bind<readonly number[]>) {
    this.assignProperty('pageSizes', value);
  }
  get showInfo(): boolean {
    return this.getProperty<boolean | undefined>('showInfo') !== false;
  }
  set showInfo(value: Bind<boolean>) {
    this.assignProperty('showInfo', value);
  }
  get showNavigation(): boolean {
    return this.getProperty<boolean | undefined>('showNavigation') !== false;
  }
  set showNavigation(value: Bind<boolean>) {
    this.assignProperty('showNavigation', value);
  }
  get neighbors(): number {
    const n = Number(this.getProperty('neighbors'));
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 1;
  }
  set neighbors(value: Bind<number>) {
    this.assignProperty('neighbors', value);
  }
  get mode(): PaginationMode {
    return this.getProperty<PaginationMode | undefined>('mode') ?? 'adaptive';
  }
  set mode(value: Bind<PaginationMode>) {
    this.assignProperty('mode', value);
  }
  get infoText(): string {
    return this.getProperty<string | undefined>('infoText') ?? '';
  }
  set infoText(value: Bind<string>) {
    this.assignProperty('infoText', value);
  }
  get label(): string {
    return this.getProperty<string | undefined>('label') ?? '';
  }
  set label(value: Bind<string>) {
    this.assignProperty('label', value);
  }

  /** The page or the page size changed, by the user or by code (`e.byUser`). */
  get onPageChanged(): MotifEvent<PageChangedEventArgs> {
    return this.changed.event;
  }

  /** Whether the compact look shows now. */
  get compact(): boolean {
    const mode = this.peekProperty<PaginationMode>('mode') ?? 'adaptive';
    return mode === 'compact' || (mode === 'adaptive' && this.narrow);
  }

  /** Goes to a page (from 1), as a press would. */
  goTo(page: number, byUser = false): void {
    const next = Math.min(Math.max(Math.round(page), 1), this.count);
    if (next === this.current) {
      this.draw();
      return;
    }
    this.userMoved('page', next, byUser);
  }

  override onMounted(): void {
    this.look.read();
    this.watch.observe(this.element.parentElement ?? this.element);
    this.draw();
  }

  /** Items per page, read. */
  private get size(): number {
    const n = Number(this.peekProperty('pageSize') ?? 10);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 10;
  }

  /** How many pages, from `pageCount`, else from `total` and the page size. */
  private get count(): number {
    const given = Number(this.peekProperty('pageCount'));
    if (Number.isFinite(given) && given >= 1) return Math.floor(given);
    const total = Number(this.peekProperty('total')) || 0;
    const size = this.size;
    return size > 0 ? Math.max(1, Math.ceil(total / size)) : 1;
  }

  /** The page now, within the pages there are. */
  private get current(): number {
    const page = Number(this.peekProperty('page') ?? 1);
    return Math.min(Math.max(Number.isFinite(page) ? Math.round(page) : 1, 1), this.count);
  }

  /** A change the user made: stored, told, written back to `x-model` (the page). */
  private userMoved(name: 'page' | 'pageSize', value: number, byUser: boolean): void {
    this.ready = false;
    this.changeProperty(name, value);
    this.ready = true;
    this.changed.fire({ page: this.current, pageSize: this.size, byUser, source: this });
    if (name === 'page' && byUser) this.bindings.writeModel(value);
    this.draw();
  }

  /** Another page size: the first item of the page stays on the page shown. */
  private setSize(size: number): void {
    if (size === this.size) return;
    const first = (this.current - 1) * this.size;
    this.ready = false;
    this.changeProperty('pageSize', size);
    const page = size > 0 ? Math.floor(first / size) + 1 : 1;
    this.changeProperty('page', page);
    this.ready = true;
    this.changed.fire({ page: this.current, pageSize: this.size, byUser: true, source: this });
    this.bindings.writeModel(this.current);
    this.draw();
  }

  /**
   * The adaptive look: compact while the full one is wider than the room it has. The full look is drawn and measured
   * in the same frame (nothing is painted in between), so its width is the one it has now.
   */
  private fit(): void {
    const el = this.element;
    const room = el.parentElement?.clientWidth ?? 0;
    if (this.isDisposed || (this.peekProperty<PaginationMode>('mode') ?? 'adaptive') !== 'adaptive' || !room) return;
    const was = this.narrow;
    // Compact already: the full look is tried again only when there is more room than when it last did not fit, so
    // a page box being typed in stays where it is.
    if (was && room <= this.narrowRoom) return;
    if (was) {
      this.narrow = false;
      this.draw(false);
    }
    const narrow = el.scrollWidth > room + 0.5;
    this.narrow = narrow;
    if (narrow) this.narrowRoom = room;
    if (narrow !== was || was) this.draw(false);
  }

  /** Draws it as it is now; `fit` again afterwards unless the drawing is the fit's own. */
  private draw(refit = true): void {
    if (!this.steps) return;
    const s = uiLocale.strings;
    const format = new Intl.NumberFormat(uiLocale.locale);
    const n = (v: number) => format.format(v);
    const el = this.element;
    const compact = this.compact;
    const page = this.current;
    const count = this.count;
    const look = (name: keyof typeof LOOK, fallback: string) => this.look.get(name) ?? fallback;
    const size = look('size', 'sm') as ButtonSize;
    put(el, 'aria-label', this.peekProperty<string>('label') || s.gridPager);
    put(el, 'data-look', compact ? 'compact' : 'full');

    const sizes = this.peekProperty<readonly number[]>('pageSizes') ?? [];
    const sizesShown = sizes.length > 0;
    kept(this.sizeGroup.element, sizesShown && !compact);
    put(this.sizeGroup.element, 'aria-label', s.pagerPageSize);
    this.drawSizes(sizes, size, look);
    kept(this.sizeList.element, sizesShown && compact);
    if (this.sizeList.label !== s.pagerPageSize) this.sizeList.label = s.pagerPageSize;
    const items = this.sizeItems(sizes, n);
    if (this.sizeList.items.length !== items.length || this.sizeList.items.some((item, i) => item !== items[i])) this.sizeList.items = items;
    handOver(this.sizeList, this.size as number | null);

    kept(this.info.element, this.peekProperty('showInfo') !== false);
    // Hidden, not taken away, in the compact look: its text stays readable.
    this.info.element.hidden = compact;
    const total = Number(this.peekProperty('total')) || 0;
    const own = this.peekProperty<string>('infoText');
    const values = { page: n(page), count: n(count), total: n(total) };
    text(this.info.element, own ? fillTemplate(own, values) : uiLocale.text('gridPageOf', { page: n(page), count: n(count), total }));

    const navigation = this.peekProperty('showNavigation') !== false;
    const stepLook = (b: Button, hint: string, enabled: boolean) => {
      if (b.visible !== navigation) b.visible = navigation;
      if (b.hint !== hint) b.hint = hint;
      if (b.size !== size) b.size = size;
      const variant = look('step', 'ghost') as ButtonVariant;
      if (b.variant !== variant) b.variant = variant;
      if (b.enabled !== enabled) b.enabled = enabled;
    };
    stepLook(this.steps.first, s.gridFirstPage, page > 1);
    stepLook(this.steps.previous, s.gridPreviousPage, page > 1);
    stepLook(this.steps.next, s.gridNextPage, page < count);
    stepLook(this.steps.last, s.gridLastPage, page < count);

    kept(this.pagesPart.element, !compact);
    this.drawPages(page, count, size, look, n);

    kept(this.jump.element, compact);
    text(this.pageText.element, s.gridPage);
    if (this.pageBox.label !== s.gridPageNumber) this.pageBox.label = s.gridPageNumber;
    if (this.pageBox.max !== count) this.pageBox.max = count;
    handOver(this.pageBox, page as number | null);
    text(this.countText.element, uiLocale.text('gridPageCount', { count: n(count) }));
    // What decides whether the full look fits may have changed.
    if (refit) queueMicrotask(() => this.fit());
  }

  /** A button per page size, kept while the size stays, the one in use pressed. */
  private drawSizes(sizes: readonly number[], size: ButtonSize, look: (name: keyof typeof LOOK, fallback: string) => string): void {
    const group = this.sizeGroup;
    for (const [value, button] of [...this.sizeButtons]) {
      if (sizes.includes(value)) continue;
      this.sizeButtons.delete(value);
      group.controls.remove(button);
    }
    sizes.forEach((value, index) => {
      let button = this.sizeButtons.get(value);
      if (!button) {
        button = new Button({ toggle: true, onclick: () => {
          this.setSize(value);
          // The button turns itself on or off after the click: drawn after it, it shows the size in use again.
          queueMicrotask(() => this.draw());
        } });
        button.element.classList.add('mx-pagination__size');
        this.sizeButtons.set(value, button);
        group.controls.insert(index, button);
      }
      const current = this.size === value;
      const label = value > 0 ? new Intl.NumberFormat(uiLocale.locale).format(value) : uiLocale.strings.gridPageSizeAll;
      if (button.text !== label) button.text = label;
      if (button.size !== size) button.size = size;
      if (button.pressed !== current) button.pressed = current;
      const variant = look(current ? 'current' : 'page', current ? 'solid' : 'ghost') as ButtonVariant;
      const tone = look(current ? 'currentTone' : 'pageTone', current ? 'accent' : 'standard') as ButtonTone;
      if (button.variant !== variant) button.variant = variant;
      if (button.tone !== tone) button.tone = tone;
    });
  }

  /** The page buttons and gaps, kept by page while they stay. */
  private drawPages(page: number, count: number, size: ButtonSize, look: (name: keyof typeof LOOK, fallback: string) => string, n: (v: number) => string): void {
    const pages = this.pagesPart;
    const items = pageItems(page, count, this.neighbors);
    const keys = new Set(items.map((p) => p.key));
    for (const [key, item] of [...this.pageParts]) {
      if (keys.has(key)) continue;
      this.pageParts.delete(key);
      pages.controls.remove(item);
    }
    items.forEach((p, index) => {
      let item = this.pageParts.get(p.key);
      if (!item) {
        if (p.gap) {
          const gap = new Component<HTMLSpanElement>('span');
          gap.element.className = 'mx-pagination__gap';
          gap.element.setAttribute('aria-hidden', 'true');
          gap.element.textContent = '…';
          item = gap;
        } else {
          const button = new Button({ onclick: () => this.goTo(p.page, true) });
          button.element.classList.add('mx-pagination__page');
          item = button;
        }
        this.pageParts.set(p.key, item);
      }
      // In the order of the pages, each kept in its place so focus stays.
      if (pages.controls.items[index] !== item) {
        if (pages.controls.items.includes(item)) pages.controls.move(item, pages.controls.items[index] ?? null);
        else pages.controls.insert(index, item);
      }
      if (item instanceof Button) {
        const current = page === p.page;
        const label = n(p.page);
        if (item.text !== label) item.text = label;
        if (item.size !== size) item.size = size;
        const variant = look(current ? 'current' : 'page', current ? 'solid' : 'ghost') as ButtonVariant;
        const tone = look(current ? 'currentTone' : 'pageTone', current ? 'accent' : 'standard') as ButtonTone;
        if (item.variant !== variant) item.variant = variant;
        if (item.tone !== tone) item.tone = tone;
        put(item.element as HTMLElement, 'aria-label', uiLocale.text('gridPageButton', { page: label }));
        put(item.element as HTMLElement, 'aria-current', current ? 'page' : null);
      }
    });
  }

  /** The page sizes of the drop-down, the same item for the same size. */
  private sizeItems(sizes: readonly number[], n: (v: number) => string): SizeItem[] {
    for (const size of [...this.sizes.keys()]) if (!sizes.includes(size)) this.sizes.delete(size);
    return sizes.map((value) => {
      const label = value > 0 ? n(value) : uiLocale.strings.gridPageSizeAll;
      let item = this.sizes.get(value);
      if (!item || item.text !== label) {
        item = { key: `s${value}`, value, text: label };
        this.sizes.set(value, item);
      }
      return item;
    });
  }
}

/** The page buttons: the first, the last, `n` on each side of the current one, with gaps; as many near an end as in the middle. */
function pageItems(page: number, count: number, n: number): PageItem[] {
  const pages = new Set<number>([1, count]);
  for (let p = page - n; p <= page + n; p++) pages.add(p);
  if (page <= n + 2) for (let p = 2; p <= 2 * n + 2; p++) pages.add(p);
  if (page >= count - n - 1) for (let p = count - 1; p >= count - 2 * n - 1; p--) pages.add(p);
  const sorted = [...pages].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const items: PageItem[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) items.push({ key: `gap${p}`, page: -1, gap: true });
    items.push({ key: `p${p}`, page: p, gap: false });
    prev = p;
  }
  return items;
}
