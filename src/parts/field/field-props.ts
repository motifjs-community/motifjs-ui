import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { IconSource } from '../../core/icon-source';
import type { ValidationGroup } from '../validation/ValidationGroup';
import type { ValidationRule } from '../validation/validation-rule';
import type { FieldButton } from './field-button';
import type { FieldLabelMode } from './field-label-mode';
import type { FieldVariant } from './field-variant';
import type { ValidateOn } from './validate-on';
import type { ValidatedEventArgs } from './validated-event-args';
import type { ValueChangedEventArgs } from './value-changed-event-args';

/** Props every field has. Each prop is also a settable, reactive property. */
export interface FieldProps<T> extends ControlProps {
  /** Two-way with `x-model`. */
  value?: Bind<T>;
  /** `&Name` makes Alt+N focus the field. The same as `text`. */
  label?: Bind<string>;
  /** Default `'top'`. */
  labelMode?: Bind<FieldLabelMode>;
  /** A line under the box; an error message takes its place. */
  helpText?: Bind<string>;
  /** A tooltip. */
  hint?: Bind<string>;
  prefix?: Bind<string>;
  suffix?: Bind<string>;
  icon?: Bind<IconSource | null>;
  buttons?: Bind<readonly FieldButton[]>;
  readOnly?: Bind<boolean>;
  required?: Bind<boolean>;
  /** Default `'md'`. */
  size?: Bind<ControlSize>;
  /** Default `'outline'`. */
  variant?: Bind<FieldVariant>;
  stretch?: Bind<boolean>;
  rules?: Bind<readonly ValidationRule<T>[]>;
  /** An error from outside, e.g. the server; shown until it is cleared. */
  error?: Bind<string | null>;
  /** Default `'blur'`. */
  validateOn?: Bind<ValidateOn>;
  validationGroup?: Bind<ValidationGroup | null>;
  onValueChanged?: (e: ValueChangedEventArgs<T>) => void;
  onValidated?: (e: ValidatedEventArgs) => void;
}
