import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import { Panel } from './Panel';
import { SplitContainer } from './SplitContainer';
import type { SplitterMovedEventArgs } from './splitter-moved-event-args';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  await uiLocale.use('en');
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

/** jsdom does no layout: the panes report the sizes given here. */
function sizes(split: SplitContainer, first: number, second: number) {
  const rect = (size: number) => () => ({ width: size, height: size, top: 0, left: 0, right: size, bottom: size, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
  split.first.element.getBoundingClientRect = rect(first);
  split.second.element.getBoundingClientRect = rect(second);
}

function press(el: Element, key: string) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

describe('SplitContainer', () => {
  it('puts its two JSX children into the panes, with a separator between them', async () => {
    let split!: SplitContainer;
    page(
      <SplitContainer ref={(s: SplitContainer) => (split = s)} position={240} fixedPanel="first" firstMinSize={100} secondMinSize={50}>
        <Button text="Left" />
        <Button text="Right" />
      </SplitContainer>,
    );
    await tick();
    const el = split.element;
    expect(el.className).toContain('mx-split-container');
    const [first, splitter, second] = Array.from(el.children) as HTMLElement[];
    expect(first).toBe(split.first.element);
    expect(second).toBe(split.second.element);
    expect(first.textContent).toBe('Left');
    expect(second.textContent).toBe('Right');
    expect(splitter).toBe(split.splitterElement);
    expect(splitter.getAttribute('role')).toBe('separator');
    expect(splitter.getAttribute('aria-orientation')).toBe('vertical');
    expect(splitter.getAttribute('aria-controls')).toBe(first.id);
    expect(splitter.getAttribute('aria-label')).toBe('Resize');
    expect(splitter.tabIndex).toBe(0);
    expect(el.style.gridTemplateColumns).toBe(
      'clamp(100px, 240px, calc(100% - 50px - var(--_layout-splitter-size))) var(--_layout-splitter-size) minmax(0, 1fr)',
    );
  });

  it('is complete from code: panes, orientation, shares, a fixed second pane', async () => {
    const split = new SplitContainer({ orientation: 'vertical', position: '30%' });
    split.first.controls.add(new Button({ text: 'Editor' }));
    split.controls.add(new Button({ text: 'Output' }));
    page(split);
    await tick();
    expect(split.second.element.textContent).toBe('Output');
    expect(split.element.style.gridTemplateRows).toContain('calc((100% - var(--_layout-splitter-size)) * 0.3)');
    expect(split.splitterElement.getAttribute('aria-orientation')).toBe('horizontal');
    expect(split.splitterElement.getAttribute('aria-valuenow')).toBe('30');
    split.fixedPanel = 'second';
    split.position = 120;
    expect(split.element.style.gridTemplateRows).toBe(
      'minmax(0, 1fr) var(--_layout-splitter-size) clamp(0px, 120px, calc(100% - 0px - var(--_layout-splitter-size)))',
    );
    split.orientation = 'horizontal';
    expect(split.element.style.gridTemplateRows).toBe('');
    expect(split.element.style.gridTemplateColumns).toContain('clamp(0px, 120px');
  });

  it('moves with the arrow keys, Home and End, within the minimum sizes', async () => {
    const s = reactive({ width: 200 as number | string });
    const moves: SplitterMovedEventArgs[] = [];
    let split!: SplitContainer;
    page(
      <SplitContainer
        ref={(x: SplitContainer) => (split = x)}
        fixedPanel="first"
        firstMinSize={100}
        secondMinSize={150}
        step={20}
        x-model={() => s.width}
        onSplitterMoved={(e: SplitterMovedEventArgs) => moves.push(e)}
      >
        <Panel />
        <Panel />
      </SplitContainer>,
    );
    await tick();
    const splitter = split.splitterElement;
    expect(split.position).toBe(200);
    sizes(split, 200, 400);
    expect(press(splitter, 'ArrowRight')).toBe(true);
    expect(split.position).toBe(220);
    expect(s.width).toBe(220);
    expect(moves.at(-1)).toMatchObject({ position: 220, byUser: true, collapsed: 'none' });
    press(splitter, 'ArrowLeft');
    expect(split.position).toBe(180);
    expect(press(splitter, 'ArrowUp')).toBe(false);
    press(splitter, 'Home');
    expect(split.position).toBe(100);
    press(splitter, 'End');
    expect(split.position).toBe(450);

    s.width = 300;
    await tick();
    expect(split.position).toBe(300);
    expect(moves.at(-1)).toMatchObject({ position: 300, byUser: false });
  });

  it('writes a position set from code to x-model, and reads one over plain data again on reState', async () => {
    const s = reactive({ width: 200 as number | string });
    const plain = { width: 120 as number | string };
    let split!: SplitContainer;
    let p!: SplitContainer;
    const host = page(
      <SplitContainer ref={(x: SplitContainer) => (split = x)} fixedPanel="first" x-model={() => s.width}>
        <Panel />
        <Panel />
      </SplitContainer>,
      <SplitContainer ref={(x: SplitContainer) => (p = x)} fixedPanel="first" position={() => plain.width}>
        <Panel />
        <Panel />
      </SplitContainer>,
    );
    await tick();
    split.position = 260;
    expect(s.width).toBe(260);
    s.width = 200;
    await tick();
    expect(split.position).toBe(200);
    plain.width = 180;
    await tick();
    expect(p.position).toBe(120);
    host.reState();
    expect(p.position).toBe(180);
  });

  it('keeps a share when no pane is fixed, and reads the keys the other way round in RTL', async () => {
    const split = new SplitContainer({ step: 60 });
    split.controls.add(new Panel(), new Panel());
    page(split);
    await tick();
    sizes(split, 300, 300);
    press(split.splitterElement, 'ArrowRight');
    expect(split.position).toBe('60%');
    split.element.dir = 'rtl';
    sizes(split, 300, 300);
    press(split.splitterElement, 'ArrowRight');
    expect(split.position).toBe('40%');
  });

  it('collapses and restores the first pane with Enter, keeping focus', async () => {
    let split!: SplitContainer;
    page(
      <SplitContainer ref={(x: SplitContainer) => (split = x)} position="40%">
        <Button text="Tree" />
        <Button text="List" />
      </SplitContainer>,
    );
    await tick();
    const splitter = split.splitterElement;
    split.first.element.querySelector('button')!.focus();
    split.collapse();
    expect(split.collapsed).toBe('first');
    expect(split.first.element.inert).toBe(true);
    expect(document.activeElement).toBe(splitter);
    expect(splitter.getAttribute('aria-valuenow')).toBe('0');
    expect(split.element.style.gridTemplateColumns).toBe('0px var(--_layout-splitter-size) minmax(0, 1fr)');
    press(splitter, 'Enter');
    expect(split.collapsed).toBe('none');
    expect(split.position).toBe('40%');
    expect(split.first.element.inert).toBe(false);
    press(splitter, 'Enter');
    expect(split.collapsed).toBe('first');
    split.collapsible = false;
    press(splitter, 'Enter');
    expect(split.collapsed).toBe('first');
    split.restore();
    expect(split.collapsed).toBe('none');
    split.collapse('second');
    expect(splitter.getAttribute('aria-valuenow')).toBe('100');
    expect(split.second.element.inert).toBe(true);
  });

  it('switches resizing off, follows the locale and the enabled cascade', async () => {
    const s = reactive({ resizable: true });
    let split!: SplitContainer;
    page(
      <SplitContainer ref={(x: SplitContainer) => (split = x)} resizable={() => s.resizable} position={100}>
        <Button text="A" />
        <Button text="B" />
      </SplitContainer>,
    );
    await tick();
    const splitter = split.splitterElement;
    sizes(split, 100, 100);
    s.resizable = false;
    await tick();
    expect(split.element.hasAttribute('data-resizable')).toBe(false);
    expect(press(splitter, 'ArrowRight')).toBe(false);
    expect(split.position).toBe(100);
    expect(splitter.tabIndex).toBe(0);
    split.collapsible = false;
    expect(splitter.hasAttribute('tabindex')).toBe(false);

    await uiLocale.use('tr');
    await tick();
    expect(splitter.getAttribute('aria-label')).toBe('Yeniden boyutlandır');
    split.splitterLabel = 'Folders';
    await tick();
    expect(splitter.getAttribute('aria-label')).toBe('Folders');

    split.enabled = false;
    expect((split.first.element.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
  });
});
