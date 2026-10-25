import { Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { parseAccessKey, renderAccessKey } from '../../core/access-key';
import { Control } from '../../core/control';
import { deepActiveElement, tabbableIn } from '../../core/focus';
import { chevronDown } from '../../core/glyphs';
import type { GroupBoxProps } from './group-box-props';
import type { GroupBoxToggledEventArgs } from './group-box-toggled-event-args';
import type { GroupBoxVariant } from './group-box-variant';
import type { LayoutSpace } from './layout-space';
import { setPadding } from './set-padding';
import { setSpace } from './set-space';

const OWN = ['collapsible', 'collapsed', 'padding', 'gap', 'variant'] as const;

interface Parts {
  legend: HTMLLegendElement;
  title: HTMLSpanElement;
  toggle: HTMLButtonElement | null;
  /** The next change of `collapsed` comes from the user. */
  byUser: boolean;
  ready: boolean;
  toggled: Emitter<GroupBoxToggledEventArgs>;
}

const PARTS = Symbol('mx.group-box');

/**
 * A titled frame around related controls: a `<fieldset>` whose `<legend>` names the group for
 * screen readers. `enabled = false` disables everything inside; the title's `&` key focuses the
 * first control inside; with `collapsible` the title shows and hides the content.
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
    this.observeProperty<LayoutSpace>('padding', (padding) => setPadding(this.element, padding));
    this.observeProperty<LayoutSpace>('gap', (gap) => setSpace(this.element, '--_gap', gap));
    this.observeProperty<GroupBoxVariant>('variant', (variant) => (this.element.dataset.variant = variant ?? 'outline'));
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

  /** The title; the same property as `text`. */
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

  /** The content was shown or hidden, by the user or by code (`e.byUser`). */
  get onToggled(): MotifEvent<GroupBoxToggledEventArgs> {
    return this.parts.toggled.event;
  }

  /** The `<legend>` holding the title. */
  get legendElement(): HTMLLegendElement {
    return this.parts.legend;
  }

  override get canFocus(): boolean {
    return this.isEnabled && this.element.isConnected && !!this.focusTarget();
  }

  /** Focuses the first control inside (showing the content first when it is collapsed). */
  override focus(): boolean {
    if (!this.isEnabled) return false;
    if (this.isCollapsed) this.change(false);
    const target = this.focusTarget();
    target?.focus();
    return !!target && deepActiveElement() === target;
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
    this.element.classList.add('mx-group-box');
    const legend = document.createElement('legend');
    legend.className = 'mx-group-box__legend';
    const title = document.createElement('span');
    title.className = 'mx-group-box__title';
    legend.append(title);
    this.element.prepend(legend);
    return { legend, title, toggle: null, byUser: false, ready: false, toggled: new Emitter() };
  }

  /** The first control inside the content, else the toggle. */
  private focusTarget(): HTMLElement | null {
    const legend = this.parts.legend;
    return tabbableIn(this.element).find((el) => !legend.contains(el)) ?? this.parts.toggle;
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
    this.parts.legend.hidden = !parsed.text;
  }

  private renderToggle(): void {
    const parts = this.parts;
    const on = !!this.peekProperty('collapsible');
    this.element.toggleAttribute('data-collapsible', on);
    if (on && !parts.toggle) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'mx-group-box__toggle';
      const chevron = chevronDown();
      chevron.classList.add('mx-group-box__chevron');
      toggle.append(chevron, parts.title);
      toggle.addEventListener('click', () => this.change(!this.peekProperty('collapsed')));
      parts.legend.append(toggle);
      parts.toggle = toggle;
    } else if (!on && parts.toggle) {
      parts.legend.append(parts.title);
      parts.toggle.remove();
      parts.toggle = null;
    }
    this.renderCollapsed();
  }

  private renderCollapsed(): void {
    const parts = this.parts;
    const collapsed = this.isCollapsed;
    const active = deepActiveElement();
    if (collapsed && active && this.element.contains(active) && !parts.legend.contains(active)) parts.toggle?.focus();
    this.element.toggleAttribute('data-collapsed', collapsed);
    parts.toggle?.setAttribute('aria-expanded', String(!collapsed));
  }
}
