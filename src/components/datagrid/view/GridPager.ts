import { Component, untracked, type ComponentBase } from '@motifx/core';
import { handOver, loose } from '../../../core/draw-parts';
import { kept, mark, put, text } from '../../../core/part-writes';
import { chevronDown } from '../../../core/glyphs';
import { orderControls } from '../../../core/order-controls';
import { fillTemplate } from '../../../core/fill-template';
import { LanguageLook } from '../../../core/language-look';
import { boxOf, holderOf, measure, onLayout, styleOf } from '../../../core/measure';
import { Button } from '../../button/Button';
import type { ButtonTone } from '../../button/button-tone';
import type { ButtonVariant } from '../../button/button-variant';
import { DropDown } from '../../dropdown/DropDown';
import { NumberBox } from '../../numberbox/NumberBox';
import type { GridModel } from '../model/GridModel';
import type { PagerHost } from './pager-host';

type PageItem = { key: string; page: number; gap: boolean };
/** The room the bar has for the pager and the width the pager takes, as read. */
type FitRead = { room: number; width: number };
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
  sizeGroup: Component<HTMLDivElement>;
  info: Component<HTMLSpanElement>;
  steps: { first: Button; previous: Button; next: Button; last: Button };
  pages: Component<HTMLSpanElement>;
  jump: Component<HTMLSpanElement>;
  pageText: Component<HTMLSpanElement>;
  countText: Component<HTMLSpanElement>;
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
  /** The last draw hid the pager: the grid shows none. */
  private hidden = false;
  /** The width the full pager needed when it was last drawn. */
  private fullWidth = 0;
  /** What decides whether the full pager fits, as it was last seen. */
  private fitSeen = '';
  private readonly pages = new Map<string, PageItem>();
  private readonly sizes = new Map<number, SizeItem>();
  private readonly sizeButtons = new Map<number, Button>();
  private readonly pageParts = new Map<string, ComponentBase>();
  private parts: PagerParts | null = null;
  /** What holds the pager: the room it has decides the adaptive look. */
  private bar: ComponentBase | null = null;
  private stopRoom: (() => void) | null = null;
  /** The buttons' look, the design language's: their size, the steps' variant, a page's and the current page's. */
  private readonly buttons: ButtonLook = { ...BUTTONS };
  private readonly language = new LanguageLook(this, BUTTON_TOKENS, () => {
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
    this.class.add('mx-data-grid__pager');
    this.motif.setDisposable(this.grid.notices.on(() => this.draw()));
  }

  override onMounted() {
    this.language.read();
    const bar = (this.parent && holderOf(this.parent)) ?? this;
    if (bar === this.bar) return;
    this.stopRoom?.();
    this.bar = bar;
    this.stopRoom = onLayout(bar, 'size', () => this.fit(), { owner: this });
  }

  /** The adaptive look: compact while the full pager is wider than the room the bar has. Seen in the next frame. */
  fit() {
    measure(this, this.readFit, this.drawFit);
  }

  private readonly readFit = (): FitRead | null => {
    const bar = this.bar;
    if (!bar || this.isDisposed || this.hidden || this.grid.settings.get('pagerDisplayMode') !== 'adaptive') return null;
    const pad = styleOf(bar, ['padding-inline-start', 'padding-inline-end']);
    const room = boxOf(bar).clientWidth - (parseFloat(pad['padding-inline-start']) || 0) - (parseFloat(pad['padding-inline-end']) || 0);
    return { room, width: boxOf(this).scrollWidth };
  };

  private readonly drawFit = (seen: FitRead | null) => {
    if (!seen) return;
    if (!this.narrow) this.fullWidth = seen.width;
    const narrow = seen.room > 0 && this.fullWidth > seen.room;
    if (narrow === this.narrow) return;
    this.narrow = narrow;
    this.draw();
  };

  override initializeComponent() {
    const { grid, host } = this;
    const span = (className: string, parent: ComponentBase) => {
      const c = loose<HTMLSpanElement>('span', className);
      parent.controls.add(c);
      return c;
    };
    const sizeGroup = loose<HTMLDivElement>('div', 'mx-data-grid__page-sizes');
    sizeGroup.attr.add({ role: 'group' });
    const sizeList = new DropDown<SizeItem, number>({ size: 'sm', labelMode: 'hidden' });
    sizeList.class.add('mx-data-grid__page-size-list');
    sizeList.attr.add({ 'data-in-pager': '' });
    sizeList.onValueChanged((e) => {
      if (e.byUser && typeof e.value === 'number') host.setPageSize(e.value);
    });
    this.sizeList = sizeList;
    const info = loose<HTMLSpanElement>('span', 'mx-data-grid__page-info');
    const step = (name: string, go: () => number) => {
      const b = new Button({});
      b.class.add('mx-data-grid__page-step');
      b.attr.add({ 'data-step': name });
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
    const pages = loose<HTMLSpanElement>('span', 'mx-data-grid__pages');
    const jump = loose<HTMLSpanElement>('span', 'mx-data-grid__page-jump');
    const pageText = span('', jump);
    pageText.attr.add({ 'aria-hidden': 'true' });
    const box = new NumberBox({ size: 'sm', labelMode: 'hidden', min: 1, decimals: 0, showSpinButtons: false, updateOn: 'change', selectOnFocus: true });
    box.class.add('mx-data-grid__page-number');
    box.attr.add({ 'data-in-pager': '' });
    box.onValueChanged((e) => {
      if (e.byUser && typeof e.value === 'number') host.goTo(e.value - 1);
    });
    this.pageBox = box;
    jump.controls.add(box);
    const countText = span('', jump);
    countText.attr.add({ 'aria-hidden': 'true' });
    this.controls.add(sizeGroup, sizeList, info, steps.first, steps.previous, pages, jump, steps.next, steps.last);
    this.parts = { sizeGroup, info, steps, pages, jump, pageText, countText };
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
      const compact = this.compact;
      const shows = grid.showsPager();
      // Named after the grid too: two paged grids on a page are two landmarks.
      put(this, 'aria-label', s.get('pagerLabel') || `${t('gridPager')}: ${host.gridLabel()}`);
      put(this, 'data-look', compact ? 'compact' : 'full');
      mark(this, 'hidden', !shows);
      this.hidden = !shows;

      const sizesShown = s.get('pageSizeSelector') && grid.pageSizes().length > 0;
      kept(parts.sizeGroup, sizesShown && !compact);
      put(parts.sizeGroup, 'aria-label', t('gridPageSize'));
      this.drawSizes();
      const list = this.sizeList!;
      kept(list, sizesShown && compact);
      list.label = t('gridPageSize');
      const items = this.sizeItems();
      if (list.items.length !== items.length || list.items.some((item, i) => item !== items[i])) list.items = items;
      handOver(list, grid.pageSize as number | null);

      // Hidden, not taken away, in the compact look: its text stays readable.
      kept(parts.info, s.get('pagerInfo'));
      mark(parts.info, 'hidden', compact);
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

      kept(parts.pages, !compact);
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
        this.fit();
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
    const order: Button[] = [];
    for (const value of list) {
      let button = this.sizeButtons.get(value);
      if (!button) {
        button = new Button({ toggle: true });
        button.class.add('mx-data-grid__page-size');
        button.motif.on('click', () => {
          this.host.setPageSize(value);
          // The button turned itself on or off before this listener: drawn again, it shows the size in use.
          this.drawSizes();
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
      order.push(button);
    }
    orderControls(group, order);
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
    const order: ComponentBase[] = [];
    for (const p of items) {
      let part = this.pageParts.get(p.key);
      if (!part) {
        if (p.gap) {
          const gap = loose<HTMLSpanElement>('span', 'mx-data-grid__page-gap');
          gap.attr.add({ 'aria-hidden': 'true' });
          text(gap, '…');
          part = gap;
        } else {
          const button = new Button({});
          button.class.add('mx-data-grid__page');
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
        put(part, 'aria-label', grid.text('gridPageButton', { page: count(p.page + 1) }));
        put(part, 'aria-current', current ? 'page' : null);
      }
      order.push(part);
    }
    orderControls(pages, order);
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
    return own ? fillTemplate(own, values) : grid.text('gridPageOf', { page, count: pages, total: this.host.total() });
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
  private stepIcon(twice: boolean): Component<HTMLSpanElement> {
    const icon = loose<HTMLSpanElement>('span', 'mx-data-grid__step-icon');
    icon.controls.add(chevronDown());
    if (twice) icon.controls.add(chevronDown());
    return icon;
  }
}
