import type { Bind, IBaseProp } from '@motifx/core';
import { registerControl } from '../../core/control-map';
import { Field } from '../../parts/field/Field';
import type { LabelPosition } from './label-position';
import type { ToggleFieldProps } from './toggle-field-props';

/**
 * The base of the fields drawn as a native checkbox (`CheckBox`, `Switch`): the caption sits next
 * to the box, a click, Space or the access key asks the subclass for the next value, and
 * read-only keeps the value as it is.
 */
export abstract class ToggleField<T, TProps extends ToggleFieldProps<T> = ToggleFieldProps<T>> extends Field<T, TProps> {
  constructor(props?: IBaseProp<TProps>) {
    super(props);
    const own = (this.props ?? {}) as ToggleFieldProps<T>;
    const input = this.inputElement;
    this.element.classList.add('mx-toggle-field');

    this.observeProperty<LabelPosition>('labelPosition', (position) => (this.element.dataset.labelPosition = position ?? 'end'));
    this.observeProperty<string>('name', (name) => {
      if (name) input.name = name;
      else input.removeAttribute('name');
    });
    for (const name of ['labelPosition', 'name'] as const) if (own[name] !== undefined) this.bindProperty(name, own[name]);

    // The access key finds the control through the element that carries it.
    registerControl(input, this);
    input.addEventListener('click', (e) => {
      if (this.peekProperty('readOnly')) e.preventDefault();
    });
    input.addEventListener('change', (e) => {
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

  get inputElement(): HTMLInputElement {
    return this.focusElement as HTMLInputElement;
  }

  /** Changes the value as a click does. */
  toggle(): void {
    this.commit(this.nextValue());
  }

  /** The access key focuses the box and clicks it, as a click on its caption does. */
  override onAccessKey(): boolean {
    if (!this.focus()) return false;
    this.inputElement.click();
    return true;
  }

  /** A checkbox has no native read-only state: it is said with ARIA, and a click is blocked. */
  protected override renderReadOnly(on: boolean): void {
    super.renderReadOnly(on);
    const input = this.inputElement;
    input.readOnly = false;
    if (on) input.setAttribute('aria-readonly', 'true');
    else input.removeAttribute('aria-readonly');
  }

  protected createControl(): HTMLElement {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'mx-toggle-field__input';
    return input;
  }

  /** The value a click makes of the current one. */
  protected abstract nextValue(): T;
}
