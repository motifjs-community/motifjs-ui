import { Component, createSignal, effect, untracked, type Bind, type IBaseProp, type Signal } from '@motifx/core';
import { registerControl } from './control-map';
import { disableSubtree, rescueTarget } from './enable';
import { deepActiveElement, isFocusable } from './focus';
import { installFocusGuard } from './focus-guard';
import { addShortcut, installKeyboard, type ShortcutHandler, type ShortcutOptions } from './keyboard';
import { type Dock } from './dock';
import { localeOf, type UiStrings } from './locale';
import { accessKeyToken, setAccessKeyAttribute } from './access-key';
import { toLength, type Length } from './space';

/** Props every {@link Control} understands. Each one is also a settable property. */
export interface ControlProps {
  /** The control's text (caption, label, title…); where it shows is up to the control. */
  text?: Bind<string>;
  /** `false` disables the control and everything inside it. Default `true`. */
  enabled?: Bind<boolean>;
  /** The HTML-style inverse of `enabled`, for habit: `disabled={() => state.busy}`. Ignored when `enabled` is given. */
  disabled?: Bind<boolean>;
  /** `false` hides the control (core `hide()`), `true` shows it again. Default `true`. */
  visible?: Bind<boolean>;
  /** `false` takes the control out of the Tab order; it can still be focused by code or click. Default `true`. */
  tabStop?: Bind<boolean>;
  /**
   * Order among the controls of the same container: Tab visits them in
   * ascending order, equal ones (default 0) in document order. Leave it unset
   * where you can: document order is also the order screen readers read in.
   */
  tabIndex?: Bind<number>;

  // ---- layout props, read by the container the control sits in

  /**
   * Where the control goes in a Panel, a GroupBox or a split panel:
   * `top` / `bottom` / `start` / `end` stick to that edge of what is left
   * (`start` is the left in LTR, the right in RTL), `fill` takes the rest,
   * `float` is positioned freely with `left` / `top` / `right` / `bottom`.
   * Default `none` (normal flow).
   */
  dock?: Bind<Dock>;
  /** CSS offsets of a floating control. The edges given are the ones it stays anchored to (`left` + `right` stretches it). */
  left?: Bind<Length | undefined>;
  top?: Bind<Length | undefined>;
  right?: Bind<Length | undefined>;
  bottom?: Bind<Length | undefined>;
  /** Size: a number of pixels or any CSS length. Unset, the control sizes to its content or its layout slot. */
  width?: Bind<Length | undefined>;
  height?: Bind<Length | undefined>;
  /** In a Grid: the row and column line (1-based, like CSS `grid-row` / `grid-column`) and how many it spans. */
  row?: Bind<number | undefined>;
  column?: Bind<number | undefined>;
  rowSpan?: Bind<number | undefined>;
  columnSpan?: Bind<number | undefined>;
}

/** The layout props, also settable properties; each one costs nothing until used. */
const LAYOUT_PROPS = ['dock', 'left', 'top', 'right', 'bottom', 'width', 'height', 'row', 'column', 'rowSpan', 'columnSpan'] as const;
type LayoutProp = (typeof LAYOUT_PROPS)[number];
/** CSS property written for each length prop. */
const LENGTH_CSS: Partial<Record<LayoutProp, string>> = {
  left: 'left',
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  width: 'width',
  height: 'height',
};

/** One property's storage. Created on first use, so untouched properties cost nothing. */
interface Slot {
  value: unknown;
  /** Change counter that reactive readers track; created on the first read. */
  version?: Signal<number>;
  /** Stops the effect of a getter prop; a value set in code replaces the binding. */
  stop?: () => void;
  /** Subclass renderers registered with `observeProperty`. */
  appliers?: ((value: unknown) => void)[];
}

/** See `Control.state`. */
interface ControlState {
  slots?: Map<string, Slot>;
  enableRelease: (() => void) | null;
  enableCleanupRegistered: boolean;
  model?: ModelBinding;
  /** The focus element's own `tabindex` while `tabStop` is false (`null`: it had none). */
  tabindexBeforeStop?: string | null;
  localeStrings?: UiStrings;
  /** The `Alt+…` token this control wrote into `aria-keyshortcuts`. */
  accessKeyToken: string | null;
}

const STATE = Symbol('mx.control');

interface ModelBinding {
  propertyName: string;
  setter?: (value: unknown) => void;
}

const DEFAULTS: Record<string, unknown> = { text: '', enabled: true, visible: true, tabStop: true, tabIndex: 0, dock: 'none' };

/**
 * The base of every `@motifx-community/ui` control: the shared properties
 * (`text`, `enabled`, `visible`, `tabStop`) work the same whether the control
 * is written in JSX or created with `new` and changed from code.
 *
 * - A prop can be a value or a getter (`enabled={() => !state.busy}`); a
 *   getter keeps the property in sync with the state.
 * - Every property can be set from code (`ctrl.enabled = false`). Setting it
 *   replaces a getter given as prop: from then on the code owns the value.
 * - Every property is reactive to read: `{() => ctrl.text}` or a watch follows it.
 *
 * Cost model: a property nobody set or bound costs nothing; a plain value is
 * written to the DOM once; only a getter prop creates an effect; the change
 * counter readers track is created on the first read.
 *
 * Subclasses render `text` (and their own properties built on the same
 * storage) with {@link observeProperty}; the root element defaults to a div,
 * set `static elementTag` for another.
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
  private get state(): ControlState {
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
    for (const name of ['text', 'enabled', 'visible', 'tabStop', 'tabIndex', ...LAYOUT_PROPS] as const) {
      if (props[name] !== undefined) this.bindProperty(name, props[name]);
    }
    const disabled = props.disabled;
    if (props.enabled === undefined && disabled !== undefined) {
      this.bindProperty('enabled', typeof disabled === 'function' ? () => !disabled() : !disabled);
    }
  }

  // ---- shared properties ---------------------------------------------------

  /** The control's text (caption, label, title…). Reactive. */
  get text(): string {
    return this.getProperty<string>('text');
  }

  set text(value: string) {
    this.setProperty('text', value ?? '');
  }

  /**
   * This control's own value, as set or bound (like the HTML `disabled`
   * attribute). Whether it can be used right now also depends on the controls
   * it sits in: see {@link isEnabled}. Reactive.
   */
  get enabled(): boolean {
    return this.getProperty<boolean>('enabled');
  }

  set enabled(value: boolean) {
    this.setProperty('enabled', !!value);
  }

  /** The inverse of {@link enabled}, as in HTML. Reactive. */
  get disabled(): boolean {
    return !this.enabled;
  }

  set disabled(value: boolean) {
    this.enabled = !value;
  }

  /**
   * Whether the control can be used now: enabled itself and in every control
   * it sits in (like CSS `:enabled`; windows opened inside do not inherit it).
   * Reactive.
   */
  get isEnabled(): boolean {
    return this.getProperty<boolean>('enabled') && (this.parentControl?.isEnabled ?? true);
  }

  /** This control's own visibility (a hidden parent does not change it). Reactive. */
  get visible(): boolean {
    return this.getProperty<boolean>('visible');
  }

  set visible(value: boolean) {
    this.setProperty('visible', !!value);
  }

  /** `false` takes the control out of the Tab order (see the prop). Reactive. */
  get tabStop(): boolean {
    return this.getProperty<boolean>('tabStop');
  }

  set tabStop(value: boolean) {
    this.setProperty('tabStop', !!value);
  }

  // ---- layout (see the props) ------------------------------------------------

  /** See the prop. Reactive. */
  get dock(): Dock {
    return this.getProperty<Dock>('dock');
  }
  set dock(value: Dock) {
    this.setProperty('dock', value ?? 'none');
  }
  get left(): Length | undefined {
    return this.getProperty<Length | undefined>('left');
  }
  set left(value: Length | undefined) {
    this.setProperty('left', value);
  }
  get top(): Length | undefined {
    return this.getProperty<Length | undefined>('top');
  }
  set top(value: Length | undefined) {
    this.setProperty('top', value);
  }
  get right(): Length | undefined {
    return this.getProperty<Length | undefined>('right');
  }
  set right(value: Length | undefined) {
    this.setProperty('right', value);
  }
  get bottom(): Length | undefined {
    return this.getProperty<Length | undefined>('bottom');
  }
  set bottom(value: Length | undefined) {
    this.setProperty('bottom', value);
  }
  get width(): Length | undefined {
    return this.getProperty<Length | undefined>('width');
  }
  set width(value: Length | undefined) {
    this.setProperty('width', value);
  }
  get height(): Length | undefined {
    return this.getProperty<Length | undefined>('height');
  }
  set height(value: Length | undefined) {
    this.setProperty('height', value);
  }
  get row(): number | undefined {
    return this.getProperty<number | undefined>('row');
  }
  set row(value: number | undefined) {
    this.setProperty('row', value);
  }
  get column(): number | undefined {
    return this.getProperty<number | undefined>('column');
  }
  set column(value: number | undefined) {
    this.setProperty('column', value);
  }
  get rowSpan(): number | undefined {
    return this.getProperty<number | undefined>('rowSpan');
  }
  set rowSpan(value: number | undefined) {
    this.setProperty('rowSpan', value);
  }
  get columnSpan(): number | undefined {
    return this.getProperty<number | undefined>('columnSpan');
  }
  set columnSpan(value: number | undefined) {
    this.setProperty('columnSpan', value);
  }

  /** See the prop. Reactive. */
  get tabIndex(): number {
    return this.getProperty<number>('tabIndex');
  }

  set tabIndex(value: number) {
    this.setProperty('tabIndex', Number(value) || 0);
  }

  /**
   * The nearest ancestor that is a `Control`, not crossing a window (a form
   * shown inside a disabled panel is not disabled by it).
   */
  get parentControl(): Control | null {
    for (let p = this.parent; p; p = p.parent) {
      if (p.element instanceof HTMLDialogElement) return null;
      if (p instanceof Control) return p;
    }
    return null;
  }

  // ---- focus -----------------------------------------------------------------

  /** The element that takes focus; the root by default. Composite controls override it. */
  protected get focusElement(): HTMLElement {
    return this.element;
  }

  /** Whether {@link focus} can succeed now: enabled, on the page, visible and focusable. */
  get canFocus(): boolean {
    const el = this.focusElement;
    return this.isEnabled && el.isConnected && isFocusable(el);
  }

  /** Whether this control's focus element has focus. Not reactive (a DOM query). */
  get focused(): boolean {
    return deepActiveElement() === this.focusElement;
  }

  /** Whether focus is on this control or anything inside it (CSS `:focus-within`). Not reactive. */
  get focusWithin(): boolean {
    const active = deepActiveElement();
    return !!active && this.element.contains(active);
  }

  /** Focuses the control; `false` when it cannot take focus. */
  focus(): boolean {
    if (!this.canFocus) return false;
    this.focusElement.focus();
    return this.focused;
  }

  // ---- keyboard ----------------------------------------------------------------

  /**
   * What the control's access key (`&Save` → Alt+S) does. Focuses it by
   * default; a button also clicks itself. Returns whether it did something.
   */
  onAccessKey(): boolean {
    return this.focus();
  }

  /**
   * A keyboard shortcut active while focus is inside this control, removed
   * when the control is disposed. See `addShortcut` for the chord syntax and
   * the rules; returns the remover.
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
    if (token === this.state.accessKeyToken) return;
    setAccessKeyAttribute(this.focusElement, this.state.accessKeyToken, token);
    this.state.accessKeyToken = token;
    if (token) installKeyboard();
  }

  // ---- property storage, for subclasses ------------------------------------

  /** Reads a property, tracked: reactive readers update when it changes. */
  protected getProperty<T>(name: string): T {
    const slot = this.slot(name);
    // Read the counter only to register the dependency.
    void (slot.version ??= createSignal(0)).value;
    return slot.value as T;
  }

  /** Sets a property from code: replaces a getter prop bound to it, then stores and renders. */
  protected setProperty(name: string, value: unknown): void {
    const slot = this.slot(name);
    slot.stop?.();
    slot.stop = undefined;
    this.store(name, slot, value);
  }

  /**
   * Binds a property to a prop: a getter becomes one effect that keeps it in
   * sync, a plain value is stored once. Subclasses call this for their own
   * properties, typically from the constructor.
   */
  protected bindProperty(name: string, prop: Bind<unknown>): void {
    const slot = this.slot(name);
    slot.stop?.();
    slot.stop = undefined;
    if (typeof prop !== 'function') {
      this.store(name, slot, prop);
      return;
    }
    const stop = effect(() => {
      const value = (prop as () => unknown)();
      untracked(() => this.store(name, slot, value));
    });
    slot.stop = stop;
    this.motif.setDisposable(stop);
  }

  /**
   * Renders a property without an effect: `apply` runs now with the current
   * value and again on every change, whether it comes from a getter prop or
   * from code. E.g. `this.observeProperty('text', (t) => (label.data = t))`.
   */
  protected observeProperty<T>(name: string, apply: (value: T) => void): void {
    const slot = this.slot(name);
    (slot.appliers ??= []).push(apply as (value: unknown) => void);
    apply(slot.value as T);
  }

  private slot(name: string): Slot {
    const slots = (this.state.slots ??= new Map());
    let slot = slots.get(name);
    if (!slot) slots.set(name, (slot = { value: DEFAULTS[name] }));
    return slot;
  }

  private store(name: string, slot: Slot, value: unknown): void {
    if (Object.is(slot.value, value)) return;
    slot.value = value;
    this.applyProperty(name, value);
    if (slot.appliers) for (const apply of slot.appliers) apply(value);
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
    } else if (name === 'dock') {
      // The dock host watches this attribute and lays its children out again.
      if (value && value !== 'none') this.element.setAttribute('data-dock', String(value));
      else this.element.removeAttribute('data-dock');
    } else if (LENGTH_CSS[name as LayoutProp]) {
      const css = toLength(value as Length | undefined);
      if (css) this.element.style.setProperty(LENGTH_CSS[name as LayoutProp]!, css);
      else this.element.style.removeProperty(LENGTH_CSS[name as LayoutProp]!);
    } else if (name === 'row' || name === 'rowSpan') {
      this.element.style.gridRow = gridLine(this.peekProperty('row'), this.peekProperty('rowSpan'));
    } else if (name === 'column' || name === 'columnSpan') {
      this.element.style.gridColumn = gridLine(this.peekProperty('column'), this.peekProperty('columnSpan'));
    }
  }

  /** A property's current value without tracking it. */
  protected peekProperty<T>(name: string): T | undefined {
    return this.state.slots?.get(name)?.value as T | undefined;
  }

  private applyEnabled(enabled: boolean): void {
    if (!enabled && !this.state.enableRelease) {
      this.state.enableRelease = disableSubtree(this.element);
      this.element.setAttribute('data-disabled', '');
      if (!this.state.enableCleanupRegistered) {
        this.state.enableCleanupRegistered = true;
        this.motif.setDisposable(() => this.state.enableRelease?.());
      }
    } else if (enabled && this.state.enableRelease) {
      this.state.enableRelease();
      this.state.enableRelease = null;
      this.element.removeAttribute('data-disabled');
    }
  }

  private applyVisible(visible: boolean): void {
    if (visible) {
      void this.motif.show();
      return;
    }
    rescueTarget(this.element)?.focus();
    void this.motif.hide();
  }

  private applyTabStop(tabStop: boolean): void {
    const el = this.focusElement;
    if (!tabStop && this.state.tabindexBeforeStop === undefined) {
      this.state.tabindexBeforeStop = el.getAttribute('tabindex');
      el.setAttribute('tabindex', '-1');
    } else if (tabStop && this.state.tabindexBeforeStop !== undefined) {
      const original = this.state.tabindexBeforeStop;
      this.state.tabindexBeforeStop = undefined;
      if (original === null) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', original);
    }
  }

  // ---- x-model and locale, for subclasses ----------------------------------

  /**
   * Whether the control is bound with `x-model` (core writes the bound state
   * to the control's `value` property). Known once the control is configured.
   */
  protected get hasModel(): boolean {
    return !!this.modelBinding();
  }

  /** Writes a new value back to the state bound with `x-model` (two-way binding). */
  protected writeModel(value: unknown): void {
    this.modelBinding()?.setter?.(value);
  }

  private modelBinding(): ModelBinding | undefined {
    // Cached once found; looked up again until then (bindings are added while building).
    return (this.state.model ??= (this.bindings.items as unknown as ModelBinding[]).find(
      (b) => b.propertyName === 'value' && typeof b.setter === 'function',
    ));
  }

  /** The texts this control writes itself: the app's `UiLocale` (DI), else the shared one. Reactive. */
  protected get strings(): UiStrings {
    return (this.state.localeStrings ??= localeOf(this).strings);
  }
}

/** The element that takes a control's focus (its protected `focusElement`), for controls that point at another one (Label). */
export function focusElementOf(control: Control): HTMLElement {
  return (control as unknown as { focusElement: HTMLElement }).focusElement;
}

/** CSS `grid-row` / `grid-column` for a 1-based line and a span; empty when neither is set. */
function gridLine(index: number | undefined, span: number | undefined): string {
  const n = span && span > 1 ? span : 1;
  if (index === undefined || index === null) return n > 1 ? `span ${n}` : '';
  return `${index} / span ${n}`;
}
