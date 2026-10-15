import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { Button } from '../button/Button';
import { GroupBox } from '../groupbox/GroupBox';
import { Stack } from '../stack/Stack';
import { Label } from './Label';

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

/** Alt + key on the focused element (or body), as a user would press it. */
function alt(key: string) {
  const target = (document.activeElement as HTMLElement) ?? document.body;
  const e = new KeyboardEvent('keydown', { key, altKey: true, bubbles: true, cancelable: true });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

function input(id?: string) {
  const el = document.createElement('input');
  if (id) el.id = id;
  return el;
}

describe('Label', () => {
  it('renders text with its access key, follows changes, and shows & as written without accessKeys', async () => {
    const state = reactive({ text: '&Name' });
    const label = new Label({ text: () => state.text });
    page(label);
    await tick();
    expect(label.element.tagName).toBe('LABEL');
    expect(label.element.textContent).toBe('Name');
    expect(label.element.querySelector('.mx-access-key')?.textContent).toBe('N');
    expect(label.element.getAttribute('aria-keyshortcuts')).toBe('Alt+N');
    state.text = 'Smith && Co';
    await tick();
    expect(label.element.textContent).toBe('Smith & Co');
    expect(label.element.hasAttribute('aria-keyshortcuts')).toBe(false);
    label.accessKeys = false;
    label.text = 'R&D';
    expect(label.element.textContent).toBe('R&D');
    expect(label.element.hasAttribute('aria-keyshortcuts')).toBe(false);
  });

  it('names a labelable target with for (control, element or id) and takes the name off when the target changes', async () => {
    const ok = new Button({ text: 'OK' });
    const label = new Label({ text: 'Confirm', target: ok });
    const host = page(label, ok);
    await tick();
    expect(ok.element.id).not.toBe('');
    expect(label.element.htmlFor).toBe(ok.element.id);

    const field = input('city');
    host.element.append(field);
    label.target = 'city';
    expect(label.element.htmlFor).toBe('city');
    label.target = null;
    expect(label.element.hasAttribute('for')).toBe(false);
  });

  it('writes an id target as for even before the element exists', async () => {
    const label = new Label({ text: '&City', target: 'late-city' });
    const host = new Component<HTMLDivElement>('div');
    host.build();
    host.element.append(input('late-city'));
    host.controls.add(label);
    document.body.append(host.element);
    hosts.push(host);
    expect(label.element.htmlFor).toBe('late-city');
  });

  it('reads a getter target again right after construction, for a ref set after the label was built', async () => {
    let box: HTMLElement | null = null;
    const label = new Label({ text: 'Late', target: () => box });
    box = input();
    const host = page(label);
    host.element.append(box);
    await tick();
    expect(label.element.htmlFor).toBe(box.id);
  });

  it('labels a non-labelable id target found right after construction', async () => {
    const label = new Label({ text: 'Tree', target: 'late-tree' });
    const host = page(label);
    const tree = document.createElement('div');
    tree.id = 'late-tree';
    tree.setAttribute('role', 'tree');
    host.element.append(tree);
    await tick();
    expect(tree.getAttribute('aria-labelledby')).toBe(label.element.id);
    expect(label.element.hasAttribute('for')).toBe(false);
  });

  it('labels a non-labelable target with aria-labelledby; a click focuses it; dispose takes the name off', async () => {
    const list = document.createElement('div');
    list.setAttribute('role', 'listbox');
    list.tabIndex = 0;
    list.setAttribute('aria-labelledby', 'other');
    const label = new Label({ text: 'Fruits', target: list });
    const host = page(label);
    host.element.append(list);
    await tick();
    expect(list.getAttribute('aria-labelledby')).toBe(`other ${label.element.id}`);
    label.element.click();
    expect(document.activeElement).toBe(list);
    await host.dispose();
    expect(list.getAttribute('aria-labelledby')).toBe('other');
  });

  it('Alt + access key focuses the target and never clicks it', async () => {
    let clicks = 0;
    const ok = new Button({ text: 'OK', onclick: () => clicks++ });
    page(new Label({ text: '&Confirm', target: ok }), ok);
    await tick();
    expect(alt('c')).toBe(true);
    expect(document.activeElement).toBe(ok.element);
    expect(clicks).toBe(0);
  });

  it('a label that names nothing does not move focus (screen readers would not connect the two)', async () => {
    const first = new Button({ text: 'first' });
    const after = new Button({ text: 'after' });
    page(first, new Label({ text: '&Amount' }), after);
    await tick();
    first.focus();
    alt('a');
    expect(document.activeElement).toBe(first.element);
  });

  it('without a target, the field the label wraps is the one it names', async () => {
    const label = new Label({ text: '&Wrapped', childs: [new Component<HTMLInputElement>('input')] });
    page(label, new Button({ text: 'after' }));
    await tick();
    alt('w');
    expect(document.activeElement).toBe(label.element.querySelector('input'));
  });

  it('passes focus into a target that cannot take it itself (a GroupBox)', async () => {
    const inside = new Button({ text: 'inside' });
    const group = new GroupBox({ text: 'Address', childs: [inside] });
    page(new Label({ text: '&Address', target: group }), group);
    await tick();
    alt('a');
    expect(document.activeElement).toBe(inside.element);
  });

  it('a disabled label does not consume its access key', async () => {
    const ok = new Button({ text: 'OK' });
    const label = new Label({ text: '&Confirm', target: ok, enabled: false });
    page(label, ok);
    await tick();
    expect(alt('c')).toBe(false);
    expect(document.activeElement).not.toBe(ok.element);
    expect(label.element.hasAttribute('data-disabled')).toBe(true);
    label.enabled = true;
    expect(alt('c')).toBe(true);
    expect(document.activeElement).toBe(ok.element);
  });

  it('writes the look where the CSS binds to it', () => {
    const label = new Label({ textStyle: 'subtitle', tone: 'secondary', textAlign: 'end', verticalAlign: 'center', ellipsis: true });
    const el = label.element;
    expect(el.getAttribute('data-text-style')).toBe('subtitle');
    expect(el.getAttribute('data-tone')).toBe('secondary');
    expect(el.getAttribute('data-text-align')).toBe('end');
    expect(el.getAttribute('data-vertical-align')).toBe('center');
    expect(el.hasAttribute('data-ellipsis')).toBe(true);
    label.maxLines = 2;
    expect(el.getAttribute('data-max-lines')).toBe('2');
    expect(el.style.getPropertyValue('--_mx-lines')).toBe('2');
    label.maxLines = undefined;
    label.tone = undefined;
    label.ellipsis = false;
    expect(el.hasAttribute('data-max-lines')).toBe(false);
    expect(el.hasAttribute('data-tone')).toBe(false);
    expect(el.hasAttribute('data-ellipsis')).toBe(false);
  });

  it('puts its text before JSX children (a wrapped field follows its name) and never takes focus', async () => {
    const label = new Label({ childs: [new Component<HTMLInputElement>('input')] });
    page(label);
    await tick();
    label.text = 'Name';
    expect(label.element.firstChild?.textContent).toBe('Name');
    expect(label.element.lastElementChild?.tagName).toBe('INPUT');
    expect(label.focus()).toBe(false);
  });
});
