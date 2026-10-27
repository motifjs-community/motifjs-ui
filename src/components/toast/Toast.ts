import { effect, Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { cautionMark, dangerMark, dismissMark, infoMark, successMark } from '../../core/glyphs';
import { iconNode } from '../../core/icon-node';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import type { ToastAction } from './toast-action';
import type { ToastCloseReason } from './toast-close-reason';
import type { ToastPosition } from './toast-position';
import type { ToastProps } from './toast-props';
import type { ToastTone } from './toast-tone';
import type { Toaster } from './Toaster';

const OWN = ['title', 'tone', 'icon', 'duration', 'action', 'closeButton', 'position'] as const;

const GLYPHS: Record<ToastTone, () => HTMLSpanElement> = {
  info: infoMark,
  success: successMark,
  caution: cautionMark,
  danger: dangerMark,
};

/** The parts of a toast. On one object made on first use: the base constructor already renders. */
interface Parts {
  icon: HTMLSpanElement;
  releaseIcon: () => void;
  body: HTMLDivElement;
  title: HTMLDivElement | null;
  message: HTMLDivElement;
  action: Button | null;
  close: Button | null;
  toaster: Toaster | null;
  closing: boolean;
  timer: ReturnType<typeof setTimeout> | undefined;
  /** Milliseconds left while the timer is stopped. */
  remaining: number;
  startedAt: number;
  closedEmitter: Emitter<ToastCloseReason>;
  closed: Promise<ToastCloseReason>;
  resolve: (reason: ToastCloseReason) => void;
}

const PARTS = Symbol('mx.toast');

/**
 * A short notification: a tone glyph, a title and a text, an optional action button and a
 * close button. It closes by itself after `duration` (the timer stops while the pointer or
 * focus is on it, or the page is hidden). Usually made with `toast.show()`, which returns it;
 * a closed toast is disposed.
 *
 * @example
 * const t = toast.show({ text: 'Uploading…', duration: 0 });
 * t.update({ text: 'Uploaded.', tone: 'success', duration: 4000 });
 * toast.info('Message archived.', { action: { text: 'Undo', click: () => this.unarchive() } });
 */
export class Toast extends Control<HTMLDivElement, ToastProps> {
  constructor(props?: IBaseProp<ToastProps>) {
    super(props);
    const own = (this.props ?? {}) as ToastProps;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    const parts = this.parts;
    this.observeProperty<string>('text', (text) => (parts.message.textContent = text ?? ''));
    this.observeProperty<string>('title', (title) => this.renderTitle(title));
    this.observeProperty('tone', () => this.renderTone());
    this.observeProperty('icon', () => this.renderTone());
    this.observeProperty('action', () => this.renderAction());
    this.observeProperty('closeButton', () => this.renderClose());
    this.observeProperty('duration', () => parts.toaster && !parts.closing && this.restart());
    if (own.onClosed) this.onClosed(own.onClosed);
    this.motif.setDisposable(() => {
      clearTimeout(this.parts.timer);
      this.parts.releaseIcon();
      this.parts.resolve('code');
      this.parts.closedEmitter.dispose();
    });
  }

  // Properties (see ToastProps).

  get title(): string {
    return this.getProperty<string | undefined>('title') ?? '';
  }
  set title(value: Bind<string>) {
    this.assignProperty('title', value);
  }
  get tone(): ToastTone {
    return this.getProperty<ToastTone | undefined>('tone') ?? 'info';
  }
  set tone(value: Bind<ToastTone>) {
    this.assignProperty('tone', value);
  }
  get icon(): IconSource | null | undefined {
    return this.getProperty<IconSource | null | undefined>('icon');
  }
  set icon(value: Bind<IconSource | null | undefined>) {
    this.assignProperty('icon', value);
  }
  get duration(): number {
    return this.getProperty<number | undefined>('duration') ?? 5000;
  }
  set duration(value: Bind<number>) {
    this.assignProperty('duration', value, Number);
  }
  get action(): ToastAction | null {
    return this.getProperty<ToastAction | null | undefined>('action') ?? null;
  }
  set action(value: Bind<ToastAction | null>) {
    this.assignProperty('action', value);
  }
  get closeButton(): boolean {
    return this.getProperty<boolean | undefined>('closeButton') ?? true;
  }
  set closeButton(value: Bind<boolean>) {
    this.assignProperty('closeButton', value, Boolean);
  }
  get position(): ToastPosition | undefined {
    return this.getProperty<ToastPosition | undefined>('position');
  }
  set position(value: Bind<ToastPosition | undefined>) {
    this.assignProperty('position', value);
  }

  /** The toaster showing it, or holding it until there is room. */
  get toaster(): Toaster | null {
    return this.parts.toaster;
  }

  /** Settles with the reason when it closes. */
  get closed(): Promise<ToastCloseReason> {
    return this.parts.closed;
  }

  get onClosed(): MotifEvent<ToastCloseReason> {
    return this.parts.closedEmitter.event;
  }

  get isClosed(): boolean {
    return this.parts.closing;
  }

  close(reason: ToastCloseReason = 'code'): void {
    const parts = this.parts;
    if (parts.closing) return;
    parts.closing = true;
    clearTimeout(parts.timer);
    parts.timer = undefined;
    parts.resolve(reason);
    parts.closedEmitter.fire(reason);
    if (parts.toaster) parts.toaster.release(this);
    else void this.dispose();
  }

  /** Changes what it shows (any of the props) and starts its time again; it is read out again. */
  update(options: ToastProps): void {
    const self = this as unknown as Record<string, unknown>;
    for (const name of ['text', ...OWN] as const) if (name in options) self[name] = options[name];
    const parts = this.parts;
    if (parts.toaster && !parts.closing) {
      this.restart();
      parts.toaster.announce(this);
    }
  }

  /** @internal Its toaster took it. */
  join(toaster: Toaster): void {
    this.parts.toaster = toaster;
  }

  /** @internal Starts its time from the beginning. */
  restart(): void {
    const parts = this.parts;
    clearTimeout(parts.timer);
    parts.timer = undefined;
    parts.remaining = this.peekProperty<number>('duration') ?? 5000;
    if (!parts.toaster?.paused) this.resume();
  }

  /** @internal */
  pause(): void {
    const parts = this.parts;
    if (parts.timer === undefined) return;
    clearTimeout(parts.timer);
    parts.timer = undefined;
    parts.remaining -= performance.now() - parts.startedAt;
  }

  /** @internal */
  resume(): void {
    const parts = this.parts;
    if (parts.timer !== undefined || parts.closing || parts.remaining <= 0 || !parts.toaster?.isShowing(this)) return;
    parts.startedAt = performance.now();
    parts.timer = setTimeout(() => this.close('timeout'), parts.remaining);
  }

  /** The words a screen reader says when it appears. */
  get announcement(): string {
    const title = this.peekProperty<string>('title') ?? '';
    const text = this.peekProperty<string>('text') ?? '';
    return title && text ? `${title}. ${text}` : title || text;
  }

  // Parts.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    const el = this.element;
    el.classList.add('mx-toast');
    el.setAttribute('role', 'group');
    el.tabIndex = 0;
    const icon = document.createElement('span');
    icon.className = 'mx-toast__icon';
    icon.setAttribute('aria-hidden', 'true');
    const body = document.createElement('div');
    body.className = 'mx-toast__body';
    const message = document.createElement('div');
    message.className = 'mx-toast__text';
    message.id = nextId('toast-text');
    body.append(message);
    el.append(icon, body);
    el.setAttribute('aria-labelledby', message.id);
    let resolve!: (reason: ToastCloseReason) => void;
    const closed = new Promise<ToastCloseReason>((r) => (resolve = r));
    return {
      icon,
      releaseIcon: () => {},
      body,
      title: null,
      message,
      action: null,
      close: null,
      toaster: null,
      closing: false,
      timer: undefined,
      remaining: 0,
      startedAt: 0,
      closedEmitter: new Emitter(),
      closed,
      resolve,
    };
  }

  private renderTitle(title: string | undefined): void {
    const parts = this.parts;
    if (!parts.title) {
      if (!title) return;
      parts.title = document.createElement('div');
      parts.title.className = 'mx-toast__title';
      parts.title.id = nextId('toast-title');
      parts.body.prepend(parts.title);
    }
    parts.title.textContent = title ?? '';
    parts.title.hidden = !title;
    this.element.setAttribute('aria-labelledby', title ? `${parts.title.id} ${parts.message.id}` : parts.message.id);
  }

  private renderTone(): void {
    const parts = this.parts;
    const tone = this.peekProperty<ToastTone>('tone') ?? 'info';
    this.element.dataset.tone = tone;
    const icon = this.peekProperty<IconSource | null | undefined>('icon');
    parts.releaseIcon();
    parts.releaseIcon = () => {};
    parts.icon.hidden = icon === null;
    if (icon === null) {
      parts.icon.replaceChildren();
      return;
    }
    if (icon === undefined) {
      parts.icon.replaceChildren(GLYPHS[tone]?.() ?? infoMark());
      return;
    }
    const shown = iconNode(icon);
    parts.icon.replaceChildren(shown.node);
    parts.releaseIcon = shown.release;
  }

  private renderAction(): void {
    const parts = this.parts;
    const action = this.peekProperty<ToastAction | null>('action') ?? null;
    if (!action) {
      if (parts.action) this.controls.remove(parts.action);
      parts.action = null;
      return;
    }
    if (!parts.action) {
      const button = new Button({ variant: 'outline', size: 'sm' });
      button.element.classList.add('mx-toast__action');
      button.element.addEventListener('click', () => this.runAction());
      this.controls.add(button);
      parts.action = button;
      // Before the close button.
      if (parts.close) this.element.insertBefore(button.element, parts.close.element);
    }
    parts.action.text = action.text;
  }

  private runAction(): void {
    const action = this.peekProperty<ToastAction | null>('action');
    action?.click?.(this);
    this.close('action');
  }

  private renderClose(): void {
    const parts = this.parts;
    const wanted = this.peekProperty<boolean>('closeButton') ?? true;
    if (!wanted) {
      if (parts.close) this.controls.remove(parts.close);
      parts.close = null;
      return;
    }
    if (parts.close) return;
    const button = new Button({ variant: 'ghost', size: 'sm', icon: dismissMark() });
    button.element.classList.add('mx-toast__close');
    const stop = effect(() => button.element.setAttribute('aria-label', uiLocale.strings.close));
    button.motif.setDisposable(stop);
    button.element.addEventListener('click', () => this.close('button'));
    this.controls.add(button);
    parts.close = button;
  }
}
