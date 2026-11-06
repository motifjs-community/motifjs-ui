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
  /** The value. `x-model` provides two-way binding. */
  value?: Bind<T>;
  /** The label. `&Name` makes Alt+N move focus to the field. This is the same property as `text`. */
  label?: Bind<string>;
  /** Where the label appears. The default is `'top'`. */
  labelMode?: Bind<FieldLabelMode>;
  /** A line below the box, which an error message replaces. */
  helpText?: Bind<string>;
  /** A tooltip. */
  hint?: Bind<string>;
  prefix?: Bind<string>;
  suffix?: Bind<string>;
  icon?: Bind<IconSource | null>;
  buttons?: Bind<readonly FieldButton[]>;
  readOnly?: Bind<boolean>;
  required?: Bind<boolean>;
  /** The height of the field. The default is `'md'`. */
  size?: Bind<ControlSize>;
  /** The appearance of the box. The default is `'outline'`. */
  variant?: Bind<FieldVariant>;
  stretch?: Bind<boolean>;
  rules?: Bind<readonly ValidationRule<T>[]>;
  /** An error from outside, such as the server, shown until it is cleared. */
  error?: Bind<string | null>;
  /** When the field is validated. The default is `'blur'`. */
  validateOn?: Bind<ValidateOn>;
  validationGroup?: Bind<ValidationGroup | null>;
  onValueChanged?: (e: ValueChangedEventArgs<T>) => void;
  onValidated?: (e: ValidatedEventArgs) => void;
}
