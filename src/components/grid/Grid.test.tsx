import { Component } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { Button } from '../button/Button';
import { Grid, toTracks } from './Grid';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

describe('Grid', () => {
  it('reads row and column track lists, CSS and the * share shorthand', () => {
    expect(toTracks('auto, *, 2*, 120')).toBe('auto minmax(0, 1fr) minmax(0, 2fr) 120px');
    expect(toTracks('minmax(8rem, 1fr), 10rem, 0.5*')).toBe('minmax(8rem, 1fr) 10rem minmax(0, 0.5fr)');
    expect(toTracks([200, '*', 'auto'])).toBe('200px minmax(0, 1fr) auto');
    expect(toTracks(undefined)).toBe('');
  });

  it('writes its templates and gaps, from props and from code', () => {
    const g = new Grid({ columns: 'auto, *', rows: 'auto, *', gap: 'sm', columnGap: 24 });
    expect(g.element.style.gridTemplateColumns).toBe('auto minmax(0, 1fr)');
    expect(g.element.style.gridTemplateRows).toBe('auto minmax(0, 1fr)');
    expect(g.element.style.gap).toBe('var(--mx-space-3)');
    expect(g.element.style.getPropertyValue('column-gap')).toBe('24px');
    g.columns = [100, '*'];
    expect(g.element.style.gridTemplateColumns).toBe('100px minmax(0, 1fr)');
  });

  it('places children by their 1-based row, column and spans, like CSS lines', async () => {
    const header = new Button({ text: 'header', row: 1, column: 1, columnSpan: 2 });
    const side = new Button({ text: 'side', row: 2, column: 1 });
    const spanOnly = new Button({ text: 'span', rowSpan: 2 });
    const g = new Grid({ columns: '200, *', childs: [header, side, spanOnly] });
    hosts.push(mountHost(g));
    await tick();
    expect(header.element.style.gridRow).toBe('1 / span 1');
    expect(header.element.style.gridColumn).toBe('1 / span 2');
    expect(side.element.style.gridRow).toBe('2 / span 1');
    expect(spanOnly.element.style.gridRow).toBe('span 2');
    expect(spanOnly.element.style.gridColumn).toBe('');

    side.column = 2;
    expect(side.element.style.gridColumn).toBe('2 / span 1');
  });
});
