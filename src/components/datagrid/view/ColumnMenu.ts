import type { ComponentBase } from '@motifx/core';
import { MenuList } from '../../../parts/menu/MenuList';
import type { MenuItem } from '../../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../../parts/menu/menu-item-click-event-args';
import { Popup } from '../../../parts/popup/Popup';
import { TreeView } from '../../treeview/TreeView';
import type { ColumnFeatures } from '../column-features';
import type { GridModel } from '../model/GridModel';
import type { ColumnNode } from './column-node';
import type { HeaderHost } from './header-host';
import { readField } from '../model/read-field';

/** Items of the column list: choosing one keeps the menu open. */
const KEEP_OPEN = Symbol('keep open');

/**
 * The column menu, a kit `MenuList` in a `Popup`: sort, grouping, the header filter and clearing the
 * column's filter, pin, fit, move, resize, hide, the list of columns (a submenu; also opened alone
 * from the toolbar) and reset, each shown only while its feature is on for the column. Every item
 * follows the grid's state while the menu is open. A band's menu pins, moves and hides the band.
 * With bands the list of columns is the kit's `TreeView` with check boxes, bands over their columns,
 * in a window of its own.
 */
export class ColumnMenu<T> {
  readonly popup: Popup;
  readonly list: MenuList;
  /** The header the menu was opened for. */
  private anchor: HTMLElement | null = null;
  private chooser: { popup: Popup; tree: TreeView<ColumnNode> } | null = null;

  constructor(
    private readonly grid: GridModel<T>,
    private readonly host: HeaderHost,
    private readonly owner: ComponentBase,
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
    return this.popup.isOpen || !!this.chooser?.popup.isOpen;
  }

  /** The tree of the column chooser while it is open (with bands), for tests and the grid. */
  get tree(): TreeView<ColumnNode> | null {
    return this.chooser?.popup.isOpen ? this.chooser.tree : null;
  }

  /**
   * Opens the menu of a column or band under `anchor`; focus goes back to `returnTo` when it
   * closes. `prepare` may change the items, or return `null` to open nothing.
   */
  open(field: string, anchor: HTMLElement, returnTo: HTMLElement, prepare: (items: MenuItem[]) => MenuItem[] | null = (items) => items) {
    const items = prepare(this.items(field));
    if (!items) return;
    this.anchor = returnTo;
    this.list.element.setAttribute('aria-label', this.grid.text('gridColumnMenu', { title: this.grid.columns.title(field) }));
    this.list.setItems(items);
    this.popup.open(anchor, { toggle: anchor, returnFocus: returnTo });
    this.list.focusItem('first');
  }

  /** Opens only the list of columns under `anchor` (the toolbar's button); focus goes back to it. */
  openColumns(anchor: HTMLElement) {
    if (this.grid.columns.hasBands) {
      this.openTree(anchor);
      return;
    }
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
    this.chooser?.popup.close('code');
  }

  /** Whether the menu of a column or band would have anything in it. */
  hasEntries(field: string): boolean {
    let any = false;
    for (const item of this.items(field)) any = readField(item, 'visible') !== false || any;
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
        enabled: () => cols.can(f, 'hideable') && (!!cols.state.hidden[f] || cols.listedData().length > 1),
        data: KEEP_OPEN,
        click: () => {
          this.hide(f, !cols.state.hidden[f]);
          grid.layoutChanged();
        },
      }));
  }

  /** The column chooser with bands: the columns as a tree, a check box each, in a window under `anchor`. */
  private openTree(anchor: HTMLElement) {
    const { grid } = this;
    if (this.popup.isOpen) this.popup.close('code');
    const chooser = this.chooser ?? this.makeChooser();
    chooser.tree.items = this.nodes(null);
    chooser.tree.expandedKeys = [...grid.columns.bands.keys()];
    chooser.tree.checkedKeys = this.shownLeaves();
    chooser.popup.open(anchor, { toggle: anchor, returnFocus: anchor });
    chooser.tree.focus();
  }

  private makeChooser(): { popup: Popup; tree: TreeView<ColumnNode> } {
    const { grid } = this;
    const popup = new Popup();
    popup.placement = 'bottom-end';
    popup.matchWidth = false;
    popup.element.classList.add('mx-data-grid__menu', 'mx-data-grid__chooser');
    const tree: TreeView<ColumnNode> = new TreeView<ColumnNode>({
      label: () => grid.text('gridColumnChooser'),
      items: [],
      keyField: 'id',
      textField: 'text',
      childrenField: 'children',
      enabledField: 'enabled',
      showCheckBoxes: true,
      checkRecursive: true,
      size: 'sm',
      onCheckChanged: (e) => {
        if (e.byUser) this.choose(e.keys, tree);
      },
    });
    popup.controls.add(tree);
    this.owner.controls.add(popup);
    popup.element.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      popup.close('code');
    });
    this.chooser = { popup, tree };
    return this.chooser;
  }

  /** The columns and bands in a band (or at the top), as the tree shows them. */
  private nodes(parent: string | null): ColumnNode[] {
    const cols = this.grid.columns;
    return cols.childrenOf(parent).map((id) => ({
      id,
      text: cols.title(id),
      enabled: cols.can(id, 'hideable'),
      children: cols.isBand(id) ? this.nodes(id) : undefined,
    }));
  }

  /** The data columns the user shows: not hidden, nor in a hidden band. */
  private shownLeaves(): string[] {
    const cols = this.grid.columns;
    return cols.state.order.filter((f) => !cols.isInternal(f) && !cols.state.hidden[f] && !cols.inHiddenBand(f));
  }

  /** What the tree's check boxes say: the columns checked show (with their bands), the others hide; the last shown one stays. */
  private choose(keys: readonly unknown[], tree: TreeView<ColumnNode>) {
    const { grid } = this;
    const cols = grid.columns;
    const on = new Set(keys);
    const leaves = cols.state.order.filter((f) => !cols.isInternal(f) && cols.can(f, 'hideable'));
    let changed = false;
    // Shown first, so the last shown column is not taken away before another shows.
    for (const f of leaves) {
      if (!on.has(f)) continue;
      for (let up = cols.bandOf(f); up; up = cols.bandOf(up)) changed = cols.setHidden(up, false) || changed;
      changed = cols.setHidden(f, false) || changed;
    }
    for (const f of leaves) if (!on.has(f)) changed = cols.setHidden(f, true) || changed;
    grid.keepActiveFieldVisible();
    tree.checkedKeys = this.shownLeaves();
    if (changed) grid.layoutChanged();
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

  /** The items of the menu of a column or band, in groups; an item whose feature is off is not visible. */
  private items(field: string): MenuItem[] {
    const { grid } = this;
    const cols = grid.columns;
    const t = (key: Parameters<typeof grid.text>[0]) => () => grid.text(key);
    const can = (feature: keyof ColumnFeatures) => () => cols.can(field, feature);
    const done = (fn: () => void) => () => {
      fn();
      grid.layoutChanged();
    };
    const band = cols.isBand(field);
    // A column in a band is pinned with its band.
    const top = () => cols.topOf(field);
    const pinnable = () => cols.can(field, 'pinnable') && cols.can(top(), 'pinnable');
    const sticky = () => cols.state.sticky[top()] ?? null;
    const sorted = () => grid.sortOf(field);
    const only = () => grid.state.sort.length === 1;
    // A grouped column's sort is the order of its groups.
    const grouped = () => !band && grid.groups.isGrouped(field);
    const sort = (dir: 'asc' | 'desc' | null) => () => {
      if (grouped()) {
        if (dir && dir !== grid.groups.dirOf(field)) grid.toggleGroupOrder(field);
        return;
      }
      grid.setSort(dir ? [{ field, dir }] : [], true);
      grid.announceSort(field, dir);
    };
    const columns: MenuItem = cols.hasBands
      ? { text: t('gridColumns'), visible: () => this.hasColumns(), click: () => this.openTree(this.anchor ?? document.body) }
      : { text: t('gridColumns'), visible: () => this.hasColumns(), items: () => this.columnItems() };
    const pins: MenuItem[] = [
      { text: t('gridPinStart'), visible: pinnable, enabled: () => sticky() !== 'start', click: done(() => cols.setSticky(field, 'start')) },
      { text: t('gridPinEnd'), visible: pinnable, enabled: () => sticky() !== 'end', click: done(() => cols.setSticky(field, 'end')) },
      { text: t('gridUnpin'), visible: pinnable, enabled: () => sticky() !== null, click: done(() => cols.setSticky(field, null)) },
    ];
    const moveItem: MenuItem = {
      text: t('gridMoveColumn'),
      visible: can('movable'),
      enabled: () => {
        const [lo, hi] = cols.moveRange(field);
        return lo !== hi;
      },
      click: () => this.host.startAdjust('move', field),
    };
    const hideItem: MenuItem = {
      text: t(band ? 'gridHideBand' : 'gridHideColumn'),
      visible: can('hideable'),
      enabled: () => cols.listedData().some((f) => f !== field && !cols.isUnder(f, field)),
      click: done(() => this.hide(field, true)),
    };
    const reset: MenuItem[] = [{ text: t('gridResetLayout'), visible: () => grid.settings.get('layoutReset'), click: () => grid.resetLayout() }];
    if (band) return this.grouped([pins, [moveItem, hideItem], [columns], reset]);
    return this.grouped([
      [
        { text: t('gridSortAscending'), visible: can('sortable'), enabled: () => (grouped() ? grid.groups.dirOf(field) !== 'asc' : !(sorted()?.dir === 'asc' && only())), click: sort('asc') },
        { text: t('gridSortDescending'), visible: can('sortable'), enabled: () => (grouped() ? grid.groups.dirOf(field) !== 'desc' : !(sorted()?.dir === 'desc' && only())), click: sort('desc') },
        { text: t('gridClearSort'), visible: () => cols.can(field, 'sortable') && !grouped(), enabled: () => !!sorted(), click: sort(null) },
      ],
      [
        {
          text: t('gridGroupByColumn'),
          visible: () => grid.groupMenuShown(field) && grid.groups.canGroup(field) && !grid.groups.isGrouped(field),
          enabled: () => grid.canGroupNow(field),
          click: () => {
            grid.groupBy(field, Number.MAX_SAFE_INTEGER, true);
            this.host.focusActive();
          },
        },
        { text: t('gridUngroup'), visible: () => grid.groupMenuShown(field) && grid.groups.isGrouped(field), click: () => grid.ungroup(field, true) },
        {
          text: t('gridUngroupAll'),
          visible: () => grid.groupMenuShown(field) && grid.groups.any,
          click: () => {
            grid.setGroup([], true);
            this.host.focusActive();
          },
        },
      ],
      [
        { text: t('gridFilterValues'), visible: () => grid.hasHeaderFilter(field), click: () => this.host.openHeaderFilter(field, this.anchor ?? document.body) },
        { text: t('gridClearFilter'), visible: () => grid.filters.isActive(field), click: () => grid.filters.clear(field) },
      ],
      pins,
      [
        { text: t('gridAutoSize'), visible: can('resizable'), click: done(() => this.host.autoSize(field)) },
        { text: t('gridAutoSizeAll'), visible: () => cols.canAny('resizable'), click: done(() => this.host.autoSizeAll()) },
        moveItem,
        { text: t('gridResizeColumn'), visible: can('resizable'), click: () => this.host.startAdjust('resize', field) },
        hideItem,
      ],
      [columns],
      reset,
    ]);
  }

  /** The groups' items in one list, a line before the first item that shows in each group after the first one that shows. */
  private grouped(groups: MenuItem[][]): MenuItem[] {
    const firstShown = (group: MenuItem[]) => group.find((item) => readField(item, 'visible') !== false);
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
