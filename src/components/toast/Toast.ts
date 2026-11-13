import { Emitter, type Bind, type Component, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { clearParts, glyphPart, part, partBefore } from '../../core/draw-parts';
import { glyph } from '../../core/glyphs';
import { showIcon } from '../../core/show-icon';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { mark, put, text as writeText } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import { Button } from '../button/Button';
import type { ToastAction } from './toast-action';
import type { ToastCloseReason } from './toast-close-reason';
import type { ToastPosition } from './toast-position';
import type { ToastProps } from './toast-props';
import type { ToastTone } from './toast-tone';
import type { Toaster } from './Toaster';
import { onLanguage } from '../../core/on-language';

const OWN = ['title', 'tone', 'icon', 'duration', 'action', 'closeButton', 'position'] as const;

/** The glyph of each tone. */
const GLYPHS: Record<ToastTone, string> = {
  info: 'info',
  success: 'success',
  caution: 'caution',
  danger: 'danger',
};

/** The parts of a toast. On one object made on first use: the base constructor already renders. */
interface Parts {
  icon: Component<HTMLSpanElement>;
  releaseIcon: () => void;
  body: Component<HTMLDivElement>;
  title: Component<HTMLDivElement> | null;
  titleId: string;
  messagePart: Component<HTMLDivElement>;
  messageId: string;
  action: Button | null;
  close: Button | null;
  toaster: Toaster | null;
  closing: boolean;
  timer: ReturnType<typeof setTimeout> | undefined;
  /** Milliseconds left while the timer is stopped. */
  remaining: number;
  startedAt: number;
  /** The timer line running out with the time left (a piece a design language may show). */
  line: Animation | undefined;
  closedEmitter: Emitter<ToastCloseReason>;
  closed: Promise<ToastCloseReason>;
  resolve: (reason: ToastCloseReason) => void;
}

const PARTS = Symbol('mx.toast');

/**
 * A short notification with a tone glyph, a title and a message, an optional action button and a
 * close button. It closes automatically after `duration`, and the timer stops while the pointer or
 * focus is on it, or the page is hidden. `toast.show()` usually creates it and returns it, and
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
    this.observeProperty<string>('text', (text) => writeText(parts.messagePart, text ?? ''));
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

  /** The toaster that shows the toast, or that holds it until there is room. */
  get toaster(): Toaster | null {
    return this.parts.toaster;
  }

  /** Resolves with the reason when the toast closes. */
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

  /** Changes any of the props, restarts the timer and announces the toast again. */
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
    parts.line?.cancel();
    parts.line = undefined;
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
    parts.line?.pause();
  }

  /** @internal */
  resume(): void {
    const parts = this.parts;
    if (parts.timer !== undefined || parts.closing || parts.remaining <= 0 || !parts.toaster?.isShowing(this)) return;
    parts.startedAt = performance.now();
    parts.timer = setTimeout(() => this.close('timeout'), parts.remaining);
    // browser object read: allowed exception
    parts.line ??=this.element.animate?.([{ scale: '1 1' }, { scale: '0 1' }], { duration: parts.remaining, fill: 'forwards', pseudoElement: '::after' });
    parts.line?.play();
  }

  /** The text screen readers announce when it appears. */
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
    this.class.add('mx-toast');
    this.attr.add({ role: 'group' });
    put(this, 'tabindex', '0');
    const icon = part<HTMLSpanElement>(this, 'span', 'mx-toast__icon');
    icon.attr.add({ 'aria-hidden': 'true' });
    const body = part<HTMLDivElement>(this, 'div', 'mx-toast__body');
    const messagePart = part<HTMLDivElement>(body, 'div', 'mx-toast__text');
    const messageId = nextId('toast-text');
    messagePart.attr.add({ id: messageId });
    put(this, 'aria-labelledby', messageId);
    let resolve!: (reason: ToastCloseReason) => void;
    const closed = new Promise<ToastCloseReason>((r) => (resolve = r));
    return {
      icon,
      releaseIcon: () => {},
      body,
      title: null,
      titleId: '',
      messagePart,
      messageId,
      action: null,
      close: null,
      toaster: null,
      closing: false,
      timer: undefined,
      remaining: 0,
      startedAt: 0,
      line: undefined,
      closedEmitter: new Emitter(),
      closed,
      resolve,
    };
  }

  private renderTitle(title: string | undefined): void {
    const parts = this.parts;
    if (!parts.title) {
      if (!title) return;
      // Above the text.
      parts.title = partBefore<HTMLDivElement>(parts.body, parts.messagePart, 'div', 'mx-toast__title');
      parts.titleId = nextId('toast-title');
      parts.title.attr.add({ id: parts.titleId });
    }
    writeText(parts.title, title ?? '');
    mark(parts.title, 'hidden', !title);
    put(this, 'aria-labelledby', title ? `${parts.titleId} ${parts.messageId}` : parts.messageId);
  }

  private renderTone(): void {
    const parts = this.parts;
    const tone = this.peekProperty<ToastTone>('tone') ?? 'info';
    put(this, 'data-tone', tone);
    const icon = this.peekProperty<IconSource | null | undefined>('icon');
    parts.releaseIcon();
    parts.releaseIcon = () => {};
    mark(parts.icon, 'hidden', icon === null);
    clearParts(parts.icon);
    if (icon === null) return;
    if (icon === undefined) {
      // The tone's glyph: a design language may draw another one (the toast's tone icon tokens).
      glyphPart(parts.icon, GLYPHS[tone] ?? 'info', 'mx-toast__mark');
      return;
    }
    parts.releaseIcon = showIcon(icon, parts.icon);
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
      // Its variant and size are the toast's action place's.
      const button = new Button();
      button.class.add('mx-toast__action');
      button.motif.on('click', () => this.runAction());
      // Before the close button.
      const at = parts.close ? this.controls.items.indexOf(parts.close) : -1;
      if (at >= 0) this.controls.insert(at, button);
      else this.controls.add(button);
      parts.action = button;
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
    const button = new Button({ icon: glyph('dismiss') });
    button.class.add('mx-toast__close');
    onLanguage(button, () => put(button, 'aria-label', uiLocale.strings.close));
    button.motif.on('click', () => this.close('button'));
    this.controls.add(button);
    parts.close = button;
  }
}
