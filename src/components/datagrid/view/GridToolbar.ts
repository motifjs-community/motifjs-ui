import { ComponentBase, createSignal, effect, untracked } from '@motifx/core';
import { columnsMark, downloadMark, plusMark, saveMark, searchMark, undoMark } from '../../../core/glyphs';
import { isHtmlElement, isNode } from '../../../core/node-kind';
import { Button } from '../../button/Button';
import { TextBox } from '../../textbox/TextBox';
import { Toolbar } from '../../toolbar/Toolbar';
import type { GridToolbarItem } from '../grid-toolbar-item';
import type { GridToolbarItemName } from '../grid-toolbar-item-name';
import type { GridModel } from '../model/GridModel';
import type { Switches } from '../model/Switches';
import { BarButtons } from './BarButtons';
import type { ToolbarHost } from './toolbar-host';
import type { ToolbarValues } from './toolbar-values';
import { givenList, givenValue } from '../../../core/given-field';
import { readField } from '../model/read-field';

/** The grid's own items, in the order they take when the app does not list them. */
const ORDER: readonly GridToolbarItemName[] = ['groupPanel', 'rowActions', 'addRowButton', 'saveButton', 'revertButton', 'exportButton', 'columnChooserButton', 'searchPanel'];

/** The item of one of the grid's items the app names without changing anything. */
const PLAIN: GridToolbarItem = Object.freeze({});

/** `shape`: the export button is a menu while it offers more than one command, else a plain button. */
type Entry = { key: string; name: GridToolbarItemName | null; item: GridToolbarItem; shape?: 'menu' | 'plain' };
/** `group`: the row actions, kit buttons that stand after the item's element. */
type Made = { item: GridToolbarItem; shape?: 'menu' | 'plain'; control: ComponentBase | null; element: HTMLElement; stops: (() => void)[]; group?: BarButtons<any> };

const isOwnName = (name: string | undefined): name is GridToolbarItemName => !!name && (ORDER as readonly string[]).includes(name);

/**
 * The bar above the rows, on the kit's `Toolbar` (one Tab stop, arrow keys between its items, a
 * "more" menu for what does not fit): the grid's own items whose features are on, or the items the
 * app lists, the `before` ones at the start and the `after` ones at the end. Items are made once
 * and kept while they stay; their state follows the grid.
 */
export class GridToolbar<T> {
  readonly bar: Toolbar;
  private made = new Map<string, Made>();
  /** The elements in the order they stand: the `before` items, the gap, the `after` items. */
  private order: { element: HTMLElement; control: ComponentBase | null }[] = [];
  private readonly spacer: HTMLElement;
  private readonly ids = new WeakMap<object, string>();
  private nextId = 0;
  /** Grows on `redraw()`: the app's items are read again. */
  private readonly look = createSignal(0);
  /** The list last placed, to place again when the row actions get another button. */
  private placed: { list: readonly Entry[]; after: readonly boolean[] } | null = null;

  constructor(
    private readonly model: GridModel<T>,
    private readonly options: Switches<ToolbarValues>,
    private readonly host: ToolbarHost,
    owner: ComponentBase,
  ) {
    const t = (key: Parameters<GridModel<T>['text']>[0]) => model.text(key);
    this.bar = new Toolbar({
      label: () => `${t('gridToolbar')}: ${host.grid.text || t('gridLabel')}`,
      size: 'sm',
      visible: () => this.shown(),
    });
    this.bar.element.classList.add('mx-data-grid__toolbar');
    this.spacer = document.createElement('span');
    this.spacer.className = 'mx-data-grid__toolbar-gap';
    this.spacer.setAttribute('aria-hidden', 'true');
    this.bar.element.append(this.spacer);
    const stop = effect(() => {
      const list = this.entries();
      // The group panel and the row actions start the bar, the grid's other items end it.
      const after = list.map((e) => (this.field(e.item, 'location') ?? (e.name === 'groupPanel' || e.name === 'rowActions' ? 'before' : 'after')) !== 'before');
      untracked(() => this.place(list, after));
    });
    owner.motif.setDisposable(() => {
      stop();
      for (const made of this.made.values()) for (const s of made.stops) s();
    });
  }

  /** The app's items are read again: the list, and what each shows (`grid.repaint()`). */
  redraw() {
    this.look.value = this.look.peek() + 1;
  }

  /** The control made for an item (`'searchPanel'`, `'exportButton'`, or a name of the app's own), while it is in the bar. */
  controlOf(name: string): ComponentBase | null {
    return this.made.get(name)?.control ?? null;
  }

  /** The element of an item while it is in the bar. */
  elementOf(name: string): HTMLElement | null {
    return this.made.get(name)?.element ?? null;
  }

  /** Whether the bar shows: as `visible` says, else while an item shows. Reactive. */
  shown(): boolean {
    const visible = this.options.get('visible');
    if (typeof visible === 'boolean') return visible;
    return this.entries().some((e) => this.field(e.item, 'visible') !== false && (e.name !== 'rowActions' || this.host.barEntries().length > 0));
  }

  /** Whether one of the grid's items has its feature on. Reactive. */
  private has(name: GridToolbarItemName): boolean {
    const s = this.model.settings;
    switch (name) {
      case 'searchPanel':
        return s.get('searchPanel');
      case 'groupPanel':
        return s.get('groupPanel');
      case 'rowActions':
        return this.host.hasBarActions();
      case 'addRowButton':
        return s.get('addRows') && s.get('newRowButton');
      case 'saveButton':
      case 'revertButton':
        return this.model.saveMode === 'batch' && s.get('saveButtons');
      case 'exportButton':
        return s.get('exportButton') && this.host.canExport() && this.host.exportCommands().length > 0;
      default:
        return s.get('columnChooserButton') && this.host.hasColumns();
    }
  }

  /** The items of the bar now, in order. Reactive. */
  private entries(): Entry[] {
    void this.look.value;
    const given = this.host.prepare(this.options.get('items') ?? ORDER.filter((name) => this.has(name)));
    const out: Entry[] = [];
    // The app's items are read as they are; a change in place shows after `grid.repaint()`.
    for (const x of givenList(given)) {
      const item = typeof x === 'string' ? (isOwnName(x) ? PLAIN : { name: x }) : x;
      const name = typeof x === 'string' ? x : givenValue<string | undefined>(x, 'name');
      if (isOwnName(name)) {
        // One of the grid's items whose feature is off stays out.
        if (this.has(name) && !out.some((e) => e.key === name)) {
          const shape = name === 'exportButton' && !givenValue(item, 'click') ? (this.host.exportCommands().length > 1 ? 'menu' : 'plain') : undefined;
          out.push({ key: name, name, item, shape });
        }
        continue;
      }
      if (!givenValue(item, 'content') && givenValue(item, 'text') === undefined && givenValue(item, 'icon') === undefined) continue;
      out.push({ key: name ?? this.idOf(item), name: null, item });
    }
    return out;
  }

  /** A field of an item, read as it is; read again on `redraw()`. */
  private field<K extends keyof GridToolbarItem>(item: GridToolbarItem, key: K) {
    void this.look.value;
    return readField(item, key);
  }

  private idOf(item: object): string {
    let id = this.ids.get(item);
    if (!id) this.ids.set(item, (id = `#${++this.nextId}`));
    return id;
  }

  /** Makes what is new, drops what left, and puts the elements in order: the `before` items, the gap, the `after` items. */
  private place(list: readonly Entry[], after: readonly boolean[]) {
    this.placed = { list, after };
    const bar = this.bar;
    const next = new Map<string, Made>();
    for (const entry of list) {
      const old = this.made.get(entry.key);
      next.set(entry.key, old && old.item === entry.item && old.shape === entry.shape ? old : this.make(entry));
    }
    for (const [key, old] of this.made) {
      if (next.get(key) === old) continue;
      for (const s of old.stops) s();
      if (old.control) bar.controls.remove(old.control);
      else old.element.remove();
    }
    this.made = next;
    // An item stands for its element and, for the row actions, the buttons after it.
    const parts = (made: Made) => [made, ...(made.group?.all().map((b) => ({ element: b.element, control: b as ComponentBase })) ?? [])];
    const items = list.map((e) => next.get(e.key)!);
    this.order = [...items.filter((_, i) => !after[i]).flatMap(parts), { element: this.spacer, control: null }, ...items.filter((_, i) => after[i]).flatMap(parts)];
    for (const { control } of this.order) if (control && !bar.controls.items.includes(control)) bar.controls.add(control);
    this.arrange();
  }

  /** Puts the elements in order again (building the bar appends its controls after the gap). */
  arrange() {
    const bar = this.bar.element;
    let before: ChildNode | null = bar.firstChild;
    for (const { element } of this.order) {
      if (element !== before) bar.insertBefore(element, before);
      before = element.nextSibling;
    }
  }

  private make(entry: Entry): Made {
    const { item, name } = entry;
    if (name === 'searchPanel') return this.makeSearch(item);
    if (name === 'groupPanel') return this.makeGroupPanel(item);
    if (name === 'rowActions') return this.makeRowActions(item);
    if (!name && item.content) return this.makeContent(item);
    return this.makeButton(entry);
  }

  private makeButton({ item, name, shape }: Entry): Made {
    const grid = this.host.grid;
    const own = name ? this.ownButton(name) : null;
    const menu = shape === 'menu' ? () => this.host.exportCommands().map((c) => ({ text: c.text, enabled: c.enabled, click: () => c.run() })) : undefined;
    const text = () => this.field(item, 'text') ?? own?.text() ?? '';
    const iconOnly = () => (this.field(item, 'showText') ?? (name ? 'inMenu' : 'always')) === 'inMenu' && (item.icon !== undefined || !!own);
    const button = new Button({
      text: () => (iconOnly() ? '' : text()),
      hint: () => this.field(item, 'hint') ?? (iconOnly() ? text() : ''),
      icon: () => (item.icon !== undefined ? this.field(item, 'icon') : own?.icon()),
      enabled: () => this.field(item, 'enabled') !== false && (own?.enabled() ?? true),
      visible: () => this.field(item, 'visible') !== false,
      busy: () => !!own?.busy?.(),
      ...(menu ? { menu } : {}),
    });
    if (own) button.element.classList.add(own.className);
    if (own?.keepFocus) button.element.addEventListener('pointerdown', (e) => e.preventDefault());
    if (!menu) {
      button.element.addEventListener('click', (event) => {
        if (item.click) item.click({ item, grid, event });
        else own?.run(button.element);
      });
    }
    return { item, shape, control: button, element: button.element, stops: [this.followOverflow(button.element, item, name ? 'auto' : 'never')] };
  }

  /** What one of the grid's buttons shows and does. */
  private ownButton(name: GridToolbarItemName) {
    const model = this.model;
    const st = model.state;
    const grid = this.host.grid;
    const t = (key: Parameters<GridModel<T>['text']>[0]) => () => model.text(key);
    switch (name) {
      case 'addRowButton':
        return { className: 'mx-data-grid__add', text: t('gridNewRow'), icon: () => plusMark(), enabled: () => !st.busy, keepFocus: true, run: () => void grid.addRow() };
      case 'saveButton':
        return { className: 'mx-data-grid__save', text: t('gridSaveChanges'), icon: () => saveMark(), enabled: () => !st.busy && model.stats.changed > 0, keepFocus: true, run: () => void grid.saveChanges() };
      case 'revertButton':
        return { className: 'mx-data-grid__revert', text: t('gridDiscardChanges'), icon: () => undoMark(), enabled: () => !st.busy && model.stats.changed > 0, keepFocus: true, run: () => grid.discardChanges() };
      case 'exportButton':
        return {
          className: 'mx-data-grid__export',
          text: () => (st.exporting ? model.text('gridExporting') : this.host.exportName()),
          icon: () => downloadMark(),
          enabled: () => st.status === 'ready',
          busy: () => st.exporting,
          run: () => this.host.exportCommands()[0]?.run(),
        };
      default:
        return { className: 'mx-data-grid__columns', text: t('gridColumnChooser'), icon: () => columnsMark(), enabled: () => true, run: (anchor: HTMLElement) => this.host.openColumns(anchor) };
    }
  }

  private makeSearch(item: GridToolbarItem): Made {
    const model = this.model;
    const settings = model.settings;
    const search = model.search;
    const box = new TextBox({
      type: 'search',
      label: () => model.text('gridSearch'),
      labelMode: 'hidden',
      placeholder: () => settings.get('searchPlaceholder') || model.text('gridSearchPlaceholder'),
      icon: () => searchMark(),
      clearButton: true,
      hint: () => this.field(item, 'hint') ?? '',
      enabled: () => this.field(item, 'enabled') !== false,
      visible: () => this.field(item, 'visible') !== false,
      value: () => search.state.text,
      onValueChanged: (e) => {
        if (!e.byUser) return;
        // Typing waits for a pause; emptying the box (the clear button, Escape) searches at once.
        search.setText(e.value ?? '', !!e.value);
      },
      onEnter: () => search.flush(),
    });
    box.element.classList.add('mx-data-grid__search');
    const width = effect(() => {
      const w = settings.get('searchPanelWidth');
      untracked(() => (box.element.style.inlineSize = typeof w === 'number' ? `${w}px` : w));
    });
    return { item, control: box, element: box.element, stops: [width, this.followOverflow(box.element, item, 'never')] };
  }

  private makeGroupPanel(item: GridToolbarItem): Made {
    const element = this.host.groupPanel().element;
    const visible = effect(() => {
      const on = this.field(item, 'visible') !== false;
      untracked(() => element.toggleAttribute('hidden', !on));
    });
    return { item, control: null, element, stops: [visible, this.followOverflow(element, item, 'never')] };
  }

  /** The actions of the target rows: a hidden element that says what they act on, then their buttons. */
  private makeRowActions(item: GridToolbarItem): Made {
    const element = document.createElement('span');
    element.className = 'mx-data-grid__bar-target';
    element.id = `${this.host.gridId}-bar-target`;
    element.hidden = true;
    const label = effect(() => {
      const text = this.model.actionSets.targetLabel();
      untracked(() => (element.textContent = text));
    });
    const stops: (() => void)[] = [label];
    let made: Made | null = null;
    const group = new BarButtons<T>(this.model, 'toolbar', {
      run: (entry) => this.host.runBarAction(entry, 'toolbar'),
      visible: () => this.field(item, 'visible') !== false,
      describedBy: element.id,
      added: (button) => {
        stops.push(this.followOverflow(button.element, item, 'auto'));
        // A button made later is put in its place; the first ones are placed with the item.
        if (made && this.placed && this.made.get('rowActions') === made) this.place(this.placed.list, this.placed.after);
      },
    });
    stops.push(this.followOverflow(group.menuButton.element, item, 'auto'));
    stops.push(() => {
      group.dispose();
      if (!this.bar.isDisposed) for (const button of group.all()) this.bar.controls.remove(button);
    });
    made = { item, control: null, element, stops, group };
    return made;
  }

  private makeContent(item: GridToolbarItem): Made {
    const content = item.content!();
    const control = content instanceof ComponentBase ? content : null;
    let element: HTMLElement;
    if (control) element = control.element as HTMLElement;
    else if (isHtmlElement(content)) element = content;
    else {
      element = document.createElement('span');
      if (isNode(content)) element.append(content);
      else if (content !== undefined && content !== null) element.textContent = String(content);
    }
    const visible = effect(() => {
      const on = this.field(item, 'visible') !== false;
      untracked(() => element.toggleAttribute('hidden', !on));
    });
    return { item, control, element, stops: [visible, this.followOverflow(element, item, 'never')] };
  }

  /** Writes whether the element may go into the "more" menu where the toolbar reads it, and lays the bar out again when it changes. */
  private followOverflow(element: HTMLElement, item: GridToolbarItem, fallback: 'auto' | 'always' | 'never'): () => void {
    return effect(() => {
      const value = this.field(item, 'overflow') ?? fallback;
      untracked(() => {
        if (element.dataset.overflow === value) return;
        element.dataset.overflow = value;
        this.bar.updateOverflow();
      });
    });
  }
}
