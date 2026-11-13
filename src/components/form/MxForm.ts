import { Application, Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { orderControls } from '../../core/order-controls';
import { parseAccessKey } from '../../core/access-key';
import { FocusContainer } from '../../core/container';
import type { Control } from '../../core/control';
import { focusFirstIn, focusInLineField, focusOn, focusedWindow, holdsFocus, isFocused, rememberFocus } from '../../core/focus';
import type { FocusMark } from '../../core/focus-mark';
import { clearParts, loose, part } from '../../core/draw-parts';
import { css, flag, kept, mark, put, text } from '../../core/part-writes';
import { isInPage, isRtl, measure, onLayout, pageOf, rectOf, styleOf, whenMeasured, type Page } from '../../core/measure';
import { dismissMark, maximizeMark, minimizeMark, restoreMark } from '../../core/glyphs';
import { showIcon } from '../../core/show-icon';
import type { IconSource } from '../../core/icon-source';
import { nextId } from '../../core/next-id';
import { uiLocale } from '../../core/ui-locale';
import { windowOf } from '../../core/page-documents';
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
import { onLanguage } from '../../core/on-language';

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

/** The parts and the running state of a form. On one object made on first use: the base constructor already renders. */
interface Parts {
  /** The size of its window's page when last told: the form keeps in view when it changes. */
  page: Page | null;
  iconPart: Component<HTMLSpanElement>;
  releaseIcon: () => void;
  titlePart: Component<HTMLDivElement>;
  /** The title's id, for `aria-labelledby`. */
  titleId: string;
  minimize: Button | null;
  maximize: Button | null;
  close: Button | null;
  stopLabels: (() => void) | null;
  /** The areas as components, children of the form in this order; the tools are a child of the bar. */
  barPart: Component<HTMLDivElement>;
  toolsPart: Component<HTMLDivElement>;
  contentPart: Component<HTMLDivElement>;
  footerPart: Component<HTMLDivElement>;
  framePart: Component<HTMLDivElement>;
  contentControl: ComponentBase | null;
  footerControl: ComponentBase | null;
  /** Where a minimized form leaves its chip: `minimizeTarget`. */
  target: ComponentBase | null;
  entry: StackedWindow;
  open: boolean;
  modal: boolean;
  active: boolean;
  loaded: boolean;
  /** `show` or `showDialog` added it to its host. */
  attached: boolean;
  /** An open waiting for the form to reach the page: modal or not. */
  pending: boolean | null;
  /** Where focus was when it opened, outside it. */
  opener: FocusMark | null;
  /** Counts the opens: what waits for one to be shown runs for the last only. */
  opens: number;
  /** What waits for the browser to close the dialog: focus back, `onClosed`, the waiters. */
  afterClose: (() => void) | null;
  waiters: ((result: FormResult) => void)[];
  closing: boolean;
  /** The open state is being written back to `value`: not a request. */
  syncing: boolean;
  ready: boolean;
  chip: Button | null;
  /** The state a minimized form goes back to. */
  unminimized: 'normal' | 'maximized';
  /** The window state drawn last (`data-state`). */
  state: FormWindowState;
  /** Placed by a move or by `left` and `top` (`data-placed`), else centered. */
  placed: boolean;
  /** The width and the height written last (`--_mx-w`, `--_mx-h`), '' where the content decides. */
  size: { width: string; height: string };
  /** Where focus was last inside it. */
  lastInside: FocusMark | null;
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

/**
 * A window with a title bar (icon, title, minimize, maximize and close buttons), a content area and a
 * row for its buttons, on a native `<dialog>`. The caller decides how it appears: `show(host)` opens it
 * as modeless, so the page stays usable, and `showDialog(host)` opens it as modal and resolves with its
 * result when it closes. Forms can open other forms, and a modal opened from a modal blocks the one
 * below. It moves by its title bar, resizes from its edges and corners, and can be minimized and
 * maximized. Escape and Enter click its `cancelButton` and `acceptButton`. Declared in JSX with
 * `x-model`, it appears while the value is true.
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
    this.observeProperty<number | string>('width', (width) => this.renderSize('width', lengthOf(width) ?? ''));
    this.observeProperty<number | string>('height', (height) => this.renderSize('height', lengthOf(height) ?? ''));
    this.observeProperty('content', () => this.placeContent());
    this.observeProperty('footer', () => this.placeFooter());
    this.observeProperty<ComponentBase | null>('minimizeTarget', (given) => this.takeTarget(given));

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
      parts.releaseIcon();
      parts.stopLabels?.();
      this.removeChip();
      for (const emitter of [parts.load, parts.shown, parts.activate, parts.deactivate, parts.closingEmitter, parts.closed]) emitter.dispose();
    });
  }

  /** The title. This is the same property as `text`. */
  get title(): string {
    return this.text;
  }
  set title(value: Bind<string>) {
    this.text = value;
  }
  /** Indicates whether the form is open. Reactive. Setting it opens the form, as modal with `modal`, or closes it. */
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
  /** Indicates whether Escape closes it now: as set, otherwise on for a modal form and off for a modeless one. */
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
  get minimizeTarget(): ComponentBase | null {
    return this.getProperty<ComponentBase | null | undefined>('minimizeTarget') ?? null;
  }
  set minimizeTarget(value: Bind<ComponentBase | null>) {
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
  /** See the prop. After the user moves the form, this is its position in pixels. */
  get left(): number | string | null {
    return this.getProperty<number | string | undefined>('left') ?? null;
  }
  set left(value: Bind<number | string | null>) {
    this.assignProperty('left', value);
  }
  /** See the prop. After the user moves the form, this is its position in pixels. */
  get top(): number | string | null {
    return this.getProperty<number | string | undefined>('top') ?? null;
  }
  set top(value: Bind<number | string | null>) {
    this.assignProperty('top', value);
  }
  /** See the prop. After the user resizes the form, this is its size in pixels. */
  get width(): number | string | null {
    return this.getProperty<number | string | undefined>('width') ?? null;
  }
  set width(value: Bind<number | string | null>) {
    this.assignProperty('width', value);
  }
  /** See the prop. After the user resizes the form, this is its size in pixels. */
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
  /** Indicates whether it is disposed when it closes: as set, otherwise when `show` or `showDialog` added it. */
  get disposeOnClose(): boolean {
    return this.getProperty<boolean | undefined>('disposeOnClose') ?? this.parts.attached;
  }
  set disposeOnClose(value: Bind<boolean>) {
    this.assignProperty('disposeOnClose', value, Boolean);
  }
  /** How the form closed, or will close. `close()` without an argument uses this value. It is `'cancel'` on open. Reactive. */
  get result(): FormResult {
    return this.getProperty<FormResult | undefined>('result') ?? 'cancel';
  }
  set result(value: Bind<FormResult>) {
    this.assignProperty('result', value);
  }

  /** Indicates whether the form is open. Reactive. */
  get isOpen(): boolean {
    return !!this.getProperty<boolean>('open');
  }
  /** Indicates whether the form is shown as modal. Reactive. */
  get isModal(): boolean {
    return !!this.getProperty<boolean>('isModal');
  }
  /** Indicates whether it is the active (front) window of the page. Reactive. */
  get isActive(): boolean {
    return !!this.getProperty<boolean>('active');
  }

  /** The content area as a component, for code that places components itself: they are added to its controls. */
  get contentPart(): Component<HTMLDivElement> {
    return this.parts.contentPart;
  }

  /** Occurs before the form is first shown, and is where to populate it. */
  get onLoaded(): MotifEvent<FormEventArgs> {
    return this.parts.load.event;
  }
  get onShown(): MotifEvent<FormEventArgs> {
    return this.parts.shown.event;
  }
  /** Occurs when it becomes the active window (shown, clicked, focused). */
  get onActivate(): MotifEvent<FormEventArgs> {
    return this.parts.activate.event;
  }
  get onDeactivate(): MotifEvent<FormEventArgs> {
    return this.parts.deactivate.event;
  }
  /** Occurs before it closes. Set `e.cancel = true` to keep it open, unless its owner is being disposed. */
  get onClosing(): MotifEvent<FormClosingEventArgs> {
    return this.parts.closingEmitter.event;
  }
  get onClosed(): MotifEvent<FormClosedEventArgs> {
    return this.parts.closed.event;
  }

  /**
   * Shows the form as modeless, so the page and other windows stay usable. It is added to `host`
   * (a component or the application) unless it is already placed, and it is disposed with
   * `disposeRef`, or with the host, even while open. If it is already shown, it moves to the front.
   * The browser shows it after this call returns: code that needs it on screen, such as moving focus into
   * it, belongs in `onShown`, which occurs in the window's next frame.
   */
  show(host: FormHost, disposeRef?: ComponentBase): void {
    this.request(host, disposeRef, false);
  }

  /**
   * Shows the form as modal, so nothing else on the page can be used until it closes. Resolves with
   * its result (`'ok'`, `'cancel'` or a custom word) when it closes. As with `show`, the browser shows
   * it after this call returns, and `onShown` occurs in the window's next frame.
   */
  showDialog(host: FormHost, disposeRef?: ComponentBase): Promise<FormResult> {
    const done = new Promise<FormResult>((resolve) => this.parts.waiters.push(resolve));
    this.request(host, disposeRef, true);
    return done;
  }

  /**
   * Closes the form with `result`, or with its current `result`. A form that `show` or `showDialog` added to
   * its host is disposed, and one declared in JSX is hidden. Returns `false` if an `onClosing` listener kept it open.
   * The browser closes it after this call returns; once it has (its `close` event, at the latest the window's next
   * frame), focus goes back, `onClosed` occurs and `showDialog` resolves. Until then a modal form still blocks the
   * page, so focus moved elsewhere after closing belongs in `onClosed`.
   */
  close(result?: FormResult): boolean {
    return this.closeWith(result, 'code');
  }

  /** Brings the form to the front with focus on its last active control. */
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

  /** Restores the form from minimized, to its previous state, or from maximized. */
  restore(): void {
    this.windowState = this.windowState === 'minimized' ? this.parts.unminimized : 'normal';
  }

  /** Centers the form in the viewport. */
  center(): void {
    this.renderPlaced(false);
  }

  override restoreFocus(): boolean {
    if (!this.parts.lastInside?.isIn(this)) return this.focusFirst();
    return super.restoreFocus() || this.focusFirst();
  }

  /** A window is a root: the controls around it do not disable it, and it handles Tab itself. */
  override get isWindow(): boolean {
    return true;
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
    }
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.class.add('mx-form');
    put(this, 'role', 'dialog');
    put(this, 'tabindex', '-1');
    put(this, 'data-state', 'normal');

    const barPart = loose<HTMLDivElement>('div', 'mx-form__bar');
    const iconPart = part<HTMLSpanElement>(barPart, 'span', 'mx-form__icon');
    iconPart.attr.add({ 'aria-hidden': 'true' });
    kept(iconPart, false);
    // A heading by role, not an <h2>: the page's own heading styles stay out of the title bar.
    const titlePart = part<HTMLDivElement>(barPart, 'div', 'mx-form__title');
    const titleId = nextId('form-title');
    titlePart.attr.add({ role: 'heading', 'aria-level': '2', id: titleId });
    const toolsPart = part<HTMLDivElement>(barPart, 'div', 'mx-form__tools');

    const contentPart = loose<HTMLDivElement>('div', 'mx-form__content');
    const footerPart = loose<HTMLDivElement>('div', 'mx-form__footer');
    kept(footerPart, false);
    const { frame: framePart, handles } = resizeFrame('mx-form__frame', 'mx-form__resize');
    // A press on a handle resizes the form from that side or corner.
    for (const [edge, handle] of handles) handle.motif.on('pointerdown', (_, e) => this.resizePointerDown(handle, edge, e));
    this.controls.add(barPart, contentPart, footerPart, framePart);

    const self = this;
    const parts: Parts = {
      iconPart,
      releaseIcon: () => {},
      titlePart,
      titleId,
      minimize: null,
      maximize: null,
      close: null,
      stopLabels: null,
      barPart,
      toolsPart,
      contentPart,
      footerPart,
      framePart,
      contentControl: null,
      footerControl: null,
      target: null,
      entry: {
        part: this,
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
      opens: 0,
      afterClose: null,
      waiters: [],
      closing: false,
      syncing: false,
      ready: false,
      chip: null,
      unminimized: 'normal',
      state: 'normal',
      placed: false,
      size: { width: '', height: '' },
      lastInside: null,
      lives: new WeakSet(),
      load: new Emitter(),
      shown: new Emitter(),
      activate: new Emitter(),
      deactivate: new Emitter(),
      closingEmitter: new Emitter(),
      page: null,
      closed: new Emitter(),
    };
    return parts;
  }

  private listen(): void {
    const el = this.element;
    const parts = this.parts;
    this.motif.on('keydown', (_, e) => this.keyDown(e));
    this.motif.on('pointerdown:capture', () => parts.open && windowStack.bringToFront(parts.entry));
    this.motif.on('focusin', (_, e) => this.focusIn(e));
    this.motif.on('cancel', (_, e) => {
      e.preventDefault();
      if (parts.open) this.escape();
    });
    this.motif.on('close', () => {
      // Closed by the browser, not by close(): follow it. Closed by close(): what waited for it runs now.
      // browser object read: allowed exception
      if (parts.open) this.finishClose(el.returnValue || 'cancel', 'user', true);
      else this.closeDone();
    });
    // The page of its window changes size: an open form stays in view.
    onLayout(this, 'page', () => measure(this, this.readPlace, this.keepInView));
    parts.barPart.motif.on('pointerdown', (_, e) => this.barPointerDown(e));
    // A click on the title bar keeps focus where it is (barPointerDown gives it back).
    parts.barPart.motif.on('mousedown', (_, e) => {
      if (!this.fromTool(e)) e.preventDefault();
    });
    parts.barPart.motif.on('dblclick', (_, e) => {
      if (this.fromTool(e) || !this.showMaximize) return;
      this.windowState = this.windowState === 'maximized' ? 'normal' : 'maximized';
    });
    for (const type of CONTAINED) this.motif.on(type as 'click', (_, e) => e.stopPropagation());
    // A control added later goes to the content area once core is done adding it: core would undo a move made sooner.
    this.motif.on('controladded', () => queueMicrotask(() => !this.isDisposed && this.placeStrays()), false);
  }

  /** Children core put at the root (JSX children, `view()`, `controls.add`) go to their area. */
  private placeStrays(): void {
    const parts = this.parts;
    const own: ComponentBase[] = [parts.barPart, parts.contentPart, parts.footerPart, parts.framePart];
    const strays = this.controls.items.filter((c) => !own.includes(c));
    if (!strays.length) return;
    const focus = rememberFocus();
    // A control moves to the content area as its child; core places it there.
    for (const control of strays) parts.contentPart.controls.add(control);
    if (focus?.isIn(this)) focus.restore({ preventScroll: true });
  }

  /** Whether an event started on one of the title bar's buttons. */
  private fromTool(e: Event): boolean {
    const parts = this.parts;
    return [parts.minimize, parts.maximize, parts.close].some((button) => !!button?.motif.isEventFrom(e));
  }

  /** Adds a control of the form's own to an area. */
  private placeIn(control: ComponentBase, area: ComponentBase): void {
    area.controls.add(control);
  }

  private unplace(control: ComponentBase | null): void {
    const parent = control?.parent;
    if (!control || !parent) return;
    const parts = this.parts;
    if (parent === this || [parts.toolsPart, parts.contentPart, parts.footerPart].includes(parent as Component<HTMLDivElement>)) parent.controls.remove(control);
  }

  private placeContent(): void {
    const parts = this.parts;
    const control = this.peekProperty<ComponentBase | null>('content') ?? null;
    if (control === parts.contentControl) return;
    this.unplace(parts.contentControl);
    parts.contentControl = control;
    if (control) this.placeIn(control, parts.contentPart);
  }

  private placeFooter(): void {
    const parts = this.parts;
    const control = this.peekProperty<ComponentBase | null>('footer') ?? null;
    if (control === parts.footerControl) return;
    this.unplace(parts.footerControl);
    parts.footerControl = control;
    kept(parts.footerPart, !!control);
    if (control) this.placeIn(control, parts.footerPart);
  }

  private renderTitle(title: string): void {
    const parts = this.parts;
    const plain = parseAccessKey(title ?? '').text;
    text(parts.titlePart, plain);
    put(this, 'aria-labelledby', plain ? parts.titleId : null);
    kept(parts.titlePart, !!plain);
  }

  private renderIcon(): void {
    const parts = this.parts;
    const icon = this.peekProperty<IconSource | null>('icon');
    parts.releaseIcon();
    parts.releaseIcon = () => {};
    kept(parts.iconPart, !!icon);
    clearParts(parts.iconPart);
    if (icon) parts.releaseIcon = showIcon(icon, parts.iconPart);
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
    parts.close?.class.add('mx-form__close');
    this.orderTools();
    this.renderToolLook();
    if (!parts.stopLabels && (parts.minimize || parts.maximize || parts.close)) {
      parts.stopLabels = onLanguage(this, () => {
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
    // Variant and size come from the title bar's places (tool-button, close-button).
    const button = new Button();
    button.class.add('mx-form__tool');
    button.motif.on('click', () => click());
    this.placeIn(button, this.parts.toolsPart);
    return button;
  }

  private orderTools(): void {
    const parts = this.parts;
    orderControls(parts.toolsPart, [parts.minimize, parts.maximize, parts.close].filter((b): b is Button => !!b));
  }

  private labelTools(minimize: string, maximize: string, restore: string, close: string): void {
    const parts = this.parts;
    const state = this.peekProperty<FormWindowState>('windowState') ?? 'normal';
    if (parts.minimize) put(parts.minimize, 'aria-label', state === 'minimized' ? restore : minimize);
    if (parts.maximize) put(parts.maximize, 'aria-label', state === 'maximized' ? restore : maximize);
    if (parts.close) put(parts.close, 'aria-label', close);
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
    mark(this, 'data-resizable', this.peekProperty<boolean>('resizable') ?? true);
    mark(this, 'data-movable', this.peekProperty<boolean>('movable') ?? true);
  }

  private renderMode(): void {
    const parts = this.parts;
    put(this, 'role', this.peekProperty('alert') ? 'alertdialog' : 'dialog');
    mark(this, 'data-modal', parts.modal);
    flag(this, 'aria-modal', parts.modal);
  }

  /** Writes the width or the height (`--_mx-w`, `--_mx-h`) and keeps it; '' leaves it to the content. */
  private renderSize(side: 'width' | 'height', length: string): void {
    css(this, side === 'width' ? '--_mx-w' : '--_mx-h', length);
    this.parts.size[side] = length;
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
    const before = parts.state;
    if (state !== 'minimized') parts.unminimized = state;
    const hadFocus = holdsFocus(this);
    const bodyFocus = holdsFocus(parts.contentPart) || holdsFocus(parts.footerPart);
    const docked = state === 'minimized' && !!this.minimizeTarget && parts.open;
    parts.state = state;
    put(this, 'data-state', state);
    mark(this, 'data-docked', docked);
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
      if (bodyFocus && !parts.minimize?.focus()) focusOn(this);
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
    const target = parts.target;
    if (!target) return;
    // Its variant and size come from its place (window.chip).
    const chip = new Button({
      // A literal title: an & in it is not an access key here.
      text: () => parseAccessKey(this.text).text.replace(/&/g, '&&'),
      icon: () => {
        const icon = this.icon;
        return typeof icon === 'string' ? icon : null;
      },
    });
    chip.class.add('mx-form-chip');
    chip.motif.on('click', () => this.restore());
    target.controls.add(chip);
    parts.chip = chip;
  }

  /** Keeps `minimizeTarget`, the component a minimized form leaves its chip in. */
  private takeTarget(given: ComponentBase | null | undefined): void {
    const parts = this.parts;
    parts.target = given ?? null;
    if (parts.open && this.windowState === 'minimized') this.renderState(false);
  }

  private removeChip(): void {
    const parts = this.parts;
    const chip = parts.chip;
    if (!chip) return;
    parts.chip = null;
    const parent = chip.parent;
    if (parent) parent.controls.remove(chip);
    else void chip.dispose();
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
    if (isInPage(this)) this.openNow(modal);
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
    // A form shown from a form moves into its content area first: moving a shown dialog would undo showModal().
    let holder = this.parent;
    while (holder && !(holder instanceof MxForm)) holder = holder.parent;
    if (holder instanceof MxForm) holder.placeStrays();
    const focus = rememberFocus();
    parts.opener = focus && !focus.isIn(this) ? focus : null;
    parts.modal = modal;
    parts.open = true;
    parts.lastInside = null;
    // A close still waiting for the browser ends first; the form stays, being open again.
    this.closeDone();
    this.setProperty('result', 'cancel');
    this.renderMode();
    this.renderTools();
    // Core calls the dialog's method later: what needs it open waits for the window's next frame (afterOpen).
    this.attr.add(modal ? { showModal: true } : { show: true });
    this.setProperty('isModal', modal);
    this.setProperty('open', true);
    if (!this.peekProperty('value')) this.bindings.writeModel(true);
    this.syncProperty('value', true);
    if (this.startPosition === 'manual') this.placeAtProps();
    else this.center();
    const open = ++parts.opens;
    void whenMeasured(this).then(() => open === parts.opens && this.afterOpen());
  }

  /** The dialog is open: its state is drawn, focus goes in and the app hears it. */
  private afterOpen(): void {
    if (this.isDisposed || !this.parts.open) return;
    this.renderState(true);
    if (this.windowState !== 'minimized' || !this.minimizeTarget) this.focusFirst();
    this.parts.shown.fire({ source: this });
  }

  /** Focus on open: `[autofocus]`, the first field, the accept button, the first control, the form itself. */
  private focusFirst(): boolean {
    const parts = this.parts;
    if (focusFirstIn(parts.contentPart, 'autofocus') || focusFirstIn(parts.footerPart, 'autofocus')) return true;
    if (focusFirstIn(parts.contentPart, 'field') || this.acceptButton?.focus()) return true;
    if (focusFirstIn(parts.contentPart, 'stop') || focusFirstIn(parts.footerPart, 'stop')) return true;
    focusOn(this);
    return isFocused(this);
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

  /** `closed`: the browser closed the dialog itself already. */
  private finishClose(result: FormResult, reason: FormCloseReason, closed = false): void {
    const parts = this.parts;
    const opener = parts.opener;
    const waiters = parts.waiters.splice(0);
    parts.opener = null;
    parts.open = false;
    this.removeChip();
    windowStack.remove(parts.entry);
    this.attr.add({ close: result || true });
    this.setProperty('result', result);
    this.setProperty('open', false);
    this.setProperty('isModal', false);
    this.syncProperty('value', false);
    if (reason !== 'owner') this.bindings.writeModel(false);
    const done = () => {
      // Focus still in the form, or nowhere, goes back to where it was.
      const focus = rememberFocus();
      if (!focus || focus.isIn(this)) this.returnFocus(opener);
      parts.closed.fire({ result, reason, source: this });
      for (const resolve of waiters) resolve(result);
      if (reason !== 'owner' && !parts.open && this.disposeOnClose && !this.isDisposed) void this.dispose();
    };
    // One being disposed is out of the page already; one the browser closed has no close left to wait for.
    if (reason === 'owner' || closed) {
      done();
      return;
    }
    // Core closes the dialog later, and focus leaves a modal one only then: the rest waits for its close event, or for
    // the window's next frame, after core's calls, where the browser fired none (a dialog it never showed).
    parts.afterClose = done;
    void whenMeasured(this).then(() => parts.afterClose === done && this.closeDone());
  }

  /** Runs what waited for the browser to close the dialog, once. */
  private closeDone(): void {
    const parts = this.parts;
    const done = parts.afterClose;
    parts.afterClose = null;
    done?.();
  }

  /** Back to where focus was when the form opened, else to the window now on top. */
  private returnFocus(opener: FocusMark | null): void {
    if (opener?.restore()) return;
    const below = windowStack.top(windowOf(this))?.part;
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
    mark(this, 'data-active', active);
    this.setProperty('active', active);
    (active ? parts.activate : parts.deactivate).fire({ source: this });
  }

  private focusIn(e: FocusEvent): void {
    const parts = this.parts;
    if (!parts.open) return;
    // Focus in a window opened inside it is that window's.
    if (focusedWindow(e) !== this) return;
    windowStack.bringToFront(parts.entry);
    if (!isFocused(this)) {
      parts.lastInside = rememberFocus(e);
      return;
    }
    // A click on an empty spot: focus stays with the control that had it.
    const last = parts.lastInside;
    if (last?.isIn(this)) last.restore({ preventScroll: true });
  }

  private keyDown(e: KeyboardEvent): void {
    const parts = this.parts;
    if (!parts.open || e.defaultPrevented || e.isComposing) return;
    if (focusedWindow(e) !== this) return;
    if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      // Also keeps the browser from closing a modal dialog by itself.
      if (parts.modal) e.preventDefault();
      if (this.escape()) e.preventDefault();
    } else if (e.key === 'Enter' && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      // Enter in a one-line field of the content area, not on a button or in multi-line text.
      const accept = this.acceptButton;
      if (accept && focusInLineField(e) && holdsFocus(parts.contentPart, e) && press(accept)) e.preventDefault();
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

  /** Where the form is, from the start edge of the viewport of its window, whose page is `page`. */
  private box(page: Page): WindowBox {
    const r = rectOf(this);
    const x = isRtl(this) ? page.width - r.right : r.left;
    return { x, y: r.top, w: r.width, h: r.height };
  }

  /** Where the form is, with the page of its window. */
  private readonly readPlace = (): { box: WindowBox; page: Page } => {
    const page = pageOf(this);
    return { box: this.box(page), page };
  };

  private readonly readBox = (): WindowBox => this.box(pageOf(this));

  /** Puts the form, `w` by `h`, at `x` and `y`, inside `page`. */
  private placeAt(x: number, y: number, w: number, h: number, page: Page): void {
    css(this, '--_mx-x', `${Math.round(Math.min(Math.max(0, x), Math.max(0, page.width - w)))}px`);
    css(this, '--_mx-y', `${Math.round(Math.min(Math.max(0, y), Math.max(0, page.height - h)))}px`);
    this.renderPlaced(true);
  }

  private placeAtProps(): void {
    css(this, '--_mx-x', lengthOf(this.peekProperty<number | string>('left')) ?? '0px');
    css(this, '--_mx-y', lengthOf(this.peekProperty<number | string>('top')) ?? '0px');
    this.renderPlaced(true);
  }

  /** Placed by a move or by `left` and `top` (`data-placed`), else centered. */
  private renderPlaced(placed: boolean): void {
    this.parts.placed = placed;
    mark(this, 'data-placed', placed);
  }

  private readonly keepInView = ({ box, page }: { box: WindowBox; page: Page }): void => {
    const parts = this.parts;
    const last = parts.page;
    parts.page = page;
    // The first page told is the one it came into: only a change of its size moves the form.
    if (!last || (last.width === page.width && last.height === page.height)) return;
    if (!parts.open || !parts.placed || this.windowState === 'maximized') return;
    this.placeAt(box.x, box.y, box.w, box.h, page);
  };

  private barPointerDown(e: PointerEvent): void {
    const parts = this.parts;
    if (e.button !== 0 || !parts.open || this.fromTool(e)) return;
    // Read before anything is written: where the form is when the move starts.
    const start = this.movable && this.windowState !== 'maximized' ? this.readPlace() : null;
    const sign = start && isRtl(this) ? -1 : 1;
    // No text selection while dragging, and focus goes back to the last active control.
    e.preventDefault();
    windowStack.bringToFront(parts.entry);
    if (!this.focusWithin || isFocused(this)) this.restoreFocus();
    if (!start) return;
    const { box, page } = start;
    this.drag(parts.barPart, e, (dx, dy) => this.placeAt(box.x + sign * dx, box.y + dy, box.w, box.h, page));
  }

  /** A press on the handle of `edge`: the form follows the pointer from that side or corner. */
  private resizePointerDown(handle: ComponentBase, edge: WindowEdge, e: PointerEvent): void {
    if (e.button !== 0 || !this.parts.open || !this.resizable || this.windowState !== 'normal') return;
    // Read before anything is written: where the form is, how small it may get, which way it reads.
    const { box: start, page } = this.readPlace();
    const style = styleOf(this, ['min-inline-size', 'min-width', 'min-block-size', 'min-height']);
    const min = { w: parseFloat(style['min-inline-size'] || style['min-width']) || 0, h: parseFloat(style['min-block-size'] || style['min-height']) || 0 };
    const room = { w: page.width, h: page.height };
    const sign = isRtl(this) ? -1 : 1;
    e.preventDefault();
    windowStack.bringToFront(this.parts.entry);
    this.placeAt(start.x, start.y, start.w, start.h, page);
    this.drag(handle, e, (dx, dy) => {
      const { x, y, w, h } = resizeBox(edge, start, sign * dx, dy, min, room);
      this.renderSize('width', `${Math.round(w)}px`);
      this.renderSize('height', `${Math.round(h)}px`);
      this.placeAt(x, y, w, h, page);
    });
  }

  /** Follows the pointer from `e` until it is released, then keeps the new place and size. */
  private drag(on: ComponentBase, e: PointerEvent, move: (dx: number, dy: number) => void): void {
    mark(this, 'data-dragging', true);
    followPointer(on, e, move, () => {
      mark(this, 'data-dragging', false);
      measure(this, this.readBox, this.keepGeometry);
    });
  }

  /** After a move or a resize, the props say where the form is and how big. */
  private readonly keepGeometry = (b: WindowBox): void => {
    const size = this.parts.size;
    this.syncProperty('left', Math.round(b.x));
    this.syncProperty('top', Math.round(b.y));
    if (size.width.endsWith('px')) this.syncProperty('width', Math.round(b.w));
    if (size.height.endsWith('px')) this.syncProperty('height', Math.round(b.h));
  };
}

/** Clicks a button the way the user would, without moving focus (core clicks it after this call). */
function press(control: Control): boolean {
  if (!control.isEnabled || !inPlace(control)) return false;
  // A button with a menu is pressed on its main part.
  const face = control instanceof Button ? control.faceComponent : control;
  face.attr.add({ click: true });
  return true;
}

/** Built and not taken out, and it and every component above it shown (core's `isVisible`). */
function inPlace(component: ComponentBase): boolean {
  if (!component.isBuilt || component.isDisposed) return false;
  for (let c: ComponentBase | null = component; c; c = c.parent) if (!c.isVisible) return false;
  return true;
}
