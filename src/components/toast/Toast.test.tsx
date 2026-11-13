import { Component, errorHandler, reactive } from '@motifx/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { shortcuts } from '../../core/shortcut-registry';
import { uiLocale } from '../../core/ui-locale';
import { toast } from './show-toast';
import { Toast } from './Toast';
import { Toaster } from './Toaster';

let hosts: Component[] = [];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance', 'Date'] });
});

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  await Toaster.default.dispose();
  vi.useRealTimers();
  document.body.innerHTML = '';
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

function key(name: string, target: Element = document.activeElement ?? document.body) {
  const e = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
  target.dispatchEvent(e);
  return e;
}

const region = () => document.querySelector<HTMLElement>('.mx-toaster')!;
const stack = (position: string) => document.querySelector<HTMLElement>(`.mx-toaster__stack[data-position="${position}"]`);
const texts = (position: string) => Array.from(stack(position)?.querySelectorAll('.mx-toast__text') ?? []).map((el) => el.textContent);
const closeButton = (t: Toast) => t.element.querySelector<HTMLButtonElement>('.mx-toast__close');

describe('Toast', () => {
  it('toast.show puts a toast in a region made on first use, and it closes after its time', async () => {
    expect(document.querySelector('.mx-toaster')).toBeNull();
    const t = toast.show({ title: 'Saved', text: 'All changes are saved.' });
    const reason = vi.fn();
    void t.closed.then(reason);
    // In the page, a child of the component standing for the body (the app's layer while an app runs).
    expect(region().parentElement).toBe(document.body);
    expect(region().tagName).toBe('SECTION');
    expect(region().getAttribute('role')).toBe('region');
    expect(region().getAttribute('aria-label')).toBe('Notifications');
    expect(region().getAttribute('aria-keyshortcuts')).toBe('F8');
    expect(texts('bottom-end')).toEqual(['All changes are saved.']);
    expect(t.element.dataset.tone).toBe('info');
    // It enters, and shows once its entering style is in effect (the next measuring round; timers are fake here).
    expect(t.element.dataset.state).toBe('entering');
    measureNow(t);
    expect(t.element.dataset.state).toBe('shown');
    expect(t.element.getAttribute('role')).toBe('group');
    expect(t.element.tabIndex).toBe(0);
    expect(t.element.querySelector('.mx-toast__title')!.textContent).toBe('Saved');
    expect(t.element.getAttribute('aria-labelledby')!.split(' ')).toHaveLength(2);
    expect(t.element.querySelector('.mx-toast__icon .mx-glyph')).not.toBeNull();
    expect(closeButton(t)!.getAttribute('aria-label')).toBe('Close');
    expect(document.activeElement).toBe(document.body);

    vi.advanceTimersByTime(4999);
    expect(t.isClosed).toBe(false);
    vi.advanceTimersByTime(1);
    expect(t.isClosed).toBe(true);
    // It leaves once its transition time is read, in the next measuring round.
    measureNow(Toaster.default);
    await settle();
    expect(reason).toHaveBeenCalledWith('timeout');
    expect(texts('bottom-end')).toEqual([]);
  });

  it('reads info and success out politely, caution and danger at once', () => {
    const done = toast.success('Done.');
    toast.danger('Failed.');
    toast.info('News.');
    toast.caution('Careful.');
    vi.advanceTimersByTime(50);
    const status = region().querySelector('[role="status"]')!;
    const alert = region().querySelector('[role="alert"]')!;
    expect(status.textContent).toBe('Done.News.');
    expect(alert.textContent).toBe('Failed.');
    expect(status.className).toBe('mx-sr-only');
    const tones = Array.from(document.querySelectorAll<HTMLElement>('.mx-toast')).map((el) => el.dataset.tone);
    expect(tones).toEqual(['success', 'danger', 'info']);
    // The fourth waits, and is read when it shows; a closed one leaves the live area.
    done.close();
    // It leaves once its transition time is read, in the next measuring round.
    measureNow(Toaster.default);
    vi.advanceTimersByTime(50);
    expect(status.textContent).toBe('News.');
    expect(alert.textContent).toBe('Failed.Careful.');
  });

  it('an action runs, then closes the toast; the close button closes it too', async () => {
    const click = vi.fn();
    const t = toast.info('Message archived.', { action: { text: 'Undo', click } });
    const action = t.element.querySelector<HTMLButtonElement>('.mx-toast__action')!;
    expect(action.textContent).toBe('Undo');
    expect(action.nextElementSibling).toBe(closeButton(t));
    action.click();
    expect(click).toHaveBeenCalledWith(t);
    expect(await t.closed).toBe('action');

    const u = toast.info('Another.');
    closeButton(u)!.click();
    expect(await u.closed).toBe('button');
  });

  it('duration 0 keeps it; update changes it and starts the time again', () => {
    const t = toast.show({ text: 'Uploading…', duration: 0 });
    vi.advanceTimersByTime(60_000);
    expect(t.isClosed).toBe(false);
    t.update({ text: 'Uploaded.', tone: 'success', duration: 2000 });
    expect(t.element.querySelector('.mx-toast__text')!.textContent).toBe('Uploaded.');
    expect(t.element.dataset.tone).toBe('success');
    vi.advanceTimersByTime(50);
    expect(region().querySelector('[role="status"]')!.textContent).toBe('Uploaded.');
    vi.advanceTimersByTime(1950);
    expect(t.isClosed).toBe(true);
  });

  it('stacks newest nearest the edge, at its own position', () => {
    toast.info('One', { position: 'top' });
    toast.info('Two', { position: 'top' });
    toast.info('Three');
    toast.info('Four');
    expect(texts('top')).toEqual(['Two', 'One']);
    expect(texts('bottom-end')).toEqual(['Three', 'Four']);
  });

  it('shows at most max at a position; the rest wait their turn', async () => {
    const s = reactive({ max: 2 });
    let toaster!: Toaster;
    page(<Toaster ref={(t: Toaster) => (toaster = t)} max={() => s.max} position="top-start" text="Uploads" />);
    await settle();
    expect(region().getAttribute('aria-label')).toBe('Uploads');
    const all = ['a', 'b', 'c', 'd'].map((text) => toaster.show({ text }));
    expect(texts('top-start')).toEqual(['b', 'a']);
    expect(toaster.toasts).toHaveLength(4);
    all[0].close();
    // It leaves once its transition time is read, in the next measuring round.
    measureNow(toaster);
    expect(texts('top-start')).toEqual(['c', 'b']);
    s.max = 3;
    await settle();
    expect(texts('top-start')).toEqual(['d', 'c', 'b']);
    toaster.closeAll();
    measureNow(toaster);
    expect(texts('top-start')).toEqual([]);
    expect(toaster.toasts).toHaveLength(0);
  });

  it('timers stop while the pointer or focus is on the toasts, or the page is hidden', () => {
    const t = toast.show({ text: 'Hold', duration: 1000 });
    vi.advanceTimersByTime(400);
    region().dispatchEvent(new PointerEvent('pointerenter'));
    vi.advanceTimersByTime(5000);
    expect(t.isClosed).toBe(false);
    region().dispatchEvent(new PointerEvent('pointerleave'));
    vi.advanceTimersByTime(599);
    expect(t.isClosed).toBe(false);

    t.element.focus();
    vi.advanceTimersByTime(5000);
    expect(t.isClosed).toBe(false);
    (document.activeElement as HTMLElement).blur();

    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(5000);
    expect(t.isClosed).toBe(false);
    visibility.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(1);
    expect(t.isClosed).toBe(true);
    visibility.mockRestore();
  });

  it('pauseOnHover can be turned off', () => {
    Toaster.default.pauseOnHover = false;
    const t = toast.show({ text: 'Go', duration: 1000 });
    region().dispatchEvent(new PointerEvent('pointerenter'));
    vi.advanceTimersByTime(1000);
    expect(t.isClosed).toBe(true);
  });

  it('Escape closes the focused toast; focus goes to the next one, then back where it came from', async () => {
    const host = page(new Component<HTMLButtonElement>('button'));
    const origin = host.element.firstElementChild as HTMLButtonElement;
    origin.focus();
    const a = toast.info('A', { duration: 0 });
    const b = toast.info('B', { duration: 0 });
    expect(document.activeElement).toBe(origin);
    key('F8', origin);
    expect(document.activeElement).toBe(b.element);
    expect(key('Escape').defaultPrevented).toBe(true);
    expect(await b.closed).toBe('escape');
    expect(document.activeElement).toBe(a.element);
    closeButton(a)!.focus();
    key('Escape');
    expect(a.isClosed).toBe(true);
    expect(document.activeElement).toBe(origin);
  });

  it('F8 goes to the newest toast and back; the hotkey can change or go', async () => {
    const host = page(new Component<HTMLButtonElement>('button'));
    const origin = host.element.firstElementChild as HTMLButtonElement;
    origin.focus();
    const t = toast.info('Hi', { duration: 0 });
    key('F8', origin);
    expect(document.activeElement).toBe(t.element);
    key('F8');
    expect(document.activeElement).toBe(origin);
    Toaster.default.hotkey = '';
    expect(region().hasAttribute('aria-keyshortcuts')).toBe(false);
    key('F8', origin);
    expect(document.activeElement).toBe(origin);
  });

  it('two toasters on a page share one F8, which goes to the newest toast of either', async () => {
    const heard = vi.spyOn(errorHandler, 'reportSuppressed');
    const host = page(new Component<HTMLButtonElement>('button'));
    const origin = host.element.firstElementChild as HTMLButtonElement;
    const own = new Toaster({ position: 'top-start' });
    page(own);
    const focusKeys = () => shortcuts.list().filter((s) => s.name === 'toaster.focus');
    origin.focus();
    const a = toast.info('Default', { duration: 0 });
    const b = own.info('Own', { duration: 0 });
    expect(focusKeys().length).toBe(1);
    expect(heard.mock.calls.filter(([source]) => source === 'Shortcuts')).toEqual([]);
    key('F8', origin);
    expect(document.activeElement).toBe(b.element);
    key('F8');
    expect(document.activeElement).toBe(origin);
    // Another key for one toaster takes its own registration back first.
    own.hotkey = 'F9';
    expect(focusKeys().map((s) => s.keys)).toEqual([['F8'], ['F9']]);
    key('F8', origin);
    expect(document.activeElement).toBe(a.element);
    key('F8');
    own.hotkey = 'F8';
    expect(focusKeys().length).toBe(1);
    // The key stays with the toaster left.
    await own.dispose();
    expect(focusKeys().length).toBe(1);
    origin.focus();
    key('F8', origin);
    expect(document.activeElement).toBe(a.element);
  });

  it('follows getter props, in JSX and programmatically', async () => {
    const s = reactive({ percent: 10, title: 'Upload' });
    const t = new Toast({ text: () => `${s.percent}%`, title: () => s.title, duration: 0 });
    toast.show(t);
    s.percent = 55;
    s.title = 'Uploading';
    await settle();
    expect(t.element.querySelector('.mx-toast__text')!.textContent).toBe('55%');
    expect(t.element.querySelector('.mx-toast__title')!.textContent).toBe('Uploading');
    t.tone = 'caution';
    t.closeButton = false;
    t.icon = null;
    expect(t.element.dataset.tone).toBe('caution');
    expect(closeButton(t)).toBeNull();
    expect(t.element.querySelector<HTMLElement>('.mx-toast__icon')!.hidden).toBe(true);
    t.action = { text: () => (s.percent > 50 ? 'Cancel' : 'Stop') };
    expect(t.element.querySelector('.mx-toast__action')!.textContent).toBe('Cancel');
    t.action = null;
    expect(t.element.querySelector('.mx-toast__action')).toBeNull();
  });

  it('names its parts from uiLocale', async () => {
    const t = toast.info('Merhaba', { duration: 0 });
    await uiLocale.use('tr');
    await settle();
    expect(region().getAttribute('aria-label')).toBe('Bildirimler');
    expect(closeButton(t)!.getAttribute('aria-label')).toBe('Kapat');
  });

  it('a toaster is named by its text, else from uiLocale, and reads both over plain data again on reState', async () => {
    const plain = { name: 'Uploads', max: 1 };
    let toaster!: Toaster;
    const host = page(<Toaster ref={(t: Toaster) => (toaster = t)} position="top-start" text={() => plain.name} max={() => plain.max} />);
    await settle();
    expect(toaster.element.getAttribute('aria-label')).toBe('Uploads');
    plain.name = '';
    await settle();
    expect(toaster.element.getAttribute('aria-label')).toBe('Uploads');
    host.reState();
    expect(toaster.element.getAttribute('aria-label')).toBe('Notifications');
    await uiLocale.use('tr');
    await settle();
    expect(toaster.element.getAttribute('aria-label')).toBe('Bildirimler');
    plain.max = 3;
    host.reState();
    expect(toaster.max).toBe(3);
  });

  it('a toast reads functions over plain data again on reState', async () => {
    const plain = { text: '10%', title: 'Upload' };
    const t = new Toast({ text: () => plain.text, title: () => plain.title, duration: 0 });
    toast.show(t);
    Object.assign(plain, { text: '55%', title: 'Uploading' });
    await settle();
    expect(t.element.querySelector('.mx-toast__text')!.textContent).toBe('10%');
    Toaster.default.reState();
    expect(t.element.querySelector('.mx-toast__text')!.textContent).toBe('55%');
    expect(t.element.querySelector('.mx-toast__title')!.textContent).toBe('Uploading');
  });

  it('Toaster.default can be your own; the one made before goes when it is empty', async () => {
    toast.info('first').close();
    const made = Toaster.default;
    const own = new Toaster({ position: 'bottom', text: 'App' });
    Toaster.default = own;
    await settle();
    expect(made.isDisposed).toBe(true);
    toast.success('Hello');
    expect(texts('bottom')).toEqual(['Hello']);
    expect(document.querySelectorAll('.mx-toaster')).toHaveLength(1);
    await own.dispose();
  });

  it('onClosed fires once with the reason; a closed toast is disposed', async () => {
    const closed = vi.fn();
    const t = toast.show({ text: 'Bye', onClosed: closed });
    t.close();
    t.close();
    // It leaves once its transition time is read, in the next measuring round.
    measureNow(Toaster.default);
    await settle();
    expect(closed).toHaveBeenCalledTimes(1);
    expect(closed).toHaveBeenCalledWith('code');
    expect(t.isDisposed).toBe(true);
  });
  it('in no component tree, places itself in the page as a child of the component of the body, and goes when disposed', async () => {
    const toaster = new Toaster();
    toaster.show({ title: 'Saved', duration: 0 });
    expect(toaster.element.parentElement).toBe(document.body);
    expect(toaster.parent?.element).toBe(document.body);
    const el = toaster.element;
    expect(el.isConnected).toBe(true);
    await toaster.dispose();
    expect(el.isConnected).toBe(false);
  });
});
