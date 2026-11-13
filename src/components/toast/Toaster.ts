import { Component, type Bind, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { loose, part, removePart } from '../../core/draw-parts';
import { put, text as writeText } from '../../core/part-writes';
import { onDocument } from '../../core/window-events';
import { placeOnPage } from '../../core/page-layer';
import { afterStyle, measure, transitionTime } from '../../core/measure';
import { holdsFocus, rememberFocus } from '../../core/focus';
import type { FocusMark } from '../../core/focus-mark';
import { addShortcut } from '../../core/keyboard';
import { uiLocale } from '../../core/ui-locale';
import { Toast } from './Toast';
import type { ToastPosition } from './toast-position';
import type { ToastProps } from './toast-props';
import type { ToasterProps } from './toaster-props';
import { onLanguage } from '../../core/on-language';

const OWN = ['position', 'max', 'hotkey', 'pauseOnHover'] as const;

/** The parts of a toaster. On one object made on first use: the base constructor already renders. */
interface Parts {
  /** A stack per position, a component of the toaster: its toasts are its children. */
  stacks: Map<ToastPosition, Component<HTMLDivElement>>;
  polite: Component<HTMLDivElement>;
  assertive: Component<HTMLDivElement>;
  /** Each shown toast's line in a live area. */
  lines: Map<Toast, Component<HTMLDivElement>>;
  shown: Toast[];
  waiting: Toast[];
  hovered: boolean;
  focused: boolean;
  /** Where focus was before it came into the toasts. */
  returnFocus: FocusMark | null;
  /** Where focus is while it is outside the toasts: `returnFocus` once it comes in. */
  focusOutside: FocusMark | null;
  /** Stops following focus on the page, which starts with the first toast shown. */
  stopFocusWatch: (() => void) | null;
  removeHotkey: (() => void) | null;
  placedItself: boolean;
  /** The page element it placed itself in, when it is in no component tree. */
  /** Made by `Toaster.default` itself, not by the app. */
  made: boolean;
}

const PARTS = Symbol('mx.toaster');

let defaultToaster: Toaster | null = null;

/**
 * The toasters of each hotkey: they share one shortcut (two would clash, and only the first would run), and the key
 * goes to the newest toast among them, as from anywhere on the page.
 */
const hotkeyHolders = new Map<string, { toasters: Set<Toaster>; remove: () => void }>();
/** The order the toasts came on the screen in, across toasters: the newest is the hotkey's. */
const presentedAt = new WeakMap<Toast, number>();
let presentations = 0;

/**
 * The region that shows toasts: a landmark named "Notifications" (`uiLocale`) holding a stack at
 * each edge position in use, with the newest nearest the edge and at most `max` per position (the rest wait
 * their turn). Screen readers announce info and success toasts politely, and caution and danger toasts immediately.
 * Toasts never take focus. Tab reaches them where the toaster sits on the page (the default one is the
 * last element in `document.body`), and `hotkey` (F8) moves to the newest toast and back.
 *
 * `toast.show()` uses `Toaster.default`: one created on first use, or the one you assign.
 *
 * @example
 * <Toaster position="top" max={2} ref={(t) => (Toaster.default = t)} />
 *
 * const uploads = new Toaster({ position: 'bottom-start', text: 'Uploads' });
 * uploads.success('photo.jpg is uploaded.');
 */
export class Toaster extends Control<HTMLElement, ToasterProps> {
  /** The toaster used by `toast.show()`, created in `document.body` on first use unless you set one. */
  static get default(): Toaster {
    if (defaultToaster?.isDisposed) defaultToaster = null;
    if (!defaultToaster) {
      defaultToaster = new Toaster();
      defaultToaster.parts.made = true;
    }
    return defaultToaster;
  }
  static set default(value: Toaster) {
    const old = defaultToaster;
    defaultToaster = value;
    if (old && old !== value && old.parts.made && !old.parts.shown.length && !old.parts.waiting.length) void old.dispose();
  }

  constructor(props?: IBaseProp<ToasterProps>) {
    super('section', props);
    const own = (this.props ?? {}) as ToasterProps;
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    const parts = this.parts;
    const drawName = () => put(this, 'aria-label', this.text || uiLocale.strings.notifications);
    const stopName = onLanguage(this, drawName);
    this.observeProperty('text', drawName);
    this.observeProperty('hotkey', () => this.renderHotkey());
    this.observeProperty('max', () => this.fill());
    this.observeProperty('pauseOnHover', () => this.updatePause());

    this.motif.on('pointerenter', () => {
      parts.hovered = true;
      this.updatePause();
    });
    this.motif.on('pointerleave', () => {
      parts.hovered = false;
      this.updatePause();
    });
    // Focus that goes nowhere (to the page itself, or another window) lands nowhere: no `focusLanded` follows.
    this.motif.on('focusout', (_, e) => {
      if (e.relatedTarget) return;
      parts.focused = false;
      this.updatePause();
    });
    this.motif.on('keydown', (_, e) => this.keyDown(e));
    // A hidden page lets no toast time out.
    const stopVisibility = onDocument(this, 'visibilitychange', () => this.updatePause());
    this.motif.setDisposable(() => {
      stopName();
      stopVisibility();
      parts.stopFocusWatch?.();
      parts.removeHotkey?.();
      for (const t of parts.waiting.splice(0)) void t.dispose();
      parts.shown.length = 0;
      if (defaultToaster === this) defaultToaster = null;
    });
  }

  // Properties (see ToasterProps).

  get position(): ToastPosition {
    return this.getProperty<ToastPosition | undefined>('position') ?? 'bottom-end';
  }
  set position(value: Bind<ToastPosition>) {
    this.assignProperty('position', value);
  }
  get max(): number {
    return this.getProperty<number | undefined>('max') ?? 3;
  }
  set max(value: Bind<number>) {
    this.assignProperty('max', value, Number);
  }
  get hotkey(): string {
    return this.getProperty<string | undefined>('hotkey') ?? 'F8';
  }
  set hotkey(value: Bind<string>) {
    this.assignProperty('hotkey', value);
  }
  get pauseOnHover(): boolean {
    return this.getProperty<boolean | undefined>('pauseOnHover') ?? true;
  }
  set pauseOnHover(value: Bind<boolean>) {
    this.assignProperty('pauseOnHover', value, Boolean);
  }

  /** The toasts on screen, followed by the waiting ones. */
  get toasts(): readonly Toast[] {
    return [...this.parts.shown, ...this.parts.waiting];
  }

  /** Indicates whether the timers are currently paused: the pointer or focus is on the toasts, or the page is hidden. */
  get paused(): boolean {
    const parts = this.parts;
    const hover = parts.hovered && (this.peekProperty<boolean>('pauseOnHover') ?? true);
    return hover || parts.focused || (typeof document !== 'undefined' && document.visibilityState === 'hidden');
  }

  // Showing.

  /** Shows a toast, or queues it when `max` are showing at its position, and returns it. */
  show(options: ToastProps | Toast): Toast {
    const t = options instanceof Toast ? options : new Toast(options);
    if (t.isClosed || t.toaster) return t;
    t.join(this);
    this.placeInPage();
    if (this.countAt(this.positionOf(t)) < this.max) this.present(t);
    else this.parts.waiting.push(t);
    return t;
  }

  info(text: Bind<string>, options: ToastProps = {}): Toast {
    return this.show({ ...options, text, tone: 'info' });
  }

  success(text: Bind<string>, options: ToastProps = {}): Toast {
    return this.show({ ...options, text, tone: 'success' });
  }

  caution(text: Bind<string>, options: ToastProps = {}): Toast {
    return this.show({ ...options, text, tone: 'caution' });
  }

  danger(text: Bind<string>, options: ToastProps = {}): Toast {
    return this.show({ ...options, text, tone: 'danger' });
  }

  /** Closes every toast, including the waiting ones. */
  closeAll(): void {
    const parts = this.parts;
    for (const t of parts.waiting.splice(0)) t.close('code');
    for (const t of [...parts.shown]) t.close('code');
  }

  /** Moves focus to the newest toast. Returns `false` if there is none or it cannot take focus. */
  focusNewest(): boolean {
    const newest = this.parts.shown.at(-1);
    return !!newest && newest.focus();
  }

  /** @internal Whether `toast` is on the screen here. */
  isShowing(toast: Toast): boolean {
    return this.parts.shown.includes(toast);
  }

  /** @internal Reads `toast` out in the live area of its tone. */
  announce(toast: Toast): void {
    const parts = this.parts;
    removePart(parts.lines.get(toast));
    const text = toast.announcement;
    if (!text) return;
    const line = loose<HTMLDivElement>('div');
    parts.lines.set(toast, line);
    const live = toast.tone === 'danger' || toast.tone === 'caution' ? parts.assertive : parts.polite;
    // A moment later, so the live area exists before what it reads changes.
    setTimeout(() => {
      if (parts.lines.get(toast) !== line) return;
      writeText(line, text);
      live.controls.add(line);
    }, 50);
  }

  /** @internal Takes away a toast that closed. */
  release(toast: Toast): void {
    const parts = this.parts;
    const waiting = parts.waiting.indexOf(toast);
    if (waiting >= 0) {
      parts.waiting.splice(waiting, 1);
      void toast.dispose();
      return;
    }
    const at = parts.shown.indexOf(toast);
    if (at < 0) return;
    parts.shown.splice(at, 1);
    removePart(parts.lines.get(toast));
    parts.lines.delete(toast);
    if (holdsFocus(toast)) {
      // To the toast beside it in its stack, else back where focus came from.
      const next = [toast.siblings.next(), toast.siblings.prev()].find((t): t is Toast => t instanceof Toast && this.isShowing(t));
      if (!next?.focus()) parts.returnFocus?.restore();
    }
    put(toast, 'data-state', 'leaving');
    const position = this.positionOf(toast);
    const done = () => {
      toast.parent?.controls.remove(toast);
      this.fill(position);
    };
    // Read once the leaving style is in effect: its transition is the one to wait for.
    measure(this, () => transitionTime(toast), (time) => {
      if (time > 0) setTimeout(done, time);
      else done();
    });
  }

  // Parts.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.class.add('mx-toaster');
    this.attr.add({ role: 'region' });
    const polite = part<HTMLDivElement>(this, 'div', 'mx-sr-only');
    polite.attr.add({ role: 'status' });
    const assertive = part<HTMLDivElement>(this, 'div', 'mx-sr-only');
    assertive.attr.add({ role: 'alert' });
    return {
      stacks: new Map(),
      polite,
      assertive,
      lines: new Map(),
      shown: [],
      waiting: [],
      hovered: false,
      focused: false,
      returnFocus: null,
      focusOutside: null,
      stopFocusWatch: null,
      removeHotkey: null,
      placedItself: false,
      made: false,
    };
  }

  private placeInPage(): void {
    if (this.parent) return;
    // In no component tree: in the page's layer, so what its toasts show mounts.
    placeOnPage(this, this);
    this.parts.placedItself = true;
  }

  private positionOf(toast: Toast): ToastPosition {
    return toast.position ?? this.position;
  }

  private countAt(position: ToastPosition): number {
    return this.parts.shown.filter((t) => this.positionOf(t) === position).length;
  }

  private stack(position: ToastPosition): Component<HTMLDivElement> {
    const parts = this.parts;
    let stack = parts.stacks.get(position);
    if (!stack) {
      stack = new Component<HTMLDivElement>('div');
      stack.class.add('mx-toaster__stack');
      stack.attr.add({ 'data-position': position });
      this.controls.add(stack);
      parts.stacks.set(position, stack);
    }
    return stack;
  }

  private present(toast: Toast): void {
    const position = this.positionOf(toast);
    const stack = this.stack(position);
    this.followFocus();
    this.parts.shown.push(toast);
    presentedAt.set(toast, ++presentations);
    // Newest nearest the edge: first at the top, last at the bottom.
    if (position.startsWith('top')) stack.controls.insert(0, toast);
    else stack.controls.add(toast);
    put(toast, 'data-state', 'entering');
    // The entering style must be in effect before it changes, for the transition to run.
    afterStyle(toast, () => {
      if (this.isShowing(toast)) put(toast, 'data-state', 'shown');
    });
    this.announce(toast);
    toast.restart();
  }

  /** Shows waiting toasts while there is room. */
  private fill(position?: ToastPosition): void {
    const parts = this.parts;
    const max = this.peekProperty<number>('max') ?? 3;
    for (const t of [...parts.waiting]) {
      const at = this.positionOf(t);
      if (position && at !== position) continue;
      if (this.countAt(at) >= max) continue;
      parts.waiting.splice(parts.waiting.indexOf(t), 1);
      this.present(t);
    }
  }

  private updatePause(): void {
    const paused = this.paused;
    for (const t of this.parts.shown) {
      if (paused) t.pause();
      else t.resume();
    }
  }

  /** From the first toast on, follows where focus lands on the page, so focus brought in by Tab, a press, the hotkey or code can go back. */
  private followFocus(): void {
    const parts = this.parts;
    if (parts.stopFocusWatch) return;
    parts.focusOutside = rememberFocus();
    parts.stopFocusWatch = onDocument(this, 'focusin', (e) => this.focusLanded(e), true);
  }

  /** Where focus lands outside the toasts is where it goes back to once it comes into them. */
  private focusLanded(e: FocusEvent): void {
    const parts = this.parts;
    const inside = this.motif.isEventFrom(e);
    if (!inside) parts.focusOutside = rememberFocus(e);
    else if (!parts.focused) parts.returnFocus = parts.focusOutside ?? parts.returnFocus;
    if (parts.focused === inside) return;
    parts.focused = inside;
    this.updatePause();
  }

  private renderHotkey(): void {
    const parts = this.parts;
    const hotkey = this.peekProperty<string>('hotkey') ?? 'F8';
    parts.removeHotkey?.();
    parts.removeHotkey = null;
    if (!hotkey) {
      put(this, 'aria-keyshortcuts', null);
      return;
    }
    put(this, 'aria-keyshortcuts', hotkey);
    parts.removeHotkey = Toaster.holdHotkey(hotkey, this);
  }

  /** Joins `toaster` to the toasters of `hotkey`, the first one adding its shortcut; returns what takes it out (the last one removes it). */
  private static holdHotkey(hotkey: string, toaster: Toaster): () => void {
    let held = hotkeyHolders.get(hotkey);
    if (!held) {
      const toasters = new Set<Toaster>();
      const remove = addShortcut(hotkey, () => Toaster.hotkeyPressed(toasters), {
        inEditable: true,
        name: 'toaster.focus',
        text: () => uiLocale.strings.toasterFocusKey,
        category: () => uiLocale.strings.shortcutsNotifications,
      });
      held = { toasters, remove };
      hotkeyHolders.set(hotkey, held);
    }
    const own = held;
    own.toasters.add(toaster);
    return () => {
      if (!own.toasters.delete(toaster) || own.toasters.size) return;
      own.remove();
      if (hotkeyHolders.get(hotkey) === own) hotkeyHolders.delete(hotkey);
    };
  }

  /** In a toast, focus goes back where it was; elsewhere, to the newest toast of these toasters. */
  private static hotkeyPressed(toasters: ReadonlySet<Toaster>): boolean {
    const all = [...toasters];
    const inside = all.find((t) => holdsFocus(t));
    if (inside) return !!inside.parts.returnFocus?.restore();
    const newest = (t: Toaster) => {
      const last = t.parts.shown.at(-1);
      return last ? (presentedAt.get(last) ?? 0) : -1;
    };
    return all.sort((a, b) => newest(b) - newest(a)).some((t) => t.focusNewest());
  }

  private keyDown(e: KeyboardEvent): void {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const toast = this.parts.shown.find((t) => t.motif.isEventFrom(e));
    if (!toast) return;
    e.preventDefault();
    e.stopPropagation();
    toast.close('escape');
  }
}
