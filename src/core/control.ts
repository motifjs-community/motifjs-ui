import { Component, createSignal, untracked, type Bind, type ComponentBase, type IBaseProp, type IDisposable, type Signal } from '@motifx/core';
import { follow } from './follow';
import { cover, isHeld } from './cover';
import { canTakeFocus, focusOn, holdsFocus, isFocused, rescueFocus } from './focus';
import { installFocusGuard } from './focus-guard';
import { addShortcut, installKeyboard } from './keyboard';
import { accessKeyToken, setAccessKeyAttribute } from './access-key';
import { addLiveControl, noteTabIndex } from './live-controls';
import type { ShortcutHandler } from './shortcut-handler';
import type { ShortcutOptions } from './shortcut-options';

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
  /** The state of `isEnabled` last drawn; unset while nothing was drawn (usable). */
  drawnEnabled?: boolean;
  /** Stops swallowing pointer input; set while the control itself is disabled. */
  unblock: (() => void) | null;
  /** The components of its area the control covered, each with the hold that gives it back. */
  covers?: Map<ComponentBase, IDisposable | null>;
  /** Hears a component added to a covered one; the same function for every covered component. */
  onAreaAdded?: (sender: ComponentBase, e: { control: ComponentBase }) => void;
  /** Hears a component taken out of a covered one. */
  onAreaRemoved?: (sender: ComponentBase, e: { control: ComponentBase }) => void;
  /** The focus part's own `tabindex` while `tabStop` is false (`null`: it had none). */
  tabindexBeforeStop?: string | null;
  /** The `Alt+…` token this control wrote into `aria-keyshortcuts`. */
  accessKeyToken: string | null;
}

const STATE = Symbol('mx.control');

const DEFAULTS: Record<string, unknown> = { text: '', enabled: true, visible: true, tabStop: true, tabIndex: 0 };

/** Pointer input swallowed inside a control that is itself disabled, before any handler sees it. */
const BLOCKED_EVENTS = ['pointerdown', 'mousedown', 'click', 'dblclick', 'auxclick', 'contextmenu'];

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
    return (self[STATE] ??= { unblock: null, accessKeyToken: null });
  }

  constructor(element: TElement | string, props?: IBaseProp<TProps>);
  // Last, so JSX takes the props type from it.
  constructor(props?: IBaseProp<TProps>);
  // Arguments are forwarded as they came: core's Component tells its
  // overloads apart by how many there are.
  constructor(...args: unknown[]) {
    super(...(args as [IBaseProp<TProps>?, IBaseProp<TProps>?]));
    addLiveControl(this);
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
   * The nearest ancestor that is a `Control`; none for a window (a window opened inside a disabled control is
   * not disabled by it).
   */
  get parentControl(): Control | null {
    if (this.isWindow) return null;
    for (let p = this.parent; p; p = p.parent) if (p instanceof Control) return p;
    return null;
  }

  /**
   * Indicates whether the control is a window of its own (a form, a panel over the page): what is inside does not take
   * the enabled state of what is outside, and focus, Tab and the keys stop at it.
   */
  get isWindow(): boolean {
    return false;
  }

  // Focus.

  /**
   * The part that takes focus, as a component: the control itself by default, `null` when it takes none.
   * Composite controls override it. A child control given here answers `focus`, `canFocus` and `focused`.
   */
  get focusPart(): ComponentBase | null {
    return this;
  }

  /** Indicates whether {@link focus} can succeed now: enabled, built, shown with every component above it, and its part takes focus. */
  get canFocus(): boolean {
    const part = this.focusPart;
    if (!part || !this.isEnabled || !this.isBuilt) return false;
    if (part !== this && part instanceof Control) return part.canFocus;
    return shownInTree(part) && canTakeFocus(part);
  }

  /** Indicates whether the control's focus part has focus. This is a DOM query and is not reactive. */
  get focused(): boolean {
    const part = this.focusPart;
    if (part !== this && part instanceof Control) return part.focused;
    return !!part && isFocused(part);
  }

  /** Indicates whether focus is on the control or inside it (CSS `:focus-within`), or on a part standing for it. This is not reactive. */
  get focusWithin(): boolean {
    return holdsFocus(this);
  }

  /** Sets focus on the control. Returns `false` if it cannot receive focus. */
  focus(): boolean {
    if (!this.canFocus) return false;
    const part = this.focusPart!;
    if (part !== this && part instanceof Control) return part.focus();
    focusOn(part);
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
   * is removed when the control is disposed. See `addShortcut` for the chord syntax,
   * several keys and the rules. Returns a function that removes it.
   *
   * @example
   * this.addShortcut('Ctrl+S', () => this.save());
   */
  addShortcut(keys: string | readonly string[], handler: ShortcutHandler, options: Omit<ShortcutOptions, 'scope'> = {}): () => void {
    const remove = addShortcut(keys, handler, { ...options, scope: this });
    this.motif.setDisposable(remove);
    return remove;
  }

  /**
   * Declares the control's access key (from a parsed `&Text`), or none with
   * `null`: written to `aria-keyshortcuts` on the focus element, next to any
   * shortcuts the app put there, and pressed through {@link onAccessKey}.
   * Subclasses that render `text` call this.
   */
  protected setAccessKey(key: string | null): void {
    const token = key ? accessKeyToken(key) : null;
    if (token === this.controlState.accessKeyToken) return;
    const part = this.focusPart;
    if (part) setAccessKeyAttribute(part, this.controlState.accessKeyToken, token, () => this.onAccessKey());
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
    if (name === 'enabled') this.enabledChanged(value as boolean);
    else if (name === 'visible') this.applyVisible(value as boolean);
    else if (name === 'tabStop') this.renderTabStop();
    // Containers ask for a non-default index to know whether Tab needs their help at all.
    else if (name === 'tabIndex') noteTabIndex(this, value as number);
  }

  /** A property's current value without tracking it. */
  protected peekProperty<T>(name: string): T | undefined {
    return this.controlState.slots?.get(name)?.value as T | undefined;
  }

  private enabledChanged(enabled: boolean): void {
    if (enabled) this.attr.remove('data-disabled');
    else this.attr.add({ 'data-disabled': '' });
    this.blockPointer(!enabled);
    // The value given wins over the stored one: a control may draw itself disabled again to cover its area anew.
    this.drawEnabled(enabled && untracked(() => this.parentControl?.isEnabled ?? true));
  }

  /** Draws whether the control can be used now ({@link isEnabled}) when that changed: focus inside moves on, and its area is covered or given back. */
  private drawEnabled(enabled = untracked(() => this.isEnabled)): void {
    const state = this.controlState;
    if (enabled === (state.drawnEnabled ?? true)) return;
    state.drawnEnabled = enabled;
    if (!enabled && this.focusWithin && !this.focusStays(this)) rescueFocus(this);
    this.drawArea(this, enabled);
    this.renderTabStop();
    const parent = this.parentControl;
    if (parent) untracked(() => parent.childEnabledChanged(this));
  }

  /** Called on the nearest parent control when a child control becomes usable or unusable. */
  protected childEnabledChanged(_child: Control): void {}

  /** Walks the area from `component`: covers or gives back each component; a control met draws itself. */
  private drawArea(component: ComponentBase, enabled: boolean): void {
    if (component !== this && component instanceof Control) {
      component.drawEnabled();
      return;
    }
    if (enabled) this.giveBack(component);
    else this.coverAt(component);
    for (const child of component.controls.items) this.drawArea(child, enabled);
  }

  /** Covers one component and hears what is added to it or taken out of it while the control is disabled. */
  private coverAt(component: ComponentBase): void {
    const state = this.controlState;
    const covers = (state.covers ??= new Map());
    if (covers.has(component)) return;
    covers.set(component, cover(component));
    state.onAreaAdded ??= (_, e) => this.drawArea(e.control, false);
    state.onAreaRemoved ??= (_, e) => this.leaveArea(e.control);
    void component.motif.on('controladded', state.onAreaAdded, false);
    void component.motif.on('controlremoved', state.onAreaRemoved, false);
  }

  private giveBack(component: ComponentBase): void {
    const state = this.controlState;
    if (!state.covers?.has(component)) return;
    state.covers.get(component)?.dispose();
    state.covers.delete(component);
    void component.motif.off('controladded', state.onAreaAdded!);
    void component.motif.off('controlremoved', state.onAreaRemoved!);
  }

  /** What left the area is given back; a control in it draws itself once it is in its new place. */
  private leaveArea(component: ComponentBase): void {
    if (component instanceof Control) {
      queueMicrotask(() => {
        if (!component.isDisposed) component.drawEnabled();
      });
      return;
    }
    this.giveBack(component);
    for (const child of component.controls.items) this.leaveArea(child);
  }

  /** Whether focus sits on a control inside `component` that stays focusable while disabled (a button can ask for that). */
  private focusStays(component: ComponentBase): boolean {
    if (component instanceof Control && component.focused) return component.canFocus;
    return component.controls.items.some((child) => this.focusStays(child));
  }

  private blockPointer(on: boolean): void {
    const state = this.controlState;
    if (on === !!state.unblock) return;
    if (!on) {
      state.unblock!();
      state.unblock = null;
      return;
    }
    const block = (_: ComponentBase, e: Event) => {
      if (this.windowsAt(this).some((w) => w.motif.isEventFrom(e))) return;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    for (const type of BLOCKED_EVENTS) void this.motif.on(`${type}:capture` as 'click', block);
    state.unblock = () => {
      for (const type of BLOCKED_EVENTS) void this.motif.off(`${type}:capture` as 'click', block);
    };
  }

  /** The windows inside `component`, not looking inside them. */
  private windowsAt(component: ComponentBase, found: Control[] = []): Control[] {
    for (const child of component.controls.items) {
      if (child instanceof Control && child.isWindow) found.push(child);
      else this.windowsAt(child, found);
    }
    return found;
  }

  /** The focus part when it is the control's own part; a child control given as the focus part draws itself. */
  private get ownFocusPart(): ComponentBase | null {
    const part = this.focusPart;
    return part && (part === this || !(part instanceof Control)) ? part : null;
  }

  /** Takes the focus part out of the Tab order while `tabStop` is false; waits while a disabled control's cover holds its tabindex. */
  private renderTabStop(): void {
    const part = this.ownFocusPart;
    const state = this.controlState;
    if (!part || (state.drawnEnabled === false && isHeld(part, 'tabindex'))) return;
    const tabStop = this.peekProperty<boolean>('tabStop') !== false;
    if (!tabStop && state.tabindexBeforeStop === undefined) {
      state.tabindexBeforeStop = part.attr.get('tabindex');
      part.attr.add({ tabindex: '-1' });
    } else if (tabStop && state.tabindexBeforeStop !== undefined) {
      const original = state.tabindexBeforeStop;
      state.tabindexBeforeStop = undefined;
      if (original === null) part.attr.remove('tabindex');
      else part.attr.add({ tabindex: original });
    }
  }

  private applyVisible(visible: boolean): void {
    if (visible) {
      void this.motif.show();
      return;
    }
    rescueFocus(this);
    void this.motif.hide();
  }
}

/** It and every component above it shown (core's `isVisible`). */
function shownInTree(component: ComponentBase): boolean {
  for (let c: ComponentBase | null = component; c; c = c.parent) if (!c.isVisible) return false;
  return true;
}
