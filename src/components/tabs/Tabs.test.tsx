import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { Tab } from './Tab';
import { Tabs } from './Tabs';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('dir');
  await uiLocale.use('en');
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 5; i++) await tick();
}

function press(key: string, init: KeyboardEventInit = {}) {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

const headers = (t: Tabs) => Array.from(t.element.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
const panels = (t: Tabs) => Array.from(t.element.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
const shownPanel = (t: Tabs) => panels(t).find((p) => !p.hidden);
const titles = (t: Tabs) => headers(t).map((h) => h.querySelector('.mx-tabs__label')!.textContent);

describe('Tabs', () => {
  it('keeps the parts of a title when it changes: the access key is the same part, kept out while there is none', async () => {
    let t!: Tabs;
    let tab!: Tab;
    page(
      <Tabs ref={(x: Tabs) => (t = x)}>
        <Tab ref={(x: Tab) => (tab = x)} title="&General" />
      </Tabs>,
    );
    await settle();
    const label = headers(t)[0].querySelector('.mx-tabs__label')!;
    const key = label.querySelector('.mx-access-key')!;
    expect(key.textContent).toBe('G');
    tab.title = 'Gen&eral';
    await settle();
    expect(label.querySelector('.mx-access-key')).toBe(key);
    expect(key.textContent).toBe('e');
    expect(label.textContent).toBe('General');
    tab.title = 'Plain';
    await settle();
    expect(label.querySelector('.mx-access-key')).toBeNull();
    expect(label.textContent).toBe('Plain');
    tab.title = '&Back';
    await settle();
    expect(label.querySelector('.mx-access-key')).toBe(key);
    expect(label.textContent).toBe('Back');
  });

  it('builds the tabs pattern from JSX children, the first tab selected', async () => {
    let t!: Tabs;
    page(
      <Tabs ref={(x: Tabs) => (t = x)} label="Settings">
        <Tab title="&General">
          <p class="general">General</p>
        </Tab>
        <Tab title="Advanced">
          <p class="advanced">Advanced</p>
        </Tab>
      </Tabs>,
    );
    await settle();
    const list = t.element.querySelector('[role="tablist"]')!;
    expect(list.getAttribute('aria-label')).toBe('Settings');
    expect(list.hasAttribute('aria-orientation')).toBe(false);
    const [general, advanced] = headers(t);
    expect(titles(t)).toEqual(['General', 'Advanced']);
    expect(general.getAttribute('aria-selected')).toBe('true');
    expect(advanced.getAttribute('aria-selected')).toBe('false');
    expect([general.tabIndex, advanced.tabIndex]).toEqual([0, -1]);
    expect(general.getAttribute('aria-keyshortcuts')).toBe('Alt+G');
    // Only the shown panel is in the page, and only its tab names it.
    const [first] = panels(t);
    expect(panels(t)).toHaveLength(1);
    expect(general.getAttribute('aria-controls')).toBe(first.id);
    expect(advanced.hasAttribute('aria-controls')).toBe(false);
    expect(first.getAttribute('aria-labelledby')).toBe(general.id);
    expect(t.tabs.map((x) => x.isVisible)).toEqual([true, false]);
    expect(first).toBe(t.tabs[0].element);
    expect(t.selectedIndex).toBe(0);
    expect(t.value).toBe(0);
    expect(t.tabs.map((x) => x.title)).toEqual(['&General', 'Advanced']);
  });

  it('is complete programmatically: add, insert, remove, select', async () => {
    const t = new Tabs({ label: 'Docs' });
    page(t);
    const log = t.add(new Tab({ title: 'Log', key: 'log' }));
    const start = t.insert(0, new Tab({ title: 'Start', key: 'start' }));
    await settle();
    expect(titles(t)).toEqual(['Start', 'Log']);
    expect(t.selectedTab).toBe(log);
    t.select(start);
    expect(t.value).toBe('start');
    expect(start.isSelected).toBe(true);
    t.selectedIndex = 1;
    expect(t.selectedTab).toBe(log);
    t.value = 'start';
    expect(t.selectedTab).toBe(start);
    t.remove(start);
    await settle();
    expect(start.isDisposed).toBe(true);
    expect(titles(t)).toEqual(['Log']);
    expect(t.selectedTab).toBe(log);
    expect(t.value).toBe('log');
  });

  it('builds a panel when first shown and keeps it; lazy={false} builds them all at once', async () => {
    const built = vi.fn();
    let t!: Tabs;
    const s = reactive({ count: 0 });
    page(
      <Tabs ref={(x: Tabs) => (t = x)}>
        <Tab title="One">one</Tab>
        <Tab title="Two">
          <div onBuilt={built}>
            <input class="field" value={() => String(s.count)} />
          </div>
        </Tab>
      </Tabs>,
    );
    await settle();
    expect(built).not.toHaveBeenCalled();
    expect(t.tabs[1].contentBuilt).toBe(false);
    t.select(1);
    await settle();
    expect(built).toHaveBeenCalledTimes(1);
    const field = t.element.querySelector<HTMLInputElement>('.field')!;
    field.value = 'typed';
    t.select(0);
    t.select(1);
    expect(built).toHaveBeenCalledTimes(1);
    expect(t.element.querySelector<HTMLInputElement>('.field')).toBe(field);
    expect(field.value).toBe('typed');

    const eager = new Tabs({ lazy: false });
    const two = new Tab({ title: 'Two', content: () => new Component<HTMLParagraphElement>('p') });
    eager.add(new Tab({ title: 'One' }));
    eager.add(two);
    page(eager);
    expect(two.contentBuilt).toBe(true);
  });

  it('remakes content of its content factory each time when keepAlive is off', async () => {
    let made = 0;
    const t = new Tabs({ keepAlive: false });
    t.add(new Tab({ title: 'One' }));
    const two = t.add(
      new Tab({
        title: 'Two',
        content: () => {
          made++;
          const p = new Component<HTMLParagraphElement>('p');
          p.element.className = 'made';
          return p;
        },
      }),
    );
    page(t);
    t.select(two);
    const first = t.element.querySelector('.made');
    t.select(0);
    expect(t.element.querySelector('.made')).toBeNull();
    t.select(two);
    expect(made).toBe(2);
    expect(t.element.querySelector('.made')).not.toBe(first);

    two.keepAlive = true;
    t.select(0);
    t.select(two);
    expect(made).toBe(2);
  });

  it('binds value two-way with x-model, by key', async () => {
    const s = reactive({ page: 'advanced' as string | number });
    let t!: Tabs;
    page(
      <Tabs ref={(x: Tabs) => (t = x)} x-model={() => s.page}>
        <Tab key="general" title="General" />
        <Tab key="advanced" title="Advanced" />
        <Tab key="about" title="About" />
      </Tabs>,
    );
    await settle();
    expect(t.selectedIndex).toBe(1);
    headers(t)[2].click();
    await settle();
    expect(s.page).toBe('about');
    s.page = 'general';
    await settle();
    expect(t.selectedIndex).toBe(0);
    expect(shownPanel(t)).toBe(t.tabs[0].element);
  });

  it('writes every change of the selection to x-model, but not over a tab the model still waits for', async () => {
    const s = reactive({ page: 'later' as string | number });
    let t!: Tabs;
    page(
      <Tabs ref={(x: Tabs) => (t = x)} x-model={() => s.page}>
        <Tab key="general" title="General" />
        <Tab key="advanced" title="Advanced" />
      </Tabs>,
    );
    await settle();
    expect(t.selectedIndex).toBe(0);
    expect(s.page).toBe('later');
    t.add(new Tab({ key: 'later', title: 'Later' }));
    await settle();
    expect(t.value).toBe('later');
    t.select(1);
    expect(s.page).toBe('advanced');
    t.tabs[1].visible = false;
    await settle();
    expect(s.page).toBe(t.value);
    expect(t.value).not.toBe('advanced');
  });

  it('reads functions over plain data again on reState', async () => {
    const plain = { page: 'general', title: 'About' };
    let t!: Tabs;
    const host = page(
      <Tabs ref={(x: Tabs) => (t = x)} value={() => plain.page}>
        <Tab key="general" title="General" />
        <Tab key="about" title={() => plain.title} />
      </Tabs>,
    );
    await settle();
    Object.assign(plain, { page: 'about', title: 'About us' });
    await settle();
    expect(t.value).toBe('general');
    host.reState();
    await settle();
    expect(t.value).toBe('about');
    expect(titles(t)).toEqual(['General', 'About us']);
    headers(t)[0].click();
    expect(plain.page).toBe('about');
  });

  it('follows selectedIndex and every prop given as a function', async () => {
    const s = reactive({
      index: 1,
      placement: 'top' as 'top' | 'start',
      variant: 'line' as 'line' | 'pill',
      size: 'md' as 'md' | 'sm',
      stretch: false,
      closable: false,
      label: 'One',
      title: 'B',
      badge: null as number | null,
      hint: '',
      visible: true,
      enabled: true,
    });
    let t!: Tabs;
    page(
      <Tabs
        ref={(x: Tabs) => (t = x)}
        selectedIndex={() => s.index}
        placement={() => s.placement}
        variant={() => s.variant}
        size={() => s.size}
        stretch={() => s.stretch}
        closable={() => s.closable}
        label={() => s.label}
      >
        <Tab title="A" />
        <Tab title={() => s.title} badge={() => s.badge} hint={() => s.hint} />
        <Tab title="C" visible={() => s.visible} enabled={() => s.enabled} />
      </Tabs>,
    );
    await settle();
    expect(t.selectedIndex).toBe(1);
    expect({ ...t.element.dataset }).toMatchObject({ placement: 'top', variant: 'line', size: 'md' });

    Object.assign(s, { index: 0, placement: 'start', variant: 'pill', size: 'sm', stretch: true, closable: true, label: 'Two', title: 'Bee', badge: 3, hint: 'More' });
    await settle();
    expect(t.selectedIndex).toBe(0);
    expect({ ...t.element.dataset }).toMatchObject({ placement: 'start', variant: 'pill', size: 'sm' });
    expect(t.element.hasAttribute('data-stretch')).toBe(true);
    expect(t.element.querySelector('[role="tablist"]')!.getAttribute('aria-orientation')).toBe('vertical');
    expect(t.element.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBe('Two');
    expect(t.element.querySelectorAll('.mx-tabs__close')).toHaveLength(3);
    const b = headers(t)[1];
    expect(b.querySelector('.mx-tabs__label')!.textContent).toBe('Bee');
    expect(b.querySelector('.mx-tabs__badge')!.textContent).toBe('3');
    expect(b.title).toBe('More');

    const third = headers(t)[2];
    s.enabled = false;
    await settle();
    expect(third.getAttribute('aria-disabled')).toBe('true');
    s.visible = false;
    await settle();
    // A tab not shown has its header out of the page.
    expect(third.isConnected).toBe(false);
    s.badge = null;
    await settle();
    expect(b.querySelector('.mx-tabs__badge')).toBeNull();
  });

  it('moves along the strip with the arrow keys, wrapping, skipping disabled and hidden tabs', async () => {
    let t!: Tabs;
    page(
      <Tabs ref={(x: Tabs) => (t = x)}>
        <Tab title="A" />
        <Tab title="B" enabled={false} />
        <Tab title="C" />
        <Tab title="D" visible={false} />
        <Tab title="E" />
      </Tabs>,
    );
    await settle();
    // D is not shown: its header is out of the page.
    const [a, , c, e] = headers(t);
    a.focus();
    expect(press('ArrowRight')).toBe(true);
    expect(document.activeElement).toBe(c);
    expect(t.selectedIndex).toBe(2);
    press('ArrowRight');
    expect(document.activeElement).toBe(e);
    press('ArrowRight');
    expect(document.activeElement).toBe(a);
    press('ArrowLeft');
    expect(document.activeElement).toBe(e);
    press('Home');
    expect(document.activeElement).toBe(a);
    press('End');
    expect(document.activeElement).toBe(e);
    expect(t.selectedIndex).toBe(4);
    expect(press('ArrowDown')).toBe(false);
  });

  it('reverses Left and Right in right-to-left text and uses Up and Down when vertical', async () => {
    document.documentElement.setAttribute('dir', 'rtl');
    let t!: Tabs;
    page(
      <Tabs ref={(x: Tabs) => (t = x)}>
        <Tab title="A" />
        <Tab title="B" />
      </Tabs>,
    );
    await settle();
    const [a, b] = headers(t);
    a.focus();
    // jsdom computes no direction from dir: say it the way a browser would.
    t.element.style.direction = 'rtl';
    press('ArrowLeft');
    expect(document.activeElement).toBe(b);
    t.element.style.direction = '';
    t.placement = 'end';
    press('ArrowDown');
    expect(document.activeElement).toBe(a);
    press('ArrowUp');
    expect(document.activeElement).toBe(b);
  });

  it('with manual activation, arrows move focus only; Enter or Space selects', async () => {
    let t!: Tabs;
    page(
      <Tabs ref={(x: Tabs) => (t = x)} activation="manual">
        <Tab title="A" />
        <Tab title="B" />
      </Tabs>,
    );
    await settle();
    const [a, b] = headers(t);
    a.focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(b);
    expect(t.selectedIndex).toBe(0);
    expect(a.tabIndex).toBe(0);
    b.click(); // what Enter and Space do on a button
    expect(t.selectedIndex).toBe(1);
    expect(b.tabIndex).toBe(0);
  });

  it('lets onSelecting cancel a selection by the user, and reports every change', async () => {
    const changed = vi.fn();
    let t!: Tabs;
    page(
      <Tabs
        ref={(x: Tabs) => (t = x)}
        onSelecting={(e) => {
          if (e.tab.title === 'Locked') e.cancel = true;
        }}
        onSelectionChanged={changed}
      >
        <Tab title="A" />
        <Tab title="Locked" />
        <Tab title="C" />
      </Tabs>,
    );
    await settle();
    headers(t)[1].click();
    expect(t.selectedIndex).toBe(0);
    headers(t)[2].click();
    expect(t.selectedIndex).toBe(2);
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ index: 2, previousIndex: 0, byUser: true }));
    t.select(1);
    expect(t.selectedIndex).toBe(1);
    expect(changed).toHaveBeenLastCalledWith(expect.objectContaining({ index: 1, byUser: false }));
  });

  it('closes a closable tab with its button or Delete, moving selection and focus to a neighbour', async () => {
    const s = reactive({ keep: true });
    let t!: Tabs;
    page(
      <Tabs
        ref={(x: Tabs) => (t = x)}
        closable
        onClose={(e) => {
          if (e.tab.title === 'Pinned' && s.keep) e.cancel = true;
        }}
      >
        <Tab title="A" />
        <Tab title="B" />
        <Tab title="Pinned" />
        <Tab title="Fixed" closable={false} />
      </Tabs>,
    );
    await settle();
    const close = headers(t)[0].querySelector<HTMLElement>('.mx-tabs__close')!;
    expect(close.getAttribute('aria-hidden')).toBe('true');
    expect(close.title).toBe('Close');
    expect(close.tabIndex).toBe(-1);
    expect(headers(t)[0].getAttribute('aria-keyshortcuts')).toBe('Delete');
    expect(headers(t)[3].querySelector('.mx-tabs__close')).toBeNull();

    close.click();
    expect(titles(t)).toEqual(['B', 'Pinned', 'Fixed']);
    expect(t.selectedTab!.title).toBe('B');

    headers(t)[0].focus();
    press('Delete');
    expect(titles(t)).toEqual(['Pinned', 'Fixed']);
    expect(document.activeElement).toBe(headers(t)[0]);
    expect(t.selectedTab!.title).toBe('Pinned');

    press('Delete');
    expect(titles(t)).toEqual(['Pinned', 'Fixed']);
    s.keep = false;
    press('Delete');
    expect(titles(t)).toEqual(['Fixed']);
    expect(document.activeElement).toBe(headers(t)[0]);
    press('Delete');
    expect(titles(t)).toEqual(['Fixed']);
  });

  it("selects a tab with its access key and names the close button from uiLocale", async () => {
    let t!: Tabs;
    page(
      <Tabs ref={(x: Tabs) => (t = x)} closable>
        <Tab title="&General" />
        <Tab title="&Advanced" />
      </Tabs>,
    );
    await settle();
    press('a', { altKey: true });
    expect(t.selectedIndex).toBe(1);
    expect(document.activeElement).toBe(headers(t)[1]);
    await uiLocale.use('tr');
    await settle();
    expect(headers(t)[0].querySelector<HTMLElement>('.mx-tabs__close')!.title).toBe('Kapat');
  });

  it('keeps one Tab stop, and none with tabStop off; a panel with nothing focusable takes focus', async () => {
    let t!: Tabs;
    page(
      <Tabs ref={(x: Tabs) => (t = x)}>
        <Tab title="Text">Just text</Tab>
        <Tab title="Form">
          <input />
        </Tab>
      </Tabs>,
    );
    await settle();
    expect(headers(t).filter((h) => h.tabIndex === 0)).toHaveLength(1);
    expect(t.tabs[0].element.tabIndex).toBe(0);
    t.select(1);
    await settle();
    expect(t.tabs[1].element.hasAttribute('tabindex')).toBe(false);
    t.tabStop = false;
    expect(headers(t).every((h) => h.tabIndex === -1)).toBe(true);
    t.tabStop = true;
    expect(t.focus()).toBe(true);
    expect(document.activeElement).toBe(headers(t)[1]);
  });

  it('moves the selection off a tab that is hidden, and disables everything with enabled', async () => {
    let t!: Tabs;
    page(
      <Tabs ref={(x: Tabs) => (t = x)}>
        <Tab title="A" />
        <Tab title="B" />
      </Tabs>,
    );
    await settle();
    t.tabs[0].visible = false;
    expect(t.selectedIndex).toBe(1);
    t.enabled = false;
    // The first tab is not shown: the second is the only header in the page.
    expect(headers(t)[0].disabled).toBe(true);
    t.enabled = true;
    expect(headers(t)[0].disabled).toBe(false);
  });

  it('moves a tab from another Tabs, and drops no selection when disposed', async () => {
    const one = new Tabs();
    const two = new Tabs();
    const moving = one.add(new Tab({ title: 'Moving' }));
    one.add(new Tab({ title: 'Staying' }));
    page(one, two);
    two.add(moving);
    expect(one.tabs.map((x) => x.title)).toEqual(['Staying']);
    expect(two.selectedTab).toBe(moving);
    expect(moving.isDisposed).toBe(false);
    const changed = vi.fn();
    two.onSelectionChanged(changed);
    await two.dispose();
    expect(changed).not.toHaveBeenCalled();
  });
});
