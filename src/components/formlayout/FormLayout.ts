import { Component, ComponentBase, createSignal, untracked, type Bind, type IBaseProp, type Signal } from '@motifx/core';
import { isWithin } from '../../core/component-tree';
import { Control } from '../../core/control';
import { part } from '../../core/draw-parts';
import { follow } from '../../core/follow';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { css, kept, mark, put, text } from '../../core/part-writes';
import type { FieldLabelMode } from '../../parts/field/field-label-mode';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import { ValidationGroup } from '../../parts/validation/ValidationGroup';
import type { ValidationResult } from '../../parts/validation/validation-result';
import type { ValidationTarget } from '../../parts/validation/validation-target';
import { Button } from '../button/Button';
import { CheckBox } from '../checkbox/CheckBox';
import { ComboBox } from '../combobox/ComboBox';
import { DateBox } from '../datebox/DateBox';
import { DropDown } from '../dropdown/DropDown';
import { Lookup } from '../lookup/Lookup';
import { NumberBox } from '../numberbox/NumberBox';
import { RadioGroup } from '../radiogroup/RadioGroup';
import { Slider } from '../slider/Slider';
import { Switch } from '../switch/Switch';
import { Tab } from '../tabs/Tab';
import { Tabs } from '../tabs/Tabs';
import { TagBox } from '../tagbox/TagBox';
import { TextArea } from '../textarea/TextArea';
import { TextBox } from '../textbox/TextBox';
import type { FormEditorFactory } from './form-editor-factory';
import type { FormItem } from './form-item';
import type { FormLayoutProps } from './form-layout-props';
import type { FormTab } from './form-tab';

type Props = Record<string, unknown>;

const OWN = ['data', 'items', 'columns', 'minColumnWidth', 'labelMode', 'readOnly'] as const;

const PARTS = Symbol('mx.formlayout');

interface Parts {
  group: ValidationGroup;
  /** The fields of the items not shown now: out of the group until they are shown again. */
  resting: Set<ValidationTarget>;
  /** The cells of the items not shown now. */
  hidden: Set<ComponentBase>;
  /** The grid of the items, a component, made once: each item's cell is its child, and an item's component is the cell's. */
  grid: Component<HTMLDivElement> | null;
  editors: Map<string, ComponentBase>;
  /** The tabs of the form, so a check can show the tab of the field that failed. */
  tabs: Tabs[];
  /** The item of each field's editor. */
  fieldItems: Map<string, FormItem>;
  /** Bumped by `refresh`: the items' fields and the data are read again. */
  version: Signal<number>;
  /** Bumped by `refreshField`, by field. */
  fieldVersions: Map<string, Signal<number>>;
}

/**
 * An item's place in its grid (the form's, a group's or a tab's), made once: it stays while an item of the same key
 * (its field, or its kind and place) and kind is given, and shows the latest of them in `item`.
 */
interface Cell {
  kind: string;
  item: Signal<FormItem>;
  editor?: ComponentBase;
}

/** Props an editor takes from its item, given again by `refresh`. */
const ITEM_PROPS = ['label', 'required', 'rules', 'helpText', 'enabled'] as const;

/**
 * Lays out the fields of a data object. Each item is a field with its editor (selected by name, by the
 * type of the value, or created by a function), a group under a caption, tabs, a button or a custom
 * component. The editors have two-way binding to the object and are validated together, including
 * those on hidden tabs. Submitting the form validates them first.
 *
 * @example
 * <FormLayout data={this.order} columns={2} onValidSubmit={() => this.save()} items={[
 *   { field: 'customer', label: '&Customer', editor: 'lookup', editorProps: { dataSource: this.customers }, required: true },
 *   { field: 'date', label: 'Date' },
 *   { field: 'note', label: 'Note', editor: 'textarea', colSpan: 'all' },
 *   { button: { text: 'Save', tone: 'accent', submit: true } },
 * ]} />
 */
export class FormLayout<T extends object = Record<string, unknown>> extends Control<HTMLFormElement, FormLayoutProps<T>> {
  /** The editors registered by name. Add your own with `FormLayout.editors.set('color', (p) => new ColorBox(p))`. */
  static readonly editors = new Map<string, FormEditorFactory>([
    ['text', (p) => new TextBox(p)],
    ['password', (p) => new TextBox({ ...p, type: 'password' })],
    ['email', (p) => new TextBox({ ...p, type: 'email' })],
    ['textarea', (p) => new TextArea(p)],
    ['number', (p) => new NumberBox(p)],
    ['date', (p) => new DateBox(p)],
    ['datetime', (p) => new DateBox({ ...p, type: 'datetime' })],
    ['time', (p) => new DateBox({ ...p, type: 'time' })],
    ['checkbox', (p) => new CheckBox(p)],
    ['switch', (p) => new Switch(p)],
    ['dropdown', (p) => new DropDown(p)],
    ['tagbox', (p) => new TagBox(p)],
    ['combobox', (p) => new ComboBox(p)],
    ['lookup', (p) => new Lookup(p)],
    ['radio', (p) => new RadioGroup(p)],
    ['slider', (p) => new Slider(p)],
  ]);

  constructor(props?: IBaseProp<FormLayoutProps<T>>) {
    super('form', props);
    const own = (this.props ?? {}) as FormLayoutProps<T>;
    this.class.add('mx-form-layout');
    mark(this, 'novalidate', true);
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    this.observeProperty<number>('columns', (n) => css(this, '--_form-columns', String(Math.max(1, n || 1))));
    this.observeProperty<string>('minColumnWidth', (width) => {
      css(this, '--_form-min', width || '');
      mark(this, 'data-fluid', !!width);
    });
    this.motif.on('submit', (_, e) => {
      e.preventDefault();
      void this.submit(e);
    });
    this.motif.on('x:built', () => {
      // Made once: new items make only their own cells, and the data reaches the editors through their bindings.
      const parts = this.formParts;
      if (parts.grid) return;
      const grid = new Component<HTMLDivElement>('div');
      grid.class.add('mx-form-layout__grid');
      parts.grid = grid;
      this.controls.add(grid);
      this.cells(grid, () => this.getProperty<readonly FormItem[] | undefined>('items'));
    });
    this.motif.setDisposable(() => this.clear());
  }

  get data(): T | null {
    return this.getProperty<T | null | undefined>('data') ?? null;
  }
  set data(value: Bind<T | null>) {
    this.assignProperty('data', value);
  }
  get items(): readonly FormItem[] {
    return this.getProperty<readonly FormItem[] | undefined>('items') ?? [];
  }
  set items(value: Bind<readonly FormItem[]>) {
    this.assignProperty('items', value);
  }
  get columns(): number {
    return this.getProperty<number | undefined>('columns') ?? 1;
  }
  set columns(value: Bind<number>) {
    this.assignProperty('columns', value);
  }
  get minColumnWidth(): string {
    return this.getProperty<string | undefined>('minColumnWidth') ?? '';
  }
  set minColumnWidth(value: Bind<string>) {
    this.assignProperty('minColumnWidth', value);
  }
  get labelMode(): FieldLabelMode {
    return this.getProperty<FieldLabelMode | undefined>('labelMode') ?? 'top';
  }
  set labelMode(value: Bind<FieldLabelMode>) {
    this.assignProperty('labelMode', value);
  }
  get readOnly(): boolean {
    return !!this.getProperty<boolean>('readOnly');
  }
  set readOnly(value: Bind<boolean>) {
    this.assignProperty('readOnly', value, Boolean);
  }

  /** The validation group of the form's fields. */
  get validationGroup(): ValidationGroup {
    return this.formParts.group;
  }

  get isValid(): boolean {
    this.restHidden();
    return this.formParts.group.isValid;
  }

  /** The editor of a field. */
  editorOf(field: string): ComponentBase | undefined {
    return this.formParts.editors.get(field);
  }

  /** Validates every field. The first invalid field receives focus, with its tab shown first, unless `focus` is `false`. */
  async validate(options?: { focus?: boolean }): Promise<ValidationResult> {
    this.restHidden();
    const result = await this.formParts.group.validate({ focus: false });
    if (options?.focus !== false) {
      for (const target of result.invalid) {
        if (target instanceof ComponentBase) this.reveal(target);
        if (target.focus()) break;
      }
    }
    return result;
  }

  resetValidation(): void {
    this.formParts.group.reset();
  }

  /**
   * Re-reads your data object and the items after they have been changed in place: every editor's value, the
   * items' text and states, and the layout if items were added or removed. Your data and items can be plain or
   * reactive, and the form reads them as they are.
   */
  refresh(): void {
    const parts = this.formParts;
    for (const [field, item] of parts.fieldItems) {
      const editor = parts.editors.get(field) as unknown as Record<string, unknown> | undefined;
      if (!editor) continue;
      for (const key of ITEM_PROPS) {
        const value = givenValue(item, key);
        if (value !== undefined && key in editor) editor[key] = value;
      }
    }
    parts.version.value = parts.version.peek() + 1;
  }

  /** Re-reads one field of your data object after it has been changed in place. */
  refreshField(field: string): void {
    const version = this.formParts.fieldVersions.get(field);
    if (version) version.value = version.peek() + 1;
  }

  /** Validates every field, then reports the submission as valid (`onValidSubmit`) or invalid (`onInvalidSubmit`). */
  async submit(event: Event = new Event('submit')): Promise<boolean> {
    const result = await this.validate();
    if (result.valid) this.props?.onValidSubmit?.({ data: this.peekProperty<T | null>('data') ?? null, event });
    else this.props?.onInvalidSubmit?.(result);
    return result.valid;
  }

  /**
   * A field of an item that is not shown (`visible: false`) is not checked: it leaves the group with its message
   * cleared, and comes back once its item is shown. A field on a tab not chosen is still checked.
   */
  private restHidden(): void {
    const { group, resting } = this.formParts;
    for (const target of group.targets) {
      if (!this.isHidden(target)) continue;
      group.remove(target);
      target.resetValidation();
      resting.add(target);
    }
    for (const target of resting) {
      if (!(target instanceof ComponentBase) || !isWithin(target, this)) resting.delete(target);
      else if (!this.isHidden(target)) {
        resting.delete(target);
        group.add(target);
      }
    }
  }

  /** Whether a field sits in an item that is not shown: one of this form's, or of a form around it. */
  private isHidden(target: ValidationTarget): boolean {
    const field = target.part;
    for (let c = field.parent; c; c = c.parent) if (c instanceof FormLayout && c.hides(field)) return true;
    return false;
  }

  /** Whether `part` is in one of this form's items that are not shown. */
  private hides(part: ComponentBase): boolean {
    const { hidden } = this.formParts;
    for (let c: ComponentBase | null = part; c && c !== this; c = c.parent) if (hidden.has(c)) return true;
    return false;
  }

  private get formParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= {
      group: new ValidationGroup(),
      resting: new Set(),
      hidden: new Set(),
      grid: null,
      editors: new Map(),
      tabs: [],
      fieldItems: new Map(),
      version: createSignal(0),
      fieldVersions: new Map(),
    });
  }

  private clear(): void {
    const parts = this.formParts;
    parts.hidden.clear();
    parts.editors.clear();
    parts.fieldItems.clear();
    parts.fieldVersions.clear();
    parts.tabs.length = 0;
  }

  /** Selects the tab a field is on (each tab up from it, for tabs in tabs). */
  private reveal(field: ComponentBase): void {
    for (const tabs of this.formParts.tabs) {
      const tab = tabs.tabs.find((t) => isWithin(field, t));
      if (tab && tabs.selectedTab !== tab) tabs.selectedIndex = tabs.tabs.indexOf(tab);
    }
  }

  /**
   * Lays the items of `read` out in `host`, one cell each, made when its item comes and taken out when it goes. An
   * item that stays (the same field, or the same kind in the same place) keeps its cell, and the cell shows the new
   * item; an item made another way (another editor or template function, a group given a caption) is made again.
   */
  private cells(host: Component<HTMLDivElement>, read: () => readonly FormItem[] | undefined): void {
    const parts = this.formParts;
    let cells = new Map<string, Cell>();
    host.bindings.list(
      () => {
        void parts.version.value;
        // An editor picked by the type of its value is picked again when the data changes.
        const data = this.getProperty<T | null | undefined>('data');
        const now = new Map<string, Cell>();
        const seen = new Map<string, number>();
        const list = givenList(read()).map((item) => {
          const base = item.field && !item.items && !item.tabs ? `field:${item.field}` : this.kindOf(item, data, undefined);
          const n = seen.get(base) ?? 0;
          seen.set(base, n + 1);
          const key = `${base}#${n}`;
          const was = cells.get(key);
          const kind = this.kindOf(item, data, was);
          const cell = was && was.kind === kind && this.sameMake(was.item.peek(), item) ? was : { kind, item: createSignal(item) };
          if (cell === was && was.item.peek() !== item) untracked(() => this.restate(cell, item));
          now.set(key, cell);
          return cell;
        });
        cells = now;
        return list;
      },
      (cell: Cell) => untracked(() => this.place(cell)),
    );
  }

  /** What an item is made as. */
  private kindOf(item: FormItem, data: unknown, was: Cell | undefined): string {
    if (item.items) return item.group !== undefined ? 'captioned' : 'group';
    if (item.tabs) return 'tabs';
    if (item.template) return 'template';
    if (item.button) return 'button';
    if (!item.field) return 'none';
    if (typeof item.editor === 'function') return 'factory';
    if (item.editor) return item.editor;
    const value = givenValue(data, item.field);
    // A field emptied keeps its editor.
    return value == null && was && FormLayout.editors.has(was.kind) ? was.kind : this.editorFor(value);
  }

  /**
   * Whether an item is made the same way: by the same template or editor function (another one makes its part
   * again), and a button with the same look (its handlers are its item's, whichever is given now).
   */
  private sameMake(was: FormItem, now: FormItem): boolean {
    if (was.template !== now.template) return false;
    if (typeof was.editor === 'function' && was.editor !== now.editor) return false;
    const a = (was.button ?? {}) as Record<string, unknown>;
    const b = (now.button ?? {}) as Record<string, unknown>;
    if (a === b) return true;
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (typeof a[key] === 'function' && typeof b[key] === 'function') continue;
      if (!Object.is(a[key], b[key])) return false;
    }
    return true;
  }

  /** A new item for a cell that stays: what reads the item follows it, and its editor takes the item's props. */
  private restate(cell: Cell, item: FormItem): void {
    const was = cell.item.peek();
    cell.item.value = item;
    const editor = cell.editor as unknown as Record<string, unknown> | undefined;
    const parts = this.formParts;
    if (!editor || parts.editors.get(item.field!) !== cell.editor) return;
    parts.fieldItems.set(item.field!, item);
    for (const key of ITEM_PROPS) {
      const value = givenValue(item, key);
      if (Object.is(value, givenValue(was, key)) || !(key in editor)) continue;
      if (value !== undefined) editor[key] = value;
      else if (key === 'label') editor.label = item.field;
    }
    const props = item.editorProps ?? {};
    const old = was.editorProps ?? {};
    for (const key of Object.keys(props)) if (!key.startsWith('on') && !Object.is(props[key], old[key]) && key in editor) editor[key] = props[key];
  }

  private place(cell: Cell): Component<HTMLDivElement> {
    const parts = this.formParts;
    const cellPart = new Component<HTMLDivElement>('div');
    cellPart.class.add('mx-form-layout__item');
    // What the cell leaves behind when it goes.
    const gone: (() => void)[] = [() => parts.hidden.delete(cellPart)];
    void cellPart.motif.on('x:disposed', () => {
      // The form going takes all of it with it.
      if (this.isDisposed) return;
      for (const stop of gone.splice(0)) stop();
    });
    // A group and tabs take the whole row unless given a span.
    cellPart.bindings.watch(() => {
      const item = cell.item.value;
      const span = item.colSpan ?? (item.items || item.tabs ? 'all' : undefined);
      untracked(() => {
        put(cellPart, 'data-span', span === 'all' ? 'all' : null);
        css(cellPart, '--_form-span', typeof span === 'number' && span > 1 ? String(span) : '');
      });
    });
    // The items' own functions are tracked; their fields are read again by `refresh`.
    gone.push(
      follow(
        this,
        'itemVisible',
        () => {
          void parts.version.value;
          return givenField(cell.item.value, 'visible') === false;
        },
        (hidden) => {
          kept(cellPart, !hidden);
          if (hidden) parts.hidden.add(cellPart);
          else parts.hidden.delete(cellPart);
        },
      ),
    );

    if (cell.kind === 'group' || cell.kind === 'captioned') {
      const groupPart = new Component<HTMLFieldSetElement>('fieldset');
      groupPart.class.add('mx-form-layout__group');
      cellPart.controls.add(groupPart);
      if (cell.kind === 'captioned') {
        const legend = part<HTMLLegendElement>(groupPart, 'legend', 'mx-form-layout__caption');
        gone.push(
          follow(
            this,
            'groupCaption',
            () => {
              void parts.version.value;
              return givenField<string | undefined>(cell.item.value, 'group') ?? '';
            },
            (caption) => text(legend, caption),
          ),
        );
      }
      // After the legend.
      const inner = new Component<HTMLDivElement>('div');
      inner.class.add('mx-form-layout__grid');
      groupPart.controls.add(inner);
      this.gridColumns(inner,() => cell.item.value.columns);
      this.cells(inner, () => cell.item.value.items);
      return cellPart;
    }
    if (cell.kind === 'tabs') {
      this.placeTabs(cell, cellPart, gone);
      return cellPart;
    }
    const component = cell.kind === 'template' ? this.template(cell) : cell.kind === 'button' ? this.button(cell) : cell.kind === 'none' ? null : this.editor(cell, gone);
    if (component) cellPart.controls.add(component);
    if (cell.kind === 'button') put(cellPart, 'data-kind', 'button');
    return cellPart;
  }

  /** The columns of a group or a tab, as its item gives them now. */
  private gridColumns(grid: Component<HTMLDivElement>, read: () => number | undefined): void {
    grid.bindings.watch(() => {
      const n = read();
      untracked(() => css(grid, '--_form-columns', n ? String(n) : ''));
    });
  }

  /** A template's component, made once: its `context.data` is the form's data now, followed where it is read. */
  private template(cell: Cell): ComponentBase {
    const form = this;
    const item = cell.item.peek();
    const context = {
      get data() {
        return (form.getProperty<T | null | undefined>('data') ?? null) as Record<string, unknown> | null;
      },
      field: item.field ?? '',
      validationGroup: this.formParts.group,
    };
    return item.template!(context);
  }

  /** Tabs of items: every panel is built at once, so every field is checked whichever tab shows. */
  private placeTabs(cell: Cell, host: ComponentBase, gone: (() => void)[]): void {
    const parts = this.formParts;
    const tabs = new Tabs({ lazy: false, label: () => givenField<string>(cell.item.value, 'label') });
    tabs.class.add('mx-form-layout__tabs');
    host.controls.add(tabs);
    parts.tabs.push(tabs);
    gone.push(() => {
      const at = parts.tabs.indexOf(tabs);
      if (at >= 0) parts.tabs.splice(at, 1);
    });
    // A tab by its place: one that stays shows its new page, and only the tabs added or taken away change.
    const pages: { page: Signal<FormTab>; tab: Tab }[] = [];
    gone.push(
      follow(
        this,
        'formTabs',
        () => {
          void parts.version.value;
          return givenList(givenValue<readonly FormTab[] | undefined>(cell.item.value, 'tabs'));
        },
        (now) =>
          untracked(() => {
            now.forEach((given, i) => {
              if (pages[i]) {
                pages[i].page.value = given;
                return;
              }
              const page = createSignal(given);
              const tab = new Tab({
                title: () => givenField<string>(page.value, 'title'),
                visible: () => givenField<boolean | undefined>(page.value, 'visible') !== false,
                content: () => {
                  const panel = new Component<HTMLDivElement>('div');
                  panel.class.add('mx-form-layout__grid');
                  this.gridColumns(panel,() => page.value.columns);
                  this.cells(panel, () => page.value.items);
                  return panel;
                },
              });
              pages.push({ page, tab });
              tabs.add(tab);
            });
            for (const { tab } of pages.splice(now.length)) tabs.remove(tab);
          }),
      ),
    );
  }

  /** A button, made once: its handlers and getters are its item's, whichever is given now. */
  private button(cell: Cell): ComponentBase {
    const { submit, ...given } = cell.item.peek().button!;
    const props: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(given)) {
      props[key] =
        typeof value === 'function'
          ? (...args: unknown[]) => givenValue<((...args: unknown[]) => unknown) | undefined>(cell.item.value.button, key)?.(...args)
          : value;
    }
    return new Button({ ...props, type: submit ? 'submit' : (given.type ?? 'button') });
  }

  private editor(cell: Cell, gone: (() => void)[]): ComponentBase {
    const parts = this.formParts;
    const item = cell.item.peek();
    const field = item.field!;
    const version = createSignal(0);
    parts.fieldVersions.set(field, version);
    parts.fieldItems.set(field, item);
    // The data object given is followed; its field is read as it is, again on `refresh` and `refreshField`.
    const value = () => {
      const data = this.getProperty<T | null | undefined>('data');
      void parts.version.value;
      void version.value;
      return givenValue(data, field);
    };
    const name = typeof item.editor === 'function' ? item.editor : cell.kind;
    const factory = typeof name === 'function' ? name : (FormLayout.editors.get(name) ?? FormLayout.editors.get('text')!);
    const props: Props = {
      label: item.label ?? field,
      value,
      validationGroup: this.formParts.group,
      // Not given: the field takes the design language's default.
      labelMode: () => this.getProperty<FieldLabelMode | undefined>('labelMode'),
      readOnly: () => {
        void parts.version.value;
        return !!this.getProperty<boolean>('readOnly') || givenField(cell.item.value, 'readOnly') === true;
      },
      stretch: true,
      ...item.editorProps,
      // The item's own handler runs too, between the field written and the change told.
      onValueChanged: (e: ValueChangedEventArgs<unknown>) => {
        const data = this.peekProperty<T | null>('data') as Record<string, unknown> | null;
        const told = e.byUser && !!data;
        if (told) data![field] = e.value;
        (cell.item.peek().editorProps?.onValueChanged as ((e: ValueChangedEventArgs<unknown>) => void) | undefined)?.(e);
        if (told) this.props?.onFieldChanged?.({ field, value: e.value, data: data as T });
      },
    };
    for (const key of ['required', 'rules', 'helpText', 'enabled'] as const) if (item[key] !== undefined) props[key] = item[key];
    const editor = factory(props);
    parts.editors.set(field, editor);
    cell.editor = editor;
    gone.push(() => {
      // An editor made again for the field is not this one's to forget.
      if (parts.editors.get(field) !== editor) return;
      parts.editors.delete(field);
      parts.fieldItems.delete(field);
      parts.fieldVersions.delete(field);
    });
    return editor;
  }

  /** An editor that fits the value: text, number, check box or date. */
  private editorFor(value: unknown): string {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'checkbox';
    if (value instanceof Date) return 'date';
    return 'text';
  }
}
