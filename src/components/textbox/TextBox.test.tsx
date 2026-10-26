import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import { validateFields } from '../../parts/validation/validate-fields';
import { ValidationGroup } from '../../parts/validation/ValidationGroup';
import { TextBox } from './TextBox';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  uiLocale.strings = enStrings;
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 6; i++) await tick();
}

const input = (b: TextBox) => b.inputElement;
const message = (b: TextBox) => b.element.querySelector('.mx-field__message')!.textContent;

/** Types into a plain input the way the browser reports it. */
function type(b: TextBox, text: string) {
  input(b).value = text;
  input(b).dispatchEvent(new InputEvent('input', { bubbles: true }));
}

/** Types into a masked input: the browser asks first with `beforeinput`. */
function typeKeys(b: TextBox, text: string) {
  const el = input(b);
  for (const data of text) {
    const e = new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data });
    if (el.dispatchEvent(e)) {
      const at = el.selectionStart ?? el.value.length;
      el.value = el.value.slice(0, at) + data + el.value.slice(el.selectionEnd ?? at);
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data }));
    }
  }
}

function press(el: Element, key: string) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  el.dispatchEvent(e);
  return e.defaultPrevented;
}

describe('TextBox', () => {
  it('is a labelled input, the same from JSX and from code', async () => {
    let jsx!: TextBox;
    page(<TextBox ref={(b: TextBox) => (jsx = b)} label="&Name" placeholder="Your name" helpText="As on your ID" class="extra" />);
    const coded = new TextBox({ label: 'City' });
    page(coded);
    await settle();

    const label = jsx.element.querySelector('label')!;
    expect(jsx.element.className).toContain('mx-field');
    expect(jsx.element.className).toContain('extra');
    expect(label.htmlFor).toBe(input(jsx).id);
    expect(label.textContent).toBe('Name');
    expect(input(jsx).getAttribute('aria-keyshortcuts')).toBe('Alt+N');
    expect(input(jsx).placeholder).toBe('Your name');
    expect(message(jsx)).toBe('As on your ID');
    expect(input(jsx).getAttribute('aria-describedby')).toContain(jsx.element.querySelector('.mx-field__message')!.id);
    expect({ ...jsx.element.dataset }).toMatchObject({ size: 'md', variant: 'outline', labelMode: 'top' });

    coded.value = 'Ankara';
    coded.size = 'lg';
    coded.variant = 'filled';
    coded.label = 'Town';
    expect(input(coded).value).toBe('Ankara');
    expect(coded.element.dataset.size).toBe('lg');
    expect(coded.element.querySelector('label')!.textContent).toBe('Town');
  });

  it('binds the value two-way with x-model', async () => {
    const s = reactive({ name: 'Ada' });
    let b!: TextBox;
    page(<TextBox ref={(x: TextBox) => (b = x)} x-model={() => s.name} />);
    await settle();
    expect(input(b).value).toBe('Ada');

    type(b, 'Grace');
    expect(s.name).toBe('Grace');
    expect(b.value).toBe('Grace');

    s.name = 'Linus';
    await settle();
    expect(input(b).value).toBe('Linus');
  });

  it('follows getter props and reports who changed the value', async () => {
    const s = reactive({ size: 'sm' as 'sm' | 'lg', value: 'a' });
    const seen: ValueChangedEventArgs<string>[] = [];
    let b!: TextBox;
    page(<TextBox ref={(x: TextBox) => (b = x)} size={() => s.size} value={() => s.value} onValueChanged={(e) => seen.push(e)} />);
    await settle();
    s.size = 'lg';
    s.value = 'b';
    await settle();
    expect(b.element.dataset.size).toBe('lg');
    type(b, 'bc');
    expect(seen.map((e) => [e.previousValue, e.value, e.byUser])).toEqual([
      ['a', 'b', false],
      ['b', 'bc', true],
    ]);
  });

  it('changes the value when the field is left with updateOn="change"', async () => {
    const s = reactive({ q: '' });
    let b!: TextBox;
    page(<TextBox ref={(x: TextBox) => (b = x)} updateOn="change" x-model={() => s.q} />);
    await settle();
    type(b, 'motif');
    expect(s.q).toBe('');
    input(b).dispatchEvent(new Event('change', { bubbles: true }));
    expect(s.q).toBe('motif');
  });

  it('reports Enter with the value', async () => {
    const onEnter = vi.fn();
    let b!: TextBox;
    page(<TextBox ref={(x: TextBox) => (b = x)} updateOn="change" onEnter={(e) => onEnter(e.value)} />);
    await settle();
    input(b).value = 'go';
    press(input(b), 'Enter');
    expect(onEnter).toHaveBeenCalledWith('go');
    expect(b.value).toBe('go');
  });

  it('empties with its clear button and with Escape', async () => {
    const s = reactive({ q: 'abc' });
    let b!: TextBox;
    page(<TextBox ref={(x: TextBox) => (b = x)} clearButton x-model={() => s.q} />);
    await settle();
    const clear = b.element.querySelector<HTMLButtonElement>('.mx-text-box__clear')!;
    expect(clear.getAttribute('aria-label')).toBe('Clear');
    expect(clear.tabIndex).toBe(-1);
    clear.click();
    expect(s.q).toBe('');
    expect(document.activeElement).toBe(input(b));

    type(b, 'xyz');
    expect(press(input(b), 'Escape')).toBe(true);
    expect(s.q).toBe('');
    // Nothing to clear: Escape goes on to whatever is around the field.
    expect(press(input(b), 'Escape')).toBe(false);
  });

  it('takes focus from a press anywhere in its box, not only on the text line', async () => {
    let b!: TextBox;
    page(<TextBox ref={(x: TextBox) => (b = x)} prefix="€" clearButton value="12" />);
    await settle();
    const box = b.element.querySelector<HTMLElement>('.mx-field__box')!;
    const down = (target: Element) => {
      const e = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0 });
      target.dispatchEvent(e);
      return e.defaultPrevented;
    };
    expect(down(box)).toBe(true);
    expect(document.activeElement).toBe(input(b));
    input(b).blur();
    expect(down(b.element.querySelector('.mx-field__prefix')!)).toBe(true);
    expect(document.activeElement).toBe(input(b));
    // The input itself and the buttons keep their own behavior.
    input(b).blur();
    expect(down(input(b))).toBe(false);
    expect(down(b.element.querySelector('.mx-text-box__clear')!)).toBe(true);
    expect(b.element.querySelector('.mx-text-box__clear')!.closest('button')).not.toBeNull();
    // A focusable page container around the field (a main with tabindex="-1") does not stop it.
    document.body.setAttribute('tabindex', '-1');
    try {
      input(b).blur();
      expect(down(box)).toBe(true);
      expect(document.activeElement).toBe(input(b));
    } finally {
      document.body.removeAttribute('tabindex');
    }
  });

  it('shows a password on request, named from uiLocale', async () => {
    let b!: TextBox;
    page(<TextBox ref={(x: TextBox) => (b = x)} type="password" value="s3cret" />);
    await settle();
    const reveal = b.element.querySelector<HTMLButtonElement>('.mx-text-box__reveal')!;
    expect(input(b).type).toBe('password');
    expect(reveal.getAttribute('aria-pressed')).toBe('false');
    reveal.click();
    expect(input(b).type).toBe('text');
    expect(reveal.getAttribute('aria-pressed')).toBe('true');
    uiLocale.strings = trStrings;
    await settle();
    expect(reveal.getAttribute('aria-label')).toBe('Parolayı göster');
    b.passwordReveal = false;
    expect(b.element.querySelector('.mx-text-box__reveal')).toBeNull();
    expect(input(b).type).toBe('password');
  });

  it('counts characters and limits them', async () => {
    let b!: TextBox;
    page(<TextBox ref={(x: TextBox) => (b = x)} maxLength={10} showCounter />);
    await settle();
    type(b, 'hello');
    expect(b.element.querySelector('.mx-field__counter')!.textContent).toBe('5/10');
    expect(input(b).maxLength).toBe(10);
    b.showCounter = false;
    expect(b.element.querySelector('.mx-field__counter')!.textContent).toBe('');
  });

  it('is read-only or disabled on request', async () => {
    const s = reactive({ on: true });
    let b!: TextBox;
    page(<TextBox ref={(x: TextBox) => (b = x)} readOnly clearButton enabled={() => s.on} value="x" />);
    await settle();
    expect(input(b).readOnly).toBe(true);
    expect(b.element.hasAttribute('data-readonly')).toBe(true);
    s.on = false;
    await settle();
    expect(input(b).disabled).toBe(true);
    expect(b.element.hasAttribute('data-disabled')).toBe(true);
  });

  it('draws prefix, suffix, an icon and buttons of your own', async () => {
    const s = reactive({ can: false });
    const click = vi.fn();
    let b!: TextBox;
    page(
      <TextBox
        ref={(x: TextBox) => (b = x)}
        prefix="https://"
        suffix=".com"
        icon={() => <svg />}
        buttons={[{ text: 'Go', hint: 'Open the site', enabled: () => s.can, click: (e) => click(e.button.text) }]}
      />,
    );
    await settle();
    const box = b.element.querySelector('.mx-field__box')!;
    expect(Array.from(box.children).map((c) => c.className)).toEqual([
      'mx-field__icon',
      'mx-field__prefix',
      'mx-field__input mx-field__control',
      'mx-field__suffix',
      'mx-field__end',
    ]);
    const go = box.querySelector<HTMLButtonElement>('.mx-field__end button')!;
    expect(go.disabled).toBe(true);
    s.can = true;
    await settle();
    const enabled = box.querySelector<HTMLButtonElement>('.mx-field__end button')!;
    expect(enabled.disabled).toBe(false);
    enabled.click();
    expect(click).toHaveBeenCalledWith('Go');
    expect(input(b).getAttribute('aria-describedby')).toContain(box.querySelector('.mx-field__prefix')!.id);
  });

  it('checks a changed field when it is left, and again on every change after that', async () => {
    let b!: TextBox;
    const other = new TextBox({ label: 'Other' });
    page(<TextBox ref={(x: TextBox) => (b = x)} label="Email" type="email" required />, other);
    await settle();

    // Passing through an untouched field does not complain.
    input(b).focus();
    other.focus();
    await settle();
    expect(b.isValid).toBe(true);

    input(b).focus();
    type(b, 'ada@');
    other.focus();
    await settle();
    expect(b.isValid).toBe(false);
    expect(message(b)).toBe('Enter a valid email address.');
    expect(input(b).getAttribute('aria-invalid')).toBe('true');
    expect(b.element.hasAttribute('data-invalid')).toBe(true);

    type(b, 'ada@motif.dev');
    await settle();
    expect(b.isValid).toBe(true);
    expect(message(b)).toBe('');

    type(b, '');
    await settle();
    expect(message(b)).toBe('This field is required.');
    uiLocale.strings = trStrings;
    await settle();
    expect(message(b)).toBe('Bu alan zorunludur.');
  });

  it('validates a group, focuses the first failed field and resets', async () => {
    const group = new ValidationGroup();
    let a!: TextBox;
    let c!: TextBox;
    page(
      <div>
        <TextBox ref={(x: TextBox) => (a = x)} label="A" required validationGroup={group} />
        <TextBox label="B" value="ok" required validationGroup={group} />
        <TextBox ref={(x: TextBox) => (c = x)} label="C" minLength={3} value="ab" validationGroup={group} />
      </div>,
    );
    await settle();
    expect(group.targets.length).toBe(3);
    const result = await group.validate();
    expect(result.valid).toBe(false);
    expect(result.invalid).toEqual([a, c]);
    expect(document.activeElement).toBe(input(a));
    expect(message(c)).toBe('Enter at least 3 characters.');
    expect(group.isValid).toBe(false);

    group.reset();
    await settle();
    expect(group.isValid).toBe(true);
    expect(message(a)).toBe('');

    await hosts[0].dispose();
    expect(group.targets.length).toBe(0);
  });

  it('validates every field inside an element, async rules and outside errors included', async () => {
    const s = reactive({ error: '' as string | null });
    let user!: TextBox;
    const host = page(
      <section>
        <TextBox
          ref={(x: TextBox) => (user = x)}
          label="User"
          value="ada"
          rules={[{ type: 'custom', check: (v) => new Promise((done) => setTimeout(() => done(v === 'ada' ? 'Taken' : true), 5)) }]}
        />
        <TextBox label="Code" value="x" error={() => s.error} />
      </section>,
    );
    await settle();
    const pending = validateFields(host, { focus: false });
    await tick();
    expect(user.validating).toBe(true);
    const result = await pending;
    expect(result.invalid).toEqual([user]);
    expect(message(user)).toBe('Taken');

    s.error = 'Unknown code';
    await settle();
    const code = (await validateFields(host, { focus: false })).invalid[1] as TextBox;
    expect(code.validationMessage).toBe('Unknown code');
    s.error = null;
    await settle();
    expect(code.isValid).toBe(true);
  });

  it('checks on every change with validateOn="input", never on its own with "manual"', async () => {
    let live!: TextBox;
    const manual = new TextBox({ validateOn: 'manual', minLength: 2 });
    page(<TextBox ref={(x: TextBox) => (live = x)} validateOn="input" minLength={2} />, manual);
    await settle();
    type(live, 'a');
    await settle();
    expect(live.isValid).toBe(false);
    input(manual).focus();
    type(manual, 'a');
    input(live).focus();
    await settle();
    expect(manual.isValid).toBe(true);
    expect(await manual.validate()).toBe(false);
  });

  it('keeps a masked value in shape, raw or formatted', async () => {
    const s = reactive({ phone: '' });
    let b!: TextBox;
    page(<TextBox ref={(x: TextBox) => (b = x)} mask="(000) 000 00 00" x-model={() => s.phone} required />);
    await settle();
    expect(input(b).value).toBe('');
    input(b).focus();
    expect(input(b).value).toBe('(___) ___ __ __');
    input(b).setSelectionRange(0, 0);
    typeKeys(b, '532a12');
    expect(input(b).value).toBe('(532) 12_ __ __');
    expect(s.phone).toBe('53212');
    expect(b.maskComplete).toBe(false);
    expect(await b.validate()).toBe(false);
    expect(message(b)).toBe('Fill in the whole value.');

    s.phone = '5321234567';
    await settle();
    expect(input(b).value).toBe('(532) 123 45 67');
    expect(await b.validate()).toBe(true);

    b.maskValue = 'formatted';
    expect(s.phone).toBe('(532) 123 45 67');
    b.mask = '';
    expect(input(b).value).toBe('(532) 123 45 67');
  });

  it('shapes a value set from code and a mask set later', async () => {
    const b = new TextBox({ value: '34ab12', maskChars: { L: { test: /\p{L}/u, transform: 'upper' } } });
    page(b);
    b.mask = '00 LL 00';
    expect(b.value).toBe('34AB12');
    b.value = '06xy99z';
    expect(b.value).toBe('06XY99');
    expect(input(b).value).toBe('06 XY 99');
  });
});
