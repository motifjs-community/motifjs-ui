import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { dataKinds } from '../../../tests/data-kinds';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { TreeView } from './TreeView';
import type { TreeViewExpandingEventArgs } from './tree-view-expanding-event-args';

interface Folder {
  id: string;
  text: string;
  children?: Folder[];
  enabled?: boolean;
  expanded?: boolean;
  hasChildren?: boolean;
}

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('dir');
  await uiLocale.use('en');
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

const files = (): Folder[] => [
  {
    id: 'src',
    text: 'src',
    children: [
      { id: 'app', text: 'app.ts' },
      { id: 'lib', text: 'lib', children: [{ id: 'util', text: 'util.ts' }] },
    ],
  },
  { id: 'docs', text: 'docs', children: [{ id: 'readme', text: 'readme.md' }] },
  { id: 'package', text: 'package.json' },
];

const rows = (t: TreeView<any>) => Array.from(t.treeElement.querySelectorAll<HTMLElement>('[role="treeitem"]'));
const texts = (t: TreeView<any>) => rows(t).map((r) => r.querySelector('.mx-tree-view__text')!.textContent);
const row = (t: TreeView<any>, text: string) => rows(t).find((r) => r.querySelector('.mx-tree-view__text')!.textContent === text)!;
const part = (r: HTMLElement, name: string) => r.querySelector<HTMLElement>(`:scope > .mx-tree-view__row > .mx-tree-view__${name}`)!;

function press(key: string, init: KeyboardEventInit = {}) {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

function click(el: HTMLElement, init: MouseEventInit = {}) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
}

describe('TreeView', () => {
  it('builds the tree pattern, the same from JSX and from code', async () => {
    let jsx!: TreeView<Folder>;
    page(<TreeView ref={(t: TreeView<Folder>) => (jsx = t)} label="Files" items={files()} expandedKeys={['src']} class="extra" />);
    const coded = new TreeView<Folder>({ items: files() });
    page(coded);
    await settle();

    expect(jsx.element.className).toContain('mx-tree-view');
    expect(jsx.element.className).toContain('extra');
    const tree = jsx.treeElement;
    expect(tree.getAttribute('role')).toBe('tree');
    expect(tree.getAttribute('aria-label')).toBe('Files');
    expect(texts(jsx)).toEqual(['src', 'app.ts', 'lib', 'docs', 'package.json']);
    const src = row(jsx, 'src');
    expect(src.getAttribute('aria-expanded')).toBe('true');
    expect(src.getAttribute('aria-level')).toBe('1');
    expect(src.getAttribute('aria-setsize')).toBe('3');
    expect(src.getAttribute('aria-posinset')).toBe('1');
    const group = src.querySelector(':scope > [role="group"]')!;
    expect(group.contains(row(jsx, 'app.ts'))).toBe(true);
    expect(row(jsx, 'lib').getAttribute('aria-level')).toBe('2');
    expect(row(jsx, 'lib').getAttribute('aria-posinset')).toBe('2');
    expect(row(jsx, 'lib').getAttribute('aria-expanded')).toBe('false');
    expect(row(jsx, 'app.ts').hasAttribute('aria-expanded')).toBe(false);

    expect(texts(coded)).toEqual(['src', 'docs', 'package.json']);
    coded.items = [{ id: 'a', text: 'Alpha' }];
    coded.expand('a');
    expect(texts(coded)).toEqual(['Alpha']);
    coded.items = files();
    coded.expand('docs');
    expect(texts(coded)).toEqual(['src', 'docs', 'readme.md', 'package.json']);
    expect(coded.expandedKeys).toEqual(['docs']);
    expect(coded.itemOf('readme')?.text).toBe('readme.md');
  });

  it('reads flat items with a parent key and any field through functions', async () => {
    const flat = [
      { code: 1, name: 'Europe', up: null },
      { code: 2, name: 'Turkey', up: 1 },
      { code: 3, name: 'Ankara', up: 2 },
      { code: 4, name: 'Asia', up: null },
    ];
    const t = new TreeView<(typeof flat)[number]>({
      items: flat,
      parentField: 'up',
      keyField: (item) => item.code,
      textField: (item) => item.name.toUpperCase(),
    });
    page(t);
    t.expandAll();
    expect(texts(t)).toEqual(['EUROPE', 'TURKEY', 'ANKARA', 'ASIA']);
    expect(row(t, 'ANKARA').getAttribute('aria-level')).toBe('3');
    expect(t.expandedKeys).toEqual([1, 2]);

    const plain = new TreeView<{ id: number; text: string; parentId?: number }>({
      items: [
        { id: 1, text: 'One' },
        { id: 2, text: 'Two', parentId: 1 },
      ],
      expandedKeys: [1],
    });
    page(plain);
    expect(texts(plain)).toEqual(['One', 'Two']);
  });

  it('follows a getter and the functions in an item', async () => {
    const s = reactive({ extra: true, name: 'src' });
    const items = files();
    items[0].text = (() => s.name) as unknown as string;
    let t!: TreeView<Folder>;
    page(<TreeView ref={(x: TreeView<Folder>) => (t = x)} items={() => (s.extra ? items : items.slice(0, 1))} expandedKeys={['docs']} />);
    await settle();
    expect(texts(t)).toEqual(['src', 'docs', 'readme.md', 'package.json']);
    s.name = 'source';
    await settle();
    expect(texts(t)[0]).toBe('source');
    s.extra = false;
    await settle();
    expect(texts(t)).toEqual(['source']);
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('shows items changed in place after refresh() and refreshItem()', async () => {
      const items = make(files());
      let t!: TreeView<Folder>;
      page(<TreeView ref={(x: TreeView<Folder>) => (t = x)} items={items} expandedKeys={['docs']} />);
      await settle();
      expect(texts(t)).toEqual(['src', 'docs', 'readme.md', 'package.json']);
      items[1].children!.push({ id: 'guide', text: 'guide.md' });
      items[0].text = 'source';
      await settle();
      expect(texts(t)).toEqual(['src', 'docs', 'readme.md', 'package.json']);
      t.refreshItem('src');
      expect(texts(t)[0]).toBe('source');
      t.refresh();
      await settle();
      expect(texts(t)).toEqual(['source', 'docs', 'readme.md', 'guide.md', 'package.json']);
      items[0].expanded = true;
      t.refresh();
      await settle();
      expect(texts(t).slice(0, 3)).toEqual(['source', 'app.ts', 'lib']);
    });

    it('gives back the very items, in events, getters and keyless values', async () => {
      const items = make([{ text: 'One' }, { text: 'Two' }]);
      const form = reactive({ item: null as unknown });
      const changed = vi.fn();
      let t!: TreeView<{ text: string }>;
      page(<TreeView ref={(x: TreeView<{ text: string }>) => (t = x)} items={items} x-model={() => form.item} onSelectionChanged={changed} />);
      await settle();
      row(t, 'Two').click();
      await settle();
      expect(t.value).toBe(items[1]);
      expect(t.selectedItems[0]).toBe(items[1]);
      expect(t.itemOf(items[1])).toBe(items[1]);
      expect(changed.mock.calls[0][0].items[0]).toBe(items[1]);
      expect(row(t, 'Two').getAttribute('aria-selected')).toBe('true');
    });
  });

  it('reads functions over plain data again on reState, and writes a selection set from code to x-model', async () => {
    const plain = { name: 'app.ts', items: files() };
    plain.items[0].children![0].text = (() => plain.name) as unknown as string;
    const s = reactive({ file: null as unknown });
    let t!: TreeView<Folder>;
    let m!: TreeView<Folder>;
    const host = page(
      <TreeView ref={(x: TreeView<Folder>) => (t = x)} items={() => plain.items} expandedKeys={['src']} />,
      <TreeView ref={(x: TreeView<Folder>) => (m = x)} items={files()} x-model={() => s.file} />,
    );
    await settle();
    expect(texts(t)).toContain('app.ts');
    plain.name = 'main.ts';
    plain.items = [...plain.items, { id: 'license', text: 'LICENSE' }];
    await settle();
    expect(texts(t)).not.toContain('main.ts');
    host.reState();
    await settle();
    expect(texts(t)).toContain('main.ts');
    expect(texts(t)).toContain('LICENSE');
    m.value = 'docs';
    expect(s.file).toBe('docs');
    m.select('package');
    expect(s.file).toBe('package');
  });

  it('selects one row, two-way with x-model, and reports it', async () => {
    const s = reactive({ file: 'app' as unknown });
    const changed = vi.fn();
    let t!: TreeView<Folder>;
    page(<TreeView ref={(x: TreeView<Folder>) => (t = x)} items={files()} expandedKeys={['src']} x-model={() => s.file} onSelectionChanged={changed} />);
    await settle();
    expect(row(t, 'app.ts').getAttribute('aria-selected')).toBe('true');
    expect(row(t, 'src').getAttribute('aria-selected')).toBe('false');
    expect(row(t, 'app.ts').tabIndex).toBe(0);
    expect(changed).not.toHaveBeenCalled();

    click(part(row(t, 'docs'), 'text'));
    await settle();
    expect(s.file).toBe('docs');
    expect(t.value).toBe('docs');
    expect(t.selectedItems.map((i) => i.text)).toEqual(['docs']);
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'docs', byUser: true }));
    expect(row(t, 'app.ts').getAttribute('aria-selected')).toBe('false');

    s.file = 'package';
    await settle();
    expect(row(t, 'package.json').getAttribute('aria-selected')).toBe('true');
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'package', byUser: false }));

    t.select('src');
    await settle();
    expect(s.file).toBe('src');
    t.clearSelection();
    expect(t.value).toBe(null);
  });

  it('selects several rows with Ctrl and Shift, and with the keys of the APG multi-select tree', async () => {
    const s = reactive({ picked: [] as unknown[] });
    let t!: TreeView<Folder>;
    page(<TreeView ref={(x: TreeView<Folder>) => (t = x)} items={files()} selectionMode="multiple" x-model={() => s.picked} />);
    await settle();
    expect(t.treeElement.getAttribute('aria-multiselectable')).toBe('true');
    click(part(row(t, 'src'), 'text'));
    click(part(row(t, 'package.json'), 'text'), { ctrlKey: true });
    await settle();
    expect(s.picked).toEqual(['src', 'package']);
    click(part(row(t, 'docs'), 'text'), { shiftKey: true });
    await settle();
    expect(s.picked).toEqual(['docs', 'package']);

    t.focusNode('src');
    press(' ');
    expect(t.value).toEqual(['src', 'docs', 'package']);
    press('ArrowDown', { shiftKey: true });
    expect(t.value).toEqual(['src', 'package']);
    press('a', { ctrlKey: true });
    expect((t.value as unknown[]).length).toBe(7);
    press('End', { ctrlKey: true, shiftKey: true });
    expect(t.value).toEqual(['docs', 'package']);
  });

  it('keeps one Tab stop and moves with the keys of the APG tree', async () => {
    const t = new TreeView<Folder>({ items: files() });
    page(t);
    expect(rows(t).filter((r) => r.tabIndex === 0)).toHaveLength(1);
    expect(t.focus()).toBe(true);
    expect(document.activeElement).toBe(row(t, 'src'));
    press('ArrowRight');
    expect(row(t, 'src').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(row(t, 'src'));
    press('ArrowRight');
    expect(document.activeElement).toBe(row(t, 'app.ts'));
    press('ArrowDown');
    expect(document.activeElement).toBe(row(t, 'lib'));
    expect(row(t, 'lib').tabIndex).toBe(0);
    expect(row(t, 'src').tabIndex).toBe(-1);
    press('ArrowLeft');
    expect(document.activeElement).toBe(row(t, 'src'));
    press('ArrowLeft');
    expect(row(t, 'src').getAttribute('aria-expanded')).toBe('false');
    press('End');
    expect(document.activeElement).toBe(row(t, 'package.json'));
    press('Home');
    expect(document.activeElement).toBe(row(t, 'src'));
    press('*');
    expect(texts(t)).toEqual(['src', 'app.ts', 'lib', 'docs', 'readme.md', 'package.json']);
    press('p');
    expect(document.activeElement).toBe(row(t, 'package.json'));
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000);
    press('r');
    expect(document.activeElement).toBe(row(t, 'readme.md'));
    press('Enter');
    expect(t.value).toBe('readme');
    press('ArrowUp');
    press(' ');
    expect(t.value).toBe('docs');
  });

  it('swaps Left and Right right to left', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const t = new TreeView<Folder>({ items: files() });
    page(t);
    t.focus();
    press('ArrowLeft');
    expect(row(t, 'src').getAttribute('aria-expanded')).toBe('true');
    press('ArrowRight');
    expect(row(t, 'src').getAttribute('aria-expanded')).toBe('false');
  });

  it('opens and closes rows from code, with cancelable events and the expanded field', async () => {
    const expanding = vi.fn((e: TreeViewExpandingEventArgs<Folder>) => (e.cancel = e.key === 'docs'));
    const expanded = vi.fn();
    const collapsed = vi.fn();
    const t = new TreeView<Folder>({ items: files(), onExpanding: expanding, onExpanded: expanded, onCollapsed: collapsed });
    page(t);
    click(part(row(t, 'src'), 'expander'));
    expect(row(t, 'src').getAttribute('aria-expanded')).toBe('true');
    expect(expanded).toHaveBeenLastCalledWith(expect.objectContaining({ key: 'src', byUser: true }));
    click(part(row(t, 'docs'), 'expander'));
    expect(row(t, 'docs').getAttribute('aria-expanded')).toBe('false');
    t.collapse('src');
    expect(collapsed).toHaveBeenLastCalledWith(expect.objectContaining({ key: 'src', byUser: false }));

    t.expandAll();
    expect(texts(t)).toHaveLength(7);
    t.collapseAll();
    expect(texts(t)).toEqual(['src', 'docs', 'package.json']);
    t.expandedKeys = ['docs'];
    expect(texts(t)).toEqual(['src', 'docs', 'readme.md', 'package.json']);

    const data = files();
    data[0].expanded = true;
    const byField = new TreeView<Folder>({ items: data });
    page(byField);
    expect(texts(byField).slice(0, 3)).toEqual(['src', 'app.ts', 'lib']);
  });

  it('opens on a press or a double press when asked', () => {
    const t = new TreeView<Folder>({ items: files(), expandOn: 'dblclick' });
    page(t);
    click(part(row(t, 'src'), 'text'));
    expect(row(t, 'src').getAttribute('aria-expanded')).toBe('false');
    part(row(t, 'src'), 'text').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(row(t, 'src').getAttribute('aria-expanded')).toBe('true');
    t.expandOn = 'click';
    click(part(row(t, 'src'), 'text'));
    expect(row(t, 'src').getAttribute('aria-expanded')).toBe('false');
  });

  it('loads children on the first open, busy meanwhile, and offers a retry when it fails', async () => {
    let fail = true;
    const loads: string[] = [];
    const loadChildren = (item: Folder) => {
      loads.push(item.id);
      return fail ? Promise.reject(new Error('offline')) : Promise.resolve([{ id: `${item.id}-1`, text: `${item.text} 1`, hasChildren: false }]);
    };
    const t = new TreeView<Folder>({ items: [{ id: 'root', text: 'Root' }, { id: 'leaf', text: 'Leaf', hasChildren: false }], loadChildren });
    page(t);
    expect(row(t, 'Root').getAttribute('aria-expanded')).toBe('false');
    expect(row(t, 'Leaf').hasAttribute('aria-expanded')).toBe(false);
    t.focus();
    press('ArrowRight');
    expect(row(t, 'Root').getAttribute('aria-busy')).toBe('true');
    await settle();
    expect(row(t, 'Root').hasAttribute('aria-busy')).toBe(false);
    expect(row(t, 'Root').getAttribute('aria-expanded')).toBe('false');
    const error = row(t, 'Root').querySelector('.mx-tree-view__error')!;
    expect(error.textContent).toBe('Could not load.Retry');
    expect(row(t, 'Root').getAttribute('aria-describedby')).toBe(error.id);
    await uiLocale.use('tr');
    await settle();
    expect(error.textContent).toBe('Yüklenemedi.Yeniden dene');

    fail = false;
    click(row(t, 'Root').querySelector<HTMLElement>('.mx-tree-view__retry')!);
    await settle();
    expect(texts(t)).toEqual(['Root', 'Root 1', 'Leaf']);
    expect(row(t, 'Root').querySelector('.mx-tree-view__error')).toBeNull();
    t.collapse('root');
    t.expand('root');
    expect(loads).toEqual(['root', 'root']);
    expect(row(t, 'Root 1').hasAttribute('aria-expanded')).toBe(false);
  });

  it('reports a check once when the keys are bound both ways', async () => {
    const s = reactive({ checked: [] as unknown[] });
    const changed = vi.fn((e: { keys: unknown[] }) => (s.checked = e.keys));
    const t = new TreeView<Folder>({ items: files(), showCheckBoxes: true, selectionMode: 'none', expandedKeys: ['src'], checkedKeys: () => s.checked, onCheckChanged: changed });
    page(t);
    await settle();
    click(part(row(t, 'app.ts'), 'check'));
    await settle();
    expect(changed).toHaveBeenCalledTimes(1);
    expect(s.checked).toEqual(['app']);
    s.checked = ['docs'];
    await settle();
    expect(t.checkedKeys).toEqual(['docs', 'readme']);
    expect(s.checked).toEqual(['docs', 'readme']);
    expect(changed).toHaveBeenCalledTimes(2);
  });

  it('checks rows with tri-state parents', async () => {
    const changed = vi.fn();
    const t = new TreeView<Folder>({ items: files(), showCheckBoxes: true, selectionMode: 'none', expandedKeys: ['src', 'lib'], onCheckChanged: changed });
    page(t);
    expect(row(t, 'src').getAttribute('aria-checked')).toBe('false');
    expect(row(t, 'src').hasAttribute('aria-selected')).toBe(false);
    click(part(row(t, 'app.ts'), 'check'));
    expect(row(t, 'app.ts').getAttribute('aria-checked')).toBe('true');
    expect(row(t, 'src').getAttribute('aria-checked')).toBe('mixed');
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ key: 'app', state: 'checked', keys: ['app'], byUser: true }));
    click(part(row(t, 'lib'), 'check'));
    expect(row(t, 'src').getAttribute('aria-checked')).toBe('true');
    expect(t.checkedKeys).toEqual(['src', 'app', 'lib', 'util']);
    expect(t.checkedItems.map((i) => i.text)).toEqual(['src', 'app.ts', 'lib', 'util.ts']);
    t.focusNode('util');
    press(' ');
    expect(row(t, 'lib').getAttribute('aria-checked')).toBe('false');
    expect(row(t, 'src').getAttribute('aria-checked')).toBe('mixed');

    t.checkedKeys = ['docs'];
    expect(t.checkedKeys).toEqual(['docs', 'readme']);
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ item: null, byUser: false }));
    t.checkRecursive = false;
    t.uncheckAll();
    t.check('src');
    expect(row(t, 'src').getAttribute('aria-checked')).toBe('true');
    expect(row(t, 'app.ts').getAttribute('aria-checked')).toBe('false');
    t.showCheckBoxes = false;
    expect(row(t, 'src').hasAttribute('aria-checked')).toBe(false);
    expect(part(row(t, 'src'), 'check')).toBeNull();
  });

  it('filters rows with their parents, from a search box or from code', async () => {
    const t = new TreeView<Folder>({ items: files(), searchEnabled: true });
    page(t);
    const search = t.element.querySelector<HTMLInputElement>('.mx-tree-view__search input')!;
    expect(search.getAttribute('aria-label') ?? search.labels?.[0]?.textContent).toBeTruthy();
    // Turned on when it is made, the box still sits above the rows.
    expect(t.element.querySelector('.mx-tree-view__search')!.nextElementSibling!.classList.contains('mx-tree-view__body')).toBe(true);
    search.value = 'util';
    search.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await settle();
    expect(texts(t)).toEqual(['src', 'lib', 'util.ts']);
    expect(row(t, 'src').getAttribute('aria-setsize')).toBe('1');
    expect(t.expandedKeys).toEqual([]);
    search.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(row(t, 'src'));

    t.filter('.md');
    await settle();
    expect(search.value).toBe('.md');
    expect(texts(t)).toEqual(['docs', 'readme.md']);
    t.searchMode = 'startswith';
    expect(texts(t)).toEqual([]);
    expect(t.element.querySelector<HTMLElement>('.mx-tree-view__empty')!.hidden).toBe(false);
    expect(t.element.querySelector('.mx-tree-view__empty')!.textContent).toBe('No items');
    t.filter('');
    expect(texts(t)).toEqual(['src', 'docs', 'package.json']);
    t.searchEnabled = false;
    expect(t.element.querySelector('.mx-tree-view__search')).toBeNull();
  });

  it('draws only the rows in view of a long tree, and keeps the focused one', async () => {
    const items = Array.from({ length: 2000 }, (_, i) => ({ id: i, text: `Row ${i}` }));
    const t = new TreeView<{ id: number; text: string }>({ items, virtualFrom: 100 });
    page(t);
    expect(t.element.hasAttribute('data-windowed')).toBe(true);
    const drawn = rows(t).length;
    expect(drawn).toBeLessThan(60);
    expect(t.treeElement.querySelectorAll('.mx-tree-view__space')).toHaveLength(1);
    expect(rows(t)[0].getAttribute('aria-setsize')).toBe('2000');
    t.focus();
    const first = document.activeElement;
    press('End');
    expect(document.activeElement?.textContent).toBe('Row 1999');
    expect(rows(t).length).toBeLessThan(80);
    press('Home');
    expect(document.activeElement).not.toBe(first);
    expect(document.activeElement?.textContent).toBe('Row 0');
    t.virtualFrom = 5000;
    expect(t.element.hasAttribute('data-windowed')).toBe(false);
    expect(rows(t)).toHaveLength(2000);
    expect(document.activeElement?.textContent).toBe('Row 0');
  });

  it('draws icons and templates, and follows the switches', async () => {
    const s = reactive({ lines: false, enabled: true });
    let t!: TreeView<Folder & { icon?: string }>;
    page(
      <TreeView
        ref={(x: TreeView<Folder & { icon?: string }>) => (t = x)}
        aria-label="Project"
        items={[{ id: 'a', text: 'A', icon: 'a.svg' }, { id: 'b', text: 'B', enabled: false }]}
        itemTemplate={(item: Folder, host: HTMLElement) => {
          host.textContent = `[${item.text}]`;
        }}
        showLines={() => s.lines}
        enabled={() => s.enabled}
        size="sm"
      />,
    );
    await settle();
    expect(t.treeElement.getAttribute('aria-label')).toBe('Project');
    expect(t.element.hasAttribute('aria-label')).toBe(false);
    expect(texts(t)).toEqual(['[A]', '[B]']);
    expect(part(row(t, '[A]'), 'icon').querySelector('img')!.getAttribute('src')).toBe('a.svg');
    expect(row(t, '[B]').getAttribute('aria-disabled')).toBe('true');
    click(part(row(t, '[B]'), 'text'));
    expect(t.value).toBe(null);
    expect(t.element.dataset.size).toBe('sm');
    s.lines = true;
    await settle();
    expect(t.element.hasAttribute('data-lines')).toBe(true);
    s.enabled = false;
    await settle();
    expect(t.focus()).toBe(false);
    s.enabled = true;
    await settle();
    t.tabStop = false;
    expect(rows(t).every((r) => r.tabIndex === -1)).toBe(true);
    t.tabStop = true;
    expect(rows(t).filter((r) => r.tabIndex === 0)).toHaveLength(1);
    t.selectionMode = 'none';
    expect(row(t, '[A]').hasAttribute('aria-selected')).toBe(false);
  });

  it('scrolls to and focuses a row deep inside, opening its parents', () => {
    const t = new TreeView<Folder>({ items: files() });
    page(t);
    expect(t.focusNode('util')).toBe(true);
    expect(document.activeElement).toBe(row(t, 'util.ts'));
    expect(t.expandedKeys).toEqual(['src', 'lib']);
    expect(t.scrollTo('readme')).toBe(true);
    expect(t.expandedKeys).toEqual(['src', 'lib', 'docs']);
    expect(t.scrollTo('missing')).toBe(false);
  });

  it('writes no text of its own but the empty, loading-error and search texts, from uiLocale', async () => {
    const t = new TreeView<Folder>({ items: [], searchEnabled: true });
    page(t);
    const empty = t.element.querySelector('.mx-tree-view__empty')!;
    expect(empty.textContent).toBe('No items');
    await uiLocale.use('tr');
    await settle();
    expect(empty.textContent).toBe('Öğe yok');
    expect(t.element.querySelector('.mx-tree-view__search input')!.getAttribute('placeholder')).toBe('Ara');
  });
});
