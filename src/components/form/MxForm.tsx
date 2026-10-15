import { Application, ComponentBase, reactive, read, untracked, type Bind, type IBaseProp } from '@motifx/core';
import { FocusContainer } from '../../core/container';
import { type ControlProps } from '../../core/control';
import { toFormResult, type CloseReason, type FormResult } from '../../core/form-result';
import { deepActiveElement, focusInitial } from '../../core/focus';
import { nextId } from '../../core/id';
import { lockScroll } from '../../core/scroll-lock';
import { windowStack, type StackedWindow } from '../../core/window-stack';
import { FormWindow } from './FormWindow';

type StackEntry = StackedWindow & { readonly form: MxForm };

/** How a form's window is shown. */
export type WindowState = 'normal' | 'maximized' | 'minimized';

/** Where the form currently lives: inline in a page, or in its own floating window. */
export type FormHostKind = 'embedded' | 'window';

/** Argument of `onClosing`: set `cancel = true` to keep the form open (ignored when the reason is `'owner'`). */
export interface FormClosingEventArgs {
  readonly form: MxForm;
  readonly reason: CloseReason;
  /** The result the form will close with; a handler may change it. */
  result: FormResult;
  cancel: boolean;
}

/** Argument of `onClosed`. */
export interface FormClosedEventArgs {
  readonly form: MxForm;
  readonly reason: CloseReason;
  readonly result: FormResult;
}

/** Props of {@link MxForm}: the shared {@link ControlProps} plus the form's own. */
export interface MxFormProps extends ControlProps {
  /** Caption text in the title bar; also the window's accessible name. */
  text?: Bind<string>;
  /** Caption close button. Default `true`. */
  showClose?: Bind<boolean>;
  /** Caption maximize/restore button. Default `false`. */
  showMaximize?: Bind<boolean>;
  /** Caption minimize button. Default `false`. Never on a modal form: the page behind it stays blocked, so there is nothing to minimize to. */
  showMinimize?: Bind<boolean>;
  /** A floating window can be resized from its edges. Default `true`. */
  resizable?: Bind<boolean>;
  /**
   * Where a minimized window goes (a taskbar-like area). Without it,
   * minimizing collapses the window to its title bar in place.
   */
  minimizeTarget?: Bind<ComponentBase | null | undefined>;
  /**
   * Escape closes the form with `'cancel'` when there is no `cancelButton`.
   * Default: `true` for a modal form (as a native modal `<dialog>` does),
   * `false` for a modeless window.
   */
  closeOnEscape?: Bind<boolean>;
  /**
   * With JSX `x-model`: open as a modal dialog instead of a modeless window.
   * Read once, when the form is first shown.
   */
  modal?: boolean;
  /**
   * Content when the form is not subclassed: JSX, a component, or a factory
   * returning either. JSX children work the same way. A subclass fills the
   * content area from its own `view()` instead.
   */
  content?: unknown;
  /** Clicked when Enter is pressed outside multi-line fields and buttons (the form's default button, as in HTML forms). */
  defaultButton?: Bind<ComponentBase | null | undefined>;
  /** Clicked when Escape is pressed. */
  cancelButton?: Bind<ComponentBase | null | undefined>;
  /** After the form became visible and took focus. */
  onShown?: (form: MxForm) => void;
  /** Before closing; may be async (ask "save changes?" with another form) and may cancel. */
  onClosing?: (e: FormClosingEventArgs) => void | Promise<void>;
  /** After the form closed (and before it is disposed, when it is). */
  onClosed?: (e: FormClosedEventArgs) => void;
}

// Overridable hooks for subclasses. Declared through interface merging, not as
// bodiless class members, because the compiler's babel pass rejects those.
export interface MxForm<TProps extends MxFormProps = MxFormProps> {
  /** Subclass hook: runs before the `onShown` prop. */
  onShown?(): void;
  /** Subclass hook: runs before the `onClosing` prop, may be async and may cancel. */
  onClosing?(e: FormClosingEventArgs): void | Promise<void>;
  /** Subclass hook: runs before the `onClosed` prop. */
  onClosed?(e: FormClosedEventArgs): void;
}

/** The current floating presentation of a form. */
interface Presentation {
  win: FormWindow;
  /** Created from JSX `x-model`: closing hides the window, the form lives on with its parent. */
  persistent: boolean;
  /** Components whose dispose ends the form, with their unsubscribe functions. */
  unbind: (() => void)[];
}

/**
 * A form: title bar, caption buttons and a content area, with one behaviour
 * wherever it is shown. It is an object you create and show when needed; it
 * does not have to be declared in a template beforehand.
 *
 * - `form.show(host, disposeRef?)` opens it as a modeless floating window.
 * - `form.showDialog(host, disposeRef?)` opens it modal (nothing else on the
 *   page can be used until it closes) and resolves with its {@link FormResult}.
 * - In JSX with `x-model={() => state.open}` it opens and closes with the state,
 *   and writes `false` back when the user closes it (two-way). `modal` picks
 *   dialog or window. It lives as long as its parent and keeps its state
 *   between openings.
 * - In JSX without `x-model` it is embedded in the page like any component.
 *
 * `host` is where the window is added: any component, or the `Application`
 * (then the app's root component). A form opened with `show`/`showDialog`
 * dies when it closes, and also when `host` or `disposeRef` is disposed while
 * it is still open. Events inside the window bubble as usual up to the
 * window's root and stop there.
 *
 * Content: subclass it and write `view()` (it fills the content area, the
 * frame stays), or pass `content` / JSX children.
 *
 * @example
 * class CustomerForm extends MxForm {
 *   view() {
 *     return <>
 *       <input name="name" autofocus />
 *       <footer>
 *         <Button data-result="cancel" variant="ghost">Cancel</Button>
 *         <Button data-result="ok" tone="accent">Save</Button>
 *       </footer>
 *     </>;
 *   }
 * }
 * const result = await new CustomerForm({ text: 'Customer' }).showDialog(this);
 *
 * // or bound to state:
 * <CustomerForm text="Customer" modal x-model={() => this.state.editing} />
 */
export class MxForm<TProps extends MxFormProps = MxFormProps> extends FocusContainer<HTMLDivElement, TProps> {
  /** Id of the caption heading; the window's `aria-labelledby` points here. */
  readonly titleId = nextId('form-title');

  /** The result the form closes with when no other is given; after closing, the one it closed with. */
  result: FormResult = 'none';

  private readonly formState = reactive({
    windowState: 'normal' as WindowState,
    host: 'embedded' as FormHostKind,
    active: false,
    open: false,
    modal: false,
  });

  private contentView: (() => unknown) | null = null;
  private presentation: Presentation | null = null;
  private opener: HTMLElement | null = null;
  private unlockScroll: (() => void) | null = null;
  private resolveDialog: ((result: FormResult) => void) | null = null;
  private dialogPromise: Promise<FormResult> | null = null;
  private closing = false;
  /** A non-persistent form that closed: it is (being) disposed and cannot be shown again. */
  private finished = false;
  /** Last value written by `x-model`, applied once the window exists. */
  private modelOpen = false;

  // This form's entry in the page-wide window order. `element` is a getter
  // because the entry exists before any window does.
  private readonly stackEntry: StackEntry = {
    form: this as MxForm,
    get element(): HTMLElement {
      return this.form.presentation!.win.element;
    },
    setActive: (active: boolean) => {
      this.formState.active = active;
    },
  };

  constructor(props?: IBaseProp<TProps>) {
    super('div', props);
    // A subclass's view() is the content, not the whole form: keep it aside
    // and let the frame view below call it inside the content area.
    const own = this.view;
    if (own && own !== MxForm.prototype.view) {
      this.contentView = own;
      this.view = MxForm.prototype.view;
    }
  }

  /** How the window is shown: `normal`, `maximized` or `minimized`. Reactive. */
  get windowState(): WindowState {
    return this.formState.windowState;
  }

  set windowState(value: WindowState) {
    this.setWindowState(value);
  }

  /** Whether this is the active (front-most) window. Reactive. */
  get isActive(): boolean {
    return this.formState.active;
  }

  /** Whether the form is currently shown as a window. Reactive. */
  get isOpen(): boolean {
    return this.formState.open;
  }

  /** `'window'` once shown as a window, `'embedded'` otherwise. Reactive. */
  get hostKind(): FormHostKind {
    return this.formState.host;
  }

  private acceptOverride: ComponentBase | null = null;
  private cancelOverride: ComponentBase | null = null;

  /**
   * Clicked on Enter. Assign it from a subclass's view:
   * `<Button ref={(b) => (this.defaultButton = b)}>`; falls back to the prop.
   */
  get defaultButton(): ComponentBase | null {
    return this.acceptOverride ?? read(this.props.defaultButton) ?? null;
  }

  set defaultButton(button: ComponentBase | null) {
    this.acceptOverride = button;
  }

  /** Clicked on Escape; assignable like {@link defaultButton}. */
  get cancelButton(): ComponentBase | null {
    return this.cancelOverride ?? read(this.props.cancelButton) ?? null;
  }

  set cancelButton(button: ComponentBase | null) {
    this.cancelOverride = button;
  }

  /**
   * In a modal window Tab wraps around inside the form: nothing else can be
   * used anyway. A modeless window lets Tab move on to the page, as the web's
   * non-modal dialogs do.
   */
  protected override get cyclesTab(): boolean {
    return this.formState.host === 'window' && this.formState.modal;
  }

  /** Whether the current presentation is modal. Reactive. */
  get isModal(): boolean {
    return this.formState.modal;
  }

  /**
   * The `x-model` target: whether the form is shown. Core writes the bound
   * state here; closing the form writes `false` back through the binding.
   */
  get value(): boolean {
    return this.formState.open;
  }

  set value(open: boolean) {
    this.modelOpen = !!open;
    // Runs inside the binding's effect: read the form's own state untracked,
    // or the binding would re-run on every open/close of the form itself.
    untracked(() => {
      const p = this.presentation;
      if (!p?.persistent) return; // applied in onMounted, once the window exists
      if (this.modelOpen && !this.formState.open) p.win.open();
      else if (!this.modelOpen && this.formState.open && !this.closing) void this.close('none');
    });
  }

  override onConfigured(): void {
    this.class.add('mx-form');
    this.attr.add({
      'data-host': () => this.formState.host,
      'data-window-state': () => this.formState.windowState,
      // Embedded, the form is a labelled region; in a window the <dialog> carries the role.
      role: () => (this.formState.host === 'embedded' ? 'region' : null),
      'aria-labelledby': () => (this.formState.host === 'embedded' ? this.titleId : null),
    });

    this.motif.on('keydown', (_s, e: KeyboardEvent) => this.onKey(e));
    this.motif.on('click', (_s, e: MouseEvent) => this.onResultClick(e));
    this.motif.on('focusin', (_s, e: FocusEvent) => {
      if ((e.target as Element | null)?.closest?.('.mx-form') === this.element) this.activate();
    });
  }

  override onMounted(): void {
    // Written in JSX with x-model: wrap in a window that stays in the parent's
    // tree, closed until the bound state opens it.
    if (this.presentation || !this.hasModel) return;
    const parent = this.parent;
    if (!parent) return;
    const index = parent.controls.items.indexOf(this);
    const attach = (w: FormWindow) => parent.controls.add(w);
    const win = new FormWindow(this as MxForm, this.props.modal === true, attach, false);
    win.controls.add(this);
    // E.g. the minimize target it is docked in goes away.
    win.motif.on('x:disposing', () => this.ownerClosing(false));
    parent.controls.insert(index, win);
    this.presentation = { win, persistent: true, unbind: this.bindOwners([parent]) };
    this.formState.host = 'window';
    this.formState.modal = win.modal;
    if (this.modelOpen) win.open();
  }

  override view() {
    return (
      <>
        <div
          class="mx-form__titlebar"
          data-part="titlebar"
          onpointerdown={(e: PointerEvent) => this.onTitlePointerDown(e)}
          onmousedown={(e: MouseEvent) => e.preventDefault()}
          onpointermove={(e: PointerEvent) => this.presentation?.win.track(e)}
          onpointerup={(e: PointerEvent) => this.presentation?.win.end(e)}
          onpointercancel={(e: PointerEvent) => this.presentation?.win.end(e)}
          ondblclick={(e: MouseEvent) => this.onTitleDoubleClick(e)}
        >
          <h2 class="mx-form__title" id={this.titleId}>
            {() => this.text}
          </h2>
          <div class="mx-form__caption" data-part="caption-buttons">
            <button
              type="button"
              class="mx-form__caption-button"
              data-action={() => (this.formState.windowState === 'minimized' ? 'restore' : 'minimize')}
              aria-label={() =>
                this.formState.windowState === 'minimized' ? this.strings.restore : this.strings.minimize
              }
              x-display={() => read(this.props.showMinimize) === true && !this.formState.modal}
              onclick={() => this.toggleWindowState('minimized')}
            ></button>
            <button
              type="button"
              class="mx-form__caption-button"
              data-action={() => (this.formState.windowState === 'maximized' ? 'restore' : 'maximize')}
              aria-label={() =>
                this.formState.windowState === 'maximized' ? this.strings.restore : this.strings.maximize
              }
              x-display={() => read(this.props.showMaximize) === true}
              onclick={() => this.toggleWindowState('maximized')}
            ></button>
            <button
              type="button"
              class="mx-form__caption-button"
              data-action="close"
              aria-label={() => this.strings.close}
              x-display={() => read(this.props.showClose) !== false}
              onclick={() => void this.close('cancel', 'user')}
            ></button>
          </div>
        </div>
        <div class="mx-form__body" data-part="body">
          {this.renderContent()}
        </div>
      </>
    );
  }

  // ---- showing ------------------------------------------------------------

  /**
   * Opens the form as a modeless floating window, added to `host` (a component,
   * or the `Application` = its root component). The form dies when it closes,
   * or when `host` or `disposeRef` is disposed while it is open. Calling it
   * again on an open form brings it to the front.
   */
  show(host: ComponentBase | Application, disposeRef?: ComponentBase): this {
    this.present(host, disposeRef, false);
    return this;
  }

  /**
   * Opens the form modal: until it closes nothing else on the page can be used.
   * Resolves with the {@link FormResult} it closed with (`'none'` when its
   * owner was disposed first).
   */
  showDialog(host: ComponentBase | Application, disposeRef?: ComponentBase): Promise<FormResult> {
    if (this.dialogPromise) return this.dialogPromise;
    if (this.presentation) throw new Error('MxForm: a form already shown modeless cannot be shown as a modal dialog.');
    this.dialogPromise = new Promise<FormResult>((resolve) => (this.resolveDialog = resolve));
    this.present(host, disposeRef, true);
    return this.dialogPromise;
  }

  private present(host: ComponentBase | Application, disposeRef: ComponentBase | undefined, modal: boolean): void {
    if (this.isDisposed || this.finished) throw new Error('MxForm: a closed form cannot be shown again; create a new one.');
    if (this.presentation?.persistent) throw new Error('MxForm: this form is bound with x-model; set the bound state to open it.');
    if (this.presentation) {
      this.activate();
      return;
    }
    this.opener = deepActiveElement();
    const attach = (w: FormWindow) => (host instanceof Application ? host.insert(w) : host.controls.add(w));
    const win = new FormWindow(this as MxForm, modal, attach);
    win.controls.add(this);
    // Any dispose of the window itself (its host going away included) is an owner close.
    win.motif.on('x:disposing', () => this.ownerClosing(false));
    const owners = [host instanceof Application ? null : host, disposeRef].filter(
      (c, i, all): c is ComponentBase => !!c && all.indexOf(c) === i,
    );
    this.presentation = { win, persistent: false, unbind: this.bindOwners(owners) };
    this.formState.host = 'window';
    this.formState.modal = modal;
    attach(win);
  }

  /** Subscribes to the owners' dispose; returns the unsubscribers. */
  private bindOwners(owners: ComponentBase[]): (() => void)[] {
    return owners.map((owner) => {
      const onDisposing = () => this.ownerClosing(true);
      owner.motif.on('x:disposing', onDisposing);
      return () => void owner.motif.off('x:disposing', onDisposing);
    });
  }

  /** @internal Called by the window once the native dialog is open. */
  windowOpened(win: FormWindow): void {
    if (win !== this.presentation?.win || this.finished) return;
    if (!this.formState.open) this.opener ??= deepActiveElement();
    this.formState.open = true;
    if (win.modal) this.unlockScroll ??= lockScroll();
    windowStack.bringToFront(this.stackEntry);
    this.focusFirst();
    this.onShown?.();
    this.props.onShown?.(this);
  }

  /** Brings a shown form to the front and makes it the active window. */
  activate(): void {
    if (this.presentation && this.formState.open) windowStack.bringToFront(this.stackEntry);
  }

  // ---- closing ------------------------------------------------------------

  /**
   * Closes the form: runs `onClosing` (which may cancel), then
   * `onClosed`. A form opened with `show`/`showDialog` (or embedded) is
   * then disposed; one bound with `x-model` is hidden and writes `false` back.
   * Resolves `false` when it was cancelled.
   */
  async close(result?: FormResult, reason: CloseReason = 'code'): Promise<boolean> {
    if (this.closing || this.finished || this.isDisposed) return false;
    const p = this.presentation;
    if (p && !this.formState.open) return false;
    this.closing = true;
    const e: FormClosingEventArgs = { form: this, reason, result: result ?? this.result, cancel: false };
    try {
      await this.onClosing?.(e);
      if (!e.cancel) await this.props.onClosing?.(e);
    } finally {
      this.closing = false;
    }
    if (this.finished || this.isDisposed) return false;
    if (e.cancel) {
      // The bound state may already say "closed"; the form stayed open, say so.
      if (p?.persistent && !this.modelOpen) this.writeOpen(true);
      return false;
    }
    if (p?.persistent) this.hide(e.result, reason);
    else this.finish(e.result, reason, true);
    return true;
  }

  /** An owner (or the window itself) is going away while the form may still be open. */
  private ownerClosing(disposeWindow: boolean): void {
    if (this.finished) return;
    if (this.formState.open) {
      const e: FormClosingEventArgs = { form: this, reason: 'owner', result: 'none', cancel: false };
      // Notify only: an owner's dispose cannot be awaited or cancelled.
      void this.onClosing?.(e);
      void this.props.onClosing?.(e);
    }
    this.finish('none', 'owner', disposeWindow);
  }

  /** x-model form: close the window, keep the form and its state, write `false` back. */
  private hide(result: FormResult, reason: CloseReason): void {
    this.result = result;
    this.closeWindow();
    this.writeOpen(false);
    this.notifyClosed(result, reason);
  }

  /** Final close: the form is (being) disposed. */
  private finish(result: FormResult, reason: CloseReason, dispose: boolean): void {
    const wasOpen = this.formState.open || !this.presentation;
    this.finished = true;
    this.result = result;
    const p = this.presentation;
    for (const unbind of p?.unbind.splice(0) ?? []) unbind();
    this.closeWindow();
    if (wasOpen) this.notifyClosed(result, reason);
    const resolve = this.resolveDialog;
    this.resolveDialog = null;
    resolve?.(result);
    if (dispose) void (p?.win ?? this).dispose();
  }

  private closeWindow(): void {
    const p = this.presentation;
    this.formState.open = false;
    this.unlockScroll?.();
    this.unlockScroll = null;
    if (!p) return;
    windowStack.remove(this.stackEntry);
    p.win.closeNative();
    if (p.win.isMinimizedIn) p.win.restoreFromTarget();
    this.formState.windowState = 'normal';
    this.returnFocus();
  }

  private notifyClosed(result: FormResult, reason: CloseReason): void {
    const closed: FormClosedEventArgs = { form: this, reason, result: result };
    this.onClosed?.(closed);
    this.props.onClosed?.(closed);
  }

  /** Writes the shown state back through the `x-model` binding. */
  private writeOpen(open: boolean): void {
    this.modelOpen = open;
    this.writeModel(open);
  }

  /**
   * Focus goes back to whoever opened the form, else to where it was in the
   * window now on top; never left on <body>.
   */
  private returnFocus(): void {
    const opener = this.opener;
    this.opener = null;
    if (opener?.isConnected && !opener.closest('[inert]')) {
      opener.focus();
      return;
    }
    (windowStack.top() as StackEntry | undefined)?.form.restoreFocus();
  }

  /** Moves focus into the form: `[autofocus]`, else the first focusable control. */
  focusFirst(): void {
    const body = this.element.querySelector<HTMLElement>(':scope > .mx-form__body');
    if (!focusInitial(body ?? this.element)) focusInitial(this.element);
  }

  // ---- keyboard and result buttons ---------------------------------------

  private onKey(e: KeyboardEvent): void {
    if (e.defaultPrevented || this.finished) return;
    // Keys from a nested form are its own.
    if ((e.target as Element | null)?.closest?.('.mx-form') !== this.element) return;
    if (e.key === 'Escape') {
      const cancel = this.cancelButton;
      if (cancel) {
        e.preventDefault();
        (cancel.element as HTMLElement).click();
      } else if ((read(this.props.closeOnEscape) ?? this.formState.modal) === true && this.presentation) {
        e.preventDefault();
        void this.close('cancel', 'user');
      }
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const accept = this.defaultButton;
      const target = e.target as HTMLElement | null;
      if (!accept || !target || this.ownsEnter(target)) return;
      e.preventDefault();
      (accept.element as HTMLElement).click();
    }
  }

  /** Elements where Enter already means something of their own. */
  private ownsEnter(target: HTMLElement): boolean {
    return (
      target.isContentEditable ||
      ['TEXTAREA', 'BUTTON', 'A', 'SELECT', 'SUMMARY'].includes(target.tagName) ||
      (target.tagName === 'INPUT' &&
        ['button', 'submit', 'reset', 'checkbox', 'radio'].includes((target as HTMLInputElement).type))
    );
  }

  /** A click on `[data-result]` inside this form (not a nested one) closes it with that result. */
  private onResultClick(e: MouseEvent): void {
    const hit = (e.target as Element | null)?.closest?.('[data-result]');
    if (!hit || hit.closest('.mx-form') !== this.element || (hit as HTMLButtonElement).disabled) return;
    void this.close(toFormResult(hit.getAttribute('data-result')));
  }

  // ---- window state -------------------------------------------------------

  private toggleWindowState(state: 'maximized' | 'minimized'): void {
    this.setWindowState(this.formState.windowState === state ? 'normal' : state);
  }

  /**
   * Minimized: a window with a `minimizeTarget` moves into it, otherwise it
   * collapses to its title bar. A modal form is never minimized.
   */
  private setWindowState(state: WindowState): void {
    if (state === 'minimized' && this.formState.modal) return;
    const win = this.presentation?.win;
    this.formState.windowState = state;
    if (!win) return;
    const target = read(this.props.minimizeTarget);
    if (state === 'minimized' && target) win.minimizeInto(target);
    else if (state !== 'minimized') win.restoreFromTarget();
  }

  private onTitlePointerDown(e: PointerEvent): void {
    // The title bar takes no focus (mousedown is prevented): activating the
    // window by its title puts focus back where it was inside.
    if (this.presentation && !this.focusWithin) this.restoreFocus();
    if ((e.target as Element).closest('.mx-form__caption')) return;
    this.presentation?.win.beginMove(e);
  }

  private onTitleDoubleClick(e: MouseEvent): void {
    if ((e.target as Element).closest('.mx-form__caption')) return;
    if (this.formState.windowState === 'minimized') this.setWindowState('normal');
    else if (read(this.props.showMaximize) === true) this.toggleWindowState('maximized');
  }

  // ---- content ------------------------------------------------------------

  private renderContent(): unknown {
    if (this.contentView) return this.contentView.call(this);
    const content = this.props.content;
    if (typeof content === 'function' && !(content.prototype instanceof ComponentBase)) return content();
    if (content != null) return content;
    return this.childs;
  }
}
