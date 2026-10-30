import { reactive, untracked } from '@motifx/core';
import { data } from '@motifx-community/data';
import { fillText } from '../../core/fill-text';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { uiLocale } from '../../core/ui-locale';
import type { UiStrings } from '../../core/ui-strings';
import { KeyedItems } from '../../parts/data/KeyedItems';
import { readItemField } from '../../parts/list/read-item-field';
import { defaultOperations } from './default-operations';
import type { FilterBuilderCondition } from './filter-builder-condition';
import type { FilterBuilderCustomOperation } from './filter-builder-custom-operation';
import type { FilterBuilderDataType } from './filter-builder-data-type';
import type { FilterBuilderField } from './filter-builder-field';
import type { FilterBuilderGroup } from './filter-builder-group';
import type { FilterBuilderGroupOperation } from './filter-builder-group-operation';
import type { FilterBuilderLookup } from './filter-builder-lookup';
import type { FilterBuilderItem } from './filter-builder-item';
import type { FilterBuilderModelOptions } from './filter-builder-model-options';
import type { FilterBuilderOperation } from './filter-builder-operation';

const GROUP_OPS: readonly FilterBuilderGroupOperation[] = ['and', 'or', 'notAnd', 'notOr'];
/** The names other filter builders use for "is any of" and "is none of". */
const ALIASES: Record<string, FilterBuilderOperation> = { anyof: 'in', noneof: 'notin' };

const OPERATION_TEXTS: Record<data.FilterOperator, keyof UiStrings> = {
  '=': 'filterOpEquals',
  '<>': 'filterOpNotEquals',
  '<': 'filterOpLess',
  '<=': 'filterOpLessOrEqual',
  '>': 'filterOpGreater',
  '>=': 'filterOpGreaterOrEqual',
  contains: 'filterOpContains',
  notcontains: 'filterOpNotContains',
  startswith: 'filterOpStartsWith',
  endswith: 'filterOpEndsWith',
  between: 'filterOpBetween',
  in: 'filterOpAnyOf',
  notin: 'filterOpNoneOf',
  isblank: 'filterOpBlank',
  isnotblank: 'filterOpNotBlank',
};

const GROUP_TEXTS: Record<FilterBuilderGroupOperation, keyof UiStrings> = {
  and: 'filterBuilderAnd',
  or: 'filterBuilderOr',
  notAnd: 'filterBuilderNotAnd',
  notOr: 'filterBuilderNotOr',
};

/** What a builder wrote for a custom condition, by the expression it wrote, so it knows it again. */
const written = new WeakMap<object, { name: string; field: string; value: unknown }>();

const empty = (v: unknown) => v === undefined || v === null || v === '' || (typeof v === 'number' && Number.isNaN(v));
const isList = (op: FilterBuilderOperation) => op === 'in' || op === 'notin';

/** `orderDate` → "Order Date", `customer.city` → "Customer.City". */
function words(dataField: string): string {
  return dataField
    .split('.')
    .map((part) =>
      part
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    )
    .join('.');
}

/**
 * The logic of a filter builder, without its view: the fields and the operations they offer, the
 * tree of groups and conditions and the data layer's filter expression it stands for (both ways),
 * and the texts of operations, values and whole filters. Reads its options each time, so they can
 * be reactive.
 */
export class FilterBuilderModel {
  /** Bumped when texts of lookup values arrive. */
  readonly state = reactive({ texts: 0 });

  constructor(private readonly options: () => FilterBuilderModelOptions) {}

  text(key: keyof UiStrings, values?: Record<string, unknown>): string {
    const t = givenValue<string | undefined>(this.options().texts, key) ?? uiLocale.strings[key];
    return fillText(t, this.locale, values);
  }

  get locale(): string {
    return this.options().locale || uiLocale.locale;
  }

  fields(): readonly FilterBuilderField[] {
    return givenList(this.options().fields);
  }

  field(dataField: string): FilterBuilderField | undefined {
    return this.fields().find((f) => givenValue(f, 'dataField') === dataField);
  }

  /** A field the builder does not know still reads: a plain text field of that name. */
  fieldOrPlain(dataField: string): FilterBuilderField {
    return this.field(dataField) ?? { dataField };
  }

  caption(dataField: string): string {
    const field = this.field(dataField);
    return (field && givenField<string | undefined>(field, 'caption')) || words(dataField);
  }

  dataType(field: FilterBuilderField): FilterBuilderDataType {
    return givenField<FilterBuilderDataType | undefined>(field, 'dataType') ?? 'string';
  }

  customOperations(): readonly FilterBuilderCustomOperation[] {
    return givenList(this.options().customOperations);
  }

  customOperation(name: FilterBuilderOperation): FilterBuilderCustomOperation | undefined {
    return this.customOperations().find((op) => givenValue(op, 'name') === name);
  }

  groupOperations(): readonly FilterBuilderGroupOperation[] {
    const own = givenList(this.options().groupOperations);
    return own.length ? own : GROUP_OPS;
  }

  maxGroupLevel(): number | null {
    const max = this.options().maxGroupLevel;
    return typeof max === 'number' ? max : null;
  }

  /** The operations a field offers, in order: its own `filterOperations`, else by its type and the custom operations for that type. */
  operations(field: FilterBuilderField): FilterBuilderOperation[] {
    const own = givenList(givenField<readonly FilterBuilderOperation[] | undefined>(field, 'filterOperations'));
    const list = own.length ? own : this.typeOperations(field);
    const out: FilterBuilderOperation[] = [];
    for (const op of list) {
      const name = ALIASES[op] ?? op;
      if (!out.includes(name) && (name in OPERATION_TEXTS || this.customOperation(name))) out.push(name);
    }
    return out;
  }

  /** The operations of a field's type, with the custom operations for that type: what a field without `filterOperations` offers. */
  typeOperations(field: FilterBuilderField): FilterBuilderOperation[] {
    const type = this.dataType(field);
    const custom = this.customOperations().filter((op) => givenList(givenValue<readonly FilterBuilderDataType[] | undefined>(op, 'dataTypes')).includes(type));
    return [...defaultOperations(type, !!givenValue(field, 'lookup')), ...custom.map((op) => givenValue<string>(op, 'name'))];
  }

  defaultOperation(field: FilterBuilderField): FilterBuilderOperation {
    const ops = this.operations(field);
    const own = givenField<FilterBuilderOperation | undefined>(field, 'defaultOperation');
    const name = own ? (ALIASES[own] ?? own) : undefined;
    return name && ops.includes(name) ? name : (ops[0] ?? '=');
  }

  hasValue(op: FilterBuilderOperation): boolean {
    const custom = this.customOperation(op);
    if (custom) return givenValue(custom, 'hasValue') !== false;
    return op !== 'isblank' && op !== 'isnotblank';
  }

  operationText(op: FilterBuilderOperation): string {
    const custom = this.customOperation(op);
    if (custom) return givenField<string>(custom, 'caption');
    const key = OPERATION_TEXTS[op as data.FilterOperator];
    return key ? this.text(key) : op;
  }

  groupText(op: FilterBuilderGroupOperation): string {
    return this.text(GROUP_TEXTS[op] ?? 'filterBuilderAnd');
  }

  // The tree.

  newGroup(operation: FilterBuilderGroupOperation = this.groupOperations()[0] ?? 'and'): FilterBuilderGroup {
    return { kind: 'group', operation, items: [], parent: null };
  }

  /** A condition on a field (the first one by default) with its default operation and no value; `null` without fields. */
  newCondition(dataField?: string): FilterBuilderCondition | null {
    const field = dataField ? this.field(dataField) : this.fields()[0];
    if (!field) return null;
    return { kind: 'condition', field: givenValue<string>(field, 'dataField'), operation: this.defaultOperation(field), value: undefined, parent: null };
  }

  /** How deep an item sits: the root is 0. */
  level(item: FilterBuilderItem): number {
    let n = 0;
    for (let p = item.parent; p; p = p.parent) n++;
    return n;
  }

  /** Whether a group may get a group inside it (`maxGroupLevel`). */
  canAddGroup(group: FilterBuilderGroup): boolean {
    const max = this.maxGroupLevel();
    return max === null || this.level(group) < max;
  }

  /** The value a condition keeps when its operation changes: a list, a range or one value, as far as it goes. */
  valueFor(operation: FilterBuilderOperation, previous: FilterBuilderOperation, value: unknown): unknown {
    if (!this.hasValue(operation) || this.customOperation(operation) || this.customOperation(previous)) return undefined;
    const many = Array.isArray(value) ? (value as unknown[]).filter((v) => !empty(v)) : empty(value) ? [] : [value];
    if (operation === 'between') return previous === 'between' ? value : [many[0] ?? null, null];
    if (isList(operation)) return isList(previous) ? value : many;
    return many[0];
  }

  /** Whether a condition has what its operation needs; one that has not is left out of the value. */
  isComplete(c: FilterBuilderCondition): boolean {
    if (!this.hasValue(c.operation)) return true;
    const v = c.value;
    if (c.operation === 'between') return Array.isArray(v) && v.length === 2 && (!empty(v[0]) || !empty(v[1]));
    if (isList(c.operation)) return Array.isArray(v) && v.length > 0;
    return !empty(v);
  }

  // Expressions.

  /** The data layer's filter a group stands for; conditions without their value are left out. */
  toExpression(group: FilterBuilderGroup): data.FilterExpression | null {
    const parts = group.items.map((item) => (item.kind === 'group' ? this.toExpression(item) : this.conditionExpression(item)));
    const joined = group.operation === 'or' || group.operation === 'notOr' ? data.or(...parts) : data.and(...parts);
    if (!joined) return null;
    return group.operation === 'notAnd' || group.operation === 'notOr' ? data.not(joined) : joined;
  }

  /** The tree of an expression: a group at the root, whatever the expression is. */
  fromExpression(e: data.FilterExpression | null | undefined): FilterBuilderGroup {
    const root = this.newGroup();
    if (!e) return root;
    const item = this.readItem(e, root);
    if (item.kind === 'group') {
      item.parent = null;
      return item;
    }
    root.items.push(item);
    return root;
  }

  /** Whether two expressions are the same filter (dates by their moment). */
  same(a: data.FilterExpression | null | undefined, b: data.FilterExpression | null | undefined): boolean {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  }

  private conditionExpression(c: FilterBuilderCondition): data.FilterExpression | null {
    if (!this.isComplete(c)) return null;
    const custom = this.customOperation(c.operation);
    if (custom) {
      const calculate = givenValue<FilterBuilderCustomOperation['calculateFilterExpression']>(custom, 'calculateFilterExpression');
      const e = calculate(c.value, this.fieldOrPlain(c.field));
      if (e && typeof e === 'object') written.set(e, { name: givenValue<string>(custom, 'name'), field: c.field, value: c.value });
      return e ?? null;
    }
    const op = c.operation as data.FilterOperator;
    if (!this.hasValue(op)) return data.where(c.field, op);
    if (op === 'between') {
      const [from, to] = c.value as unknown[];
      return data.where(c.field, op, [empty(from) ? null : from, empty(to) ? null : to]);
    }
    if (isList(op)) return data.where(c.field, op, [...(c.value as unknown[])]);
    return data.where(c.field, op, c.value);
  }

  private readItem(e: data.FilterExpression, parent: FilterBuilderGroup): FilterBuilderItem {
    const custom = this.recognize(e);
    if (custom) return { kind: 'condition', field: custom.field, operation: custom.name, value: custom.value, parent };
    if (data.isCondition(e)) {
      const value = Array.isArray(e.value) ? [...e.value] : e.value;
      return { kind: 'condition', field: e.field, operation: ALIASES[e.op] ?? e.op, value, parent };
    }
    if ('and' in e) return this.readGroup('and', e.and, parent);
    if ('or' in e) return this.readGroup('or', e.or, parent);
    const inner = e.not;
    if (!data.isCondition(inner) && !this.recognize(inner)) {
      if ('and' in inner) return this.readGroup('notAnd', inner.and, parent);
      if ('or' in inner) return this.readGroup('notOr', inner.or, parent);
    }
    return this.readGroup('notAnd', [inner], parent);
  }

  private readGroup(operation: FilterBuilderGroupOperation, items: readonly data.FilterExpression[], parent: FilterBuilderGroup): FilterBuilderGroup {
    const group: FilterBuilderGroup = { kind: 'group', operation, items: [], parent };
    for (const item of items) group.items.push(this.readItem(item, group));
    return group;
  }

  private recognize(e: data.FilterExpression): { name: string; field: string; value: unknown } | null {
    const known = written.get(e);
    if (known && this.customOperation(known.name)) return known;
    for (const op of this.customOperations()) {
      const found = givenValue<FilterBuilderCustomOperation['readFilterExpression']>(op, 'readFilterExpression')?.(e);
      if (found) return { name: givenValue<string>(op, 'name'), field: found.field, value: found.value };
    }
    return null;
  }

  // Texts.

  /** One value as text: the field's `customizeText`, its lookup's text, its format, yes / no. */
  formatValue(field: FilterBuilderField, value: unknown, operation?: FilterBuilderOperation): string {
    const valueText = this.plainText(field, value);
    const custom = operation ? this.customOperation(operation) : undefined;
    const customize =
      givenValue<FilterBuilderField['customizeText']>(custom, 'customizeText') ?? givenValue<FilterBuilderField['customizeText']>(field, 'customizeText');
    return customize ? customize({ value, valueText, field }) : valueText;
  }

  /** The text of a condition's value on its button: one value, a range ("1 – 5"), or a list ("A, B"). */
  valueText(c: FilterBuilderCondition): string {
    const field = this.fieldOrPlain(c.field);
    const v = c.value;
    if (c.operation === 'between' && Array.isArray(v)) {
      if (empty(v[0]) && empty(v[1])) return '';
      return `${this.formatValue(field, v[0], c.operation) || '…'} – ${this.formatValue(field, v[1], c.operation) || '…'}`;
    }
    if (isList(c.operation) && Array.isArray(v)) return v.map((x) => this.formatValue(field, x, c.operation)).join(', ');
    return empty(v) ? '' : this.formatValue(field, v, c.operation);
  }

  /** A filter as one line of text: `[City] Equals 'Ankara' And [Amount] Is greater than '100'`. */
  filterText(e: data.FilterExpression | null | undefined): string {
    return e ? this.groupLine(this.fromExpression(e), false) : '';
  }

  /** The text of the tree as it is (conditions without their value left out). */
  treeText(group: FilterBuilderGroup): string {
    return this.groupLine(group, false);
  }

  private groupLine(group: FilterBuilderGroup, nested: boolean): string {
    const parts = group.items.map((item) => (item.kind === 'group' ? this.groupLine(item, true) : this.conditionText(item))).filter(Boolean);
    if (!parts.length) return '';
    const and = group.operation === 'and' || group.operation === 'notAnd';
    const joined = parts.join(` ${this.text(and ? 'filterBuilderAnd' : 'filterBuilderOr')} `);
    if (group.operation === 'notAnd' || group.operation === 'notOr') return `${this.text('filterBuilderNot')} (${joined})`;
    return nested && parts.length > 1 ? `(${joined})` : joined;
  }

  private conditionText(c: FilterBuilderCondition): string {
    if (!this.isComplete(c)) return '';
    const head = `[${this.caption(c.field)}] ${this.operationText(c.operation)}`;
    if (!this.hasValue(c.operation)) return head;
    const field = this.fieldOrPlain(c.field);
    const quote = (v: unknown) => `'${this.formatValue(field, v, c.operation)}'`;
    if (Array.isArray(c.value) && (c.operation === 'between' || isList(c.operation))) return `${head}(${(c.value as unknown[]).map(quote).join(', ')})`;
    return `${head} ${quote(c.value)}`;
  }

  private plainText(field: FilterBuilderField, v: unknown): string {
    if (empty(v)) return '';
    const given = givenValue<FilterBuilderField['format']>(field, 'format');
    if (typeof given === 'function') return given(v);
    if (givenValue(field, 'lookup')) return this.lookupText(field, v);
    const type = this.dataType(field);
    const format = given as Intl.NumberFormatOptions & Intl.DateTimeFormatOptions | undefined;
    switch (type) {
      case 'number':
        return typeof v === 'number' ? new Intl.NumberFormat(this.locale, format).format(v) : String(v);
      case 'date':
      case 'datetime': {
        const d = data.toDate(v);
        if (!d) return String(v);
        const options = format ?? (type === 'datetime' ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'short' });
        return new Intl.DateTimeFormat(this.locale, options as Intl.DateTimeFormatOptions).format(d);
      }
      case 'boolean':
        return v
          ? givenField<string | undefined>(field, 'trueText') || this.text('filterBuilderTrue')
          : givenField<string | undefined>(field, 'falseText') || this.text('filterBuilderFalse');
      default:
        return String(v);
    }
  }

  /** A lookup value's text; one not known yet is asked for, and the texts are drawn again when it comes. */
  private lookupText(field: FilterBuilderField, v: unknown): string {
    const lookup = givenValue<FilterBuilderLookup>(field, 'lookup');
    const source = givenField<data.DataSource<any, any> | readonly unknown[] | undefined>(lookup, 'dataSource');
    if (!source) return String(v);
    void this.state.texts;
    const items = KeyedItems.of<unknown>(source, givenValue<string | undefined>(lookup, 'valueField'));
    const known = items.get(v);
    if (!known) {
      void items.request([v]).then(() => untracked(() => this.state.texts++));
      return String(v);
    }
    if (known.state !== 'found') return known.text ?? String(v);
    const textField = givenValue<FilterBuilderLookup['textField']>(lookup, 'textField');
    const text = typeof textField === 'function' ? untracked(() => textField(known.item)) : readItemField(known.item, textField, 'text');
    return empty(text) ? String(v) : String(text);
  }
}
