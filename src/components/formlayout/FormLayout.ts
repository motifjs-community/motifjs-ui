import { Component, createSignal, untracked, type Bind, type ComponentBase, type IBaseProp, type Signal } from '@motifx/core';
import { Control } from '../../core/control';
import { follow } from '../../core/follow';
import { givenField, givenList, givenValue } from '../../core/given-field';
import type { FieldLabelMode } from '../../parts/field/field-label-mode';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import { ValidationGroup } from '../../parts/validation/ValidationGroup';
import type { ValidationResult } from '../../parts/validation/validation-result';
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
  made: ComponentBase[];
  editors: Map<string, ComponentBase>;
  stops: (() => void)[];
  /** The tabs of the form, so a check can show the tab of the field that failed. */
  tabs: Tabs[];
  /** Every item drawn, in order: `refresh` draws the form again only when they are no longer the same. */
  drawn: object[];
  /** The item of each field's editor. */
  fieldItems: Map<string, FormItem>;
  /** Bumped by `refresh`: the items' fields and the data are read again. */
  version: Signal<number>;
  /** Bumped by `refreshField`, by field. */
  fieldVersions: Map<string, Signal<number>>;
  /** The items and the data the form was made of: a `reState()` that finds the same ones makes nothing again. */
  madeOf: { items: unknown; data: unknown } | null;
}

/** Props an editor takes from its item, given again by `refresh`. */
const ITEM_PROPS = ['label', 'required', 'rules', 'helpText', 'enabled'] as const;

/**
 * Lays out the fields of a data object: each item a field with its editor (chosen by name, by the
 * type of the value, or made by a function), a group under a caption, tabs, a button or a
 * component of your own. The editors are bound to the object both ways and checked together (the
 * ones on hidden tabs too); sending the form checks them first.
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
  /** The editors forms know by name; add yours: `FormLayout.editors.set('color', (p) => new ColorBox(p))`. */
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
    this.element.classList.add('mx-form-layout');
    this.element.noValidate = true;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    this.observeProperty<number>('columns', (n) => this.element.style.setProperty('--_form-columns', String(Math.max(1, n || 1))));
    this.observeProperty<string>('minColumnWidth', (width) => {
      if (width) this.element.style.setProperty('--_form-min', width);
      else this.element.style.removeProperty('--_form-min');
      this.element.toggleAttribute('data-fluid', !!width);
    });
    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      void this.submit(e);
    });
    this.motif.on('x:built', () => {
      // Items and data: what the form is made of.
      follow(
        this,
        'form',
        () => ({ items: this.getProperty('items'), data: this.getProperty('data') }),
        (now) => {
          const was = this.formParts.madeOf;
          if (was && was.items === now.items && was.data === now.data) return;
          this.formParts.madeOf = now;
          this.render();
        },
      );
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

  /** The group every field of the form is checked in. */
  get validationGroup(): ValidationGroup {
    return this.formParts.group;
  }

  get isValid(): boolean {
    return this.formParts.group.isValid;
  }

  /** The editor of a field. */
  editorOf(field: string): ComponentBase | undefined {
    return this.formParts.editors.get(field);
  }

  /** Checks every field; the first one that failed gets focus (its tab shown first) unless `focus` is `false`. */
  async validate(options?: { focus?: boolean }): Promise<ValidationResult> {
    const result = await this.formParts.group.validate({ focus: false });
    if (options?.focus !== false) {
      for (const target of result.invalid) {
        this.reveal(target.element);
        if (target.focus()) break;
      }
    }
    return result;
  }

  resetValidation(): void {
    this.formParts.group.reset();
  }

  /**
   * Reads your data object and the items again after they were changed in place: every editor's value, the items'
   * texts and states, and the layout when items were added or removed. Your data and items may be plain or
   * reactive; the form reads them as they are.
   */
  refresh(): void {
    const parts = this.formParts;
    const items = this.peekProperty<readonly FormItem[]>('items') ?? [];
    const now = this.flatten(items);
    if (now.length !== parts.drawn.length || now.some((item, i) => item !== parts.drawn[i])) {
      untracked(() => this.render());
      return;
    }
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

  /** Reads one field of your data object again, after it was changed in place. */
  refreshField(field: string): void {
    const version = this.formParts.fieldVersions.get(field);
    if (version) version.value = version.peek() + 1;
  }

  /** Checks every field, then reports the form as sent (`onValidSubmit`) or not (`onInvalidSubmit`). */
  async submit(event: Event = new Event('submit')): Promise<boolean> {
    const result = await this.validate();
    if (result.valid) this.props?.onValidSubmit?.({ data: this.peekProperty<T | null>('data') ?? null, event });
    else this.props?.onInvalidSubmit?.(result);
    return result.valid;
  }

  private get formParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= {
      group: new ValidationGroup(),
      made: [],
      editors: new Map(),
      stops: [],
      tabs: [],
      drawn: [],
      fieldItems: new Map(),
      version: createSignal(0),
      fieldVersions: new Map(),
      madeOf: null,
    });
  }

  /** The items and every item inside them (groups, tabs), in order. */
  private flatten(items: readonly FormItem[], into: object[] = []): object[] {
    for (const item of givenList(items)) {
      into.push(item);
      this.flatten(givenValue<readonly FormItem[] | undefined>(item, 'items') ?? [], into);
      for (const page of givenList(givenValue<readonly FormTab[] | undefined>(item, 'tabs'))) {
        into.push(page);
        this.flatten(givenValue<readonly FormItem[]>(page, 'items') ?? [], into);
      }
    }
    return into;
  }

  private clear(): void {
    const parts = this.formParts;
    for (const stop of parts.stops.splice(0)) stop();
    for (const made of parts.made.splice(0)) if (!made.isDisposed) void made.dispose();
    parts.editors.clear();
    parts.fieldItems.clear();
    parts.fieldVersions.clear();
    parts.tabs.length = 0;
  }

  /** Selects the tab an element is on (each tab up from it, for tabs in tabs). */
  private reveal(element: Element): void {
    for (const tabs of this.formParts.tabs) {
      const tab = tabs.tabs.find((t) => t.element.contains(element));
      if (tab && tabs.selectedTab !== tab) tabs.selectedIndex = tabs.tabs.indexOf(tab);
    }
  }

  private render(): void {
    this.clear();
    const items = this.peekProperty<readonly FormItem[]>('items') ?? [];
    this.formParts.drawn = this.flatten(items);
    this.element.querySelector(':scope > .mx-form-layout__grid')?.remove();
    const grid = this.element.appendChild(document.createElement('div'));
    grid.className = 'mx-form-layout__grid';
    for (const item of givenList(items)) this.place(item, grid);
  }

  private place(item: FormItem, host: HTMLElement): void {
    const parts = this.formParts;
    const cell = host.appendChild(document.createElement('div'));
    cell.className = 'mx-form-layout__item';
    if (item.colSpan === 'all') cell.dataset.span = 'all';
    else if (item.colSpan && item.colSpan > 1) cell.style.setProperty('--_form-span', String(item.colSpan));
    // The items' own functions are followed; their fields are read again by `refresh`.
    parts.stops.push(
      follow(
        this,
        'itemVisible',
        () => {
          void parts.version.value;
          return givenField(item, 'visible') === false;
        },
        (hidden) => (cell.hidden = hidden),
      ),
    );

    if (item.items) {
      const group = cell.appendChild(document.createElement('fieldset'));
      group.className = 'mx-form-layout__group';
      cell.dataset.span = item.colSpan === undefined ? 'all' : cell.dataset.span;
      if (item.group !== undefined) {
        const legend = group.appendChild(document.createElement('legend'));
        legend.className = 'mx-form-layout__caption';
        parts.stops.push(
          follow(
            this,
            'groupCaption',
            () => {
              void parts.version.value;
              return givenField<string | undefined>(item, 'group') ?? '';
            },
            (caption) => (legend.textContent = caption),
          ),
        );
      }
      const inner = group.appendChild(document.createElement('div'));
      inner.className = 'mx-form-layout__grid';
      if (item.columns) inner.style.setProperty('--_form-columns', String(item.columns));
      for (const child of givenList(item.items)) this.place(child, inner);
      return;
    }
    if (item.tabs) {
      cell.dataset.span = item.colSpan === undefined ? 'all' : cell.dataset.span;
      this.placeTabs(item, cell);
      return;
    }
    const context = { data: (this.peekProperty<T | null>('data') ?? null) as Record<string, unknown> | null, field: item.field ?? '', validationGroup: parts.group };
    const component = item.template ? item.template(context) : item.button ? this.button(item) : item.field ? this.editor(item) : null;
    if (!component) return;
    this.controls.add(component);
    parts.made.push(component);
    cell.append(component.element as Node);
    if (item.button) cell.dataset.kind = 'button';
  }

  /** Tabs of items: every panel is built at once, so every field is checked whichever tab shows. */
  private placeTabs(item: FormItem, cell: HTMLElement): void {
    const parts = this.formParts;
    const tabs = new Tabs({ lazy: false, label: item.label });
    tabs.class.add('mx-form-layout__tabs');
    for (const page of givenList(item.tabs)) {
      const tab = new Tab({
        title: page.title,
        visible: page.visible,
        content: () => {
          const panel = new Component<HTMLDivElement>('div');
          panel.element.className = 'mx-form-layout__grid';
          if (page.columns) panel.element.style.setProperty('--_form-columns', String(page.columns));
          for (const child of givenList(page.items)) untracked(() => this.place(child, panel.element));
          return panel;
        },
      });
      tabs.add(tab);
    }
    this.controls.add(tabs);
    parts.made.push(tabs);
    parts.tabs.push(tabs);
    cell.append(tabs.element as Node);
  }

  private button(item: FormItem): ComponentBase {
    const { submit, ...props } = item.button!;
    return new Button({ ...props, type: submit ? 'submit' : (props.type ?? 'button') });
  }

  private editor(item: FormItem): ComponentBase {
    const parts = this.formParts;
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
    const name = item.editor ?? this.editorFor(untracked(value));
    const factory = typeof name === 'function' ? name : (FormLayout.editors.get(name) ?? FormLayout.editors.get('text')!);
    const props: Props = {
      label: item.label ?? field,
      value,
      validationGroup: this.formParts.group,
      // Not given: the field takes the design language's default.
      labelMode: () => this.getProperty<FieldLabelMode | undefined>('labelMode'),
      readOnly: () => {
        void parts.version.value;
        return !!this.getProperty<boolean>('readOnly') || givenField(item, 'readOnly') === true;
      },
      stretch: true,
      ...item.editorProps,
      // The item's own handler runs too, between the field written and the change told.
      onValueChanged: (e: ValueChangedEventArgs<unknown>) => {
        const data = this.peekProperty<T | null>('data') as Record<string, unknown> | null;
        const told = e.byUser && !!data;
        if (told) data![field] = e.value;
        (item.editorProps?.onValueChanged as ((e: ValueChangedEventArgs<unknown>) => void) | undefined)?.(e);
        if (told) this.props?.onFieldChanged?.({ field, value: e.value, data: data as T });
      },
    };
    for (const key of ['required', 'rules', 'helpText', 'enabled'] as const) if (item[key] !== undefined) props[key] = item[key];
    const editor = factory(props);
    this.formParts.editors.set(field, editor);
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
