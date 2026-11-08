import { Component, type Bind, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { controlOf } from '../../core/control-map';
import { deepActiveElement } from '../../core/focus';
import { addShortcut } from '../../core/keyboard';
import { isHtmlElement } from '../../core/node-kind';
import { uiLocale } from '../../core/ui-locale';
import { Toast } from './Toast';
import type { ToastPosition } from './toast-position';
import type { ToastProps } from './toast-props';
import type { ToasterProps } from './toaster-props';
import { onLanguage } from '../../core/on-language';

const OWN = ['position', 'max', 'hotkey', 'pauseOnHover'] as const;

/** The parts of a toaster. On one object made on first use: the base constructor already renders. */
interface Parts {
  stacks: Map<ToastPosition, HTMLDivElement>;
  polite: HTMLDivElement;
  assertive: HTMLDivElement;
  /** Each shown toast's line in a live area. */
  lines: Map<Toast, HTMLDivElement>;
  shown: Toast[];
  waiting: Toast[];
  hovered: boolean;
  focused: boolean;
  /** Where focus was before it came into the toasts. */
  returnFocus: HTMLElement | null;
  removeHotkey: (() => void) | null;
  placedItself: boolean;
  /** The page element it placed itself in, when it is in no component tree. */
  holder: HTMLElement | null;
  /** Made by `Toaster.default` itself, not by the app. */
  made: boolean;
}

const PARTS = Symbol('mx.toaster');

let defaultToaster: Toaster | null = null;

/** The longest of a list of CSS times (`0.2s, 83ms`), in milliseconds. */
function longest(list: string): number {
  return Math.max(0, ...(list || '0s').split(',').map((v) => parseFloat(v) * (v.trim().endsWith('ms') ? 1 : 1000) || 0));
}

function transitionTime(el: Element): number {
  const style = getComputedStyle(el);
  return longest(style.transitionDuration) + longest(style.transitionDelay);
}

/**
 * The region that shows toasts: a landmark named "Notifications" (`uiLocale`) holding a stack at
 * each edge position in use, with the newest nearest the edge and at most `max` per position (the rest wait
 * their turn). Screen readers announce info and success toasts politely, and caution and danger toasts immediately.
 * Toasts never take focus. Tab reaches them where the toaster sits on the page (the default one is the
 * last element in `document.body`), and `hotkey` (F8) moves to the newest toast and back.
 *
 * `toast.show()` uses `Toaster.default`: one created on first use, or the one you assign.
 *
 * @example
 * <Toaster position="top" max={2} ref={(t) => (Toaster.default = t)} />
 *
 * const uploads = new Toaster({ position: 'bottom-start', text: 'Uploads' });
 * uploads.success('photo.jpg is uploaded.');
 */
export class Toaster extends Control<HTMLElement, ToasterProps> {
  /** The toaster used by `toast.show()`, created in `document.body` on first use unless you set one. */
  static get default(): Toaster {
    if (defaultToaster?.isDisposed) defaultToaster = null;
    if (!defaultToaster) {
      defaultToaster = new Toaster();
      defaultToaster.parts.made = true;
    }
    return defaultToaster;
  }
  static set default(value: Toaster) {
    const old = defaultToaster;
    defaultToaster = value;
    if (old && old !== value && old.parts.made && !old.parts.shown.length && !old.parts.waiting.length) void old.dispose();
  }

  constructor(props?: IBaseProp<ToasterProps>) {
    super('section', props);
    const own = (this.props ?? {}) as ToasterProps;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    const el = this.element;
    const parts = this.parts;
    const drawName = () => el.setAttribute('aria-label', this.text || uiLocale.strings.notifications);
    const stopName = onLanguage(this, drawName);
    this.observeProperty('text', drawName);
    this.observeProperty('hotkey', () => this.renderHotkey());
    this.observeProperty('max', () => this.fill());
    this.observeProperty('pauseOnHover', () => this.updatePause());

    el.addEventListener('pointerenter', () => {
      parts.hovered = true;
      this.updatePause();
    });
    el.addEventListener('pointerleave', () => {
      parts.hovered = false;
      this.updatePause();
    });
    el.addEventListener('focusin', (e) => {
      const from = e.relatedTarget as HTMLElement | null;
      if (from && !el.contains(from)) parts.returnFocus = from;
      parts.focused = true;
      this.updatePause();
    });
    el.addEventListener('focusout', (e) => {
      if (el.contains(e.relatedTarget as Node | null)) return;
      parts.focused = false;
      this.updatePause();
    });
    el.addEventListener('keydown', (e) => this.keyDown(e));
    const onVisibility = () => this.updatePause();
    document.addEventListener('visibilitychange', onVisibility);
    this.motif.setDisposable(() => {
      stopName();
      document.removeEventListener('visibilitychange', onVisibility);
      parts.removeHotkey?.();
      for (const t of parts.waiting.splice(0)) void t.dispose();
      parts.shown.length = 0;
      if (parts.placedItself) {
        el.remove();
        parts.holder?.remove();
      }
      if (defaultToaster === this) defaultToaster = null;
    });
  }

  // Properties (see ToasterProps).

  get position(): ToastPosition {
    return this.getProperty<ToastPosition | undefined>('position') ?? 'bottom-end';
  }
  set position(value: Bind<ToastPosition>) {
    this.assignProperty('position', value);
  }
  get max(): number {
    return this.getProperty<number | undefined>('max') ?? 3;
  }
  set max(value: Bind<number>) {
    this.assignProperty('max', value, Number);
  }
  get hotkey(): string {
    return this.getProperty<string | undefined>('hotkey') ?? 'F8';
  }
  set hotkey(value: Bind<string>) {
    this.assignProperty('hotkey', value);
  }
  get pauseOnHover(): boolean {
    return this.getProperty<boolean | undefined>('pauseOnHover') ?? true;
  }
  set pauseOnHover(value: Bind<boolean>) {
    this.assignProperty('pauseOnHover', value, Boolean);
  }

  /** The toasts on screen, followed by the waiting ones. */
  get toasts(): readonly Toast[] {
    return [...this.parts.shown, ...this.parts.waiting];
  }

  /** Indicates whether the timers are currently paused: the pointer or focus is on the toasts, or the page is hidden. */
  get paused(): boolean {
    const parts = this.parts;
    const hover = parts.hovered && (this.peekProperty<boolean>('pauseOnHover') ?? true);
    return hover || parts.focused || (typeof document !== 'undefined' && document.visibilityState === 'hidden');
  }

  // Showing.

  /** Shows a toast, or queues it when `max` are showing at its position, and returns it. */
  show(options: ToastProps | Toast): Toast {
    const t = options instanceof Toast ? options : new Toast(options);
    if (t.isClosed || t.toaster) return t;
    t.join(this);
    this.placeInPage();
    if (this.countAt(this.positionOf(t)) < this.max) this.present(t);
    else this.parts.waiting.push(t);
    return t;
  }

  info(text: Bind<string>, options: ToastProps = {}): Toast {
    return this.show({ ...options, text, tone: 'info' });
  }

  success(text: Bind<string>, options: ToastProps = {}): Toast {
    return this.show({ ...options, text, tone: 'success' });
  }

  caution(text: Bind<string>, options: ToastProps = {}): Toast {
    return this.show({ ...options, text, tone: 'caution' });
  }

  danger(text: Bind<string>, options: ToastProps = {}): Toast {
    return this.show({ ...options, text, tone: 'danger' });
  }

  /** Closes every toast, including the waiting ones. */
  closeAll(): void {
    const parts = this.parts;
    for (const t of parts.waiting.splice(0)) t.close('code');
    for (const t of [...parts.shown]) t.close('code');
  }

  /** Moves focus to the newest toast. Returns `false` if there is none. */
  focusNewest(): boolean {
    const newest = this.parts.shown.at(-1);
    if (!newest) return false;
    newest.element.focus();
    return true;
  }

  /** @internal Whether `toast` is on the screen here. */
  isShowing(toast: Toast): boolean {
    return this.parts.shown.includes(toast);
  }

  /** @internal Reads `toast` out in the live area of its tone. */
  announce(toast: Toast): void {
    const parts = this.parts;
    parts.lines.get(toast)?.remove();
    const text = toast.announcement;
    if (!text) return;
    const line = document.createElement('div');
    parts.lines.set(toast, line);
    const live = toast.tone === 'danger' || toast.tone === 'caution' ? parts.assertive : parts.polite;
    // A moment later, so the live area exists before what it reads changes.
    setTimeout(() => {
      if (parts.lines.get(toast) !== line) return;
      line.textContent = text;
      live.append(line);
    }, 50);
  }

  /** @internal Takes away a toast that closed. */
  release(toast: Toast): void {
    const parts = this.parts;
    const waiting = parts.waiting.indexOf(toast);
    if (waiting >= 0) {
      parts.waiting.splice(waiting, 1);
      void toast.dispose();
      return;
    }
    const at = parts.shown.indexOf(toast);
    if (at < 0) return;
    parts.shown.splice(at, 1);
    parts.lines.get(toast)?.remove();
    parts.lines.delete(toast);
    const el = toast.element;
    if (el.contains(deepActiveElement())) {
      const next = [el.nextElementSibling, el.previousElementSibling].find((n) => isHtmlElement(n) && n.dataset.state !== 'leaving');
      const target = (next as HTMLElement | undefined) ?? (parts.returnFocus?.isConnected ? parts.returnFocus : null);
      target?.focus();
    }
    el.dataset.state = 'leaving';
    const position = this.positionOf(toast);
    const done = () => {
      this.controls.remove(toast);
      this.fill(position);
    };
    const time = transitionTime(el);
    if (time > 0) setTimeout(done, time);
    else done();
  }

  // Parts.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    const el = this.element;
    el.classList.add('mx-toaster');
    el.setAttribute('role', 'region');
    const polite = document.createElement('div');
    polite.className = 'mx-sr-only';
    polite.setAttribute('role', 'status');
    const assertive = document.createElement('div');
    assertive.className = 'mx-sr-only';
    assertive.setAttribute('role', 'alert');
    el.append(polite, assertive);
    return {
      stacks: new Map(),
      polite,
      assertive,
      lines: new Map(),
      shown: [],
      waiting: [],
      hovered: false,
      focused: false,
      returnFocus: null,
      removeHotkey: null,
      placedItself: false,
      holder: null,
      made: false,
    };
  }

  private placeInPage(): void {
    if (this.element.isConnected) return;
    // In no component tree: under a root of its own in the page, so what its toasts show mounts.
    const holder = document.body.appendChild(document.createElement('div'));
    const root = new Component<HTMLDivElement>(holder);
    root.build();
    root.controls.add(this);
    this.parts.holder = holder;
    this.parts.placedItself = true;
  }

  private positionOf(toast: Toast): ToastPosition {
    return toast.position ?? this.position;
  }

  private countAt(position: ToastPosition): number {
    return this.parts.shown.filter((t) => this.positionOf(t) === position).length;
  }

  private stack(position: ToastPosition): HTMLDivElement {
    const parts = this.parts;
    let stack = parts.stacks.get(position);
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'mx-toaster__stack';
      stack.dataset.position = position;
      this.element.append(stack);
      parts.stacks.set(position, stack);
    }
    return stack;
  }

  private present(toast: Toast): void {
    const position = this.positionOf(toast);
    const stack = this.stack(position);
    this.parts.shown.push(toast);
    this.controls.add(toast);
    const el = toast.element;
    // Newest nearest the edge: first at the top, last at the bottom.
    if (position.startsWith('top')) stack.prepend(el);
    else stack.append(el);
    el.dataset.state = 'entering';
    // The entering style must be in effect before it changes, for the transition to run.
    void getComputedStyle(el).opacity;
    el.dataset.state = 'shown';
    this.announce(toast);
    toast.restart();
  }

  /** Shows waiting toasts while there is room. */
  private fill(position?: ToastPosition): void {
    const parts = this.parts;
    const max = this.peekProperty<number>('max') ?? 3;
    for (const t of [...parts.waiting]) {
      const at = this.positionOf(t);
      if (position && at !== position) continue;
      if (this.countAt(at) >= max) continue;
      parts.waiting.splice(parts.waiting.indexOf(t), 1);
      this.present(t);
    }
  }

  private updatePause(): void {
    const paused = this.paused;
    for (const t of this.parts.shown) {
      if (paused) t.pause();
      else t.resume();
    }
  }

  private renderHotkey(): void {
    const parts = this.parts;
    const hotkey = this.peekProperty<string>('hotkey') ?? 'F8';
    parts.removeHotkey?.();
    parts.removeHotkey = null;
    if (!hotkey) {
      this.element.removeAttribute('aria-keyshortcuts');
      return;
    }
    this.element.setAttribute('aria-keyshortcuts', hotkey);
    parts.removeHotkey = addShortcut(hotkey, () => this.hotkeyPressed(), {
      inEditable: true,
      name: 'toaster.focus',
      text: () => uiLocale.strings.toasterFocusKey,
      category: () => uiLocale.strings.shortcutsNotifications,
    });
  }

  private hotkeyPressed(): boolean {
    const parts = this.parts;
    if (this.element.contains(deepActiveElement())) {
      if (!parts.returnFocus?.isConnected) return false;
      parts.returnFocus.focus();
      return true;
    }
    return this.focusNewest();
  }

  private keyDown(e: KeyboardEvent): void {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const el = (e.target as Element).closest('.mx-toast');
    const toast = el && controlOf(el);
    if (!(toast instanceof Toast) || toast.toaster !== this) return;
    e.preventDefault();
    e.stopPropagation();
    toast.close('escape');
  }
}
