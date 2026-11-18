import { Emitter, untracked, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { parseAccessKey } from '../../core/access-key';
import { Control } from '../../core/control';
import { follow } from '../../core/follow';
import type { ControlSize } from '../../core/control-size';
import type { IconSource } from '../../core/icon-source';
import { focusInArrowField, rememberFocus } from '../../core/focus';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { commands } from '../../core/command-registry';
import { fieldOf, namesCommands, runItem, valueOf } from '../../core/command-fields';
import { fillTemplate } from '../../core/fill-template';
import { shortcuts } from '../../core/shortcut-registry';
import { Customizer } from '../../parts/customizer/Customizer';
import type { CustomizerDisplay } from '../../parts/customizer/customizer-display';
import type { CustomizerNode } from '../../parts/customizer/customizer-node';
import type { CustomizerSource } from '../../parts/customizer/customizer-source';
import { ItemLayout } from '../../parts/item-layout/ItemLayout';
import type { LayoutNode } from '../../parts/item-layout/layout-node';
import { ContextMenu } from '../contextmenu/ContextMenu';
import type { ContextMenuOpeningEventArgs } from '../contextmenu/context-menu-opening-event-args';
import { moreMark } from '../../core/glyphs';
import { isElement } from '../../core/node-kind';
import { boxOf, canMeasure, isRendered, isRtl, measure, measureAfterDrawn, onLayout, readAgain, rectOf, styleOf, type Size } from '../../core/measure';
import { loose } from '../../core/draw-parts';
import { css, mark, put } from '../../core/part-writes';
import { uiLocale } from '../../core/ui-locale';
import type { MenuItem } from '../../parts/menu/menu-item';
import { Popup } from '../../parts/popup/Popup';
import { Button } from '../button/Button';
import { menuItemOf } from '../button/menu-item-of';
import type { ButtonProps } from '../button/button-props';
import type { ButtonVariant } from '../button/button-variant';
import { ToolbarSeparator } from './ToolbarSeparator';
import type { ToolbarCustomMenuOpeningEventArgs } from './toolbar-custom-menu-opening-event-args';
import type { ToolbarCustomization } from './toolbar-customization';
import type { ToolbarCustomizedEventArgs } from './toolbar-customized-event-args';
import type { ToolbarItem } from './toolbar-item';
import type { ToolbarItemClickEventArgs } from './toolbar-item-click-event-args';
import type { ToolbarItemDisplay } from './toolbar-item-display';
import type { ToolbarItemOverflow } from './toolbar-item-overflow';
import type { ToolbarItemType } from './toolbar-item-type';
import type { ToolbarOrientation } from './toolbar-orientation';
import type { ToolbarOverflow } from './toolbar-overflow';
import type { ToolbarProps } from './toolbar-props';
import { toolbarTargets, type ToolbarTarget, type ToolbarTargetState } from './toolbar-targets';
import { onLanguage } from '../../core/on-language';

const OWN = ['items', 'orientation', 'size', 'buttonVariant', 'overflow', 'customizable', 'customization', 'commands', 'customizer', 'customizerKeyboard', 'acceptCommands'] as const;

/**
 * A control made for an item of `items` (or a command or separator the user added), kept by the item as given: the
 * user's changes reach it as fields written, never as a new control.
 */
interface Made {
  control: Control;
  type: ToolbarItemType;
  /** The item as given, the user's copy of it (`drawn`), and its name in the customization. */
  item: ToolbarItem;
  drawn: ToolbarItem;
  id: string;
  /** What the button shows, as drawn. */
  display: ToolbarItemDisplay;
}

/** An item to show, as the layout read it. */
interface Wanted {
  node: LayoutNode<ToolbarItem>;
  type: ToolbarItemType;
  overflow: ToolbarItemOverflow;
  display: ToolbarItemDisplay;
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
  /** Holds the room of the parts in the "more" menu in the bar's own size (see `keepRoom`); no part of the bar. */
  reserve: Component<HTMLSpanElement> | null;
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
  /**
   * The bar had room to spare when every part was last put back and measured: its size comes from what holds it, not
   * from its parts, so a change of its size alone is fitted from the sizes known.
   */
  stretched: boolean;
  /** Every part is put back and measured in the next round: a fit from the sizes known waits for it. */
  measuring: boolean;
  /** Takes back the fit from the sizes known that is asked for. */
  stopRefit: (() => void) | null;
  /** The bar has not been fitted while shown yet: its first measure waits for the page to be drawn. */
  first: boolean;
  /** Takes back the first measure that waits for the page to be drawn. */
  stopFirst: (() => void) | null;
  /** The "more" button's size along the bar as last measured; null until it is, and after a change of look. */
  moreLength: number | null;
  itemClick: Emitter<ToolbarItemClickEventArgs>;
  /** The items as the user arranged them, and what the user changed. */
  layout: ItemLayout<ToolbarItem, ToolbarCustomization>;
  custom: ToolbarCustomization;
  /** The menu of the right button; made when the toolbar is customizable or the app listens for it. No part of the bar. */
  menu: ContextMenu | null;
  customizer: Customizer | null;
  /** The toolbar as a place the menus of the page send commands to, while it takes them. */
  target: ToolbarTarget | null;
  /** The items made for the app's commands the user can add, kept by key. */
  registryItems: Map<string, ToolbarItem>;
  customized: Emitter<ToolbarCustomizedEventArgs>;
  customMenuOpening: Emitter<ToolbarCustomMenuOpeningEventArgs>;
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
    this.observeProperty('customization', () => this.takeCustomization());
    this.observeProperty('commands', () => this.followItems());
    this.observeProperty<boolean>('customizable', (on) => {
      if (on) this.contextMenu();
      this.renderTarget();
    });
    this.observeProperty('acceptCommands', () => this.renderTarget());
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.label !== undefined) this.bindProperty('text', own.label);
    if (own.onItemClick) this.onItemClick(own.onItemClick);
    if (own.onCustomized) this.onCustomized(own.onCustomized);
    if (own.onCustomMenuOpening) this.onCustomMenuOpening(own.onCustomMenuOpening);
    this.listen();
    // Items that name commands take their fields from them, and the commands the user added are the app's: read again
    // when the commands change.
    const listening = commands.onChanged(() => {
      if (namesCommands(givenList(this.peekProperty<readonly ToolbarItem[]>('items'))) || parts.custom.added?.length) this.refresh();
    });
    this.motif.setDisposable(() => {
      listening.dispose();
      parts.stopItems?.();
      parts.stopMoreLabel?.();
      parts.itemClick.dispose();
      parts.customized.dispose();
      parts.customMenuOpening.dispose();
      if (parts.target) toolbarTargets.remove(parts.target);
      parts.target = null;
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
  get customizable(): boolean {
    return !!this.getProperty<boolean>('customizable');
  }
  set customizable(value: Bind<boolean>) {
    this.assignProperty('customizable', value, Boolean);
  }
  /** What the user changed so far: a copy, to save. Give it back to restore the toolbar as the user left it. */
  get customization(): ToolbarCustomization {
    return copyOf(this.parts.custom);
  }
  set customization(value: Bind<ToolbarCustomization | null>) {
    this.assignProperty('customization', value);
  }
  get commands(): readonly ToolbarItem[] {
    return this.getProperty<readonly ToolbarItem[] | undefined>('commands') ?? [];
  }
  set commands(value: Bind<readonly ToolbarItem[]>) {
    this.assignProperty('commands', value);
  }
  get customizer(): boolean {
    return this.getProperty<boolean | undefined>('customizer') !== false;
  }
  set customizer(value: Bind<boolean>) {
    this.assignProperty('customizer', value, Boolean);
  }
  get customizerKeyboard(): boolean {
    return this.getProperty<boolean | undefined>('customizerKeyboard') !== false;
  }
  set customizerKeyboard(value: Bind<boolean>) {
    this.assignProperty('customizerKeyboard', value, Boolean);
  }
  get acceptCommands(): boolean {
    return this.getProperty<boolean | undefined>('acceptCommands') !== false;
  }
  set acceptCommands(value: Bind<boolean>) {
    this.assignProperty('acceptCommands', value, Boolean);
  }

  /** The controls currently in the overflow menu. Reactive. */
  get overflowed(): readonly Control[] {
    return this.getProperty<readonly Control[] | undefined>('overflowed') ?? [];
  }

  /** Occurs when an item in `items` is clicked, after its own `click`. */
  get onItemClick(): MotifEvent<ToolbarItemClickEventArgs> {
    return this.parts.itemClick.event;
  }

  /** Occurs when the user changed the toolbar, with everything changed so far. */
  get onCustomized(): MotifEvent<ToolbarCustomizedEventArgs> {
    return this.parts.customized.event;
  }

  /** Occurs before the menu of the right button opens: add commands of your own or leave some out. */
  get onCustomMenuOpening(): MotifEvent<ToolbarCustomMenuOpeningEventArgs> {
    // Listened to, the toolbar has the menu even when the user cannot change it.
    this.contextMenu();
    return this.parts.customMenuOpening.event;
  }

  /** The control created for an item in `items`. */
  controlOf(item: ToolbarItem): Control | null {
    return this.parts.made.get(item)?.control ?? null;
  }

  /**
   * Opens the customizer: the items of `items` with the commands and separators the user added, to show and hide, move,
   * rename, add commands of `commands` and separators, and choose what a button shows. Returns `false` when it is
   * already open.
   */
  openCustomizer(): boolean {
    const parts = this.parts;
    if (parts.customizer) return false;
    const s = uiLocale.strings;
    // The keyboard page lists the shortcuts the user can change; with none, it is left out.
    const keyboard = this.peekProperty('customizerKeyboard') !== false && shortcuts.list().some((one) => one.customizable);
    const customizer = new Customizer(this.customizerSource(), { group: '', groups: s.customizerItems, top: this.nameOf() }, keyboard);
    customizer.onClosed(() => (parts.customizer = null));
    parts.customizer = customizer;
    customizer.open(this);
    return true;
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
    for (const made of this.parts.made.values()) this.fill(made);
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
      reserve: null,
      restyleQueued: false,
      laying: [],
      laidOut: -1,
      room: null,
      gap: null,
      sizes: new Map(),
      watched: new Map(),
      out: new Set(),
      stretched: false,
      measuring: false,
      stopRefit: null,
      first: true,
      stopFirst: null,
      moreLength: null,
      itemClick: new Emitter(),
      layout: new ItemLayout<ToolbarItem, ToolbarCustomization>({
        items: () => givenList(this.peekProperty<readonly ToolbarItem[]>('items')),
        commands: () => this.catalog(),
        custom: () => this.parts.custom,
        childrenField: null,
        separator: (id) => ({ key: id, type: 'separator' }),
      }),
      custom: {},
      menu: null,
      customizer: null,
      target: null,
      registryItems: new Map(),
      customized: new Emitter(),
      customMenuOpening: new Emitter(),
    };
  }

  /**
   * Places the items again when the list, an item's type, overflow or display changes, the user changed the toolbar,
   * or on `reState()`.
   */
  private followItems(): void {
    const parts = this.parts;
    parts.stopItems?.();
    // The items' own functions are tracked; the list and the fields are not.
    parts.stopItems = follow(
      this,
      'items',
      () =>
        parts.layout
          .childrenOf(null)
          .filter((node) => !node.hidden)
          .map((node) => ({
            node,
            type: givenField<ToolbarItemType | undefined>(node.drawn, 'type') ?? 'button',
            overflow: givenField<ToolbarItemOverflow | undefined>(node.drawn, 'overflow') ?? 'auto',
            display: this.displayOf(node),
          })),
      (wanted) => this.place(wanted),
    );
  }

  /** What a button shows: the user's choice, else its own; a part it does not have is never the only one shown. */
  private displayOf(node: LayoutNode<ToolbarItem>): ToolbarItemDisplay {
    const chosen = this.parts.custom.display?.[node.id] ?? givenField<ToolbarItemDisplay | undefined>(node.drawn, 'display') ?? 'both';
    if (chosen === 'both') return 'both';
    const has = chosen === 'icon' ? !!valueOf(node.drawn, 'icon', this) : !!this.textOf(node.drawn);
    return has ? chosen : 'both';
  }

  /** An item's name, without its access key mark. */
  private textOf(item: ToolbarItem): string {
    return parseAccessKey(String(fieldOf<string | undefined>(item, 'text', this) ?? '')).text;
  }

  private place(wanted: readonly Wanted[]): void {
    const parts = this.parts;
    const made = new Map<ToolbarItem, Made>();
    parts.overflowOf.clear();
    for (const { node, type, overflow, display } of wanted) {
      const old = parts.made.get(node.item);
      if (old && old.type === type) {
        // Kept: only what the user changed is written (a name, what it shows).
        const renamed = givenValue(node.drawn, 'text') !== givenValue(old.drawn, 'text');
        const shows = old.display !== display;
        old.drawn = node.drawn;
        old.id = node.id;
        old.display = display;
        if (renamed || shows) this.fill(old);
        made.set(node.item, old);
      } else {
        made.set(node.item, { control: this.make(node.item, node.drawn, type, display), type, item: node.item, drawn: node.drawn, id: node.id, display });
      }
      parts.overflowOf.set(node.item, overflow);
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

  /** Makes the control of an item: `drawn` gives its fields (the user's name too), `item` is what its clicks report. */
  private make(item: ToolbarItem, drawn: ToolbarItem, type: ToolbarItemType, display: ToolbarItemDisplay): Control {
    const field = <K extends keyof ToolbarItem>(name: K) => valueOf<ToolbarItem[K]>(drawn, name, this, name === 'pressed' ? 'checked' : name);
    if (type === 'separator') return new ToolbarSeparator({ visible: field('visible') });
    const shown = this.shownFields(drawn, display);
    const props: ButtonProps = { text: shown.text, icon: shown.icon, hint: shown.hint, tone: field('tone'), enabled: field('enabled'), visible: field('visible') };
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

  /** The text, icon and tooltip of a button as it shows `display`: without its text, the text is its tooltip and name. */
  private shownFields(drawn: ToolbarItem, display: ToolbarItemDisplay): { text: Bind<string> | undefined; icon: Bind<IconSource | null | undefined>; hint: Bind<string> | undefined } {
    const field = <K extends keyof ToolbarItem>(name: K) => valueOf<ToolbarItem[K]>(drawn, name, this);
    return {
      text: display === 'icon' ? '' : field('text'),
      icon: display === 'text' ? null : field('icon'),
      hint: display === 'icon' ? () => String(fieldOf<string | undefined>(drawn, 'hint', this) ?? '') || this.textOf(drawn) : field('hint'),
    };
  }

  /** Gives a made control the item's fields again, as they are now. */
  private fill(made: Made): void {
    const field = <K extends keyof ToolbarItem>(name: K) => valueOf<ToolbarItem[K]>(made.drawn, name, this, name === 'pressed' ? 'checked' : name);
    made.control.visible = field('visible') ?? true;
    if (!(made.control instanceof Button)) return;
    const button = made.control;
    const shown = this.shownFields(made.drawn, made.display);
    button.text = shown.text ?? '';
    button.icon = (shown.icon ?? null) as Bind<IconSource | null>;
    button.hint = shown.hint ?? '';
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
      if (this.notOfBar(part)) continue;
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

  /**
   * The toolbar's own helpers among its children: the "more" button, the room keeper, the menu of the right button and
   * the customizer window opened over it.
   */
  private notOfBar(part: ComponentBase): boolean {
    const parts = this.parts;
    return part === parts.more || part === parts.reserve || part === parts.menu || part === parts.customizer;
  }

  /** A control added to the bar or taken away: the arrows and the room follow. The "more" button is no part of the bar. */
  private childChanged(control: ComponentBase): void {
    if (this.notOfBar(control)) return;
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
      if (parts.reserve) mark(parts.reserve, 'data-idle', true);
      parts.stopRefit?.();
      parts.stopRefit = null;
      parts.stopFirst?.();
      parts.stopFirst = null;
      if (!this.menuMode()) {
        // A first measure taken back above fits nothing now: refits are not held for it.
        parts.measuring = false;
        this.showOverflow([]);
        return;
      }
      parts.measuring = true;
      // The first time it shows, it is measured once the page is drawn: read then, it lays nothing out, and until then
      // the bar clips what does not fit. A window that lays nothing out (a test document) reads at once.
      if (parts.first && canMeasure(this)) parts.stopFirst = measureAfterDrawn(this, this.readBar, this.fit);
      else measure(this, this.readBar, this.fit);
    });
  }

  /**
   * Fits the parts into the room again from their sizes as last laid out, which the size observers keep, when only the
   * room of a stretched bar changed: nothing is laid out to read. Without them yet, it puts every part back and reads.
   */
  private refit(): void {
    const parts = this.parts;
    if (!this.menuMode() || parts.measuring) return;
    parts.stopRefit = measure(this, this.readKnown, this.fitKnown);
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
    // A part came, went or changed size: the bar may need more room than it has now (a bar sized by its parts grows only
    // once they are back), so every part is put back and measured.
    if (known !== undefined) this.layout();
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
    this.parts.stopRefit = null;
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
    const needed = [...sizes.values()].reduce((sum, size) => sum + size, 0) + gap * Math.max(0, sizes.size - 1);
    this.parts.stretched = room > needed + 1;
    return { kids, room, gap, sizes, length: room, shown: isRendered(this) };
  };

  /** Moves into the "more" menu what does not fit (and what always goes there). */
  private readonly fit = (bar: Bar): void => {
    this.parts.measuring = false;
    this.parts.stopFirst = null;
    if (bar.shown) this.parts.first = false;
    this.parts.laidOut = bar.length;
    // A bar that does not show has no room to fit into: nothing moves, and its size notice fits it once it shows.
    if (!this.menuMode()) return;
    untracked(() => {
      const out = bar.shown ? this.findOverflow(bar) : [];
      // A fit from the sizes known puts back what fits now.
      for (const kid of bar.kids) if (!out.includes(kid)) mark(kid.part, 'data-overflowed', false);
      this.parts.out = new Set(out.map((kid) => kid.part));
      this.showOverflow(out);
      this.keepRoom(bar, out);
    });
  };

  /**
   * Keeps the room of the parts put in the "more" menu in the bar's own size, so it still asks what holds it for the
   * room of every part: a hidden part as long as they are, which takes no room on the bar (it grows by a millionth of
   * the room to spare). A bar sized by its parts then grows when what holds it does, and its size notice puts them
   * back; without it, the bar would stay as small as the parts left on it.
   */
  private keepRoom({ kids, gap, sizes }: Bar, out: readonly Kid[]): void {
    const parts = this.parts;
    const shown = kids.filter((kid) => sizes.has(kid));
    const always = new Set(shown.filter((kid) => kid.movable && kid.overflow === 'always'));
    const length = (list: readonly Kid[], more: boolean) =>
      list.reduce((sum, kid) => sum + sizes.get(kid)!, 0) +
      gap * Math.max(0, list.length - 1) +
      (more ? (list.length ? gap : 0) + (parts.moreLength ?? 0) : 0);
    // Every part that may show on the bar, with the "more" button when some always go there; against the bar as it is.
    const full = length(shown.filter((kid) => !always.has(kid)), always.size > 0);
    const now = length(shown.filter((kid) => !out.includes(kid)), out.some((kid) => !kid.separator));
    const missing = full - now;
    if (missing < 0.5) {
      if (parts.reserve) mark(parts.reserve, 'data-idle', true);
      return;
    }
    const reserve = parts.reserve ?? this.makeReserve();
    css(reserve, '--_reserve', `${missing}px`);
    // Its margin takes back the gap before it.
    css(reserve, '--_reserve-gap', `${gap}px`);
    mark(reserve, 'data-idle', false);
  }

  private makeReserve(): Component<HTMLSpanElement> {
    const reserve = loose<HTMLSpanElement>('span', 'mx-toolbar__reserve');
    put(reserve, 'aria-hidden', 'true');
    // Known before it is added: the bar's parts never count it.
    this.parts.reserve = reserve;
    this.controls.add(reserve);
    return reserve;
  }

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
      // Nothing out: the button goes too. A fit from the sizes known puts no part back first, so it is hidden here.
      mark(parts.more, 'data-idle', true);
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

  // The user's changes: applied while placing the items (ItemLayout); the items given stay as they are.

  /** The commands the user can add: `commands` when given, else those of the app (`commands` registry) that have a text. */
  private catalog(): readonly ToolbarItem[] {
    const given = this.peekProperty<readonly ToolbarItem[] | undefined>('commands');
    if (given !== undefined) return givenList(given);
    const made = this.parts.registryItems;
    const out: ToolbarItem[] = [];
    for (const command of commands.list()) {
      if (out.some((item) => item.key === command.key) || !untracked(() => givenField(command, 'text'))) continue;
      let item = made.get(command.key);
      if (!item) made.set(command.key, (item = { key: command.key, command: command.key }));
      out.push(item);
    }
    return out;
  }

  private takeCustomization(): void {
    const given = this.peekProperty<ToolbarCustomization | null>('customization');
    // The user's own change, kept as the property's value (see `remember`): nothing to take.
    if (given && given === this.parts.custom) return;
    this.parts.custom = given ? copyOf(given) : {};
    this.followItems();
    this.parts.customizer?.refresh();
  }

  private remember(custom: ToolbarCustomization): void {
    this.parts.custom = custom;
    // Kept as the property's value too, so that giving it back, or `null` once more, is a change the toolbar hears.
    this.changeProperty('customization', custom);
    this.followItems();
    this.parts.customized.fire({ customization: copyOf(custom), source: this });
  }

  /** Whether the user changed anything: the layout's part, or what a button shows. */
  private touched(): boolean {
    return !this.parts.layout.untouched || Object.keys(this.parts.custom.display ?? {}).length > 0;
  }

  private contextMenu(): ContextMenu {
    const parts = this.parts;
    if (parts.menu) return parts.menu;
    const menu = new ContextMenu();
    // Known before it is added: the bar's parts never count it.
    parts.menu = menu;
    menu.onOpening((e) => this.customMenuOpening(e));
    this.controls.add(menu);
    return menu;
  }

  private customMenuOpening(e: ContextMenuOpeningEventArgs): void {
    const parts = this.parts;
    const more = parts.more;
    // The open "more" menu keeps the right button for itself.
    if (more?.opened && more.motif.isEventFrom(e.event)) {
      e.cancel = true;
      return;
    }
    const made = [...parts.made.values()].find((one) => one.control.motif.isEventFrom(e.event));
    // A JSX child (a text field) keeps the browser's menu: the kit offers nothing there.
    const child = !made && this.barContent().some((part) => part.motif.isEventFrom(e.event));
    const node = made ? parts.layout.find(made.id) : null;
    const args: ToolbarCustomMenuOpeningEventArgs = {
      item: node?.item ?? null,
      path: node?.id ?? null,
      items: this.peekProperty('customizable') === true && !child ? this.customCommands(node) : [],
      cancel: false,
      byKeyboard: e.byKeyboard,
      event: e.event,
      source: this,
    };
    parts.customMenuOpening.fire(args);
    e.items = args.items;
    e.cancel = args.cancel;
  }

  private customCommands(node: LayoutNode<ToolbarItem> | null): MenuItem[] {
    const s = uiLocale.strings;
    const layout = this.parts.layout;
    const items: MenuItem[] = [];
    if (node && !node.fixed) {
      const separator = isSeparator(node.drawn);
      const name = this.nameOfItem(node.drawn);
      if (separator) items.push({ text: s.toolbarRemoveSeparator, click: () => this.changeByUser(node.added ? layout.removed(node) : layout.shown(node, false), null) });
      else if (node.added) items.push({ text: fillTemplate(s.toolbarRemove, { name }), click: () => this.changeByUser(layout.removed(node), null) });
      else items.push({ text: fillTemplate(s.toolbarHide, { name }), click: () => this.changeByUser(layout.shown(node, false), null) });
      const move = (step: 1 | -1) => () => this.changeByUser(layout.moved(node, step, false), node);
      if (this.peekProperty<ToolbarOrientation>('orientation') === 'vertical') {
        items.push(
          { text: s.toolbarMoveUp, enabled: layout.canMove(node, -1, false), click: move(-1) },
          { text: s.toolbarMoveDown, enabled: layout.canMove(node, 1, false), click: move(1) },
        );
      } else {
        // Left is earlier in a left-to-right page, later in a right-to-left one.
        const left: 1 | -1 = isRtl(this) ? 1 : -1;
        items.push(
          { text: s.toolbarMoveLeft, enabled: layout.canMove(node, left, false), click: move(left) },
          { text: s.toolbarMoveRight, enabled: layout.canMove(node, -left as 1 | -1, false), click: move(-left as 1 | -1) },
        );
      }
      if (!separator) {
        // A line goes between two items: not first, not next to another one.
        const shown = layout.childrenOf(null).filter((n) => !n.hidden);
        const before = shown[shown.findIndex((n) => n.id === node.id) - 1];
        if (before && !isSeparator(before.drawn)) {
          items.push({ text: s.toolbarAddSeparator, click: () => this.changeByUser(layout.addedTo(null, { separator: true }, { before: node })?.custom ?? null, node) });
        }
        if (this.canShowEither(node.drawn)) {
          const now = this.displayOf(node);
          const pick = (display: ToolbarItemDisplay): MenuItem => ({
            text: display === 'icon' ? s.toolbarDisplayIcon : display === 'text' ? s.toolbarDisplayText : s.toolbarDisplayBoth,
            group: 'display',
            checked: now === display,
            click: () => this.changeByUser(this.displayed(node, display), node),
          });
          items.push({ text: s.toolbarDisplay, items: [pick('icon'), pick('text'), pick('both')] });
        }
      }
    }
    const custom = this.parts.custom;
    const general: MenuItem[] = [];
    if (custom.hidden?.length) general.push({ text: s.toolbarShowHidden, click: () => this.changeByUser({ ...custom, hidden: [] }, node) });
    if (this.peekProperty('customizer') !== false) general.push({ text: s.toolbarCustomize, click: () => this.openCustomizer() });
    if (this.touched()) general.push({ text: s.toolbarReset, click: () => this.changeByUser({}, node) });
    if (items.length && general.length) general[0] = { ...general[0], beginGroup: true };
    return [...items, ...general];
  }

  /** The name of an item as menus write it: its text, else its tooltip. */
  private nameOfItem(item: ToolbarItem): string {
    return this.textOf(item) || String(fieldOf<string | undefined>(item, 'hint', this) ?? '');
  }

  /** A button with both a text and an icon: the user can choose to show only one of them. */
  private canShowEither(item: ToolbarItem): boolean {
    return !isSeparator(item) && !!valueOf(item, 'icon', this) && !!this.textOf(item);
  }

  /** The customization with `display` for the item; `null` when that is what it shows already. */
  private displayed(node: LayoutNode<ToolbarItem>, display: ToolbarItemDisplay): ToolbarCustomization | null {
    const c = this.parts.custom;
    const own = givenField<ToolbarItemDisplay | undefined>(node.item, 'display') ?? 'both';
    const map = { ...(c.display ?? {}) };
    if (display === own) delete map[node.id];
    else map[node.id] = display;
    return c.display?.[node.id] === map[node.id] ? null : { ...c, display: map };
  }

  /** Applies a change made from the menu, and puts focus back on its item, else on the bar. */
  private changeByUser(custom: ToolbarCustomization | null, node: LayoutNode<ToolbarItem> | null): void {
    if (!custom) return;
    this.remember(custom);
    const made = node ? this.parts.made.get(node.item) : undefined;
    if (made && this.stops().includes(made.control)) made.control.focus();
    else this.focusPart?.focus();
  }

  /** The customizer's view of the toolbar: a flat list, separators instead of groups, and what each button shows. */
  private customizerSource(): CustomizerSource {
    const layout = this.parts.layout;
    const s = uiLocale.strings;
    const view = (n: LayoutNode<ToolbarItem>): CustomizerNode => {
      const separator = isSeparator(n.drawn);
      return {
        id: n.id,
        parent: '',
        text: separator ? s.customizerSeparator : this.nameOfItem(n.drawn),
        shown: !n.hidden,
        fixed: n.fixed,
        holds: false,
        added: n.added,
        separator,
        display: this.canShowEither(n.drawn) ? this.displayOf(n) : undefined,
        children: [],
      };
    };
    const apply = (custom: ToolbarCustomization | null) => {
      if (!custom) return false;
      this.remember(custom);
      return true;
    };
    const find = (id: string) => (id ? layout.find(id) : null);
    const reset = (node: LayoutNode<ToolbarItem>): ToolbarCustomization => {
      const c = layout.reset(node);
      const display = { ...(c.display ?? {}) };
      delete display[node.id];
      return { ...c, display };
    };
    return {
      groups: false,
      separators: true,
      nodes: () => untracked(() => layout.childrenOf(null).map(view)),
      commands: () => untracked(() => layout.options.commands().map((cmd) => ({ key: String(givenValue(cmd, 'key')), text: this.nameOfItem(cmd) || String(givenValue(cmd, 'key')) }))),
      targets: () => [],
      canMove: (id, step) => untracked(() => !!find(id) && layout.canMove(find(id)!, step, true)),
      show: (id, on) => untracked(() => apply(find(id) && layout.shown(find(id)!, on))),
      move: (id, step) => untracked(() => apply(find(id) && layout.moved(find(id)!, step, true))),
      moveInto: () => false,
      rename: (id, text) => untracked(() => apply(find(id) && layout.renamed(find(id)!, text))),
      remove: (id) => untracked(() => apply(find(id) && layout.removed(find(id)!))),
      add: (_parent, after, what) =>
        untracked(() => {
          const added = layout.addedTo(null, what, { after: after ? find(after) : null });
          if (!added) return null;
          this.remember(added.custom);
          return added.id;
        }),
      display: (id, display) => untracked(() => apply(find(id) && this.displayed(find(id)!, display))),
      reset: (id) => untracked(() => apply(id === null ? {} : find(id) && reset(find(id)!))),
    };
  }

  // The toolbar as a place the menus of the page send commands to.

  /** The toolbar's name in the menus: its label. */
  private nameOf(): string {
    return parseAccessKey(this.peekProperty<string>('text') ?? '').text || uiLocale.strings.toolbarUnnamed;
  }

  /** Takes commands from the menus while the user can change it and `acceptCommands` is on. */
  private renderTarget(): void {
    const parts = this.parts;
    const on = this.peekProperty('customizable') === true && this.peekProperty('acceptCommands') !== false;
    if (on && !parts.target) {
      parts.target = {
        toolbar: this,
        name: () => this.nameOf(),
        state: (command) => untracked(() => this.commandState(command)),
        add: (command) => untracked(() => this.sendCommand(command, true)),
        remove: (command) => untracked(() => this.sendCommand(command, false)),
      };
      toolbarTargets.add(parts.target);
    } else if (!on && parts.target) {
      toolbarTargets.remove(parts.target);
      parts.target = null;
    }
  }

  /** The item that names the command `key`, hidden or shown. */
  private nodeOfCommand(key: string): LayoutNode<ToolbarItem> | null {
    return this.parts.layout.childrenOf(null).find((n) => givenValue(n.drawn, 'command') === key) ?? null;
  }

  private commandState(key: string): ToolbarTargetState {
    const layout = this.parts.layout;
    const node = this.nodeOfCommand(key);
    if (node) return node.fixed ? 'none' : node.hidden ? 'absent' : 'shown';
    const offered = layout.options.commands().some((cmd) => String(givenValue(cmd, 'key')) === key);
    return offered && !layout.childrenOf(null).some((n) => n.key === key) ? 'absent' : 'none';
  }

  /** Shows the command (its item shown again, else added) or takes it away (an item added removed, else hidden). */
  private sendCommand(key: string, on: boolean): boolean {
    const layout = this.parts.layout;
    const node = this.nodeOfCommand(key);
    let custom: ToolbarCustomization | null;
    if (on) custom = node ? layout.shown(node, true) : (layout.addedTo(null, { command: key })?.custom ?? null);
    else custom = !node ? null : node.added ? layout.removed(node) : layout.shown(node, false);
    if (!custom) return false;
    this.remember(custom);
    return true;
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
          if (Math.abs(parts.room - parts.laidOut) < 0.5) return;
          // A bar sized by its parts changes size with them (a part put in the "more" menu too): it is measured again.
          if (parts.stretched) this.refit();
          else this.layout();
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

function isSeparator(item: ToolbarItem): boolean {
  return givenField<ToolbarItemType | undefined>(item, 'type') === 'separator';
}

function copyOf(c: ToolbarCustomization): ToolbarCustomization {
  const out: ToolbarCustomization = {};
  if (c.hidden?.length) out.hidden = [...c.hidden];
  if (c.order && Object.keys(c.order).length) out.order = Object.fromEntries(Object.entries(c.order).map(([k, v]) => [k, [...v]]));
  if (c.texts && Object.keys(c.texts).length) out.texts = { ...c.texts };
  // A flat list has no groups: an item added stands on the toolbar itself.
  if (c.added?.length) out.added = c.added.map(({ id, command, separator }) => (command !== undefined ? { id, command } : { id, separator: !!separator }));
  if (c.display && Object.keys(c.display).length) out.display = { ...c.display };
  return out;
}
