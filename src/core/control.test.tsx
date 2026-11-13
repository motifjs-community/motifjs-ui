import { Component, effect, reactive } from '@motifx/core';
import { rescueTarget } from './focus';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../tests/helpers';
import { TestButton } from '../../tests/controls';
import { Control } from './control';
import { follow } from './follow';

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

/** Lets reactive flushes and MutationObserver callbacks run. */
async function settle() {
  for (let i = 0; i < 3; i++) await tick();
  await new Promise((r) => setTimeout(r, 0));
}

/** A container control: a div; core renders its JSX children. */
class Panel extends Control<HTMLDivElement> {}
class Win extends Control<HTMLDialogElement> {
  static override elementTag = 'dialog';
  override get isWindow(): boolean {
    return true;
  }
}

describe('Control properties', () => {
  it('costs nothing for properties nobody set, bound or read', () => {
    const c = new Panel();
    expect((c as unknown as { slots?: Map<string, unknown> }).slots).toBeUndefined();
    expect(c.element.hasAttribute('tabindex')).toBe(false);
    expect(c.element.hasAttribute('data-disabled')).toBe(false);
  });

  it('reports defaults when nothing was set', () => {
    const c = new Panel();
    expect(c.text).toBe('');
    expect(c.enabled).toBe(true);
    expect(c.visible).toBe(true);
    expect(c.tabStop).toBe(true);
  });

  it('is reactive to read: an effect follows a property set programmatically', async () => {
    const b = new TestButton({ text: 'One' });
    const seen: string[] = [];
    const stop = effect(() => void seen.push(b.text));
    b.text = 'Two';
    await tick();
    stop();
    expect(seen).toEqual(['One', 'Two']);
  });

  it('reads a getter prop over plain data again on reState, from the control or the page', async () => {
    const plain = { text: 'One', busy: false };
    const b = new TestButton({ text: () => plain.text, enabled: () => !plain.busy });
    const host = page(b);
    await tick();
    plain.text = 'Two';
    b.reState();
    expect(b.element.textContent).toBe('Two');
    plain.busy = true;
    host.reState();
    expect(b.element.disabled).toBe(true);
  });

  it('has the value of a getter prop before it is built', () => {
    const plain = { text: 'One' };
    const b = new TestButton({ text: () => plain.text });
    expect(b.isBuilt).toBe(false);
    expect(b.text).toBe('One');
  });

  it('follows reactive data only once it is built, and from then on by itself', async () => {
    const state = reactive({ text: 'One' });
    const b = new TestButton({ text: () => state.text });
    state.text = 'Two';
    await tick();
    expect(b.text).toBe('One');
    page(b);
    await tick();
    expect(b.text).toBe('Two');
    state.text = 'Three';
    await tick();
    expect(b.element.textContent).toBe('Three');
  });

  it('reaches the controls inside, through components that are not controls', async () => {
    const plain = { text: 'One' };
    const b = new TestButton({ text: () => plain.text });
    const between = new Component<HTMLDivElement>('div');
    const panel = new Panel();
    page(panel);
    panel.controls.add(between);
    between.controls.add(b);
    await tick();
    plain.text = 'Two';
    panel.reState();
    expect(b.element.textContent).toBe('Two');
  });

  it('draws once when the data is reactive and reState is called as well', async () => {
    const state = reactive({ text: 'One' });
    const b = new TestButton({ text: () => state.text });
    page(b);
    await tick();
    let drawn = 0;
    const target = b as unknown as { applyProperty(name: string, value: unknown): void };
    const draw = target.applyProperty.bind(b);
    target.applyProperty = (name: string, value: unknown) => {
      if (name === 'text') drawn++;
      draw(name, value);
    };
    state.text = 'Two';
    await tick();
    b.reState();
    expect(b.element.textContent).toBe('Two');
    expect(drawn).toBe(1);
  });

  it('does not run a following that was stopped during the same reState', async () => {
    const plain = { stop: false };
    const seen: string[] = [];
    const host = page();
    await tick();
    let stopSecond = () => {};
    follow(host, 'first', () => plain.stop, (stop) => {
      seen.push(`first ${stop}`);
      if (stop) stopSecond();
    });
    stopSecond = follow(host, 'second', () => plain.stop, (stop) => void seen.push(`second ${stop}`));
    plain.stop = true;
    host.reState();
    expect(seen).toEqual(['first false', 'second false', 'first true']);
  });

  it('keeps what the user changed across a reState while your value stays the same, and takes a new one', async () => {
    const plain = { text: 'One' };
    const b = new TestButton({ text: () => plain.text });
    const host = page(b);
    await tick();
    (b as unknown as { changeProperty(name: string, value: unknown): void }).changeProperty('text', 'Typed');
    host.reState();
    expect(b.text).toBe('Typed');
    plain.text = 'Two';
    host.reState();
    expect(b.text).toBe('Two');
  });

  it('stops reading the getter once a value is set programmatically', async () => {
    const plain = { text: 'One' };
    const b = new TestButton({ text: () => plain.text });
    page(b);
    await tick();
    b.text = 'Code';
    plain.text = 'Two';
    b.reState();
    expect(b.text).toBe('Code');
  });

  it('follows a getter prop, and a value set programmatically replaces that binding', async () => {
    const state = reactive({ busy: false });
    const b = new TestButton({ enabled: () => !state.busy, text: 'Save' });
    page(b);
    await tick();
    state.busy = true;
    await tick();
    expect(b.element.disabled).toBe(true);

    b.enabled = true; // local value wins from now on
    state.busy = false;
    await tick();
    state.busy = true;
    await tick();
    expect(b.enabled).toBe(true);
    expect(b.element.disabled).toBe(false);
  });

  it('keeps what a ref callback did: core calls refs before subclass fields exist', async () => {
    const seen: string[] = [];
    const b = new TestButton({
      ref: (btn: TestButton) => {
        btn.text = 'From ref';
        btn.bindings.watch(() => void seen.push(btn.text));
      },
    } as never);
    page(b);
    await tick();
    expect(b.element.textContent).toBe('From ref');
    b.text = 'Later';
    await tick();
    expect(seen).toEqual(['From ref', 'Later']);
  });

  it('visible hides and shows the control (core hide/show)', async () => {
    const b = new TestButton({ text: 'Peek', visible: false });
    const host = page(b);
    await settle();
    expect(host.element.querySelector('button')).toBeNull();
    b.visible = true;
    await settle();
    expect(host.element.querySelector('button')).toBe(b.element);
  });

  it('tabStop takes the control out of the Tab order and restores its own tabindex', () => {
    const c = new Panel({ tabStop: false });
    expect(c.element.getAttribute('tabindex')).toBe('-1');
    c.tabStop = true;
    expect(c.element.hasAttribute('tabindex')).toBe(false);

    c.element.setAttribute('tabindex', '0');
    c.tabStop = false;
    expect(c.element.getAttribute('tabindex')).toBe('-1');
    c.tabStop = true;
    expect(c.element.getAttribute('tabindex')).toBe('0');
  });
});

describe('Control enabled cascade', () => {
  it('disables everything inside a disabled container and restores it exactly', async () => {
    const inner = new TestButton({ text: 'Inner' });
    const panel = new Panel({
      childs: [
        inner,
        <input name="plain" />,
        <input name="was-off" disabled />,
        <a href="#x">link</a>,
        <div class="tile" tabindex="0" />,
      ],
    });
    page(panel);
    await settle();
    const q = (s: string) => panel.element.querySelector(s) as HTMLElement & { disabled?: boolean };

    panel.enabled = false;
    expect(panel.element.hasAttribute('data-disabled')).toBe(true);
    expect(inner.element.disabled).toBe(true);
    expect(inner.enabled).toBe(true); // its own value
    expect(inner.isEnabled).toBe(false); // what applies, like CSS :disabled
    expect(q('[name=plain]').disabled).toBe(true);
    expect(q('a').getAttribute('tabindex')).toBe('-1');
    expect(q('a').getAttribute('aria-disabled')).toBe('true');
    expect(q('.tile').getAttribute('tabindex')).toBe('-1');

    panel.enabled = true;
    expect(inner.element.disabled).toBe(false);
    expect(inner.enabled).toBe(true);
    expect(q('[name=plain]').disabled).toBe(false);
    expect(q('[name=was-off]').disabled).toBe(true); // it was disabled on its own
    expect(q('a').hasAttribute('tabindex')).toBe(false);
    expect(q('a').hasAttribute('aria-disabled')).toBe(false);
    expect(q('.tile').getAttribute('tabindex')).toBe('0');
  });

  it('keeps a control disabled while any covering container or its own value says so', async () => {
    const inner = new TestButton({ text: 'Inner' });
    const panel = new Panel({ childs: [inner] });
    page(panel);
    await settle();

    panel.enabled = false;
    inner.enabled = false;
    panel.enabled = true;
    expect(inner.element.disabled).toBe(true);
    inner.enabled = true;
    expect(inner.element.disabled).toBe(false);
  });

  it('disables content added later, and remembers app changes made while disabled', async () => {
    const state = reactive({ more: false, busy: true });
    const panel = new Panel({
      childs: [
        <button type="button" class="busy" disabled={() => state.busy}>
          b
        </button>,
        <div x-wait={() => !state.more}>
          <input name="late" />
        </div>,
      ],
    });
    page(panel);
    await settle();
    panel.enabled = false;

    state.more = true;
    state.busy = false; // the app enables it while the panel is disabled
    await settle();
    const late = panel.element.querySelector<HTMLInputElement>('[name=late]')!;
    const busy = panel.element.querySelector<HTMLButtonElement>('.busy')!;
    expect(late.disabled).toBe(true);
    expect(busy.disabled).toBe(true);

    panel.enabled = true;
    expect(late.disabled).toBe(false);
    expect(busy.disabled).toBe(false); // the app's latest value
  });

  it('swallows pointer input on non-native elements inside', async () => {
    let clicks = 0;
    const panel = new Panel({ childs: [<div class="tile" onclick={() => clicks++} />] });
    page(panel);
    await settle();
    const tile = panel.element.querySelector<HTMLElement>('.tile')!;
    panel.enabled = false;
    tile.click();
    expect(clicks).toBe(0);
    panel.enabled = true;
    tile.click();
    expect(clicks).toBe(1);
  });

  it('does not disable a window (<dialog>) opened inside a disabled container', async () => {
    const panel = new Panel({ childs: [new Win({ childs: [<input name="in-window" />] })] });
    page(panel);
    await settle();
    panel.enabled = false;
    expect(panel.element.querySelector<HTMLInputElement>('[name=in-window]')!.disabled).toBe(false);
  });

  it('never leaves focus on <body> when the focused part gets disabled or hidden', async () => {
    const panel = new Panel({ childs: [<input name="inside" />] });
    const next = new TestButton({ text: 'Next' });
    const other = new Panel({ childs: [<input name="other" />] });
    page(panel, next, other);
    await settle();

    panel.element.querySelector<HTMLInputElement>('[name=inside]')!.focus();
    panel.enabled = false;
    expect(document.activeElement).toBe(next.element);

    other.element.querySelector<HTMLInputElement>('[name=other]')!.focus();
    other.visible = false;
    expect(document.activeElement).toBe(next.element);
  });
});

describe('Control focus', () => {
  it('focus() focuses a usable control and reports failure otherwise', async () => {
    const b = new TestButton({ text: 'Go' });
    const plain = new Panel();
    page(b, plain);
    await settle();

    expect(b.canFocus).toBe(true);
    expect(b.focus()).toBe(true);
    expect(b.focused).toBe(true);
    expect(b.focusWithin).toBe(true);

    expect(plain.canFocus).toBe(false); // a div without tabindex
    expect(plain.focus()).toBe(false);

    b.enabled = false;
    expect(b.canFocus).toBe(false);
    expect(b.focus()).toBe(false);
  });

  it('is focusable programmatically but not by Tab when tabStop is false', async () => {
    const b = new TestButton({ text: 'Skip', tabStop: false });
    page(b);
    await settle();
    expect(b.element.tabIndex).toBe(-1);
    expect(b.focus()).toBe(true);
  });

  it('draws a property it is given without following what drawing reads, and runs `normalize` the same way', async () => {
    const s = reactive({ n: 0, list: [1, 2] });
    class Counter extends Control<HTMLDivElement> {
      constructor() {
        super();
        this.observeProperty('text', () => void s.n);
      }
      set items(value: unknown) {
        this.assignProperty('items', value as () => number[], (list) => list.map((x) => x));
      }
      get items(): number[] {
        return this.getProperty('items');
      }
    }
    const c = new Counter();
    let runs = 0;
    const stop = effect(() => {
      runs++;
      c.text = 'a';
    });
    c.items = () => s.list;
    s.n++;
    s.list.push(3);
    await tick();
    await tick();
    expect(runs).toBe(1);
    expect(c.items).toEqual([1, 2]);
    stop();
  });
});

describe('rescueTarget', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('passes over an iframe, because keys inside it never reach the page', () => {
    document.body.innerHTML = '<div id="area"><button></button></div><iframe></iframe><button id="next"></button>';
    document.querySelector<HTMLElement>('#area button')!.focus();
    expect(rescueTarget(document.getElementById('area')!)).toBe(document.getElementById('next'));
  });

  it('takes the iframe when nothing else is left', () => {
    document.body.innerHTML = '<div id="area"><button></button></div><iframe></iframe>';
    document.querySelector<HTMLElement>('#area button')!.focus();
    expect(rescueTarget(document.getElementById('area')!)?.localName).toBe('iframe');
  });
});
