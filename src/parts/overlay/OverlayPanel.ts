import { Application, effect, Emitter, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { parseAccessKey } from '../../core/access-key';
import { holdBackButton } from '../../core/back-button';
import { FocusContainer } from '../../core/container';
import type { Control } from '../../core/control';
import { controlOf } from '../../core/control-map';
import { deepActiveElement, focusableIn, isFocusable } from '../../core/focus';
import { dismissMark } from '../../core/glyphs';
import { nextId } from '../../core/next-id';
import { isHtmlElement } from '../../core/node-kind';
import { uiLocale } from '../../core/ui-locale';
import { windowStack, type StackedWindow } from '../../core/window-stack';
import { Button } from '../../components/button/Button';
import type { FormHost } from '../../components/form/form-host';
import { inertAround } from './inert-around';
import type { OverlayClosedEventArgs } from './overlay-closed-event-args';
import type { OverlayCloseReason } from './overlay-close-reason';
import type { OverlayClosingEventArgs } from './overlay-closing-event-args';
import type { OverlayContainer } from './overlay-container';
import type { OverlayEventArgs } from './overlay-event-args';
import type { OverlayOpeningEventArgs } from './overlay-opening-event-args';
import type { OverlayPanelProps } from './overlay-panel-props';

const OWN = [
  'value',
  'modal',
  'scrim',
  'content',
  'footer',
  'showClose',
  'closeOnEscape',
  'closeOnScrim',
  'closeOnBack',
  'focusOnOpen',
  'returnFocus',
  'disposeOnClose',
] as const;

/** What the panel focuses first when it opens, before any other control. */
const FIELDS =
  'input:not([type=button],[type=submit],[type=reset],[type=image],[type=file],[type=checkbox],[type=radio]), select, textarea, [role=textbox], [role=combobox], [role=spinbutton], [contenteditable]:not([contenteditable=false])';

const hasPopover = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

interface Parts {
  scrim: HTMLDivElement;
  panel: HTMLDivElement;
  header: HTMLDivElement;
  title: HTMLDivElement;
  tools: HTMLDivElement;
  body: HTMLDivElement;
  footer: HTMLDivElement;
  close: Button | null;
  stopLabel: (() => void) | null;
  slots: Map<ComponentBase, HTMLElement>;
  contentControl: ComponentBase | null;
  footerControl: ComponentBase | null;
  open: boolean;
  ready: boolean;
  syncing: boolean;
  /** `show` added it to its host. */
  attached: boolean;
  /** Asked to open before it reached the page: it opens once it is there. */
  pending: boolean;
  closing: boolean;
  /** Where focus was when it opened. */
  opener: HTMLElement | null;
  uninert: (() => void) | null;
  releaseBack: (() => void) | null;
  /** Puts back the container's own `position` when the panel made it relative. */
  unposition: (() => void) | null;
  /** The element it opened over while open, `null` for the page. */
  over: HTMLElement | null;
  /** A slide in or out that has not finished. */
  slide: { stop: () => void } | null;
  entry: StackedWindow;
  modal: boolean;
  observer: MutationObserver | null;
  lives: WeakSet<ComponentBase>;
  opening: Emitter<OverlayOpeningEventArgs>;
  opened: Emitter<OverlayEventArgs>;
  closingEmitter: Emitter<OverlayClosingEventArgs>;
  closed: Emitter<OverlayClosedEventArgs>;
}

const PARTS = Symbol('mx.overlay');

/**
 * What a bottom sheet, a drawer and an action sheet share: a panel that slides in over the page or
 * over a container, with a scrim under it, a title and a close button, a content area and a footer.
 * Modal, nothing around it can be used (it is made inert) and Tab stays inside. Escape, a press on
 * the scrim and the browser's back close it (each an option); focus moves in when it opens and goes
 * back when it closes. Every opening and closing asks first (`onOpening`, `onClosing`) and reports
 * after (`onOpened`, `onClosed`). A subclass names its parts (`static overlayClass`), places the
 * panel and moves it with the finger.
 */
export class OverlayPanel<TProps extends OverlayPanelProps = OverlayPanelProps> extends FocusContainer<HTMLDivElement, TProps> {
  static override elementTag = 'div';
  /** The class of the root; its parts are `<class>__panel`, `__scrim`, `__header`, `__title`, `__body`, `__footer`. */
  static overlayClass = 'mx-overlay';

  constructor(props?: IBaseProp<TProps>) {
    super(props);
    const own = (this.props ?? {}) as OverlayPanelProps;
    const parts = this.parts;
    if (own.title !== undefined) this.bindProperty('text', own.title);
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    // Kept as given and read when it opens: a function may name a component made after this one (a ref).
    if (own.container !== undefined) this.setProperty('container', own.container);
    if (own.label !== undefined) this.bindProperty('label', own.label);
    this.observeProperty<string>('text', () => this.renderTitle());
    this.observeProperty<string>('label', () => this.renderTitle());
    this.observeProperty('showClose', () => this.renderClose());
    this.observeProperty('content', () => this.placeContent());
    this.observeProperty('footer', () => this.placeFooter());
    this.observeProperty('scrim', () => this.renderMode());
    this.observeProperty('modal', () => this.renderMode());
    if (own.onOpening) this.onOpening(own.onOpening);
    if (own.onOpened) this.onOpened(own.onOpened);
    if (own.onClosing) this.onClosing(own.onClosing);
    if (own.onClosed) this.onClosed(own.onClosed);
    this.listen();
    parts.ready = true;
    this.motif.on('x:built', () => this.placeStrays());
    if (this.peekProperty('value')) queueMicrotask(() => this.peekProperty('value') && !parts.open && this.openBy());
    this.motif.setDisposable(() => {
      if (parts.open) this.closeBy('owner');
      parts.slide?.stop();
      parts.observer?.disconnect();
      parts.stopLabel?.();
      for (const emitter of [parts.opening, parts.opened, parts.closingEmitter, parts.closed]) emitter.dispose();
    });
  }

  // Properties (see OverlayPanelProps).

  get title(): string {
    return this.text;
  }
  set title(value: Bind<string>) {
    this.text = value;
  }
  get label(): string {
    return this.getProperty<string | undefined>('label') ?? '';
  }
  set label(value: Bind<string>) {
    this.assignProperty('label', value);
  }
  /** Whether it is open. Reactive. Setting it opens or closes it. */
  get value(): boolean {
    return this.isOpen;
  }
  set value(value: Bind<boolean>) {
    this.assignProperty('value', value, Boolean);
  }
  get modal(): boolean {
    return this.getProperty<boolean | undefined>('modal') ?? true;
  }
  set modal(value: Bind<boolean>) {
    this.assignProperty('modal', value, Boolean);
  }
  /** Whether a scrim shows: as set, else when modal. */
  get scrim(): boolean {
    return this.getProperty<boolean | undefined>('scrim') ?? this.modal;
  }
  set scrim(value: Bind<boolean>) {
    this.assignProperty('scrim', value, Boolean);
  }
  /** What it opens over; a function given is read each time it opens. */
  get container(): OverlayContainer {
    const given = this.getProperty<Bind<OverlayContainer> | undefined>('container');
    return (typeof given === 'function' ? given() : given) ?? null;
  }
  set container(value: Bind<OverlayContainer>) {
    this.setProperty('container', value);
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
  get showClose(): boolean {
    return !!this.getProperty<boolean>('showClose');
  }
  set showClose(value: Bind<boolean>) {
    this.assignProperty('showClose', value, Boolean);
  }
  get closeOnEscape(): boolean {
    return this.getProperty<boolean | undefined>('closeOnEscape') !== false;
  }
  set closeOnEscape(value: Bind<boolean>) {
    this.assignProperty('closeOnEscape', value, Boolean);
  }
  get closeOnScrim(): boolean {
    return this.getProperty<boolean | undefined>('closeOnScrim') !== false;
  }
  set closeOnScrim(value: Bind<boolean>) {
    this.assignProperty('closeOnScrim', value, Boolean);
  }
  get closeOnBack(): boolean {
    return this.getProperty<boolean | undefined>('closeOnBack') !== false;
  }
  set closeOnBack(value: Bind<boolean>) {
    this.assignProperty('closeOnBack', value, Boolean);
  }
  /** Whether focus moves in when it opens: as set, else when modal. */
  get focusOnOpen(): boolean {
    return this.getProperty<boolean | undefined>('focusOnOpen') ?? this.modal;
  }
  set focusOnOpen(value: Bind<boolean>) {
    this.assignProperty('focusOnOpen', value, Boolean);
  }
  get returnFocus(): boolean {
    return this.getProperty<boolean | undefined>('returnFocus') !== false;
  }
  set returnFocus(value: Bind<boolean>) {
    this.assignProperty('returnFocus', value, Boolean);
  }
  /** Whether it is disposed when it closes: as set, else when `show` added it to its host. */
  get disposeOnClose(): boolean {
    return this.getProperty<boolean | undefined>('disposeOnClose') ?? this.parts.attached;
  }
  set disposeOnClose(value: Bind<boolean>) {
    this.assignProperty('disposeOnClose', value, Boolean);
  }

  /** Reactive. */
  get isOpen(): boolean {
    return !!this.getProperty<boolean>('open');
  }

  /** The surface that slides in: the element with `role="dialog"`. */
  get panelElement(): HTMLDivElement {
    return this.parts.panel;
  }
  /** The content area, for code that places elements itself. */
  get contentElement(): HTMLDivElement {
    return this.parts.body;
  }

  get onOpening(): MotifEvent<OverlayOpeningEventArgs> {
    return this.parts.opening.event;
  }
  get onOpened(): MotifEvent<OverlayEventArgs> {
    return this.parts.opened.event;
  }
  get onClosing(): MotifEvent<OverlayClosingEventArgs> {
    return this.parts.closingEmitter.event;
  }
  get onClosed(): MotifEvent<OverlayClosedEventArgs> {
    return this.parts.closed.event;
  }

  /** Opens it; `false` when an `onOpening` listener said no. Made with `new` and placed nowhere, it opens from the end of the page or in its container. */
  open(): boolean {
    return this.openBy();
  }

  /** Closes it; `false` when an `onClosing` listener kept it open. */
  close(reason: OverlayCloseReason = 'code'): boolean {
    return this.closeBy(reason);
  }

  toggle(): boolean {
    return this.parts.open ? this.close() : this.open();
  }

  /** Adds it to `host` (a component or the application) unless it sits somewhere already, and opens it; it is disposed when it closes. */
  show(host: FormHost, disposeRef?: ComponentBase): boolean {
    if (this.isDisposed) throw new Error(`${this.constructor.name}: it was closed and disposed; create a new one.`);
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
    return this.openBy();
  }

  /** A panel is a root: controls around it do not disable it, and it runs Tab itself while modal. */
  override get parentControl(): Control | null {
    return null;
  }

  override restoreFocus(): boolean {
    return super.restoreFocus() || this.focusFirst();
  }

  override onMounted(): void {
    const parts = this.parts;
    if (!parts.pending) return;
    parts.pending = false;
    if (this.peekProperty('value') !== false) this.openBy();
  }

  protected override get cyclesTab(): boolean {
    return this.parts.open && this.parts.modal;
  }

  // For subclasses.

  /** The panel's header (title and close button), for a subclass that adds to it. */
  protected get headerElement(): HTMLDivElement {
    return this.parts.header;
  }

  /** The element it opens over now (its container, else the page's root element). */
  protected get overElement(): HTMLElement {
    return this.parts.over ?? this.element.ownerDocument.documentElement;
  }

  /** Before it slides in: the subclass places and sizes its panel. */
  protected placePanel(): void {}

  /** After it has slid out. */
  protected panelClosed(): void {}

  /** Content that scrolls with nothing to focus in it takes focus itself, so the keys can scroll it. */
  protected updateBodyFocus(): void {
    const body = this.parts.body;
    const scrolls = body.scrollHeight > body.clientHeight + 1 || body.scrollWidth > body.clientWidth + 1;
    if (scrolls && !focusableIn(body).some((el) => el !== body)) body.tabIndex = 0;
    else body.removeAttribute('tabindex');
  }

  /** Opens it as the user did (a swipe from the edge, a tap). */
  protected openBy(): boolean {
    const parts = this.parts;
    if (parts.open) {
      parts.slide?.stop();
      parts.slide = null;
      this.element.toggleAttribute('data-open', true);
      return true;
    }
    if (this.isDisposed) return false;
    // Placed in a component that is not on the page yet: it opens when it gets there (core puts it in place first).
    if (this.parent && !this.element.isConnected) {
      parts.pending = true;
      return true;
    }
    const e: OverlayOpeningEventArgs = { cancel: false, source: this };
    parts.opening.fire(e);
    if (e.cancel) {
      if (this.peekProperty('value')) {
        this.syncProperty('value', false);
        this.bindings.writeModel(false);
      }
      return false;
    }
    parts.slide?.stop();
    parts.slide = null;
    this.host();
    const el = this.element;
    const focus = deepActiveElement(el);
    parts.opener = focus && !el.contains(focus) ? focus : null;
    parts.open = true;
    parts.modal = this.modal;
    this.renderMode();
    el.hidden = false;
    if (hasPopover && el.popover && !el.matches(':popover-open')) el.showPopover();
    this.placePanel();
    this.updateBodyFocus();
    // Laid out closed first, so it slides in from there.
    void parts.panel.offsetHeight;
    el.toggleAttribute('data-open', true);
    if (parts.modal) {
      parts.uninert = inertAround(el, parts.over ?? el.ownerDocument.body);
      windowStack.bringToFront(parts.entry);
    }
    if (this.closeOnBack) parts.releaseBack = holdBackButton(el.ownerDocument.defaultView, () => this.closeFromBack(), 1);
    this.setProperty('open', true);
    this.syncProperty('value', true);
    if (this.focusOnOpen) this.focusFirst();
    this.afterSlide(() => parts.opened.fire({ source: this }));
    return true;
  }

  /** Closes it as the user did, with the reason (`'swipe'`, `'scrim'`…). */
  protected closeBy(reason: OverlayCloseReason): boolean {
    const parts = this.parts;
    if (parts.pending) {
      parts.pending = false;
      return true;
    }
    if (!parts.open) return true;
    if (parts.closing) return false;
    const e: OverlayClosingEventArgs = { cancel: false, reason, source: this };
    parts.closing = true;
    try {
      parts.closingEmitter.fire(e);
    } finally {
      parts.closing = false;
    }
    if (e.cancel && reason !== 'owner') {
      if (this.peekProperty('value') === false) this.bindings.writeModel(true);
      this.syncProperty('value', true);
      // A swipe or the back button that did not close it: it goes back where it was.
      this.placePanel();
      if (reason === 'back' && this.closeOnBack) parts.releaseBack = holdBackButton(this.element.ownerDocument.defaultView, () => this.closeFromBack(), 1);
      return false;
    }
    if (!parts.open) return true;
    const el = this.element;
    const active = deepActiveElement(el);
    const focusInside = !!active && el.contains(active);
    parts.open = false;
    parts.uninert?.();
    parts.uninert = null;
    windowStack.remove(parts.entry);
    parts.releaseBack?.();
    parts.releaseBack = null;
    el.removeAttribute('data-open');
    this.setProperty('open', false);
    this.syncProperty('value', false);
    if (reason !== 'owner') this.bindings.writeModel(false);
    if (focusInside && this.returnFocus) this.giveFocusBack();
    const finish = () => {
      parts.slide = null;
      if (parts.open) return;
      if (hasPopover && el.popover && el.matches(':popover-open')) el.hidePopover();
      el.hidden = true;
      parts.unposition?.();
      parts.unposition = null;
      this.panelClosed();
      parts.closed.fire({ reason, source: this });
      if (reason !== 'owner' && this.disposeOnClose && !this.isDisposed) void this.dispose();
    };
    if (reason === 'owner') finish();
    else this.afterSlide(finish);
    return true;
  }

  /** Runs `done` once the panel has finished sliding (at once without motion). */
  protected afterSlide(done: () => void): void {
    const parts = this.parts;
    parts.slide?.stop();
    const panel = parts.panel;
    const view = panel.ownerDocument.defaultView;
    const ms = view ? longestTransition(view.getComputedStyle(panel)) : 0;
    if (!(ms > 0)) {
      parts.slide = null;
      done();
      return;
    }
    let over = false;
    const end = (e?: Event) => {
      if (over || (e && e.target !== panel)) return;
      over = true;
      stop();
      done();
    };
    const timer = setTimeout(end, ms + 50);
    panel.addEventListener('transitionend', end);
    const stop = () => {
      clearTimeout(timer);
      panel.removeEventListener('transitionend', end);
    };
    parts.slide = {
      stop: () => {
        over = true;
        stop();
      },
    };
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    const parts = this.parts;
    if (!parts.ready) return;
    if (name === 'value' && !parts.syncing) {
      if (value && !parts.open) this.openBy();
      else if (!value && parts.open) this.closeBy('code');
    } else if (name === 'container' && parts.open) {
      this.host();
      this.placePanel();
    }
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    const el = this.element;
    const doc = el.ownerDocument;
    const name = (this.constructor as typeof OverlayPanel).overlayClass;
    el.classList.add(name);
    el.hidden = true;
    const part = (tag: string, suffix: string) => {
      const node = doc.createElement(tag) as HTMLDivElement;
      node.className = `${name}__${suffix}`;
      return node;
    };
    const scrim = part('div', 'scrim');
    scrim.setAttribute('aria-hidden', 'true');
    const panel = part('div', 'panel');
    panel.setAttribute('role', 'dialog');
    panel.tabIndex = -1;
    const header = part('div', 'header');
    header.hidden = true;
    const title = part('div', 'title');
    // A heading by role: the page's own heading styles stay out.
    title.setAttribute('role', 'heading');
    title.setAttribute('aria-level', '2');
    title.id = nextId('overlay-title');
    const tools = part('div', 'tools');
    header.append(title, tools);
    const body = part('div', 'body');
    const footer = part('div', 'footer');
    footer.hidden = true;
    panel.append(header, body, footer);
    el.append(scrim, panel);
    const self = this;
    return {
      scrim,
      panel,
      header,
      title,
      tools,
      body,
      footer,
      close: null,
      stopLabel: null,
      slots: new Map(),
      contentControl: null,
      footerControl: null,
      open: false,
      ready: false,
      syncing: false,
      attached: false,
      pending: false,
      closing: false,
      opener: null,
      uninert: null,
      releaseBack: null,
      unposition: null,
      over: null,
      slide: null,
      entry: {
        element: el,
        get modal() {
          return self.parts.modal;
        },
        setActive: () => {},
      },
      modal: false,
      observer: null,
      lives: new WeakSet(),
      opening: new Emitter(),
      opened: new Emitter(),
      closingEmitter: new Emitter(),
      closed: new Emitter(),
    };
  }

  private listen(): void {
    const parts = this.parts;
    const el = this.element;
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
      if (!parts.open || !this.closeOnEscape) return;
      e.preventDefault();
      e.stopPropagation();
      this.closeBy('escape');
    });
    parts.scrim.addEventListener('click', () => {
      if (parts.open && this.closeOnScrim) this.closeBy('scrim');
    });
    // Presses on the scrim do not take focus away from the panel.
    parts.scrim.addEventListener('mousedown', (e) => e.preventDefault());
    const view = el.ownerDocument.defaultView;
    parts.observer = view && typeof view.MutationObserver === 'function' ? new view.MutationObserver(() => this.placeStrays()) : null;
    parts.observer?.observe(el, { childList: true });
  }

  /** The browser's back took its entry away: it closes, unless a listener keeps it open. */
  private closeFromBack(): void {
    this.parts.releaseBack = null;
    this.closeBy('back');
  }

  /** Puts it where it opens: in its container (positioned), or in the page's top layer. */
  private host(): void {
    const parts = this.parts;
    const el = this.element;
    if (!this.isBuilt) this.build();
    const given = untracked(() => this.container);
    const over = given ? (isHtmlElement(given) ? given : (given.element as HTMLElement)) : null;
    if (over !== parts.over) {
      parts.unposition?.();
      parts.unposition = null;
    }
    parts.over = over;
    el.toggleAttribute('data-contained', !!over);
    if (over) {
      if (hasPopover && el.popover) {
        if (el.matches(':popover-open')) el.hidePopover();
        el.popover = null;
      }
      if (!over.contains(el)) over.append(el);
      const view = over.ownerDocument.defaultView;
      if (!parts.unposition && view?.getComputedStyle(over).position === 'static') {
        const before = over.style.position;
        over.style.position = 'relative';
        parts.unposition = () => (over.style.position = before);
      }
      return;
    }
    if (!el.isConnected) el.ownerDocument.body.append(el);
    if (hasPopover && !el.popover) el.popover = 'manual';
  }

  private renderMode(): void {
    const parts = this.parts;
    const el = this.element;
    const modal = parts.open ? parts.modal : this.modal;
    el.toggleAttribute('data-modal', modal);
    el.toggleAttribute('data-scrim', this.scrim);
    if (modal) parts.panel.setAttribute('aria-modal', 'true');
    else parts.panel.removeAttribute('aria-modal');
  }

  private renderTitle(): void {
    const parts = this.parts;
    const plain = parseAccessKey(this.peekProperty<string>('text') ?? '').text;
    const label = this.peekProperty<string>('label') ?? '';
    parts.title.textContent = plain;
    parts.title.hidden = !plain;
    if (plain) {
      parts.panel.setAttribute('aria-labelledby', parts.title.id);
      parts.panel.removeAttribute('aria-label');
    } else {
      parts.panel.removeAttribute('aria-labelledby');
      if (label) parts.panel.setAttribute('aria-label', label);
      else parts.panel.removeAttribute('aria-label');
    }
    this.renderHeader();
  }

  private renderHeader(): void {
    const parts = this.parts;
    parts.header.hidden = parts.title.hidden && !parts.close;
  }

  private renderClose(): void {
    const parts = this.parts;
    const wanted = !!this.peekProperty('showClose');
    if (!wanted && parts.close) {
      this.unplace(parts.close);
      parts.close = null;
      parts.stopLabel?.();
      parts.stopLabel = null;
    } else if (wanted && !parts.close) {
      const button = new Button({ variant: 'ghost', size: 'sm', icon: dismissMark() });
      button.element.classList.add(`${(this.constructor as typeof OverlayPanel).overlayClass}__close`);
      button.element.addEventListener('click', () => this.closeBy('button'));
      this.placeIn(button, parts.tools);
      parts.close = button;
      parts.stopLabel = effect(() => button.element.setAttribute('aria-label', uiLocale.strings.close));
    }
    this.renderHeader();
  }

  /** Children core put at the root (JSX children, `controls.add`) go into the content area. */
  private placeStrays(): void {
    const parts = this.parts;
    const own = new Set<Node>([parts.scrim, parts.panel]);
    const strays = Array.from(this.element.childNodes).filter((n) => !own.has(n));
    if (!strays.length) return;
    const items = this.controls.items;
    for (const node of strays) {
      const control = items.find((c) => c.element === node);
      const slot = control ? parts.slots.get(control) : undefined;
      if (slot) slot.append(node);
      else parts.body.append(node);
    }
  }

  /** Adds a control of its own to one of its areas, where it stays. */
  protected placeIn(control: ComponentBase, area: HTMLElement): void {
    this.parts.slots.set(control, area);
    this.controls.add(control);
    if (control.element && (control.element as Node).parentNode !== area) area.append(control.element as Node);
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
    if (control) this.placeIn(control, parts.body);
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

  /** Focus on open: `[autofocus]`, the first field, the first control, the panel itself. */
  private focusFirst(): boolean {
    const parts = this.parts;
    const areas = [parts.body, parts.footer, parts.panel];
    for (const area of areas) {
      const auto = area.querySelector<HTMLElement>('[autofocus]');
      if (auto && isFocusable(auto) && tryFocus(auto)) return true;
    }
    // A finger opening it does not want the on-screen keyboard to come up at once: no field first there.
    const coarse = !!this.element.ownerDocument.defaultView?.matchMedia?.('(pointer: coarse)').matches;
    const field = coarse ? null : focusableIn(parts.body).find((el) => el.matches(FIELDS));
    if (field && tryFocus(field)) return true;
    if (coarse) return tryFocus(parts.panel);
    const first = focusableIn(parts.body).find((el) => el.tabIndex >= 0);
    if (first && tryFocus(first)) return true;
    return tryFocus(parts.panel);
  }

  /** Back to where focus was when it opened, else to the window now on top. */
  private giveFocusBack(): void {
    const opener = this.parts.opener;
    this.parts.opener = null;
    if (opener?.isConnected && isFocusable(opener) && !opener.closest('[inert]')) {
      opener.focus({ preventScroll: true });
      if (deepActiveElement(opener) === opener) return;
    }
    const top = windowStack.top(this.element.ownerDocument);
    const below = top ? controlOf(top.element) : null;
    if (below instanceof FocusContainer) below.restoreFocus();
  }

  private syncProperty(name: string, value: unknown): void {
    const parts = this.parts;
    parts.syncing = true;
    try {
      this.changeProperty(name, value);
    } finally {
      parts.syncing = false;
    }
  }
}

function tryFocus(el: HTMLElement): boolean {
  el.focus({ preventScroll: true });
  return deepActiveElement(el) === el;
}

/** The longest transition of a style, delay included, in milliseconds. */
function longestTransition(style: CSSStyleDeclaration): number {
  const times = (text: string) => text.split(',').map((t) => (t.trim().endsWith('ms') ? parseFloat(t) : parseFloat(t) * 1000) || 0);
  const durations = times(style.transitionDuration || '0s');
  const delays = times(style.transitionDelay || '0s');
  return Math.max(0, ...durations.map((d, i) => d + (delays[i % delays.length] ?? 0)));
}
