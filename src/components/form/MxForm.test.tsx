import { Component, reactive, type ComponentBase } from '@motifx/core';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import type { CloseReason, FormResult } from '../../core/form-result';
import { uiLocale, enStrings, trStrings } from '../../core/locale';
import { tabbableIn } from '../../core/focus';
import { windowStack } from '../../core/window-stack';
import { MxForm, type FormClosedEventArgs, type FormClosingEventArgs } from './MxForm';

// jsdom has HTMLDialogElement but none of its methods; the real top layer,
// inert page and Tab trapping are checked in the browser smoke test.
beforeAll(() => {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & Record<string, unknown>;
  proto.show = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.setAttribute('data-test-modal', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  uiLocale.set(enStrings);
});

/** A page-like host mounted in the document. */
function page(...children: ComponentBase[]) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

/** Lets mount observers and reactive flushes run. */
async function settle() {
  for (let i = 0; i < 5; i++) await tick();
  await new Promise((r) => setTimeout(r, 0));
}

class CustomerForm extends MxForm {
  override view() {
    return (
      <>
        <input name="customer" autofocus />
        <footer>
          <button type="button" data-result="cancel">
            Cancel
          </button>
          <button type="button" data-result="ok">
            Save
          </button>
        </footer>
      </>
    );
  }
}

const q = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector<T>(sel)!;

describe('MxForm content', () => {
  it('a subclass view() fills the content area and the frame stays', async () => {
    const form = new CustomerForm({ text: 'Customer' });
    const host = page(form);
    await settle();
    const el = form.element;
    expect(el.classList.contains('mx-form')).toBe(true);
    expect(q(el, '.mx-form__title').textContent).toBe('Customer');
    expect(q(el, '.mx-form__body input[name="customer"]')).toBeTruthy();
    expect(el.querySelector('.mx-form__titlebar input')).toBeNull();
    // Embedded in a page it is a labelled region.
    expect(el.getAttribute('data-host')).toBe('embedded');
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-labelledby')).toBe(q(el, '.mx-form__title').id);
    expect(host.element.contains(el)).toBe(true);
  });

  it('takes content from the content prop or from JSX children', async () => {
    const byProp = new MxForm({ text: 'A', content: () => <p class="from-prop">prop</p> });
    let byChildren!: MxForm;
    page(
      byProp,
      <MxForm text="B" ref={(f: MxForm) => (byChildren = f)}>
        <p class="from-children">children</p>
      </MxForm>,
    );
    await settle();
    expect(q(byProp.element, '.mx-form__body .from-prop').textContent).toBe('prop');
    expect(q(byChildren.element, '.mx-form__body .from-children').textContent).toBe('children');
  });

  it('shows caption buttons by option, labelled from the locale and live on language change', async () => {
    const form = new MxForm({ text: 'X', showMaximize: true });
    page(form);
    await settle();
    const close = q(form.element, '[data-action="close"]');
    expect(close.getAttribute('aria-label')).toBe('Close');
    expect(form.element.querySelector('[data-action="minimize"]')).toBeNull();
    const max = q(form.element, '[data-action="maximize"]');
    uiLocale.set(trStrings);
    await settle();
    expect(close.getAttribute('aria-label')).toBe('Kapat');
    max.click();
    await settle();
    expect(form.windowState).toBe('maximized');
    expect(form.element.getAttribute('data-window-state')).toBe('maximized');
    expect(max.getAttribute('aria-label')).toBe(trStrings.restore);
  });
});

describe('MxForm.show / showDialog', () => {
  it('show(host) adds a modeless window to the host and labels it by the caption', async () => {
    const host = page();
    const form = new CustomerForm({ text: 'Customer' }).show(host);
    await settle();
    const win = q<HTMLDialogElement>(host.element, 'dialog.mx-form-window');
    expect(win.hasAttribute('open')).toBe(true);
    expect(win.hasAttribute('data-test-modal')).toBe(false);
    expect(win.contains(form.element)).toBe(true);
    expect(win.getAttribute('aria-labelledby')).toBe(form.titleId);
    expect(form.element.getAttribute('role')).toBeNull();
    expect(form.isOpen).toBe(true);
    expect(form.isActive).toBe(true);
    await form.close();
  });

  it('showDialog resolves with the result of the clicked result button and the form dies', async () => {
    const host = page();
    const form = new CustomerForm({ text: 'Customer' });
    const result = form.showDialog(host);
    await settle();
    const win = q(host.element, 'dialog.mx-form-window');
    expect(win.hasAttribute('data-test-modal')).toBe(true);
    q(form.element, '[data-result="ok"]').click();
    expect(await result).toBe('ok');
    await settle();
    expect(form.isDisposed).toBe(true);
    expect(host.element.querySelector('dialog')).toBeNull();
    expect(windowStack.size).toBe(0);
  });

  it('onClosing can cancel (also async), and onClosed reports the result', async () => {
    const host = page();
    let allow = false;
    const closed: FormClosedEventArgs[] = [];
    const form = new CustomerForm({
      text: 'Customer',
      onClosing: async (e: FormClosingEventArgs) => {
        await tick();
        if (!allow) e.cancel = true;
      },
      onClosed: (e: FormClosedEventArgs) => closed.push(e),
    });
    const result = form.showDialog(host);
    await settle();
    expect(await form.close('ok')).toBe(false);
    expect(form.isOpen).toBe(true);
    allow = true;
    expect(await form.close('yes')).toBe(true);
    expect(await result).toBe('yes');
    expect(closed).toHaveLength(1);
    expect(closed[0].reason).toBe('code');
  });

  it('dies with disposeRef while open, resolving none with reason owner', async () => {
    const host = page();
    const owner = new Component<HTMLDivElement>('div');
    host.controls.add(owner);
    const reasons: string[] = [];
    const form = new CustomerForm({ onClosed: (e: FormClosedEventArgs) => reasons.push(e.reason) });
    const result = form.showDialog(host, owner);
    await settle();
    await owner.dispose();
    expect(await result).toBe('none');
    await settle();
    expect(reasons).toEqual(['owner']);
    expect(form.isDisposed).toBe(true);
    expect(host.element.querySelector('dialog')).toBeNull();
  });

  it('dies with its host when no disposeRef is given', async () => {
    const outer = page();
    const host = new Component<HTMLDivElement>('div');
    outer.controls.add(host);
    const form = new CustomerForm();
    const result = form.showDialog(host);
    await settle();
    await host.dispose();
    expect(await result).toBe('none');
    expect(form.isDisposed).toBe(true);
  });

  it('after a normal close the disposeRef listener is gone (no leak, no late close)', async () => {
    const host = page();
    const owner = new Component<HTMLDivElement>('div');
    host.controls.add(owner);
    // Record what the form subscribes on the owner and what it removes again.
    const subscribed: unknown[] = [];
    const removed: unknown[] = [];
    const on = owner.motif.on.bind(owner.motif);
    const off = owner.motif.off.bind(owner.motif);
    owner.motif.on = ((event: string, cb: () => void, dom?: boolean) => {
      if (event === 'x:disposing') subscribed.push(cb);
      return on(event, cb, dom);
    }) as typeof owner.motif.on;
    owner.motif.off = ((event: string, cb: () => void) => {
      if (event === 'x:disposing') removed.push(cb);
      return off(event, cb);
    }) as typeof owner.motif.off;

    const closed: string[] = [];
    const form = new CustomerForm({ onClosed: (e: FormClosedEventArgs) => closed.push(e.reason) });
    const result = form.showDialog(host, owner);
    await settle();
    expect(subscribed).toHaveLength(1);
    q(form.element, '[data-result="cancel"]').click();
    expect(await result).toBe('cancel');
    expect(removed).toEqual(subscribed);
    await owner.dispose();
    expect(closed).toEqual(['code']);
  });

  it('nested dialogs stack; closing the inner one leaves the outer one active', async () => {
    const host = page();
    const outer = new CustomerForm({ text: 'Outer' });
    const outerResult = outer.showDialog(host);
    await settle();
    const inner = new CustomerForm({ text: 'Inner' });
    const innerResult = inner.showDialog(outer);
    await settle();
    expect(windowStack.size).toBe(2);
    expect(inner.isActive).toBe(true);
    expect(outer.isActive).toBe(false);
    expect(outer.element.contains(inner.element)).toBe(true);
    // Enter inside the inner form must not reach the outer form's accept button.
    let outerAccepted = false;
    const outerAccept = (<button type="button" onclick={() => (outerAccepted = true)} />) as Component;
    (outer.props as { defaultButton?: unknown }).defaultButton = outerAccept;
    q(inner.element, 'input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(outerAccepted).toBe(false);
    q(inner.element, '[data-result="ok"]').click();
    expect(await innerResult).toBe('ok');
    expect(outer.isOpen).toBe(true);
    expect(outer.isActive).toBe(true);
    // Disposing the outer one takes nothing else down with it now.
    q(outer.element, ':scope > .mx-form__body [data-result="cancel"]').click();
    expect(await outerResult).toBe('cancel');
    expect(windowStack.size).toBe(0);
  });

  it('a form shown inside a dialog dies with that dialog', async () => {
    const host = page();
    const outer = new CustomerForm({ text: 'Outer' });
    const outerResult = outer.showDialog(host);
    await settle();
    const tool = new CustomerForm({ text: 'Tool' }).show(outer);
    await settle();
    void outer.close('ok');
    expect(await outerResult).toBe('ok');
    await settle();
    expect(tool.isDisposed).toBe(true);
    expect(windowStack.size).toBe(0);
  });
});

describe('MxForm keyboard and focus', () => {
  it('focuses [autofocus] on open and returns focus to the opener on close', async () => {
    const opener = (<button type="button">Open</button>) as Component<HTMLButtonElement>;
    const host = page(opener);
    await settle();
    opener.element.focus();
    const form = new CustomerForm();
    const result = form.showDialog(host);
    await settle();
    expect(document.activeElement).toBe(q(form.element, 'input[name="customer"]'));
    q(form.element, '[data-result="ok"]').click();
    await result;
    expect(document.activeElement).toBe(opener.element);
  });

  it('without a cancelButton, Escape closes a modal form (like a native modal dialog) unless closeOnEscape is false', async () => {
    const host = page();
    const escape = (f: MxForm) =>
      q(f.element, 'input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

    const modal = new CustomerForm();
    const result = modal.showDialog(host);
    await settle();
    escape(modal);
    expect(await result).toBe('cancel');

    const kept = new CustomerForm({ closeOnEscape: false });
    void kept.showDialog(host);
    await settle();
    escape(kept);
    await settle();
    expect(kept.isOpen).toBe(true);
    await kept.close();
  });

  it('a modeless window closes on Escape only with closeOnEscape', async () => {
    const host = page();
    const escape = (f: MxForm) =>
      q(f.element, 'input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

    const plain = new CustomerForm();
    plain.show(host);
    await settle();
    escape(plain);
    await settle();
    expect(plain.isOpen).toBe(true);
    await plain.close();

    const closable = new CustomerForm({ closeOnEscape: true });
    closable.show(host);
    await settle();
    escape(closable);
    await settle();
    expect(closable.isDisposed).toBe(true);
  });

  it('showClose={false} removes the caption close button', async () => {
    const form = new CustomerForm({ showClose: false });
    page(form);
    await settle();
    expect(form.element.querySelector('[data-action="close"]')).toBeNull();
  });

  it('Enter clicks the defaultButton, Escape the cancelButton', async () => {
    const host = page();
    let ok!: Component<HTMLButtonElement>;
    let cancel!: Component<HTMLButtonElement>;
    class Confirm extends MxForm {
      override view() {
        return (
          <>
            <input name="q" />
            <button type="button" ref={(c: Component<HTMLButtonElement>) => (cancel = c)} data-result="no">
              No
            </button>
            <button type="button" ref={(c: Component<HTMLButtonElement>) => (ok = c)} data-result="yes">
              Yes
            </button>
          </>
        );
      }
    }
    const a = new Confirm({ defaultButton: () => ok, cancelButton: () => cancel });
    const ra = a.showDialog(host);
    await settle();
    q(a.element, 'input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(await ra).toBe('yes');

    const b = new Confirm({ defaultButton: () => ok, cancelButton: () => cancel });
    const rb = b.showDialog(host);
    await settle();
    q(b.element, 'input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(await rb).toBe('no');
  });

  it('in a modal window, Tab wraps around inside the form; a modeless one lets it out', async () => {
    const host = page();
    const tab = (el: HTMLElement, shiftKey = false) =>
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true }));

    const modal = new CustomerForm({ text: 'Tabs' });
    void modal.showDialog(host);
    await settle();
    const order = tabbableIn(modal.element);
    order[order.length - 1].focus();
    tab(order[order.length - 1]);
    expect(document.activeElement).toBe(order[0]);
    tab(order[0], true);
    expect(document.activeElement).toBe(order[order.length - 1]);
    await modal.close();

    const modeless = new CustomerForm({ text: 'Tabs' });
    modeless.show(host);
    await settle();
    const last = tabbableIn(modeless.element).at(-1)!;
    last.focus();
    const wrapped = !tab(last); // not prevented: the browser moves on to the page
    expect(wrapped).toBe(false);
    expect(document.activeElement).toBe(last);
    await modeless.close();
  });

  it('remembers its active control and gets focus back when its title is clicked', async () => {
    const host = page(<input name="outside" />);
    const form = new CustomerForm({ text: 'Back' });
    form.show(host);
    await settle();
    const save = q(form.element, '[data-result="ok"]');
    save.focus();
    q(host.element, '[name=outside]').focus();

    q(form.element, '.mx-form__title').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
    expect(document.activeElement).toBe(save);
    await form.close();
  });
});

describe('MxForm window boundary', () => {
  it('events bubble inside the window and stop at its root', async () => {
    let hostClicks = 0;
    const host = page();
    host.motif.on('click', () => hostClicks++);
    host.motif.on('keydown', () => hostClicks++);
    const form = new CustomerForm({ text: 'Contained' });
    const result = form.showDialog(host);
    await settle();
    // The form's own click handling (inside the window) still sees the click…
    q(form.element, '[data-result="ok"]').click();
    expect(await result).toBe('ok');
    // …but the host the window was added to never does.
    expect(hostClicks).toBe(0);
  });
});

describe('MxForm with x-model', () => {
  class Page extends Component<HTMLDivElement> {
    state = reactive({ open: false, closes: 0 });
    form!: CustomerForm;
    override view() {
      return (
        <div>
          <button type="button" class="opener" onclick={() => (this.state.open = true)}>
            Open
          </button>
          <CustomerForm
            text="Bound"
            modal
            ref={(f: CustomerForm) => (this.form = f)}
            x-model={() => this.state.open}
            onClosed={() => this.state.closes++}
          />
        </div>
      );
    }
  }

  it('opens with the state, writes false back when the user closes, and keeps its state', async () => {
    const p = new Page();
    page(p);
    await settle();
    const win = q<HTMLDialogElement>(p.element, 'dialog.mx-form-window');
    expect(win.hasAttribute('open')).toBe(false);
    expect(win.contains(p.form.element)).toBe(true);

    p.state.open = true;
    await settle();
    expect(win.hasAttribute('open')).toBe(true);
    expect(win.hasAttribute('data-test-modal')).toBe(true);
    q<HTMLInputElement>(p.form.element, 'input').value = 'kept';

    q(p.form.element, '[data-result="ok"]').click();
    await settle();
    expect(p.state.open).toBe(false); // two-way
    expect(win.hasAttribute('open')).toBe(false);
    expect(p.form.isDisposed).toBe(false);
    expect(p.form.result).toBe('ok');
    expect(p.state.closes).toBe(1);

    p.state.open = true;
    await settle();
    expect(win.hasAttribute('open')).toBe(true);
    expect(q<HTMLInputElement>(p.form.element, 'input').value).toBe('kept');

    p.state.open = false; // closing from code
    await settle();
    expect(win.hasAttribute('open')).toBe(false);
    expect(p.state.closes).toBe(2);
  });

  it('a cancelled close puts the state back to open', async () => {
    const p = new Page();
    page(p);
    await settle();
    p.form.props.onClosing = (e: FormClosingEventArgs) => void (e.cancel = true);
    p.state.open = true;
    await settle();
    p.state.open = false;
    await settle();
    expect(p.form.isOpen).toBe(true);
    expect(p.state.open).toBe(true);
  });

  it('dies with its parent', async () => {
    const p = new Page();
    const host = page(p);
    await settle();
    p.state.open = true;
    await settle();
    const form = p.form; // dispose clears the page's fields
    host.controls.remove(p);
    await settle();
    expect(form.isDisposed).toBe(true);
    expect(windowStack.size).toBe(0);
  });
});

describe('MxForm minimize', () => {
  it('collapses to the title bar without a target, docks into the target when given', async () => {
    const host = page();
    const taskbar = new Component<HTMLDivElement>('div');
    host.controls.add(taskbar);

    const inPlace = new CustomerForm({ text: 'In place', showMinimize: true }).show(host);
    await settle();
    q(inPlace.element, '[data-action="minimize"]').click();
    await settle();
    const win1 = inPlace.element.closest('dialog')!;
    expect(win1.getAttribute('data-window-state')).toBe('minimized');
    expect(win1.parentElement).toBe(host.element);
    expect(q(inPlace.element, '[data-action="restore"]').getAttribute('aria-label')).toBe('Restore');

    const docked = new CustomerForm({ text: 'Docked', showMinimize: true, minimizeTarget: taskbar }).show(host);
    await settle();
    q(docked.element, '[data-action="minimize"]').click();
    await settle();
    const win2 = docked.element.closest('dialog')!;
    expect(win2.parentElement).toBe(taskbar.element);
    expect(win2.hasAttribute('data-minimized-in')).toBe(true);
    expect(docked.isOpen).toBe(true);

    q(docked.element, '[data-action="restore"]').click();
    await settle();
    expect(win2.parentElement).toBe(host.element);
    expect(win2.hasAttribute('data-minimized-in')).toBe(false);
    await docked.close();
    await inPlace.close();
  });

  it('a modal form is never minimized: the page behind it stays blocked', async () => {
    const host = page();
    const taskbar = new Component<HTMLDivElement>('div');
    host.controls.add(taskbar);
    const form = new CustomerForm({ showMinimize: true, minimizeTarget: taskbar });
    void form.showDialog(host);
    await settle();
    const minimize = form.element.querySelector<HTMLElement>('[data-action="minimize"]');
    expect(!minimize || minimize.hidden || getComputedStyle(minimize).display === 'none').toBe(true);
    form.windowState = 'minimized';
    await settle();
    expect(form.windowState).toBe('normal');
    expect(form.element.closest('dialog')!.parentElement).toBe(host.element);
    await form.close();
  });
});
