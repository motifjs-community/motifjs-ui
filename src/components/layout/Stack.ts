import type { Bind, ComponentBase, IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { ChildSettings } from './ChildSettings';
import type { LayoutAlign } from './layout-align';
import type { LayoutOrientation } from './layout-orientation';
import type { LayoutSpace } from './layout-space';
import { setPadding } from './set-padding';
import { setSpace } from './set-space';
import type { StackJustify } from './stack-justify';
import type { StackProps } from './stack-props';

const OWN = ['orientation', 'gap', 'padding', 'align', 'justify', 'wrap', 'reverse', 'inline'] as const;

const LOOK = ['orientation', 'align', 'justify', 'wrap', 'reverse', 'inline'] as const;

const CHILDREN = Symbol('mx.stack');

/**
 * Children in a row or a column with a gap between them, aligned across the direction and spread
 * along it, with optional wrapping. A child that sets `grow` takes the free space.
 *
 * @example
 * <Stack orientation="horizontal" gap="sm" align="center">
 *   <TextBox label="Search" grow />
 *   <Button text="Go" />
 * </Stack>
 *
 * const bar = new Stack({ orientation: 'horizontal', justify: 'end' });
 * bar.controls.add(new Button({ text: 'Cancel' }), new Button({ text: 'OK', tone: 'accent' }));
 */
export class Stack extends Control<HTMLDivElement, StackProps> {
  constructor(props?: IBaseProp<StackProps>) {
    super('div', props);
    const own = (this.props ?? {}) as StackProps;
    this.element.classList.add('mx-stack');
    for (const name of LOOK) this.observeProperty(name, () => this.renderLook());
    this.observeProperty<LayoutSpace>('gap', (gap) => setSpace(this.element, '--_gap', gap));
    this.observeProperty<LayoutSpace>('padding', (padding) => setPadding(this.element, padding));
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    void this.settings;
    if (this.childs?.length) this.controls.add(...this.childs);
  }

  get orientation(): LayoutOrientation {
    return this.getProperty<LayoutOrientation | undefined>('orientation') ?? 'vertical';
  }
  set orientation(value: Bind<LayoutOrientation>) {
    this.assignProperty('orientation', value);
  }
  get gap(): LayoutSpace | undefined {
    return this.getProperty<LayoutSpace | undefined>('gap');
  }
  set gap(value: Bind<LayoutSpace | undefined>) {
    this.assignProperty('gap', value);
  }
  get padding(): LayoutSpace | undefined {
    return this.getProperty<LayoutSpace | undefined>('padding');
  }
  set padding(value: Bind<LayoutSpace | undefined>) {
    this.assignProperty('padding', value);
  }
  get align(): LayoutAlign {
    return this.getProperty<LayoutAlign | undefined>('align') ?? 'stretch';
  }
  set align(value: Bind<LayoutAlign>) {
    this.assignProperty('align', value);
  }
  get justify(): StackJustify {
    return this.getProperty<StackJustify | undefined>('justify') ?? 'start';
  }
  set justify(value: Bind<StackJustify>) {
    this.assignProperty('justify', value);
  }
  get wrap(): boolean {
    return !!this.getProperty<boolean>('wrap');
  }
  set wrap(value: Bind<boolean>) {
    this.assignProperty('wrap', value, Boolean);
  }
  get reverse(): boolean {
    return !!this.getProperty<boolean>('reverse');
  }
  set reverse(value: Bind<boolean>) {
    this.assignProperty('reverse', value, Boolean);
  }
  get inline(): boolean {
    return !!this.getProperty<boolean>('inline');
  }
  set inline(value: Bind<boolean>) {
    this.assignProperty('inline', value, Boolean);
  }

  /** The `grow` of a child, from its props or as set with {@link setGrow}. */
  growOf(child: ComponentBase): boolean | number {
    return (this.settings.get(child, 'grow') as boolean | number | undefined) ?? false;
  }

  /** Sets a child's `grow` programmatically: a value, or a tracked function. */
  setGrow(child: ComponentBase, grow: Bind<boolean | number>): void {
    this.settings.set(child, 'grow', grow);
  }

  private get settings(): ChildSettings {
    const self = this as unknown as { [CHILDREN]?: ChildSettings };
    if (self[CHILDREN]) return self[CHILDREN];
    self[CHILDREN] = new ChildSettings(this, ['grow'], {
      changed: (child, el) => {
        const grow = this.settings.get(child, 'grow');
        const amount = grow === true ? 1 : typeof grow === 'number' && grow > 0 ? grow : 0;
        if (amount) el.style.setProperty('flex-grow', String(amount));
        else el.style.removeProperty('flex-grow');
        el.toggleAttribute('data-mx-grow', !!amount);
      },
      left: (_child, el) => {
        el.style.removeProperty('flex-grow');
        el.removeAttribute('data-mx-grow');
      },
    });
    return self[CHILDREN].addPresent();
  }

  private renderLook(): void {
    const data = this.element.dataset;
    data.orientation = this.peekProperty<LayoutOrientation>('orientation') ?? 'vertical';
    data.align = this.peekProperty<LayoutAlign>('align') ?? 'stretch';
    data.justify = this.peekProperty<StackJustify>('justify') ?? 'start';
    this.element.toggleAttribute('data-wrap', !!this.peekProperty('wrap'));
    this.element.toggleAttribute('data-reverse', !!this.peekProperty('reverse'));
    this.element.toggleAttribute('data-inline', !!this.peekProperty('inline'));
  }
}
