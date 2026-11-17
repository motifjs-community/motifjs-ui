import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { mount, settled } from '../../../tests/helpers';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './data-grid-props';
import type { GridColumnItem } from './grid-column-item';

type Row = { id: number; field_1: string; field_2: string; n: number; city: string };

// The grid's stylesheet, what the generated sheets paint for it, and the schema they are written from.
const gridCss = readFileSync('src/components/datagrid/datagrid.css', 'utf8');
const unitsCss = readFileSync('src/generated/units.css', 'utf8');
const placesCss = readFileSync('src/generated/places.css', 'utf8');
const schema: unknown = JSON.parse(readFileSync('tokens/schema/datagrid.json', 'utf8'));

const makeRows = (count = 6): Row[] => Array.from({ length: count }, (_, i) => ({ id: i + 1, field_1: `a${i + 1}`, field_2: `b${i + 1}`, n: (i + 1) * 10, city: ['ank', 'brs'][i % 2] }));

async function settle() {
  await settled(8);
}

function sized<T>(grid: DataGrid<T>): DataGrid<T> {
  const vp = own(grid, '.mx-data-grid__viewport')[0];
  Object.defineProperty(vp, 'clientHeight', { configurable: true, get: () => 600 });
  Object.defineProperty(vp, 'clientWidth', { configurable: true, get: () => 900 });
  (grid as any).measure();
  return grid;
}

/** The elements a grid draws itself, not those of a grid inside it. */
function own(grid: DataGrid<any>, selector: string): HTMLElement[] {
  return Array.from(grid.element.querySelectorAll<HTMLElement>(selector)).filter((el) => el.closest('.mx-data-grid') === grid.element);
}

/**
 * What a selector matches inside a grid, whatever the grid stands in. Asked of the page and then narrowed: the test
 * document's `querySelectorAll` on an element misses `a b > c` when `a` is outside it, and its `querySelector` a
 * selector that ends in `*`.
 */
function foundIn(grid: DataGrid<any>, selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector)).filter((el) => grid.element.contains(el));
}

const flat = (rules: CSSRuleList): CSSStyleRule[] => Array.from(rules).flatMap((rule) => ('selectorText' in rule ? [rule as CSSStyleRule] : 'cssRules' in rule ? flat((rule as CSSGroupingRule).cssRules) : []));

/** The rules of a grid's own sheet (a `<style>` in the grid here: the test document adopts no sheets). */
function sheetRules(grid: DataGrid<any>): CSSStyleRule[] {
  const style = Array.from(grid.element.children).find((c): c is HTMLStyleElement => c.tagName === 'STYLE');
  return style?.sheet ? flat(style.sheet.cssRules) : [];
}

/** What the sheets of the grids on the page give an element for a property: '' when no rule of any of them reaches it. */
function given(el: Element, property: string): string {
  let value = '';
  for (const style of Array.from(document.querySelectorAll<HTMLStyleElement>('.mx-data-grid > style'))) {
    for (const rule of style.sheet ? flat(style.sheet.cssRules) : []) if (rule.style.getPropertyValue(property) && el.matches(rule.selectorText)) value = rule.style.getPropertyValue(property);
  }
  return value;
}

const headerOf = (grid: DataGrid<any>, field: string) => own(grid, `.mx-data-grid__row--header > [data-field="${field}"]`)[0];
const cellsOf = (grid: DataGrid<any>, field: string) => own(grid, `.mx-data-grid__body > .mx-data-grid__row > [data-field="${field}"]`);

/** A grid with every kind of row: bands, the header, the filter row, group rows and footers, rows, the totals. */
function rich(label: string, more: Partial<DataGridProps<Row>> = {}, cell?: () => unknown): DataGridProps<Row> {
  const columns: GridColumnItem<Row>[] = [
    { field: 'id', title: 'Id', type: 'number', width: 60 },
    {
      name: 'fields',
      title: 'Fields',
      columns: [
        { field: 'field_1', title: 'F1', width: 120, cell },
        { field: 'field_2', title: 'F2', width: 120 },
      ],
    },
    { field: 'n', title: 'N', type: 'number', width: 80 },
    { field: 'city', title: 'City', width: 100, groupIndex: 0 },
  ];
  return {
    rowKey: 'id',
    rows: makeRows(),
    columns,
    rowHeight: 36,
    locale: 'en-US',
    label,
    actions: ['remove'],
    rowDragging: { allowReordering: true },
    settings: { filterRow: true, selection: 'multiple', editable: true },
    summary: { totalItems: [{ column: 'n', summaryType: 'sum' }], groupItems: [{ column: 'n', summaryType: 'sum', showInGroupFooter: true }] },
    ...more,
  } as DataGridProps<Row>;
}

/** A selector list split at its top level. */
function split(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let at = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === '(' || list[i] === '[') depth++;
    else if (list[i] === ')' || list[i] === ']') depth--;
    else if (list[i] === ',' && !depth) {
      out.push(list.slice(at, i).trim());
      at = i + 1;
    }
  }
  out.push(list.slice(at).trim());
  return out.filter(Boolean);
}

/** Every selector of a stylesheet's rules, a list as its selectors. */
function selectorsOf(css: string): string[] {
  const out: string[] = [];
  for (const [, prelude] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{/g)) {
    const selector = prelude.trim();
    if (selector && !selector.startsWith('@')) out.push(...split(selector));
  }
  return out;
}

/** The selectors the token schema writes: of the grid, its places, its units and their states. */
function schemaSelectors(): string[] {
  const out: string[] = [];
  const walk = (node: unknown, key = '') => {
    if (typeof node === 'string') {
      if (key === 'selector' || key === '$selector' || key === 'state') out.push(...split(node));
      return;
    }
    if (!node || typeof node !== 'object') return;
    for (const [name, value] of Object.entries(node)) walk(value, key === 'states' && typeof value === 'string' ? 'state' : name === 'states' ? 'states' : name);
  };
  walk(schema);
  return out;
}

/** The grid's selectors: its own stylesheet, and what the generated sheets paint for it. */
const gridSelectors = () => [...new Set([...selectorsOf(gridCss), ...[...selectorsOf(unitsCss), ...selectorsOf(placesCss)].filter((s) => s.includes('mx-data-grid')), ...schemaSelectors()])];

/** A selector as its compounds, each with the combinator that leads to it (' ' for a descendant). */
function steps(selector: string): { compound: string; by: string }[] {
  const out: { compound: string; by: string }[] = [];
  let depth = 0;
  let compound = '';
  let by = '';
  for (const ch of selector.trim()) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (!depth && /[\s>+~]/.test(ch)) {
      if (compound) {
        out.push({ compound, by });
        compound = '';
        by = ' ';
      }
      if (ch.trim()) by = ch;
      continue;
    }
    compound += ch;
  }
  if (compound) out.push({ compound, by });
  return out;
}

/** The arguments of the pseudo-classes that take selectors (`:is`, `:where`, `:not`, `:has`), each a selector of its own. */
function inner(compound: string): string[] {
  const out: string[] = [];
  for (const m of compound.matchAll(/:(?:is|where|not|has)\(/g)) {
    let depth = 1;
    let i = m.index + m[0].length;
    const from = i;
    for (; i < compound.length && depth; i++) {
      if (compound[i] === '(') depth++;
      else if (compound[i] === ')') depth--;
    }
    out.push(...split(compound.slice(from, i - 1)));
  }
  return out;
}

/** The parts that can hold what the grid did not draw itself, another grid among it. */
const HOSTS = new Set(
  ['', '__main', '__viewport', '__head', '__body', '__foot', '__row', '__row--header', '__row--band', '__row--filter', '__group-row', '__group-footer', '__total-row', '__detail-row', '__adaptive-row', '__form-row']
    .concat(['__cell', '__header-cell', '__band', '__filter-cell', '__group-cell', '__summary-cell', '__detail-cell', '__detail-content', '__form-cell', '__form', '__editor'])
    .map((part) => `mx-data-grid${part}`),
);
const holds = (compound: string) => Array.from(compound.replace(/:(?:is|where|not|has)\(.*\)/g, '').matchAll(/\.([\w-]+)/g)).some(([, name]) => HOSTS.has(name));
/** Whether a compound depends on a state: an attribute, or a pseudo-class (a list of plain classes and `:root` are none). */
const stateful = (compound: string) => /[[:]/.test(compound.replace(/::[\w-]+/g, '').replace(/:root\b/g, '').replace(/:(?:is|where)\(([^()]*)\)/g, (all, list) => (/[[:]/.test(list) ? all : '')));

/** The place in a selector where it leaves a part's state by a descendant combinator, or null. */
function reach(selector: string): string | null {
  let armed = '';
  for (const { compound, by } of steps(selector)) {
    if (armed && by === ' ') return `${armed} … ${compound}`;
    if (stateful(compound) && holds(compound)) armed = compound;
    for (const part of inner(compound)) {
      const found = reach(part);
      if (found) return found;
    }
  }
  return null;
}

const bare = (selector: string) => selector.replace(/::[\w-]+/g, '');

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('a grid inside a grid', () => {
  it('keeps its own columns, alignment and pinned columns in the details of a grid with the same fields', async () => {
    let inside: DataGrid<Row> | null = null;
    const grid = sized(
      mount(
        new DataGrid<Row>({
          rowKey: 'id',
          rows: makeRows(),
          rowHeight: 36,
          locale: 'en-US',
          label: 'Outer',
          settings: { selection: 'single' },
          columns: [
            { field: 'field_1', title: 'F1', width: 160 },
            { field: 'field_2', title: 'F2', width: 160, align: 'end', sticky: 'start' },
            { field: 'n', title: 'N', width: 100, hidden: true },
          ],
          masterDetail: {
            enabled: true,
            template: (ctx) =>
              (inside = new DataGrid<Row>({
                rowKey: 'id',
                rows: makeRows(3),
                rowHeight: 36,
                locale: 'en-US',
                label: `Inner ${ctx.key}`,
                settings: { selection: 'multiple' },
                columns: [
                  { field: 'field_2', title: 'F2', width: 140 },
                  { field: 'n', title: 'N', width: 140 },
                ],
              })),
          },
        }),
      ),
    );
    await settle();
    grid.expandRow(1);
    await settle();
    const nested = inside!;
    expect(cellsOf(nested, 'field_2').length).toBeGreaterThan(0);

    // The grid's own: its selection and `n` columns are not shown, `field_2` is at the end of its cell and pinned.
    expect([given(headerOf(grid, 'mx:select'), 'display'), given(headerOf(grid, 'n'), 'display'), given(cellsOf(grid, 'n')[0], 'display')]).toEqual(['none', 'none', 'none']);
    expect([given(cellsOf(grid, 'field_2')[0], 'text-align'), given(cellsOf(grid, 'field_2')[0], 'position')]).toEqual(['end', 'sticky']);
    // The grid inside shows the same fields its own way.
    for (const cell of [headerOf(nested, 'mx:select'), headerOf(nested, 'field_2'), headerOf(nested, 'n'), cellsOf(nested, 'mx:select')[0], cellsOf(nested, 'field_2')[0], cellsOf(nested, 'n')[0]]) {
      expect([cell.dataset.field, given(cell, 'display')]).toEqual([cell.dataset.field, '']);
    }
    for (const cell of [headerOf(nested, 'field_2'), cellsOf(nested, 'field_2')[0]]) expect([given(cell, 'text-align'), given(cell, 'position')]).toEqual(['', '']);
    expect(sheetRules(grid).length).toBeGreaterThan(0);
    expect(sheetRules(grid).filter((rule) => foundIn(nested, rule.selectorText).length).map((rule) => rule.selectorText)).toEqual([]);

    // A column the user hides in the grid stays in the grid inside.
    grid.columnOption('field_2', 'hidden', true);
    await settle();
    expect(given(headerOf(grid, 'field_2'), 'display')).toBe('none');
    expect([given(headerOf(nested, 'field_2'), 'display'), given(cellsOf(nested, 'field_2')[0], 'display')]).toEqual(['', '']);
    expect(sheetRules(grid).filter((rule) => foundIn(nested, rule.selectorText).length).map((rule) => rule.selectorText)).toEqual([]);
    await grid.dispose();
  });

  it('holds every row it draws in a part that carries its id, where its sheet finds it', async () => {
    const grid = sized(mount(new DataGrid<Row>(rich('Rows'))));
    await settle();
    const id = own(grid, '.mx-data-grid__body')[0].getAttribute('data-grid-id');
    expect(id).toBeTruthy();
    const rows = own(grid, '.mx-data-grid__row');
    const kinds = ['mx-data-grid__row--band', 'mx-data-grid__row--header', 'mx-data-grid__row--filter', 'mx-data-grid__group-row', 'mx-data-grid__group-footer', 'mx-data-grid__total-row'];
    expect(kinds.filter((kind) => !rows.some((row) => row.classList.contains(kind)))).toEqual([]);
    expect(rows.some((row) => row.classList.length === 1)).toBe(true);
    expect(rows.filter((row) => row.parentElement!.getAttribute('data-grid-id') !== id).map((row) => row.className)).toEqual([]);

    // A hidden column is hidden in every row that has a cell for it.
    grid.columnOption('field_2', 'hidden', true);
    await settle();
    const cells = own(grid, '.mx-data-grid__row > [data-field="field_2"]');
    expect(new Set(cells.map((cell) => cell.parentElement!.className.split(' ').pop())).size).toBeGreaterThan(2);
    expect(cells.filter((cell) => given(cell, 'display') !== 'none').map((cell) => cell.parentElement!.className)).toEqual([]);
    await grid.dispose();
  });

  it.each(['the details of a row', 'a cell'])('is not reached by a rule for a state of the grid around it, in %s', async (where) => {
    let inside: DataGrid<Row> | null = null;
    const made = () => {
      const grid = new DataGrid<Row>(rich('Inner', { rows: makeRows(4) }));
      inside ??= grid;
      return grid;
    };
    const grid = sized(mount(new DataGrid<Row>(where === 'a cell' ? rich('Outer', { rows: makeRows(1) }, made) : rich('Outer', { masterDetail: { enabled: true, template: (ctx) => (ctx.key === 1 ? made() : null) } }))));
    await settle();
    if (where !== 'a cell') grid.expandRow(1);
    await settle();
    const nested = inside!;
    expect(cellsOf(nested, 'field_1').length).toBeGreaterThan(0);
    // An active row and odd rows inside, for the rules that paint them.
    nested.focusCell(1, 'field_1');
    await settle();
    expect([own(nested, '.mx-data-grid__row[data-active]').length, own(nested, '.mx-data-grid__row[data-odd]').length].every((n) => n > 0)).toBe(true);

    const selectors = gridSelectors().map(bare);
    // Every attribute the selectors ask for, with each of its values.
    const asked = new Map<string, string[]>();
    for (const selector of selectors) {
      for (const [, name, a, b, c] of selector.matchAll(/\[([\w-]+)(?:[~|^$*]?=\s*(?:'([^']*)'|"([^"]*)"|([^\]\s]+)))?\]/g)) {
        const values = asked.get(name) ?? [];
        const value = a ?? b ?? c ?? '';
        if (!values.includes(value)) values.push(value);
        asked.set(name, values);
      }
    }
    expect(asked.has('data-striped') && asked.has('data-header-buttons')).toBe(true);
    // What the grid inside stands in, up to the grid around it: a rule comes down to it only through these.
    const around: Element[] = [];
    for (let el = nested.element.parentElement; el; el = el === grid.element ? null : el.parentElement) around.push(el);
    expect(around).toContain(grid.element);
    // None of them with a state, and the grid inside with none on its root: a state can then only come from outside.
    for (const name of asked.keys()) for (const el of [...around, nested.element]) el.removeAttribute(name);

    const count = (selector: string) => foundIn(nested, selector).length;
    const base = new Map(selectors.map((selector) => [selector, count(selector)]));
    expect([...base.values()].filter((n) => n > 0).length).toBeGreaterThan(40);

    // Written on each of them, each attribute alone and all together: what the selectors match inside stays the same.
    const leaks = new Set<string>();
    const names = new Map(selectors.map((selector) => [selector, [...asked.keys()].filter((name) => selector.includes(`[${name}`))]));
    const tryWith = (attrs: Map<string, string>) => {
      const before = around.map((el) => [...attrs.keys()].map((name) => el.getAttribute(name)));
      for (const el of around) for (const [name, value] of attrs) el.setAttribute(name, value);
      for (const selector of selectors) {
        const needs = names.get(selector)!;
        // With one attribute: the selectors that ask for it. With all of them: those that ask for more than one.
        if (attrs.size === 1 ? !needs.some((name) => attrs.has(name)) : needs.length < 2) continue;
        if (count(selector) !== base.get(selector)) leaks.add(selector);
      }
      around.forEach((el, i) =>
        [...attrs.keys()].forEach((name, n) => {
          const was = before[i][n];
          if (was === null) el.removeAttribute(name);
          else el.setAttribute(name, was);
        }),
      );
    };
    for (const [name, values] of asked) for (const value of values) tryWith(new Map([[name, value]]));
    const most = Math.max(...[...asked.values()].map((values) => values.length));
    for (let round = 0; round < most; round++) tryWith(new Map([...asked].map(([name, values]) => [name, values[round % values.length]])));
    expect([...leaks]).toEqual([]);
    await grid.dispose();
  }, 20_000);

  it('still reaches its own parts from a state of its own', async () => {
    const grid = sized(mount(new DataGrid<Row>(rich('Alone'))));
    await settle();
    expect(own(grid, '.mx-data-grid__row > .mx-data-grid__actions > *').length).toBeGreaterThan(0);
    const lost: string[] = [];
    let tried = 0;
    for (const selector of gridSelectors().map(bare)) {
      const [first, ...rest] = steps(selector);
      if (!rest.length || !/^\.mx-data-grid(?![\w-])/.test(first.compound) || !stateful(first.compound)) continue;
      const attr = /\[([\w-]+)(?:=\s*['"]?([^\]'"]*)['"]?)?\]/.exec(first.compound);
      if (!attr) continue;
      tried++;
      const was = grid.element.getAttribute(attr[1]);
      grid.element.setAttribute(attr[1], attr[2] ?? '');
      if (!foundIn(grid, selector).length) lost.push(selector);
      if (was === null) grid.element.removeAttribute(attr[1]);
      else grid.element.setAttribute(attr[1], was);
    }
    expect(tried).toBeGreaterThan(5);
    expect(lost).toEqual([]);
    await grid.dispose();
  });
});

describe("the grid's selectors", () => {
  it('never leave a state of the grid, a row or a cell by a descendant combinator', () => {
    const selectors = gridSelectors();
    expect(selectors.length).toBeGreaterThan(200);
    expect(selectors.map((selector) => [selector, reach(selector)]).filter(([, at]) => at)).toEqual([]);
  });

  it('are read as they are written', () => {
    expect(steps(".a[data-x='1 2'] > :where(.b) .c:is(.d > .e, .f)::after")).toEqual([
      { compound: ".a[data-x='1 2']", by: '' },
      { compound: ':where(.b)', by: '>' },
      { compound: '.c:is(.d > .e, .f)::after', by: ' ' },
    ]);
    expect(reach('.mx-data-grid[data-striped] .mx-data-grid__body > .mx-data-grid__row')).toBe('.mx-data-grid[data-striped] … .mx-data-grid__body');
    expect(reach('.mx-data-grid[data-striped] > :where(.mx-data-grid__main) .mx-data-grid__row')).toBe('.mx-data-grid[data-striped] … .mx-data-grid__row');
    expect(reach(':is(.mx-data-grid__row[data-loading] .mx-data-grid__cell, .mx-data-grid__cell[data-lookup])::after')).toBe('.mx-data-grid__row[data-loading] … .mx-data-grid__cell');
    expect(reach('.mx-data-grid__header-cell:is(:hover, :focus-within) :is(.mx-data-grid__menu-button)')).toBe('.mx-data-grid__header-cell:is(:hover, :focus-within) … :is(.mx-data-grid__menu-button)');
    expect(reach('.mx-data-grid .mx-data-grid__toolbar[data-drop]')).toBeNull();
    expect(reach(':root .mx-data-grid__ghost')).toBeNull();
    expect(reach('.mx-data-grid__chip[data-dir="asc"] .mx-data-grid__sort-down')).toBeNull();
    expect(reach('.mx-data-grid[data-striped] > :where(.mx-data-grid__main) > :where(.mx-data-grid__viewport) > .mx-data-grid__body > .mx-data-grid__row[data-odd]:not([data-selected])')).toBeNull();
  });
});
