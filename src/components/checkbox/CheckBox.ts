import type { Bind, Event as MotifEvent, IBaseProp } from '@motifx/core';
import { checkMark, dashMark } from '../../core/glyphs';
import { LanguageLook } from '../../core/language-look';
import type { ValueChangedEventArgs } from '../../parts/field/value-changed-event-args';
import type { CheckBoxProps } from './check-box-props';
import { ToggleField } from './ToggleField';

const DRAWN = Symbol('mx.checkbox');

/** The values drawn last, for the events of changes made in code. */
interface Drawn {
  previous: boolean | null;
  current: boolean | null;
}

/**
 * A native checkbox with its caption: checked (`true`), unchecked (`false`) or indeterminate
 * (`null`). `required` means it must be checked.
 *
 * @example
 * <CheckBox label="&Remember me" x-model={() => this.form.remember} />
 * <CheckBox label="All" threeState value={() => this.allState} />
 *
 * const terms = new CheckBox({ label: 'I accept the terms', required: true });
 * this.panel.controls.add(terms);
 * terms.value = true;
 */
export class CheckBox extends ToggleField<boolean | null, CheckBoxProps> {
  /** Where the design language puts the focus ring: around the box, or around the box and its caption. */
  private readonly focusLook = new LanguageLook(this.element, { scope: '--_checkbox-focus-scope' }, () => {
    this.element.dataset.focusScope = this.focusLook.get('scope') ?? 'box';
  });

  constructor(props?: IBaseProp<CheckBoxProps>) {
    super(props);
    this.motif.setDisposable(this.focusLook.watch());
    const own = (this.props ?? {}) as CheckBoxProps;
    this.element.classList.add('mx-check-box');
    this.inputElement.classList.add('mx-check-box__input');
    const mark = this.area('tools');
    mark.classList.add('mx-check-box__mark');
    mark.setAttribute('aria-hidden', 'true');
    const check = checkMark();
    check.classList.add('mx-check-box__check');
    const dash = dashMark();
    dash.classList.add('mx-check-box__dash');
    mark.append(check, dash);
    if (own.threeState !== undefined) this.bindProperty('threeState', own.threeState);
  }

  // Field turns a stored null into the empty value; here null is a value of its own.
  override get value(): boolean | null {
    const value = this.getProperty<boolean | null | undefined>('value');
    return value === undefined ? false : value;
  }
  override set value(value: Bind<boolean | null>) {
    super.value = value;
  }

  get threeState(): boolean {
    return !!this.getProperty<boolean>('threeState');
  }
  set threeState(value: Bind<boolean>) {
    this.assignProperty('threeState', value, Boolean);
  }

  override get onValueChanged(): MotifEvent<ValueChangedEventArgs<boolean | null>> {
    const event = super.onValueChanged;
    // A change made in code is reported with null as it is, not as the empty value.
    return (listener, thisArgs, disposables) =>
      event(
        (e) => listener.call(thisArgs, e.byUser ? e : { ...e, value: this.drawn.current, previousValue: this.drawn.previous }),
        undefined,
        disposables,
      );
  }

  override onMounted(): void {
    super.onMounted();
    this.focusLook.read();
  }

  protected emptyValue(): boolean | null {
    return false;
  }

  protected override normalizeValue(value: boolean | null): boolean | null {
    return value === null ? null : !!value;
  }

  protected override peekValue(): boolean | null {
    const value = this.peekProperty<boolean | null>('value');
    return value === undefined ? false : value;
  }

  protected override isEmptyValue(value: boolean | null): boolean {
    return value !== true;
  }

  protected renderValue(): void {
    const value = this.peekValue();
    const drawn = this.drawn;
    drawn.previous = drawn.current;
    drawn.current = value;
    const input = this.inputElement;
    input.indeterminate = value === null;
    input.checked = value === true;
    this.element.dataset.state = value === null ? 'mixed' : value ? 'checked' : 'unchecked';
  }

  protected nextValue(): boolean | null {
    const value = this.peekValue();
    if (!this.peekProperty('threeState')) return value !== true;
    return value === false ? true : value === true ? null : false;
  }

  private get drawn(): Drawn {
    const self = this as unknown as { [DRAWN]?: Drawn };
    return (self[DRAWN] ??= { previous: false, current: false });
  }
}
