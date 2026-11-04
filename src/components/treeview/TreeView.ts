import { follow } from '../../core/follow';
import { onLookChanged } from '../../core/look-watch';
import { createSignal, Emitter, untracked, type Bind, type Event as MotifEvent, type IBaseProp, type Signal } from '@motifx/core';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { deepActiveElement } from '../../core/focus';
import { functionValue } from '../../core/function-value';
import { checkMark, chevronEnd, dashMark } from '../../core/glyphs';
import { iconNode } from '../../core/icon-node';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { isElement } from '../../core/node-kind';
import { uiLocale } from '../../core/ui-locale';
import type { ItemField } from '../../parts/list/item-field';
import { givenList } from '../../core/given-field';
import { sameAsWritten } from '../../parts/field/same-as-written';
import { readItemField } from '../../parts/list/read-item-field';
import { TextBox } from '../textbox/TextBox';
import type { TreeCheckState } from './tree-check-state';
import type { TreeFields } from './tree-fields';
import { TreeModel } from './TreeModel';
import type { TreeNode } from './tree-node';
import type { TreeRow } from './tree-row';
import type { TreeViewCheckChangedEventArgs } from './tree-view-check-changed-event-args';
import type { TreeViewExpandOn } from './tree-view-expand-on';
import type { TreeViewExpandedEventArgs } from './tree-view-expanded-event-args';
import type { TreeViewExpandingEventArgs } from './tree-view-expanding-event-args';
import type { TreeViewItemClickEventArgs } from './tree-view-item-click-event-args';
import type { TreeViewItemTemplate } from './tree-view-item-template';
import type { TreeViewLoadChildren } from './tree-view-load-children';
import type { TreeViewProps } from './tree-view-props';
import type { TreeViewSelectionChangedEventArgs } from './tree-view-selection-changed-event-args';
import type { TreeViewSelectionMode } from './tree-view-selection-mode';
import { onLanguage } from '../../core/on-language';
import { foldText } from '../../core/fold-text';

const OWN = [
  'items',
  'selectionMode',
  'value',
  'expandedKeys',
  'showCheckBoxes',
  'checkRecursive',
  'checkedKeys',
  'searchEnabled',
  'searchMode',
  'searchValue',
  'expandOn',
  'showLines',
  'size',
  'label',
  'virtualFrom',
] as const;

/** Props whose value may be a function of its own. */
const FUNCTIONS = [
  'textField',
  'keyField',
  'childrenField',
  'parentField',
  'iconField',
  'enabledField',
  'expandedField',
  'hasChildrenField',
  'loadChildren',
  'itemTemplate',
] as const;

const LOOK = ['size', 'showLines', 'showCheckBoxes', 'selectionMode'] as const;

/** Rows drawn above and below the visible ones in a long tree. */
const OVERSCAN = 6;
/** Typed letters join one search while they come this close together. */
const TYPING_MS = 600;
const NONE = Symbol('none');

const PARTS = Symbol('mx.treeview');

interface Parts<T> {
  model: TreeModel<T>;
  body: HTMLDivElement;
  empty: HTMLDivElement;
  search: TextBox | null;
  rows: TreeRow<T>[];
  index: Map<TreeNode<T>, number>;
  elements: Map<TreeNode<T>, HTMLElement>;
  nodes: WeakMap<Element, TreeNode<T>>;
  releases: Map<TreeNode<T>, () => void>;
  expanded: Set<unknown>;
  selected: Set<unknown>;
  checked: Set<unknown>;
  states: Map<TreeNode<T>, TreeCheckState>;
  /** While filtering: the matches and their ancestors. */
  shown: Set<TreeNode<T>> | null;
  filterText: string;
  /** While filtering, the open rows (the expanded keys stay as they were). */
  filterOpen: Set<unknown>;
  /** The `expanded` field of each item as last read, so only a change there opens or closes it. */
  fieldOpen: Map<unknown, boolean>;
  busy: Map<unknown, 'loading' | 'error'>;
  loads: Map<unknown, object>;
  /** Bumped when loaded children change: the items are read again. */
  version: Signal<number>;
  stopItems: () => void;
  watchers: (() => void)[];
  focusKey: unknown;
  anchorKey: unknown;
  windowed: boolean;
  rowHeight: number;
  frame: number;
  typed: string;
  typedAt: number;
  ready: boolean;
  /** A key list storage is being brought in step: not a value to apply. */
  syncing: boolean;
  /** The value just written to `x-model`: the bound getter may hand it back once, as the model holds it. */
  echo: { value: unknown } | null;
  expanding: Emitter<TreeViewExpandingEventArgs<T>>;
  collapsing: Emitter<TreeViewExpandingEventArgs<T>>;
  expanded$: Emitter<TreeViewExpandedEventArgs<T>>;
  collapsed$: Emitter<TreeViewExpandedEventArgs<T>>;
  selectionChanged: Emitter<TreeViewSelectionChangedEventArgs<T>>;
  checkChanged: Emitter<TreeViewCheckChangedEventArgs<T>>;
  itemClick: Emitter<TreeViewItemClickEventArgs<T>>;
}

/** A field of an object item; a primitive item has none, only a function reads one. */
function ownField<T>(item: T, field: ItemField<T> | undefined, fallback: string): unknown {
  if (typeof field !== 'function' && (item === null || typeof item !== 'object')) return undefined;
  return readItemField(item, field, fallback);
}

function sameSet(a: Set<unknown>, b: Set<unknown>): boolean {
  if (a.size !== b.size) return false;
  for (const key of a) if (!b.has(key)) return false;
  return true;
}

/**
 * Hierarchical items (the APG tree view pattern): rows open and close, are selected one or many
 * at a time, can carry tri-state check boxes, can be searched, and children can load when a row
 * is first opened. Items are nested (`children`) or flat (`parentId`), read through the `…Field`
 * props. One Tab stop; the arrow keys move, open and close. Long trees draw only the rows in view.
 *
 * @example
 * <TreeView label="Files" items={() => this.files} x-model={() => this.state.file} />
 * <TreeView items={() => this.rights} showCheckBoxes selectionMode="none" onCheckChanged={(e) => this.save(e.keys)} />
 *
 * const tree = new TreeView({ items: folders, loadChildren: (f) => api.list(f.path) });
 * tree.expand('docs');
 */
export class TreeView<T = unknown> extends Control<HTMLDivElement, TreeViewProps<T>> {
  constructor(props?: IBaseProp<TreeViewProps<T>>) {
    super('div', props);
    const own = (this.props ?? {}) as TreeViewProps<T>;
    const parts = this.parts;
    this.element.classList.add('mx-tree-view');

    for (const name of LOOK) this.observeProperty(name, () => this.renderLook());
    this.observeProperty<string | undefined>('label', (label) => {
      if (label) parts.body.setAttribute('aria-label', label);
      else parts.body.removeAttribute('aria-label');
    });
    this.observeProperty('searchEnabled', () => this.renderSearch());
    this.motif.on('x:built', () => this.placeSearch());
    this.observeProperty<string | undefined>('searchValue', (text) => {
      if (parts.search && parts.search.value !== (text ?? '')) parts.search.value = text ?? '';
      if (parts.ready) this.redraw();
    });
    this.observeProperty('selectionMode', () => {
      if (!parts.ready) return;
      this.setSelection([...parts.selected], false);
      this.renderStates();
    });
    this.observeProperty('checkRecursive', () => {
      if (parts.ready) this.checksChanged(null, false);
    });
    for (const name of ['showCheckBoxes', 'virtualFrom', 'searchMode', 'size'] as const) {
      this.observeProperty(name, () => {
        parts.rowHeight = 0;
        if (parts.ready) this.redraw();
      });
    }
    // Another design language, theme or density: the rows have another height.
    this.motif.setDisposable(
      onLookChanged(() => {
        parts.rowHeight = 0;
        if (parts.ready) this.redraw();
      }),
    );
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    for (const name of FUNCTIONS) if (own[name] !== undefined) this.bindProperty(name, functionValue(own[name]));
    if (own.onExpanding) this.onExpanding(own.onExpanding);
    if (own.onCollapsing) this.onCollapsing(own.onCollapsing);
    if (own.onExpanded) this.onExpanded(own.onExpanded);
    if (own.onCollapsed) this.onCollapsed(own.onCollapsed);
    if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);
    if (own.onCheckChanged) this.onCheckChanged(own.onCheckChanged);
    if (own.onItemClick) this.onItemClick(own.onItemClick);

    this.listen();
    // The tree follows the items, every field it reads of them and the props that say how.
    this.watchItems();
    const stopTexts = onLanguage(this, () => {
      parts.empty.textContent = uiLocale.strings.noItems;
      for (const error of parts.body.querySelectorAll<HTMLElement>('.mx-tree-view__error')) this.fillError(error);
    });
    this.takeExpanded(this.peekProperty('expandedKeys'));
    this.takeChecked(this.peekProperty('checkedKeys'));
    this.takeValue(this.peekProperty('value'));
    parts.ready = true;
    untracked(() => this.redraw());
    // Names written on the component's tag belong to the tree inside it.
    queueMicrotask(() => {
      for (const name of ['aria-label', 'aria-labelledby', 'aria-describedby']) {
        const value = this.element.getAttribute(name);
        if (value === null) continue;
        parts.body.setAttribute(name, value);
        this.element.removeAttribute(name);
      }
    });
    this.motif.setDisposable(() => {
      parts.stopItems();
      stopTexts();
      for (const stop of parts.watchers.splice(0)) stop();
      cancelAnimationFrame(parts.frame);
      parts.loads.clear();
      for (const release of parts.releases.values()) release();
      parts.releases.clear();
      for (const emitter of [parts.expanding, parts.collapsing, parts.expanded$, parts.collapsed$, parts.selectionChanged, parts.checkChanged, parts.itemClick]) {
        emitter.dispose();
      }
    });
  }

  // Properties (see TreeViewProps).

  get items(): readonly T[] {
    return this.getProperty<readonly T[] | undefined>('items') ?? [];
  }
  set items(value: Bind<readonly T[]>) {
    this.assignProperty('items', value);
  }
  get textField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('textField');
  }
  set textField(value: Bind<ItemField<T>>) {
    this.assignProperty('textField', functionValue(value));
  }
  get keyField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('keyField');
  }
  set keyField(value: Bind<ItemField<T>>) {
    this.assignProperty('keyField', functionValue(value));
  }
  get childrenField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('childrenField');
  }
  set childrenField(value: Bind<ItemField<T>>) {
    this.assignProperty('childrenField', functionValue(value));
  }
  get parentField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('parentField');
  }
  set parentField(value: Bind<ItemField<T>>) {
    this.assignProperty('parentField', functionValue(value));
  }
  get iconField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('iconField');
  }
  set iconField(value: Bind<ItemField<T>>) {
    this.assignProperty('iconField', functionValue(value));
  }
  get enabledField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('enabledField');
  }
  set enabledField(value: Bind<ItemField<T>>) {
    this.assignProperty('enabledField', functionValue(value));
  }
  get expandedField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('expandedField');
  }
  set expandedField(value: Bind<ItemField<T>>) {
    this.assignProperty('expandedField', functionValue(value));
  }
  get hasChildrenField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('hasChildrenField');
  }
  set hasChildrenField(value: Bind<ItemField<T>>) {
    this.assignProperty('hasChildrenField', functionValue(value));
  }
  get loadChildren(): TreeViewLoadChildren<T> | null {
    return this.getProperty<TreeViewLoadChildren<T> | null | undefined>('loadChildren') ?? null;
  }
  set loadChildren(value: Bind<TreeViewLoadChildren<T> | null>) {
    this.assignProperty('loadChildren', functionValue(value));
  }
  get itemTemplate(): TreeViewItemTemplate<T> | null {
    return this.getProperty<TreeViewItemTemplate<T> | null | undefined>('itemTemplate') ?? null;
  }
  set itemTemplate(value: Bind<TreeViewItemTemplate<T> | null>) {
    this.assignProperty('itemTemplate', functionValue(value));
  }
  get selectionMode(): TreeViewSelectionMode {
    return this.getProperty<TreeViewSelectionMode | undefined>('selectionMode') ?? 'single';
  }
  set selectionMode(value: Bind<TreeViewSelectionMode>) {
    this.assignProperty('selectionMode', value);
  }
  /** The selected key (`single`, `null` when none) or keys (`multiple`). Reactive. */
  get value(): unknown {
    void this.getProperty('value');
    return this.valueNow();
  }
  set value(value: Bind<unknown>) {
    const before = untracked(() => this.valueNow());
    this.assignProperty('value', value);
    // A selection set from code shows in `x-model` too, so the model and the tree never differ.
    const now = untracked(() => this.valueNow());
    if (typeof value !== 'function' && !sameAsWritten(now, before)) this.writeBack(now);
  }
  /** The selected items, in tree order. Reactive. */
  get selectedItems(): T[] {
    void this.getProperty('value');
    return this.itemsOf(this.parts.selected);
  }
  /** The open rows' keys, in tree order. Reactive. */
  get expandedKeys(): unknown[] {
    void this.getProperty('expandedKeys');
    return this.parts.model.inOrder(this.parts.expanded);
  }
  set expandedKeys(value: Bind<readonly unknown[]>) {
    this.assignProperty('expandedKeys', value);
  }
  get showCheckBoxes(): boolean {
    return !!this.getProperty<boolean>('showCheckBoxes');
  }
  set showCheckBoxes(value: Bind<boolean>) {
    this.assignProperty('showCheckBoxes', value, Boolean);
  }
  get checkRecursive(): boolean {
    return this.getProperty<boolean | undefined>('checkRecursive') !== false;
  }
  set checkRecursive(value: Bind<boolean>) {
    this.assignProperty('checkRecursive', value, Boolean);
  }
  /** The checked keys, in tree order (a parent is in it when all its children are). Reactive. */
  get checkedKeys(): unknown[] {
    void this.getProperty('checkedKeys');
    return this.parts.model.inOrder(this.parts.checked);
  }
  set checkedKeys(value: Bind<readonly unknown[]>) {
    this.assignProperty('checkedKeys', value);
  }
  /** The checked items, in tree order. Reactive. */
  get checkedItems(): T[] {
    void this.getProperty('checkedKeys');
    return this.itemsOf(this.parts.checked);
  }
  get searchEnabled(): boolean {
    return !!this.getProperty<boolean>('searchEnabled');
  }
  set searchEnabled(value: Bind<boolean>) {
    this.assignProperty('searchEnabled', value, Boolean);
  }
  get searchMode(): 'contains' | 'startswith' {
    return this.getProperty<'contains' | 'startswith' | undefined>('searchMode') ?? 'contains';
  }
  set searchMode(value: Bind<'contains' | 'startswith'>) {
    this.assignProperty('searchMode', value);
  }
  get searchValue(): string {
    return this.getProperty<string | undefined>('searchValue') ?? '';
  }
  set searchValue(value: Bind<string>) {
    this.assignProperty('searchValue', value, (v) => v ?? '');
  }
  get expandOn(): TreeViewExpandOn {
    return this.getProperty<TreeViewExpandOn | undefined>('expandOn') ?? 'expander';
  }
  set expandOn(value: Bind<TreeViewExpandOn>) {
    this.assignProperty('expandOn', value);
  }
  get showLines(): boolean {
    return !!this.getProperty<boolean>('showLines');
  }
  set showLines(value: Bind<boolean>) {
    this.assignProperty('showLines', value, Boolean);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  get label(): string {
    return this.getProperty<string | undefined>('label') ?? '';
  }
  set label(value: Bind<string>) {
    this.assignProperty('label', value);
  }
  get virtualFrom(): number {
    return this.getProperty<number | undefined>('virtualFrom') ?? 500;
  }
  set virtualFrom(value: Bind<number>) {
    this.assignProperty('virtualFrom', value, Number);
  }

  /** The element with `role="tree"`. */
  get treeElement(): HTMLDivElement {
    return this.parts.body;
  }

  // Events.

  /** A branch is about to open; `e.cancel = true` keeps it closed. */
  get onExpanding(): MotifEvent<TreeViewExpandingEventArgs<T>> {
    return this.parts.expanding.event;
  }
  /** A branch is about to close; `e.cancel = true` keeps it open. */
  get onCollapsing(): MotifEvent<TreeViewExpandingEventArgs<T>> {
    return this.parts.collapsing.event;
  }
  get onExpanded(): MotifEvent<TreeViewExpandedEventArgs<T>> {
    return this.parts.expanded$.event;
  }
  get onCollapsed(): MotifEvent<TreeViewExpandedEventArgs<T>> {
    return this.parts.collapsed$.event;
  }
  get onSelectionChanged(): MotifEvent<TreeViewSelectionChangedEventArgs<T>> {
    return this.parts.selectionChanged.event;
  }
  get onCheckChanged(): MotifEvent<TreeViewCheckChangedEventArgs<T>> {
    return this.parts.checkChanged.event;
  }
  get onItemClick(): MotifEvent<TreeViewItemClickEventArgs<T>> {
    return this.parts.itemClick.event;
  }

  // Methods.

  /** The item with this key, if the tree knows it. */
  itemOf(key: unknown): T | undefined {
    return this.parts.model.node(key)?.item;
  }

  /** Opens a row (its children load first if they have to); the cancelable event runs. */
  expand(key: unknown): boolean {
    const node = this.parts.model.node(key);
    return !!node && untracked(() => this.setOpen(node, true, false));
  }

  collapse(key: unknown): boolean {
    const node = this.parts.model.node(key);
    return !!node && untracked(() => this.setOpen(node, false, false));
  }

  /** Opens every row whose children are known (children not loaded yet are not loaded). */
  expandAll(): void {
    const parts = this.parts;
    for (const node of parts.model.walk()) if (node.children?.length) parts.expanded.add(node.key);
    this.expansionChanged();
  }

  collapseAll(): void {
    this.parts.expanded.clear();
    this.expansionChanged();
  }

  /** Selects a row from code (`multiple`: adds it to the selection). */
  select(key: unknown): void {
    const parts = this.parts;
    untracked(() => this.setSelection(this.selectionMode === 'multiple' ? [...parts.selected, key] : [key], false));
  }

  unselect(key: unknown): void {
    untracked(() => this.setSelection([...this.parts.selected].filter((k) => k !== key), false));
  }

  /** With `multiple`: every known row that can be selected. */
  selectAll(): void {
    untracked(() => this.selectAllBy(false));
  }

  clearSelection(): void {
    untracked(() => this.setSelection([], false));
  }

  check(key: unknown, checked = true): void {
    const node = this.parts.model.node(key);
    if (node) untracked(() => this.setCheck(node, checked, false));
  }

  uncheck(key: unknown): void {
    this.check(key, false);
  }

  checkAll(): void {
    const parts = this.parts;
    for (const node of parts.model.walk()) parts.checked.add(node.key);
    untracked(() => this.checksChanged(null, false));
  }

  uncheckAll(): void {
    this.parts.checked.clear();
    untracked(() => this.checksChanged(null, false));
  }

  /** Filters the rows by `text` (empty: all rows), as the search box does. */
  filter(text: string): void {
    this.searchValue = text;
  }

  /** Opens the row's parents and scrolls it into view; `false` when it is not shown (filtered out, unknown). */
  scrollTo(key: unknown): boolean {
    return untracked(() => {
      const at = this.reveal(key);
      if (at < 0) return false;
      this.scrollToRow(at);
      return true;
    });
  }

  /** Opens the row's parents, scrolls to it and focuses it. */
  focusNode(key: unknown): boolean {
    return untracked(() => {
      const at = this.reveal(key);
      if (at < 0 || !this.isEnabled) return false;
      this.focusRow(at);
      return deepActiveElement() === this.parts.elements.get(this.parts.rows[at].node);
    });
  }

  /**
   * Reads the items again after they were changed in place: which there are, their children, texts and states.
   * Children that loaded stay. Your items may be plain or reactive; the tree reads them as they are.
   */
  refresh(): void {
    const parts = this.parts;
    parts.version.value = parts.version.peek() + 1;
  }

  /** Draws one row again after its item was changed in place: its text, icon and state (`refresh` for its children). */
  refreshItem(key: unknown): void {
    untracked(() => {
      const parts = this.parts;
      const node = parts.model.node(key);
      const el = node && parts.elements.get(node);
      const at = node && parts.index.get(node);
      if (!node || !el || at === undefined) return;
      const focused = deepActiveElement() === el;
      this.forget(el);
      const fresh = this.itemElement(parts.rows[at]);
      el.replaceWith(fresh);
      this.renderRoving();
      if (focused) fresh.focus({ preventScroll: true });
    });
  }

  /** Loads a row's children again (all loaded children without a key) and reads the items again. */
  reload(key?: unknown): void {
    const parts = this.parts;
    if (key === undefined) parts.model.loaded.clear();
    else parts.model.loaded.delete(key);
    parts.busy.clear();
    parts.version.value = parts.version.peek() + 1;
  }

  /** Focuses the row Tab reaches. */
  protected override get focusElement(): HTMLElement {
    const parts = this.parts;
    const stop = this.stopNode();
    return (stop && parts.elements.get(stop)) || parts.body;
  }

  protected override applyProperty(name: string, value: unknown): void {
    if (name === 'tabStop') {
      this.renderRoving();
      return;
    }
    super.applyProperty(name, value);
    const parts = this.parts;
    if (!parts.ready || parts.syncing) return;
    // Read again now, not on the next update: `tree.items = …; tree.expand(…)` finds the new rows.
    if (name === 'items' || (FUNCTIONS as readonly string[]).includes(name)) this.watchItems();
    untracked(() => {
      if (name === 'value') {
        if (!this.isEcho(value)) this.takeValue(value);
      }
      else if (name === 'expandedKeys') {
        this.takeExpanded(value);
        this.redraw();
      } else if (name === 'checkedKeys' && !this.isChecked(value)) {
        // The keys we just reported, written back by a two-way binding, change nothing.
        this.takeChecked(value);
        this.checksChanged(null, false);
      }
    });
  }

  // State.

  private get parts(): Parts<T> {
    const self = this as unknown as { [PARTS]?: Parts<T> };
    if (!self[PARTS]) {
      const body = document.createElement('div');
      body.className = 'mx-tree-view__body';
      body.setAttribute('role', 'tree');
      const empty = document.createElement('div');
      empty.className = 'mx-tree-view__empty';
      empty.hidden = true;
      this.element.append(body, empty);
      self[PARTS] = {
        model: new TreeModel<T>(),
        body,
        empty,
        search: null,
        rows: [],
        index: new Map(),
        elements: new Map(),
        nodes: new WeakMap(),
        releases: new Map(),
        expanded: new Set(),
        selected: new Set(),
        checked: new Set(),
        states: new Map(),
        shown: null,
        filterText: '',
        filterOpen: new Set(),
        fieldOpen: new Map(),
        busy: new Map(),
        loads: new Map(),
        version: createSignal(0),
        stopItems: () => {},
        watchers: [],
        focusKey: NONE,
        anchorKey: NONE,
        windowed: false,
        rowHeight: 0,
        frame: 0,
        typed: '',
        typedAt: 0,
        ready: false,
        syncing: false,
        echo: null,
        expanding: new Emitter(),
        collapsing: new Emitter(),
        expanded$: new Emitter(),
        collapsed$: new Emitter(),
        selectionChanged: new Emitter(),
        checkChanged: new Emitter(),
        itemClick: new Emitter(),
      };
    }
    return self[PARTS]!;
  }

  private fields(): TreeFields<T> {
    return {
      key: (item) => readItemField(item, this.peekProperty<ItemField<T>>('keyField'), 'id'),
      children: (item) => ownField(item, this.peekProperty<ItemField<T>>('childrenField'), 'children'),
      parent: (item) => ownField(item, this.peekProperty<ItemField<T>>('parentField'), 'parentId'),
      hasChildren: (item) => ownField(item, this.peekProperty<ItemField<T>>('hasChildrenField'), 'hasChildren'),
    };
  }

  private textOf(item: T): string {
    return String(readItemField(item, this.peekProperty<ItemField<T>>('textField'), 'text') ?? '');
  }

  private iconOf(item: T): IconSource | undefined {
    return ownField(item, this.peekProperty<ItemField<T>>('iconField'), 'icon') as IconSource | undefined;
  }

  private enabledOf(item: T): boolean {
    return ownField(item, this.peekProperty<ItemField<T>>('enabledField'), 'enabled') !== false;
  }

  /** Changes are reported once the tree is built; what it is given before is its start. */
  private get live(): boolean {
    return this.parts.ready && this.isBuilt;
  }

  private get recursive(): boolean {
    return this.peekProperty('checkRecursive') !== false;
  }

  private itemsOf(keys: Set<unknown>): T[] {
    const model = this.parts.model;
    return model
      .inOrder(keys)
      .map((key) => model.node(key))
      .filter((node): node is TreeNode<T> => !!node)
      .map((node) => node.item);
  }

  private valueNow(): unknown {
    const parts = this.parts;
    const mode = this.peekProperty<TreeViewSelectionMode>('selectionMode') ?? 'single';
    if (mode === 'multiple') return parts.model.inOrder(parts.selected);
    if (mode === 'none') return null;
    const [first] = parts.selected;
    return first === undefined ? null : first;
  }

  private isOpen(node: TreeNode<T>): boolean {
    const parts = this.parts;
    return parts.shown ? parts.filterOpen.has(node.key) : parts.expanded.has(node.key);
  }

  /** The tree follows the items, every field it reads of them and the props that say how. */
  private watchItems(): void {
    const parts = this.parts;
    parts.stopItems();
    parts.stopItems = follow(
      this,
      'items',
      () => {
        void parts.version.value;
        return this.readItems();
      },
      (opens) => this.itemsChanged(opens),
    );
  }

  /** Reads the items and every field of them, tracked; returns the `expanded` fields. */
  private readItems(): Map<unknown, boolean> {
    const parts = this.parts;
    const items = this.items;
    for (const name of FUNCTIONS) void this.getProperty(name);
    const flat = this.peekProperty('parentField') !== undefined || givenList(items).some((item) => ownField(item, undefined, 'parentId') !== undefined);
    parts.model.read(items, this.fields(), flat, !!this.peekProperty('loadChildren'));
    return this.touch(parts.model.roots);
  }

  private touch(nodes: readonly TreeNode<T>[]): Map<unknown, boolean> {
    const opens = new Map<unknown, boolean>();
    const expandedField = this.peekProperty<ItemField<T>>('expandedField');
    // An icon function may build an element each time: it is read when the row is drawn.
    const icons = typeof this.peekProperty('iconField') !== 'function';
    for (const node of this.parts.model.walk(nodes)) {
      this.textOf(node.item);
      if (icons) this.iconOf(node.item);
      this.enabledOf(node.item);
      const open = ownField(node.item, expandedField, 'expanded');
      if (typeof open === 'boolean') opens.set(node.key, open);
    }
    return opens;
  }

  private itemsChanged(opens: Map<unknown, boolean>): void {
    const parts = this.parts;
    for (const stop of parts.watchers.splice(0)) stop();
    for (const [key, open] of opens) {
      if (parts.fieldOpen.get(key) === open) continue;
      parts.fieldOpen.set(key, open);
      if (open) parts.expanded.add(key);
      else parts.expanded.delete(key);
    }
    for (const key of parts.busy.keys()) if (!parts.loads.has(key) && parts.busy.get(key) === 'loading') parts.busy.delete(key);
    if (!parts.ready) return;
    this.redraw();
    this.syncKeys();
  }

  /** Follows the children that loaded until the next read of the items does. */
  private watch(node: TreeNode<T>): void {
    const parts = this.parts;
    let first = true;
    const stop = follow(
      this,
      'children',
      () => this.touch(node.children ?? []),
      () => {
        if (first) first = false;
        else parts.version.value = parts.version.peek() + 1;
      },
    );
    parts.watchers.push(stop);
  }

  /** Writes the selection to `x-model`, if there is one. */
  private writeBack(value: unknown): void {
    const parts = this.parts;
    if (!this.bindings.writeModel(value)) return;
    const echo = (parts.echo = { value });
    queueMicrotask(() => {
      if (parts.echo === echo) parts.echo = null;
    });
  }

  /** The value just written, handed back by a reactive model as its own copy: the selection stays. */
  private isEcho(value: unknown): boolean {
    const parts = this.parts;
    const echo = parts.echo;
    parts.echo = null;
    return !!echo && sameAsWritten(value, echo.value);
  }

  private takeValue(value: unknown): void {
    const keys = value === null || value === undefined ? [] : Array.isArray(value) ? value : [value];
    this.setSelection(keys, false, undefined, false);
  }

  private takeExpanded(value: unknown): void {
    if (Array.isArray(value)) this.parts.expanded = new Set(value);
  }

  private takeChecked(value: unknown): void {
    if (Array.isArray(value)) this.parts.checked = new Set(value);
  }

  /** Whether a key list holds exactly the keys checked now. */
  private isChecked(value: unknown): boolean {
    const checked = this.parts.checked;
    return Array.isArray(value) && value.length === checked.size && value.every((key) => checked.has(key));
  }

  /** Brings a key list's storage in step, without dropping a bound getter. */
  private sync(name: string, value: unknown): void {
    const parts = this.parts;
    parts.syncing = true;
    try {
      this.changeProperty(name, value);
    } finally {
      parts.syncing = false;
    }
  }

  private syncKeys(): void {
    const parts = this.parts;
    this.sync('expandedKeys', parts.model.inOrder(parts.expanded));
    this.sync('checkedKeys', parts.model.inOrder(parts.checked));
  }

  // Changes.

  private setOpen(node: TreeNode<T>, open: boolean, byUser: boolean, event?: Event): boolean {
    const parts = this.parts;
    if (open && !parts.model.hasChildren(node, parts.shown)) return false;
    if (this.isOpen(node) === open && parts.busy.get(node.key) !== 'error') return true;
    const e: TreeViewExpandingEventArgs<T> = { item: node.item, key: node.key, cancel: false, byUser, source: this, event };
    (open ? parts.expanding : parts.collapsing).fire(e);
    if (e.cancel) return false;
    const keys = parts.shown ? parts.filterOpen : parts.expanded;
    if (open) keys.add(node.key);
    else keys.delete(node.key);
    if (!open && parts.focusKey !== NONE) {
      for (let n = parts.model.node(parts.focusKey)?.parent; n; n = n.parent) {
        if (n === node) parts.focusKey = node.key;
      }
    }
    if (open && !node.children && node.lazy) parts.busy.delete(node.key);
    this.computeRows(false);
    this.drawBranch(node);
    if (!parts.shown) this.sync('expandedKeys', parts.model.inOrder(parts.expanded));
    if (open && !node.children && node.lazy) this.load(node);
    (open ? parts.expanded$ : parts.collapsed$).fire({ item: node.item, key: node.key, byUser, source: this });
    return true;
  }

  /** Many rows opened or closed at once: drawn again, no events per row. */
  private expansionChanged(): void {
    untracked(() => {
      this.redraw();
      this.sync('expandedKeys', this.parts.model.inOrder(this.parts.expanded));
    });
  }

  private load(node: TreeNode<T>): void {
    const parts = this.parts;
    const loader = this.peekProperty<TreeViewLoadChildren<T> | null>('loadChildren');
    if (!loader || parts.busy.get(node.key) === 'loading') return;
    const key = node.key;
    const ticket = {};
    parts.busy.set(key, 'loading');
    parts.loads.set(key, ticket);
    this.renderNode(node);
    let promise: Promise<readonly T[]>;
    try {
      promise = Promise.resolve(loader(node.item));
    } catch (error) {
      promise = Promise.reject(error);
    }
    promise.then(
      (items) => this.loaded(key, ticket, Array.isArray(items) ? items : []),
      () => this.loaded(key, ticket, null),
    );
  }

  private loaded(key: unknown, ticket: object, items: readonly T[] | null): void {
    const parts = this.parts;
    if (this.isDisposed || parts.loads.get(key) !== ticket) return;
    parts.loads.delete(key);
    const node = parts.model.node(key);
    if (items) {
      parts.busy.delete(key);
      if (node) {
        parts.model.setChildren(node, items);
        this.watch(node);
      } else {
        parts.model.loaded.set(key, items);
      }
    } else {
      parts.busy.set(key, 'error');
      parts.expanded.delete(key);
      parts.filterOpen.delete(key);
    }
    untracked(() => {
      parts.states = parts.model.checkStates(parts.checked, this.recursive);
      this.computeRows(!!parts.filterText);
      if (node) this.drawBranch(node);
      this.syncKeys();
      this.loadOpen();
    });
  }

  /** Open rows whose children are not known yet load them. */
  private loadOpen(): void {
    const parts = this.parts;
    for (const row of parts.rows) {
      const node = row.node;
      if (!node.children && node.lazy && this.isOpen(node) && !parts.busy.has(node.key)) this.load(node);
    }
  }

  private setSelection(keys: unknown[], byUser: boolean, event?: Event, write = true): void {
    const parts = this.parts;
    const mode = this.peekProperty<TreeViewSelectionMode>('selectionMode') ?? 'single';
    const next = new Set(mode === 'none' ? [] : mode === 'single' ? keys.slice(0, 1) : keys);
    if (sameSet(next, parts.selected)) return;
    parts.selected = next;
    this.renderStates();
    const value = this.valueNow();
    this.sync('value', value);
    if (write) this.writeBack(value);
    if (this.live) parts.selectionChanged.fire({ value, items: this.itemsOf(next), byUser, source: this, event });
  }

  private selectByUser(node: TreeNode<T>, event: Event, how: 'only' | 'toggle' | 'range'): void {
    const parts = this.parts;
    const mode = this.peekProperty<TreeViewSelectionMode>('selectionMode') ?? 'single';
    if (mode === 'none' || !this.enabledOf(node.item)) return;
    if (mode === 'single' || how === 'only') {
      parts.anchorKey = node.key;
      this.setSelection([node.key], true, event);
    } else if (how === 'toggle') {
      parts.anchorKey = node.key;
      const next = new Set(parts.selected);
      if (next.has(node.key)) next.delete(node.key);
      else next.add(node.key);
      this.setSelection([...next], true, event);
    } else {
      const anchor = parts.anchorKey === NONE ? undefined : parts.model.node(parts.anchorKey);
      const from = (anchor && parts.index.get(anchor)) ?? parts.index.get(node) ?? 0;
      const extend = !!event && !('key' in event) && ((event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey);
      this.selectRange(from, parts.index.get(node) ?? 0, event, extend);
    }
  }

  private selectRange(from: number, to: number, event: Event, extend = false): void {
    const parts = this.parts;
    const [a, b] = from <= to ? [from, to] : [to, from];
    const keys = parts.rows
      .slice(a, b + 1)
      .filter((row) => this.enabledOf(row.node.item))
      .map((row) => row.node.key);
    this.setSelection(extend ? [...parts.selected, ...keys] : keys, true, event);
  }

  private selectAllBy(byUser: boolean, event?: Event): void {
    if (this.peekProperty('selectionMode') !== 'multiple') return;
    const keys: unknown[] = [];
    for (const node of this.parts.model.walk()) if (this.enabledOf(node.item)) keys.push(node.key);
    this.setSelection(keys, byUser, event);
  }

  private setCheck(node: TreeNode<T>, on: boolean, byUser: boolean): void {
    const parts = this.parts;
    parts.model.setChecked(node, on, parts.checked, this.recursive);
    this.checksChanged(node, byUser);
  }

  private checksChanged(node: TreeNode<T> | null, byUser: boolean): void {
    const parts = this.parts;
    parts.states = parts.model.checkStates(parts.checked, this.recursive);
    this.renderStates();
    const keys = parts.model.inOrder(parts.checked);
    this.sync('checkedKeys', keys);
    const state = node ? (parts.states.get(node) ?? 'unchecked') : 'unchecked';
    if (this.live) parts.checkChanged.fire({ item: node?.item ?? null, key: node?.key ?? null, state, keys, byUser, source: this });
  }

  /** Opens the parents of a row; its index on screen, -1 when it is not shown. */
  private reveal(key: unknown): number {
    const parts = this.parts;
    const node = parts.model.node(key);
    if (!node || (parts.shown && !parts.shown.has(node))) return -1;
    const closed: TreeNode<T>[] = [];
    for (let p = node.parent; p; p = p.parent) if (!this.isOpen(p)) closed.unshift(p);
    for (const p of closed) if (!this.setOpen(p, true, false)) return -1;
    return parts.index.get(node) ?? -1;
  }

  // Drawing.

  /** Filters, counts the rows on screen and draws them all again. */
  private redraw(): void {
    const parts = this.parts;
    parts.states = parts.model.checkStates(parts.checked, this.recursive);
    this.computeRows(true);
    this.drawAll();
    this.loadOpen();
  }

  private computeRows(refilter: boolean): void {
    const parts = this.parts;
    const model = parts.model;
    if (refilter) {
      const text = foldText((this.peekProperty<string>('searchValue') ?? '').trim());
      parts.filterText = text;
      if (text) {
        const starts = this.peekProperty('searchMode') === 'startswith';
        parts.shown = model.match((node) => {
          const own = foldText(this.textOf(node.item));
          return starts ? own.startsWith(text) : own.includes(text);
        });
        const shown = parts.shown;
        parts.filterOpen = new Set([...shown].filter((node) => model.hasChildren(node, shown)).map((node) => node.key));
      } else {
        parts.shown = null;
        parts.filterOpen = new Set();
      }
    }
    parts.rows = model.rows((node) => this.isOpen(node), parts.shown);
    parts.index = new Map(parts.rows.map((row, at) => [row.node, at]));
  }

  private get windowFrom(): number {
    return this.peekProperty<number>('virtualFrom') ?? 500;
  }

  private drawAll(): void {
    const parts = this.parts;
    const body = parts.body;
    const active = deepActiveElement();
    const hadFocus = !!active && body.contains(active);
    this.releaseAll();
    body.replaceChildren();
    const empty = !parts.rows.length;
    parts.empty.hidden = !empty;
    this.element.toggleAttribute('data-empty', empty);
    parts.windowed = parts.rows.length > this.windowFrom;
    this.element.toggleAttribute('data-windowed', parts.windowed);
    if (parts.windowed) this.drawWindow();
    else this.buildBranch(0, 1, body);
    this.renderRoving();
    if (hadFocus) {
      const stop = this.stopNode();
      const el = stop && parts.elements.get(stop);
      if (el) el.focus({ preventScroll: true });
      else body.focus();
    }
  }

  /** Builds the rows from `from` on that sit at `level`, their open children nested in groups. */
  private buildBranch(from: number, level: number, host: HTMLElement): number {
    const rows = this.parts.rows;
    let at = from;
    while (at < rows.length && rows[at].node.level >= level) {
      const row = rows[at];
      const el = this.itemElement(row);
      host.append(el);
      at++;
      if (at < rows.length && rows[at].node.level > row.node.level) {
        const group = el.appendChild(document.createElement('div'));
        group.className = 'mx-tree-view__group';
        group.setAttribute('role', 'group');
        at = this.buildBranch(at, row.node.level + 1, group);
      }
    }
    return at;
  }

  /** A row opened or closed: only its children are drawn again. */
  private drawBranch(node: TreeNode<T>): void {
    const parts = this.parts;
    const windowed = parts.rows.length > this.windowFrom;
    if (windowed !== parts.windowed) {
      this.drawAll();
      return;
    }
    if (windowed) {
      this.drawWindow();
      this.renderRoving();
      return;
    }
    const el = parts.elements.get(node);
    if (!el) return;
    const old = el.querySelector(':scope > .mx-tree-view__group');
    if (old) {
      const active = deepActiveElement();
      if (active && old.contains(active)) el.focus({ preventScroll: true });
      for (const child of old.querySelectorAll('.mx-tree-view__item')) this.forget(child);
      old.remove();
    }
    const at = parts.index.get(node);
    if (at !== undefined) {
      this.renderItem(el, parts.rows[at]);
      const next = parts.rows[at + 1];
      if (next && next.node.level > node.level) {
        const group = el.appendChild(document.createElement('div'));
        group.className = 'mx-tree-view__group';
        group.setAttribute('role', 'group');
        this.buildBranch(at + 1, node.level + 1, group);
      }
    }
    this.renderRoving();
  }

  /** In a long tree: the rows in view (and the one Tab reaches), two empty blocks for the rest. */
  private drawWindow(): void {
    const parts = this.parts;
    const body = parts.body;
    const rows = parts.rows;
    const count = rows.length;
    if (!parts.rowHeight) parts.rowHeight = this.measure();
    const height = parts.rowHeight;
    const top = body.scrollTop;
    const view = body.clientHeight || height * 20;
    const first = Math.max(0, Math.floor(top / height) - OVERSCAN);
    const end = Math.min(count, Math.ceil((top + view) / height) + OVERSCAN);
    const wanted: number[] = [];
    for (let i = first; i < end; i++) wanted.push(i);
    const stop = this.stopNode();
    const stopAt = stop ? (parts.index.get(stop) ?? -1) : -1;
    if (stopAt >= 0 && (stopAt < first || stopAt >= end)) {
      if (stopAt < first) wanted.unshift(stopAt);
      else wanted.push(stopAt);
    }
    const keep = new Set<TreeNode<T>>();
    const placed: HTMLElement[] = [];
    let next = 0;
    for (const at of wanted) {
      if (at > next) placed.push(this.space((at - next) * height));
      const row = rows[at];
      let el = parts.elements.get(row.node);
      if (el) this.renderItem(el, row);
      else el = this.itemElement(row);
      placed.push(el);
      keep.add(row.node);
      next = at + 1;
    }
    if (count > next) placed.push(this.space((count - next) * height));
    for (const [node, el] of [...parts.elements]) {
      if (keep.has(node)) continue;
      this.forget(el);
      el.remove();
    }
    for (const space of [...body.querySelectorAll(':scope > .mx-tree-view__space')]) space.remove();
    // Rows that stay are never moved: moving the focused one would drop focus.
    let cursor = body.firstElementChild;
    for (const el of placed) {
      if (el === cursor) cursor = cursor.nextElementSibling;
      else body.insertBefore(el, cursor);
    }
  }

  private space(size: number): HTMLElement {
    const space = document.createElement('div');
    space.className = 'mx-tree-view__space';
    space.setAttribute('aria-hidden', 'true');
    space.style.blockSize = `${size}px`;
    return space;
  }

  private measure(): number {
    const parts = this.parts;
    const row = parts.rows[0];
    if (!row) return 32;
    const probe = this.itemElement(row);
    parts.body.append(probe);
    const height = probe.getBoundingClientRect().height;
    this.forget(probe);
    probe.remove();
    return height || 32;
  }

  private itemElement(row: TreeRow<T>): HTMLElement {
    const parts = this.parts;
    const node = row.node;
    const item = node.item;
    const el = document.createElement('div');
    el.className = 'mx-tree-view__item';
    el.setAttribute('role', 'treeitem');
    el.tabIndex = -1;
    const line = el.appendChild(document.createElement('div'));
    line.className = 'mx-tree-view__row';
    el.style.setProperty('--_level', String(node.level));
    const expander = line.appendChild(document.createElement('span'));
    expander.className = 'mx-tree-view__expander';
    expander.append(chevronEnd());
    if (this.peekProperty('showCheckBoxes')) {
      const check = line.appendChild(document.createElement('span'));
      check.className = 'mx-tree-view__check';
      const mark = checkMark();
      mark.classList.add('mx-tree-view__check-mark');
      const dash = dashMark();
      dash.classList.add('mx-tree-view__dash-mark');
      check.append(mark, dash);
    }
    const releases: (() => void)[] = [];
    const icon = this.iconOf(item);
    if (icon !== undefined && icon !== null) {
      const host = line.appendChild(document.createElement('span'));
      host.className = 'mx-tree-view__icon';
      host.setAttribute('aria-hidden', 'true');
      const shown = iconNode(icon);
      host.append(shown.node);
      releases.push(shown.release);
    }
    const text = line.appendChild(document.createElement('span'));
    text.className = 'mx-tree-view__text';
    const template = this.peekProperty<TreeViewItemTemplate<T> | null>('itemTemplate');
    const release = template ? template(item, text) : undefined;
    if (release) releases.push(release);
    if (!template) text.textContent = this.textOf(item);
    if (releases.length) parts.releases.set(node, () => releases.forEach((r) => r()));
    parts.elements.set(node, el);
    parts.nodes.set(el, node);
    this.renderItem(el, row);
    return el;
  }

  /** A row's states: level and place, open, selected, checked, enabled, loading. */
  private renderItem(el: HTMLElement, row: TreeRow<T>): void {
    const parts = this.parts;
    const node = row.node;
    const key = node.key;
    el.setAttribute('aria-level', String(node.level));
    el.setAttribute('aria-setsize', String(row.size));
    el.setAttribute('aria-posinset', String(row.position));
    const busy = parts.busy.get(key);
    const branch = parts.model.hasChildren(node, parts.shown);
    const open = branch && this.isOpen(node) && busy !== 'error';
    if (branch) el.setAttribute('aria-expanded', String(open));
    else el.removeAttribute('aria-expanded');
    el.toggleAttribute('data-branch', branch);
    el.toggleAttribute('data-expanded', open);
    if ((this.peekProperty('selectionMode') ?? 'single') === 'none') {
      el.removeAttribute('aria-selected');
      el.removeAttribute('data-selected');
    } else {
      const selected = parts.selected.has(key);
      el.setAttribute('aria-selected', String(selected));
      el.toggleAttribute('data-selected', selected);
    }
    if (this.peekProperty('showCheckBoxes')) {
      const state = parts.states.get(node) ?? (parts.checked.has(key) ? 'checked' : 'unchecked');
      el.setAttribute('aria-checked', state === 'mixed' ? 'mixed' : String(state === 'checked'));
      el.dataset.state = state;
    } else {
      el.removeAttribute('aria-checked');
      delete el.dataset.state;
    }
    const enabled = this.enabledOf(node.item);
    el.toggleAttribute('data-disabled', !enabled);
    if (!enabled) el.setAttribute('aria-disabled', 'true');
    else if (!this.element.hasAttribute('data-disabled')) el.removeAttribute('aria-disabled');
    if (busy === 'loading') el.setAttribute('aria-busy', 'true');
    else el.removeAttribute('aria-busy');
    el.toggleAttribute('data-loading', busy === 'loading');
    this.renderError(el, busy === 'error');
  }

  private renderError(el: HTMLElement, failed: boolean): void {
    const line = el.firstElementChild as HTMLElement;
    const error = line.querySelector<HTMLElement>(':scope > .mx-tree-view__error');
    el.toggleAttribute('data-error', failed);
    if (!failed) {
      if (error) {
        error.remove();
        el.removeAttribute('aria-describedby');
      }
      return;
    }
    if (error) return;
    const box = line.appendChild(document.createElement('span'));
    box.className = 'mx-tree-view__error';
    box.id = nextId('tree-error');
    // Read as the row's description, not as part of its name.
    box.setAttribute('aria-hidden', 'true');
    box.append(document.createElement('span'));
    const retry = box.appendChild(document.createElement('button'));
    retry.type = 'button';
    retry.tabIndex = -1;
    retry.className = 'mx-tree-view__retry';
    this.fillError(box);
    el.setAttribute('aria-describedby', box.id);
  }

  private fillError(box: HTMLElement): void {
    const strings = uiLocale.strings;
    (box.firstElementChild as HTMLElement).textContent = strings.loadFailed;
    (box.lastElementChild as HTMLElement).textContent = strings.retry;
  }

  private renderNode(node: TreeNode<T>): void {
    const parts = this.parts;
    const el = parts.elements.get(node);
    const at = parts.index.get(node);
    if (el && at !== undefined) this.renderItem(el, parts.rows[at]);
  }

  private renderStates(): void {
    const parts = this.parts;
    for (const [node, el] of parts.elements) {
      const at = parts.index.get(node);
      if (at !== undefined) this.renderItem(el, parts.rows[at]);
    }
    this.renderRoving();
  }

  /** The row Tab reaches: the focused one, else the first selected, else the first. */
  private stopNode(): TreeNode<T> | null {
    const parts = this.parts;
    if (!parts.rows.length) return null;
    const focused = parts.focusKey === NONE ? undefined : parts.model.node(parts.focusKey);
    if (focused && parts.index.has(focused)) return focused;
    if (parts.selected.size) {
      for (const key of parts.selected) {
        const node = parts.model.node(key);
        if (node && parts.index.has(node)) return node;
      }
    }
    return parts.rows[0].node;
  }

  private renderRoving(): void {
    const parts = this.parts;
    const stop = this.peekProperty('tabStop') === false ? null : this.stopNode();
    for (const [node, el] of parts.elements) el.tabIndex = node === stop ? 0 : -1;
  }

  private renderLook(): void {
    const parts = this.parts;
    const data = this.element.dataset;
    data.size = this.peekProperty<ControlSize>('size') ?? 'md';
    this.element.toggleAttribute('data-lines', !!this.peekProperty('showLines'));
    this.element.toggleAttribute('data-checkboxes', !!this.peekProperty('showCheckBoxes'));
    if (this.peekProperty('selectionMode') === 'multiple') parts.body.setAttribute('aria-multiselectable', 'true');
    else parts.body.removeAttribute('aria-multiselectable');
  }

  private renderSearch(): void {
    const parts = this.parts;
    if (!this.peekProperty('searchEnabled')) {
      if (parts.search) {
        this.controls.remove(parts.search);
        parts.search = null;
      }
      return;
    }
    if (parts.search) return;
    // Its variant and label mode come from its place (treeview.search).
    const search = new TextBox({ type: 'search', stretch: true, autocomplete: 'off' });
    onLanguage(search, () => {
      search.label = uiLocale.strings.search;
      search.placeholder = uiLocale.strings.search;
    });
    search.element.classList.add('mx-tree-view__search');
    search.value = this.peekProperty<string>('searchValue') ?? '';
    search.onValueChanged((e) => this.changeProperty('searchValue', e.value ?? ''));
    search.inputElement.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' || !parts.rows.length) return;
      e.preventDefault();
      const stop = this.stopNode();
      untracked(() => this.focusRow(stop ? (parts.index.get(stop) ?? 0) : 0));
    });
    this.controls.add(search);
    parts.search = search;
    this.placeSearch();
  }

  /** The search box sits above the rows; building the tree places its controls again, so it is put back. */
  private placeSearch(): void {
    const parts = this.parts;
    if (parts.search && parts.search.element.nextElementSibling !== parts.body) parts.body.before(parts.search.element);
  }

  private forget(el: Element): void {
    const parts = this.parts;
    const node = parts.nodes.get(el);
    if (!node || parts.elements.get(node) !== el) return;
    parts.releases.get(node)?.();
    parts.releases.delete(node);
    parts.elements.delete(node);
  }

  private releaseAll(): void {
    const parts = this.parts;
    for (const release of parts.releases.values()) release();
    parts.releases.clear();
    parts.elements.clear();
  }

  private scrollToRow(at: number): void {
    const parts = this.parts;
    const body = parts.body;
    if (parts.windowed) {
      const height = parts.rowHeight || this.measure();
      const top = at * height;
      const view = body.clientHeight;
      if (top < body.scrollTop) body.scrollTop = top;
      else if (top + height > body.scrollTop + view) body.scrollTop = top + height - view;
      this.drawWindow();
      this.renderRoving();
    }
    const line = parts.elements.get(parts.rows[at].node)?.firstElementChild;
    if (line && typeof line.scrollIntoView === 'function') line.scrollIntoView({ block: 'nearest' });
  }

  private focusRow(at: number): void {
    const parts = this.parts;
    const row = parts.rows[at];
    if (!row) return;
    parts.focusKey = row.node.key;
    this.scrollToRow(at);
    this.renderRoving();
    parts.elements.get(row.node)?.focus({ preventScroll: true });
  }

  // Input.

  private listen(): void {
    const parts = this.parts;
    const body = parts.body;
    body.addEventListener('click', (e) => untracked(() => this.clicked(e)));
    body.addEventListener('dblclick', (e) => untracked(() => this.doubleClicked(e)));
    body.addEventListener('keydown', (e) => untracked(() => this.keyDown(e)));
    body.addEventListener('focusin', (e) => {
      const node = this.nodeOf(e.target);
      if (!node || parts.focusKey === node.key) return;
      parts.focusKey = node.key;
      this.renderRoving();
    });
    body.addEventListener('scroll', () => {
      if (!parts.windowed) return;
      cancelAnimationFrame(parts.frame);
      parts.frame = requestAnimationFrame(() => this.drawWindow());
    });
  }

  private nodeOf(target: EventTarget | null): TreeNode<T> | undefined {
    const el = isElement(target) ? target.closest('.mx-tree-view__item') : null;
    return el ? this.parts.nodes.get(el) : undefined;
  }

  private clicked(e: MouseEvent): void {
    const parts = this.parts;
    const target = e.target as Element;
    const node = this.nodeOf(target);
    if (!node) return;
    const branch = parts.model.hasChildren(node, parts.shown);
    if (target.closest('.mx-tree-view__retry')) {
      this.setOpen(node, true, true, e);
      return;
    }
    if (target.closest('.mx-tree-view__expander')) {
      if (branch) this.setOpen(node, !this.isOpen(node), true, e);
      return;
    }
    const enabled = this.enabledOf(node.item);
    if (target.closest('.mx-tree-view__check')) {
      if (enabled) this.setCheck(node, parts.states.get(node) !== 'checked', true);
      return;
    }
    parts.focusKey = node.key;
    if (enabled) {
      this.selectByUser(node, e, e.shiftKey ? 'range' : e.ctrlKey || e.metaKey ? 'toggle' : 'only');
      parts.itemClick.fire({ item: node.item, key: node.key, source: this, event: e });
    }
    if (branch && this.peekProperty('expandOn') === 'click') this.setOpen(node, !this.isOpen(node), true, e);
  }

  private doubleClicked(e: MouseEvent): void {
    const parts = this.parts;
    const target = e.target as Element;
    const node = this.nodeOf(target);
    if (!node || target.closest('.mx-tree-view__expander, .mx-tree-view__check, .mx-tree-view__retry')) return;
    if (parts.model.hasChildren(node, parts.shown) && this.peekProperty('expandOn') === 'dblclick') this.setOpen(node, !this.isOpen(node), true, e);
  }

  private keyDown(e: KeyboardEvent): void {
    const parts = this.parts;
    const node = this.nodeOf(e.target);
    if (!node || e.target !== parts.elements.get(node)) return;
    const rows = parts.rows;
    const at = parts.index.get(node);
    if (at === undefined) return;
    const multiple = this.peekProperty('selectionMode') === 'multiple';
    const ctrl = e.ctrlKey || e.metaKey;
    const branch = parts.model.hasChildren(node, parts.shown);
    const open = branch && this.isOpen(node);
    let key = e.key;
    const dir = this.element.closest('[dir]')?.getAttribute('dir');
    if (dir ? dir === 'rtl' : getComputedStyle(this.element).direction === 'rtl') {
      if (key === 'ArrowLeft') key = 'ArrowRight';
      else if (key === 'ArrowRight') key = 'ArrowLeft';
    }
    if (e.altKey) return;
    switch (key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        const to = Math.max(0, Math.min(rows.length - 1, at + (key === 'ArrowDown' ? 1 : -1)));
        this.focusRow(to);
        if (e.shiftKey && multiple && to !== at) this.selectByUser(rows[to].node, e, 'toggle');
        break;
      }
      case 'ArrowRight':
        if (branch && (!open || parts.busy.get(node.key) === 'error')) this.setOpen(node, true, true, e);
        else if (open && rows[at + 1]?.node.parent === node) this.focusRow(at + 1);
        break;
      case 'ArrowLeft':
        if (open) this.setOpen(node, false, true, e);
        else if (node.parent && parts.index.has(node.parent)) this.focusRow(parts.index.get(node.parent)!);
        break;
      case 'Home':
      case 'End': {
        const to = key === 'Home' ? 0 : rows.length - 1;
        if (multiple && ctrl && e.shiftKey) this.selectRange(at, to, e);
        this.focusRow(to);
        break;
      }
      case 'PageDown':
      case 'PageUp': {
        const page = Math.max(1, Math.floor(parts.body.clientHeight / (parts.rowHeight || this.measure())) - 1);
        this.focusRow(Math.max(0, Math.min(rows.length - 1, at + (key === 'PageDown' ? page : -page))));
        break;
      }
      case '*': {
        const siblings = node.parent ? (node.parent.children ?? []) : parts.model.roots;
        for (const sibling of siblings) {
          if (parts.index.has(sibling) && parts.model.hasChildren(sibling, parts.shown) && !this.isOpen(sibling)) this.setOpen(sibling, true, true, e);
        }
        break;
      }
      case 'Enter':
        if (!this.enabledOf(node.item)) break;
        this.selectByUser(node, e, 'only');
        parts.itemClick.fire({ item: node.item, key: node.key, source: this, event: e });
        break;
      case ' ':
        if (this.peekProperty('showCheckBoxes')) {
          if (this.enabledOf(node.item)) this.setCheck(node, parts.states.get(node) !== 'checked', true);
        } else if (multiple && e.shiftKey) {
          const anchor = parts.anchorKey === NONE ? undefined : parts.model.node(parts.anchorKey);
          this.selectRange((anchor && parts.index.get(anchor)) ?? at, at, e);
        } else {
          this.selectByUser(node, e, multiple ? 'toggle' : 'only');
        }
        break;
      default:
        if (multiple && ctrl && key.toLowerCase() === 'a') {
          this.selectAllBy(true, e);
          break;
        }
        if (key.length === 1 && !ctrl) {
          const to = this.typeAhead(key, at);
          if (to >= 0) this.focusRow(to);
          break;
        }
        return;
    }
    e.preventDefault();
  }

  /** The next row whose text starts with what was typed lately; -1 when none. */
  private typeAhead(key: string, at: number): number {
    const parts = this.parts;
    const now = Date.now();
    parts.typed = now - parts.typedAt < TYPING_MS ? parts.typed + key : key;
    parts.typedAt = now;
    const text = foldText(parts.typed);
    const rows = parts.rows;
    // A repeated letter goes on to the next row with it.
    const start = parts.typed.length > 1 ? at : at + 1;
    for (let step = 0; step < rows.length; step++) {
      const index = (start + step) % rows.length;
      if (foldText(this.textOf(rows[index].node.item)).startsWith(text)) return index;
    }
    return -1;
  }
}
