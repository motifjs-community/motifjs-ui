import { Component, type ComponentBase } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import type { MenuItem } from '../../parts/menu/menu-item';
import type { MenuItemClickEventArgs } from '../../parts/menu/menu-item-click-event-args';
import { MenuBar } from './MenuBar';

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

async function settle() {
  for (let i = 0; i < 5; i++) await tick();
}

// The items shown: the parts of a merged bar's items wait hidden in the main bar while that bar is away.
const tops = (bar: MenuBar) => Array.from(bar.element.querySelectorAll<HTMLButtonElement>(':scope > .mx-menubar__bar > .mx-menubar__item:not([hidden])'));
// Kept aside the MotifJS way: out of the page, a hidden child of the bar's part.
const kept = (bar: MenuBar) => {
  const items = (c: ComponentBase): ComponentBase[] =>
    (c.controls.items as ComponentBase[]).flatMap((child) => (child.class.has('mx-menubar__item') ? [child] : items(child)));
  return items((bar as unknown as { parts: { barPart: ComponentBase } }).parts.barPart).filter((c) => !c.isVisible).length;
};
const names = (els: Element[]) => els.map((e) => e.querySelector('[class$=__label]')!.textContent);
const menuItems = (bar: MenuBar) => Array.from(bar.element.querySelector(':scope > .mx-popup')!.querySelectorAll<HTMLButtonElement>(':scope > .mx-menu > .mx-menu__item'));

const MAIN = (): MenuItem[] => [
  { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'exit', text: 'E&xit' }] },
  { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }] },
  { key: 'view', text: '&View', items: [{ key: 'zoom', text: '&Zoom' }] },
  { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },
];

const DOC = (log: string[] = []): MenuItem[] => [
  { key: 'file', text: '&File', items: [{ key: 'export', text: '&Export', mergeAt: { after: 'new' }, click: () => void log.push('export') }] },
  { key: 'format', text: '&Format', mergeAt: { before: 'help' }, items: [{ key: 'bold', text: '&Bold', click: () => void log.push('bold') }] },
  { key: 'view', merge: 'remove', text: 'View' },
  { key: 'note', text: 'Note', merge: 'none' },
];

function bars(main = MAIN(), doc = DOC(), extra: Record<string, unknown> = {}) {
  let host!: MenuBar;
  let child!: MenuBar;
  page(
    <div>
      <MenuBar ref={(b: MenuBar) => (host = b)} label="Main" items={main} mergeHost />
      <section class="doc">
        <MenuBar ref={(b: MenuBar) => (child = b)} label="Document" items={doc} mergeInto="main" mergeWhen="manual" {...extra} />
      </section>
    </div>,
  );
  return { host: () => host, child: () => child };
}

describe('MenuBar merging', () => {
  it('shows the merged bar’s items in the main bar by their rules, and gives them back', async () => {
    const { host, child } = bars();
    await settle();
    const seen: string[] = [];
    host().onMerged((e) => void seen.push(`in:${e.bar.label}`));
    host().onUnmerged((e) => void seen.push(`out:${e.bar.label}`));
    expect(child().merge()).toBe(true);
    await settle();
    // File joins File, Format stands before Help, View is taken away, Note stays out.
    expect(names(tops(host()))).toEqual(['File', 'Edit', 'Format', 'Help']);
    expect(child().element.hidden).toBe(true);
    expect(host().mergedBars).toEqual([child()]);
    expect(child().mergedInto).toBe(host());
    host().open('file');
    await settle();
    expect(names(menuItems(host()))).toEqual(['New', 'Export', 'Exit']);
    host().close();
    child().unmerge();
    await settle();
    expect(names(tops(host()))).toEqual(['File', 'Edit', 'View', 'Help']);
    expect(child().element.hidden).toBe(false);
    expect(seen).toEqual(['in:Document', 'out:Document']);
  });

  it('lets a merged item take the place of the main bar’s', async () => {
    const { host, child } = bars(MAIN(), [{ key: 'edit', text: 'E&dit table', merge: 'replace', items: [{ key: 'row', text: '&Row' }] }]);
    await settle();
    child().merge();
    await settle();
    expect(names(tops(host()))).toEqual(['File', 'Edit table', 'View', 'Help']);
    host().open(1);
    await settle();
    expect(names(menuItems(host()))).toEqual(['Row']);
  });

  it('runs a merged item’s command in its own bar', async () => {
    const log: string[] = [];
    const told: string[] = [];
    const { host, child } = bars(MAIN(), DOC(log));
    await settle();
    host().onItemClick(() => void told.push('main'));
    child().onItemClick((e: MenuItemClickEventArgs) => void told.push(`doc:${String(e.item.key)}:${e.source === child()}`));
    child().merge();
    await settle();
    host().open('file');
    await settle();
    menuItems(host())[1].click();
    expect(log).toEqual(['export']);
    expect(told).toEqual(['doc:export:true']);
  });

  it('gives a merged item another letter when the main bar uses its own', async () => {
    const { host, child } = bars(MAIN(), [{ key: 'fields', text: '&Fields', items: [{ text: 'One' }] }]);
    await settle();
    child().merge();
    await settle();
    const fields = tops(host()).find((t) => t.textContent === 'Fields')!;
    expect(fields.getAttribute('aria-keyshortcuts')).not.toContain('Alt+F');
    expect(fields.getAttribute('aria-keyshortcuts')).toContain('Alt+I');
  });

  it('merges when the main bar comes later, and again after the main bar goes away and comes back', async () => {
    let child!: MenuBar;
    page(<MenuBar ref={(b: MenuBar) => (child = b)} items={DOC()} mergeInto="later" mergeWhen="manual" />);
    await settle();
    expect(child.merge()).toBe(false);
    const host = new MenuBar({ items: MAIN(), mergeHost: true, mergeName: 'later' });
    page(host);
    await settle();
    expect(host.mergedBars).toEqual([child]);
    host.mergeHost = false;
    await settle();
    expect(host.mergedBars).toEqual([]);
    expect(child.element.hidden).toBe(false);
    host.mergeHost = true;
    await settle();
    expect(host.mergedBars).toEqual([child]);
  });

  it('with focus: merges while focus is in its place or in the main bar, and leaves when focus goes elsewhere', async () => {
    const { host, child } = bars(MAIN(), DOC(), { mergeWhen: 'focus' });
    const outside = document.createElement('button');
    document.body.append(outside);
    await settle();
    const doc = document.querySelector<HTMLElement>('.doc')!;
    // jsdom does not tell components they are in the page.
    child().onMounted();
    const field = doc.appendChild(document.createElement('input'));
    field.focus();
    await settle();
    expect(child().mergedInto).toBe(host());
    tops(host())[0].focus();
    await settle();
    expect(child().mergedInto).toBe(host());
    outside.focus();
    await settle();
    expect(child().mergedInto).toBeNull();
  });

  it('switched to focus while focus is elsewhere: leaves at once', async () => {
    // jsdom draws nothing, so a bar merged by hand stands in for one merged while shown.
    const { host, child } = bars(MAIN(), DOC(), { mergeWhen: 'manual' });
    const outside = document.createElement('button');
    document.body.append(outside);
    child().onMounted();
    await settle();
    child().merge();
    await settle();
    expect(child().mergedInto).toBe(host());
    outside.focus();
    child().mergeWhen = 'focus';
    await settle();
    expect(child().mergedInto).toBeNull();
    document.querySelector<HTMLElement>('.doc')!.appendChild(document.createElement('input')).focus();
    await settle();
    expect(child().mergedInto).toBe(host());
  });

  it('changes a merged item in its own bar, from the menu of the right button', async () => {
    const { host, child } = bars(MAIN(), DOC(), { customizable: true });
    await settle();
    child().merge();
    await settle();
    const format = tops(host()).find((t) => t.textContent === 'Format')!;
    format.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX: 5, clientY: 5 }));
    await settle();
    const hide = Array.from(document.querySelectorAll<HTMLElement>('.mx-context-menu .mx-popup:not([hidden]) .mx-menu__item')).find((el) => el.textContent!.includes('Hide'))!;
    hide.click();
    await settle();
    expect(child().customization).toEqual({ hidden: ['format'] });
    expect(host().customization).toEqual({});
    expect(names(tops(host()))).toEqual(['File', 'Edit', 'Help']);
  });

  it('follows changes made programmatically in the merged bar', async () => {
    const { host, child } = bars();
    await settle();
    child().merge();
    await settle();
    child().addItem('', { key: 'table', text: '&Table', mergeAt: { after: 'edit' }, items: [{ text: 'Insert' }] });
    await settle();
    expect(names(tops(host()))).toEqual(['File', 'Edit', 'Table', 'Format', 'Help']);
    expect(host().mergedItems.map((i) => i.text)).toEqual(['&File', '&Edit', '&Table', '&Format', '&Help']);
  });

  it('gives its items back when it goes away', async () => {
    const { host, child } = bars();
    await settle();
    child().merge();
    await settle();
    await child().dispose();
    await settle();
    expect(names(tops(host()))).toEqual(['File', 'Edit', 'View', 'Help']);
    expect(host().mergedBars).toEqual([]);
  });

  it('keeps its items’ parts through a change, a merge and an unmerge', async () => {
    const { host, child } = bars();
    await settle();
    const [file, edit, view, help] = tops(host());
    host().items = MAIN().map((item) => (item.key === 'edit' ? { ...item, text: '&Edit!', enabled: false } : item));
    await settle();
    const changed = tops(host());
    expect(changed).toEqual([file, edit, view, help]);
    expect(changed.every((el, i) => el === [file, edit, view, help][i])).toBe(true);
    expect(edit.getAttribute('aria-disabled')).toBe('true');
    expect(names([edit])).toEqual(['Edit!']);
    child().merge();
    await settle();
    const merged = tops(host());
    expect(merged.includes(file) && merged.includes(edit) && merged.includes(help) && !merged.includes(view)).toBe(true);
    child().unmerge();
    await settle();
    const back = tops(host());
    expect(back[0] === file && back[1] === edit && back[3] === help).toBe(true);
    expect(names(back)).toEqual(['File', 'Edit!', 'View', 'Help']);
  });

  it('keeps a merged bar’s item parts while it is away, and lets them go when it goes or its items change', async () => {
    const { host, child } = bars();
    await settle();
    const view = tops(host())[2];
    child().merge();
    await settle();
    // The main bar's own View, taken away while merged, waits hidden too.
    expect(kept(host())).toBe(1);
    const format = tops(host()).find((el) => names([el])[0] === 'Format')!;
    child().unmerge();
    await settle();
    expect(names(tops(host()))).toEqual(['File', 'Edit', 'View', 'Help']);
    expect(tops(host())[2]).toBe(view);
    expect(kept(host())).toBe(1);
    child().merge();
    await settle();
    expect(tops(host()).find((el) => names([el])[0] === 'Format')).toBe(format);
    // View again, while merged.
    expect(kept(host())).toBe(1);
    child().unmerge();
    await settle();
    child().items = DOC();
    await settle();
    expect(kept(host())).toBe(0);
    child().merge();
    await settle();
    expect(tops(host()).find((el) => names([el])[0] === 'Format')).not.toBe(format);
    child().unmerge();
    await settle();
    expect(kept(host())).toBe(1);
    await child().dispose();
    await settle();
    expect(kept(host())).toBe(0);
    expect(format.isConnected).toBe(false);
  });

  it('when shown: is never drawn in its place before it merges, and is shown there when no main bar takes it', async () => {
    const { host, child } = bars(MAIN(), DOC(), { mergeWhen: 'shown' });
    await settle();
    // jsdom does not tell components they are in the page. Mounted, its place shown in the tree: merged at once, before
    // any frame, and never shown in its place.
    child().onMounted();
    expect(child().mergedInto).toBe(host());
    expect(child().element.hidden).toBe(true);
    // The place is read in the window's next frame.
    const read = async () => {
      await settle();
      measureNow(child());
      await settle();
    };
    await read();
    expect(child().mergedInto).toBe(host());
    expect(child().element.hidden).toBe(true);
    child().mergeInto = null;
    await read();
    expect(child().mergedInto).toBe(null);
    expect(child().element.hidden).toBe(false);
    child().mergeInto = 'none';
    await settle();
    expect(child().element.hidden).toBe(true);
    await read();
    expect(child().mergedInto).toBe(null);
    expect(child().element.hidden).toBe(false);
    child().mergeInto = 'main';
    await read();
    expect(child().mergedInto).toBe(host());
    expect(child().element.hidden).toBe(true);
  });
});
