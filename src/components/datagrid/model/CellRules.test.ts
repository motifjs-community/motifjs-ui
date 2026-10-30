import { describe, expect, it, vi } from 'vitest';
import { enStrings } from '../../../core/ui-locale';
import type { GridColumn } from '../grid-column';
import type { GridValidationRule } from '../grid-validation-rule';
import { CellRules } from './CellRules';
import { nothingEntered } from './nothing-entered';

type Row = { name: string; pin: string; again: string; age: number | null };

const rules = () => new CellRules<Row>((key) => enStrings[key]);
const column = (validationRules: GridValidationRule<Row>[]): GridColumn<Row> => ({ field: 'name', title: 'Name', validationRules });
const row: Row = { name: '', pin: '1234', again: '1234', age: 30 };

async function messageOf(value: unknown, list: GridValidationRule<Row>[], r = rules(), id = '1') {
  return r.check(id, column(list), value, row, nothingEntered(row));
}

describe('CellRules', () => {
  it('checks required (trimmed), numeric, range and stringLength', async () => {
    expect(await messageOf('  ', [{ type: 'required' }])).toBe('This field is required.');
    expect(await messageOf('  ', [{ type: 'required', trim: false }])).toBe('');
    expect(await messageOf('12a', [{ type: 'numeric' }])).toBe('Enter a number.');
    expect(await messageOf('12', [{ type: 'numeric' }])).toBe('');
    expect(await messageOf(5, [{ type: 'range', min: 1, max: 3 }])).toBe('Enter a value from 1 to 3.');
    expect(await messageOf(2, [{ type: 'range', min: 1, max: 3 }])).toBe('');
    expect(await messageOf('ab', [{ type: 'stringLength', min: 3 }])).toBe('Enter at least 3 characters.');
    expect(await messageOf('abcd', [{ type: 'stringLength', max: 3 }])).toBe('Enter at most 3 characters.');
  });

  it('checks pattern (found anywhere, as RegExp does), email and compare', async () => {
    expect(await messageOf('ab12', [{ type: 'pattern', pattern: '\\d+' }])).toBe('');
    expect(await messageOf('abc', [{ type: 'pattern', pattern: /^\d+$/ }])).toBe('The value is not in the expected format.');
    expect(await messageOf('a@b', [{ type: 'email' }])).toBe('Enter a valid email address.');
    expect(await messageOf('a@b.co', [{ type: 'email' }])).toBe('');
    const same: GridValidationRule<Row> = { type: 'compare', comparisonTarget: (r) => r.pin };
    expect(await messageOf('1234', [same])).toBe('');
    expect(await messageOf('1235', [same])).toBe('The values do not match.');
    expect(await messageOf(40, [{ type: 'compare', comparisonTarget: (r) => r.age, comparisonType: '>' }])).toBe('');
    expect(await messageOf(20, [{ type: 'compare', comparisonTarget: (r) => r.age, comparisonType: '>', message: 'Older, please' }])).toBe('Older, please');
  });

  it('lets an empty value pass, and as ignoreEmptyValue says', async () => {
    expect(await messageOf('', [{ type: 'email' }, { type: 'pattern', pattern: 'x' }, { type: 'numeric' }, { type: 'range', min: 1 }])).toBe('');
    expect(await messageOf('', [{ type: 'stringLength', min: 2 }])).toBe('Enter at least 2 characters.');
    expect(await messageOf('', [{ type: 'stringLength', min: 2, ignoreEmptyValue: true }])).toBe('');
    expect(await messageOf(null, [{ type: 'numeric', ignoreEmptyValue: false }])).toBe('Enter a number.');
    const custom = vi.fn(() => false);
    expect(await messageOf('', [{ type: 'custom', validationCallback: custom, ignoreEmptyValue: true }])).toBe('');
    expect(custom).not.toHaveBeenCalled();
  });

  it('runs custom rules with the row, and their texts', async () => {
    const callback = vi.fn(({ value }: { value: unknown }) => (value === 'x' ? 'No x' : value !== 'y'));
    expect(await messageOf('x', [{ type: 'custom', validationCallback: callback }])).toBe('No x');
    expect(await messageOf('y', [{ type: 'custom', validationCallback: callback, message: 'Bad' }])).toBe('Bad');
    expect(await messageOf('z', [{ type: 'custom', validationCallback: callback }])).toBe('');
    expect(callback).toHaveBeenCalledWith(expect.objectContaining({ value: 'x', row, column: expect.objectContaining({ field: 'name' }) }));
  });

  it('runs async rules after the others, together, with their answers and rejections', async () => {
    const order: string[] = [];
    const later = (text: string, answer: unknown): GridValidationRule<Row> => ({
      type: 'async',
      validationCallback: () => {
        order.push(text);
        return Promise.resolve(answer as boolean);
      },
    });
    const first: GridValidationRule<Row> = { type: 'custom', validationCallback: () => (order.push('custom'), true) };
    expect(await messageOf('a', [later('one', true), first, later('two', { isValid: false, message: 'Taken' })])).toBe('Taken');
    expect(order).toEqual(['custom', 'one', 'two']);
    expect(await messageOf('a', [{ type: 'async', validationCallback: () => Promise.reject('Server says no') }])).toBe('Server says no');
    expect(await messageOf('a', [{ type: 'async', validationCallback: () => Promise.reject(new Error('Down')) }])).toBe('Down');
    expect(await messageOf('a', [{ type: 'async', validationCallback: () => Promise.resolve(false), message: 'Nope' }])).toBe('Nope');
    // A failed rule before them: the server is not asked.
    const asked = vi.fn(() => Promise.resolve(true));
    expect(await messageOf('', [{ type: 'required' }, { type: 'async', validationCallback: asked }])).toBe('This field is required.');
    expect(asked).not.toHaveBeenCalled();
  });

  it('keeps what it found per value; reevaluate (async by default) runs again each round', async () => {
    const r = rules();
    const col = column([{ type: 'custom', validationCallback: ({ value }) => value === 'ok' }]);
    await r.check('1', col, 'bad', row, nothingEntered(row));
    expect(r.known('1', col, 'bad')).toBe('The value is not valid.');
    expect(r.known('1', col, 'ok')).toBeUndefined();
    expect(r.known('2', col, 'bad')).toBeUndefined();
    r.round++;
    expect(r.known('1', col, 'bad')).toBe('The value is not valid.');

    const server = column([{ type: 'async', validationCallback: () => Promise.resolve(true) }]);
    await r.check('1', server, 'a', row, nothingEntered(row));
    expect(r.known('1', server, 'a')).toBe('');
    r.round++;
    expect(r.known('1', server, 'a')).toBeUndefined();

    const once = column([{ type: 'async', validationCallback: () => Promise.resolve(true), reevaluate: false }]);
    await r.check('1', once, 'a', row, nothingEntered(row));
    r.round++;
    expect(r.known('1', once, 'a')).toBe('');
    r.forget('1');
    expect(r.known('1', once, 'a')).toBeUndefined();
    expect(r.waits(server)).toBe(true);
    expect(r.requires(column([{ type: 'required' }]))).toBe(true);
  });
});
