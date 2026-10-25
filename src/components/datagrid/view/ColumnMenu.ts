import { read, type ComponentBase } from '@motifx/core';
import { MenuList } from '../../../parts/menu/MenuList';
import type { MenuItem } from '../../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../../parts/menu/menu-item-click-event-args';
import { Popup } from '../../../parts/popup/Popup';
import type { ColumnFeatures } from '../column-features';
import type { GridModel } from '../model/GridModel';
import type { HeaderHost } from './header-host';

/** Items of the column list: choosing one keeps the menu open. */
const KEEP_OPEN = Symbol('keep open');

/**
 * The column menu, a kit `MenuList` in a `Popup`: sort, the header filter and clearing the column's
 * filter, pin, fit, move, resize, hide, the list of columns (a submenu; also opened alone from the
 * toolbar) and reset, each shown only while its feature is on for the column. Every item
 * follows the grid's state while the menu is open.
 */
export class ColumnMenu<T> {
  readonly popup: Popup;
  readonly list: MenuList;
  /** The header the menu was opened for. */
  private anchor: HTMLElement | null = null;

  constructor(
    private readonly grid: GridModel<T>,
    private readonly host: HeaderHost,
    owner: ComponentBase,
  ) {
    const popup = new Popup();
    popup.placement = 'bottom-end';
    popup.matchWidth = false;
    popup.element.classList.add('mx-data-grid__menu');
    const list = new MenuList();
    list.source = owner;
    popup.controls.add(list);
    owner.controls.add(popup);
    list.onChosen((e) => this.chosen(e));
    // Tab closes the menu and gives focus back to the header.
    popup.element.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      popup.close('code');
    });
    this.popup = popup;
    this.list = list;
  }

  get opened(): boolean {
    return this.popup.isOpen;
  }

  /** Opens the menu of `field` under `anchor`; focus goes back to `returnTo` when it closes. */
  open(field: string, anchor: HTMLElement, returnTo: HTMLElement) {
    this.anchor = returnTo;
    this.list.element.setAttribute('aria-label', this.grid.text('gridColumnMenu', { title: this.grid.columns.title(field) }));
    this.list.setItems(this.items(field));
    this.popup.open(anchor, { toggle: anchor, returnFocus: returnTo });
    this.list.focusItem('first');
  }

  /** Opens only the list of columns under `anchor` (the toolbar's button); focus goes back to it. */
  openColumns(anchor: HTMLElement) {
    this.anchor = anchor;
    this.list.element.setAttribute('aria-label', this.grid.text('gridColumnChooser'));
    this.list.setItems(this.columnItems());
    this.popup.open(anchor, { toggle: anchor, returnFocus: anchor });
    this.list.focusItem('first');
  }

  /** Whether the list of columns would have a column the user can hide. Reactive. */
  hasColumns(): boolean {
    const cols = this.grid.columns;
    let any = false;
    for (const f of cols.state.order) any = (!cols.isInternal(f) && cols.can(f, 'hideable')) || any;
    return this.grid.settings.get('columnChooser') && any;
  }

  close() {
    this.popup.close('code');
  }

  /** Whether the menu of `field` would have anything in it. */
  hasEntries(field: string): boolean {
    let any = false;
    for (const item of this.items(field)) any = read(item.visible) !== false || any;
    return any;
  }

  /** The list of columns: a check item per data column, which shows or hides it and keeps the menu open. */
  private columnItems(): MenuItem[] {
    const { grid } = this;
    const cols = grid.columns;
    return cols.state.order
      .filter((f) => !cols.isInternal(f))
      .map((f) => ({
        text: () => cols.title(f),
        checked: () => !cols.state.hidden[f],
        enabled: () => cols.can(f, 'hideable') && (!!cols.state.hidden[f] || cols.visibleData().length > 1),
        data: KEEP_OPEN,
        click: () => {
          this.hide(f, !cols.state.hidden[f]);
          grid.layoutChanged();
        },
      }));
  }

  private hide(field: string, hidden: boolean) {
    const { grid } = this;
    grid.columns.setHidden(field, hidden);
    grid.keepActiveFieldVisible();
    grid.announce(grid.text(hidden ? 'gridColumnHidden' : 'gridColumnShown', { title: grid.columns.title(field) }));
  }

  private chosen(e: MenuItemClickEventArgs) {
    if (e.item.data !== KEEP_OPEN) this.popup.close('code');
    e.item.click?.(e);
  }

  /** The items of the menu of `field`, in groups; an item whose feature is off is not visible. */
  private items(field: string): MenuItem[] {
    const { grid } = this;
    const cols = grid.columns;
    const t = (key: Parameters<typeof grid.text>[0]) => () => grid.text(key);
    const can = (feature: keyof ColumnFeatures) => () => cols.can(field, feature);
    const done = (fn: () => void) => () => {
      fn();
      grid.layoutChanged();
    };
    const sorted = () => grid.sortOf(field);
    const only = () => grid.state.sort.length === 1;
    const sticky = () => cols.state.sticky[field] ?? null;
    const sort = (dir: 'asc' | 'desc' | null) => () => {
      grid.setSort(dir ? [{ field, dir }] : [], true);
      grid.announceSort(field, dir);
    };

    const groups: MenuItem[][] = [
      [
        { text: t('gridSortAscending'), visible: can('sortable'), enabled: () => !(sorted()?.dir === 'asc' && only()), click: sort('asc') },
        { text: t('gridSortDescending'), visible: can('sortable'), enabled: () => !(sorted()?.dir === 'desc' && only()), click: sort('desc') },
        { text: t('gridClearSort'), visible: can('sortable'), enabled: () => !!sorted(), click: sort(null) },
      ],
      [
        { text: t('gridFilterValues'), visible: () => grid.hasHeaderFilter(field), click: () => this.host.openHeaderFilter(field, this.anchor ?? document.body) },
        { text: t('gridClearFilter'), visible: () => grid.filters.isActive(field), click: () => grid.filters.clear(field) },
      ],
      [
        { text: t('gridPinStart'), visible: can('pinnable'), enabled: () => sticky() !== 'start', click: done(() => cols.setSticky(field, 'start')) },
        { text: t('gridPinEnd'), visible: can('pinnable'), enabled: () => sticky() !== 'end', click: done(() => cols.setSticky(field, 'end')) },
        { text: t('gridUnpin'), visible: can('pinnable'), enabled: () => sticky() !== null, click: done(() => cols.setSticky(field, null)) },
      ],
      [
        { text: t('gridAutoSize'), visible: can('resizable'), click: done(() => this.host.autoSize(field)) },
        { text: t('gridAutoSizeAll'), visible: () => cols.canAny('resizable'), click: done(() => this.host.autoSizeAll()) },
        {
          text: t('gridMoveColumn'),
          visible: can('movable'),
          enabled: () => {
            const [lo, hi] = cols.moveRange(field);
            return lo !== hi;
          },
          click: () => this.host.startAdjust('move', field),
        },
        { text: t('gridResizeColumn'), visible: can('resizable'), click: () => this.host.startAdjust('resize', field) },
        { text: t('gridHideColumn'), visible: can('hideable'), enabled: () => cols.visibleData().length > 1, click: done(() => this.hide(field, true)) },
      ],
      [
        { text: t('gridColumns'), visible: () => this.hasColumns(), items: () => this.columnItems() },
      ],
      [{ text: t('gridResetLayout'), visible: () => grid.settings.get('layoutReset'), click: () => grid.resetLayout() }],
    ];
    // A line before the first item that shows in each group after the first one that shows.
    const firstShown = (group: MenuItem[]) => group.find((item) => read(item.visible) !== false);
    const items: MenuItem[] = [];
    groups.forEach((group) => {
      for (const item of group) {
        items.push({
          ...item,
          beginGroup: () => {
            const at = groups.indexOf(group);
            let before = false;
            for (let g = 0; g < at; g++) before = !!firstShown(groups[g]) || before;
            return before && firstShown(group) === item;
          },
        });
      }
    });
    return items;
  }
}
