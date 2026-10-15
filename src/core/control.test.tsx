import { Component, effect, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../tests/helpers';
import { Button } from '../components/button/Button';
import { Control } from './control';

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

  it('is reactive to read: an effect follows a property set from code', async () => {
    const b = new Button({ text: 'One' });
    const seen: string[] = [];
    const stop = effect(() => void seen.push(b.text));
    b.text = 'Two';
    await tick();
    stop();
    expect(seen).toEqual(['One', 'Two']);
  });

  it('follows a getter prop, and a value set from code replaces that binding', async () => {
    const state = reactive({ busy: false });
    const b = new Button({ enabled: () => !state.busy, text: 'Save' });
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
    const b = new Button({
      ref: (btn: Button) => {
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
    const b = new Button({ text: 'Peek', visible: false });
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
    const inner = new Button({ text: 'Inner' });
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
    const inner = new Button({ text: 'Inner' });
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
    const panel = new Panel({
      childs: [
        <dialog>
          <input name="in-window" />
        </dialog>,
      ],
    });
    page(panel);
    await settle();
    panel.enabled = false;
    expect(panel.element.querySelector<HTMLInputElement>('[name=in-window]')!.disabled).toBe(false);
  });

  it('never leaves focus on <body> when the focused part gets disabled or hidden', async () => {
    const panel = new Panel({ childs: [<input name="inside" />] });
    const next = new Button({ text: 'Next' });
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
    const b = new Button({ text: 'Go' });
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

  it('is focusable from code but not by Tab when tabStop is false', async () => {
    const b = new Button({ text: 'Skip', tabStop: false });
    page(b);
    await settle();
    expect(b.element.tabIndex).toBe(-1);
    expect(b.focus()).toBe(true);
  });
});
