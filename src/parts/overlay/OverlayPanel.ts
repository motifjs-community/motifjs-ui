import { Application, Component, Emitter, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { parseAccessKey } from '../../core/access-key';
import { holdBackButton } from '../../core/back-button';
import { isWithin } from '../../core/component-tree';
import { FocusContainer } from '../../core/container';
import { part } from '../../core/draw-parts';
import { callNow, css, flag, mark, put, text } from '../../core/part-writes';
import { windowOf } from '../../core/page-documents';
import { appRootOf, placeOnPage } from '../../core/page-layer';
import { focusFirstIn, focusOn, hasFocusableIn, holdsFocus, isFocused, rememberFocus } from '../../core/focus';
import type { FocusMark } from '../../core/focus-mark';
import { dismissMark } from '../../core/glyphs';
import { afterStyle, boxOf, isInPage, measure, mediaOf, styleOf, transitionTime } from '../../core/measure';
import { nextId } from '../../core/next-id';
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
import { onLanguage } from '../../core/on-language';

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

const hasPopover = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

interface Parts {
  /**
   * The areas as components: the scrim and the panel are children of the overlay, the header, body and footer of the
   * panel, the title and the tools of the header.
   */
  scrimPart: Component<HTMLDivElement>;
  panelPart: Component<HTMLDivElement>;
  headerPart: Component<HTMLDivElement>;
  titlePart: Component<HTMLDivElement>;
  toolsPart: Component<HTMLDivElement>;
  bodyPart: Component<HTMLDivElement>;
  footerPart: Component<HTMLDivElement>;
  /** The id of the title, which names the panel. */
  titleId: string;
  /** The title shows a text. */
  hasTitle: boolean;
  close: Button | null;
  stopLabel: (() => void) | null;
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
  opener: FocusMark | null;
  uninert: (() => void) | null;
  releaseBack: (() => void) | null;
  /** Puts back the container's own `position` when the panel made it relative. */
  unposition: (() => void) | null;
  /** What it opened over while open; `null` for the page. */
  over: ComponentBase | null;
  /** `popover="manual"` is written: it opens in the page's top layer. */
  popover: boolean;
  /** It is shown in the top layer now. */
  inTopLayer: boolean;
  /** A slide in or out that has not finished. */
  slide: { stop: () => void } | null;
  entry: StackedWindow;
  modal: boolean;
  lives: WeakSet<ComponentBase>;
  opening: Emitter<OverlayOpeningEventArgs>;
  opened: Emitter<OverlayEventArgs>;
  closingEmitter: Emitter<OverlayClosingEventArgs>;
  closed: Emitter<OverlayClosedEventArgs>;
  /** Whether the body's content scrolls, read in a measuring round; then whether the body takes focus itself. */
  readScrolls: () => boolean;
  writeBodyFocus: (scrolls: boolean) => void;
}

const PARTS = Symbol('mx.overlay');

/**
 * The base of a bottom sheet, a drawer and an action sheet: a panel that slides in over the page or
 * over a container, with a scrim behind it, a title and a close button, a content area and a footer.
 * While it is modal, the surrounding content is inert and Tab stays inside. Escape, a click on the
 * scrim and the browser's back action close it, each with its own option. Focus moves in when it opens
 * and returns when it closes. Every opening and closing raises an event first (`onOpening`, `onClosing`)
 * and reports after (`onOpened`, `onClosed`). A subclass names its parts (`static overlayClass`), places
 * the panel and moves it with the finger.
 */
export class OverlayPanel<TProps extends OverlayPanelProps = OverlayPanelProps> extends FocusContainer<HTMLDivElement, TProps> {
  static override elementTag = 'div';
  /** The class of the root. Its parts are `<class>__panel`, `__scrim`, `__header`, `__title`, `__body` and `__footer`. */
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
  /** Indicates whether it is open. Reactive. Setting it opens or closes it. */
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
  /** Indicates whether a scrim is shown: as set, otherwise when modal. */
  get scrim(): boolean {
    return this.getProperty<boolean | undefined>('scrim') ?? this.modal;
  }
  set scrim(value: Bind<boolean>) {
    this.assignProperty('scrim', value, Boolean);
  }
  /** What it opens over. A function is read each time it opens. */
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
  /** Indicates whether focus moves in when it opens: as set, otherwise when modal. */
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
  /** Indicates whether it is disposed when it closes: as set, otherwise when `show` added it to its host. */
  get disposeOnClose(): boolean {
    return this.getProperty<boolean | undefined>('disposeOnClose') ?? this.parts.attached;
  }
  set disposeOnClose(value: Bind<boolean>) {
    this.assignProperty('disposeOnClose', value, Boolean);
  }

  /** Indicates whether it is open. Reactive. */
  get isOpen(): boolean {
    return !!this.getProperty<boolean>('open');
  }

  /** The surface that slides in (`role="dialog"`) as a component: a control of an area of a derived panel is added to it. */
  get panelPart(): ComponentBase {
    return this.parts.panelPart;
  }

  /** The content area as a component, for code that places components itself: they are added to its controls. */
  get contentPart(): ComponentBase {
    return this.parts.bodyPart;
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

  /**
   * Opens it. Returns `false` if an `onOpening` listener canceled it. If it was created with `new` and is not on
   * the page, it opens from the end of the page or in its container.
   */
  open(): boolean {
    return this.openBy();
  }

  /** Closes it. Returns `false` if an `onClosing` listener kept it open. */
  close(reason: OverlayCloseReason = 'code'): boolean {
    return this.closeBy(reason);
  }

  toggle(): boolean {
    return this.parts.open ? this.close() : this.open();
  }

  /** Adds it to `host` (a component or the application) if needed and opens it. It is disposed when it closes. */
  show(host: FormHost, disposeRef?: ComponentBase): boolean {
    if (this.isDisposed) throw new Error(`${this.constructor.name}: it was closed and disposed; create a new one.`);
    const parts = this.parts;
    if (!this.parent) {
      parts.attached = true;
      if (host instanceof Application) host.insert(this);
      else host.controls.add(this);
    }
    const life = disposeRef ?? (host instanceof Application ? null : host);
    if (life && life !== this.parent) this.liveWith(life);
    return this.openBy();
  }

  /** Goes when `life` goes, though it is not its child. */
  private liveWith(life: ComponentBase): void {
    const parts = this.parts;
    if (parts.lives.has(life)) return;
    parts.lives.add(life);
    life.motif.setDisposable(() => {
      if (!this.isDisposed) void this.dispose();
    });
  }

  /** A panel is a root: the controls around it do not disable it, and it handles Tab itself while modal. */
  override get isWindow(): boolean {
    return true;
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

  /** The panel's header (title and close button) as a component, for a subclass that adds to it. */
  protected get headerPart(): ComponentBase {
    return this.parts.headerPart;
  }

  /** What it opens over now, as a component: its container, else the root of the app in its window. */
  protected overPart(): ComponentBase | null {
    return this.parts.over ?? appRootOf(this);
  }

  /** Indicates whether it opens over the page now, not over a container. */
  protected get overPage(): boolean {
    return this.parts.over === null;
  }

  /** The container, also before it opens: the one given; `null` for the page. */
  protected get containerPart(): ComponentBase | null {
    return untracked(() => this.container);
  }

  /** Before it slides in: the subclass places and sizes its panel. */
  protected placePanel(): void {}

  /** After it has slid out. */
  protected panelClosed(): void {}

  /** Content that scrolls with nothing to focus in it takes focus itself, so the keys can scroll it. */
  protected updateBodyFocus(): void {
    const parts = this.parts;
    measure(this, parts.readScrolls, parts.writeBodyFocus);
  }

  /** Opens it as the user did (a swipe from the edge, a tap). */
  protected openBy(): boolean {
    const parts = this.parts;
    if (parts.open) {
      parts.slide?.stop();
      parts.slide = null;
      mark(this, 'data-open', true);
      return true;
    }
    if (this.isDisposed) return false;
    // Placed in a component that is not on the page yet: it opens when it gets there (core puts it in place first).
    if (this.parent && !isInPage(this)) {
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
    const focus = rememberFocus();
    parts.opener = focus && !focus.isIn(this) ? focus : null;
    parts.open = true;
    parts.modal = this.modal;
    this.renderMode();
    mark(this, 'hidden', false);
    this.showInTopLayer();
    this.placePanel();
    this.updateBodyFocus();
    // Styled closed first, so it slides in from there.
    afterStyle(parts.panelPart, () => {
      if (parts.open) mark(this, 'data-open', true);
    });
    if (parts.modal) {
      parts.uninert = inertAround(this, parts.over);
      windowStack.bringToFront(parts.entry);
    }
    if (this.closeOnBack) parts.releaseBack = holdBackButton(windowOf(this), () => this.closeFromBack(), 1);
    this.setProperty('open', true);
    if (!this.peekProperty('value')) this.bindings.writeModel(true);
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
      if (reason === 'back' && this.closeOnBack) parts.releaseBack = holdBackButton(windowOf(this), () => this.closeFromBack(), 1);
      return false;
    }
    if (!parts.open) return true;
    const focusInside = holdsFocus(this);
    parts.open = false;
    parts.uninert?.();
    parts.uninert = null;
    windowStack.remove(parts.entry);
    parts.releaseBack?.();
    parts.releaseBack = null;
    mark(this, 'data-open', false);
    this.setProperty('open', false);
    this.syncProperty('value', false);
    if (reason !== 'owner') this.bindings.writeModel(false);
    if (focusInside && this.returnFocus) this.giveFocusBack();
    const finish = () => {
      parts.slide = null;
      if (parts.open) return;
      this.hideFromTopLayer();
      mark(this, 'hidden', true);
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
    const ms = transitionTime(parts.panelPart);
    if (!(ms > 0)) {
      parts.slide = null;
      done();
      return;
    }
    let over = false;
    const end = () => {
      if (over) return;
      over = true;
      stop();
      done();
    };
    const timer = setTimeout(end, ms + 50);
    // The panel's own transitions only: one of a part inside it comes up as well.
    void parts.panelPart.motif.on('transitionend:self', end);
    const stop = () => {
      clearTimeout(timer);
      void parts.panelPart.motif.off('transitionend:self', end);
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
    const name = (this.constructor as typeof OverlayPanel).overlayClass;
    this.class.add(name);
    mark(this, 'hidden', true);
    const div = (parent: ComponentBase, suffix: string) => part<HTMLDivElement>(parent, 'div', `${name}__${suffix}`);
    const scrimPart = div(this, 'scrim');
    scrimPart.attr.add({ 'aria-hidden': 'true' });
    const panelPart = div(this, 'panel');
    panelPart.attr.add({ role: 'dialog' });
    put(panelPart, 'tabindex', '-1');
    const headerPart = div(panelPart, 'header');
    mark(headerPart, 'hidden', true);
    const titlePart = div(headerPart, 'title');
    const titleId = nextId('overlay-title');
    // A heading by role: the page's own heading styles stay out.
    titlePart.attr.add({ role: 'heading', 'aria-level': '2', id: titleId });
    const toolsPart = div(headerPart, 'tools');
    const bodyPart = div(panelPart, 'body');
    const footerPart = div(panelPart, 'footer');
    mark(footerPart, 'hidden', true);
    const self = this;
    return {
      scrimPart,
      panelPart,
      headerPart,
      titlePart,
      toolsPart,
      bodyPart,
      footerPart,
      titleId,
      hasTitle: false,
      close: null,
      stopLabel: null,
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
      popover: false,
      inTopLayer: false,
      slide: null,
      entry: {
        part: this,
        get modal() {
          return self.parts.modal;
        },
        setActive: () => {},
      },
      modal: false,
      lives: new WeakSet(),
      opening: new Emitter(),
      opened: new Emitter(),
      closingEmitter: new Emitter(),
      closed: new Emitter(),
      readScrolls: () => {
        const box = boxOf(bodyPart);
        return box.scrollHeight > box.clientHeight + 1 || box.scrollWidth > box.clientWidth + 1;
      },
      writeBodyFocus: (scrolls) => put(bodyPart, 'tabindex', scrolls && !hasFocusableIn(bodyPart) ? '0' : null),
    };
  }

  private listen(): void {
    const parts = this.parts;
    this.motif.on('keydown', (_, e) => {
      if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
      if (!parts.open || !this.closeOnEscape) return;
      e.preventDefault();
      e.stopPropagation();
      this.closeBy('escape');
    });
    parts.scrimPart.motif.on('click', () => {
      if (parts.open && this.closeOnScrim) this.closeBy('scrim');
    });
    // Presses on the scrim do not take focus away from the panel.
    parts.scrimPart.motif.on('mousedown', (_, e) => e.preventDefault());
    // One added at the root later goes into the content area too, once core has placed it.
    void this.motif.on('controladded', () => queueMicrotask(() => !this.isDisposed && this.placeStrays()), false);
  }

  /** The browser's back took its entry away: it closes, unless a listener keeps it open. */
  private closeFromBack(): void {
    this.parts.releaseBack = null;
    this.closeBy('back');
  }

  /** Puts it where it opens: in its container (positioned), or in the page's top layer. */
  private host(): void {
    const parts = this.parts;
    if (!this.isBuilt) this.build();
    const over = this.containerPart;
    if (over !== parts.over) {
      parts.unposition?.();
      parts.unposition = null;
    }
    parts.over = over;
    mark(this, 'data-contained', !!over);
    if (over) {
      this.hideFromTopLayer();
      if (parts.popover) {
        parts.popover = false;
        put(this, 'popover', null);
      }
      // A child of the container's component; it still goes with its owner.
      if (!isWithin(this, over)) {
        const owner = this.parent;
        over.controls.add(this);
        if (owner && owner !== over) this.liveWith(owner);
      }
      // Read once as it opens, before anything of it is written.
      if (!parts.unposition && styleOf(over, ['position']).position === 'static') {
        css(over, 'position', 'relative');
        parts.unposition = () => css(over, 'position', '');
      }
      return;
    }
    // Not placed by an owner: it goes above the page.
    if (!this.parent) placeOnPage(this, this);
    if (hasPopover && !parts.popover) {
      parts.popover = true;
      put(this, 'popover', 'manual');
    }
  }

  /** Into the page's top layer when it opens there. The browser's own call, made at once: what follows measures and focuses it there. */
  private showInTopLayer(): void {
    const parts = this.parts;
    if (!parts.popover || parts.inTopLayer) return;
    callNow(this, 'showPopover');
    parts.inTopLayer = true;
  }

  /** Out of the page's top layer when it is there. */
  private hideFromTopLayer(): void {
    const parts = this.parts;
    if (!parts.inTopLayer) return;
    callNow(this, 'hidePopover');
    parts.inTopLayer = false;
  }

  private renderMode(): void {
    const parts = this.parts;
    const modal = parts.open ? parts.modal : this.modal;
    mark(this, 'data-modal', modal);
    mark(this, 'data-scrim', this.scrim);
    flag(parts.panelPart, 'aria-modal', modal);
  }

  private renderTitle(): void {
    const parts = this.parts;
    const plain = parseAccessKey(this.peekProperty<string>('text') ?? '').text;
    const label = this.peekProperty<string>('label') ?? '';
    parts.hasTitle = !!plain;
    text(parts.titlePart, plain);
    mark(parts.titlePart, 'hidden', !plain);
    put(parts.panelPart, 'aria-labelledby', plain ? parts.titleId : null);
    put(parts.panelPart, 'aria-label', plain ? null : label);
    this.renderHeader();
  }

  private renderHeader(): void {
    const parts = this.parts;
    mark(parts.headerPart, 'hidden', !parts.hasTitle && !parts.close);
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
      // Its variant and size come from its place in the header.
      const button = new Button({ icon: dismissMark() });
      button.class.add(`${(this.constructor as typeof OverlayPanel).overlayClass}__close`);
      button.motif.on('click', () => this.closeBy('button'));
      this.placeIn(button, parts.toolsPart);
      parts.close = button;
      parts.stopLabel = onLanguage(this, () => put(button, 'aria-label', uiLocale.strings.close));
    }
    this.renderHeader();
  }

  /** Children core put at the root (JSX children, `controls.add`) go into the content area. */
  private placeStrays(): void {
    const parts = this.parts;
    for (const control of [...this.controls.items]) {
      // A control moves to the content area as its child; core places it there.
      if (control !== parts.scrimPart && control !== parts.panelPart) parts.bodyPart.controls.add(control);
    }
  }

  /** Adds a control of its own to one of its areas (a component), where core places it. */
  protected placeIn(control: ComponentBase, area: ComponentBase): void {
    area.controls.add(control);
  }

  private unplace(control: ComponentBase | null): void {
    const parent = control?.parent;
    if (!control || !parent) return;
    const parts = this.parts;
    if (parent === this || [parts.toolsPart, parts.bodyPart, parts.footerPart].includes(parent as Component<HTMLDivElement>)) parent.controls.remove(control);
  }

  private placeContent(): void {
    const parts = this.parts;
    const control = this.peekProperty<ComponentBase | null>('content') ?? null;
    if (control === parts.contentControl) return;
    this.unplace(parts.contentControl);
    parts.contentControl = control;
    if (control) this.placeIn(control, parts.bodyPart);
  }

  private placeFooter(): void {
    const parts = this.parts;
    const control = this.peekProperty<ComponentBase | null>('footer') ?? null;
    if (control === parts.footerControl) return;
    this.unplace(parts.footerControl);
    parts.footerControl = control;
    mark(parts.footerPart, 'hidden', !control);
    if (control) this.placeIn(control, parts.footerPart);
  }

  /** Focus on open: `[autofocus]`, the first field, the first control, the panel itself. */
  private focusFirst(): boolean {
    const parts = this.parts;
    const noScroll = { preventScroll: true };
    if (focusFirstIn(parts.bodyPart, 'autofocus', noScroll) || focusFirstIn(parts.footerPart, 'autofocus', noScroll) || focusFirstIn(parts.panelPart, 'autofocus', noScroll)) return true;
    // A finger opening it does not want the on-screen keyboard to come up at once: no field first there.
    const coarse = mediaOf(this, '(pointer: coarse)');
    if (!coarse && (focusFirstIn(parts.bodyPart, 'text', noScroll) || focusFirstIn(parts.bodyPart, 'stop', noScroll))) return true;
    focusOn(parts.panelPart, noScroll);
    return isFocused(parts.panelPart);
  }

  /** Back to where focus was when it opened, else to the window now on top. */
  private giveFocusBack(): void {
    const opener = this.parts.opener;
    this.parts.opener = null;
    if (opener?.restore({ preventScroll: true })) return;
    const below = windowStack.top(windowOf(this))?.part;
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
