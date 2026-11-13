import { Emitter, untracked, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { parseAccessKey, renderAccessKey } from '../../core/access-key';
import { Control } from '../../core/control';
import { glyphPart, part, partBefore, removePart } from '../../core/draw-parts';
import { canTakeFocus, focusFirstIn, focusOn, hasFocusableIn, holdsFocus, isFocused, isRendered } from '../../core/focus';
import { isElement } from '../../core/node-kind';
import { mark, put } from '../../core/part-writes';
import type { GroupBoxProps } from './group-box-props';
import type { GroupBoxToggledEventArgs } from './group-box-toggled-event-args';
import type { GroupBoxVariant } from './group-box-variant';
import type { LayoutSpace } from './layout-space';
import { setPadding } from './set-padding';
import { setSpace } from './set-space';

const OWN = ['collapsible', 'collapsed', 'padding', 'gap', 'variant'] as const;

interface Parts {
  legend: Component<HTMLLegendElement>;
  title: Component<HTMLSpanElement>;
  toggle: Component<HTMLButtonElement> | null;
  /** The next change of `collapsed` comes from the user. */
  byUser: boolean;
  ready: boolean;
  toggled: Emitter<GroupBoxToggledEventArgs>;
}

const PARTS = Symbol('mx.group-box');

/**
 * A titled frame around related controls: a `<fieldset>` whose `<legend>` names the group for
 * screen readers. `enabled = false` disables everything inside, the title's `&` key moves focus to
 * the first control inside, and with `collapsible` the title shows and hides the content.
 *
 * @example
 * <GroupBox title="&Address" collapsible>
 *   <TextBox label="Street" />
 *   <TextBox label="City" />
 * </GroupBox>
 *
 * const box = new GroupBox({ title: 'Delivery' });
 * box.controls.add(new TextBox({ label: 'Note' }));
 * box.enabled = false;
 */
export class GroupBox extends Control<HTMLFieldSetElement, GroupBoxProps> {
  constructor(props?: IBaseProp<GroupBoxProps>) {
    super('fieldset', props);
    const own = (this.props ?? {}) as GroupBoxProps;
    const parts = this.parts;
    if (own.text === undefined && own.title !== undefined) this.bindProperty('text', own.title);
    this.observeProperty<string>('text', (text) => this.renderTitle(text));
    this.observeProperty<LayoutSpace>('padding', (padding) => setPadding(this, padding));
    this.observeProperty<LayoutSpace>('gap', (gap) => setSpace(this, '--_gap', gap));
    this.observeProperty<GroupBoxVariant>('variant', (variant) => put(this, 'data-variant', variant ?? 'outline'));
    this.observeProperty('collapsible', () => this.renderToggle());
    this.observeProperty<boolean>('collapsed', (collapsed) => {
      this.renderCollapsed();
      if (parts.ready && this.peekProperty('collapsible')) parts.toggled.fire({ collapsed: !!collapsed, byUser: parts.byUser, source: this });
    });
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onToggled) this.onToggled(own.onToggled);
    parts.ready = true;
    if (this.childs?.length) this.controls.add(...this.childs);
    this.motif.setDisposable(() => parts.toggled.dispose());
  }

  /** The title. This is the same property as `text`. */
  get title(): string {
    return this.text;
  }
  set title(value: Bind<string>) {
    this.text = value;
  }
  get collapsible(): boolean {
    return !!this.getProperty<boolean>('collapsible');
  }
  set collapsible(value: Bind<boolean>) {
    this.assignProperty('collapsible', value, Boolean);
  }
  get collapsed(): boolean {
    return !!this.getProperty<boolean>('collapsed');
  }
  set collapsed(value: Bind<boolean>) {
    this.assignProperty('collapsed', value, Boolean);
  }
  get padding(): LayoutSpace | undefined {
    return this.getProperty<LayoutSpace | undefined>('padding');
  }
  set padding(value: Bind<LayoutSpace | undefined>) {
    this.assignProperty('padding', value);
  }
  get gap(): LayoutSpace | undefined {
    return this.getProperty<LayoutSpace | undefined>('gap');
  }
  set gap(value: Bind<LayoutSpace | undefined>) {
    this.assignProperty('gap', value);
  }
  get variant(): GroupBoxVariant {
    return this.getProperty<GroupBoxVariant | undefined>('variant') ?? 'outline';
  }
  set variant(value: Bind<GroupBoxVariant>) {
    this.assignProperty('variant', value);
  }

  /** Occurs when the content is shown or hidden, by the user or by code (`e.byUser`). */
  get onToggled(): MotifEvent<GroupBoxToggledEventArgs> {
    return this.parts.toggled.event;
  }

  /** The `<legend>` part that holds the title. */
  get legendPart(): Component<HTMLLegendElement> {
    return this.parts.legend;
  }

  override get canFocus(): boolean {
    // The legend holds nothing that takes focus but the toggle.
    return this.isEnabled && isRendered(this) && (!!this.parts.toggle || hasFocusableIn(this));
  }

  /** Sets focus on the first control inside, expanding the content first if it is collapsed. */
  override focus(): boolean {
    if (!this.isEnabled) return false;
    if (this.isCollapsed) this.change(false);
    const parts = this.parts;
    if (this.focusFirstStop(this.controls.items)) return true;
    // Nothing inside takes focus: the toggle does.
    if (!parts.toggle) return false;
    focusOn(parts.toggle);
    return isFocused(parts.toggle);
  }

  override onAccessKey(): boolean {
    return this.focus();
  }

  private get isCollapsed(): boolean {
    return !!this.peekProperty('collapsible') && !!this.peekProperty('collapsed');
  }

  private get parts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= this.createParts());
  }

  private createParts(): Parts {
    this.class.add('mx-group-box');
    // The legend comes first, before the content.
    const legend = partBefore<HTMLLegendElement>(this, this.controls.items[0] ?? null, 'legend', 'mx-group-box__legend');
    const title = part<HTMLSpanElement>(legend, 'span', 'mx-group-box__title');
    return { legend, title, toggle: null, byUser: false, ready: false, toggled: new Emitter() };
  }

  /** Moves focus to the first Tab stop among `items` and inside them, in order, leaving out the legend and any window. */
  private focusFirstStop(items: readonly ComponentBase[]): boolean {
    for (const item of items) {
      if (item === this.parts.legend || (item instanceof Control && item.isWindow)) continue;
      // A list or a branch has no element of its own: what it holds stands in its place.
      if (isElement(item.element) ? this.focusStop(item) : this.focusFirstStop(item.controls.items)) return true;
    }
    return false;
  }

  /** Moves focus to `item` when it takes focus itself, else to the first Tab stop inside it. */
  private focusStop(item: ComponentBase): boolean {
    // A control out of the Tab order (`tabStop` false) is passed over, as Tab passes it.
    const inOrder = !(item instanceof Control) || untracked(() => item.tabStop);
    if (inOrder && canTakeFocus(item)) {
      focusOn(item);
      if (isFocused(item)) return true;
    }
    return focusFirstIn(item, 'stop');
  }

  private change(collapsed: boolean): void {
    const parts = this.parts;
    parts.byUser = true;
    try {
      this.changeProperty('collapsed', collapsed);
    } finally {
      parts.byUser = false;
    }
  }

  private renderTitle(text: string | undefined): void {
    const parsed = parseAccessKey(text ?? '');
    this.setAccessKey(parsed.key);
    renderAccessKey(this.parts.title, parsed);
    mark(this.parts.legend, 'hidden', !parsed.text);
  }

  private renderToggle(): void {
    const parts = this.parts;
    const on = !!this.peekProperty('collapsible');
    mark(this, 'data-collapsible', on);
    if (on && !parts.toggle) {
      // The title moves into the toggle, after the chevron.
      const toggle = part<HTMLButtonElement>(parts.legend, 'button', 'mx-group-box__toggle');
      toggle.attr.add({ type: 'button' });
      glyphPart(toggle, 'chevron-down', 'mx-group-box__chevron');
      toggle.controls.add(parts.title);
      toggle.motif.on('click', () => this.change(!this.peekProperty('collapsed')));
      parts.toggle = toggle;
    } else if (!on && parts.toggle) {
      parts.legend.controls.add(parts.title);
      removePart(parts.toggle);
      parts.toggle = null;
    }
    this.renderCollapsed();
  }

  private renderCollapsed(): void {
    const parts = this.parts;
    const collapsed = this.isCollapsed;
    if (collapsed && parts.toggle && holdsFocus(this) && !holdsFocus(parts.legend)) focusOn(parts.toggle);
    mark(this, 'data-collapsed', collapsed);
    if (parts.toggle) put(parts.toggle, 'aria-expanded', String(!collapsed));
  }
}
