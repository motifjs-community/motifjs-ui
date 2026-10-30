import { data } from '@motifx-community/data';
import { describe, expect, it, vi } from 'vitest';
import { uiLocale } from '../../../core/ui-locale';
import type { DataGridProps } from '../data-grid-props';
import type { GridColumn } from '../grid-column';
import { GridModel } from './GridModel';

type Row = { id: number; name: string; qty: number };

const columns: GridColumn<Row>[] = [
  { field: 'id', title: 'Id', editable: false },
  { field: 'name', title: 'Name', required: true },
  { field: 'qty', title: 'Qty', type: 'number', validate: (v) => ((v as number) < 0 ? 'No negatives' : null) },
];

/** Rows in an array whose updates the test answers. */
class Rows extends data.ArrayAdapter<Row, number> {
  answer: (key: number, changes: Partial<Row>) => Promise<unknown> = () => Promise.resolve();

  protected override updateRow(key: number, changes: Partial<Row>): Promise<Partial<Row>> {
    return this.answer(key, changes).then(() => super.updateRow(key, changes));
  }
}

const flush = async () => {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0));
};

async function model(props: Partial<DataGridProps<Row>> = {}, rows: Row[] = [1, 2, 3].map((id) => ({ id, name: `n${id}`, qty: 1 }))) {
  const adapter = new Rows({ data: rows, key: 'id', createKey: () => 42 });
  const source = new data.DataSource<Row, number>({ adapter, loadMode: 'all' });
  const m = new GridModel<Row>({ columns, dataSource: source, settings: { editable: true }, ...props } as DataGridProps<Row>);
  await flush();
  const idOf = (row: Row) => m.rowIdOf(row);
  return { m, adapter, rows: source.rows as Row[], idOf };
}

describe('GridModel edits', () => {
  it('keeps edits as a draft and drops an edit back to the original value', async () => {
    const { m, rows, idOf } = await model();
    const r = rows[0];
    m.setValue(idOf(r), r, 'name', 'x');
    expect(m.status(idOf(r))).toBe('changed');
    expect(m.value(idOf(r), r, columns[1])).toBe('x');
    expect(r.name).toBe('n1');
    m.setValue(idOf(r), r, 'name', 'n1');
    expect(m.edit(idOf(r))).toBeUndefined();
  });

  it('checks fields as they change and the row before it is sent', async () => {
    const { m, rows, idOf } = await model();
    const r = rows[0];
    m.setValue(idOf(r), r, 'qty', -1);
    expect(m.error(idOf(r), 'qty')).toBe('No negatives');
    m.setValue(idOf(r), r, 'name', '');
    expect(m.validate(idOf(r))).toBe('name');
    expect(m.error(idOf(r), 'name')).toBe(uiLocale.strings.required);
    expect(m.status(idOf(r))).toBe('invalid');
  });

  it('runs validateRow: a message per field, or one for the whole row', async () => {
    const { m, rows, idOf } = await model({
      validateRow: (_r, { getValue }) => ((getValue('qty') as number) > 10 ? { qty: 'Too many', other: 'Hidden field' } : getValue('name') === 'x' ? 'Bad row' : null),
    });
    const r = rows[0];
    const id = idOf(r);
    m.setValue(id, r, 'qty', 11);
    expect(m.validate(id)).toBe('qty');
    expect(m.error(id, 'qty')).toBe('Too many');
    expect(m.rowMessage(id)).toBe('Hidden field');
    m.setValue(id, r, 'qty', 1);
    m.setValue(id, r, 'name', 'x');
    expect(m.validate(id)).toBe('');
    expect(m.rowMessage(id)).toBe('Bad row');
  });

  it('gives no message on a cell the user cannot fill, required or not', async () => {
    const { m } = await model({
      columns: [columns[0], { ...columns[1], creatable: false }, columns[2]],
      validateRow: (_r, { getValue }) => ((getValue('qty') as number) > 10 ? { name: 'Name too short for this' } : null),
    });
    const i = m.insertAdded(0, { qty: 11 });
    const id = m.rowIdAt(i)!;
    expect(m.validate(id)).toBe('');
    expect(m.error(id, 'name')).toBe('');
    expect(m.rowMessage(id)).toBe('Name too short for this');
    m.setValue(id, m.rowAt(i)!, 'qty', 2);
    expect(m.validate(id)).toBeNull();
  });

  it('batch: failed rows keep their messages, the others are saved; a failure of every row fails them all', async () => {
    const { m, adapter, rows, idOf } = await model({ saveMode: 'batch' });
    adapter.answer = async (key) => {
      if (key === 1) throw data.DataError.create('MJD202', { operation: 'update' }, 'first');
      if (key === 3) throw data.DataError.create('MJD202', { operation: 'update', fields: { qty: 'third' } }, 'third');
    };
    rows.forEach((r, i) => m.setValue(idOf(r), r, 'qty', 10 + i));
    expect(await m.saveChanges()).toEqual({ saved: 1, failed: 2 });
    expect(m.rowMessage(idOf(rows[0]))).toBe('first');
    expect(m.error(idOf(rows[2]), 'qty')).toBe('third');
    expect(m.edit(idOf(rows[1]))).toBeUndefined();
    expect(rows[1].qty).toBe(11);

    adapter.answer = async () => {
      throw new Error('offline');
    };
    expect(await m.saveChanges()).toEqual({ saved: 0, failed: 2 });
    expect(m.rowMessage(idOf(rows[0]))).toBe('offline');
    expect(m.stats.failed).toBe(2);
  });

  it('background: one queue in order; a row edited while it is saved is sent again', async () => {
    const { m, adapter, rows, idOf } = await model({ saveMode: 'background' });
    const answers: (() => void)[] = [];
    const sent: string[] = [];
    adapter.answer = (key, changes) =>
      new Promise<void>((resolve) => {
        sent.push(`${key}:${JSON.stringify(changes)}`);
        answers.push(resolve);
      });
    const [a, b] = rows;
    m.setValue(idOf(a), a, 'name', 'a1');
    void m.commit(idOf(a));
    m.setValue(idOf(b), b, 'name', 'b1');
    void m.commit(idOf(b));
    await flush();
    expect(sent).toEqual(['1:{"name":"a1"}']);
    // Edited again while its save is on the way.
    m.setValue(idOf(a), a, 'qty', 5);
    answers.shift()!();
    await flush();
    expect(sent).toEqual(['1:{"name":"a1"}', '2:{"name":"b1"}']);
    answers.shift()!();
    await flush();
    expect(sent).toEqual(['1:{"name":"a1"}', '2:{"name":"b1"}', '1:{"qty":5}']);
    answers.shift()!();
    await flush();
    expect(a).toMatchObject({ name: 'a1', qty: 5 });
    expect(m.stats.changed).toBe(0);
  });

  it('wait: commit resolves to whether the save worked; a new row gets its key', async () => {
    const { m } = await model({ saveMode: 'wait' });
    const i = m.insertAdded(0, { name: 'new' });
    const id = m.rowIdAt(i)!;
    expect(m.status(id)).toBe('new');
    const result = m.commit(id);
    expect(result).toBeInstanceOf(Promise);
    expect(await result).toBe(true);
    expect(m.rowAt(i)).toMatchObject({ id: 42, name: 'new' });
    expect(m.edit(id)).toBeUndefined();
  });

  it('batch: deletions wait for saveChanges and can be taken back', async () => {
    const { m, rows, idOf, adapter } = await model({ saveMode: 'batch' });
    const removed = vi.fn();
    adapter.onRemoved(removed);
    const r = rows[2];
    await m.removeRows([{ rowId: idOf(r), row: r, index: -1 }]);
    expect(m.status(idOf(r))).toBe('removed');
    expect(removed).not.toHaveBeenCalled();
    m.restore(idOf(r));
    expect(m.edit(idOf(r))).toBeUndefined();
    await m.removeRows([{ rowId: idOf(r), row: r, index: -1 }]);
    await m.saveChanges();
    expect(removed).toHaveBeenCalledWith(expect.objectContaining({ key: 3 }));
    expect(m.edit(idOf(r))).toBeUndefined();
  });
});
