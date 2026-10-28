import { Component, effect, Emitter, reactive, read, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Control } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import { dismissMark, plusMark } from '../../core/glyphs';
import { isHtmlElement, isNode } from '../../core/node-kind';
import type { UiStrings } from '../../core/ui-strings';
import type { MenuItem } from '../../parts/menu/menu-item';
import { Button } from '../button/Button';
import { DateBox } from '../datebox/DateBox';
import { DropDown } from '../dropdown/DropDown';
import { NumberBox } from '../numberbox/NumberBox';
import { TagBox } from '../tagbox/TagBox';
import { TextBox } from '../textbox/TextBox';
import type { FilterBuilderCondition } from './filter-builder-condition';
import type { FilterBuilderCustomOperation } from './filter-builder-custom-operation';
import type { FilterBuilderEditorContext } from './filter-builder-editor-context';
import type { FilterBuilderEditorPreparedEventArgs } from './filter-builder-editor-prepared-event-args';
import type { FilterBuilderEditorPreparingEventArgs } from './filter-builder-editor-preparing-event-args';
import type { FilterBuilderField } from './filter-builder-field';
import type { FilterBuilderGroup } from './filter-builder-group';
import type { FilterBuilderGroupOperation } from './filter-builder-group-operation';
import type { FilterBuilderItem } from './filter-builder-item';
import type { FilterBuilderItemAddedEventArgs } from './filter-builder-item-added-event-args';
import type { FilterBuilderItemAddingEventArgs } from './filter-builder-item-adding-event-args';
import type { FilterBuilderItemChange } from './filter-builder-item-change';
import type { FilterBuilderItemChangedEventArgs } from './filter-builder-item-changed-event-args';
import type { FilterBuilderItemChangingEventArgs } from './filter-builder-item-changing-event-args';
import type { FilterBuilderItemRemovedEventArgs } from './filter-builder-item-removed-event-args';
import type { FilterBuilderItemRemovingEventArgs } from './filter-builder-item-removing-event-args';
import { FilterBuilderModel } from './FilterBuilderModel';
import type { FilterBuilderOperation } from './filter-builder-operation';
import type { FilterBuilderProps } from './filter-builder-props';
import type { FilterBuilderValueChangedEventArgs } from './filter-builder-value-changed-event-args';

const OWN = ['value', 'fields', 'customOperations', 'groupOperations', 'maxGroupLevel', 'allowHierarchicalFields', 'label', 'texts', 'locale', 'size', 'addKeys', 'removeKeys'] as const;

const PARTS = Symbol('mx.filterbuilder');

/** The buttons of a row: a group's remove, operation and add; a condition's remove, field, operation and value. */
type Part = 'remove' | 'group' | 'add' | 'field' | 'operation' | 'value';

interface Cell {
  item: FilterBuilderItem;
  part: Part;
  button: Button;
  component: Component<HTMLDivElement>;
}

interface Row {
  item: FilterBuilderItem;
  component: Component<HTMLDivElement>;
  cells: Cell[];
}

interface Editing {
  condition: FilterBuilderCondition;
  cell: Cell;
  box: Component<HTMLDivElement>;
  editors: ComponentBase[];
  draft: unknown;
}

interface Parts {
  model: FilterBuilderModel;
  root: FilterBuilderGroup;
  /** The value written last, or taken from the prop. */
  value: data.FilterExpression | null;
  holder: Component<HTMLDivElement> | null;
  rows: Row[];
  focus: { item: FilterBuilderItem; part: Part } | null;
  editing: Editing | null;
  /** The pointer went down in the open editor: focus leaving it then is not a reason to close it. */
  pressedInEditor: boolean;
  ready: boolean;
  /** Bumped on every change of the tree, for reactive readers of `text`. */
  version: { n: number };
  /** The tree's name given on the component's tag (`aria-label`, `aria-labelledby`). */
  named: Record<string, string>;
  valueChanged: Emitter<FilterBuilderValueChangedEventArgs>;
  itemAdding: Emitter<FilterBuilderItemAddingEventArgs>;
  itemAdded: Emitter<FilterBuilderItemAddedEventArgs>;
  itemRemoving: Emitter<FilterBuilderItemRemovingEventArgs>;
  itemRemoved: Emitter<FilterBuilderItemRemovedEventArgs>;
  itemChanging: Emitter<FilterBuilderItemChangingEventArgs>;
  itemChanged: Emitter<FilterBuilderItemChangedEventArgs>;
  editorPreparing: Emitter<FilterBuilderEditorPreparingEventArgs>;
  editorPrepared: Emitter<FilterBuilderEditorPreparedEventArgs>;
}

const faceOf = (button: Button): HTMLElement =>
  button.element.classList.contains('mx-button__face') ? button.element : (button.element.querySelector<HTMLElement>('.mx-button__face') ?? button.element);

const focusChecked = (button: Button) => {
  if (button.opened) button.element.querySelector<HTMLElement>('.mx-menu__item[aria-checked="true"]')?.focus();
};

const empty = (v: unknown) => v === undefined || v === null || v === '' || (typeof v === 'number' && Number.isNaN(v));

/**
 * Builds a filter of the data layer by hand: a tree of groups (and, or, not and, not or) and
 * conditions (a field, an operation, a value), edited with the mouse and the keyboard. The value
 * is a `data.FilterExpression`, ready for any adapter. Each value is edited with the kit's editor
 * for the field's type. The tree is one Tab stop: the arrow keys move between its buttons.
 *
 * @example
 * <FilterBuilder fields={fields} x-model={() => this.state.filter} />
 *
 * const builder = new FilterBuilder({ fields, value: data.where('city', '=', 'Ankara') });
 * builder.addCondition(builder.root, 'amount');
 */
export class FilterBuilder extends Control<HTMLDivElement, FilterBuilderProps> {
  constructor(props?: IBaseProp<FilterBuilderProps>) {
    super('div', props);
    const own = (this.props ?? {}) as FilterBuilderProps;
    const parts = this.parts;
    this.element.classList.add('mx-filter-builder');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onValueChanged) this.onValueChanged(own.onValueChanged);
    if (own.onItemAdding) this.onItemAdding(own.onItemAdding);
    if (own.onItemAdded) this.onItemAdded(own.onItemAdded);
    if (own.onItemRemoving) this.onItemRemoving(own.onItemRemoving);
    if (own.onItemRemoved) this.onItemRemoved(own.onItemRemoved);
    if (own.onItemChanging) this.onItemChanging(own.onItemChanging);
    if (own.onItemChanged) this.onItemChanged(own.onItemChanged);
    if (own.onEditorPreparing) this.onEditorPreparing(own.onEditorPreparing);
    if (own.onEditorPrepared) this.onEditorPrepared(own.onEditorPrepared);
    this.observeProperty<data.FilterExpression | null | undefined>('value', (value) => this.takeValue(value ?? null));
    this.takeValue(this.peekProperty<data.FilterExpression | null>('value') ?? null);
    this.listen();
    // What the rows show: a change of any of it draws them again.
    const stopDrawing = effect(() => {
      this.watchOptions();
      untracked(() => {
        if (parts.ready) this.draw(this.focusWithin);
      });
    });
    parts.ready = true;
    this.draw(false);
    queueMicrotask(() => {
      for (const name of ['aria-label', 'aria-labelledby', 'aria-describedby']) {
        const value = this.element.getAttribute(name);
        if (value === null) continue;
        parts.named[name] = value;
        parts.holder?.element.setAttribute(name, value);
        this.element.removeAttribute(name);
      }
    });
    this.motif.setDisposable(() => {
      stopDrawing();
      for (const emitter of [parts.valueChanged, parts.itemAdding, parts.itemAdded, parts.itemRemoving, parts.itemRemoved, parts.itemChanging, parts.itemChanged, parts.editorPreparing, parts.editorPrepared]) {
        emitter.dispose();
      }
    });
  }

  // Properties (see FilterBuilderProps).

  get value(): data.FilterExpression | null {
    return this.getProperty<data.FilterExpression | null | undefined>('value') ?? null;
  }
  set value(value: Bind<data.FilterExpression | null>) {
    this.assignProperty('value', value);
  }
  get fields(): readonly FilterBuilderField[] {
    return this.getProperty<readonly FilterBuilderField[] | undefined>('fields') ?? [];
  }
  set fields(value: Bind<readonly FilterBuilderField[]>) {
    this.assignProperty('fields', value);
  }
  get customOperations(): readonly FilterBuilderCustomOperation[] {
    return this.getProperty<readonly FilterBuilderCustomOperation[] | undefined>('customOperations') ?? [];
  }
  set customOperations(value: Bind<readonly FilterBuilderCustomOperation[]>) {
    this.assignProperty('customOperations', value);
  }
  get groupOperations(): readonly FilterBuilderGroupOperation[] {
    return this.parts.model.groupOperations();
  }
  set groupOperations(value: Bind<readonly FilterBuilderGroupOperation[]>) {
    this.assignProperty('groupOperations', value);
  }
  get maxGroupLevel(): number | null {
    return this.getProperty<number | null | undefined>('maxGroupLevel') ?? null;
  }
  set maxGroupLevel(value: Bind<number | null>) {
    this.assignProperty('maxGroupLevel', value);
  }
  get allowHierarchicalFields(): boolean {
    return !!this.getProperty<boolean | undefined>('allowHierarchicalFields');
  }
  set allowHierarchicalFields(value: Bind<boolean>) {
    this.assignProperty('allowHierarchicalFields', value);
  }
  get label(): string {
    return this.getProperty<string | undefined>('label') ?? '';
  }
  set label(value: Bind<string>) {
    this.assignProperty('label', value);
  }
  get texts(): Partial<UiStrings> {
    return this.getProperty<Partial<UiStrings> | undefined>('texts') ?? {};
  }
  set texts(value: Bind<Partial<UiStrings>>) {
    this.assignProperty('texts', value);
  }
  get locale(): string {
    return this.parts.model.locale;
  }
  set locale(value: Bind<string>) {
    this.assignProperty('locale', value);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'sm';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  get addKeys(): readonly string[] {
    return this.getProperty<readonly string[] | undefined>('addKeys') ?? ['Insert'];
  }
  set addKeys(value: Bind<readonly string[]>) {
    this.assignProperty('addKeys', value);
  }
  get removeKeys(): readonly string[] {
    return this.getProperty<readonly string[] | undefined>('removeKeys') ?? ['Delete'];
  }
  set removeKeys(value: Bind<readonly string[]>) {
    this.assignProperty('removeKeys', value);
  }

  /** The root group of the tree; change it through the methods. */
  get root(): FilterBuilderGroup {
    return this.parts.root;
  }

  /** The filter as one line of text (`[City] Equals 'Ankara' And …`), conditions without their value left out. Reactive. */
  get filterText(): string {
    void this.parts.version.n;
    return this.parts.model.treeText(this.parts.root);
  }

  /** The logic behind the builder: operations of a field, texts, the tree of an expression. */
  get model(): FilterBuilderModel {
    return this.parts.model;
  }

  /** The element with `role="treegrid"`. */
  get treeElement(): HTMLElement | null {
    return this.parts.holder?.element ?? null;
  }

  /** The condition whose value editor is open. */
  get editingCondition(): FilterBuilderCondition | null {
    return this.parts.editing?.condition ?? null;
  }

  // Events.

  get onValueChanged(): MotifEvent<FilterBuilderValueChangedEventArgs> {
    return this.parts.valueChanged.event;
  }
  /** A condition or group is about to be added; `e.cancel = true` keeps it out. */
  get onItemAdding(): MotifEvent<FilterBuilderItemAddingEventArgs> {
    return this.parts.itemAdding.event;
  }
  get onItemAdded(): MotifEvent<FilterBuilderItemAddedEventArgs> {
    return this.parts.itemAdded.event;
  }
  /** A condition or group is about to be taken out; `e.cancel = true` keeps it. */
  get onItemRemoving(): MotifEvent<FilterBuilderItemRemovingEventArgs> {
    return this.parts.itemRemoving.event;
  }
  get onItemRemoved(): MotifEvent<FilterBuilderItemRemovedEventArgs> {
    return this.parts.itemRemoved.event;
  }
  /** A field, operation, value or group operation is about to change; change `e.value`, or `e.cancel = true`. */
  get onItemChanging(): MotifEvent<FilterBuilderItemChangingEventArgs> {
    return this.parts.itemChanging.event;
  }
  get onItemChanged(): MotifEvent<FilterBuilderItemChangedEventArgs> {
    return this.parts.itemChanged.event;
  }
  /** A value editor is about to be made: change `e.options`, set `e.editor`, or `e.cancel = true`. */
  get onEditorPreparing(): MotifEvent<FilterBuilderEditorPreparingEventArgs> {
    return this.parts.editorPreparing.event;
  }
  get onEditorPrepared(): MotifEvent<FilterBuilderEditorPreparedEventArgs> {
    return this.parts.editorPrepared.event;
  }

  // Methods.

  /** The value, ready for the data layer (the same as `value`). */
  getFilterExpression(): data.FilterExpression | null {
    return this.parts.value;
  }

  /** Adds a condition at the end of a group (the root by default), on a field (the first by default). */
  addCondition(group: FilterBuilderGroup = this.parts.root, dataField?: string): FilterBuilderCondition | null {
    return untracked(() => this.addItem(group, this.parts.model.newCondition(dataField), false)) as FilterBuilderCondition | null;
  }

  /** Adds a group with one condition at the end of a group (the root by default); `null` past `maxGroupLevel`. */
  addGroup(group: FilterBuilderGroup = this.parts.root): FilterBuilderGroup | null {
    return untracked(() => this.addGroupTo(group, false));
  }

  /** Takes a condition or a group (with what it holds) out. The root stays. */
  removeItem(item: FilterBuilderItem): boolean {
    return untracked(() => this.remove(item, false));
  }

  /** Puts a condition on another field; its operation and value stay where the new field allows them. */
  setField(condition: FilterBuilderCondition, dataField: string): boolean {
    return untracked(() => this.changeField(condition, dataField, false));
  }

  setOperation(condition: FilterBuilderCondition, operation: FilterBuilderOperation): boolean {
    return untracked(() => this.changeOperation(condition, operation, false));
  }

  setConditionValue(condition: FilterBuilderCondition, value: unknown): boolean {
    return untracked(() => this.changeValue(condition, value, false));
  }

  setGroupOperation(group: FilterBuilderGroup, operation: FilterBuilderGroupOperation): boolean {
    return untracked(() => this.changeGroupOperation(group, operation, false));
  }

  /** Empties the tree. */
  clear(): void {
    untracked(() => {
      const parts = this.parts;
      this.stopEditor(false, false);
      parts.root = parts.model.newGroup(parts.root.operation);
      parts.focus = null;
      this.changed(false);
    });
  }

  /** Opens the value editor of a condition and focuses it. */
  openEditor(condition: FilterBuilderCondition): boolean {
    return untracked(() => this.startEditor(condition));
  }

  /** Closes the open value editor, keeping its value (or not). */
  closeEditor(keep = true): void {
    untracked(() => this.stopEditor(keep, true));
  }

  /** Focuses a button of an item's row: its field by default, a group's operation. */
  focusItem(item: FilterBuilderItem, part?: 'remove' | 'group' | 'add' | 'field' | 'operation' | 'value'): boolean {
    const cell = this.cellOf(item, part ?? (item.kind === 'group' ? 'group' : 'field')) ?? this.parts.rows.find((r) => r.item === item)?.cells[0];
    if (!cell) return false;
    this.moveTo(cell);
    return true;
  }

  override focus(): boolean {
    const cell = this.currentCell();
    if (!cell) return super.focus();
    return cell.button.focus();
  }

  // Changes.

  private addItem(group: FilterBuilderGroup, item: FilterBuilderItem | null, byUser: boolean): FilterBuilderItem | null {
    const parts = this.parts;
    if (!item || !this.inTree(group)) return null;
    this.stopEditor(true, false);
    const e: FilterBuilderItemAddingEventArgs = { item, group, byUser, source: this, cancel: false };
    parts.itemAdding.fire(e);
    if (e.cancel) return null;
    this.fitOperations(item);
    item.parent = group;
    group.items.push(item);
    parts.itemAdded.fire({ item, group, byUser, source: this });
    const first = item.kind === 'group' ? item.items[0] : item;
    parts.focus = first ? { item: first, part: 'field' } : { item, part: 'group' };
    this.changed(byUser);
    return item;
  }

  private addGroupTo(group: FilterBuilderGroup, byUser: boolean): FilterBuilderGroup | null {
    const model = this.parts.model;
    if (!model.canAddGroup(group)) return null;
    const child = model.newGroup();
    const condition = model.newCondition();
    if (condition) {
      condition.parent = child;
      child.items.push(condition);
    }
    return this.addItem(group, child, byUser) as FilterBuilderGroup | null;
  }

  private remove(item: FilterBuilderItem, byUser: boolean): boolean {
    const parts = this.parts;
    const group = item.parent;
    if (!group || !this.inTree(item)) return false;
    this.stopEditor(true, false);
    const e: FilterBuilderItemRemovingEventArgs = { item, group, byUser, source: this, cancel: false };
    parts.itemRemoving.fire(e);
    if (e.cancel) return false;
    const at = group.items.indexOf(item);
    group.items.splice(at, 1);
    item.parent = null;
    parts.itemRemoved.fire({ item, group, byUser, source: this });
    const next = group.items[at] ?? group.items[at - 1];
    const part = parts.focus?.part;
    parts.focus = next ? { item: next, part: part && part !== 'value' ? part : 'remove' } : { item: group, part: 'add' };
    this.changed(byUser);
    return true;
  }

  private changeField(c: FilterBuilderCondition, dataField: string, byUser: boolean): boolean {
    const model = this.parts.model;
    const field = model.field(dataField);
    if (!field || !this.inTree(c)) return false;
    if (c.field === dataField) return true;
    return this.ask(c, 'field', dataField, c.field, byUser, (v) => (c.field = v as string));
  }

  private changeOperation(c: FilterBuilderCondition, operation: FilterBuilderOperation, byUser: boolean): boolean {
    const model = this.parts.model;
    if (!this.inTree(c) || !model.operations(model.fieldOrPlain(c.field)).includes(operation)) return false;
    if (c.operation === operation) return true;
    const previous = c.operation;
    return this.ask(c, 'operation', operation, previous, byUser, (v) => {
      c.value = model.valueFor(v as FilterBuilderOperation, previous, c.value);
      c.operation = v as FilterBuilderOperation;
    });
  }

  private changeValue(c: FilterBuilderCondition, value: unknown, byUser: boolean, focus = byUser): boolean {
    if (!this.inTree(c)) return false;
    const same = JSON.stringify(c.value ?? null) === JSON.stringify(value ?? null);
    if (same) return true;
    return this.ask(c, 'value', value, c.value, byUser, (v) => (c.value = v), focus);
  }

  private changeGroupOperation(g: FilterBuilderGroup, operation: FilterBuilderGroupOperation, byUser: boolean): boolean {
    if (!this.inTree(g)) return false;
    if (g.operation === operation) return true;
    return this.ask(g, 'groupOperation', operation, g.operation, byUser, (v) => (g.operation = v as FilterBuilderGroupOperation));
  }

  /** Runs the changing event, the change and the changed event; `false` when it was cancelled. */
  private ask(item: FilterBuilderItem, change: FilterBuilderItemChange, value: unknown, previousValue: unknown, byUser: boolean, apply: (value: unknown) => void, focus = byUser): boolean {
    const parts = this.parts;
    const e: FilterBuilderItemChangingEventArgs = { item, change, value, previousValue, byUser, source: this, cancel: false };
    parts.itemChanging.fire(e);
    if (e.cancel) return false;
    apply(e.value);
    if (change === 'field') this.fitToField(item as FilterBuilderCondition, previousValue as string);
    parts.itemChanged.fire({ item, change, value: e.value, previousValue, byUser, source: this });
    this.changed(byUser, focus);
    return true;
  }

  /** Conditions an `onItemAdding` handler moved to another field get that field's operation. */
  private fitOperations(item: FilterBuilderItem) {
    const model = this.parts.model;
    if (item.kind === 'group') return item.items.forEach((i) => this.fitOperations(i));
    if (!model.operations(model.fieldOrPlain(item.field)).includes(item.operation)) item.operation = model.defaultOperation(model.fieldOrPlain(item.field));
  }

  /** A condition put on another field keeps its operation and value only where they still make sense there. */
  private fitToField(c: FilterBuilderCondition, previousField: string) {
    const model = this.parts.model;
    const before = model.fieldOrPlain(previousField);
    const now = model.fieldOrPlain(c.field);
    const alike = model.dataType(before) === model.dataType(now) && !!before.lookup === !!now.lookup && before.lookup?.dataSource === now.lookup?.dataSource;
    if (!model.operations(now).includes(c.operation)) {
      c.operation = model.defaultOperation(now);
      c.value = undefined;
    } else if (!alike) c.value = undefined;
  }

  /** The tree changed: the value follows (when it is another filter) and the rows are drawn again. */
  private changed(byUser: boolean, focus = byUser) {
    const parts = this.parts;
    parts.version.n++;
    const next = parts.model.toExpression(parts.root);
    if (!parts.model.same(next, parts.value)) {
      const previous = parts.value;
      parts.value = next;
      this.changeProperty('value', next);
      this.bindings.writeModel(next);
      parts.valueChanged.fire({ value: next, previousValue: previous, byUser, source: this });
    }
    this.draw(focus || this.focusWithin);
  }

  /** A value from the prop or from code: the tree is built again, unless it is the value the tree stands for already. */
  private takeValue(value: data.FilterExpression | null) {
    const parts = this.parts;
    if (parts.ready && parts.model.same(value, parts.value)) return;
    const previous = parts.value;
    parts.value = value;
    parts.root = parts.model.fromExpression(value);
    parts.focus = null;
    if (!parts.ready) return;
    this.stopEditor(false, false);
    parts.version.n++;
    parts.valueChanged.fire({ value, previousValue: previous, byUser: false, source: this });
    this.draw(this.focusWithin);
  }

  private inTree(item: FilterBuilderItem): boolean {
    let top = item;
    while (top.parent) top = top.parent;
    return top === this.parts.root;
  }

  // Drawing.

  /** Reads what the rows show, so the drawing effect follows it. */
  private watchOptions() {
    const model = this.parts.model;
    for (const field of model.fields()) {
      read(field.caption);
      read(field.dataType);
      read(field.filterOperations);
      read(field.defaultOperation);
      read(field.trueText);
      read(field.falseText);
    }
    for (const op of model.customOperations()) read(op.caption);
    model.groupOperations();
    model.maxGroupLevel();
    model.text('filterBuilderAnd');
    void model.locale;
    void model.state.texts;
    this.getProperty('allowHierarchicalFields');
    this.getProperty('size');
    this.getProperty('label');
  }

  /** Draws every row again, the same button keeping focus. */
  private draw(keepFocus: boolean) {
    const parts = this.parts;
    untracked(() => {
      parts.editing = null;
      const old = parts.holder;
      const holder = new Component<HTMLDivElement>('div');
      holder.element.className = 'mx-filter-builder__tree';
      holder.element.setAttribute('role', 'treegrid');
      holder.element.setAttribute('aria-label', this.label || parts.model.text('filterBuilderLabel'));
      for (const [name, value] of Object.entries(parts.named)) holder.element.setAttribute(name, value);
      holder.element.dataset.size = this.size;
      parts.holder = holder;
      parts.rows = [];
      this.drawGroup(parts.root, holder, 1, 1);
      this.controls.add(holder);
      if (old) {
        old.element.remove();
        void old.dispose({ skipLeaveTransition: true });
      }
      const cell = this.currentCell();
      for (const row of parts.rows) for (const c of row.cells) c.button.tabStop = c === cell;
      if (keepFocus && cell) cell.button.focus();
    });
  }

  private drawGroup(group: FilterBuilderGroup, holder: Component<HTMLDivElement>, position: number, setSize: number) {
    const model = this.parts.model;
    const level = model.level(group);
    const row = this.newRow(group, level, position, setSize, holder);
    if (group.parent) this.addRemove(row);
    const groupOps = model.groupOperations();
    this.addCell(row, 'group', {
      text: model.groupText(group.operation),
      label: model.text('filterBuilderGroupLabel', { operation: model.groupText(group.operation) }),
      menu: groupOps.map((op) => ({
        text: model.groupText(op),
        group: 'operation',
        checked: op === group.operation,
        click: () => this.changeGroupOperation(group, op, true),
      })),
    });
    const fields = model.fields().length > 0;
    if (model.canAddGroup(group)) {
      this.addCell(row, 'add', {
        icon: plusMark,
        label: model.text('filterBuilderAdd'),
        enabled: fields,
        menu: [
          { text: model.text('filterBuilderAddCondition'), click: () => this.addItem(group, model.newCondition(), true) },
          { text: model.text('filterBuilderAddGroup'), click: () => this.addGroupTo(group, true) },
        ],
      });
    } else {
      this.addCell(row, 'add', { icon: plusMark, label: model.text('filterBuilderAddCondition'), enabled: fields, click: () => this.addItem(group, model.newCondition(), true) });
    }
    group.items.forEach((item, i) => {
      if (item.kind === 'group') this.drawGroup(item, holder, i + 1, group.items.length);
      else this.drawCondition(item, holder, i + 1, group.items.length);
    });
  }

  private drawCondition(c: FilterBuilderCondition, holder: Component<HTMLDivElement>, position: number, setSize: number) {
    const model = this.parts.model;
    const field = model.fieldOrPlain(c.field);
    const row = this.newRow(c, model.level(c), position, setSize, holder);
    this.addRemove(row);
    const caption = model.caption(c.field);
    this.addCell(row, 'field', {
      text: caption,
      label: model.text('filterBuilderFieldLabel', { field: caption }),
      menu: this.fieldMenu(c),
    });
    const opText = model.operationText(c.operation);
    this.addCell(row, 'operation', {
      text: opText,
      label: model.text('filterBuilderOperationLabel', { operation: opText }),
      menu: model.operations(field).map((op) => ({
        text: model.operationText(op),
        group: 'operation',
        checked: op === c.operation,
        click: () => this.changeOperation(c, op, true),
      })),
    });
    if (!model.hasValue(c.operation)) return;
    const valueText = model.valueText(c);
    const shown = valueText || model.text('filterBuilderEnterValue');
    const cell = this.addCell(row, 'value', {
      text: shown,
      label: model.text('filterBuilderValueLabel', { value: shown }),
      click: () => this.startEditor(c),
    });
    cell.button.element.toggleAttribute('data-empty', !valueText);
  }

  /** The fields to choose from, as submenus of their parts with `allowHierarchicalFields`. */
  private fieldMenu(c: FilterBuilderCondition): MenuItem[] {
    const model = this.parts.model;
    const leaf = (f: FilterBuilderField, text: string): MenuItem => ({ text, group: 'field', checked: f.dataField === c.field, click: () => this.changeField(c, f.dataField, true) });
    if (!this.allowHierarchicalFields) return model.fields().map((f) => leaf(f, model.caption(f.dataField)));
    const top: MenuItem[] = [];
    const branches = new Map<string, MenuItem[]>();
    for (const f of model.fields()) {
      const path = f.dataField.split('.');
      let list = top;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path.slice(0, i + 1).join('.');
        let items = branches.get(key);
        if (!items) {
          items = [];
          branches.set(key, items);
          list.push({ text: model.caption(key).split('.').pop()!, items });
        }
        list = items;
      }
      const own = read(f.caption);
      list.push(leaf(f, own || model.caption(f.dataField).split('.').pop()!));
    }
    return top;
  }

  private newRow(item: FilterBuilderItem, level: number, position: number, setSize: number, holder: Component<HTMLDivElement>): Row {
    const component = new Component<HTMLDivElement>('div');
    const element = component.element;
    element.className = 'mx-filter-builder__row';
    element.setAttribute('role', 'row');
    element.setAttribute('aria-level', String(level + 1));
    element.setAttribute('aria-posinset', String(position));
    element.setAttribute('aria-setsize', String(setSize));
    element.dataset.kind = item.kind;
    element.style.setProperty('--_level', String(level));
    holder.controls.add(component);
    const row: Row = { item, component, cells: [] };
    this.parts.rows.push(row);
    return row;
  }

  private addRemove(row: Row) {
    const model = this.parts.model;
    const item = row.item;
    this.addCell(row, 'remove', {
      icon: dismissMark,
      label: model.text(item.kind === 'group' ? 'filterBuilderRemoveGroup' : 'filterBuilderRemoveCondition'),
      click: () => this.remove(item, true),
    });
  }

  private addCell(
    row: Row,
    part: Part,
    look: { text?: string; icon?: () => HTMLSpanElement; label: string; enabled?: boolean; menu?: MenuItem[]; click?: () => void },
  ): Cell {
    const component = new Component<HTMLDivElement>('div');
    component.element.className = 'mx-filter-builder__cell';
    component.element.setAttribute('role', 'gridcell');
    component.element.dataset.part = part;
    row.component.controls.add(component);
    // Variant, tone and size come from the part's place; a size given to the builder wins.
    const button = new Button({
      text: look.text ?? '',
      icon: look.icon ?? null,
      hint: look.icon ? look.label : '',
      size: this.getProperty<ControlSize | undefined>('size'),
      enabled: look.enabled ?? true,
      tabStop: false,
      ...(look.menu ? { menu: look.menu } : {}),
    });
    button.element.classList.add(`mx-filter-builder__${part}`);
    component.controls.add(button);
    faceOf(button).setAttribute('aria-label', look.label);
    if (look.click) {
      const click = look.click;
      faceOf(button).addEventListener('click', () => untracked(click));
    }
    // A menu of choices opens on the one chosen now.
    if (look.menu) faceOf(button).addEventListener('click', () => focusChecked(button));
    const cell: Cell = { item: row.item, part, button, component };
    row.cells.push(cell);
    return cell;
  }

  // Focus and keys.

  private cellOf(item: FilterBuilderItem, part: Part): Cell | undefined {
    return this.parts.rows.find((r) => r.item === item)?.cells.find((c) => c.part === part);
  }

  /** The button that is the tree's Tab stop: the one focused last, else the first. */
  private currentCell(): Cell | undefined {
    const parts = this.parts;
    const f = parts.focus;
    return (f && this.cellOf(f.item, f.part)) || (f && parts.rows.find((r) => r.item === f.item)?.cells[0]) || parts.rows[0]?.cells[0];
  }

  private cellAt(target: EventTarget | null): Cell | undefined {
    if (!isHtmlElement(target)) return undefined;
    for (const row of this.parts.rows) for (const c of row.cells) if (faceOf(c.button) === target) return c;
    return undefined;
  }

  private moveTo(cell: Cell) {
    const parts = this.parts;
    parts.focus = { item: cell.item, part: cell.part };
    for (const row of parts.rows) for (const c of row.cells) c.button.tabStop = c === cell;
    cell.button.focus();
  }

  private listen() {
    const el = this.element;
    // Moving keys before the buttons see them (a menu button opens on the arrows).
    el.addEventListener('keydown', (e) => untracked(() => this.onMoveKey(e)), true);
    el.addEventListener('keydown', (e) => untracked(() => this.onEditorKey(e)));
    el.addEventListener('focusin', (e) => {
      const cell = this.cellAt(e.target);
      if (!cell || this.parts.editing?.cell === cell) return;
      this.parts.focus = { item: cell.item, part: cell.part };
      for (const row of this.parts.rows) for (const c of row.cells) c.button.tabStop = c === cell;
    });
    el.addEventListener('pointerdown', (e) => {
      const editing = this.parts.editing;
      this.parts.pressedInEditor = !!editing && editing.box.element.contains(e.target as Node);
    });
    el.addEventListener('focusout', (e) => {
      const editing = this.parts.editing;
      if (!editing || editing.box.element.contains(e.relatedTarget as Node)) return;
      setTimeout(() => {
        if (this.parts.editing !== editing || this.isDisposed) return;
        const active = document.activeElement;
        if (active && editing.box.element.contains(active)) return;
        if ((!active || active === document.body) && this.parts.pressedInEditor) return;
        untracked(() => this.stopEditor(true, false));
      });
    });
  }

  private onMoveKey(e: KeyboardEvent) {
    const parts = this.parts;
    const cell = this.cellAt(e.target);
    if (!cell || e.defaultPrevented) return;
    const rows = parts.rows;
    const row = rows.findIndex((r) => r.item === cell.item);
    const cells = rows[row].cells;
    const at = cells.indexOf(cell);
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    const go = (target: Cell | undefined) => {
      e.preventDefault();
      e.stopPropagation();
      if (target) this.moveTo(target);
    };
    const ctrl = e.ctrlKey || e.metaKey;
    if (this.removeKeys.includes(e.key) && !ctrl && !e.altKey) {
      if (!cell.item.parent || !this.isEnabled) return;
      // The button goes away: its own key listener must not run.
      e.preventDefault();
      e.stopPropagation();
      parts.focus = { item: cell.item, part: cell.part };
      this.remove(cell.item, true);
      return;
    }
    if (this.addKeys.includes(e.key) && !ctrl && !e.altKey) {
      if (!this.isEnabled) return;
      e.preventDefault();
      e.stopPropagation();
      const group = cell.item.kind === 'group' ? cell.item : cell.item.parent!;
      this.addItem(group, parts.model.newCondition(), true);
      return;
    }
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        const forward = (e.key === 'ArrowRight') !== rtl;
        return go(cells[at + (forward ? 1 : -1)]);
      }
      case 'ArrowDown':
      case 'ArrowUp': {
        if (e.altKey) {
          if (cell.button.hasMenu) {
            e.preventDefault();
            e.stopPropagation();
            if (cell.button.open()) focusChecked(cell.button);
          }
          return;
        }
        const next = rows[row + (e.key === 'ArrowDown' ? 1 : -1)];
        if (!next) return go(undefined);
        return go(next.cells.find((c) => c.part === cell.part) ?? next.cells[Math.min(at, next.cells.length - 1)]);
      }
      case 'Home':
        return go(ctrl ? rows[0].cells[0] : cells[0]);
      case 'End': {
        const last = rows[rows.length - 1].cells;
        return go(ctrl ? last[last.length - 1] : cells[cells.length - 1]);
      }
      case 'F2':
        if (cell.part === 'value' && cell.item.kind === 'condition') {
          e.preventDefault();
          this.startEditor(cell.item);
        }
        return;
    }
  }

  // The value editor.

  private startEditor(c: FilterBuilderCondition): boolean {
    const parts = this.parts;
    const model = parts.model;
    if (!this.isEnabled || !this.inTree(c) || !model.hasValue(c.operation)) return false;
    if (parts.editing?.condition === c) return true;
    this.stopEditor(true, false);
    const cell = this.cellOf(c, 'value');
    if (!cell) return false;
    const box = new Component<HTMLDivElement>('div');
    box.element.className = 'mx-filter-builder__editor';
    cell.component.controls.add(box);
    const field = model.fieldOrPlain(c.field);
    const editing: Editing = { condition: c, cell, box, editors: [], draft: Array.isArray(c.value) ? [...c.value] : c.value };
    const between = c.operation === 'between';
    if (between && !Array.isArray(editing.draft)) editing.draft = [null, null];
    for (const part of between ? (['from', 'to'] as const) : (['value'] as const)) {
      const current = () => (part === 'value' ? editing.draft : (editing.draft as unknown[])[part === 'from' ? 0 : 1]);
      const setValue = (v: unknown) => {
        if (part === 'value') editing.draft = v;
        else (editing.draft as unknown[])[part === 'from' ? 0 : 1] = v;
      };
      const editor = this.makeEditor(c, field, part, current(), setValue, (keep = true) => untracked(() => this.stopEditor(keep, true)));
      if (!editor) continue;
      box.controls.add(editor);
      editing.editors.push(editor);
      parts.editorPrepared.fire({ field, operation: c.operation, condition: c, part, editor, source: this });
    }
    if (!editing.editors.length) {
      void box.dispose({ skipLeaveTransition: true });
      return false;
    }
    parts.editing = editing;
    parts.focus = { item: c, part: 'value' };
    this.focusEditor(editing.editors[0]);
    cell.button.visible = false;
    return true;
  }

  private focusEditor(editor: ComponentBase) {
    if (editor instanceof Control) {
      if (editor.focus()) return;
    }
    const target = isHtmlElement(editor.element) ? editor.element.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]') : null;
    target?.focus();
  }

  /** The editor of a value: your own (the operation's, the field's, or from `onEditorPreparing`), else the kit's for the field's type. */
  private makeEditor(
    c: FilterBuilderCondition,
    field: FilterBuilderField,
    part: 'value' | 'from' | 'to',
    value: unknown,
    setValue: (value: unknown) => void,
    close: (keep?: boolean) => void,
  ): ComponentBase | null {
    const parts = this.parts;
    const model = parts.model;
    const caption = model.caption(c.field);
    const label = model.text(part === 'from' ? 'filterBuilderFrom' : part === 'to' ? 'filterBuilderTo' : 'filterBuilderValueOf', { field: caption });
    const options: Record<string, unknown> = { labelMode: 'hidden', size: this.size, label, tabStop: false, ...(read(field.editorOptions) ?? {}) };
    const e: FilterBuilderEditorPreparingEventArgs = { field, operation: c.operation, value, condition: c, part, options, editor: null, setValue, source: this, cancel: false };
    parts.editorPreparing.fire(e);
    if (e.cancel) return null;
    if (e.editor) return e.editor;
    const ctx: FilterBuilderEditorContext = { field, operation: c.operation, value, condition: c, setValue, close, builder: this };
    const own = model.customOperation(c.operation)?.editor ?? field.editor;
    if (own) return own(ctx);
    return this.kitEditor(c, field, value, setValue, e.options);
  }

  private kitEditor(c: FilterBuilderCondition, field: FilterBuilderField, value: unknown, setValue: (value: unknown) => void, options: Record<string, unknown>): ComponentBase {
    const model = this.parts.model;
    const type = model.dataType(field);
    const many = c.operation === 'in' || c.operation === 'notin';
    const onValueChanged = (e: { value: unknown }) => setValue(e.value);
    const locale = model.locale;
    const lookup = field.lookup;
    if (lookup) {
      const source = read(lookup.dataSource);
      const from = Array.isArray(source) ? { items: source } : { dataSource: source };
      const fields = { valueField: lookup.valueField, textField: lookup.textField };
      if (many) return new TagBox<unknown, unknown>({ ...from, ...fields, ...options, value: Array.isArray(value) ? [...value] : [], onValueChanged } as never);
      return new DropDown<unknown, unknown>({ ...from, ...fields, searchEnabled: true, clearButton: !!read(lookup.allowClearing), ...options, value: empty(value) ? null : value, onValueChanged } as never);
    }
    if (many) {
      const parse = (text: string): unknown => {
        if (type === 'number') {
          const n = Number(text.replace(',', '.'));
          return Number.isNaN(n) ? null : n;
        }
        if (type === 'date' || type === 'datetime') return data.toDate(text);
        return text;
      };
      const current = Array.isArray(value) ? [...value] : [];
      return new TagBox<unknown, unknown>({
        items: current.map((v) => ({ value: v, text: model.formatValue(field, v, c.operation) })),
        acceptCustomValue: true,
        customValue: (text: string) => parse(text),
        showDropDownButton: false,
        ...options,
        value: current,
        onValueChanged,
      } as never);
    }
    const format = typeof field.format === 'object' ? field.format : undefined;
    switch (type) {
      case 'number':
        return new NumberBox({ locale, selectOnFocus: true, ...(format ? { format: format as Intl.NumberFormatOptions } : {}), ...options, value: typeof value === 'number' ? value : null, onValueChanged } as never);
      case 'date':
      case 'datetime':
        return new DateBox({ type, locale, ...(format ? { displayFormat: format as Intl.DateTimeFormatOptions } : {}), ...options, value: data.toDate(value), onValueChanged } as never);
      case 'boolean':
        return new DropDown<{ value: boolean; text: string }, boolean>({
          items: [
            { value: true, text: model.formatValue(field, true) },
            { value: false, text: model.formatValue(field, false) },
          ],
          ...options,
          value: typeof value === 'boolean' ? value : null,
          onValueChanged,
        } as never);
      default:
        return new TextBox({ spellcheck: false, autocomplete: 'off', selectOnFocus: true, ...options, value: empty(value) ? '' : String(value), onValueChanged } as never);
    }
  }

  private onEditorKey(e: KeyboardEvent) {
    const editing = this.parts.editing;
    if (!editing || e.defaultPrevented || !editing.box.element.contains(e.target as Node)) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.stopEditor(false, true);
    } else if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      this.stopEditor(true, true);
    } else if (e.key === 'Tab') {
      const at = editing.editors.findIndex((ed) => isNode(ed.element) && ed.element.contains(e.target as Node));
      const next = editing.editors[at + (e.shiftKey ? -1 : 1)];
      if (next) {
        e.preventDefault();
        this.focusEditor(next);
        return;
      }
      // Out of the editor: its value is kept, and Tab goes on from the value's button.
      this.stopEditor(true, true);
    }
  }

  /** Closes the value editor: its value is kept (`keep`) or given up, and focus goes back to the value's button (`focus`). */
  private stopEditor(keep: boolean, focus: boolean) {
    const parts = this.parts;
    const editing = parts.editing;
    if (!editing) return;
    parts.editing = null;
    parts.pressedInEditor = false;
    const c = editing.condition;
    let draft = editing.draft;
    if (typeof draft === 'string' && c.operation !== 'in' && c.operation !== 'notin') draft = draft === '' ? undefined : draft;
    if (Array.isArray(draft) && c.operation !== 'between') draft = draft.length ? draft : undefined;
    const wasFocused = editing.box.element.contains(document.activeElement);
    if (focus || wasFocused) parts.focus = { item: c, part: 'value' };
    if (keep && this.inTree(c) && JSON.stringify(draft ?? null) !== JSON.stringify(c.value ?? null)) {
      editing.box.element.remove();
      void editing.box.dispose({ skipLeaveTransition: true });
      if (!this.changeValue(c, draft, true, focus)) this.draw(focus || wasFocused);
      return;
    }
    editing.cell.button.visible = true;
    if (focus || wasFocused) editing.cell.button.focus();
    editing.box.element.remove();
    void editing.box.dispose({ skipLeaveTransition: true });
  }

  // Parts.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    const model = new FilterBuilderModel(() => ({
      fields: this.getProperty<readonly FilterBuilderField[] | undefined>('fields'),
      customOperations: this.getProperty<readonly FilterBuilderCustomOperation[] | undefined>('customOperations'),
      groupOperations: this.getProperty<readonly FilterBuilderGroupOperation[] | undefined>('groupOperations'),
      maxGroupLevel: this.getProperty<number | null | undefined>('maxGroupLevel'),
      allowHierarchicalFields: !!this.getProperty<boolean | undefined>('allowHierarchicalFields'),
      texts: this.getProperty<Partial<UiStrings> | undefined>('texts'),
      locale: this.getProperty<string | undefined>('locale'),
    }));
    return {
      model,
      root: model.newGroup(),
      value: null,
      holder: null,
      rows: [],
      focus: null,
      editing: null,
      pressedInEditor: false,
      ready: false,
      version: reactive({ n: 0 }),
      named: {},
      valueChanged: new Emitter(),
      itemAdding: new Emitter(),
      itemAdded: new Emitter(),
      itemRemoving: new Emitter(),
      itemRemoved: new Emitter(),
      itemChanging: new Emitter(),
      itemChanged: new Emitter(),
      editorPreparing: new Emitter(),
      editorPrepared: new Emitter(),
    };
  }
}
