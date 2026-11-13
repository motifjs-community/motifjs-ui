import type { Bind, ComponentBase, IBaseProp } from '@motifx/core';
import { loose } from '../../core/draw-parts';
import { flag, mark, put } from '../../core/part-writes';
import { Field } from '../../parts/field/Field';
import type { LabelPosition } from './label-position';
import type { ToggleFieldProps } from './toggle-field-props';

/**
 * The base class of fields drawn as a native checkbox (`CheckBox`, `Switch`). The label sits next to the box, a
 * click, Space or the access key requests the next value from the subclass, and read-only keeps the value unchanged.
 */
export abstract class ToggleField<T, TProps extends ToggleFieldProps<T> = ToggleFieldProps<T>> extends Field<T, TProps> {
  constructor(props?: IBaseProp<TProps>) {
    super(props);
    const own = (this.props ?? {}) as ToggleFieldProps<T>;
    this.class.add('mx-toggle-field');

    this.observeProperty<LabelPosition>('labelPosition', (position) => put(this, 'data-label-position', position ?? 'end'));
    this.observeProperty<string>('name', (name) => put(this.controlPart, 'name', name));
    for (const name of ['labelPosition', 'name'] as const) if (own[name] !== undefined) this.bindProperty(name, own[name]);

    this.controlPart.motif.on('click', (_, e) => {
      if (this.peekProperty('readOnly')) e.preventDefault();
    });
    this.controlPart.motif.on('change', (_, e) => {
      this.commit(this.nextValue(), e);
      // The browser has already flipped the box; the value decides what it shows.
      this.renderValue(this.peekValue());
    });
  }

  get labelPosition(): LabelPosition {
    return this.getProperty<LabelPosition | undefined>('labelPosition') ?? 'end';
  }
  set labelPosition(value: Bind<LabelPosition>) {
    this.assignProperty('labelPosition', value);
  }
  get name(): string {
    return this.getProperty<string | undefined>('name') ?? '';
  }
  set name(value: Bind<string>) {
    this.assignProperty('name', value);
  }

  /** The check box input as a component: write its attributes with `put` and call its methods through `attr`. */
  get inputPart(): ComponentBase<HTMLInputElement> {
    return this.controlPart as ComponentBase<HTMLInputElement>;
  }

  /** Changes the value as a click does. */
  toggle(): void {
    this.commit(this.nextValue());
  }

  /** The access key moves focus to the box and changes the value, as a click on its label does; read-only keeps it. */
  override onAccessKey(): boolean {
    if (!this.focus()) return false;
    if (!this.peekProperty('readOnly')) this.toggle();
    return true;
  }

  /** A checkbox has no native read-only state: it is said with ARIA, and a click is blocked. */
  protected override renderReadOnly(on: boolean): void {
    super.renderReadOnly(on);
    mark(this.controlPart, 'readonly', false);
    flag(this.controlPart, 'aria-readonly', on);
  }

  protected override get controlTag(): string {
    return 'input';
  }

  protected createControl(): ComponentBase {
    const input = loose<HTMLInputElement>('input', 'mx-toggle-field__input');
    input.attr.add({ type: 'checkbox' });
    return input;
  }

  /** The value a click makes of the current one. */
  protected abstract nextValue(): T;
}
