import { Component, createSignal, untracked, type Bind, type IBaseProp, type Signal } from '@motifx/core';
import { follow } from './follow';
import { registerControl } from './control-map';
import { disableSubtree, rescueTarget } from './enable';
import { deepActiveElement, isFocusable } from './focus';
import { installFocusGuard } from './focus-guard';
import { addShortcut, installKeyboard, type ShortcutHandler, type ShortcutOptions } from './keyboard';
import { accessKeyToken, setAccessKeyAttribute } from './access-key';

/** Props every {@link Control} understands. Each one is also a settable property. */
export interface ControlProps {
  /** The text of the control (caption, label, title…). Where it appears depends on the control. */
  text?: Bind<string>;
  /** `false` disables the control and everything inside it. The default is `true`. */
  enabled?: Bind<boolean>;
  /** The HTML-style inverse of `enabled`: `disabled={() => state.busy}`. It is ignored when `enabled` is set. */
  disabled?: Bind<boolean>;
  /** `false` hides the control with the core `hide()` method, and `true` shows it again. The default is `true`. */
  visible?: Bind<boolean>;
  /** `false` removes the control from the Tab order. Code or a click can still focus it. The default is `true`. */
  tabStop?: Bind<boolean>;
  /**
   * The order among the controls of the same container. Tab visits them in
   * ascending order, and ties (the default is 0) follow document order. Leave it unset
   * where you can, because document order is also the reading order for screen readers.
   */
  tabIndex?: Bind<number>;
}

/** One property's storage. Created on first use, so untouched properties cost nothing. */
interface Slot {
  value: unknown;
  /** Change counter that reactive readers track; created on the first read. */
  version?: Signal<number>;
  /** Stops the binding that follows a getter prop; a value set in code replaces it. */
  unfollow?: () => void;
  /** Subclass renderers registered with `observeProperty`. */
  appliers?: ((value: unknown) => void)[];
}

/** See `Control.controlState`. */
interface ControlState {
  slots?: Map<string, Slot>;
  enableRelease: (() => void) | null;
  enableCleanupRegistered: boolean;
  /** The focus element's own `tabindex` while `tabStop` is false (`null`: it had none). */
  tabindexBeforeStop?: string | null;
  /** The `Alt+…` token this control wrote into `aria-keyshortcuts`. */
  accessKeyToken: string | null;
}

const STATE = Symbol('mx.control');

const DEFAULTS: Record<string, unknown> = { text: '', enabled: true, visible: true, tabStop: true, tabIndex: 0 };

/**
 * The base of every `@motifx-community/ui` control. The shared properties
 * (`text`, `enabled`, `visible`, `tabStop`) work the same whether the control
 * is declared in JSX or created with `new` and changed programmatically.
 *
 * - A prop can be a value or a getter (`enabled={() => !state.busy}`). A
 *   getter keeps the property in sync with the state.
 * - Every property can be set programmatically, with a value (`ctrl.enabled = false`,
 *   which replaces any earlier getter, so the code owns the value from then on) or
 *   with a function (`ctrl.enabled = () => !state.busy`, which is bound and tracked, and
 *   over plain data is read again on `reState()`).
 * - Every property is reactive to read: `{() => ctrl.text}` or a watch tracks it.
 *
 * Cost model: a property nobody set or bound costs nothing, a plain value is
 * written to the DOM once, only a getter prop creates a binding, and the change
 * counter that readers track is created on the first read.
 *
 * Subclasses render `text`, and their own properties built on the same
 * storage, with {@link observeProperty}. The root element defaults to a div, and
 * `static elementTag` sets another element.
 */
export class Control<TElement extends HTMLElement = HTMLElement, TProps extends ControlProps = ControlProps> extends Component<
  TElement,
  TProps
> {
  static override elementTag = 'div';

  /**
   * All of the control's own state, on one symbol-keyed object created on
   * first use. Not class fields: core calls `ref` callbacks from inside the
   * base constructor, before field initializers run, and an initializer would
   * then wipe whatever the ref did (a property set, a reader subscribed).
   */
  private get controlState(): ControlState {
    const self = this as unknown as { [STATE]?: ControlState };
    return (self[STATE] ??= { enableRelease: null, enableCleanupRegistered: false, accessKeyToken: null });
  }

  constructor(element: TElement | string, props?: IBaseProp<TProps>);
  // Last, so JSX takes the props type from it.
  constructor(props?: IBaseProp<TProps>);
  // Arguments are forwarded as they came: core's Component tells its
  // overloads apart by how many there are.
  constructor(...args: unknown[]) {
    super(...(args as [IBaseProp<TProps>?, IBaseProp<TProps>?]));
    registerControl(this.element, this);
    installFocusGuard();
     
    const props = (this.props ?? {}) as ControlProps;
    for (const name of ['text', 'enabled', 'visible', 'tabStop', 'tabIndex'] as const) {
      if (props[name] !== undefined) this.bindProperty(name, props[name]);
    }
    const disabled = props.disabled;
    if (props.enabled === undefined && disabled !== undefined) {
      this.bindProperty('enabled', typeof disabled === 'function' ? () => !disabled() : !disabled);
    }
    // DOM events given to `new X({ onclick })` programmatically; in JSX the compiler binds them itself.
    for (const [name, handler] of Object.entries(props)) {
      if (/^on[a-z]+$/.test(name) && typeof handler === 'function') this.motif.on(name.slice(2), handler as (...args: unknown[]) => unknown);
    }
  }

  // Shared properties.

  /** The text of the control (caption, label, title…). Reactive. */
  get text(): string {
    return this.getProperty<string>('text');
  }

  set text(value: Bind<string>) {
    this.assignProperty('text', value, (v) => v ?? '');
  }

  /**
   * The control's own value, as set or bound (like the HTML `disabled`
   * attribute). Whether it can be used now also depends on its ancestors.
   * See {@link isEnabled}. Reactive.
   */
  get enabled(): boolean {
    return this.getProperty<boolean>('enabled');
  }

  set enabled(value: Bind<boolean>) {
    this.assignProperty('enabled', value, Boolean);
  }

  /** The inverse of {@link enabled}, as in HTML. Reactive. */
  get disabled(): boolean {
    return !this.enabled;
  }

  set disabled(value: Bind<boolean>) {
    this.assignProperty('enabled', value, (v) => !v);
  }

  /**
   * Indicates whether the control can be used now, meaning that it and all its
   * ancestors are enabled (like CSS `:enabled`). Windows opened inside it do not
   * inherit the state. Reactive.
   */
  get isEnabled(): boolean {
    return this.getProperty<boolean>('enabled') && (this.parentControl?.isEnabled ?? true);
  }

  /** The control's own visibility. A hidden parent does not change it. Reactive. */
  get visible(): boolean {
    return this.getProperty<boolean>('visible');
  }

  set visible(value: Bind<boolean>) {
    this.assignProperty('visible', value, Boolean);
  }

  /** `false` removes the control from the Tab order (see the prop). Reactive. */
  get tabStop(): boolean {
    return this.getProperty<boolean>('tabStop');
  }

  set tabStop(value: Bind<boolean>) {
    this.assignProperty('tabStop', value, Boolean);
  }

  /** The position in its container's Tab order. Reactive. */
  get tabIndex(): number {
    return this.getProperty<number>('tabIndex');
  }

  set tabIndex(value: Bind<number>) {
    this.assignProperty('tabIndex', value, (v) => Number(v) || 0);
  }

  /**
   * The nearest ancestor that is a `Control`, without crossing a window (a window
   * opened inside a disabled control is not disabled by it).
   */
  get parentControl(): Control | null {
    for (let p = this.parent; p; p = p.parent) {
      if (p.element instanceof HTMLDialogElement) return null;
      if (p instanceof Control) return p;
    }
    return null;
  }

  // Focus.

  /** The element that takes focus; the root by default. Composite controls override it. */
  protected get focusElement(): HTMLElement {
    return this.element;
  }

  /** Indicates whether {@link focus} can succeed now: enabled, on the page, visible and focusable. */
  get canFocus(): boolean {
    const el = this.focusElement;
    return this.isEnabled && el.isConnected && isFocusable(el);
  }

  /** Indicates whether the control's focus element has focus. This is a DOM query and is not reactive. */
  get focused(): boolean {
    return deepActiveElement(this.element) === this.focusElement;
  }

  /** Indicates whether focus is on the control or inside it (CSS `:focus-within`). This is not reactive. */
  get focusWithin(): boolean {
    const active = deepActiveElement(this.element);
    return !!active && this.element.contains(active);
  }

  /** Sets focus on the control. Returns `false` if it cannot receive focus. */
  focus(): boolean {
    if (!this.canFocus) return false;
    this.focusElement.focus();
    return this.focused;
  }

  // Keyboard.

  /**
   * Defines what the control's access key (`&Save` → Alt+S) does. By default it sets
   * focus, and a button-like control also clicks itself. Returns whether it did anything.
   */
  onAccessKey(): boolean {
    return this.focus();
  }

  /**
   * Adds a keyboard shortcut that is active while focus is inside this control and
   * is removed when the control is disposed. See `addShortcut` for the chord syntax
   * and the rules. Returns a function that removes it.
   *
   * @example
   * this.addShortcut('Ctrl+S', () => this.save());
   */
  addShortcut(chord: string, handler: ShortcutHandler, options: Omit<ShortcutOptions, 'scope'> = {}): () => void {
    const remove = addShortcut(chord, handler, { ...options, scope: this });
    this.motif.setDisposable(remove);
    return remove;
  }

  /**
   * Declares the control's access key (from a parsed `&Text`), or none with
   * `null`: written to `aria-keyshortcuts` on the focus element, next to any
   * shortcuts the app put there. Subclasses that render `text` call this.
   */
  protected setAccessKey(key: string | null): void {
    const token = key ? accessKeyToken(key) : null;
    if (token === this.controlState.accessKeyToken) return;
    setAccessKeyAttribute(this.focusElement, this.controlState.accessKeyToken, token);
    this.controlState.accessKeyToken = token;
    if (token) installKeyboard();
  }

  // Property storage, for subclasses.

  /** Reads a property, tracked: reactive readers update when it changes. */
  protected getProperty<T>(name: string): T {
    const slot = this.slot(name);
    // Read the counter only to register the dependency.
    void (slot.version ??= createSignal(0)).value;
    return slot.value as T;
  }

  /** Sets a property programmatically: replaces a getter prop bound to it, then stores and renders. */
  protected setProperty(name: string, value: unknown): void {
    const slot = this.slot(name);
    this.unbind(slot);
    this.store(name, slot, value);
  }

  /** Stores a value the user entered; a bound getter is kept. */
  protected changeProperty(name: string, value: unknown): void {
    this.store(name, this.slot(name), value);
  }

  /**
   * What a property setter does: a value is set (`setProperty`), a function is bound in place of
   * whatever was there (`bindProperty`) and followed. `normalize` shapes the value either way.
   */
  protected assignProperty<T>(name: string, value: Bind<T>, normalize: (value: T) => unknown = (v) => v): void {
    if (typeof value === 'function') {
      const get = value as () => T;
      // Only the getter is followed: what `normalize` reads of its value is not.
      this.bindProperty(name, () => {
        const got = get();
        return untracked(() => normalize(got));
      });
    } else {
      this.setProperty(name, normalize(value));
    }
  }

  /**
   * Binds a property to a prop: a getter is read now and followed by a component binding, so it follows reactive
   * data by itself and plain data on `reState()`. A plain value is stored once. Subclasses call
   * this for their own properties, typically from the constructor.
   */
  protected bindProperty(name: string, prop: Bind<unknown>): void {
    const slot = this.slot(name);
    this.unbind(slot);
    if (typeof prop !== 'function') {
      this.store(name, slot, prop);
      return;
    }
    slot.unfollow = follow(this, name, prop as () => unknown, (value) => this.store(name, slot, value));
  }

  private unbind(slot: Slot): void {
    slot.unfollow?.();
    slot.unfollow = undefined;
  }

  /**
   * Renders a property without an effect: `apply` runs now with the current
   * value and again on every change, whether it comes from a getter prop or
   * programmatically. E.g. `this.observeProperty('text', (t) => (label.data = t))`.
   */
  protected observeProperty<T>(name: string, apply: (value: T) => void): void {
    const slot = this.slot(name);
    (slot.appliers ??= []).push(apply as (value: unknown) => void);
    untracked(() => apply(slot.value as T));
  }

  private slot(name: string): Slot {
    const slots = (this.controlState.slots ??= new Map());
    let slot = slots.get(name);
    if (!slot) slots.set(name, (slot = { value: DEFAULTS[name] }));
    return slot;
  }

  private store(name: string, slot: Slot, value: unknown): void {
    if (Object.is(slot.value, value)) return;
    slot.value = value;
    // Drawing follows nothing: a setter may be called from inside the caller's own watch.
    untracked(() => {
      this.applyProperty(name, value);
      if (slot.appliers) for (const apply of slot.appliers) apply(value);
    });
    if (slot.version) slot.version.value = slot.version.peek() + 1;
  }

  /**
   * Renders a property that changed (from a prop, a bound getter or code).
   * Override it to render your own properties without an effect, and call
   * `super.applyProperty` for the rest. It can run from the constructor
   * (props are bound there), before subclass fields exist: touch only
   * `this.element` and the property storage.
   */
  protected applyProperty(name: string, value: unknown): void {
    if (name === 'enabled') this.applyEnabled(value as boolean);
    else if (name === 'visible') this.applyVisible(value as boolean);
    else if (name === 'tabStop') this.applyTabStop(value as boolean);
    else if (name === 'tabIndex') {
      // Only a non-default index is written: containers look for it to know
      // whether Tab needs their help at all.
      if (value) this.element.setAttribute('data-mx-tabindex', String(value));
      else this.element.removeAttribute('data-mx-tabindex');
    }
  }

  /** A property's current value without tracking it. */
  protected peekProperty<T>(name: string): T | undefined {
    return this.controlState.slots?.get(name)?.value as T | undefined;
  }

  private applyEnabled(enabled: boolean): void {
    if (!enabled && !this.controlState.enableRelease) {
      this.controlState.enableRelease = disableSubtree(this.element);
      this.element.setAttribute('data-disabled', '');
      if (!this.controlState.enableCleanupRegistered) {
        this.controlState.enableCleanupRegistered = true;
        this.motif.setDisposable(() => this.controlState.enableRelease?.());
      }
    } else if (enabled && this.controlState.enableRelease) {
      this.controlState.enableRelease();
      this.controlState.enableRelease = null;
      this.element.removeAttribute('data-disabled');
    }
  }

  private applyVisible(visible: boolean): void {
    if (visible) {
      void this.motif.show();
      return;
    }
    rescueTarget(this.element)?.focus({ preventScroll: true });
    void this.motif.hide();
  }

  private applyTabStop(tabStop: boolean): void {
    const el = this.focusElement;
    if (!tabStop && this.controlState.tabindexBeforeStop === undefined) {
      this.controlState.tabindexBeforeStop = el.getAttribute('tabindex');
      el.setAttribute('tabindex', '-1');
    } else if (tabStop && this.controlState.tabindexBeforeStop !== undefined) {
      const original = this.controlState.tabindexBeforeStop;
      this.controlState.tabindexBeforeStop = undefined;
      if (original === null) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', original);
    }
  }
}
