import { Component, untracked, type ComponentBase } from '@motifx/core';
import { handOver, kept, put, text } from '../../../core/draw-parts';
import { chevronDown } from '../../../core/glyphs';
import { fillTemplate } from '../../../core/fill-template';
import { LanguageLook } from '../../../core/language-look';
import { ResizeWatch } from '../../../core/resize-watch';
import { Button } from '../../button/Button';
import type { ButtonTone } from '../../button/button-tone';
import type { ButtonVariant } from '../../button/button-variant';
import { DropDown } from '../../dropdown/DropDown';
import { NumberBox } from '../../numberbox/NumberBox';
import type { GridModel } from '../model/GridModel';
import type { PagerHost } from './pager-host';

type PageItem = { key: string; page: number; gap: boolean };
type ButtonLook = { size: 'sm' | 'md' | 'lg'; step: ButtonVariant; page: ButtonVariant; pageTone: ButtonTone; current: ButtonVariant; currentTone: ButtonTone };

const BUTTONS: ButtonLook = { size: 'sm', step: 'ghost', page: 'ghost', pageTone: 'standard', current: 'solid', currentTone: 'accent' };
const BUTTON_TOKENS: Record<keyof ButtonLook, string> = {
  size: '--_datagrid-pager-button-size',
  step: '--_datagrid-pager-step-variant',
  page: '--_datagrid-pager-page-variant',
  pageTone: '--_datagrid-pager-page-tone',
  current: '--_datagrid-pager-current-variant',
  currentTone: '--_datagrid-pager-current-tone',
};
/** A page size of the drop-down. */
type SizeItem = { key: string; value: number; text: string };

/** The parts the pager draws again. */
interface PagerParts {
  sizes: HTMLDivElement;
  sizeGroup: Component<HTMLDivElement>;
  info: HTMLSpanElement;
  steps: { first: Button; previous: Button; next: Button; last: Button };
  pages: Component<HTMLSpanElement>;
  jump: HTMLSpanElement;
  pageText: HTMLSpanElement;
  countText: HTMLSpanElement;
}

/**
 * The pager under the rows of a paged grid: the page sizes, "Page 3 of 12 (250 items)", the first,
 * previous, next and last buttons and a button per page around the current one. The compact look
 * has a box for the page number and a drop-down of the page sizes instead; the adaptive look is
 * compact while the full one does not fit in the bar. Its buttons are kept while they stay, so focus
 * stays on a button that was pressed. It follows nothing: made in code, it draws itself again whenever
 * the grid tells a change.
 */
export class GridPager<T> extends Component<HTMLElement> {
  /** The drop-down of the page sizes and the page number box of the compact look. */
  sizeList: DropDown<SizeItem, number> | null = null;
  pageBox: NumberBox | null = null;
  /** The full pager does not fit (adaptive). */
  private narrow = false;
  /** The width the full pager needed when it was last drawn. */
  private fullWidth = 0;
  /** What decides whether the full pager fits, as it was last seen. */
  private fitSeen = '';
  private readonly pages = new Map<string, PageItem>();
  private readonly sizes = new Map<number, SizeItem>();
  private readonly sizeButtons = new Map<number, Button>();
  private readonly pageParts = new Map<string, ComponentBase>();
  private parts: PagerParts | null = null;
  /** The buttons' look, the design language's: their size, the steps' variant, a page's and the current page's. */
  private readonly buttons: ButtonLook = { ...BUTTONS };
  private readonly language = new LanguageLook(this.element, BUTTON_TOKENS, () => {
    for (const name of Object.keys(BUTTONS) as (keyof typeof BUTTONS)[]) (this.buttons as Record<string, string>)[name] = this.language.get(name) ?? BUTTONS[name];
    this.draw();
  });

  constructor(
    private readonly grid: GridModel<T>,
    private readonly host: PagerHost,
  ) {
    super('nav');
    this.motif.setDisposable(this.language.watch());
  }

  /** Whether the compact look shows now. */
  get compact(): boolean {
    const mode = this.grid.settings.get('pagerDisplayMode');
    return mode === 'compact' || (mode === 'adaptive' && this.narrow);
  }

  override onConfigured() {
    this.element.className = 'mx-data-grid__pager';
    this.motif.setDisposable(this.grid.notices.on(() => this.draw()));
  }

  override onMounted() {
    this.language.read();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeWatch(() => this.fit());
    observer.observe(this.element.parentElement ?? this.element);
    this.motif.setDisposable(() => observer.disconnect());
  }

  /** The adaptive look: compact while the full pager is wider than the room the bar has. */
  fit() {
    const el = this.isDisposed ? null : (this.element as HTMLElement | undefined);
    const bar = el?.parentElement;
    if (!el || !bar || el.hidden || this.grid.settings.get('pagerDisplayMode') !== 'adaptive') return;
    const style = getComputedStyle(bar);
    const room = bar.clientWidth - (parseFloat(style.paddingInlineStart) || 0) - (parseFloat(style.paddingInlineEnd) || 0);
    if (!this.narrow) this.fullWidth = el.scrollWidth;
    const narrow = room > 0 && this.fullWidth > room;
    if (narrow === this.narrow) return;
    this.narrow = narrow;
    this.draw();
  }

  override initializeComponent() {
    const { grid, host } = this;
    const span = (className: string, parent: ComponentBase) => {
      const c = new Component<HTMLSpanElement>('span');
      if (className) c.element.className = className;
      parent.controls.add(c);
      return c;
    };
    const sizeGroup = new Component<HTMLDivElement>('div');
    sizeGroup.element.className = 'mx-data-grid__page-sizes';
    sizeGroup.element.setAttribute('role', 'group');
    const sizeList = new DropDown<SizeItem, number>({ size: 'sm', labelMode: 'hidden' });
    sizeList.element.classList.add('mx-data-grid__page-size-list');
    sizeList.element.setAttribute('data-in-pager', '');
    sizeList.onValueChanged((e) => {
      if (e.byUser && typeof e.value === 'number') host.setPageSize(e.value);
    });
    this.sizeList = sizeList;
    const info = new Component<HTMLSpanElement>('span');
    info.element.className = 'mx-data-grid__page-info';
    const step = (name: string, go: () => number) => {
      const b = new Button({});
      b.element.classList.add('mx-data-grid__page-step');
      b.element.dataset.step = name;
      b.motif.on('click', () => host.goTo(go()));
      return b;
    };
    const last = () => grid.pageCount() - 1;
    const steps = {
      first: step('first', () => 0),
      previous: step('previous', () => grid.state.page - 1),
      next: step('next', () => grid.state.page + 1),
      last: step('last', last),
    };
    steps.first.icon = this.stepIcon(true);
    steps.previous.icon = this.stepIcon(false);
    steps.next.icon = this.stepIcon(false);
    steps.last.icon = this.stepIcon(true);
    const pages = new Component<HTMLSpanElement>('span');
    pages.element.className = 'mx-data-grid__pages';
    const jump = new Component<HTMLSpanElement>('span');
    jump.element.className = 'mx-data-grid__page-jump';
    const pageText = span('', jump);
    pageText.element.setAttribute('aria-hidden', 'true');
    const box = new NumberBox({ size: 'sm', labelMode: 'hidden', min: 1, decimals: 0, showSpinButtons: false, updateOn: 'change', selectOnFocus: true });
    box.element.classList.add('mx-data-grid__page-number');
    box.element.setAttribute('data-in-pager', '');
    box.onValueChanged((e) => {
      if (e.byUser && typeof e.value === 'number') host.goTo(e.value - 1);
    });
    this.pageBox = box;
    jump.controls.add(box);
    const countText = span('', jump);
    countText.element.setAttribute('aria-hidden', 'true');
    this.controls.add(sizeGroup, sizeList, info, steps.first, steps.previous, pages, jump, steps.next, steps.last);
    this.parts = { sizes: sizeGroup.element, sizeGroup, info: info.element, steps, pages, jump: jump.element, pageText: pageText.element, countText: countText.element };
    this.draw();
  }

  /** Draws the pager as the grid is now. */
  draw() {
    const parts = this.parts;
    if (!parts || this.isDisposed) return;
    untracked(() => {
      const { grid, host, buttons } = this;
      const st = grid.state;
      const s = grid.settings;
      const t = (key: Parameters<typeof grid.text>[0], values?: Record<string, unknown>) => grid.text(key, values);
      const count = (n: number) => grid.formatter.count(n);
      const el = this.element;
      const compact = this.compact;
      const shows = grid.showsPager();
      // Named after the grid too: two paged grids on a page are two landmarks.
      put(el, 'aria-label', s.get('pagerLabel') || `${t('gridPager')}: ${host.gridLabel()}`);
      put(el, 'data-look', compact ? 'compact' : 'full');
      el.hidden = !shows;

      const sizesShown = s.get('pageSizeSelector') && grid.pageSizes().length > 0;
      kept(parts.sizes, sizesShown && !compact);
      put(parts.sizes, 'aria-label', t('gridPageSize'));
      this.drawSizes();
      const list = this.sizeList!;
      kept(list.element, sizesShown && compact);
      list.label = t('gridPageSize');
      const items = this.sizeItems();
      if (list.items.length !== items.length || list.items.some((item, i) => item !== items[i])) list.items = items;
      handOver(list, grid.pageSize as number | null);

      // Hidden, not taken away, in the compact look: its text stays readable.
      kept(parts.info, s.get('pagerInfo'));
      parts.info.hidden = compact;
      text(parts.info, this.info());

      const navigation = s.get('pagerNavigation');
      const lastPage = grid.pageCount() - 1;
      const step = (b: Button, hint: string, enabled: boolean) => {
        b.visible = navigation;
        b.hint = hint;
        b.size = buttons.size;
        b.variant = buttons.step;
        b.enabled = enabled;
      };
      step(parts.steps.first, t('gridFirstPage'), st.page > 0);
      step(parts.steps.previous, t('gridPreviousPage'), st.page > 0);
      step(parts.steps.next, t('gridNextPage'), st.page < lastPage);
      step(parts.steps.last, t('gridLastPage'), st.page < lastPage);

      kept(parts.pages.element, !compact);
      this.drawPages();

      kept(parts.jump, compact);
      text(parts.pageText, t('gridPage'));
      const box = this.pageBox!;
      box.label = t('gridPageNumber');
      box.max = grid.pageCount();
      handOver(box, st.page + 1 as number | null);
      text(parts.countText, t('gridPageCount', { count: count(grid.pageCount()) }));

      // Another page count, other sizes or another look: whether the full pager fits is seen again.
      const fit = [this.pageItems().length, grid.pageSizes().length, s.get('pageSizeSelector'), s.get('pagerInfo'), shows, compact].join(' ');
      if (fit !== this.fitSeen) {
        this.fitSeen = fit;
        queueMicrotask(() => this.fit());
      }
    });
  }

  /** The buttons of the page sizes: one per size, kept while the size stays, the one in use pressed. */
  private drawSizes() {
    const { grid, buttons } = this;
    const group = this.parts!.sizeGroup;
    const list = grid.pageSizes();
    for (const [value, button] of [...this.sizeButtons]) {
      if (list.includes(value)) continue;
      this.sizeButtons.delete(value);
      group.controls.remove(button);
    }
    const order: Element[] = [];
    for (const value of list) {
      let button = this.sizeButtons.get(value);
      if (!button) {
        button = new Button({ toggle: true });
        button.element.classList.add('mx-data-grid__page-size');
        button.motif.on('click', () => {
          this.host.setPageSize(value);
          // The button turns itself on or off after the click: drawn after it, it shows the size in use again.
          queueMicrotask(() => this.drawSizes());
        });
        this.sizeButtons.set(value, button);
        group.controls.add(button);
      }
      const current = grid.pageSize === value;
      button.text = value > 0 ? grid.formatter.count(value) : grid.text('gridPageSizeAll');
      button.size = buttons.size;
      button.pressed = current;
      button.variant = current ? buttons.current : buttons.page;
      button.tone = current ? buttons.currentTone : buttons.pageTone;
      order.push(button.element);
    }
    inOrder(group.element, order);
  }

  /** The page buttons and gaps, kept by page while they stay. */
  private drawPages() {
    const { grid, host, buttons } = this;
    const st = grid.state;
    const count = (n: number) => grid.formatter.count(n);
    const pages = this.parts!.pages;
    const items = this.pageItems();
    const keys = new Set(items.map((p) => p.key));
    for (const [key, part] of [...this.pageParts]) {
      if (keys.has(key)) continue;
      this.pageParts.delete(key);
      pages.controls.remove(part);
    }
    const order: Element[] = [];
    for (const p of items) {
      let part = this.pageParts.get(p.key);
      if (!part) {
        if (p.gap) {
          const gap = new Component<HTMLSpanElement>('span');
          gap.element.className = 'mx-data-grid__page-gap';
          gap.element.setAttribute('aria-hidden', 'true');
          gap.element.textContent = '…';
          part = gap;
        } else {
          const button = new Button({});
          button.element.classList.add('mx-data-grid__page');
          button.motif.on('click', () => host.goTo(p.page));
          part = button;
        }
        this.pageParts.set(p.key, part);
        pages.controls.add(part);
      }
      if (part instanceof Button) {
        const current = st.page === p.page;
        part.text = count(p.page + 1);
        part.size = buttons.size;
        part.variant = current ? buttons.current : buttons.page;
        part.tone = current ? buttons.currentTone : buttons.pageTone;
        put(part.element as HTMLElement, 'aria-label', grid.text('gridPageButton', { page: count(p.page + 1) }));
        put(part.element as HTMLElement, 'aria-current', current ? 'page' : null);
      }
      order.push(part.element as Element);
    }
    inOrder(pages.element, order);
  }

  /** "Page 3 of 12 (250 items)": `pagerInfoText`, else the `gridPageOf` text. */
  info(): string {
    const grid = this.grid;
    const count = (n: number) => grid.formatter.count(n);
    const page = count(Math.min(grid.state.page, grid.pageCount() - 1) + 1);
    const pages = count(grid.pageCount());
    const total = count(this.host.total());
    const values = { 0: page, 1: pages, 2: total, page, count: pages, total };
    const own = grid.settings.get('pagerInfoText');
    return own ? fillTemplate(own, values) : grid.text('gridPageOf', values);
  }

  /** Page buttons: first, last, `pagerNeighbors` on each side of the current one, with gaps; the same item for the same page. */
  pageItems(): PageItem[] {
    const grid = this.grid;
    const count = grid.pageCount();
    const current = Math.min(grid.state.page, count - 1);
    const n = Math.max(0, Math.floor(grid.settings.get('pagerNeighbors')));
    const pages = new Set<number>([0, count - 1]);
    for (let p = current - n; p <= current + n; p++) pages.add(p);
    // Near an end, as many pages show as around a page in the middle.
    if (current <= n + 1) for (let p = 1; p <= 2 * n + 1; p++) pages.add(p);
    if (current >= count - n - 2) for (let p = count - 2; p >= count - 2 * n - 2; p--) pages.add(p);
    const sorted = [...pages].filter((p) => p >= 0 && p < count).sort((a, b) => a - b);
    const items: PageItem[] = [];
    let prev = -1;
    for (const p of sorted) {
      if (p - prev > 1) items.push(this.pageItem(`gap${p}`, -1, true));
      items.push(this.pageItem(`p${p}`, p, false));
      prev = p;
    }
    for (const key of [...this.pages.keys()]) if (!items.some((i) => i.key === key)) this.pages.delete(key);
    return items;
  }

  /** The page sizes of the drop-down, the same item for the same size. */
  private sizeItems(): SizeItem[] {
    const grid = this.grid;
    const list = grid.pageSizes();
    for (const size of [...this.sizes.keys()]) if (!list.includes(size)) this.sizes.delete(size);
    return list.map((value) => {
      const label = value > 0 ? grid.formatter.count(value) : grid.text('gridPageSizeAll');
      let item = this.sizes.get(value);
      if (!item || item.text !== label) {
        item = { key: `s${value}`, value, text: label };
        this.sizes.set(value, item);
      }
      return item;
    });
  }

  private pageItem(key: string, page: number, gap: boolean): PageItem {
    let item = this.pages.get(key);
    if (!item) {
      item = { key, page, gap };
      this.pages.set(key, item);
    }
    return item;
  }

  /** The arrow of a pager step; CSS turns it to point the way it goes. */
  private stepIcon(twice: boolean): Node {
    const icon = document.createElement('span');
    icon.className = 'mx-data-grid__step-icon';
    icon.append(chevronDown());
    if (twice) icon.append(chevronDown());
    return icon;
  }
}

/** Puts `order` in `parent` in that order; one already in its place is not moved, so it keeps focus. */
function inOrder(parent: HTMLElement, order: readonly Element[]) {
  let at = parent.firstElementChild;
  for (const el of order) {
    if (el === at) {
      at = at.nextElementSibling;
      continue;
    }
    parent.insertBefore(el, at);
  }
}
