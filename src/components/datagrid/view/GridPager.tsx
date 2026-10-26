import { Component, reactive, untracked } from '@motifx/core';
import { chevronDown } from '../../../core/glyphs';
import { fillTemplate } from '../../../core/fill-template';
import { Button } from '../../button/Button';
import { DropDown } from '../../dropdown/DropDown';
import { NumberBox } from '../../numberbox/NumberBox';
import type { GridModel } from '../model/GridModel';
import type { PagerHost } from './pager-host';

type PageItem = { key: string; page: number; gap: boolean };
/** A page size; `on` is its button's pressed state, two-way: pressing it shows that many rows. */
type SizeItem = { key: string; value: number; text: () => string; on: boolean };

/**
 * The pager under the rows of a paged grid: the page sizes, "Page 3 of 12 (250 items)", the first,
 * previous, next and last buttons and a button per page around the current one. The compact look
 * has a box for the page number and a drop-down of the page sizes instead; the adaptive look is
 * compact while the full one does not fit in the bar. Its items are kept while they stay, so focus
 * stays on a button that was pressed.
 */
export class GridPager<T> extends Component<HTMLElement> {
  /** The drop-down of the page sizes and the page number box of the compact look. */
  sizeList: DropDown<SizeItem, number> | null = null;
  pageBox: NumberBox | null = null;
  /** `narrow`: the full pager does not fit (adaptive); `pressed` grows with each press of a size, so its button shows the size again. */
  private readonly look = reactive({ narrow: false, pressed: 0 });
  /** The width the full pager needed when it was last drawn. */
  private fullWidth = 0;
  private readonly pages = new Map<string, PageItem>();
  private readonly sizes = new Map<number, SizeItem>();

  constructor(
    private readonly grid: GridModel<T>,
    private readonly host: PagerHost,
  ) {
    super('nav');
  }

  /** Whether the compact look shows now. Reactive. */
  get compact(): boolean {
    const mode = this.grid.settings.get('pagerDisplayMode');
    return mode === 'compact' || (mode === 'adaptive' && this.look.narrow);
  }

  override onConfigured() {
    const { grid } = this;
    this.class.add('mx-data-grid__pager');
    this.attr.add({
      // Named after the grid too: two paged grids on a page are two landmarks.
      'aria-label': () => grid.settings.get('pagerLabel') || `${grid.text('gridPager')}: ${this.host.gridLabel()}`,
      'data-look': () => (this.compact ? 'compact' : 'full'),
      hidden: () => (grid.showsPager() ? null : ''),
    });
    // Another page count, other sizes or another look: whether the full pager fits is seen again.
    this.bindings.watch(() => {
      void this.pageItems().length;
      void grid.pageSizes().length;
      void grid.settings.get('pageSizeSelector');
      void grid.settings.get('pagerInfo');
      void grid.showsPager();
      void this.compact;
      untracked(() => queueMicrotask(() => this.fit()));
    });
  }

  override onMounted() {
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => this.fit());
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
    if (!this.look.narrow) this.fullWidth = el.scrollWidth;
    const narrow = room > 0 && this.fullWidth > room;
    if (narrow !== this.look.narrow) this.look.narrow = narrow;
  }

  override view() {
    const { grid, host } = this;
    const st = grid.state;
    const s = grid.settings;
    const t = (key: Parameters<typeof grid.text>[0], values?: Record<string, unknown>) => grid.text(key, values);
    const count = (n: number) => grid.formatter.count(n);
    const last = () => grid.pageCount() - 1;
    const sizesShown = () => s.get('pageSizeSelector') && grid.pageSizes().length > 0;
    return (
      <>
        <div class="mx-data-grid__page-sizes" role="group" aria-label={() => t('gridPageSize')} x-display={() => sizesShown() && !this.compact}>
          {this.sizeItems().map((item) => (
            <Button
              key={item.key}
              class="mx-data-grid__page-size"
              text={item.text}
              size="sm"
              toggle
              x-model={() => item.on}
              variant={() => (grid.pageSize === item.value ? 'solid' : 'ghost')}
              tone={() => (grid.pageSize === item.value ? 'accent' : 'standard')}
            />
          ))}
        </div>
        <DropDown
          class="mx-data-grid__page-size-list"
          ref={(c: DropDown<SizeItem, number>) => (this.sizeList = c)}
          x-display={() => sizesShown() && this.compact}
          data-in-pager=""
          size="sm"
          labelMode="hidden"
          label={() => t('gridPageSize')}
          items={() => this.sizeItems()}
          value={() => grid.pageSize}
          onValueChanged={(e) => {
            if (e.byUser && typeof e.value === 'number') host.setPageSize(e.value);
          }}
        />
        {/* Hidden, not taken away, in the compact look: its text stays readable. */}
        <span class="mx-data-grid__page-info" x-display={() => s.get('pagerInfo')} hidden={() => this.compact}>
          {() => this.info()}
        </span>
        <Button
          class="mx-data-grid__page-step"
          visible={() => s.get('pagerNavigation')}
          data-step="first"
          icon={() => this.stepIcon(true)}
          hint={() => t('gridFirstPage')}
          size="sm"
          variant="ghost"
          enabled={() => st.page > 0}
          onclick={() => host.goTo(0)}
        />
        <Button
          class="mx-data-grid__page-step"
          visible={() => s.get('pagerNavigation')}
          data-step="previous"
          icon={() => this.stepIcon(false)}
          hint={() => t('gridPreviousPage')}
          size="sm"
          variant="ghost"
          enabled={() => st.page > 0}
          onclick={() => host.goTo(st.page - 1)}
        />
        <span class="mx-data-grid__pages" x-display={() => !this.compact}>
          {this.pageItems().map((p) =>
            p.gap ? (
              <span key={p.key} class="mx-data-grid__page-gap" aria-hidden="true">
                …
              </span>
            ) : (
              <Button
                key={p.key}
                class="mx-data-grid__page"
                text={() => count(p.page + 1)}
                size="sm"
                variant={() => (st.page === p.page ? 'solid' : 'ghost')}
                tone={() => (st.page === p.page ? 'accent' : 'standard')}
                aria-label={() => t('gridPageButton', { page: count(p.page + 1) })}
                aria-current={() => (st.page === p.page ? 'page' : null)}
                onclick={() => host.goTo(p.page)}
              />
            ),
          )}
        </span>
        <span class="mx-data-grid__page-jump" x-display={() => this.compact}>
          <span aria-hidden="true">{() => t('gridPage')}</span>
          <NumberBox
            class="mx-data-grid__page-number"
            ref={(c: NumberBox) => (this.pageBox = c)}
            data-in-pager=""
            size="sm"
            labelMode="hidden"
            label={() => t('gridPageNumber')}
            min={1}
            max={() => grid.pageCount()}
            decimals={0}
            showSpinButtons={false}
            updateOn="change"
            selectOnFocus
            value={() => st.page + 1}
            onValueChanged={(e) => {
              if (e.byUser && typeof e.value === 'number') host.goTo(e.value - 1);
            }}
          />
          <span aria-hidden="true">{() => t('gridPageCount', { count: count(grid.pageCount()) })}</span>
        </span>
        <Button
          class="mx-data-grid__page-step"
          visible={() => s.get('pagerNavigation')}
          data-step="next"
          icon={() => this.stepIcon(false)}
          hint={() => t('gridNextPage')}
          size="sm"
          variant="ghost"
          enabled={() => st.page < last()}
          onclick={() => host.goTo(st.page + 1)}
        />
        <Button
          class="mx-data-grid__page-step"
          visible={() => s.get('pagerNavigation')}
          data-step="last"
          icon={() => this.stepIcon(true)}
          hint={() => t('gridLastPage')}
          size="sm"
          variant="ghost"
          enabled={() => st.page < last()}
          onclick={() => host.goTo(last())}
        />
      </>
    );
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

  /** The page sizes, the same item for the same size. */
  private sizeItems(): SizeItem[] {
    const grid = this.grid;
    const list = grid.pageSizes();
    for (const size of [...this.sizes.keys()]) if (!list.includes(size)) this.sizes.delete(size);
    return list.map((value) => {
      let item = this.sizes.get(value);
      if (!item) {
        const { look, host } = this;
        item = {
          key: `s${value}`,
          value,
          text: () => (value > 0 ? grid.formatter.count(value) : grid.text('gridPageSizeAll')),
          get on() {
            void look.pressed;
            return grid.pageSize === value;
          },
          set on(_pressed: boolean) {
            look.pressed++;
            host.setPageSize(value);
          },
        };
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
