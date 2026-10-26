import { Component, reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { DateBox } from '../datebox/DateBox';
import { DropDown } from '../dropdown/DropDown';
import { NumberBox } from '../numberbox/NumberBox';
import { TagBox } from '../tagbox/TagBox';
import { TextBox } from '../textbox/TextBox';
import { FilterBuilder } from './FilterBuilder';
import type { FilterBuilderCustomOperation } from './filter-builder-custom-operation';
import type { FilterBuilderField } from './filter-builder-field';
import { filterText } from './filter-text';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('dir');
  uiLocale.strings = enStrings;
  vi.restoreAllMocks();
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 6; i++) await tick();
}

const fields: FilterBuilderField[] = [
  { dataField: 'city', caption: 'City' },
  { dataField: 'amount', caption: 'Amount', dataType: 'number' },
  { dataField: 'orderDate', dataType: 'date' },
  { dataField: 'paid', caption: 'Paid', dataType: 'boolean' },
  { dataField: 'state', caption: 'State', lookup: { dataSource: [{ id: 1, name: 'Open' }, { id: 2, name: 'Closed' }], valueField: 'id', textField: 'name' } },
  { dataField: 'note', caption: 'Note', dataType: 'object' },
];

const rows = (b: FilterBuilder) => Array.from(b.treeElement!.querySelectorAll<HTMLElement>(':scope > [role="row"]'));
const face = (row: HTMLElement, part: string) => row.querySelector<HTMLButtonElement>(`[data-part="${part}"] .mx-button__face`)!;
const rowText = (row: HTMLElement) =>
  Array.from(row.querySelectorAll<HTMLElement>('[data-part]:not([data-part="remove"]):not([data-part="add"]) .mx-button__face'))
    .map((f) => f.textContent!.trim())
    .join(' ');
const menuItems = (row: HTMLElement, part: string) => Array.from(row.querySelectorAll<HTMLButtonElement>(`[data-part="${part}"] .mx-menu__item`));

/** Opens a button's menu and chooses the item with that text. */
function choose(row: HTMLElement, part: string, text: string) {
  face(row, part).click();
  const item = menuItems(row, part).find((i) => i.textContent!.trim() === text);
  if (!item) throw new Error(`no "${text}" in ${menuItems(row, part).map((i) => i.textContent).join(', ')}`);
  item.click();
}

function press(key: string, init: KeyboardEventInit = {}) {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

function type(text: string) {
  const input = document.activeElement as HTMLInputElement;
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

const focusedPart = () => (document.activeElement as HTMLElement).closest<HTMLElement>('[data-part]')?.dataset.part;
const focusedRow = (b: FilterBuilder) => rows(b).indexOf((document.activeElement as HTMLElement).closest<HTMLElement>('[role="row"]')!);

describe('FilterBuilder', () => {
  it('shows a value as a tree of rows with levels, and gives the same value back', async () => {
    const value = data.and(
      data.where('city', '=', 'Ankara'),
      data.or(data.where('amount', '>', 100), data.where('amount', 'between', [1, 5])),
      data.not(data.and(data.where('paid', '=', true), data.where('note', 'isblank'))!),
    );
    const b = new FilterBuilder({ fields, value });
    page(b);
    await settle();
    const tree = b.treeElement!;
    expect(tree.getAttribute('role')).toBe('treegrid');
    expect(tree.getAttribute('aria-label')).toBe('Filter');
    const r = rows(b);
    expect(r.map((x) => x.getAttribute('aria-level'))).toEqual(['1', '2', '2', '3', '3', '2', '3', '3']);
    expect(r.map(rowText)).toEqual([
      'And',
      'City Equals Ankara',
      'Or',
      'Amount Is greater than 100',
      'Amount Is between 1 – 5',
      'Not And',
      'Paid Equals true',
      'Note Is blank',
    ]);
    expect(r[1].getAttribute('aria-posinset')).toBe('1');
    expect(r[1].getAttribute('aria-setsize')).toBe('3');
    expect(r.every((x) => x.querySelectorAll('[role="gridcell"]').length > 0)).toBe(true);
    // The root has no remove button.
    expect(r[0].querySelector('[data-part="remove"]')).toBeNull();
    expect(face(r[1], 'field').getAttribute('aria-label')).toBe('Field: City');
    expect(face(r[1], 'operation').getAttribute('aria-label')).toBe('Operation: Equals');
    expect(face(r[1], 'value').getAttribute('aria-label')).toBe('Value: Ankara');
    expect(face(r[2], 'group').getAttribute('aria-label')).toBe('Group operation: Or');
    expect(face(r[0], 'add').getAttribute('aria-haspopup')).toBe('menu');
    expect(b.value).toEqual(value);
    expect(b.filterText).toBe("[City] Equals 'Ankara' And ([Amount] Is greater than '100' Or [Amount] Is between('1', '5')) And Not ([Paid] Equals 'true' And [Note] Is blank)");
  });

  it('adds conditions and groups with the mouse, and the value follows', async () => {
    const changes: (data.FilterExpression | null)[] = [];
    const b = new FilterBuilder({ fields, onValueChanged: (e) => void changes.push(e.value) });
    page(b);
    await settle();
    choose(rows(b)[0], 'add', 'Add Condition');
    await settle();
    expect(rows(b)).toHaveLength(2);
    expect(rowText(rows(b)[1])).toBe('City Contains <enter a value>');
    // A condition without its value is not in the value yet.
    expect(b.value).toBeNull();
    expect(changes).toEqual([]);
    expect(focusedRow(b)).toBe(1);
    expect(focusedPart()).toBe('field');

    choose(rows(b)[1], 'field', 'Amount');
    choose(rows(b)[1], 'operation', 'Is greater than');
    expect(rowText(rows(b)[1])).toBe('Amount Is greater than <enter a value>');
    face(rows(b)[1], 'value').click();
    expect(b.editingCondition).not.toBeNull();
    const editor = b.element.querySelector('.mx-filter-builder__editor .mx-numberbox, .mx-filter-builder__editor input');
    expect(editor).not.toBeNull();
    type('250');
    press('Enter');
    await settle();
    expect(b.editingCondition).toBeNull();
    expect(b.value).toEqual(data.where('amount', '>', 250));
    expect(changes).toEqual([data.where('amount', '>', 250)]);
    expect(focusedPart()).toBe('value');

    choose(rows(b)[0], 'add', 'Add Group');
    await settle();
    expect(rows(b).map((r) => r.getAttribute('aria-level'))).toEqual(['1', '2', '2', '3']);
    choose(rows(b)[2], 'group', 'Or');
    expect(rowText(rows(b)[2])).toBe('Or');
    face(rows(b)[3], 'remove').click();
    await settle();
    expect(rows(b)).toHaveLength(3);
    face(rows(b)[2], 'remove').click();
    expect(rows(b)).toHaveLength(2);
    expect(b.value).toEqual(data.where('amount', '>', 250));
  });

  it('is one Tab stop moved with the arrow keys, and builds a filter from the keyboard alone', async () => {
    const b = new FilterBuilder({ fields });
    page(b);
    await settle();
    const tabbable = () => Array.from(b.element.querySelectorAll<HTMLElement>('.mx-button__face')).filter((f) => f.tabIndex >= 0);
    expect(tabbable()).toHaveLength(1);
    expect(b.focus()).toBe(true);
    expect(focusedPart()).toBe('group');
    // Insert adds a condition to the focused row's group; focus goes to its field.
    press('Insert');
    await settle();
    expect(rows(b)).toHaveLength(2);
    expect(focusedPart()).toBe('field');
    expect(tabbable()).toHaveLength(1);
    // Alt+Down opens the field menu; the arrows of the menu choose.
    expect(press('ArrowDown', { altKey: true })).toBe(true);
    const fieldItems = menuItems(rows(b)[1], 'field');
    expect(document.activeElement).toBe(fieldItems[0]);
    fieldItems[1].click();
    expect(rowText(rows(b)[1])).toBe('Amount Equals <enter a value>');
    expect(focusedPart()).toBe('field');
    press('ArrowRight');
    expect(focusedPart()).toBe('operation');
    press('ArrowRight');
    expect(focusedPart()).toBe('value');
    press('ArrowRight');
    expect(focusedPart()).toBe('value');
    // Enter on the value opens its editor; Enter keeps the value.
    (document.activeElement as HTMLElement).click();
    expect(b.editingCondition).not.toBeNull();
    type('42');
    press('Enter');
    await settle();
    expect(b.value).toEqual(data.where('amount', '=', 42));
    // Escape gives an edit up.
    press('F2');
    type('7');
    press('Escape');
    await settle();
    expect(b.editingCondition).toBeNull();
    expect(b.value).toEqual(data.where('amount', '=', 42));
    expect(focusedPart()).toBe('value');
    // Up and Down keep the column where they can; Home and End go to the row's ends.
    press('ArrowUp');
    expect(focusedRow(b)).toBe(0);
    press('ArrowDown');
    expect(focusedRow(b)).toBe(1);
    press('Home');
    expect(focusedPart()).toBe('remove');
    press('End');
    expect(focusedPart()).toBe('value');
    press('Home', { ctrlKey: true });
    expect(focusedRow(b)).toBe(0);
    // A group from the keyboard: the add menu, Down, Enter.
    press('ArrowRight');
    expect(focusedPart()).toBe('add');
    press('ArrowDown', { altKey: true });
    const addItems = menuItems(rows(b)[0], 'add');
    expect(addItems.map((i) => i.textContent!.trim())).toEqual(['Add Condition', 'Add Group']);
    addItems[1].click();
    await settle();
    expect(rows(b).map((r) => r.getAttribute('aria-level'))).toEqual(['1', '2', '2', '3']);
    expect(focusedRow(b)).toBe(3);
    // Delete takes the focused row out.
    press('Delete');
    await settle();
    expect(rows(b)).toHaveLength(3);
    expect(focusedRow(b)).toBe(2);
    press('Delete');
    expect(rows(b)).toHaveLength(2);
    expect(b.value).toEqual(data.where('amount', '=', 42));
    expect(tabbable()).toHaveLength(1);
  });

  it('edits a range in two boxes, Tab between them, and keeps a value when focus leaves', async () => {
    const outside = document.createElement('button');
    const b = new FilterBuilder({ fields, value: data.where('amount', 'between', [1, 5]) });
    page(b);
    document.body.append(outside);
    await settle();
    b.focusItem(b.root.items[0], 'value');
    press('Enter');
    (document.activeElement as HTMLElement).click();
    expect(b.editingCondition).not.toBeNull();
    const boxes = () => [...b.element.querySelectorAll<HTMLInputElement>('.mx-filter-builder__editor input')];
    expect(boxes()).toHaveLength(2);
    type('2');
    expect(press('Tab')).toBe(true);
    expect(document.activeElement).toBe(boxes()[1]);
    type('8');
    expect(press('Tab', { shiftKey: true })).toBe(true);
    expect(document.activeElement).toBe(boxes()[0]);
    // Focus going elsewhere keeps the value.
    outside.focus();
    await new Promise((r) => setTimeout(r, 10));
    expect(b.editingCondition).toBeNull();
    expect(b.value).toEqual(data.where('amount', 'between', [2, 8]));
    expect(document.activeElement).toBe(outside);
  });

  it('moves the other way in a right-to-left page', async () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const b = new FilterBuilder({ fields, value: data.where('city', '=', 'A') });
    page(b);
    await settle();
    b.focusItem(b.root.items[0], 'field');
    press('ArrowLeft');
    expect(focusedPart()).toBe('operation');
    press('ArrowRight');
    expect(focusedPart()).toBe('field');
  });

  it('offers the operations of each data type, with the editor of that type', async () => {
    const b = new FilterBuilder({ fields });
    page(b);
    await settle();
    const ops = (dataField: string) => b.model.operations(b.model.field(dataField)!);
    expect(ops('city')).toEqual(['contains', 'notcontains', 'startswith', 'endswith', '=', '<>', 'isblank', 'isnotblank']);
    expect(ops('amount')).toEqual(['=', '<>', '<', '>', '<=', '>=', 'between', 'isblank', 'isnotblank']);
    expect(ops('orderDate')).toEqual(['=', '<>', '<', '>', '<=', '>=', 'between', 'isblank', 'isnotblank']);
    expect(ops('paid')).toEqual(['=', '<>', 'isblank', 'isnotblank']);
    expect(ops('state')).toEqual(['=', '<>', 'isblank', 'isnotblank']);
    expect(ops('note')).toEqual(['isblank', 'isnotblank']);

    const editorOf = (dataField: string, operation: string) => {
      const c = b.addCondition(b.root, dataField)!;
      b.setOperation(c, operation);
      expect(b.openEditor(c)).toBe(true);
      const made = [...b.element.querySelectorAll<HTMLElement>('.mx-filter-builder__editor > *')];
      b.closeEditor(false);
      b.removeItem(c);
      return made;
    };
    expect(editorOf('city', 'contains')).toHaveLength(1);
    // "Between": two editors, from and to, named for the field.
    const range = editorOf('amount', 'between');
    expect(range).toHaveLength(2);
    expect(range.map((el) => el.querySelector('input')!.getAttribute('aria-label') ?? el.querySelector('label')?.textContent)).toEqual(['Amount, from', 'Amount, to']);
    expect(editorOf('orderDate', 'between')).toHaveLength(2);
    // No value: no value button, no editor.
    const blank = b.addCondition(b.root, 'note')!;
    expect(b.openEditor(blank)).toBe(false);
    expect(rows(b)[1].querySelector('[data-part="value"]')).toBeNull();
    expect(rowText(rows(b)[1])).toBe('Note Is blank');
    b.removeItem(blank);

    const prepared: unknown[] = [];
    b.onEditorPrepared((e) => void prepared.push(e.editor));
    const open = (dataField: string, operation: string) => {
      const c = b.addCondition(b.root, dataField)!;
      b.setOperation(c, operation);
      b.openEditor(c);
      const editor = prepared[prepared.length - 1];
      b.closeEditor(false);
      b.removeItem(c);
      return editor;
    };
    expect(open('city', 'startswith')).toBeInstanceOf(TextBox);
    expect(open('amount', '<')).toBeInstanceOf(NumberBox);
    expect(open('orderDate', '>=')).toBeInstanceOf(DateBox);
    expect(open('paid', '=')).toBeInstanceOf(DropDown);
    expect(open('state', '=')).toBeInstanceOf(DropDown);
    b.fields = fields.map((f) => (f.dataField === 'state' || f.dataField === 'city' ? { ...f, filterOperations: ['=', 'anyof', 'noneof'] } : f));
    await settle();
    expect(b.model.operations(b.model.field('state')!)).toEqual(['=', 'in', 'notin']);
    expect(open('state', 'in')).toBeInstanceOf(TagBox);
    expect(open('city', 'notin')).toBeInstanceOf(TagBox);
  });

  it('keeps every operation and type in the value, and texts its values', async () => {
    const day = new Date(2026, 2, 5);
    const b = new FilterBuilder({ fields, locale: 'en-US' });
    page(b);
    await settle();
    const all: [string, string, unknown][] = [
      ['city', 'contains', 'an'],
      ['city', 'notcontains', 'x'],
      ['city', 'startswith', 'A'],
      ['city', 'endswith', 'a'],
      ['city', '=', 'Ankara'],
      ['city', '<>', 'İzmir'],
      ['city', 'isblank', undefined],
      ['city', 'isnotblank', undefined],
      ['amount', '<', 5],
      ['amount', '<=', 5],
      ['amount', '>', 5],
      ['amount', '>=', 5],
      ['amount', 'between', [1, 9]],
      ['orderDate', '=', day],
      ['orderDate', 'between', [day, null]],
      ['paid', '<>', false],
      ['state', '=', 2],
    ];
    for (const [f, op, v] of all) {
      const c = b.addCondition(b.root, f)!;
      expect(b.setOperation(c, op), `${f} ${op}`).toBe(true);
      if (v !== undefined) b.setConditionValue(c, v);
    }
    const expected = data.and(...all.map(([f, op, v]) => (v === undefined ? data.where(f, op as data.FilterOperator) : data.where(f, op as data.FilterOperator, v))));
    expect(b.value).toEqual(expected);
    const text = b.filterText;
    expect(text).toContain("[Order Date] Equals '3/5/26'");
    expect(text).toContain("[Order Date] Is between('3/5/26', '')");
    expect(text).toContain("[Paid] Does not equal 'false'");
    expect(text).toContain("[State] Equals 'Closed'");
    expect(text).toContain("[Amount] Is between('1', '9')");
    expect(text).toContain('[City] Is not blank');
    // The same value given again draws the same rows.
    const again = new FilterBuilder({ fields, value: expected, locale: 'en-US' });
    page(again);
    await settle();
    expect(again.value).toEqual(expected);
    expect(rows(again).map(rowText)).toEqual(rows(b).map(rowText));
    expect(filterText(expected, { fields, locale: 'en-US' })).toBe(text);
  });

  it('changes a condition to another field and operation, keeping what still fits', async () => {
    const b = new FilterBuilder({ fields, value: data.where('amount', 'between', [1, 5]) });
    page(b);
    await settle();
    const c = b.root.items[0] as import('./filter-builder-condition').FilterBuilderCondition;
    b.setOperation(c, '>');
    expect(b.value).toEqual(data.where('amount', '>', 1));
    b.setOperation(c, 'between');
    expect(b.value).toEqual(data.where('amount', 'between', [1, null]));
    b.setOperation(c, 'isblank');
    expect(b.value).toEqual(data.where('amount', 'isblank'));
    b.setOperation(c, '=');
    expect(b.value).toBeNull();
    b.setConditionValue(c, 3);
    b.setField(c, 'city');
    // A text field has no "=" first, but offers it: the operation stays, the number does not.
    expect(c.operation).toBe('=');
    expect(c.value).toBeUndefined();
    b.setField(c, 'note');
    expect(c.operation).toBe('isblank');
    expect(b.setOperation(c, 'contains')).toBe(false);
  });

  it('limits groups with maxGroupLevel and the group operations with groupOperations', async () => {
    const s = reactive({ max: 1 as number | null });
    const b = new FilterBuilder({ fields, maxGroupLevel: () => s.max, groupOperations: ['and', 'or'] });
    page(b);
    await settle();
    const inner = b.addGroup()!;
    expect(inner).not.toBeNull();
    expect(b.addGroup(inner)).toBeNull();
    const r = rows(b);
    // The group at the limit adds conditions only: a plain button.
    expect(face(r[1], 'add').getAttribute('aria-haspopup')).toBeNull();
    expect(face(r[1], 'add').getAttribute('aria-label')).toBe('Add Condition');
    face(r[1], 'add').click();
    expect(inner.items).toHaveLength(2);
    face(rows(b)[0], 'group').click();
    expect(menuItems(rows(b)[0], 'group').map((i) => i.textContent!.trim())).toEqual(['And', 'Or']);
    s.max = 0;
    await settle();
    expect(face(rows(b)[0], 'add').getAttribute('aria-haspopup')).toBeNull();
    expect(b.addGroup()).toBeNull();
    s.max = null;
    await settle();
    expect(b.addGroup(inner)).not.toBeNull();
  });

  it('runs custom operations: offered by data type, kept as their expression, known again', async () => {
    const lastDays: FilterBuilderCustomOperation = {
      name: 'lastDays',
      caption: 'Is in the last days',
      dataTypes: ['date'],
      customizeText: (info) => `${info.value} days`,
      calculateFilterExpression: (days, field) => data.where(field.dataField, '>=', new Date(2026, 0, 31 - (days as number))),
    };
    const zero: FilterBuilderCustomOperation = {
      name: 'isZero',
      caption: 'Is zero',
      hasValue: false,
      calculateFilterExpression: (_v, field) => data.where(field.dataField, '=', 0),
      readFilterExpression: (e) => (data.isCondition(e) && e.op === '=' && e.value === 0 ? { field: e.field, value: undefined } : null),
    };
    const own: FilterBuilderField[] = [{ dataField: 'amount', dataType: 'number', filterOperations: ['=', 'isZero'] }, { dataField: 'orderDate', dataType: 'date' }];
    const b = new FilterBuilder({ fields: own, customOperations: [lastDays, zero] });
    page(b);
    await settle();
    expect(b.model.operations(b.model.field('orderDate')!)).toContain('lastDays');
    expect(b.model.operations(b.model.field('amount')!)).toEqual(['=', 'isZero']);
    const d = b.addCondition(b.root, 'orderDate')!;
    b.setOperation(d, 'lastDays');
    b.setConditionValue(d, 1);
    const z = b.addCondition(b.root, 'amount')!;
    b.setOperation(z, 'isZero');
    expect(rowText(rows(b)[2])).toBe('Amount Is zero');
    const value = data.and(data.where('orderDate', '>=', new Date(2026, 0, 30)), data.where('amount', '=', 0));
    expect(b.value).toEqual(value);
    // The value itself comes back as the custom operations.
    const echo = new FilterBuilder({ fields: own, customOperations: [lastDays, zero], value: b.value });
    page(echo);
    await settle();
    expect(rows(echo).map(rowText)).toEqual(['And', 'Order Date Is in the last days 1 days', 'Amount Is zero']);
    // A copy of it: only the operation that reads expressions knows it again.
    const copy = new FilterBuilder({ fields: own, customOperations: [lastDays, zero], value: JSON.parse(JSON.stringify(value)) });
    page(copy);
    await settle();
    expect(rowText(rows(copy)[2])).toBe('Amount Is zero');
    expect(rowText(rows(copy)[1]).startsWith('Order Date Is greater than or equal to')).toBe(true);
  });

  it('asks before every change and lets the handler cancel or change it', async () => {
    const log: string[] = [];
    const b = new FilterBuilder({
      fields,
      onItemAdding: (e) => {
        log.push(`adding ${e.item.kind}`);
        if (e.item.kind === 'condition' && e.group.items.length >= 2) e.cancel = true;
        if (e.item.kind === 'condition') e.item.field = 'amount';
      },
      onItemAdded: (e) => void log.push(`added ${e.item.kind} ${e.byUser}`),
      onItemRemoving: (e) => {
        log.push('removing');
        e.cancel = e.item.kind === 'group';
      },
      onItemRemoved: () => void log.push('removed'),
      onItemChanging: (e) => {
        log.push(`changing ${e.change}`);
        if (e.change === 'value' && typeof e.value === 'number') e.value = e.value * 10;
        if (e.change === 'groupOperation') e.cancel = true;
      },
      onItemChanged: (e) => void log.push(`changed ${e.change} ${String(e.value)}`),
    });
    page(b);
    await settle();
    const c = b.addCondition()!;
    expect(c.field).toBe('amount');
    expect(b.addCondition()).not.toBeNull();
    expect(b.addCondition()).toBeNull();
    b.setConditionValue(c, 4);
    expect(b.value).toEqual(data.where('amount', '=', 40));
    expect(b.setGroupOperation(b.root, 'or')).toBe(false);
    expect(log).toEqual(['adding condition', 'added condition false', 'adding condition', 'added condition false', 'adding condition', 'changing value', 'changed value 40', 'changing groupOperation']);
    expect(b.addGroup()).not.toBeNull();
    log.length = 0;
    expect(b.removeItem(b.root.items[0])).toBe(true);
    const group = b.root.items.find((i) => i.kind === 'group')!;
    expect(b.removeItem(group)).toBe(false);
    expect(log).toEqual(['removing', 'removed', 'removing']);
    // From the user: byUser is true.
    log.length = 0;
    choose(rows(b).find((r) => r.dataset.kind === 'group' && r.getAttribute('aria-level') === '2')!, 'add', 'Add Condition');
    expect(log).toEqual(['adding condition', 'added condition true']);
  });

  it('prepares editors: options, an editor of your own, or none', async () => {
    const b = new FilterBuilder({
      fields: [{ dataField: 'city', caption: 'City', editorOptions: { placeholder: 'Type a city' } }, { dataField: 'code' }, { dataField: 'skip' }],
      onEditorPreparing: (e) => {
        if (e.field.dataField === 'city') e.options.maxLength = 3;
        if (e.field.dataField === 'code') {
          const own = new TextBox({ label: 'Code', labelMode: 'hidden' });
          own.onValueChanged((v) => e.setValue(v.value.toUpperCase()));
          e.editor = own;
        }
        if (e.field.dataField === 'skip') e.cancel = true;
      },
    });
    page(b);
    await settle();
    const city = b.addCondition(b.root, 'city')!;
    b.openEditor(city);
    const input = b.element.querySelector<HTMLInputElement>('.mx-filter-builder__editor input')!;
    expect(input.placeholder).toBe('Type a city');
    expect(input.maxLength).toBe(3);
    b.closeEditor(false);
    const code = b.addCondition(b.root, 'code')!;
    b.openEditor(code);
    type('ab');
    press('Enter');
    expect(code.value).toBe('AB');
    const skip = b.addCondition(b.root, 'skip')!;
    expect(b.openEditor(skip)).toBe(false);
  });

  it('gives field and operation editors of your own a context', async () => {
    let seen: unknown = null;
    const b = new FilterBuilder({
      fields: [
        {
          dataField: 'rating',
          dataType: 'number',
          editor: (ctx) => {
            seen = ctx.value;
            const box = new NumberBox({ label: 'Rating', labelMode: 'hidden', value: ctx.value as number });
            box.onValueChanged((e) => ctx.setValue(e.value));
            return box;
          },
        },
      ],
      value: data.where('rating', '>=', 3),
    });
    page(b);
    await settle();
    const c = b.root.items[0] as import('./filter-builder-condition').FilterBuilderCondition;
    b.openEditor(c);
    expect(seen).toBe(3);
    type('4');
    b.closeEditor();
    expect(b.value).toEqual(data.where('rating', '>=', 4));
  });

  it('binds its value both ways with x-model and follows the value from code', async () => {
    const s = reactive({ filter: data.where('city', '=', 'Ankara') as data.FilterExpression | null });
    const b = (<FilterBuilder fields={fields} x-model={() => s.filter} />) as unknown as FilterBuilder;
    page(b);
    await settle();
    expect(rowText(rows(b)[1])).toBe('City Equals Ankara');
    const c = b.root.items[0] as import('./filter-builder-condition').FilterBuilderCondition;
    b.setConditionValue(c, 'İzmir');
    await settle();
    expect(s.filter).toEqual(data.where('city', '=', 'İzmir'));
    s.filter = data.where('amount', '<', 9);
    await settle();
    expect(rows(b).map(rowText)).toEqual(['And', 'Amount Is less than 9']);
    b.clear();
    await settle();
    expect(s.filter).toBeNull();
    expect(rows(b)).toHaveLength(1);
  });

  it('shows dotted fields as submenus with allowHierarchicalFields', async () => {
    const b = new FilterBuilder({
      fields: [{ dataField: 'customer.name' }, { dataField: 'customer.address.city' }, { dataField: 'total', dataType: 'number' }],
      allowHierarchicalFields: true,
      value: data.where('total', '>', 1),
    });
    page(b);
    await settle();
    face(rows(b)[1], 'field').click();
    const top = menuItems(rows(b)[1], 'field').filter((i) => i.closest('.mx-menu') === rows(b)[1].querySelector('.mx-menu'));
    expect(top.map((i) => i.textContent!.trim())).toEqual(['Customer', 'Total']);
    expect(top[0].getAttribute('aria-haspopup')).toBe('menu');
    expect(b.model.caption('customer.address.city')).toBe('Customer.Address.City');
  });

  it('writes its texts from uiLocale and from texts', async () => {
    uiLocale.strings = trStrings;
    const b = new FilterBuilder({ fields, value: data.or(data.where('city', 'contains', 'an'), data.where('note', 'isnotblank')), texts: { filterBuilderLabel: 'Sipariş filtresi' } });
    page(b);
    await settle();
    expect(b.treeElement!.getAttribute('aria-label')).toBe('Sipariş filtresi');
    expect(rows(b).map(rowText)).toEqual(['Veya', 'City İçerir an', 'Note Boş değildir']);
    expect(b.filterText).toBe("[City] İçerir 'an' Veya [Note] Boş değildir");
    uiLocale.strings = enStrings;
    await settle();
    expect(rowText(rows(b)[0])).toBe('Or');
  });

  it('is disabled with enabled: false', async () => {
    const b = new FilterBuilder({ fields, value: data.where('city', '=', 'A'), enabled: false });
    page(b);
    await settle();
    const c = b.root.items[0] as import('./filter-builder-condition').FilterBuilderCondition;
    expect(b.openEditor(c)).toBe(false);
    const f = face(rows(b)[1], 'field');
    expect(f.disabled || f.getAttribute('aria-disabled') === 'true').toBe(true);
  });
});
