import { Component, effect, reactive } from '@motifx/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { uiLocale } from '../../core/ui-locale';
import { windowStack } from '../../core/window-stack';
import { Button } from '../button/Button';
import { TextBox } from '../textbox/TextBox';
import { confirm } from './confirm';
import { messageBox } from './message-box';
import { MxForm } from './MxForm';

beforeAll(() => {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
  proto.show = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

let hosts: Component[] = [];

afterEach(async () => {
  await uiLocale.use('en');
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  while (windowStack.top()) windowStack.remove(windowStack.top()!);
  document.body.innerHTML = '';
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle() {
  for (let i = 0; i < 5; i++) await tick();
  await new Promise((r) => setTimeout(r, 0));
  for (let i = 0; i < 5; i++) await tick();
}

function press(key: string, init: KeyboardEventInit = {}, target = document.activeElement as HTMLElement) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

/** A form open from the start opens once it is in the document (`onMounted`, a later task): wait for that, not for a number of ticks. */
const opened = (form: MxForm) => vi.waitFor(() => expect(form.isOpen).toBe(true));

const tools = (f: MxForm) => Array.from(f.element.querySelectorAll<HTMLButtonElement>('.mx-form__tools button'));
const closeButton = (f: MxForm) => f.element.querySelector<HTMLButtonElement>('.mx-form__close')!;
const content = (f: MxForm) => f.element.querySelector<HTMLElement>('.mx-form__content')!;

describe('MxForm', () => {
  it('shows modeless programmatically, in its host, named by its title', async () => {
    const host = page();
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const log: string[] = [];
    const form = new MxForm({ title: '&Settings', content: new TextBox({ label: 'Name' }) });
    form.onLoaded(() => log.push('load'));
    form.onShown(() => log.push('shown'));
    form.show(host);
    await settle();
    expect(form.parent).toBe(host);
    expect(form.element.tagName).toBe('DIALOG');
    expect(form.element.hasAttribute('open')).toBe(true);
    expect(form.element.getAttribute('role')).toBe('dialog');
    expect(form.element.hasAttribute('aria-modal')).toBe(false);
    const title = form.element.querySelector('.mx-form__title')!;
    expect(title.textContent).toBe('Settings');
    expect(form.element.getAttribute('aria-labelledby')).toBe(title.id);
    expect(form.isOpen && !form.isModal && form.isActive).toBe(true);
    expect(windowStack.top()?.element).toBe(form.element);
    expect(windowStack.top()?.modal).toBe(false);
    expect(log).toEqual(['load', 'shown']);
    expect(document.activeElement).toBe(content(form).querySelector('input'));
  });

  it('shows modal with showDialog, resolves with the result, disposes itself and gives focus back', async () => {
    const host = page();
    const opener = new Button({ text: 'Open' });
    host.controls.add(opener);
    opener.focus();
    const closing = vi.fn();
    const closed = vi.fn();
    const form = new MxForm({ title: 'Delete', onClosing: closing, onClosed: closed });
    const done = form.showDialog(host);
    await settle();
    expect(form.element.getAttribute('aria-modal')).toBe('true');
    expect(form.element.hasAttribute('data-modal')).toBe(true);
    expect(windowStack.top()?.modal).toBe(true);
    expect(form.close('ok')).toBe(true);
    expect(await done).toBe('ok');
    expect(closing.mock.calls[0][0]).toMatchObject({ result: 'ok', reason: 'code' });
    expect(closed.mock.calls[0][0]).toMatchObject({ result: 'ok', reason: 'code' });
    await settle();
    expect(form.isDisposed).toBe(true);
    expect(host.controls.items).not.toContain(form);
    expect(windowStack.size).toBe(0);
    expect(document.activeElement).toBe(opener.element);
  });

  it('result: set before close, read after', async () => {
    const host = page();
    const form = new MxForm({ title: 'Pick' });
    const done = form.showDialog(host);
    await settle();
    expect(form.result).toBe('cancel');
    form.result = 'second';
    form.close();
    expect(await done).toBe('second');
  });

  it('from JSX: x-model shows it, the user closing it writes false, it stays alive', async () => {
    const s = reactive({ open: false });
    let form!: MxForm;
    const closed = vi.fn();
    page(
      <MxForm ref={(f: MxForm) => (form = f)} title="Find" x-model={() => s.open} onClosed={closed}>
        <p class="inside">Hello</p>
      </MxForm>,
    );
    await settle();
    expect(form.isOpen).toBe(false);
    expect(content(form).querySelector('.inside')).not.toBeNull();
    s.open = true;
    await settle();
    expect(form.isOpen).toBe(true);
    expect(form.isModal).toBe(false);
    closeButton(form).click();
    await settle();
    expect(s.open).toBe(false);
    expect(form.isOpen).toBe(false);
    expect(form.element.hasAttribute('open')).toBe(false);
    expect(form.isDisposed).toBe(false);
    expect(closed.mock.calls[0][0]).toMatchObject({ result: 'cancel', reason: 'user' });
    s.open = true;
    await settle();
    expect(form.isOpen).toBe(true);
    s.open = false;
    await settle();
    expect(form.isOpen).toBe(false);
  });

  it('x-model follows it opened and closed programmatically, so the model can close and open it again', async () => {
    const s = reactive({ open: false });
    let form!: MxForm;
    const host = page(<MxForm ref={(f: MxForm) => (form = f)} title="Find" x-model={() => s.open} />);
    await settle();
    form.show(host);
    await opened(form);
    expect(s.open).toBe(true);
    s.open = false;
    await settle();
    expect(form.isOpen).toBe(false);
    form.show(host);
    await opened(form);
    form.close();
    expect(s.open).toBe(false);
    s.open = true;
    await settle();
    expect(form.isOpen).toBe(true);
  });

  it('reads functions over plain data again on reState: its title and its tools', async () => {
    const plain = { title: 'Find', maximize: false };
    let form!: MxForm;
    const host = page(<MxForm ref={(f: MxForm) => (form = f)} title={() => plain.title} showMaximize={() => plain.maximize} value />);
    await opened(form);
    expect(form.element.querySelector('.mx-form__title')!.textContent).toBe('Find');
    Object.assign(plain, { title: 'Find and replace', maximize: true });
    await settle();
    expect(form.element.querySelector('.mx-form__title')!.textContent).toBe('Find');
    host.reState();
    expect(form.element.querySelector('.mx-form__title')!.textContent).toBe('Find and replace');
    expect(tools(form).some((b) => b.getAttribute('aria-label') === 'Maximize')).toBe(true);
  });

  it('from JSX: modal, and open from the start', async () => {
    const s = reactive({ open: true });
    let form!: MxForm;
    page(<MxForm ref={(f: MxForm) => (form = f)} title="Welcome" modal x-model={() => s.open} />);
    await opened(form);
    expect(form.isModal).toBe(true);
    press('Escape', {}, form.element);
    await settle();
    expect(s.open).toBe(false);
  });

  it('event props from JSX', async () => {
    const s = reactive({ open: true });
    const log: string[] = [];
    page(
      <MxForm
        title="Props"
        x-model={() => s.open}
        onLoaded={() => log.push('loaded')}
        onShown={() => log.push('shown')}
        onActivate={() => log.push('activate')}
        onClosed={(e) => log.push(`closed:${e.result}`)}
      />,
    );
    await vi.waitFor(() => expect(log).toContain('shown'));
    s.open = false;
    await settle();
    expect(log).toEqual(['loaded', 'activate', 'shown', 'closed:cancel']);
  });

  it('disposeOnClose: off keeps a form programmatically to show again', async () => {
    const host = page();
    const form = new MxForm({ title: 'Again', disposeOnClose: false });
    void form.showDialog(host);
    await settle();
    form.close();
    await settle();
    expect(form.isDisposed).toBe(false);
    const again = form.showDialog(host);
    await settle();
    expect(form.isOpen).toBe(true);
    form.close('ok');
    expect(await again).toBe('ok');
  });

  it('onClosing can keep it open; x-model goes back to true', async () => {
    const s = reactive({ open: true });
    let form!: MxForm;
    let keep = true;
    page(<MxForm ref={(f: MxForm) => (form = f)} title="Edit" x-model={() => s.open} onClosing={(e) => (e.cancel = keep)} />);
    await opened(form);
    closeButton(form).click();
    await settle();
    expect(form.isOpen).toBe(true);
    expect(s.open).toBe(true);
    s.open = false;
    await settle();
    expect(form.isOpen).toBe(true);
    expect(s.open).toBe(true);
    keep = false;
    expect(form.close()).toBe(true);
    await settle();
    expect(s.open).toBe(false);
  });

  it('places view(), the content prop and controls added later in the content area', async () => {
    class Settings extends MxForm {
      constructor() {
        super({ title: 'Settings' });
      }
      override view() {
        return <p class="from-view">From view</p>;
      }
    }
    const host = page();
    const form = new Settings();
    form.show(host);
    await settle();
    expect(content(form).querySelector('.from-view')).not.toBeNull();
    const late = new TextBox({ label: 'Late' });
    form.controls.add(late);
    await settle();
    expect(content(form).contains(late.element)).toBe(true);
    const footer = new Component<HTMLDivElement>('div');
    form.footer = footer;
    expect(form.element.querySelector('.mx-form__footer')!.contains(footer.element)).toBe(true);
    expect(form.element.querySelector<HTMLElement>('.mx-form__footer')!.hidden).toBe(false);
  });

  it('Escape: closes a modal form, not a modeless one; closeOnEscape and cancelButton decide', async () => {
    const host = page();
    const modeless = new MxForm({ title: 'Tools' });
    modeless.show(host);
    await settle();
    press('Escape', {}, modeless.element);
    expect(modeless.isOpen).toBe(true);
    modeless.closeOnEscape = true;
    press('Escape', {}, modeless.element);
    expect(modeless.isOpen).toBe(false);

    const modal = new MxForm({ title: 'Ask', closeOnEscape: false });
    const done = modal.showDialog(host);
    await settle();
    expect(press('Escape', {}, modal.element)).toBe(true);
    expect(modal.isOpen).toBe(true);
    const cancel = new Button({ text: 'Cancel' });
    const clicked = vi.fn(() => modal.close('cancelled'));
    cancel.element.addEventListener('click', clicked);
    modal.controls.add(cancel);
    modal.cancelButton = cancel;
    press('Escape', {}, modal.element);
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(await done).toBe('cancelled');
  });

  it('Enter in a one-line field clicks the accept button, not in a text area or on a button', async () => {
    const host = page();
    const ok = new Button({ text: 'OK' });
    const other = new Button({ text: 'Other' });
    const accepted = vi.fn();
    ok.element.addEventListener('click', accepted);
    const box = new TextBox({ label: 'Name' });
    const area = document.createElement('textarea');
    const form = new MxForm({ title: 'Rename', acceptButton: ok });
    form.controls.add(box, ok, other);
    form.show(host);
    await settle();
    content(form).append(area);
    const input = box.element.querySelector('input')!;
    expect(press('Enter', {}, input)).toBe(true);
    expect(accepted).toHaveBeenCalledTimes(1);
    press('Enter', {}, area);
    press('Enter', {}, other.element);
    press('Enter', { shiftKey: true }, input);
    expect(accepted).toHaveBeenCalledTimes(1);
    ok.enabled = false;
    press('Enter', {}, input);
    expect(accepted).toHaveBeenCalledTimes(1);
  });

  it('events stop at the window root', async () => {
    const host = page();
    const seen = vi.fn();
    host.element.addEventListener('click', seen);
    host.element.addEventListener('keydown', seen);
    const inner = new Button({ text: 'Inner' });
    const innerSeen = vi.fn();
    const wrap = new Component<HTMLDivElement>('div');
    wrap.controls.add(inner);
    const form = new MxForm({ title: 'Box', content: wrap });
    form.show(host);
    await settle();
    wrap.element.addEventListener('click', innerSeen);
    inner.element.click();
    press('a', {}, inner.element);
    expect(innerSeen).toHaveBeenCalledTimes(1);
    expect(seen).not.toHaveBeenCalled();
  });

  it('dies with disposeRef even while open', async () => {
    const host = page();
    const owner = new Component<HTMLDivElement>('div');
    host.controls.add(owner);
    const closed = vi.fn();
    const form = new MxForm({ title: 'Owned', onClosed: closed });
    const done = form.showDialog(host, owner);
    await settle();
    await owner.dispose();
    await settle();
    expect(form.isDisposed).toBe(true);
    expect(closed.mock.calls[0][0]).toMatchObject({ reason: 'owner' });
    expect(await done).toBe('cancel');
    expect(windowStack.size).toBe(0);
  });

  it('dies with its host', async () => {
    const host = page();
    const holder = new Component<HTMLDivElement>('div');
    host.controls.add(holder);
    const form = new MxForm({ title: 'Inside' });
    form.show(holder);
    await settle();
    await holder.dispose();
    expect(form.isDisposed).toBe(true);
  });

  it('nested: a modal from a modal is on top; closing it gives focus back inside the first', async () => {
    const host = page();
    const go = new Button({ text: 'More' });
    const first = new MxForm({ title: 'First', content: go });
    void first.showDialog(host);
    await settle();
    go.focus();
    const second = new MxForm({ title: 'Second' });
    const done = second.showDialog(first);
    await settle();
    expect(second.parent).toBe(first);
    expect(windowStack.top()?.element).toBe(second.element);
    expect(first.isActive).toBe(false);
    expect(second.isActive).toBe(true);
    second.close('ok');
    expect(await done).toBe('ok');
    expect(first.isActive).toBe(true);
    expect(document.activeElement).toBe(go.element);
  });

  it('Tab cycles inside a modal form', async () => {
    const host = page();
    const a = new Button({ text: 'A' });
    const b = new Button({ text: 'B' });
    const form = new MxForm({ title: 'Cycle', showClose: false });
    form.controls.add(a, b);
    void form.showDialog(host);
    await settle();
    b.focus();
    expect(press('Tab')).toBe(true);
    expect(document.activeElement).toBe(a.element);
    expect(press('Tab', { shiftKey: true })).toBe(true);
    expect(document.activeElement).toBe(b.element);
  });

  it('focuses [autofocus], else the first field, else the accept button', async () => {
    const host = page();
    const ok = new Button({ text: 'OK' });
    const plain = new MxForm({ title: 'Plain', acceptButton: ok });
    plain.controls.add(new Button({ text: 'Help' }), ok);
    plain.show(host);
    await settle();
    expect(document.activeElement).toBe(ok.element);
    plain.close();
    const auto = new Button({ text: 'Auto' });
    auto.element.setAttribute('autofocus', '');
    const withAuto = new MxForm({ title: 'Auto' });
    withAuto.controls.add(new TextBox({ label: 'First' }), auto);
    withAuto.show(host);
    await settle();
    expect(document.activeElement).toBe(auto.element);
  });

  it('title bar buttons: switches, maximize, minimize to the title bar or to a target', async () => {
    const host = page();
    const target = document.createElement('div');
    document.body.append(target);
    const form = new MxForm({ title: 'Notes', showMinimize: true, showMaximize: true });
    form.show(host);
    await settle();
    expect(tools(form).map((b) => b.getAttribute('aria-label'))).toEqual(['Minimize', 'Maximize', 'Close']);
    tools(form)[1].click();
    expect(form.windowState).toBe('maximized');
    expect(form.element.dataset.state).toBe('maximized');
    expect(tools(form)[1].getAttribute('aria-label')).toBe('Restore');
    form.element.querySelector('.mx-form__bar')!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(form.windowState).toBe('normal');
    tools(form)[0].click();
    expect(form.element.dataset.state).toBe('minimized');
    expect(form.element.hasAttribute('data-docked')).toBe(false);
    tools(form)[0].click();
    expect(form.windowState).toBe('normal');

    form.minimizeTarget = target;
    form.minimize();
    expect(form.element.hasAttribute('data-docked')).toBe(true);
    const chip = target.querySelector<HTMLButtonElement>('.mx-form-chip')!;
    expect(chip.textContent).toBe('Notes');
    expect(windowStack.size).toBe(0);
    chip.click();
    expect(form.windowState).toBe('normal');
    expect(target.querySelector('.mx-form-chip')).toBeNull();
    expect(windowStack.top()?.element).toBe(form.element);

    form.showMinimize = false;
    form.showClose = false;
    expect(tools(form).map((b) => b.getAttribute('aria-label'))).toEqual(['Maximize']);
  });

  it('a modal form cannot be minimized', async () => {
    const host = page();
    const form = new MxForm({ title: 'Modal', showMinimize: true });
    void form.showDialog(host);
    await settle();
    expect(tools(form).map((b) => b.getAttribute('aria-label'))).toEqual(['Close']);
    form.minimize();
    expect(form.windowState).toBe('normal');
    expect(form.element.dataset.state).toBe('normal');
  });

  it('frame switches, size and start position', async () => {
    const host = page();
    const s = reactive({ resizable: true, width: '30rem' });
    const form = new MxForm({ title: 'Frame', resizable: () => s.resizable, width: () => s.width, startPosition: 'manual', left: 40, top: '2rem' });
    form.show(host);
    await settle();
    const el = form.element;
    expect(el.hasAttribute('data-resizable') && el.hasAttribute('data-movable')).toBe(true);
    expect(el.style.getPropertyValue('--_mx-w')).toBe('30rem');
    expect(el.hasAttribute('data-placed')).toBe(true);
    expect(el.style.getPropertyValue('--_mx-x')).toBe('40px');
    expect(el.style.getPropertyValue('--_mx-y')).toBe('2rem');
    s.resizable = false;
    s.width = '20rem';
    await settle();
    expect(el.hasAttribute('data-resizable')).toBe(false);
    expect(el.style.getPropertyValue('--_mx-w')).toBe('20rem');
    form.movable = false;
    expect(el.hasAttribute('data-movable')).toBe(false);
    form.startPosition = 'center';
    form.close();
    const again = new MxForm({ title: 'Centered' });
    again.show(host);
    await settle();
    expect(again.element.hasAttribute('data-placed')).toBe(false);
  });

  it('properties are reactive', async () => {
    const host = page();
    const form = new MxForm({ title: 'One' });
    const seen: string[] = [];
    const stop = effect(() => void seen.push(`${form.title}:${form.isOpen}`));
    form.show(host);
    await settle();
    form.title = 'Two';
    await settle();
    stop();
    expect(seen).toEqual(['One:false', 'One:true', 'Two:true']);
  });

  it('activation follows the window stack', async () => {
    const host = page();
    const a = new MxForm({ title: 'A' });
    const b = new MxForm({ title: 'B' });
    const log: string[] = [];
    a.onActivate(() => log.push('a+'));
    a.onDeactivate(() => log.push('a-'));
    a.show(host);
    b.show(host);
    await settle();
    expect(a.isActive).toBe(false);
    a.element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(a.isActive && !b.isActive).toBe(true);
    expect(a.element.hasAttribute('data-active')).toBe(true);
    expect(log).toEqual(['a+', 'a-', 'a+']);
  });

  it('follows uiLocale', async () => {
    const host = page();
    const form = new MxForm({ title: 'Lang', showMaximize: true });
    form.show(host);
    await settle();
    await uiLocale.use('tr');
    await settle();
    expect(tools(form).map((b) => b.getAttribute('aria-label'))).toEqual(['Büyüt', 'Kapat']);
  });
});

describe('messageBox and confirm', () => {
  it('shows a modal alert with named buttons and resolves with the one pressed', async () => {
    const host = page();
    const done = messageBox({ title: 'Delete', text: 'Delete the file?', buttons: ['yes', 'no'], tone: 'danger', host });
    await settle();
    const form = host.controls.items.find((c) => c instanceof MxForm) as MxForm;
    const el = form.element;
    expect(el.getAttribute('role')).toBe('alertdialog');
    expect(el.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(el.getAttribute('aria-describedby')!)!.textContent).toBe('Delete the file?');
    const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('.mx-form__footer button'));
    expect(buttons.map((b) => b.textContent)).toEqual(['Yes', 'No']);
    // A danger box starts on the safe button.
    expect(document.activeElement).toBe(buttons[1]);
    buttons[0].click();
    expect(await done).toBe('yes');
  });

  it('Escape answers with the cancel button; texts follow uiLocale', async () => {
    const host = page();
    await uiLocale.use('tr');
    const done = messageBox({ text: 'Kaydedilsin mi?', buttons: ['ok', 'cancel'], host });
    await settle();
    const form = host.controls.items.find((c) => c instanceof MxForm) as MxForm;
    expect(form.element.getAttribute('role')).toBe('dialog');
    const buttons = Array.from(form.element.querySelectorAll<HTMLButtonElement>('.mx-form__footer button'));
    expect(buttons.map((b) => b.textContent)).toEqual(['Tamam', 'İptal']);
    expect(document.activeElement).toBe(buttons[0]);
    press('Escape');
    expect(await done).toBe('cancel');
  });

  it('confirm resolves true for OK, false for Cancel', async () => {
    const host = page();
    const yes = confirm('Go on?', { host });
    await settle();
    (document.querySelector('.mx-form__footer button') as HTMLButtonElement).click();
    expect(await yes).toBe(true);
    await settle();
    const no = confirm('Go on?', { host });
    await settle();
    press('Escape');
    expect(await no).toBe(false);
  });

  it('works without a host or an application', async () => {
    const done = messageBox({ text: 'Alone' });
    await settle();
    const dialog = document.querySelector('dialog.mx-form')!;
    expect(dialog.hasAttribute('open')).toBe(true);
    // Under a root of its own the form mounts, and focus starts on its button.
    await new Promise((r) => setTimeout(r, 30));
    const ok = dialog.querySelector('.mx-form__footer button') as HTMLButtonElement;
    expect(document.activeElement).toBe(ok);
    ok.click();
    expect(await done).toBe('ok');
    await settle();
    expect(document.querySelector('dialog.mx-form')).toBeNull();
  });
});
