import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import { TextArea } from './TextArea';

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

async function settle() {
  for (let i = 0; i < 6; i++) await tick();
}

const area = (t: TextArea) => t.textAreaElement;
const message = (t: TextArea) => t.element.querySelector('.mx-field__message')!.textContent;

function type(t: TextArea, text: string) {
  area(t).value = text;
  area(t).dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function press(el: Element, key: string, init: KeyboardEventInit = {}) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

describe('TextArea', () => {
  it('is a labelled textarea, the same in JSX and programmatically', async () => {
    let jsx!: TextArea;
    page(<TextArea ref={(t: TextArea) => (jsx = t)} label="&Comment" placeholder="Say something" helpText="Be kind" class="extra" />);
    const coded = new TextArea({ label: 'Notes' });
    page(coded);
    await settle();

    const label = jsx.element.querySelector('label')!;
    expect(area(jsx).tagName).toBe('TEXTAREA');
    expect(jsx.element.className).toContain('mx-text-area');
    expect(jsx.element.className).toContain('extra');
    expect(label.htmlFor).toBe(area(jsx).id);
    expect(area(jsx).getAttribute('aria-keyshortcuts')).toBe('Alt+C');
    expect(area(jsx).placeholder).toBe('Say something');
    expect(area(jsx).rows).toBe(3);
    expect(jsx.element.dataset.resize).toBe('vertical');
    expect(message(jsx)).toBe('Be kind');

    coded.value = 'one\ntwo';
    coded.rows = 6;
    coded.label = 'Memo';
    expect(area(coded).value).toBe('one\ntwo');
    expect(area(coded).rows).toBe(6);
    expect(coded.element.querySelector('label')!.textContent).toBe('Memo');
  });

  it('binds the value two-way with x-model and follows getter props', async () => {
    const s = reactive({ text: 'a', rows: 2, resize: 'both' as 'both' | 'none' });
    const seen: ValueChangedEventArgs<string>[] = [];
    let t!: TextArea;
    page(<TextArea ref={(x: TextArea) => (t = x)} x-model={() => s.text} rows={() => s.rows} resize={() => s.resize} onValueChanged={(e) => seen.push(e)} />);
    await settle();
    expect(area(t).value).toBe('a');
    type(t, 'a\nb');
    expect(s.text).toBe('a\nb');
    s.text = 'c';
    s.rows = 5;
    s.resize = 'none';
    await settle();
    expect(area(t).value).toBe('c');
    expect(area(t).rows).toBe(5);
    expect(t.element.dataset.resize).toBe('none');
    expect(seen.map((e) => [e.value, e.byUser])).toEqual([
      ['a', false],
      ['a\nb', true],
      ['c', false],
    ]);
  });

  it('reads functions over plain data again on reState, and clear() writes the empty text to x-model', async () => {
    const plain = { text: 'a', rows: 2, help: 'Notes' };
    const s = reactive({ note: 'kept' });
    let t!: TextArea;
    let m!: TextArea;
    const host = page(
      <TextArea ref={(x: TextArea) => (t = x)} value={() => plain.text} rows={() => plain.rows} helpText={() => plain.help} />,
      <TextArea ref={(x: TextArea) => (m = x)} x-model={() => s.note} />,
    );
    await settle();
    Object.assign(plain, { text: 'b', rows: 4, help: 'Anything else' });
    await settle();
    expect(area(t).value).toBe('a');
    host.reState();
    expect(area(t).value).toBe('b');
    expect(area(t).rows).toBe(4);
    expect(message(t)).toBe('Anything else');
    type(t, 'typed');
    expect(plain.text).toBe('b');
    m.clear();
    expect(s.note).toBe('');
  });

  it('reports Ctrl+Enter and Cmd+Enter; Enter alone is a new line', async () => {
    const onEnter = vi.fn();
    const s = reactive({ text: '' });
    let t!: TextArea;
    page(<TextArea ref={(x: TextArea) => (t = x)} updateOn="change" x-model={() => s.text} onEnter={(e) => onEnter(e.value)} />);
    await settle();
    area(t).value = 'line';
    expect(press(area(t), 'Enter')).toBe(false);
    expect(onEnter).not.toHaveBeenCalled();
    expect(s.text).toBe('');
    expect(press(area(t), 'Enter', { ctrlKey: true })).toBe(true);
    expect(onEnter).toHaveBeenCalledWith('line');
    expect(s.text).toBe('line');
    press(area(t), 'Enter', { metaKey: true });
    expect(onEnter).toHaveBeenCalledTimes(2);
  });

  it('changes the value when the field is left with updateOn="change"', async () => {
    const s = reactive({ text: '' });
    let t!: TextArea;
    page(<TextArea ref={(x: TextArea) => (t = x)} updateOn="change" x-model={() => s.text} />);
    await settle();
    type(t, 'later');
    expect(s.text).toBe('');
    area(t).dispatchEvent(new Event('change', { bubbles: true }));
    expect(s.text).toBe('later');
  });

  it('counts characters, limits them and checks the length', async () => {
    let t!: TextArea;
    page(<TextArea ref={(x: TextArea) => (t = x)} maxLength={20} minLength={3} showCounter />);
    await settle();
    type(t, 'ab\nc');
    expect(t.element.querySelector('.mx-field__counter')!.textContent).toBe('4/20');
    expect(area(t).maxLength).toBe(20);
    type(t, 'ab');
    expect(await t.validate()).toBe(false);
    expect(message(t)).toBe('Enter at least 3 characters.');
    await uiLocale.use('tr');
    await settle();
    expect(message(t)).toBe('En az 3 karakter girin.');
    t.showCounter = false;
    expect(t.element.querySelector('.mx-field__counter')!.textContent).toBe('');
  });

  it('empties with its clear button and with Escape', async () => {
    const s = reactive({ text: 'abc' });
    let t!: TextArea;
    page(<TextArea ref={(x: TextArea) => (t = x)} clearButton x-model={() => s.text} />);
    await settle();
    const clear = t.element.querySelector<HTMLButtonElement>('.mx-text-area__clear')!;
    expect(clear.getAttribute('aria-label')).toBe('Clear');
    expect(clear.tabIndex).toBe(-1);
    clear.click();
    expect(s.text).toBe('');
    expect(document.activeElement).toBe(area(t));
    type(t, 'xyz');
    expect(press(area(t), 'Escape')).toBe(true);
    expect(s.text).toBe('');
    expect(press(area(t), 'Escape')).toBe(false);
    await uiLocale.use('tr');
    await settle();
    expect(clear.getAttribute('aria-label')).toBe('Temizle');
    t.clearButton = false;
    expect(t.element.querySelector('.mx-text-area__clear')).toBeNull();
  });

  it('grows with its text between minRows and maxRows, with no resize grip', async () => {
    const s = reactive({ grow: true });
    let t!: TextArea;
    page(<TextArea ref={(x: TextArea) => (t = x)} autoGrow={() => s.grow} minRows={2} maxRows={4} resize="both" />);
    await settle();
    expect(area(t).rows).toBe(2);
    expect(t.element.dataset.resize).toBe('none');
    expect(t.element.hasAttribute('data-auto-grow')).toBe(true);
    type(t, 'one\ntwo\nthree');
    expect(area(t).style.blockSize).toMatch(/px$/);
    s.grow = false;
    await settle();
    expect(area(t).rows).toBe(3);
    expect(t.element.dataset.resize).toBe('both');
    expect(area(t).style.blockSize).toBe('');
  });

  it('passes its own attributes to the textarea', async () => {
    let t!: TextArea;
    page(<TextArea ref={(x: TextArea) => (t = x)} name="bio" wrap="off" spellcheck={false} autocomplete="off" readOnly required />);
    await settle();
    const el = area(t);
    expect(el.name).toBe('bio');
    expect(el.getAttribute('wrap')).toBe('off');
    expect(el.getAttribute('spellcheck')).toBe('false');
    expect(el.getAttribute('autocomplete')).toBe('off');
    expect(el.readOnly).toBe(true);
    expect(el.getAttribute('aria-required')).toBe('true');
    expect(await t.validate()).toBe(false);
    expect(message(t)).toBe('This field is required.');
  });

  it('selects the text on focus when asked', async () => {
    let t!: TextArea;
    page(<TextArea ref={(x: TextArea) => (t = x)} selectOnFocus value="hello" />);
    await settle();
    t.focus();
    expect(area(t).selectionStart).toBe(0);
    expect(area(t).selectionEnd).toBe(5);
    t.select();
    expect(area(t).selectionEnd).toBe(5);
  });
});
