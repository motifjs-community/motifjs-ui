import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { Button } from '../button/Button';
import { TextBox } from '../textbox/TextBox';
import { Grid } from './Grid';
import { trackList } from './track-list';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

describe('trackList', () => {
  it('reads CSS-like tracks: bare numbers are pixels, * is 1fr', () => {
    expect(trackList('auto 1fr 2fr 120')).toBe('auto 1fr 2fr 120px');
    expect(trackList('* 2* 3.5rem')).toBe('1fr 2fr 3.5rem');
    expect(trackList('minmax(100px, 1fr) auto')).toBe('minmax(100px, 1fr) auto');
    expect(trackList(['auto', 120, '*'])).toBe('auto 120px 1fr');
    expect(trackList(3)).toBe('repeat(3, minmax(0, 1fr))');
    expect(trackList(undefined)).toBe('');
  });
});

describe('Grid', () => {
  it('defines rows and columns and places children from their own props', async () => {
    let grid!: Grid;
    page(
      <Grid ref={(g: Grid) => (grid = g)} columns="auto 1fr" rows="auto *" gap="md" columnGap={4} align="center" justify="start">
        <TextBox label="Name" column={2} />
        <Button text="Wide" row={2} column={1} columnSpan={2} rowSpan={1} />
      </Grid>,
    );
    await tick();
    const el = grid.element;
    expect(el.className).toContain('mx-grid');
    expect(el.style.gridTemplateColumns).toBe('auto 1fr');
    expect(el.style.gridTemplateRows).toBe('auto 1fr');
    expect(el.style.getPropertyValue('--_gap')).toBe('var(--mx-layout-space-md)');
    expect(el.style.getPropertyValue('--_column-gap')).toBe('4px');
    expect({ ...el.dataset }).toMatchObject({ align: 'center', justify: 'start' });
    const [name, wide] = Array.from(el.children) as HTMLElement[];
    expect(name.style.gridColumnStart).toBe('2');
    expect(name.style.gridRowStart).toBe('');
    expect(wide.style.gridRowStart).toBe('2');
    expect(wide.style.gridColumnEnd).toBe('span 2');
    expect(wide.style.gridRowEnd).toBe('');
  });

  it('reads the cell of a child given as a function over plain data again on reState', async () => {
    const plain = { row: 1, column: 1 };
    const grid = new Grid({ columns: 3 });
    const host = page(grid);
    const child = new Button({ text: 'Cell', row: () => plain.row, column: () => plain.column });
    grid.controls.add(child);
    await tick();
    expect(child.element.style.gridRowStart).toBe('1');
    Object.assign(plain, { row: 2, column: 3 });
    await tick();
    expect(child.element.style.gridRowStart).toBe('1');
    host.reState();
    expect(child.element.style.gridRowStart).toBe('2');
    expect(child.element.style.gridColumnStart).toBe('3');
  });

  it('places children added later and follows getter props', async () => {
    const s = reactive({ columns: 2 as number | string, row: 1 });
    const grid = new Grid({ columns: () => s.columns, flow: 'column dense', autoRows: 48, padding: 8 });
    page(grid);
    const late = new Button({ text: 'Late', row: () => s.row, columnSpan: 2 });
    grid.controls.add(late);
    await tick();
    expect(grid.element.style.gridTemplateColumns).toBe('repeat(2, minmax(0, 1fr))');
    expect(grid.element.style.gridAutoFlow).toBe('column dense');
    expect(grid.element.style.gridAutoRows).toBe('48px');
    expect(grid.element.style.paddingBlockStart).toBe('8px');
    expect(late.element.style.gridRowStart).toBe('1');

    s.columns = '200 *';
    s.row = 3;
    await tick();
    expect(grid.element.style.gridTemplateColumns).toBe('200px 1fr');
    expect(late.element.style.gridRowStart).toBe('3');

    grid.setCell(late, { row: 4, column: 2 });
    expect(late.element.style.gridRowStart).toBe('4');
    expect(grid.cellOf(late)).toEqual({ row: 4, column: 2, columnSpan: 2 });
    grid.columns = undefined;
    expect(grid.element.style.gridTemplateColumns).toBe('');
  });
});
