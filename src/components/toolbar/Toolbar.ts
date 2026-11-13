import { Emitter, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { parseAccessKey } from '../../core/access-key';
import { Control } from '../../core/control';
import { follow } from '../../core/follow';
import type { ControlSize } from '../../core/control-size';
import type { IconSource } from '../../core/icon-source';
import { focusInArrowField, rememberFocus } from '../../core/focus';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { commands } from '../../core/command-registry';
import { namesCommands, runItem, valueOf } from '../../core/command-fields';
import { moreMark } from '../../core/glyphs';
import { isElement } from '../../core/node-kind';
import { boxOf, canMeasure, isRendered, isRtl, measure, onLayout, readAgain, rectOf, styleOf, type Size } from '../../core/measure';
import { mark, put } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import type { MenuItem } from '../../parts/menu/menu-item';
import { Popup } from '../../parts/popup/Popup';
import { Button } from '../button/Button';
import { menuItemOf } from '../button/menu-item-of';
import type { ButtonProps } from '../button/button-props';
import type { ButtonVariant } from '../button/button-variant';
import { ToolbarSeparator } from './ToolbarSeparator';
import type { ToolbarItem } from './toolbar-item';
import type { ToolbarItemClickEventArgs } from './toolbar-item-click-event-args';
import type { ToolbarItemOverflow } from './toolbar-item-overflow';
import type { ToolbarItemType } from './toolbar-item-type';
import type { ToolbarOrientation } from './toolbar-orientation';
import type { ToolbarOverflow } from './toolbar-overflow';
import type { ToolbarProps } from './toolbar-props';
import { onLanguage } from '../../core/on-language';

const OWN = ['items', 'orientation', 'size', 'buttonVariant', 'overflow'] as const;

/** A control made for an item of `items`. */
interface Made {
  control: Control;
  type: ToolbarItemType;
}

/** A control of the bar and how it can leave it for the "more" menu. */
interface Kid {
  part: ComponentBase;
  control: Control | undefined;
  overflow: ToolbarItemOverflow;
  separator: boolean;
  /** A button: it has a menu item to become. */
  movable: boolean;
}

/** The bar as read for the overflow: its room along the bar, the gap between parts, and the size of each part that shows. */
interface Bar {
  kids: readonly Kid[];
  room: number;
  gap: number;
  sizes: Map<Kid, number>;
  /** The bar's own room along it, as its size watch reports it (its content box). */
  length: number;
  /** The bar is laid out on the page (no hidden part holds it). */
  shown: boolean;
}

interface Parts {
  made: Map<ToolbarItem, Made>;
  overflowOf: Map<ToolbarItem, ToolbarItemOverflow>;
  stopItems: (() => void) | null;
  /** The controls given the toolbar's size and variant. */
  styled: WeakSet<Control>;
  /** The control Tab reaches. */
  current: Control | null;
  /** The controls the overflow calculation put in the "more" menu. */
  overflowed: Set<Control>;
  more: Button | null;
  stopMoreLabel: (() => void) | null;
  restyleQueued: boolean;
  /** The bar's parts as put back for the next overflow reading. */
  laying: readonly Kid[];
  /** The room along the bar the last fit was laid out for. */
  laidOut: number;
  /** The room along the bar as its size observer last told it; null until it does. */
  room: number | null;
  /** The gap between the bar's parts, as last read with its look. */
  gap: number | null;
  /** Each part's size along the bar, as last laid out on it (-1: it does not show); a part in the "more" menu keeps it. */
  sizes: Map<ComponentBase, number>;
  /** The size watches of the parts. */
  watched: Map<ComponentBase, () => void>;
  /** The parts the last fit put in the "more" menu (separators too). */
  out: Set<ComponentBase>;
  /** The "more" button's size along the bar as last measured; null until it is, and after a change of look. */
  moreLength: number | null;
  itemClick: Emitter<ToolbarItemClickEventArgs>;
}

const PARTS = Symbol('mx.toolbar');

/**
 * A bar of commands (`role="toolbar"`): buttons, toggle buttons, menus and fields, in groups
 * between separators. It is one Tab stop. Left and Right (Up and Down when vertical) and Home and
 * End move between its controls, while a text field keeps the arrow keys for its text. Items are defined
 * as data (`items`) and as JSX children. Items that do not fit move into an overflow menu at the
 * end (`overflow`), where they keep their names, checks and menus.
 *
 * @example
 * <Toolbar label="Format" items={[
 *   { type: 'toggle', icon: boldIcon, hint: 'Bold', pressed: () => this.doc.bold, click: () => this.doc.toggleBold() },
 *   { type: 'separator' },
 *   { text: '&Save', click: () => this.save() },
 * ]}>
 *   <TextBox label="Find" labelMode="hidden" />
 * </Toolbar>
 *
 * const bar = new Toolbar({ label: 'Actions', size: 'sm' });
 * bar.controls.add(new Button({ text: 'Refresh', onclick: () => this.load() }));
 */
export class Toolbar extends Control<HTMLDivElement, ToolbarProps> {
  constructor(props?: IBaseProp<ToolbarProps>) {
    super(props);
    const own = (this.props ?? {}) as ToolbarProps;
    const parts = this.parts;
    this.attr.add({ role: 'toolbar' });
    this.observeProperty<string>('text', (text) => {
      const label = parseAccessKey(text ?? '').text;
      if (label) put(this, 'aria-label', label);
      else put(this, 'aria-label', null);
    });
    this.observeProperty('orientation', () => this.renderLook());
    this.observeProperty('size', () => this.renderLook());
    this.observeProperty('overflow', () => this.renderLook());
    this.observeProperty('items', () => this.followItems());
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    if (own.onItemClick) this.onItemClick(own.onItemClick);
    this.listen();
    // Items that name commands take their fields from them: read again when the commands change.
    const listening = commands.onChanged(() => {
      if (namesCommands(givenList(this.peekProperty<readonly ToolbarItem[]>('items')))) this.refresh();
    });
    this.motif.setDisposable(() => {
      listening.dispose();
      parts.stopItems?.();
      parts.stopMoreLabel?.();
      parts.itemClick.dispose();
    });
  }

  // Properties (see ToolbarProps).

  get label(): string {
    return this.text;
  }
  set label(value: Bind<string>) {
    this.text = value;
  }
  get items(): readonly ToolbarItem[] {
    return this.getProperty<readonly ToolbarItem[] | undefined>('items') ?? [];
  }
  set items(value: Bind<readonly ToolbarItem[]>) {
    this.assignProperty('items', value);
  }
  get orientation(): ToolbarOrientation {
    return this.getProperty<ToolbarOrientation | undefined>('orientation') ?? 'horizontal';
  }
  set orientation(value: Bind<ToolbarOrientation>) {
    this.assignProperty('orientation', value);
  }
  get size(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ControlSize>) {
    this.assignProperty('size', value);
  }
  get buttonVariant(): ButtonVariant {
    return this.getProperty<ButtonVariant | undefined>('buttonVariant') ?? 'ghost';
  }
  set buttonVariant(value: Bind<ButtonVariant>) {
    this.assignProperty('buttonVariant', value);
  }
  get overflow(): ToolbarOverflow {
    return this.getProperty<ToolbarOverflow | undefined>('overflow') ?? 'menu';
  }
  set overflow(value: Bind<ToolbarOverflow>) {
    this.assignProperty('overflow', value);
  }

  /** The controls currently in the overflow menu. Reactive. */
  get overflowed(): readonly Control[] {
    return this.getProperty<readonly Control[] | undefined>('overflowed') ?? [];
  }

  /** Occurs when an item in `items` is clicked, after its own `click`. */
  get onItemClick(): MotifEvent<ToolbarItemClickEventArgs> {
    return this.parts.itemClick.event;
  }

  /** The control created for an item in `items`. */
  controlOf(item: ToolbarItem): Control | null {
    return this.parts.made.get(item)?.control ?? null;
  }

  /** Recalculates which items fit, for example after their content changes size. */
  updateOverflow(): void {
    this.layout();
  }

  /**
   * Re-reads the items after they have been changed in place, including the list and each item's fields. Your items
   * can be plain or reactive, and the toolbar reads them as they are.
   */
  refresh(): void {
    for (const [item, made] of this.parts.made) this.fill(item, made);
    this.followItems();
  }

  override get focusPart(): Control | null {
    return this.parts.current ?? this.stops()[0] ?? null;
  }

  protected override applyProperty(name: string, value: unknown): void {
    if (name === 'tabStop') {
      this.queueRestyle();
      return;
    }
    super.applyProperty(name, value);
  }

  // Items.

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.class.add('mx-toolbar');
    return {
      made: new Map(),
      overflowOf: new Map(),
      stopItems: null,
      styled: new WeakSet(),
      current: null,
      overflowed: new Set(),
      more: null,
      stopMoreLabel: null,
      restyleQueued: false,
      laying: [],
      laidOut: -1,
      room: null,
      gap: null,
      sizes: new Map(),
      watched: new Map(),
      out: new Set(),
      moreLength: null,
      itemClick: new Emitter(),
    };
  }

  /** Makes the controls of `items` again when the list, an item's type or its overflow changes, or on `reState()`. */
  private followItems(): void {
    const parts = this.parts;
    parts.stopItems?.();
    const items = this.peekProperty<readonly ToolbarItem[]>('items') ?? [];
    // The getter and the items' own functions are tracked; the list and the fields are not.
    parts.stopItems = follow(
      this,
      'items',
      () =>
        givenList(items).map((item) => ({
          item,
          type: givenField<ToolbarItemType | undefined>(item, 'type') ?? 'button',
          overflow: givenField<ToolbarItemOverflow | undefined>(item, 'overflow') ?? 'auto',
        })),
      (wanted) => this.place(wanted),
    );
  }

  private place(wanted: readonly { item: ToolbarItem; type: ToolbarItemType; overflow: ToolbarItemOverflow }[]): void {
    const parts = this.parts;
    const made = new Map<ToolbarItem, Made>();
    parts.overflowOf.clear();
    for (const { item, type, overflow } of wanted) {
      const old = parts.made.get(item);
      made.set(item, old && old.type === type ? old : { control: this.make(item, type), type });
      parts.overflowOf.set(item, overflow);
    }
    for (const [item, old] of parts.made) if (made.get(item) !== old) this.controls.remove(old.control);
    parts.made = made;
    // The items come first, in their order, before the JSX children. Core places them (a hidden
    // one as its placeholder), and only once the toolbar is built.
    let index = 0;
    for (const { control } of made.values()) {
      if (!this.controls.items.includes(control)) this.controls.add(index, control);
      else if (this.controls.items.indexOf(control) !== index) this.controls.moveToIndex(control, index);
      index++;
    }
    this.queueRestyle();
    this.layout();
  }

  private make(item: ToolbarItem, type: ToolbarItemType): Control {
    const field = <K extends keyof ToolbarItem>(name: K) => valueOf<ToolbarItem[K]>(item, name, this, name === 'pressed' ? 'checked' : name);
    if (type === 'separator') return new ToolbarSeparator({ visible: field('visible') });
    const props: ButtonProps = { text: field('text'), icon: field('icon'), hint: field('hint'), tone: field('tone'), enabled: field('enabled'), visible: field('visible') };
    if (type === 'toggle') {
      props.toggle = true;
      props.pressed = field('pressed');
    }
    if (type === 'menu') props.menu = field('menu') ?? [];
    const button = new Button(props);
    this.adopt(button);
    if (type !== 'menu') button.motif.on('click', (_, e) => this.itemPressed(item, button, e));
    return button;
  }

  /** Gives a made control the item's fields again, as they are now. */
  private fill(item: ToolbarItem, made: Made): void {
    const field = <K extends keyof ToolbarItem>(name: K) => valueOf<ToolbarItem[K]>(item, name, this, name === 'pressed' ? 'checked' : name);
    made.control.visible = field('visible') ?? true;
    if (!(made.control instanceof Button)) return;
    const button = made.control;
    button.text = field('text') ?? '';
    button.icon = (field('icon') ?? null) as Bind<IconSource | null>;
    button.hint = field('hint') ?? '';
    button.tone = field('tone') ?? 'standard';
    button.enabled = field('enabled') ?? true;
    const pressed = field('pressed');
    if (made.type === 'toggle' && pressed !== undefined) button.pressed = pressed;
    if (made.type === 'menu') {
      button.menu = field('menu') ?? [];
      button.refresh();
    }
  }

  private itemPressed(item: ToolbarItem, button: Button, event: Event): void {
    const args: ToolbarItemClickEventArgs = { item, source: this, event };
    runItem(item, args, this, event, this);
    // A click set the toggle's own state; one bound to the app follows the app again.
    const pressed = valueOf<ToolbarItem['pressed']>(item, 'pressed', this, 'checked');
    if (typeof pressed === 'function') button.pressed = pressed;
    this.parts.itemClick.fire(args);
  }

  /**
   * Gives a control the toolbar's size, and a button its variant, unless it has its own. A button
   * the toolbar is given no size or variant for takes them from the toolbar's button place.
   */
  private adopt(control: Control): void {
    const parts = this.parts;
    if (parts.styled.has(control)) return;
    parts.styled.add(control);
    const own = (control.props ?? {}) as { size?: unknown; variant?: unknown };
    const target = control as unknown as { size?: Bind<ControlSize>; variant?: Bind<ButtonVariant> };
    const isButton = control instanceof Button;
    if ('size' in control && own.size === undefined) target.size = isButton ? () => this.givenSize() : () => this.size;
    if (isButton && own.variant === undefined) target.variant = () => this.givenButtonVariant();
  }

  /** The size the toolbar is given; none: its buttons' place decides. */
  private givenSize(): ControlSize {
    return this.getProperty<ControlSize | undefined>('size') as ControlSize;
  }

  /** The button variant the toolbar is given; none: its buttons' place decides. */
  private givenButtonVariant(): ButtonVariant {
    return this.getProperty<ButtonVariant | undefined>('buttonVariant') as ButtonVariant;
  }

  // The bar's controls: styling, roving focus.

  private kids(): Kid[] {
    const parts = this.parts;
    const kids: Kid[] = [];
    for (const part of this.barContent()) {
      const control = part instanceof Control ? part : undefined;
      const item = control && [...parts.made].find(([, made]) => made.control === control)?.[0];
      // A JSX child says it with `data-overflow`.
      const overflow = (item ? parts.overflowOf.get(item) : (part.attr.get('data-overflow') as ToolbarItemOverflow | null)) ?? 'auto';
      const button = control instanceof Button && !(control.hasMenu && control.dropDown);
      kids.push({ part, control, overflow, separator: control instanceof ToolbarSeparator, movable: button });
    }
    return kids;
  }

  /** The parts in the bar in order, without the "more" button. For a list or a condition, the parts it holds. */
  private barContent(from: ComponentBase = this, found: ComponentBase[] = []): ComponentBase[] {
    for (const part of from.controls.items) {
      if (part === this.parts.more) continue;
      if (isElement(part.element)) found.push(part);
      else this.barContent(part, found);
    }
    return found;
  }

  /** The controls the arrow keys visit, in order; the "more" button last. Read from the controls, not from the page. */
  private stops(): Control[] {
    const parts = this.parts;
    const more = parts.more;
    const stops = this.barContent().filter(
      (c): c is Control =>
        c instanceof Control && !(c instanceof ToolbarSeparator) && c.visible && c.enabled && this.shownInBar(c) && !parts.overflowed.has(c),
    );
    if (more && more.visible && parts.overflowed.size) stops.push(more);
    return stops;
  }

  /** Neither the part nor a list or condition holding it in the bar is hidden or waiting (`x-wait`, `x-display`, `motif.hide`). */
  private shownInBar(part: ComponentBase): boolean {
    for (let c: ComponentBase | null = part; c && c !== this; c = c.parent) if (!c.isVisible || c.isWait) return false;
    return true;
  }

  /** A control added to the bar or taken away: the arrows and the room follow. The "more" button is no part of the bar. */
  private childChanged(control: ComponentBase): void {
    if (control === this.parts.more) return;
    this.queueRestyle();
    this.layout();
  }

  protected override childEnabledChanged(): void {
    this.queueRestyle();
  }

  private queueRestyle(): void {
    const parts = this.parts;
    if (parts.restyleQueued) return;
    parts.restyleQueued = true;
    queueMicrotask(() => {
      parts.restyleQueued = false;
      if (!this.isDisposed) untracked(() => this.restyle());
    });
  }

  private restyle(): void {
    const parts = this.parts;
    // The "more" button stays last among its children.
    const more = parts.more;
    const items = this.controls.items;
    if (more && more.parent === this && items[items.length - 1] !== more) this.controls.move(more, null);
    const vertical = this.peekProperty<ToolbarOrientation>('orientation') === 'vertical';
    for (const kid of this.kids()) {
      if (kid.control) this.adopt(kid.control);
      if (kid.separator) put(kid.part, 'aria-orientation', vertical ? 'horizontal' : 'vertical');
    }
    this.renderRoving();
  }

  private renderRoving(): void {
    const parts = this.parts;
    const stops = this.stops();
    let current: Control | undefined = parts.current && stops.includes(parts.current) ? parts.current : stops[0];
    parts.current = current ?? null;
    if (this.peekProperty('tabStop') === false) current = undefined;
    for (const c of stops) c.tabStop = c === current;
  }

  private renderLook(): void {
    const orientation = this.peekProperty<ToolbarOrientation>('orientation') ?? 'horizontal';
    put(this, 'data-orientation', orientation);
    put(this, 'data-size', this.peekProperty<ControlSize>('size') ?? 'md');
    put(this, 'data-overflow', this.peekProperty<ToolbarOverflow>('overflow') ?? 'menu');
    put(this, 'aria-orientation', orientation);
    this.queueRestyle();
    this.parts.moreLength = null;
    this.layout();
  }

  // Overflow.

  /**
   * Puts back every item, then has the overflow read with the window's next frame (`menu` mode only): for a new look, new
   * parts or another orientation, which change the sizes of the parts.
   */
  private layout(): void {
    untracked(() => {
      const parts = this.parts;
      parts.laying = this.kids();
      this.watchKids(parts.laying);
      parts.out.clear();
      for (const kid of parts.laying) mark(kid.part, 'data-overflowed', false);
      if (parts.more) mark(parts.more, 'data-idle', true);
      if (this.menuMode()) measure(this, this.readBar, this.fit);
      else this.showOverflow([]);
    });
  }

  /**
   * Fits the parts into the room again from their sizes as last laid out, which the size observers keep: a change of the
   * bar's room or of a part's size lays nothing out to read. Without them yet, it puts every part back and reads.
   */
  private refit(): void {
    if (this.menuMode()) measure(this, this.readKnown, this.fitKnown);
  }

  /** Each part of the bar tells its size as the browser lays it out; a part that leaves the bar stops. */
  private watchKids(kids: readonly Kid[]): void {
    const parts = this.parts;
    const now = new Set(kids.map((kid) => kid.part));
    for (const [part, stop] of parts.watched) {
      if (now.has(part)) continue;
      stop();
      parts.watched.delete(part);
      parts.sizes.delete(part);
    }
    for (const part of now) {
      if (parts.watched.has(part)) continue;
      parts.watched.set(part, onLayout(part, 'size', (size) => this.kidResized(part, size), { owner: this }));
    }
  }

  private kidResized(part: ComponentBase, size: Size): void {
    const parts = this.parts;
    const vertical = this.peekProperty<ToolbarOrientation>('orientation') === 'vertical';
    // Not laid out (no box at all): in the "more" menu it keeps the size it had on the bar; elsewhere it does not show.
    const laidOut = size.width > 0 || size.height > 0 || !canMeasure(part);
    if (!laidOut && parts.out.has(part)) return;
    const along = laidOut ? (vertical ? size.height : size.width) : -1;
    const known = parts.sizes.get(part);
    if (known !== undefined && Math.abs(known - along) < 0.5) return;
    parts.sizes.set(part, along);
    if (known !== undefined) this.refit();
  }

  /** The bar as last laid out, from what the size observers told: nothing is read. `null` while a size is not known. */
  private readonly readKnown = (): Bar | null => {
    const parts = this.parts;
    if (parts.room === null || parts.gap === null) return null;
    const kids = this.kids();
    const sizes = new Map<Kid, number>();
    for (const kid of kids) {
      if (!this.shownInBar(kid.part)) continue;
      const size = parts.sizes.get(kid.part);
      if (size === undefined) return null;
      if (size >= 0) sizes.set(kid, size);
    }
    return { kids, room: parts.room, gap: parts.gap, sizes, length: parts.room, shown: parts.room > 0 };
  };

  private readonly fitKnown = (bar: Bar | null): void => {
    if (bar) this.fit(bar);
    else this.layout();
  };

  private menuMode(): boolean {
    return (this.peekProperty<ToolbarOverflow>('overflow') ?? 'menu') === 'menu';
  }

  private readonly readBar = (): Bar => {
    const kids = this.parts.laying;
    const vertical = this.peekProperty<ToolbarOrientation>('orientation') === 'vertical';
    const box = boxOf(this);
    const style = styleOf(this, ['row-gap', 'column-gap', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right']);
    const length = (name: keyof typeof style) => parseFloat(style[name]) || 0;
    const padding = vertical ? length('padding-top') + length('padding-bottom') : length('padding-left') + length('padding-right');
    const sizes = new Map<Kid, number>();
    const known = this.parts.sizes;
    for (const kid of kids) {
      if (!isRendered(kid.part)) {
        known.set(kid.part, -1);
        continue;
      }
      const rect = rectOf(kid.part);
      const size = vertical ? rect.height : rect.width;
      sizes.set(kid, size);
      known.set(kid.part, size);
    }
    const room = (vertical ? box.clientHeight : box.clientWidth) - padding;
    const gap = length(vertical ? 'row-gap' : 'column-gap');
    this.parts.gap = gap;
    this.parts.room = room;
    return { kids, room, gap, sizes, length: room, shown: isRendered(this) };
  };

  /** Moves into the "more" menu what does not fit (and what always goes there). */
  private readonly fit = (bar: Bar): void => {
    this.parts.laidOut = bar.length;
    // A bar that does not show has no room to fit into: nothing moves, and its size notice fits it once it shows.
    if (!this.menuMode()) return;
    untracked(() => {
      const out = bar.shown ? this.findOverflow(bar) : [];
      // A fit from the sizes known puts back what fits now.
      for (const kid of bar.kids) if (!out.includes(kid)) mark(kid.part, 'data-overflowed', false);
      this.parts.out = new Set(out.map((kid) => kid.part));
      this.showOverflow(out);
    });
  };

  private showOverflow(out: readonly Kid[]): void {
    const parts = this.parts;
    const focused = rememberFocus();
    for (const kid of out) mark(kid.part, 'data-overflowed', true);
    const moved = out.filter((kid) => !kid.separator);
    if (moved.length) {
      const more = this.moreButton();
      mark(more, 'data-idle', false);
      more.menu = this.moreItems(out);
    } else if (parts.more) {
      parts.more.menu = [];
    }
    parts.overflowed = new Set(moved.map((kid) => kid.control!));
    this.setProperty(
      'overflowed',
      moved.map((kid) => kid.control!),
    );
    this.renderRoving();
    if (focused && out.some((kid) => focused.isIn(kid.part))) parts.more?.focus();
  }

  /**
   * Runs in the fit's write: when something has to go, the "more" button is shown, and measured there the first time
   * (and after a change of look); later fits take the size measured then.
   */
  private findOverflow({ kids, room, gap, sizes }: Bar): Kid[] {
    const parts = this.parts;
    const vertical = this.peekProperty<ToolbarOrientation>('orientation') === 'vertical';
    const shown = kids.filter((kid) => sizes.has(kid));
    const length = (list: readonly Kid[]) => list.reduce((sum, kid) => sum + sizes.get(kid)!, 0) + gap * Math.max(0, list.length - 1);
    const out = new Set(shown.filter((kid) => kid.movable && kid.overflow === 'always'));
    let kept = shown.filter((kid) => !out.has(kid));
    if (!out.size && length(kept) <= room + 0.5) return [];
    const more = this.moreButton();
    mark(more, 'data-idle', false);
    if (parts.moreLength === null) {
      const moreBox = readAgain(() => rectOf(more));
      parts.moreLength = vertical ? moreBox.height : moreBox.width;
    }
    const left = room - parts.moreLength - gap;
    while (length(kept) > left + 0.5) {
      const last = [...kept].reverse().find((kid) => kid.movable && kid.overflow !== 'never');
      if (!last) break;
      out.add(last);
      kept = kept.filter((kid) => kid !== last);
    }
    // A separator stays only between two groups that stay.
    let before = false;
    kept.forEach((kid, i) => {
      if (!kid.separator) before = true;
      else if (!before || !kept.slice(i + 1).some((k) => !k.separator)) out.add(kid);
      else before = false;
    });
    return kids.filter((kid) => out.has(kid));
  }

  private moreButton(): Button {
    const parts = this.parts;
    if (parts.more) return parts.more;
    const more = new Button({ menu: [], icon: moreMark(), size: () => this.givenSize(), variant: () => this.givenButtonVariant() });
    parts.styled.add(more);
    more.class.add('mx-toolbar__more');
    mark(more, 'data-idle', true);
    // Known before it is added: the bar's parts never count it.
    parts.more = more;
    this.controls.add(more);
    const face = more.faceComponent;
    parts.stopMoreLabel = onLanguage(this, () => {
      const label = uiLocale.strings.moreOptions;
      put(face, 'aria-label', label);
      put(face, 'title', label);
    });
    return more;
  }

  /** The "more" menu: each moved button as a menu item, the separators as group lines. */
  private moreItems(out: readonly Kid[]): MenuItem[] {
    const items: MenuItem[] = [];
    let group = false;
    for (const kid of out) {
      if (kid.separator) {
        group = items.length > 0;
        continue;
      }
      if (!(kid.control instanceof Button)) continue;
      items.push({ ...menuItemOf(kid.control), beginGroup: group });
      group = false;
    }
    return items;
  }

  // Keys and observers.

  private listen(): void {
    const parts = this.parts;
    this.motif.on('keydown', (_, e) => untracked(() => this.onKeyDown(e)));
    this.motif.on('focusin', (_, e) => {
      const stop = this.stops().find((c) => c.motif.isEventFrom(e));
      if (!stop || stop === parts.current) return;
      parts.current = stop;
      untracked(() => this.renderRoving());
    });
    // A control added or taken away (an item, a JSX child, `controls.add`): the arrows and the room follow.
    void this.motif.on('controladded', (_sender, e: { control: ComponentBase }) => this.childChanged(e.control), false);
    void this.motif.on('controlremoved', (_sender, e: { control: ComponentBase }) => this.childChanged(e.control), false);
    // Another design language, theme or density: the controls have other sizes.
    this.motif.setDisposable(
      onLayout(this, 'look', () => {
        parts.moreLength = null;
        this.layout();
      }),
    );
    // Its room: the content box, as the observer tells it once the browser laid it out.
    this.motif.setDisposable(
      onLayout(
        this,
        'size',
        (size) => {
          const vertical = this.peekProperty<ToolbarOrientation>('orientation') === 'vertical';
          parts.room = vertical ? size.height : size.width;
          if (Math.abs(parts.room - parts.laidOut) >= 0.5) this.refit();
        },
        { box: 'content' },
      ),
    );
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return;
    // A control's menu or drop-down, a text field and a slider keep the arrow keys for themselves.
    if (fromPopup(e, this) || focusInArrowField(e)) return;
    const vertical = this.peekProperty<ToolbarOrientation>('orientation') === 'vertical';
    const rtl = isRtl(this);
    let step = 0;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowLeft':
        if (vertical) return;
        step = (e.key === 'ArrowRight') !== rtl ? 1 : -1;
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        if (!vertical) return;
        step = e.key === 'ArrowDown' ? 1 : -1;
        break;
      case 'Home':
      case 'End':
        break;
      default:
        return;
    }
    const stops = this.stops();
    if (!stops.length) return;
    const at = stops.findIndex((c) => c.motif.isEventFrom(e));
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? stops.length - 1 : (at + step + stops.length) % stops.length;
    e.preventDefault();
    stops[next].focus();
  }
}

/** Whether an event came from a popup inside `from`: the menu or the drop-down of one of its controls. */
function fromPopup(e: Event, from: ComponentBase): boolean {
  const inside = from.controls.items.find((c) => c.motif.isEventFrom(e));
  return !!inside && (inside instanceof Popup || fromPopup(e, inside));
}
