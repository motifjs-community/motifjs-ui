import { Application, effect, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { parseAccessKey } from '../../core/access-key';
import { FocusContainer } from '../../core/container';
import type { Control } from '../../core/control';
import { controlOf } from '../../core/control-map';
import { deepActiveElement, focusableIn, isFocusable } from '../../core/focus';
import { dismissMark, maximizeMark, minimizeMark, restoreMark } from '../../core/glyphs';
import { iconNode } from '../../core/icon-node';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { isHtmlElement } from '../../core/node-kind';
import { uiLocale } from '../../core/ui-locale';
import { windowStack, type StackedWindow } from '../../core/window-stack';
import { followPointer } from '../../parts/window/follow-pointer';
import { resizeBox } from '../../parts/window/resize-box';
import { resizeFrame } from '../../parts/window/resize-frame';
import type { WindowBox } from '../../parts/window/window-box';
import type { WindowEdge } from '../../parts/window/window-edge';
import { Button } from '../button/Button';
import type { FormCloseReason } from './form-close-reason';
import type { FormClosedEventArgs } from './form-closed-event-args';
import type { FormClosingEventArgs } from './form-closing-event-args';
import type { FormEventArgs } from './form-event-args';
import type { FormHost } from './form-host';
import type { FormProps } from './form-props';
import type { FormResult } from './form-result';
import type { FormStartPosition } from './form-start-position';
import type { FormWindowState } from './form-window-state';

const OWN = [
  'value',
  'modal',
  'content',
  'footer',
  'icon',
  'showClose',
  'showMinimize',
  'showMaximize',
  'resizable',
  'movable',
  'closeOnEscape',
  'acceptButton',
  'cancelButton',
  'minimizeTarget',
  'windowState',
  'startPosition',
  'left',
  'top',
  'width',
  'height',
  'alert',
  'disposeOnClose',
] as const;

/** Events that bubble inside the window and stop at its root. */
const CONTAINED = [
  'click',
  'dblclick',
  'auxclick',
  'contextmenu',
  'pointerdown',
  'pointerup',
  'mousedown',
  'mouseup',
  'touchstart',
  'touchend',
  'keydown',
  'keyup',
  'keypress',
  'beforeinput',
  'input',
  'change',
  'submit',
  'reset',
  'focusin',
  'focusout',
  'wheel',
  'copy',
  'cut',
  'paste',
];

/** Elements in which Enter presses the accept button: one-line fields, not buttons or multi-line text. */
const ENTER_FIELDS =
  'input:not([type=button],[type=submit],[type=reset],[type=image],[type=file]), select, [role=textbox]:not([aria-multiline=true]), [role=combobox], [role=spinbutton]';

/** What the form focuses first when it opens, before trying a button. */
const FIELDS = `${ENTER_FIELDS}, textarea, [contenteditable]:not([contenteditable=false]), [role=slider], [role=switch], [role=checkbox], [role=radio], [role=listbox]`;

/** The parts and the running state of a form. On one object made on first use: the base constructor already renders. */
interface Parts {
  /** The window it keeps in view of while it is open. */
  view: Window | null;
  bar: HTMLDivElement;
  icon: HTMLSpanElement;
  releaseIcon: () => void;
  title: HTMLDivElement;
  tools: HTMLDivElement;
  content: HTMLDivElement;
  footer: HTMLDivElement;
  frame: HTMLDivElement;
  minimize: Button | null;
  maximize: Button | null;
  close: Button | null;
  stopLabels: (() => void) | null;
  /** Controls placed somewhere else than the content area. */
  slots: Map<ComponentBase, HTMLElement>;
  contentControl: ComponentBase | null;
  footerControl: ComponentBase | null;
  entry: StackedWindow;
  open: boolean;
  modal: boolean;
  active: boolean;
  loaded: boolean;
  /** `show` or `showDialog` added it to its host. */
  attached: boolean;
  /** An open waiting for the form to reach the page: modal or not. */
  pending: boolean | null;
  opener: HTMLElement | null;
  waiters: ((result: FormResult) => void)[];
  closing: boolean;
  /** The open state is being written back to `value`: not a request. */
  syncing: boolean;
  ready: boolean;
  chip: Button | null;
  /** The state a minimized form goes back to. */
  unminimized: 'normal' | 'maximized';
  lastInside: HTMLElement | null;
  observer: MutationObserver | null;
  lives: WeakSet<ComponentBase>;
  load: Emitter<FormEventArgs>;
  shown: Emitter<FormEventArgs>;
  activate: Emitter<FormEventArgs>;
  deactivate: Emitter<FormEventArgs>;
  closingEmitter: Emitter<FormClosingEventArgs>;
  closed: Emitter<FormClosedEventArgs>;
}

const PARTS = Symbol('mx.form');

function lengthOf(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined || value === '') return null;
  return typeof value === 'number' ? `${value}px` : value;
}

/** The viewport of the window `el` is in (a window the app opened has its own). */
function viewport(el: Element): { w: number; h: number } {
  const root = el.ownerDocument.documentElement;
  const view = el.ownerDocument.defaultView;
  return { w: root.clientWidth || view?.innerWidth || 0, h: root.clientHeight || view?.innerHeight || 0 };
}

/**
 * A window: a title bar (icon, title, minimize, maximize and close buttons), a content area and a
 * row for its buttons, on a native `<dialog>`. Whoever shows it decides how: `show(host)` opens it
 * modeless (the page stays usable), `showDialog(host)` modal, and resolves with its result when it
 * closes. Forms open forms; a modal opened from a modal blocks the one below. It moves by its title
 * bar, resizes from its edges and corners, and can be minimized and maximized. Escape and Enter
 * click its `cancelButton` and `acceptButton`. Written in JSX with `x-model`, it shows while the
 * value is true.
 *
 * @example
 * class Settings extends MxForm {
 *   constructor() { super({ title: 'Settings', width: '28rem' }); }
 *   view() { return <TextBox label="&Name" x-model={() => this.model.name} />; }
 * }
 * const result = await new Settings().showDialog(this);
 *
 * <MxForm title="Find" x-model={() => this.state.find}>…</MxForm>
 */
export class MxForm extends FocusContainer<HTMLDialogElement, FormProps> {
  static override elementTag = 'dialog';

  constructor(props?: IBaseProp<FormProps>) {
    super(props);
    const own = (this.props ?? {}) as FormProps;
    const parts = this.parts;
    if (own.title !== undefined) this.bindProperty('text', own.title);
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);

    this.observeProperty<string>('text', (text) => this.renderTitle(text));
    this.observeProperty('icon', () => this.renderIcon());
    for (const name of ['showClose', 'showMinimize', 'showMaximize'] as const) this.observeProperty(name, () => this.renderTools());
    this.observeProperty('resizable', () => this.renderFrame());
    this.observeProperty('movable', () => this.renderFrame());
    this.observeProperty('alert', () => this.renderMode());
    this.observeProperty<number | string>('width', (width) => this.renderLength('--_mx-w', width));
    this.observeProperty<number | string>('height', (height) => this.renderLength('--_mx-h', height));
    this.observeProperty('content', () => this.placeContent());
    this.observeProperty('footer', () => this.placeFooter());

    if (own.onLoaded) this.onLoaded(own.onLoaded);
    if (own.onShown) this.onShown(own.onShown);
    if (own.onActivate) this.onActivate(own.onActivate);
    if (own.onDeactivate) this.onDeactivate(own.onDeactivate);
    if (own.onClosing) this.onClosing(own.onClosing);
    if (own.onClosed) this.onClosed(own.onClosed);

    this.listen();
    parts.ready = true;
    if (this.peekProperty('value')) this.openWhenReady(!!this.peekProperty('modal'));
    this.motif.on('x:built', () => this.placeStrays());
    this.motif.setDisposable(() => {
      if (parts.open) this.closeWith(undefined, 'owner');
      parts.pending = null;
      for (const resolve of parts.waiters.splice(0)) resolve('cancel');
      parts.observer?.disconnect();
      parts.releaseIcon();
      parts.stopLabels?.();
      this.removeChip();
      for (const emitter of [parts.load, parts.shown, parts.activate, parts.deactivate, parts.closingEmitter, parts.closed]) emitter.dispose();
    });
  }

  /** The title; the same property as `text`. */
  get title(): string {
    return this.text;
  }
  set title(value: Bind<string>) {
    this.text = value;
  }
  /** Whether the form is open. Reactive. Setting it opens (modal with `modal`) or closes it. */
  get value(): boolean {
    return this.isOpen;
  }
  set value(value: Bind<boolean>) {
    this.assignProperty('value', value, Boolean);
  }
  get modal(): boolean {
    return !!this.getProperty<boolean>('modal');
  }
  set modal(value: Bind<boolean>) {
    this.assignProperty('modal', value, Boolean);
  }
  get content(): ComponentBase | null {
    return this.getProperty<ComponentBase | null | undefined>('content') ?? null;
  }
  set content(value: Bind<ComponentBase | null>) {
    this.assignProperty('content', value);
  }
  get footer(): ComponentBase | null {
    return this.getProperty<ComponentBase | null | undefined>('footer') ?? null;
  }
  set footer(value: Bind<ComponentBase | null>) {
    this.assignProperty('footer', value);
  }
  get icon(): IconSource | null {
    return this.getProperty<IconSource | null | undefined>('icon') ?? null;
  }
  set icon(value: Bind<IconSource | null>) {
    this.assignProperty('icon', value);
  }
  get showClose(): boolean {
    return this.getProperty<boolean | undefined>('showClose') ?? true;
  }
  set showClose(value: Bind<boolean>) {
    this.assignProperty('showClose', value, Boolean);
  }
  get showMinimize(): boolean {
    return !!this.getProperty<boolean>('showMinimize');
  }
  set showMinimize(value: Bind<boolean>) {
    this.assignProperty('showMinimize', value, Boolean);
  }
  get showMaximize(): boolean {
    return !!this.getProperty<boolean>('showMaximize');
  }
  set showMaximize(value: Bind<boolean>) {
    this.assignProperty('showMaximize', value, Boolean);
  }
  get resizable(): boolean {
    return this.getProperty<boolean | undefined>('resizable') ?? true;
  }
  set resizable(value: Bind<boolean>) {
    this.assignProperty('resizable', value, Boolean);
  }
  get movable(): boolean {
    return this.getProperty<boolean | undefined>('movable') ?? true;
  }
  set movable(value: Bind<boolean>) {
    this.assignProperty('movable', value, Boolean);
  }
  /** Whether Escape closes it now: as set, else on for a modal form and off for a modeless one. */
  get closeOnEscape(): boolean {
    const own = this.getProperty<boolean | undefined>('closeOnEscape');
    return own ?? this.isModal;
  }
  set closeOnEscape(value: Bind<boolean>) {
    this.assignProperty('closeOnEscape', value, Boolean);
  }
  get acceptButton(): Control | null {
    return this.getProperty<Control | null | undefined>('acceptButton') ?? null;
  }
  set acceptButton(value: Bind<Control | null>) {
    this.assignProperty('acceptButton', value);
  }
  get cancelButton(): Control | null {
    return this.getProperty<Control | null | undefined>('cancelButton') ?? null;
  }
  set cancelButton(value: Bind<Control | null>) {
    this.assignProperty('cancelButton', value);
  }
  get minimizeTarget(): HTMLElement | ComponentBase | null {
    return this.getProperty<HTMLElement | ComponentBase | null | undefined>('minimizeTarget') ?? null;
  }
  set minimizeTarget(value: Bind<HTMLElement | ComponentBase | null>) {
    this.assignProperty('minimizeTarget', value);
  }
  get windowState(): FormWindowState {
    return this.getProperty<FormWindowState | undefined>('windowState') ?? 'normal';
  }
  set windowState(value: Bind<FormWindowState>) {
    this.assignProperty('windowState', value);
  }
  get startPosition(): FormStartPosition {
    return this.getProperty<FormStartPosition | undefined>('startPosition') ?? 'center';
  }
  set startPosition(value: Bind<FormStartPosition>) {
    this.assignProperty('startPosition', value);
  }
  /** See the prop. After the user moves the form, its place (in pixels). */
  get left(): number | string | null {
    return this.getProperty<number | string | undefined>('left') ?? null;
  }
  set left(value: Bind<number | string | null>) {
    this.assignProperty('left', value);
  }
  /** See the prop. After the user moves the form, its place (in pixels). */
  get top(): number | string | null {
    return this.getProperty<number | string | undefined>('top') ?? null;
  }
  set top(value: Bind<number | string | null>) {
    this.assignProperty('top', value);
  }
  /** See the prop. After the user resizes the form, its size (in pixels). */
  get width(): number | string | null {
    return this.getProperty<number | string | undefined>('width') ?? null;
  }
  set width(value: Bind<number | string | null>) {
    this.assignProperty('width', value);
  }
  /** See the prop. After the user resizes the form, its size (in pixels). */
  get height(): number | string | null {
    return this.getProperty<number | string | undefined>('height') ?? null;
  }
  set height(value: Bind<number | string | null>) {
    this.assignProperty('height', value);
  }
  get alert(): boolean {
    return !!this.getProperty<boolean>('alert');
  }
  set alert(value: Bind<boolean>) {
    this.assignProperty('alert', value, Boolean);
  }
  /** Whether it is disposed when it closes: as set, else when `show` or `showDialog` added it to its host. */
  get disposeOnClose(): boolean {
    return this.getProperty<boolean | undefined>('disposeOnClose') ?? this.parts.attached;
  }
  set disposeOnClose(value: Bind<boolean>) {
    this.assignProperty('disposeOnClose', value, Boolean);
  }
  /** How it was closed, or will be: `close()` without an argument uses it. `'cancel'` when it opens. Reactive. */
  get result(): FormResult {
    return this.getProperty<FormResult | undefined>('result') ?? 'cancel';
  }
  set result(value: Bind<FormResult>) {
    this.assignProperty('result', value);
  }

  /** Reactive. */
  get isOpen(): boolean {
    return !!this.getProperty<boolean>('open');
  }
  /** Shown modal. Reactive. */
  get isModal(): boolean {
    return !!this.getProperty<boolean>('isModal');
  }
  /** The active (front) window of the page. Reactive. */
  get isActive(): boolean {
    return !!this.getProperty<boolean>('active');
  }

  /** The content area, for code that places elements itself. */
  get contentElement(): HTMLDivElement {
    return this.parts.content;
  }

  /** Before it is shown the first time: the place to fill it. */
  get onLoaded(): MotifEvent<FormEventArgs> {
    return this.parts.load.event;
  }
  get onShown(): MotifEvent<FormEventArgs> {
    return this.parts.shown.event;
  }
  /** It became the active window (shown, clicked, focused). */
  get onActivate(): MotifEvent<FormEventArgs> {
    return this.parts.activate.event;
  }
  get onDeactivate(): MotifEvent<FormEventArgs> {
    return this.parts.deactivate.event;
  }
  /** It is about to close; `e.cancel = true` keeps it open (not when its owner is going away). */
  get onClosing(): MotifEvent<FormClosingEventArgs> {
    return this.parts.closingEmitter.event;
  }
  get onClosed(): MotifEvent<FormClosedEventArgs> {
    return this.parts.closed.event;
  }

  /**
   * Shows the form modeless: the page and other windows stay usable. It is added to `host`
   * (a component or the application) unless it already sits somewhere, and dies with
   * `disposeRef` (else the host) even while open. Shown already, it comes to the front.
   */
  show(host: FormHost, disposeRef?: ComponentBase): void {
    this.request(host, disposeRef, false);
  }

  /**
   * Shows the form modal: nothing else on the page can be used until it closes. Resolves with
   * its result (`'ok'`, `'cancel'` or your own word) when it closes.
   */
  showDialog(host: FormHost, disposeRef?: ComponentBase): Promise<FormResult> {
    const done = new Promise<FormResult>((resolve) => this.parts.waiters.push(resolve));
    this.request(host, disposeRef, true);
    return done;
  }

  /**
   * Closes the form with `result` (else its `result`). A form `show` or `showDialog` added to its
   * host is disposed; one written in JSX is hidden. `false` when an `onClosing` listener kept it open.
   */
  close(result?: FormResult): boolean {
    return this.closeWith(result, 'code');
  }

  /** Brings the form to the front and gives focus back to its last active control. */
  activate(): void {
    const parts = this.parts;
    if (!parts.open) return;
    if (this.windowState === 'minimized') {
      this.restore();
      return;
    }
    windowStack.bringToFront(parts.entry);
    if (!this.focusWithin) this.restoreFocus();
  }

  minimize(): void {
    this.windowState = 'minimized';
  }

  maximize(): void {
    this.windowState = 'maximized';
  }

  /** Back from minimized (to the state before) or from maximized. */
  restore(): void {
    this.windowState = this.windowState === 'minimized' ? this.parts.unminimized : 'normal';
  }

  /** Puts it back in the middle of the viewport. */
  center(): void {
    this.element.removeAttribute('data-placed');
  }

  override restoreFocus(): boolean {
    const parts = this.parts;
    if (!parts.lastInside || !this.element.contains(parts.lastInside)) return this.focusFirst();
    return super.restoreFocus() || this.focusFirst();
  }

  /** A window is a root: controls around it do not disable it, and it runs Tab itself. */
  override get parentControl(): Control | null {
    return null;
  }

  protected override get cyclesTab(): boolean {
    return this.parts.open && this.parts.modal;
  }

  override onMounted(): void {
    const pending = this.parts.pending;
    if (pending === null) return;
    this.parts.pending = null;
    this.openNow(pending);
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    const parts = this.parts;
    if (!parts.ready) return;
    switch (name) {
      case 'value':
        if (!parts.syncing) this.valueChanged(!!value);
        break;
      case 'windowState':
        this.renderState(false);
        break;
      case 'left':
      case 'top':
      case 'startPosition':
        if (parts.open && this.startPosition === 'manual') this.placeAtProps();
        break;
      case 'minimizeTarget':
        if (parts.open && this.windowState === 'minimized') this.renderState(false);
        break;
    }
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    const el = this.element;
    el.classList.add('mx-form');
    el.setAttribute('role', 'dialog');
    el.tabIndex = -1;
    el.dataset.state = 'normal';

    const bar = document.createElement('div');
    bar.className = 'mx-form__bar';
    const icon = document.createElement('span');
    icon.className = 'mx-form__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.hidden = true;
    // A heading by role, not an <h2>: the page's own heading styles stay out of the title bar.
    const title = document.createElement('div');
    title.className = 'mx-form__title';
    title.setAttribute('role', 'heading');
    title.setAttribute('aria-level', '2');
    title.id = nextId('form-title');
    const tools = document.createElement('div');
    tools.className = 'mx-form__tools';
    bar.append(icon, title, tools);

    const content = document.createElement('div');
    content.className = 'mx-form__content';
    const footer = document.createElement('div');
    footer.className = 'mx-form__footer';
    footer.hidden = true;
    const frame = resizeFrame(document, 'mx-form__frame', 'mx-form__resize');
    el.append(bar, content, footer, frame);

    const self = this;
    const parts: Parts = {
      bar,
      icon,
      releaseIcon: () => {},
      title,
      tools,
      content,
      footer,
      frame,
      minimize: null,
      maximize: null,
      close: null,
      stopLabels: null,
      slots: new Map(),
      contentControl: null,
      footerControl: null,
      entry: {
        element: el,
        get modal() {
          return self.parts.modal;
        },
        setActive: (active) => this.setActive(active),
      },
      open: false,
      modal: false,
      active: false,
      loaded: false,
      attached: false,
      pending: null,
      opener: null,
      waiters: [],
      closing: false,
      syncing: false,
      ready: false,
      chip: null,
      unminimized: 'normal',
      lastInside: null,
      observer: null,
      lives: new WeakSet(),
      load: new Emitter(),
      shown: new Emitter(),
      activate: new Emitter(),
      deactivate: new Emitter(),
      closingEmitter: new Emitter(),
      view: null,
      closed: new Emitter(),
    };
    return parts;
  }

  private listen(): void {
    const el = this.element;
    const parts = this.parts;
    el.addEventListener('keydown', (e) => this.keyDown(e));
    el.addEventListener('pointerdown', () => parts.open && windowStack.bringToFront(parts.entry), true);
    el.addEventListener('focusin', (e) => this.focusIn(e.target as HTMLElement));
    el.addEventListener('cancel', (e) => {
      e.preventDefault();
      if (parts.open) this.escape();
    });
    el.addEventListener('close', () => {
      // Closed by the browser, not by close(): follow it.
      if (parts.open) this.finishClose(el.returnValue || 'cancel', 'user');
    });
    parts.bar.addEventListener('pointerdown', (e) => this.barPointerDown(e));
    // A press on the title bar keeps focus where it is (barPointerDown gives it back).
    parts.bar.addEventListener('mousedown', (e) => !(e.target as Element).closest('button') && e.preventDefault());
    parts.bar.addEventListener('dblclick', (e) => {
      if ((e.target as Element).closest('button') || !this.showMaximize) return;
      this.windowState = this.windowState === 'maximized' ? 'normal' : 'maximized';
    });
    parts.frame.addEventListener('pointerdown', (e) => this.resizePointerDown(e));
    for (const type of CONTAINED) el.addEventListener(type, (e) => e.stopPropagation());
    parts.observer = typeof MutationObserver === 'undefined' ? null : new MutationObserver(() => this.placeStrays());
    parts.observer?.observe(el, { childList: true });
  }

  /** Children core put at the root (JSX children, `view()`, `controls.add`) go to their area. */
  private placeStrays(): void {
    const parts = this.parts;
    const own = new Set<Node>([parts.bar, parts.content, parts.footer, parts.frame]);
    const strays = Array.from(this.element.childNodes).filter((n) => !own.has(n));
    if (!strays.length) return;
    const focus = deepActiveElement();
    const items = this.controls.items;
    for (const node of strays) {
      const control = items.find((c) => c.element === node);
      const slot = control ? parts.slots.get(control) : undefined;
      if (slot) {
        slot.append(node);
        continue;
      }
      // Keep the order of the controls.
      const index = control ? items.indexOf(control) : -1;
      const next = index < 0 ? undefined : items.slice(index + 1).find((c) => (c.element as Node | null)?.parentNode === parts.content);
      parts.content.insertBefore(node, (next?.element as Node | undefined) ?? null);
    }
    this.orderTools();
    if (focus && !focus.isConnected) return;
    if (focus && deepActiveElement() !== focus && this.element.contains(focus)) focus.focus({ preventScroll: true });
  }

  /** Adds a control of the form's own to an area. */
  private placeIn(control: ComponentBase, area: HTMLElement): void {
    this.parts.slots.set(control, area);
    this.controls.add(control);
    if (control.element && (control.element as Node).parentNode === this.element) area.append(control.element as Node);
  }

  private unplace(control: ComponentBase | null): void {
    if (!control) return;
    this.parts.slots.delete(control);
    if (control.parent === this) this.controls.remove(control);
  }

  private placeContent(): void {
    const parts = this.parts;
    const control = this.peekProperty<ComponentBase | null>('content') ?? null;
    if (control === parts.contentControl) return;
    this.unplace(parts.contentControl);
    parts.contentControl = control;
    if (control) this.placeIn(control, parts.content);
  }

  private placeFooter(): void {
    const parts = this.parts;
    const control = this.peekProperty<ComponentBase | null>('footer') ?? null;
    if (control === parts.footerControl) return;
    this.unplace(parts.footerControl);
    parts.footerControl = control;
    parts.footer.hidden = !control;
    if (control) this.placeIn(control, parts.footer);
  }

  private renderTitle(text: string): void {
    const parts = this.parts;
    const plain = parseAccessKey(text ?? '').text;
    parts.title.textContent = plain;
    if (plain) this.element.setAttribute('aria-labelledby', parts.title.id);
    else this.element.removeAttribute('aria-labelledby');
    parts.title.hidden = !plain;
  }

  private renderIcon(): void {
    const parts = this.parts;
    const icon = this.peekProperty<IconSource | null>('icon');
    parts.releaseIcon();
    parts.releaseIcon = () => {};
    parts.icon.hidden = !icon;
    if (!icon) {
      parts.icon.replaceChildren();
      return;
    }
    const shown = iconNode(icon);
    parts.icon.replaceChildren(shown.node);
    parts.releaseIcon = shown.release;
  }

  /** The title bar buttons: minimize (modeless only), maximize, close. */
  private renderTools(): void {
    const parts = this.parts;
    const minimize = !!this.peekProperty('showMinimize') && !parts.modal;
    const maximize = !!this.peekProperty('showMaximize');
    const close = this.peekProperty<boolean>('showClose') ?? true;
    parts.minimize = this.tool(parts.minimize, minimize, () => this.toggleMinimized());
    parts.maximize = this.tool(parts.maximize, maximize, () => (this.windowState = this.windowState === 'maximized' ? 'normal' : 'maximized'));
    parts.close = this.tool(parts.close, close, () => this.closeWith('cancel', 'user'));
    parts.close?.element.classList.add('mx-form__close');
    this.orderTools();
    this.renderToolLook();
    if (!parts.stopLabels && (parts.minimize || parts.maximize || parts.close)) {
      parts.stopLabels = effect(() => {
        const strings = uiLocale.strings;
        this.labelTools(strings.minimize, strings.maximize, strings.restore, strings.close);
      });
    } else if (parts.stopLabels) {
      const strings = uiLocale.strings;
      this.labelTools(strings.minimize, strings.maximize, strings.restore, strings.close);
    }
  }

  private tool(current: Button | null, wanted: boolean, click: () => void): Button | null {
    if (!wanted) {
      this.unplace(current);
      return null;
    }
    if (current) return current;
    const button = new Button({ variant: 'ghost', size: 'sm' });
    button.element.classList.add('mx-form__tool');
    button.element.addEventListener('click', click);
    this.placeIn(button, this.parts.tools);
    return button;
  }

  private orderTools(): void {
    const parts = this.parts;
    for (const button of [parts.minimize, parts.maximize, parts.close]) if (button) parts.tools.append(button.element);
  }

  private labelTools(minimize: string, maximize: string, restore: string, close: string): void {
    const parts = this.parts;
    const state = this.peekProperty<FormWindowState>('windowState') ?? 'normal';
    parts.minimize?.element.setAttribute('aria-label', state === 'minimized' ? restore : minimize);
    parts.maximize?.element.setAttribute('aria-label', state === 'maximized' ? restore : maximize);
    parts.close?.element.setAttribute('aria-label', close);
  }

  private renderToolLook(): void {
    const parts = this.parts;
    const state = this.peekProperty<FormWindowState>('windowState') ?? 'normal';
    if (parts.minimize) parts.minimize.icon = state === 'minimized' ? restoreMark() : minimizeMark();
    if (parts.maximize) parts.maximize.icon = state === 'maximized' ? restoreMark() : maximizeMark();
    if (parts.close && !parts.close.icon) parts.close.icon = dismissMark();
    const strings = uiLocale.strings;
    this.labelTools(strings.minimize, strings.maximize, strings.restore, strings.close);
  }

  private renderFrame(): void {
    this.element.toggleAttribute('data-resizable', this.peekProperty<boolean>('resizable') ?? true);
    this.element.toggleAttribute('data-movable', this.peekProperty<boolean>('movable') ?? true);
  }

  private renderMode(): void {
    const el = this.element;
    const parts = this.parts;
    el.setAttribute('role', this.peekProperty('alert') ? 'alertdialog' : 'dialog');
    el.toggleAttribute('data-modal', parts.modal);
    if (parts.modal) el.setAttribute('aria-modal', 'true');
    else el.removeAttribute('aria-modal');
  }

  private renderLength(name: string, value: number | string | null | undefined): void {
    const length = lengthOf(value);
    if (length) this.element.style.setProperty(name, length);
    else this.element.style.removeProperty(name);
  }

  /** Draws `windowState`; `opening`: the form is just being shown and focuses itself. */
  private renderState(opening: boolean): void {
    const parts = this.parts;
    let state = this.peekProperty<FormWindowState>('windowState') ?? 'normal';
    if (state === 'minimized' && parts.open && parts.modal) {
      // A modal form cannot get out of the way.
      state = parts.unminimized;
      this.syncProperty('windowState', state);
    }
    const before = this.element.dataset.state as FormWindowState;
    if (state !== 'minimized') parts.unminimized = state;
    const active = deepActiveElement();
    const hadFocus = !!active && this.element.contains(active);
    const bodyFocus = !!active && (parts.content.contains(active) || parts.footer.contains(active));
    const docked = state === 'minimized' && !!this.minimizeTarget && parts.open;
    this.element.dataset.state = state;
    this.element.toggleAttribute('data-docked', docked);
    if (docked) this.dock();
    else this.removeChip();
    this.renderToolLook();
    if (!parts.open) return;
    if (docked) {
      windowStack.remove(parts.entry);
      if (hadFocus) parts.chip?.focus();
      return;
    }
    windowStack.bringToFront(parts.entry);
    if (opening) return;
    if (state === 'minimized') {
      if (bodyFocus && !parts.minimize?.focus()) this.element.focus();
    } else if (before === 'minimized') {
      this.restoreFocus();
    }
  }

  private toggleMinimized(): void {
    if (this.windowState === 'minimized') this.restore();
    else this.minimize();
  }

  /** The chip a minimized form leaves in its `minimizeTarget`. */
  private dock(): void {
    const parts = this.parts;
    if (parts.chip) return;
    const target = this.minimizeTarget;
    if (!target) return;
    const chip = new Button({
      variant: 'outline',
      size: 'sm',
      // A literal title: an & in it is not an access key here.
      text: () => parseAccessKey(this.text).text.replace(/&/g, '&&'),
      icon: () => {
        const icon = this.icon;
        return typeof icon === 'string' ? icon : null;
      },
    });
    chip.element.classList.add('mx-form-chip');
    chip.element.addEventListener('click', () => this.restore());
    if (isHtmlElement(target)) {
      chip.build();
      target.append(chip.element);
    } else {
      target.controls.add(chip);
    }
    parts.chip = chip;
  }

  private removeChip(): void {
    const parts = this.parts;
    const chip = parts.chip;
    if (!chip) return;
    parts.chip = null;
    const element = chip.element;
    const parent = chip.parent;
    if (parent) parent.controls.remove(chip);
    else void chip.dispose();
    element.remove();
  }

  private request(host: FormHost, disposeRef: ComponentBase | undefined, modal: boolean): void {
    if (this.isDisposed) throw new Error('MxForm: this form was closed and disposed; create a new one.');
    const parts = this.parts;
    if (!this.parent) {
      parts.attached = true;
      if (host instanceof Application) host.insert(this);
      else host.controls.add(this);
    }
    const life = disposeRef ?? (host instanceof Application ? null : host);
    if (life && life !== this.parent && !parts.lives.has(life)) {
      parts.lives.add(life);
      life.motif.setDisposable(() => {
        if (!this.isDisposed) void this.dispose();
      });
    }
    if (parts.open) {
      this.activate();
      return;
    }
    this.openWhenReady(modal);
  }

  private openWhenReady(modal: boolean): void {
    if (this.element.isConnected) this.openNow(modal);
    else this.parts.pending = modal;
  }

  private openNow(modal: boolean): void {
    const parts = this.parts;
    if (parts.open || this.isDisposed) return;
    if (!parts.loaded) {
      parts.loaded = true;
      parts.load.fire({ source: this });
      if (parts.open || this.isDisposed) return;
    }
    const el = this.element;
    // A form shown from a form moves into its content area first: moving a shown dialog would undo showModal().
    const holder = el.parentElement ? controlOf(el.parentElement) : null;
    if (holder instanceof MxForm) holder.placeStrays();
    const focus = deepActiveElement();
    parts.opener = focus && !el.contains(focus) ? focus : null;
    parts.modal = modal;
    parts.open = true;
    parts.lastInside = null;
    this.setProperty('result', 'cancel');
    this.renderMode();
    this.renderTools();
    if (modal) el.showModal();
    else el.show();
    this.setProperty('isModal', modal);
    this.setProperty('open', true);
    this.syncProperty('value', true);
    if (this.startPosition === 'manual') this.placeAtProps();
    else this.center();
    parts.view = el.ownerDocument.defaultView;
    parts.view?.addEventListener('resize', this.keepInView);
    this.renderState(true);
    if (this.windowState !== 'minimized' || !this.minimizeTarget) this.focusFirst();
    parts.shown.fire({ source: this });
  }

  /** Focus on open: `[autofocus]`, the first field, the accept button, the first control, the form itself. */
  private focusFirst(): boolean {
    const parts = this.parts;
    const areas = [parts.content, parts.footer];
    for (const area of areas) {
      const auto = area.querySelector<HTMLElement>('[autofocus]');
      if (auto && isFocusable(auto) && this.tryFocus(auto)) return true;
    }
    const field = focusableIn(parts.content).find((el) => el.matches(FIELDS));
    if (field && this.tryFocus(field)) return true;
    if (this.acceptButton?.focus()) return true;
    for (const area of areas) {
      const first = focusableIn(area).find((el) => el.tabIndex >= 0);
      if (first && this.tryFocus(first)) return true;
    }
    this.element.focus();
    return deepActiveElement() === this.element;
  }

  private tryFocus(el: HTMLElement): boolean {
    el.focus();
    return deepActiveElement() === el;
  }

  private closeWith(result: FormResult | undefined, reason: FormCloseReason): boolean {
    const parts = this.parts;
    if (parts.pending !== null && !parts.open) {
      parts.pending = null;
      for (const resolve of parts.waiters.splice(0)) resolve(result ?? 'cancel');
      return true;
    }
    if (!parts.open) return true;
    if (parts.closing) return false;
    const e: FormClosingEventArgs = { cancel: false, result: result ?? this.peekProperty<FormResult>('result') ?? 'cancel', reason, source: this };
    parts.closing = true;
    try {
      parts.closingEmitter.fire(e);
    } finally {
      parts.closing = false;
    }
    if (e.cancel && reason !== 'owner') {
      if (this.peekProperty('value') === false) this.bindings.writeModel(true);
      this.syncProperty('value', true);
      return false;
    }
    if (!parts.open) return true;
    this.finishClose(e.result, reason);
    return true;
  }

  private finishClose(result: FormResult, reason: FormCloseReason): void {
    const parts = this.parts;
    const active = deepActiveElement(this.element);
    const focusInside = !active || this.element.contains(active) || !!parts.chip?.element.contains(active);
    parts.open = false;
    this.removeChip();
    windowStack.remove(parts.entry);
    parts.view?.removeEventListener('resize', this.keepInView);
    parts.view = null;
    if (this.element.open) this.element.close(result);
    this.setProperty('result', result);
    this.setProperty('open', false);
    this.setProperty('isModal', false);
    this.syncProperty('value', false);
    if (reason !== 'owner') this.bindings.writeModel(false);
    if (focusInside) this.returnFocus();
    parts.closed.fire({ result, reason, source: this });
    for (const resolve of parts.waiters.splice(0)) resolve(result);
    if (reason !== 'owner' && this.disposeOnClose && !this.isDisposed) void this.dispose();
  }

  /** Back to where focus was when the form opened, else to the window now on top. */
  private returnFocus(): void {
    const opener = this.parts.opener;
    this.parts.opener = null;
    if (opener?.isConnected && isFocusable(opener) && !opener.closest('[inert]')) {
      opener.focus();
      if (deepActiveElement() === opener) return;
    }
    const top = windowStack.top(this.element.ownerDocument);
    const below = top ? controlOf(top.element) : null;
    if (below instanceof FocusContainer) below.restoreFocus();
  }

  private valueChanged(open: boolean): void {
    const parts = this.parts;
    if (open && !parts.open) this.openWhenReady(!!this.peekProperty('modal'));
    else if (!open && (parts.open || parts.pending !== null)) this.closeWith(undefined, 'code');
  }

  /** Stores what the form did into a property without treating it as a request. */
  private syncProperty(name: string, value: unknown): void {
    const parts = this.parts;
    parts.syncing = true;
    try {
      this.changeProperty(name, value);
    } finally {
      parts.syncing = false;
    }
  }

  private setActive(active: boolean): void {
    const parts = this.parts;
    if (parts.active === active) return;
    parts.active = active;
    this.element.toggleAttribute('data-active', active);
    this.setProperty('active', active);
    (active ? parts.activate : parts.deactivate).fire({ source: this });
  }

  private focusIn(target: HTMLElement): void {
    const parts = this.parts;
    if (!parts.open) return;
    if (target.closest('dialog') !== this.element) return;
    windowStack.bringToFront(parts.entry);
    if (target !== this.element) {
      parts.lastInside = target;
      return;
    }
    // A click on an empty spot: focus stays with the control that had it.
    const last = parts.lastInside;
    if (last && this.element.contains(last) && isFocusable(last)) last.focus({ preventScroll: true });
  }

  private keyDown(e: KeyboardEvent): void {
    const parts = this.parts;
    if (!parts.open || e.defaultPrevented || e.isComposing) return;
    const target = e.target as HTMLElement;
    if (target.closest('dialog') !== this.element) return;
    if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      // Also keeps the browser from closing a modal dialog by itself.
      if (parts.modal) e.preventDefault();
      if (this.escape()) e.preventDefault();
    } else if (e.key === 'Enter' && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      const accept = this.acceptButton;
      if (accept && target.matches(ENTER_FIELDS) && parts.content.contains(target) && press(accept)) e.preventDefault();
    }
  }

  /** Escape: the cancel button, else close when `closeOnEscape`. Returns whether it did something. */
  private escape(): boolean {
    const cancel = this.cancelButton;
    if (cancel) return press(cancel);
    if (!this.closeOnEscape) return false;
    this.closeWith('cancel', 'user');
    return true;
  }

  private get rtl(): boolean {
    return getComputedStyle(this.element).direction === 'rtl';
  }

  /** Where the form is, from the start edge of the viewport. */
  private box(): WindowBox {
    const r = this.element.getBoundingClientRect();
    const x = this.rtl ? viewport(this.element).w - r.right : r.left;
    return { x, y: r.top, w: r.width, h: r.height };
  }

  private placeAt(x: number, y: number, w?: number, h?: number): void {
    const view = viewport(this.element);
    const size = this.box();
    const width = w ?? size.w;
    const height = h ?? size.h;
    const style = this.element.style;
    style.setProperty('--_mx-x', `${Math.round(Math.min(Math.max(0, x), Math.max(0, view.w - width)))}px`);
    style.setProperty('--_mx-y', `${Math.round(Math.min(Math.max(0, y), Math.max(0, view.h - height)))}px`);
    this.element.setAttribute('data-placed', '');
  }

  private placeAtProps(): void {
    const style = this.element.style;
    style.setProperty('--_mx-x', lengthOf(this.peekProperty<number | string>('left')) ?? '0px');
    style.setProperty('--_mx-y', lengthOf(this.peekProperty<number | string>('top')) ?? '0px');
    this.element.setAttribute('data-placed', '');
  }

  private readonly keepInView = (): void => {
    if (!this.element.hasAttribute('data-placed') || this.windowState === 'maximized') return;
    const b = this.box();
    this.placeAt(b.x, b.y);
  };

  private barPointerDown(e: PointerEvent): void {
    const parts = this.parts;
    if (e.button !== 0 || !parts.open || (e.target as Element).closest('button')) return;
    // No text selection while dragging, and focus goes back to the last active control.
    e.preventDefault();
    windowStack.bringToFront(parts.entry);
    if (!this.focusWithin || deepActiveElement() === this.element) this.restoreFocus();
    if (!this.movable || this.windowState === 'maximized') return;
    const start = this.box();
    const sign = this.rtl ? -1 : 1;
    this.drag(parts.bar, e, (dx, dy) => this.placeAt(start.x + sign * dx, start.y + dy));
  }

  private resizePointerDown(e: PointerEvent): void {
    const handle = (e.target as HTMLElement).closest<HTMLElement>('.mx-form__resize');
    if (e.button !== 0 || !handle || !this.parts.open || !this.resizable || this.windowState !== 'normal') return;
    e.preventDefault();
    windowStack.bringToFront(this.parts.entry);
    const edge = handle.dataset.edge as WindowEdge;
    const start = this.box();
    const css = getComputedStyle(this.element);
    const minW = parseFloat(css.minInlineSize || css.minWidth) || 0;
    const minH = parseFloat(css.minBlockSize || css.minHeight) || 0;
    const sign = this.rtl ? -1 : 1;
    this.placeAt(start.x, start.y);
    this.drag(handle, e, (dx, dy) => {
      const { x, y, w, h } = resizeBox(edge, start, sign * dx, dy, { w: minW, h: minH }, viewport(this.element));
      const style = this.element.style;
      style.setProperty('--_mx-w', `${Math.round(w)}px`);
      style.setProperty('--_mx-h', `${Math.round(h)}px`);
      this.placeAt(x, y, w, h);
    });
  }

  /** Follows the pointer from `e` until it is released, then keeps the new place and size. */
  private drag(on: HTMLElement, e: PointerEvent, move: (dx: number, dy: number) => void): void {
    this.element.setAttribute('data-dragging', '');
    followPointer(on, e, move, () => {
      this.element.removeAttribute('data-dragging');
      this.keepGeometry();
    });
  }

  /** After a move or a resize, the props say where the form is and how big. */
  private keepGeometry(): void {
    const b = this.box();
    const style = this.element.style;
    this.syncProperty('left', Math.round(b.x));
    this.syncProperty('top', Math.round(b.y));
    if (style.getPropertyValue('--_mx-w').endsWith('px')) this.syncProperty('width', Math.round(b.w));
    if (style.getPropertyValue('--_mx-h').endsWith('px')) this.syncProperty('height', Math.round(b.h));
  }
}

/** Clicks a button the way the user would, without moving focus. */
function press(control: Control): boolean {
  if (!control.isEnabled || !control.element.isConnected) return false;
  const el = control.element;
  const face = el.matches('button') ? el : (el.querySelector<HTMLElement>('button') ?? el);
  face.click();
  return true;
}
