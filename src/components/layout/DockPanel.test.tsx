import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { Button } from '../button/Button';
import { DockPanel } from './DockPanel';
import { Panel } from './Panel';

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

const area = (el: Element) => {
  const style = (el as HTMLElement).style;
  return `${style.gridRow} | ${style.gridColumn}`;
};

describe('DockPanel', () => {
  it('docks its children in order with CSS grid', async () => {
    let dock!: DockPanel;
    page(
      <DockPanel ref={(d: DockPanel) => (dock = d)} gap="xs">
        <Panel dock="top" text="Header" />
        <Panel dock="start" text="Sidebar" />
        <Panel dock="bottom" text="Status" />
        <Panel text="Content" />
        <Button dock="float" text="Help" right={16} bottom="1rem" />
      </DockPanel>,
    );
    await tick();
    const el = dock.element;
    expect(el.className).toContain('mx-dock-panel');
    expect(el.style.gridTemplateRows).toBe('auto minmax(0, 1fr) auto');
    expect(el.style.gridTemplateColumns).toBe('auto minmax(0, 1fr)');
    const [header, sidebar, status, content, help] = Array.from(el.children) as HTMLElement[];
    // The gap sits on the side of a docked child that faces the rest.
    expect(header.style.marginBlockEnd).toBe('var(--mx-layout-space-xs)');
    expect(sidebar.style.marginInlineEnd).toBe('var(--mx-layout-space-xs)');
    expect(status.style.marginBlockStart).toBe('var(--mx-layout-space-xs)');
    expect(content.style.margin).toBe('');
    dock.gap = 0;
    expect(header.style.marginBlockEnd).toBe('0px');
    expect(header.dataset.mxDock).toBe('top');
    expect(area(header)).toBe('1 / 2 | 1 / -1');
    expect(area(sidebar)).toBe('2 / -1 | 1 / 2');
    // The bottom bar comes after the sidebar: it spans what the sidebar left.
    expect(area(status)).toBe('-2 / -1 | 2 / -1');
    expect(content.dataset.mxDock).toBe('fill');
    expect(area(content)).toBe('2 / -2 | 2 / -1');
    expect(help.dataset.mxDock).toBe('float');
    expect(help.style.right).toBe('16px');
    expect(help.style.insetBlockEnd).toBe('1rem');
    expect(help.style.gridRow).toBe('');
  });

  it('picks up children added and removed from code and follows getter docks', async () => {
    const s = reactive({ side: 'start' as 'start' | 'end' });
    const dock = new DockPanel({ padding: 'sm' });
    page(dock);
    const fill = new Panel({ text: 'Content' });
    const side = new Panel({ text: 'Side', dock: () => s.side });
    dock.controls.add(fill, side);
    await tick();
    expect(dock.element.style.gridTemplateColumns).toBe('auto minmax(0, 1fr)');
    expect(area(side.element)).toBe('1 / -1 | 1 / 2');
    expect(dock.dockOf(fill)).toBe('fill');

    s.side = 'end';
    await tick();
    expect(dock.element.style.gridTemplateColumns).toBe('minmax(0, 1fr) auto');
    expect(area(side.element)).toBe('1 / -1 | -2 / -1');

    const top = new Panel({ text: 'Top' });
    dock.controls.add(top);
    dock.setDock(top, 'top');
    expect(dock.element.style.gridTemplateRows).toBe('auto minmax(0, 1fr)');
    expect(area(fill.element)).toBe('2 / -1 | 1 / -2');

    dock.controls.remove(top);
    await tick();
    await tick();
    expect(dock.element.style.gridTemplateRows).toBe('minmax(0, 1fr)');
    expect(area(fill.element)).toBe('1 / -1 | 1 / -2');

    await dock.controls.detach(side);
    expect(side.element.dataset.mxDock).toBe(undefined);
    expect(side.element.style.gridColumn).toBe('');
    expect(dock.element.style.gridTemplateColumns).toBe('minmax(0, 1fr)');
  });

  it('anchors float children from code', async () => {
    const dock = new DockPanel();
    const help = new Button({ text: 'Help', dock: 'float' });
    dock.controls.add(help);
    page(dock);
    dock.setAnchors(help, { left: 8, right: 8, top: '10%' });
    expect(help.element.style.left).toBe('8px');
    expect(help.element.style.right).toBe('8px');
    expect(help.element.style.insetBlockStart).toBe('10%');
    dock.setDock(help, 'bottom');
    expect(help.element.style.left).toBe('');
    expect(help.element.dataset.mxDock).toBe('bottom');
  });
});
