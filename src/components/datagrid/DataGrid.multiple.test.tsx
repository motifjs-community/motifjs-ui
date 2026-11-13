import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it } from 'vitest';
import { mount, settled } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import type { TagBox } from '../tagbox/TagBox';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumn } from './grid-column';
import type { ListOption } from './list-option';

type Row = { id: number; colors: string[] | null; labels: string[]; sizes: number[]; owners: number[] };
type Person = { id: number; name: string };

const COLORS: ListOption[] = [
  { value: 'r', label: 'Red' },
  { value: 'g', label: 'Green' },
  { value: 'b', label: 'Blue' },
];
const PEOPLE: Person[] = [
  { id: 1, name: 'Zeynep' },
  { id: 2, name: 'Ali' },
  { id: 3, name: 'Mehmet' },
];

const makeRows = (): Row[] => [
  { id: 1, colors: ['r', 'b'], labels: ['new', 'sale'], sizes: [36, 40], owners: [1, 2] },
  { id: 2, colors: ['g'], labels: [], sizes: [44], owners: [3] },
  { id: 3, colors: [], labels: ['sale'], sizes: [], owners: [] },
  { id: 4, colors: null, labels: ['old'], sizes: [38], owners: [2] },
];

/** The people's service: every load is recorded. */
class People extends data.ArrayAdapter<Person, number> {
  readonly loads: data.LoadOptions[] = [];

  constructor() {
    super({ data: PEOPLE, key: 'id' });
  }

  protected override async loadRows(options: data.LoadOptions): Promise<data.LoadResult<Person>> {
    this.loads.push(options);
    return super.loadRows(options);
  }
}

function columns(people: data.DataSource<Person, number> | readonly Person[] = PEOPLE, more: Partial<Record<keyof Row, Partial<GridColumn<Row>>>> = {}): GridColumn<Row>[] {
  return [
    { field: 'id', title: 'Id', type: 'number' },
    { field: 'colors', title: 'Colors', type: 'list', options: COLORS, multiple: true, ...more.colors },
    { field: 'labels', title: 'Labels', multiple: true, ...more.labels },
    { field: 'sizes', title: 'Sizes', type: 'number', multiple: true, ...more.sizes },
    { field: 'owners', title: 'Owners', multiple: true, lookup: { dataSource: people, valueField: 'id', textField: 'name' }, ...more.owners },
  ];
}

async function make(props: Partial<DataGridProps<Row>> = {}, rows = makeRows()) {
  const grid = mount(new DataGrid<Row>({ rowKey: 'id', columns: columns(), rows, rowHeight: 36, locale: 'en-US', ...props } as DataGridProps<Row>));
  const vp = grid.element.querySelector('.mx-data-grid__viewport') as HTMLElement;
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 360 });
  (grid as any).measure();
  await settle();
  return { grid, rows };
}

async function settle() {
  await settled(8);
}

const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const rowEl = (grid: DataGrid<any>, i: number) => grid.element.querySelector(`.mx-data-grid__body > .mx-data-grid__row[aria-rowindex="${i + 2}"]:not([hidden])`) as HTMLElement;
const cellOf = (grid: DataGrid<any>, i: number, field: string) => rowEl(grid, i).querySelector(`[data-field="${field}"]`) as HTMLElement;
/** The rows shown, in their order (pooled rows are not in it in the page). */
const shownRows = (grid: DataGrid<any>) =>
  Array.from(grid.element.querySelectorAll<HTMLElement>('.mx-data-grid__body > .mx-data-grid__row:not([hidden])')).sort((a, b) => Number(a.getAttribute('aria-rowindex')) - Number(b.getAttribute('aria-rowindex')));
const column = (grid: DataGrid<any>, field: string) =>
  shownRows(grid)
    .filter((r) => !r.classList.contains('mx-data-grid__group-row'))
    .map((r) => r.querySelector(`[data-field="${field}"]`)!.textContent);
const ids = (grid: DataGrid<any>) => column(grid, 'id').map(Number);
const options = (box: TagBox<any, any>) => Array.from(box.element.querySelectorAll<HTMLElement>('[role="option"]'));
const option = (box: TagBox<any, any>, text: string) => options(box).find((o) => o.textContent === text)!;
const tagTexts = (box: TagBox<any, any>) => Array.from(box.element.querySelectorAll<HTMLElement>('[role="listitem"]')).map((t) => t.querySelector('.mx-tag-box__tag-text')?.textContent ?? t.textContent);

function startEdit(grid: DataGrid<Row>, i: number, field: string): TagBox<any, any> {
  const cell = cellOf(grid, i, field);
  cell.focus();
  key(cell, 'Enter');
  return (grid as any).editor.field as TagBox<any, any>;
}

afterEach(async () => {
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

describe('DataGrid multiple columns: display', () => {
  it('joins the texts of the values: choices by label, numbers formatted, keys by their items', async () => {
    const { grid } = await make();
    expect(column(grid, 'colors')).toEqual(['Red, Blue', 'Green', '', '']);
    expect(column(grid, 'labels')).toEqual(['new, sale', '', 'sale', 'old']);
    expect(column(grid, 'sizes')).toEqual(['36, 40', '44', '', '38']);
    expect(column(grid, 'owners')).toEqual(['Zeynep, Ali', 'Mehmet', '', 'Ali']);
    await grid.dispose();
  });

  it('asks a lookup source for every key of the lists on screen at once, and marks a key it does not have', async () => {
    const people = new People();
    const rows = makeRows();
    rows[1].owners = [3, 9];
    const { grid } = await make({ columns: columns(new data.DataSource<Person, number>({ adapter: people, loadMode: 'page' })) }, rows);
    expect(column(grid, 'owners')).toEqual(['Zeynep, Ali', 'Mehmet, 9', '', 'Ali']);
    expect(people.loads.filter((l) => (l.filter as data.FilterCondition | undefined)?.op === 'in')).toHaveLength(1);
    expect(cellOf(grid, 1, 'owners').dataset.lookup).toBe('missing');
    expect(cellOf(grid, 0, 'owners').dataset.lookup).toBeUndefined();
    await grid.dispose();
  });
});

describe('DataGrid multiple columns: editing', () => {
  it('edits with a TagBox: picks add and take away values and keep the list open; Enter on the empty input keeps them', async () => {
    const { grid } = await make({ settings: { editable: true } });
    const box = startEdit(grid, 0, 'colors');
    expect(cellOf(grid, 0, 'colors').querySelector('.mx-tag-box')).not.toBeNull();
    expect(tagTexts(box)).toEqual(['Red', 'Blue']);
    box.open();
    await settle();
    option(box, 'Green').click();
    option(box, 'Red').click();
    await settle();
    expect((grid as any).editor).not.toBeNull();
    expect(box.opened).toBe(true);
    // Escape closes the list only; Enter then keeps the values.
    key(box.inputPart.element, 'Escape');
    expect(box.opened).toBe(false);
    expect((grid as any).editor).not.toBeNull();
    key(box.inputPart.element, 'Enter');
    await settle();
    expect((grid as any).editor).toBeNull();
    expect(column(grid, 'colors')[0]).toBe('Blue, Green');
    expect(grid.changes.updated[0].changed).toEqual({ colors: ['b', 'g'] });
    await grid.dispose();
  });

  it('takes typed texts as values in a text column, read as numbers in a number column', async () => {
    const { grid } = await make({ settings: { editable: true } });
    const labels = startEdit(grid, 1, 'labels');
    const input = labels.inputPart.element;
    input.value = 'fresh';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    key(input, 'Enter');
    await settle();
    expect(tagTexts(labels)).toEqual(['fresh']);
    key(input, 'Enter');
    await settle();
    expect(column(grid, 'labels')[1]).toBe('fresh');
    const sizes = startEdit(grid, 1, 'sizes');
    const sizeInput = sizes.inputPart.element;
    for (const text of ['46', 'big']) {
      sizeInput.value = text;
      sizeInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
      key(sizeInput, 'Enter');
    }
    key(sizeInput, 'Escape');
    key(sizeInput, 'Enter');
    await settle();
    expect(grid.changes.updated[0].changed).toEqual({ labels: ['fresh'], sizes: [44, 46] });
    await grid.dispose();
  });

  it('starts with a typed key searched; Escape closes the list, takes the text away, then ends the edit without a change', async () => {
    const { grid } = await make({ settings: { editable: true } });
    const cell = cellOf(grid, 1, 'colors');
    cell.focus();
    key(cell, 'b');
    await settle();
    const box = (grid as any).editor.field as TagBox<any, any>;
    expect(box.inputPart.element.value).toBe('b');
    expect(options(box).map((o) => o.textContent)).toEqual(['Blue']);
    key(box.inputPart.element, 'Escape');
    expect(box.opened).toBe(false);
    key(box.inputPart.element, 'Escape');
    expect(box.inputPart.element.value).toBe('');
    expect((grid as any).editor).not.toBeNull();
    key(box.inputPart.element, 'Escape');
    await settle();
    expect((grid as any).editor).toBeNull();
    expect(grid.hasChanges).toBe(false);
    await grid.dispose();
  });

  it('keeps a cell with no values as it was, and asks a required column for at least one value', async () => {
    const { grid } = await make({ settings: { editable: true }, saveMode: 'batch', columns: columns(PEOPLE, { labels: { required: true } }) });
    let box = startEdit(grid, 3, 'colors');
    key(box.inputPart.element, 'Enter');
    await settle();
    expect(grid.hasChanges).toBe(false);
    box = startEdit(grid, 3, 'labels');
    key(box.inputPart.element, 'Backspace');
    key(box.inputPart.element, 'Enter');
    await settle();
    expect(cellOf(grid, 3, 'labels').dataset.error).toBe(uiLocale.strings.required);
    await grid.dispose();
  });

  it('edits keys with a TagBox over a source of its own; the chosen names show at once', async () => {
    const people = new People();
    const source = new data.DataSource<Person, number>({ adapter: people, loadMode: 'page' });
    const { grid } = await make({ columns: columns(source), settings: { editable: true } });
    const box = startEdit(grid, 2, 'owners');
    expect(box.dataSource).not.toBe(source);
    expect(box.dataSource!.adapter).toBe(people);
    box.open();
    await settle();
    option(box, 'Mehmet').click();
    option(box, 'Zeynep').click();
    key(box.inputPart.element, 'Escape');
    key(box.inputPart.element, 'Enter');
    await settle();
    expect(column(grid, 'owners')[2]).toBe('Mehmet, Zeynep');
    expect(grid.changes.updated[0].changed).toEqual({ owners: [3, 1] });
    await grid.dispose();
  });
});

describe('DataGrid multiple columns: filters, search, sorting and grouping', () => {
  it('keeps the rows with one value that passes, none with a negative operator', async () => {
    const { grid } = await make({ settings: { filterRow: true, filterDelay: 0 } });
    grid.filters = { colors: { value: 'b' } };
    await settle();
    expect(ids(grid)).toEqual([1]);
    grid.filters = { labels: { op: '<>', value: 'sale' } };
    await settle();
    expect(ids(grid)).toEqual([2, 4]);
    grid.filters = { sizes: { op: '>', value: 39 } };
    await settle();
    expect(ids(grid)).toEqual([1, 2]);
    grid.filters = { sizes: { op: 'isblank' } };
    await settle();
    expect(ids(grid)).toEqual([3]);
    await grid.dispose();
  });

  it('lists the values one by one in the header filter, a row counted once for each', async () => {
    const rows = makeRows();
    rows[0].labels = ['new', 'sale', 'new'];
    const { grid } = await make({ settings: { headerFilter: true } }, rows);
    const values = async (field: string) => {
      (grid as any).openHeaderFilter(field, (grid as any).headerAnchor(field));
      await settle();
      const list = (grid as any).headerFilter.listBox;
      const shown = list.listItems.loaded.map((v: { text: string; count?: number }) => `${v.text}:${v.count ?? ''}`);
      return { list, shown };
    };
    const labels = await values('labels');
    expect(labels.shown).toEqual(['(empty):1', 'new:1', 'old:1', 'sale:2']);
    labels.list.value = ['sale'];
    (grid as any).headerFilter.apply();
    await settle();
    expect(ids(grid)).toEqual([1, 3]);
    // Under the other filters: the owners of rows 1 and 3.
    expect((await values('owners')).shown).toEqual(['(empty):1', 'Ali:1', 'Zeynep:1']);
    await grid.dispose();
  });

  it('searches the texts of the values', async () => {
    const { grid } = await make({ settings: { searchPanel: true, searchDelay: 0 } });
    grid.searchByText('gre');
    await settle();
    expect(ids(grid)).toEqual([2]);
    grid.searchByText('ali');
    await settle();
    expect(ids(grid)).toEqual([1, 4]);
    await grid.dispose();
  });

  it('sorts by the joined texts, empty lists last, and groups by the lists', async () => {
    const { grid } = await make();
    grid.sort = [{ field: 'owners', dir: 'asc' }];
    await settle();
    expect(column(grid, 'owners')).toEqual(['Ali', 'Mehmet', 'Zeynep, Ali', '']);
    grid.sort = [{ field: 'colors', dir: 'desc' }];
    await settle();
    expect(column(grid, 'colors')).toEqual(['Red, Blue', 'Green', '', '']);
    grid.group = [{ field: 'labels' }];
    await settle();
    const captions = shownRows(grid)
      .filter((r) => r.classList.contains('mx-data-grid__group-row'))
      .map((r) => r.querySelector('.mx-data-grid__group-cell')!.textContent!.trim());
    // An empty list is no value: its group goes last, as empty values do.
    expect(captions).toEqual(['Labels: new, sale (1)', 'Labels: old (1)', 'Labels: sale (1)', 'Labels: (empty) (1)']);
    await grid.dispose();
  });
});

describe('DataGrid multiple columns: copy, paste, export', () => {
  it('copies and exports the joined texts; pastes texts split at the separator', async () => {
    const { grid } = await make({ settings: { editable: true }, saveMode: 'batch' });
    cellOf(grid, 0, 'colors').focus();
    expect(grid.copy()).toBe('Red, Blue');
    grid.settings.copyValues = 'raw';
    expect(grid.copy()).toBe('r, b');
    const shown = await grid.exportRows();
    expect(shown[0]).toEqual({ id: '1', colors: 'Red, Blue', labels: 'new, sale', sizes: '36, 40', owners: 'Zeynep, Ali' });
    cellOf(grid, 1, 'colors').focus();
    // A text that is no choice is a message on its cell.
    expect(grid.paste('green, red\nPurple')).toBe(1);
    await settle();
    expect(column(grid, 'colors').slice(1, 3)).toEqual(['Green, Red', '']);
    expect(cellOf(grid, 2, 'colors').dataset.error).toBeTruthy();
    cellOf(grid, 0, 'owners').focus();
    expect(grid.paste('mehmet, zeynep')).toBe(1);
    await settle();
    expect(grid.changes.updated.map((u) => u.changed)).toEqual([{ colors: ['g', 'r'] }, { owners: [3, 1] }]);
    await grid.dispose();
  });
});
