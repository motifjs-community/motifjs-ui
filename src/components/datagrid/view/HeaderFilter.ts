import { Component, type ComponentBase } from '@motifx/core';
import { clearParts, loose, part, removePart } from '../../../core/draw-parts';
import { css, put, text } from '../../../core/part-writes';
import { Button } from '../../button/Button';
import { CheckBox } from '../../checkbox/CheckBox';
import { ListBox } from '../../listbox/ListBox';
import { TreeView } from '../../treeview/TreeView';
import { Popup } from '../../../parts/popup/Popup';
import type { GridFilterValue } from '../grid-filter-value';
import { BLANK_NODE } from '../model/FilterValues';
import type { FilterTreeNode } from '../model/filter-tree-node';
import type { GridModel } from '../model/GridModel';
import type { ValueList } from '../model/value-list';

/**
 * The header filter: a window next to the header with the column's values in the kit's `ListBox`
 * (a search box, "Select all", a check box per value with its count; long lists load and draw only
 * where they scroll) and Apply / Cancel. The chosen values filter the column (any of them); none,
 * or all of them, take the column's value filter away. A column grouped into date parts or ranges
 * in more than one level shows the kit's `TreeView` with check boxes instead (year → month → day …),
 * "Select all" above it. Choosing every value of the list and then leaving some out
 * keeps the left-out ones (`filterType: 'exclude'`), so values that come later are kept too.
 */
export class HeaderFilter<T> {
  private popup: Popup | null = null;
  private body: Component<HTMLDivElement> | null = null;
  private list: ListBox<GridFilterValue, unknown> | null = null;
  private values: ValueList | null = null;
  private treeView: TreeView<FilterTreeNode> | null = null;
  private all: CheckBox | null = null;
  private nodes: FilterTreeNode[] = [];
  private loading: AbortController | null = null;
  private note: ComponentBase | null = null;
  private field = '';
  /** The list leaves out what is not chosen (every value was chosen, then some taken away). */
  private excluding = false;

  constructor(
    private readonly model: GridModel<T>,
    private readonly owner: ComponentBase,
  ) {}

  get opened(): boolean {
    return !!this.popup?.isOpen;
  }

  /** The list of the open window, for tests and the grid. */
  get listBox(): ListBox<GridFilterValue, unknown> | null {
    return this.list;
  }

  /** The tree of the open window (date parts, ranges in levels), for tests and the grid. */
  get tree(): TreeView<FilterTreeNode> | null {
    return this.treeView;
  }

  /** The column of the open window. */
  get column(): string {
    return this.opened ? this.field : '';
  }

  /** Opens the window for `field` next to `anchor`; focus goes back to `returnTo` when it closes. */
  open(field: string, anchor: ComponentBase, returnTo: ComponentBase) {
    const model = this.model;
    const popup = this.popup ?? this.create();
    this.release();
    this.field = field;
    const title = model.columns.title(field);
    put(popup, 'aria-label', model.text('gridFilterFor', { title }));
    const filter = model.filters.get(field);
    this.excluding = filter?.filterType === 'exclude';
    if (model.values.kind(field) === 'tree') this.openTree(field, title);
    else this.openList(field, title);
    popup.open(anchor, { toggle: anchor, returnFocus: returnTo });
    this.list?.focus();
  }

  close() {
    this.popup?.close('code');
  }

  /** Applies the chosen values: none, or every one of them, is no value filter. */
  async apply(): Promise<void> {
    if (this.treeView) {
      this.applyTree();
      return;
    }
    const list = this.list;
    const values = this.values;
    if (!list || !values) return;
    const field = this.field;
    const chosen = (Array.isArray(list.value) ? list.value : []) as unknown[];
    const total = values.source.total;
    const everything = !list.listItems.searchText && total !== undefined && chosen.length >= total;
    if (!chosen.length || everything) {
      this.model.filters.clear(field, 'values');
      this.close();
      return;
    }
    if (!this.excluding) {
      this.model.setFilterValues(field, chosen.map((v) => values.toValue(v)), 'include');
      this.close();
      return;
    }
    const taken = new Set(chosen);
    const left = (await values.all()).filter((v) => !taken.has(v));
    this.model.setFilterValues(field, left.map((v) => values.toValue(v)), 'exclude');
    this.close();
  }

  private openList(field: string, title: string) {
    const model = this.model;
    const values = model.values.list(field);
    this.values = values;
    const kept = model.filters.get(field)?.values ?? [];
    const entries = () => kept.map((v) => values.toEntry(v)).filter((v) => v !== undefined);
    const list = new ListBox<GridFilterValue, unknown>({
      label: model.text('gridFilterFor', { title }),
      labelMode: 'hidden',
      selectionMode: 'multiple',
      selectAll: true,
      searchEnabled: model.values.searchable(field),
      dataSource: values.source,
      textField: 'text',
      valueField: 'value',
      height: Math.max(1, Math.floor(model.settings.get('headerFilterRows'))),
      value: this.excluding ? [] : entries(),
      itemTemplate: (item, place) => this.drawItem(item, place),
      // Every value chosen: what is taken away next is omitted; none chosen: what is chosen next is kept.
      onValueChanged: (e) => {
        if (!e.byUser) return;
        const chosen = Array.isArray(e.value) ? e.value.length : 0;
        const total = values.source.total;
        if (!chosen) this.excluding = false;
        else if (!list.listItems.searchText && total !== undefined && chosen >= total) this.excluding = true;
      },
    });
    this.list = list;
    this.body!.controls.add(list);
    // Entries of the column's own are known once they came; leaving values out, every value but those starts chosen.
    if (!this.excluding && entries().length < kept.length) {
      void values.all().then(() => {
        if (this.list === list) list.value = entries();
      });
    } else if (this.excluding) {
      const left = new Set(kept.map((v) => values.toEntry(v)));
      void values.all().then((all) => {
        if (this.list === list) list.value = all.filter((v) => !left.has(v));
      });
    }
  }

  private openTree(field: string, title: string) {
    const model = this.model;
    const label = model.text('gridFilterFor', { title });
    const all = new CheckBox({
      label: () => model.text('selectAll'),
      size: 'sm',
      onValueChanged: (e) => {
        if (!e.byUser || !this.treeView) return;
        if (e.value) this.treeView.checkAll();
        else this.treeView.uncheckAll();
        this.showAll();
      },
    });
    all.class.add('mx-data-grid__values-all');
    const tree = new TreeView<FilterTreeNode>({
      label,
      items: [],
      keyField: 'id',
      textField: 'text',
      childrenField: 'children',
      showCheckBoxes: true,
      checkRecursive: true,
      size: 'sm',
      itemTemplate: (item, place) => this.drawItem(item, place),
      onCheckChanged: () => this.showAll(),
    });
    tree.class.add('mx-data-grid__values-tree');
    css(tree, '--_rows', String(Math.max(1, Math.floor(model.settings.get('headerFilterRows')))));
    const notePart = loose<HTMLDivElement>('div', 'mx-data-grid__values-note');
    notePart.attr.add({ role: 'status' });
    text(notePart, model.text('loading'));
    this.all = all;
    this.treeView = tree;
    this.note = notePart;
    this.body!.controls.add(all, tree);
    // Turned on once the tree is built, its search box goes above the rows.
    tree.searchEnabled = model.values.searchable(field);
    this.body!.controls.add(notePart);
    const controller = new AbortController();
    this.loading = controller;
    model.values.tree(field, controller.signal).then(
      (nodes) => {
        if (this.treeView !== tree) return;
        this.loading = null;
        removePart(notePart);
        if (this.note === notePart) this.note = null;
        this.nodes = nodes;
        tree.items = nodes;
        tree.checkedKeys = this.checkedOf(nodes);
        this.showAll();
        tree.focus();
      },
      () => {
        if (this.treeView !== tree || controller.signal.aborted) return;
        this.loading = null;
        text(notePart, model.text('loadFailed'));
      },
    );
  }

  /** The nodes to check for the column's filter: its values (and what is under them), or every node but those it leaves out. */
  private checkedOf(nodes: readonly FilterTreeNode[]): string[] {
    const filter = this.model.filters.get(this.field);
    const kept = new Set((filter?.values ?? []).map((v) => (v === null || v === undefined ? BLANK_NODE : String(v))));
    if (!kept.size) return [];
    const out: string[] = [];
    const walk = (list: readonly FilterTreeNode[], inside: boolean) => {
      for (const node of list) {
        const listed = kept.has(node.id);
        if (this.excluding ? !listed && !node.children : inside || listed) out.push(node.id);
        if (node.children && !(this.excluding && listed)) walk(node.children, inside || listed);
      }
    };
    walk(nodes, false);
    return out;
  }

  /** The tree's choice: its fully checked nodes, the highest ones (a year, not each of its days). */
  private applyTree() {
    const tree = this.treeView;
    if (!tree) return;
    const checked = new Set(tree.checkedKeys);
    const chosen: unknown[] = [];
    let left = false;
    const walk = (list: readonly FilterTreeNode[]) => {
      for (const node of list) {
        if (checked.has(node.id)) chosen.push(node.value);
        else {
          left = true;
          if (node.children) walk(node.children);
        }
      }
    };
    walk(this.nodes);
    if (!chosen.length || !left) this.model.filters.clear(this.field, 'values');
    else this.model.setFilterValues(this.field, chosen, 'include');
    this.close();
  }

  /** "Select all" shows whether every node, none or some are checked. */
  private showAll() {
    const tree = this.treeView;
    const all = this.all;
    if (!tree || !all) return;
    const checked = new Set(tree.checkedKeys);
    const roots = this.nodes;
    const every = roots.length > 0 && roots.every((n) => checked.has(n.id));
    all.value = every ? true : checked.size ? null : false;
  }

  private drawItem(item: GridFilterValue | FilterTreeNode, place: ComponentBase) {
    text(part(place, 'span', 'mx-data-grid__value-text'), item.text ?? '');
    if (item.count !== undefined) text(part(place, 'span', 'mx-data-grid__value-count'), this.model.formatter.count(item.count));
    // The parts go when the list lets the row go; a row already disposed took them along.
    return () => {
      if (!place.isDisposed) clearParts(place);
    };
  }

  private create(): Popup {
    const model = this.model;
    const popup = new Popup();
    popup.placement = 'bottom-start';
    popup.matchWidth = false;
    popup.class.add('mx-data-grid__values');
    popup.attr.add({ role: 'dialog' });
    const body = new Component<HTMLDivElement>('div');
    body.class.add('mx-data-grid__values-list');
    const bar = new Component<HTMLDivElement>('div');
    bar.class.add('mx-data-grid__values-bar');
    const apply = new Button({ text: () => model.text('gridApply'), tone: 'accent', onclick: () => void this.apply() });
    const dismiss = new Button({ text: () => model.text('cancel'), onclick: () => this.close() });
    apply.class.add('mx-data-grid__apply');
    dismiss.class.add('mx-data-grid__dismiss');
    bar.controls.add(apply, dismiss);
    popup.controls.add(body, bar);
    this.owner.controls.add(popup);
    popup.onClosed(() => this.release());
    this.popup = popup;
    this.body = body;
    return popup;
  }

  /** The list or the tree and its values go when the window closes; the next opening asks again. */
  private release() {
    const list = this.list;
    const values = this.values;
    const tree = this.treeView;
    const all = this.all;
    this.loading?.abort();
    this.loading = null;
    removePart(this.note);
    this.note = null;
    this.list = null;
    this.values = null;
    this.treeView = null;
    this.all = null;
    this.nodes = [];
    if (list && !list.isDisposed) void list.dispose();
    if (tree && !tree.isDisposed) void tree.dispose();
    if (all && !all.isDisposed) void all.dispose();
    if (values) {
      const source = values.source;
      const adapter = source.adapter;
      source.dispose();
      adapter.dispose();
    }
  }
}
